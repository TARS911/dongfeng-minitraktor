#!/usr/bin/env python3
"""
Импорт товаров WIRAX и Файтер
"""

import json
import os
import re
import sys

import requests

SUPABASE_URL = "https://dpsykseeqloturowdyzf.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_KEY:
    print("❌ ОШИБКА: Не найден SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)


def slugify(text):
    """Создает slug из текста с транслитерацией"""
    translit_map = {
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

    text = text.lower()
    result = []
    for char in text:
        result.append(translit_map.get(char, char))

    text = "".join(result)
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")


def parse_price(price_str):
    """Извлекает цену из строки"""
    if not price_str:
        return None

    price_clean = re.sub(r"[^\d.,]", "", price_str)
    price_clean = price_clean.replace(",", ".")

    try:
        return float(price_clean)
    except:
        return None


# Маппинг типов запчастей
PART_TYPE_MAPPING = {
    "Прочие запчасти": "other-parts",
    "Фильтра": "filters",
    "Двигателя дизельные": "diesel-engines",
    "Стартеры, Генераторы": "starters-generators",
    "Универсальные комплектующие": "universal-parts",
    "Сиденья (кресла)": "seats",
    "ЗИП": "spare-parts-kit",
    "Запчасти для навесного оборудования": "equipment-parts",
    "Запчасти для тракторов": "tractor-parts",
    "Колёса, шины, груза": "wheels-tires",
    "Стандартные изделия": "standard-parts",
    "Гидравлика": "hydraulics",
    "Карданные валы": "driveshafts",
}

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

print("=" * 70)
print("🚀 ИМПОРТ ТОВАРОВ WIRAX И ФАЙТЕР")
print("=" * 70)

# Загружаем parts.json
with open("parsed_data/agrodom/parts.json", "r", encoding="utf-8") as f:
    parts = json.load(f)

# Загружаем категории
print("\n📦 Загружаю категории...")
url = f"{SUPABASE_URL}/rest/v1/categories?limit=1000"
response = requests.get(url, headers=headers)
categories = {c["slug"]: c for c in response.json()}
print(f"✅ Загружено {len(categories)} категорий")

# Загружаем существующие товары
print("📦 Загружаю существующие товары...")
url = f"{SUPABASE_URL}/rest/v1/products?select=name&limit=10000"
response = requests.get(url, headers=headers)
existing_products = {p["name"] for p in response.json()}
print(f"✅ В БД уже {len(existing_products)} товаров")

# Фильтруем товары WIRAX и Файтер
wirax_products = [
    p
    for p in parts
    if p.get("price") and ("WIRAX" in p["name"] or "Виракс" in p["name"])
]
fayter_products = [p for p in parts if p.get("price") and "Файтер" in p["name"]]

print(f"\n📊 Найдено в parts.json:")
print(f"  WIRAX: {len(wirax_products)} товаров")
print(f"  Файтер: {len(fayter_products)} товаров")

# Готовим товары к импорту
products_to_import = []
skipped = []

for part in wirax_products + fayter_products:
    name = part["name"]

    # Пропускаем если уже есть
    if name in existing_products:
        skipped.append(name)
        continue

    # Определяем бренд
    if "WIRAX" in name or "Виракс" in name:
        brand_slug = "wirax"
        brand_name = "WIRAX"
    else:
        brand_slug = "fayter"
        brand_name = "Файтер"

    # Определяем тип запчасти
    part_category = part.get("category", "Прочие запчасти")
    part_type_slug = PART_TYPE_MAPPING.get(part_category, "other-parts")
    category_slug = f"{brand_slug}-{part_type_slug}"

    # Получаем категорию
    category = categories.get(category_slug)
    if not category:
        print(f"⚠️  Категория не найдена: {category_slug} для {name}")
        continue

    # Создаем slug
    base_slug = slugify(name[:80])
    product_slug = f"{base_slug}-{brand_slug}-{len(products_to_import)}"

    # Парсим цену
    price = parse_price(part.get("price"))

    products_to_import.append(
        {
            "name": name,
            "slug": product_slug,
            "category_id": category["id"],
            "description": part.get("category", ""),
            "price": price,
            "image_url": part.get("image_url"),
            "in_stock": True,
        }
    )

print(f"\n📊 Результаты фильтрации:")
print(f"  К импорту: {len(products_to_import)} товаров")
print(f"  Уже есть в БД: {len(skipped)} товаров")

if products_to_import:
    print(f"\n🚀 Импортирую {len(products_to_import)} товаров...")

    # Импортируем пачкой
    url = f"{SUPABASE_URL}/rest/v1/products"
    response = requests.post(url, headers=headers, json=products_to_import)

    if response.status_code in [200, 201]:
        print(f"✅ Успешно импортировано {len(products_to_import)} товаров!")

        # Показываем что добавили
        wirax_count = len([p for p in products_to_import if "wirax" in p["slug"]])
        fayter_count = len([p for p in products_to_import if "fayter" in p["slug"]])
        print(f"\n📊 Детали:")
        print(f"  WIRAX: {wirax_count} товаров")
        print(f"  Файтер: {fayter_count} товаров")
    else:
        print(f"❌ Ошибка импорта: {response.status_code}")
        print(response.text[:500])
else:
    print("\n✅ Все товары WIRAX и Файтер уже импортированы!")

print("=" * 70)
