#!/usr/bin/env python3
"""
Создает категории для WIRAX и Файтер
"""

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


# Бренды для создания
brands = [
    {"name": "WIRAX (Виракс)", "slug": "wirax"},
    {"name": "Файтер", "slug": "fayter"},
]

# Типы запчастей
part_types = [
    {"name": "Фильтра", "slug": "filters"},
    {"name": "Двигателя дизельные", "slug": "diesel-engines"},
    {"name": "Стартеры, Генераторы", "slug": "starters-generators"},
    {"name": "Универсальные комплектующие", "slug": "universal-parts"},
    {"name": "Сиденья (кресла)", "slug": "seats"},
    {"name": "ЗИП", "slug": "spare-parts-kit"},
    {"name": "Запчасти для навесного оборудования", "slug": "equipment-parts"},
    {"name": "Запчасти для тракторов", "slug": "tractor-parts"},
    {"name": "Колёса, шины, груза", "slug": "wheels-tires"},
    {"name": "Стандартные изделия", "slug": "standard-parts"},
    {"name": "Гидравлика", "slug": "hydraulics"},
    {"name": "Карданные валы", "slug": "driveshafts"},
    {"name": "Прочие запчасти", "slug": "other-parts"},
]

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

print("=" * 70)
print("📦 СОЗДАНИЕ КАТЕГОРИЙ ДЛЯ WIRAX И ФАЙТЕР")
print("=" * 70)

categories_to_create = []

for brand in brands:
    print(f"\n🔧 Бренд: {brand['name']}")
    for part_type in part_types:
        category_name = f"{brand['name']} - {part_type['name']}"
        category_slug = f"{brand['slug']}-{part_type['slug']}"

        categories_to_create.append(
            {
                "name": category_name,
                "slug": category_slug,
                "description": f"Запчасти {part_type['name']} для {brand['name']}",
            }
        )
        print(f"  + {category_name}")

print(f"\n📊 Всего категорий для создания: {len(categories_to_create)}")
print("\n🚀 Создаю категории...")

# Создаем пачкой
url = f"{SUPABASE_URL}/rest/v1/categories"
response = requests.post(url, headers=headers, json=categories_to_create)

if response.status_code in [200, 201]:
    print(f"✅ Успешно создано {len(categories_to_create)} категорий!")
else:
    print(f"❌ Ошибка: {response.status_code}")
    print(response.text)

print("=" * 70)
