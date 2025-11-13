#!/usr/bin/env python3
"""
Импорт спарсенных товаров из JSON в базу данных Supabase
"""

import json
import os
import re
import sys

from dotenv import load_dotenv
from supabase import Client, create_client
from transliterate import translit

# Загружаем переменные окружения
load_dotenv("../frontend/.env.local")

# Подключение к Supabase
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Ошибка: Не найдены переменные окружения SUPABASE")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Файл с спарсенными данными
INPUT_FILE = "parsed_data/agrodom/parts-complete-optimized.json"


def create_slug(name):
    """Создаёт slug из названия товара"""
    try:
        # Транслитерируем русский текст
        transliterated = translit(name, "ru", reversed=True)
        # Приводим к нижнему регистру
        slug = transliterated.lower()
        # Заменяем пробелы и специальные символы на дефисы
        slug = re.sub(r"[^\w\s-]", "", slug)
        slug = re.sub(r"[-\s]+", "-", slug)
        # Убираем дефисы в начале и конце
        slug = slug.strip("-")
        return slug
    except:
        # Если транслитерация не сработала, просто удаляем спецсимволы
        slug = re.sub(r"[^\w\s-]", "", name.lower())
        slug = re.sub(r"[-\s]+", "-", slug)
        return slug.strip("-")


def parse_price(price_str):
    """Извлекает числовое значение цены из строки"""
    if not price_str:
        return None

    # Убираем всё кроме цифр и точки/запятой
    cleaned = re.sub(r"[^\d.,]", "", price_str)
    # Заменяем запятую на точку
    cleaned = cleaned.replace(",", ".")

    try:
        return float(cleaned)
    except:
        return None


def detect_brand_from_name(name):
    """Определяет бренд из названия товара"""
    name_lower = name.lower()

    # Словарь брендов и их ключевых слов
    BRAND_KEYWORDS = {
        "dongfeng": ["dongfeng", "донгфенг", "dong feng"],
        "foton": ["foton", "фотон"],
        "shifeng": ["shifeng", "шифенг", "shi feng"],
        "xingtai": ["xingtai", "синтай", "xing tai"],
        "yto": ["yto", "ито"],
        "fighter": ["файтер", "fighter"],
        "uralets": ["уралец", "uralets"],
        "bearus": ["беларус", "belarus", "мтз"],
        "chery": ["chery", "чери"],
        "jinma": ["jinma", "джинма", "jin ma"],
        "dw": ["dw", "дв"],
    }

    for brand_slug, keywords in BRAND_KEYWORDS.items():
        for keyword in keywords:
            if keyword in name_lower:
                return brand_slug

    return None


def detect_category_from_data(product):
    """Определяет категорию товара на основе данных"""
    name = product.get("name", "").lower()
    category = product.get("category", "").lower()

    # Всё это - запчасти
    return "parts"


def detect_type_from_name(name):
    """Определяет тип запчасти из названия"""
    name_lower = name.lower()

    # Словарь типов запчастей
    TYPE_KEYWORDS = {
        "filters": ["фильтр", "filter"],
        "engine": ["двигатель", "мотор", "engine", "поршн", "цилиндр", "коленвал"],
        "hydraulics": ["гидравлик", "насос", "hydraul", "гур"],
        "transmission": ["кпп", "коробка передач", "сцепление", "clutch"],
        "cardan": ["кардан", "cardan", "вал"],
        "electrical": ["генератор", "стартер", "аккумулятор", "проводка"],
        "tires": ["шина", "колес", "покрышк", "tire", "wheel"],
        "seats": ["сиденье", "кресло", "seat"],
        "fasteners": ["болт", "гайка", "шайба", "винт", "шпилька"],
        "other": [],  # По умолчанию
    }

    for type_slug, keywords in TYPE_KEYWORDS.items():
        for keyword in keywords:
            if keyword in name_lower:
                return type_slug

    return "other"


def import_products():
    """Импортирует товары из JSON в базу данных"""
    print("\n" + "=" * 70)
    print("ИМПОРТ ТОВАРОВ В БАЗУ ДАННЫХ")
    print("=" * 70 + "\n")

    # Загружаем JSON
    if not os.path.exists(INPUT_FILE):
        print(f"❌ Файл {INPUT_FILE} не найден!")
        return

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        products = json.load(f)

    print(f"📦 Загружено товаров из файла: {len(products)}")

    # Получаем существующие товары из БД
    print("🔍 Проверка существующих товаров в БД...")
    existing_response = supabase.table("products").select("name").execute()
    existing_names = {p["name"].lower().strip() for p in existing_response.data}
    print(f"📊 Товаров уже в БД: {len(existing_names)}")

    # Фильтруем новые товары
    new_products = []
    for product in products:
        name = product.get("name", "").strip()
        if name.lower() not in existing_names:
            new_products.append(product)

    print(f"✨ Новых товаров для импорта: {len(new_products)}")

    if not new_products:
        print("✅ Все товары уже есть в базе!")
        return

    # Импортируем товары пакетами
    BATCH_SIZE = 100
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
            brand = detect_brand_from_name(name)
            category = detect_category_from_data(product)
            part_type = detect_type_from_name(name)

            # Формируем slug
            base_slug = create_slug(name)
            if brand:
                slug = f"{brand}-{part_type}-{base_slug}"[:100]
            else:
                slug = f"universal-{part_type}-{base_slug}"[:100]

            product_data = {
                "name": name,
                "slug": slug,
                "category": category,
                "price": price if price else 0,
                "old_price": None,
                "in_stock": price is not None
                and price > 0,  # Считаем в наличии, если есть цена
                "image_url": product.get("image_url", ""),
                "description": f"Запчасть для минитракторов. Источник: {product.get('link', '')}",
                "manufacturer": brand if brand else "universal",
                "specifications": {
                    "type": part_type,
                    "category": product.get("category", ""),
                    "source_url": product.get("link", ""),
                },
            }

            batch_data.append(product_data)

        # Вставляем пакет в БД
        try:
            response = supabase.table("products").insert(batch_data).execute()
            imported_count += len(batch_data)
            print(f"✅ Импортировано {imported_count}/{len(new_products)} товаров")
        except Exception as e:
            error_count += len(batch_data)
            print(f"❌ Ошибка при импорте пакета {i}-{i + BATCH_SIZE}: {e}")

    print("\n" + "=" * 70)
    print("ИМПОРТ ЗАВЕРШЁН!")
    print("=" * 70)
    print(f"✅ Успешно импортировано: {imported_count}")
    print(f"❌ Ошибок: {error_count}")
    print(f"📊 Всего товаров в файле: {len(products)}")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    import_products()
