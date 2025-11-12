#!/usr/bin/env python3
"""
Импорт запчастей из parts.json в Supabase
С автоматической привязкой к категориям по брендам и типам
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
        "А": "A",
        "Б": "B",
        "В": "V",
        "Г": "G",
        "Д": "D",
        "Е": "E",
        "Ё": "Yo",
        "Ж": "Zh",
        "З": "Z",
        "И": "I",
        "Й": "Y",
        "К": "K",
        "Л": "L",
        "М": "M",
        "Н": "N",
        "О": "O",
        "П": "P",
        "Р": "R",
        "С": "S",
        "Т": "T",
        "У": "U",
        "Ф": "F",
        "Х": "H",
        "Ц": "Ts",
        "Ч": "Ch",
        "Ш": "Sh",
        "Щ": "Sch",
        "Ъ": "",
        "Ы": "Y",
        "Ь": "",
        "Э": "E",
        "Ю": "Yu",
        "Я": "Ya",
    }

    text = text.lower()
    result = []

    for char in text:
        if char in translit_map:
            result.append(translit_map[char])
        else:
            result.append(char)

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
    "foton": ["Foton", "Фотон", "foton", "фотон"],
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


def get_category_by_slug(slug):
    """Получает категорию по slug"""
    url = f"{SUPABASE_URL}/rest/v1/categories"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }
    params = {"slug": f"eq.{slug}"}

    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 200:
        categories = response.json()
        if categories:
            return categories[0]
    return None


def create_product(product_data):
    """Создает товар в Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/products"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    response = requests.post(url, headers=headers, json=product_data)

    if response.status_code in [200, 201]:
        product = response.json()
        if isinstance(product, list):
            return product[0]
        return product
    else:
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


def main():
    """Основная функция"""
    print("=" * 70)
    print("📦 ИМПОРТ ЗАПЧАСТЕЙ В SUPABASE")
    print("=" * 70)

    if not PARTS_FILE.exists():
        print(f"❌ Файл не найден: {PARTS_FILE}")
        sys.exit(1)

    with open(PARTS_FILE, "r", encoding="utf-8") as f:
        parts = json.load(f)

    print(f"\n📊 Найдено товаров в файле: {len(parts)}")
    print("-" * 70)

    # Кэш категорий для ускорения
    print("📦 Загружаю категории для кэширования...")
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
    print(f"✅ Загружено {len(categories_cache)} категорий в кэш")
    print("-" * 70)

    results = {
        "success": 0,
        "error": 0,
        "no_brand": 0,
        "no_category": 0,
    }

    for i, part in enumerate(parts, 1):
        name = part.get("name", "")
        if not name:
            results["error"] += 1
            continue

        # Пропускаем категории/группы (товары без цены)
        if not part.get("price"):
            continue

        # Определяем бренд
        brand_slug = detect_brand(name)
        if not brand_slug:
            if i <= 10:
                print(f"⚠️  Бренд не найден: {name[:50]}...")
            results["no_brand"] += 1
            continue

        # Определяем тип запчасти
        part_category = part.get("category", "Прочие запчасти")
        part_type_slug = PART_TYPE_MAPPING.get(part_category, "other-parts")

        # Формируем slug категории
        category_slug = f"{brand_slug}-{part_type_slug}"

        # Получаем категорию из кэша
        category = categories_cache.get(category_slug)
        if not category:
            if i <= 10:
                print(f"⚠️  Категория не найдена: {category_slug}")
            results["no_category"] += 1
            continue

        # Парсим цену
        price = parse_price(part.get("price"))

        # Создаем slug товара
        product_slug = slugify(name[:100])

        # Формируем данные товара
        product_data = {
            "name": name,
            "slug": product_slug,
            "category_id": category["id"],
            "description": part.get("category", ""),
            "price": price,
            "image_url": part.get("image_url"),
            "in_stock": True,
            "is_featured": False,
        }

        # Создаем товар
        result = create_product(product_data)
        if result:
            results["success"] += 1
            if results["success"] % 10 == 0:
                print(f"✅ Импортировано: {results['success']} товаров")
        else:
            results["error"] += 1
            if results["error"] <= 5:
                print(f"❌ Ошибка создания товара: {name[:50]}")

    # Итоги
    print("\n" + "=" * 70)
    print("📊 РЕЗУЛЬТАТЫ ИМПОРТА")
    print("=" * 70)
    print(f"✅ Успешно импортировано:    {results['success']}")
    print(f"⚠️  Бренд не определен:       {results['no_brand']}")
    print(f"⚠️  Категория не найдена:     {results['no_category']}")
    print(f"❌ Ошибки:                   {results['error']}")
    print(f"📦 Всего обработано:         {len(parts)}")
    print("=" * 70)

    if results["success"] > 0:
        print(f"\n🎉 Импорт завершен! Добавлено {results['success']} товаров")


if __name__ == "__main__":
    main()
