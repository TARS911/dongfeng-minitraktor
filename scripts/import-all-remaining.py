#!/usr/bin/env python3
"""
Импорт ВСЕХ оставшихся товаров из parsed_data в Supabase
Включает универсальные запчасти, двигатели, фильтры, насосы и т.д.
"""

import json
import os
import re
import sys
from pathlib import Path

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv("frontend/.env.local")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Ошибка: Не найдены переменные окружения SUPABASE")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

PARTS_CATEGORY_ID = 2  # ID категории "Запчасти"

# Файлы которые уже импортированы (пропускаем их)
SKIP_FILES = {
    "zip-agro-foton-all.json",
    "zip-agro-jinma-all.json",
    "zip-agro-xingtai-all-sorted.json",
    "tata-agro-foton.json",
    "tata-agro-jinma.json",
    "tata-agro-xingtai.json",
    "dongfeng_tractors.json",  # Тракторы, не запчасти
}


def create_slug(name, brand="", counter=0):
    """Создаёт slug из названия"""
    translit_map = {
        "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "yo",
        "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
        "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
        "ф": "f", "х": "h", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "sch",
        "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
    }

    slug = name.lower()
    for ru, en in translit_map.items():
        slug = slug.replace(ru, en)

    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[-\s]+", "-", slug)
    slug = slug.strip("-")

    if brand:
        slug = f"{brand.lower()}-{slug}"

    if counter > 0:
        slug = f"{slug}-{counter}"

    return slug[:100]


def parse_price(price_str):
    """Извлекает числовое значение цены"""
    if not price_str:
        return 0

    cleaned = re.sub(r"[^\d.,]", "", str(price_str))
    cleaned = cleaned.replace(",", ".")

    try:
        return float(cleaned)
    except:
        return 0


def detect_brand(product):
    """Определяет бренд из данных товара"""
    brand = product.get("brand", "").upper()
    if brand:
        return brand

    name = product.get("title", product.get("name", "")).upper()

    if "FOTON" in name or "LOVOL" in name:
        return "FOTON"
    elif "JINMA" in name or "ДЖИНМА" in name:
        return "JINMA"
    elif "XINGTAI" in name or "СИНТАЙ" in name:
        return "XINGTAI"
    elif "DONGFENG" in name or "ДОНГФЕНГ" in name:
        return "DONGFENG"

    return "UNIVERSAL"


def detect_part_type(product, filename):
    """Определяет тип запчасти из названия файла и товара"""
    filename_lower = filename.lower()
    name = product.get("title", product.get("name", "")).lower()

    # По имени файла
    if "filter" in filename_lower or "фильтр" in name:
        return "filters"
    elif "pump" in filename_lower or "насос" in name:
        return "pumps"
    elif "fuel" in filename_lower or "топлив" in name:
        return "fuel-system"
    elif "engine" in filename_lower or "двигател" in name or "мотор" in name:
        return "engines"
    elif "kpp" in filename_lower or "коробка" in name or "transmission" in name:
        return "transmission"
    elif "hydraul" in filename_lower or "гидравлик" in name:
        return "hydraulics"

    return "parts"


def normalize_product(product, filename, slug_counter=0):
    """Нормализует структуру товара"""
    name = product.get("title", product.get("name", "")).strip()
    article = product.get("article", product.get("sku", ""))
    price = parse_price(product.get("price", 0))
    brand = detect_brand(product)
    part_type = detect_part_type(product, filename)
    description = product.get("description", "")
    image_url = product.get("image_url", "")
    source_url = product.get("url", product.get("link", ""))

    return {
        "name": name,
        "slug": create_slug(name, brand, slug_counter),
        "category_id": PARTS_CATEGORY_ID,
        "price": price,
        "old_price": None,
        "in_stock": price > 0,
        "image_url": image_url,
        "description": description if description else f"Запчасть для минитракторов",
        "manufacturer": brand,
        "model": article if article else None,
        "specifications": {
            "article": article,
            "source_url": source_url,
            "part_type": part_type,
            "brand": product.get("brand", ""),
            "category": product.get("category", ""),
        },
    }


