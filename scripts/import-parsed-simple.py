#!/usr/bin/env python3
"""
Упрощённый импорт спарсенных товаров в БД
Все товары идут в категорию "Запчасти" (ID=2)
"""

import json
import os
import re
import sys

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv("../frontend/.env.local")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Ошибка: Не найдены переменные окружения SUPABASE")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

INPUT_FILE = "parsed_data/agrodom/parts-complete-optimized.json"
PARTS_CATEGORY_ID = 2  # ID категории "Запчасти"


def create_slug(name):
    """Создаёт slug из названия"""
    # Простая транслитерация основных букв
        "а": "a",
        "б": "b",
        "в": "v",
        "г": "g",
        "д": "d",
        "е": "e",
        "ё": "yo",
        "ж": "zh",
        "з": "z",
        "и": "i",
        "й": "y",
        "к": "k",
        "л": "l",
        "м": "m",
        "н": "n",
        "о": "o",
        "п": "p",
        "р": "r",
        "с": "s",
        "т": "t",
        "у": "u",
        "ф": "f",
        "х": "h",
        "ц": "ts",
        "ч": "ch",
        "ш": "sh",
        "щ": "sch",
        "ъ": "",
        "ы": "y",
        "ь": "",
        "э": "e",
        "ю": "yu",
        "я": "ya",
    }

    slug = name.lower()
    for ru, en in translit_map.items():
        slug = slug.replace(ru, en)

    # Убираем спецсимволы
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[-\s]+", "-", slug)
    return slug.strip("-")[:100]


def parse_price(price_str):
    """Извлекает числовое значение цены"""
    if not price_str:
        return 0

    cleaned = re.sub(r"[^\d.,]", "", price_str)
    cleaned = cleaned.replace(",", ".")

    try:
        return float(cleaned)
    except:
        return 0


def import_products():
    print("\n" + "=" * 70)
    print("ИМПОРТ ТОВАРОВ В БД (упрощённый)")
    print("=" * 70 + "\n")

    # Загружаем JSON
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        products = json.load(f)

    print(f"📦 Загружено товаров из файла: {len(products)}")

    # Получаем существующие товары
    print("🔍 Проверка существующих товаров...")
    existing_response = supabase.table("products").select("name").execute()
    existing_names = {p["name"].lower().strip() for p in existing_response.data}
    print(f"📊 Товаров уже в БД: {len(existing_names)}")

    # Фильтруем новые товары
    new_products = []
    for product in products:
        name = product.get("name", "").strip()
        if name and name.lower() not in existing_names:
            new_products.append(product)

    print(f"✨ Новых товаров для импорта: {len(new_products)}\n")

    if not new_products:
        print("✅ Все товары уже есть в базе!")
        return

    # Импортируем товары пакетами
    BATCH_SIZE = 50
    imported_count = 0
    error_count = 0

    for i in range(0, len(new_products), BATCH_SIZE):
        batch = new_products[i : i + BATCH_SIZE]
        batch_data = []

        for product in batch:
            name = product.get("name", "").strip()
            if not name:
                continue

            price = parse_price(product.get("price", ""))
            slug = create_slug(name)

            # Формируем данные для вставки
            product_data = {
                "name": name,
                "slug": slug,
                "category_id": PARTS_CATEGORY_ID,
                "price": price,
                "old_price": None,
                "in_stock": price > 0,
                "image_url": product.get("image_url", ""),
                "description": f"Запчасть для минитракторов. Категория: {product.get('category', '')}",
                "manufacturer": "universal",
                "specifications": {
                    "category": product.get("category", ""),
                    "source_url": product.get("link", ""),
                },
            }

            batch_data.append(product_data)

        # Вставляем пакет
        try:
            response = supabase.table("products").insert(batch_data).execute()
            imported_count += len(batch_data)
            print(f"✅ Импортировано {imported_count}/{len(new_products)} товаров")
        except Exception as e:
            error_count += len(batch_data)
            print(f"❌ Ошибка при импорте пакета {i}-{i + BATCH_SIZE}: {e}")
            print(f"❌ Ошибка при импорте пакета {i}-{i+BATCH_SIZE}: {e}")

    print("\n" + "=" * 70)
    print("ИМПОРТ ЗАВЕРШЁН!")
    print("=" * 70)
    print(f"✅ Успешно импортировано: {imported_count}")
    print(f"❌ Ошибок: {error_count}")
    print(f"📊 Всего товаров в файле: {len(products)}")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    import_products()
