#!/usr/bin/env python3
"""
БЫСТРЫЙ импорт запчастей в Supabase с batch insert
Импортирует товары пачками по 50 штук - в 50 раз быстрее!
"""

import json
import os
import re
import sys
from pathlib import Path

import requests


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


# Supabase credentials
SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL", "https://dpsykseeqloturowdyzf.supabase.co"
)
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_KEY:
    print("❌ ОШИБКА: Не найден SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

# Пути
PARTS_FILE = Path(__file__).parent.parent / "parsed_data" / "agrodom" / "parts.json"

# Маппинг брендов
BRAND_MAPPING = {
    "uralets": ["Уралец", "уралец"],
    "jinma": ["Jinma", "Джинма", "jinma", "джинма"],
    "xingtai": ["Xingtai", "Синтай", "xingtai", "синтай"],
    "km-engines": ["КМ", "KM", "км"],
    "dongfeng-parts": ["DongFeng", "Dong Feng", "ДонгФенг", "донгфенг"],
    "scout": ["Скаут", "Scout", "скаут"],
    "foton": ["Foton", "Фотон", "foton", "фотон", "Lovol", "ловол"],
    "rusich": ["Русич", "русич"],
    "mtz": ["МТЗ", "MTZ", "Беларус", "беларус", "мтз"],
    "t-series": ["Т-25", "Т-40", "Т-16", "т-25", "т-40", "т-16"],
    "shifeng": ["Shifeng", "Шифенг", "shifeng", "шифенг"],
    "catmann": ["Catmann", "Кэтманн", "catmann", "кэтманн"],
    "chuvashpiller": ["Чувашпиллер", "Chuvashpiller", "чувашпиллер"],
}

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


def detect_brand(product_name):
    """Определяет бренд по названию товара"""
    name_lower = product_name.lower()

    for brand_slug, variants in BRAND_MAPPING.items():
        for variant in variants:
            if variant.lower() in name_lower:
                return brand_slug

    return None


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


def create_products_batch(products_data):
    """Создает товары пачкой (batch insert) - БЫСТРО!"""
    url = f"{SUPABASE_URL}/rest/v1/products"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    response = requests.post(url, headers=headers, json=products_data)

    if response.status_code in [200, 201]:
        return response.json()
    else:
        print(f"  ❌ Ошибка batch insert: {response.status_code}")
        print(f"     {response.text[:200]}")
        return None


def main():
    """Основная функция"""
    print("=" * 70)
    print("🚀 БЫСТРЫЙ ИМПОРТ ЗАПЧАСТЕЙ В SUPABASE (BATCH MODE)")
    print("=" * 70)

    if not PARTS_FILE.exists():
        print(f"❌ Файл не найден: {PARTS_FILE}")
        sys.exit(1)

    with open(PARTS_FILE, "r", encoding="utf-8") as f:
        parts = json.load(f)

    print(f"\n📊 Найдено товаров в файле: {len(parts)}")

    # Кэш категорий
    print("📦 Загружаю категории...")
    categories_cache = {}
    url = f"{SUPABASE_URL}/rest/v1/categories"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }
    response = requests.get(url, headers=headers, params={"limit": "1000"})
    if response.status_code == 200:
        for cat in response.json():
            categories_cache[cat["slug"]] = cat
    print(f"✅ Загружено {len(categories_cache)} категорий")
    print("-" * 70)

    results = {
        "success": 0,
        "no_brand": 0,
        "no_category": 0,
        "batches": 0,
    }

    # Подготавливаем товары для batch insert
    products_to_insert = []
    batch_size = 50  # Вставляем по 50 товаров за раз

    for i, part in enumerate(parts, 1):
        name = part.get("name", "")
        if not name or not part.get("price"):
            continue

        # Определяем бренд
        brand_slug = detect_brand(name)
        if not brand_slug:
            results["no_brand"] += 1
            continue

        # Определяем тип запчасти
        part_category = part.get("category", "Прочие запчасти")
        part_type_slug = PART_TYPE_MAPPING.get(part_category, "other-parts")
        category_slug = f"{brand_slug}-{part_type_slug}"

        # Получаем категорию из кэша
        category = categories_cache.get(category_slug)
        if not category:
            results["no_category"] += 1
            continue

        # Формируем данные товара с уникальным slug
        base_slug = slugify(name[:80])
        product_slug = f"{base_slug}-{i}"  # Добавляем номер для уникальности
        price = parse_price(part.get("price"))

        product_data = {
            "name": name,
            "slug": product_slug,
            "category_id": category["id"],
            "description": part.get("category", ""),
            "price": price,
            "image_url": part.get("image_url"),
            "in_stock": True,
        }

        products_to_insert.append(product_data)

        # Когда накопилось batch_size товаров - вставляем пачкой
        if len(products_to_insert) >= batch_size:
            result = create_products_batch(products_to_insert)
            if result:
                results["success"] += len(products_to_insert)
                results["batches"] += 1
                print(
                    f"✅ Пачка {results['batches']}: добавлено {len(products_to_insert)} товаров (всего: {results['success']})"
                )

            products_to_insert = []  # Очищаем для следующей пачки

    # Вставляем оставшиеся товары
    if products_to_insert:
        result = create_products_batch(products_to_insert)
        if result:
            results["success"] += len(products_to_insert)
            results["batches"] += 1
            print(f"✅ Последняя пачка: добавлено {len(products_to_insert)} товаров")

    # Итоги
    print("\n" + "=" * 70)
    print("📊 РЕЗУЛЬТАТЫ ИМПОРТА")
    print("=" * 70)
    print(f"✅ Успешно импортировано:    {results['success']}")
    print(f"📦 Пачек (batches):          {results['batches']}")
    print(f"⚠️  Бренд не определен:       {results['no_brand']}")
    print(f"⚠️  Категория не найдена:     {results['no_category']}")
    print(f"📦 Всего обработано:         {len(parts)}")
    print("=" * 70)

    if results["success"] > 0:
        print(f"\n🎉 Импорт завершен! Добавлено {results['success']} товаров")
        print(
            f"⚡ Использовано {results['batches']} batch-запросов вместо {results['success']} обычных"
        )
        print(f"🚀 Ускорение примерно в {batch_size} раз!")


if __name__ == "__main__":
    main()