def find_all_json_files():
    """Находит все JSON файлы в parsed_data"""
    json_files = []

    for root, dirs, files in os.walk("parsed_data"):
        # Пропускаем archive
        if "archive" in root:
            continue

        for file in files:
            if file.endswith(".json") and file not in SKIP_FILES:
                json_files.append(os.path.join(root, file))

    return json_files


def import_all_remaining():
    """Импортирует все оставшиеся товары"""
    print("\n" + "=" * 70)
    print("ИМПОРТ ВСЕХ ОСТАВШИХСЯ ТОВАРОВ В SUPABASE")
    print("=" * 70 + "\n")

    # Находим все JSON файлы
    all_files = find_all_json_files()
    print(f"📁 Найдено JSON файлов: {len(all_files)}\n")

    # Загружаем существующие товары
    print("🔍 Получение существующих товаров из БД...")
    existing_response = supabase.table("products").select("name").execute()
    existing_names = {p["name"].lower().strip() for p in existing_response.data}
    print(f"📊 Товаров уже в БД: {len(existing_names)}\n")

    all_new_products = []
    total_from_files = 0
    slug_counter_map = {}
    files_processed = 0

    # Обрабатываем все файлы
    for file_path in all_files:
        if not os.path.exists(file_path):
            continue

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                products = json.load(f)
        except:
            print(f"⚠️  Ошибка чтения {file_path}")
            continue

        # Пропускаем пустые файлы
        if not isinstance(products, list) or len(products) == 0:
            continue

        file_name = os.path.basename(file_path)
        total_from_files += len(products)
        new_count = 0
        files_processed += 1

        for product in products:
            name = product.get("title", product.get("name", "")).strip()
            if name and name.lower() not in existing_names:
                brand = detect_brand(product)
                base_slug = create_slug(name, brand, 0)

                if base_slug in slug_counter_map:
                    slug_counter_map[base_slug] += 1
                else:
                    slug_counter_map[base_slug] = 0

                normalized = normalize_product(
                    product, file_name, slug_counter_map[base_slug]
                )
                if normalized["name"]:
                    all_new_products.append(normalized)
                    new_count += 1

        if new_count > 0:
            print(f"📦 {file_name}: {len(products)} товаров, новых: {new_count}")

    print(f"\n📊 Обработано файлов: {files_processed}")
    print(f"📊 Всего товаров в файлах: {total_from_files}")
    print(f"✨ Новых товаров для импорта: {len(all_new_products)}\n")

    if not all_new_products:
        print("✅ Все товары уже есть в базе!")
        return

    # Импортируем товары пакетами
    BATCH_SIZE = 100
    imported_count = 0
    error_count = 0

    for i in range(0, len(all_new_products), BATCH_SIZE):
        batch = all_new_products[i : i + BATCH_SIZE]

        try:
            response = supabase.table("products").insert(batch).execute()
            imported_count += len(batch)
            print(
                f"✅ Импортировано {imported_count}/{len(all_new_products)} товаров"
            )
        except Exception as e:
            error_count += len(batch)
            print(
                f"❌ Ошибка при импорте пакета {i}-{i + BATCH_SIZE}: {str(e)[:100]}"
            )

    print("\n" + "=" * 70)
    print("ИМПОРТ ЗАВЕРШЁН!")
    print("=" * 70)
    print(f"✅ Успешно импортировано: {imported_count}")
    print(f"❌ Ошибок: {error_count}")
    print(f"📊 Всего товаров в файлах: {total_from_files}")
    print(f"📊 Было в БД: {len(existing_names)}")
    print(f"📊 Стало в БД: {len(existing_names) + imported_count}")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    import_all_remaining()
