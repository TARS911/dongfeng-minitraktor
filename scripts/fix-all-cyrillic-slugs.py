#!/usr/bin/env python3
"""
Исправляет ВСЕ slug с кириллицей на латиницу (транслитерация)
"""

import os
import re

from supabase import create_client

# Таблица транслитерации
TRANSLIT = {
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


def transliterate(text):
    """Транслитерация кириллицы в латиницу"""
    result = []
    for char in text:
        result.append(TRANSLIT.get(char, char))
    return "".join(result)


url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

# Получаем ВСЕ товары
print("📦 Загружаем все товары...")
offset = 0
limit = 1000
all_products = []

while True:
    response = (
        supabase.table("products")
        .select("id,slug,manufacturer,name")
        .range(offset, offset + limit - 1)
        .execute()
    )
    if not response.data:
        break
    all_products.extend(response.data)
    offset += limit

print(f"✓ Загружено {len(all_products)} товаров")

# Фильтруем товары с кириллицей
cyrillic_pattern = re.compile("[а-яА-ЯёЁ]")
products_with_cyrillic = [p for p in all_products if cyrillic_pattern.search(p["slug"])]

print(f"\n📊 Товаров с кириллицей: {len(products_with_cyrillic)}")
print("\n🔧 Начинаем исправление...\n")

fixed_count = 0
errors = []
batch = []
BATCH_SIZE = 100

for i, product in enumerate(products_with_cyrillic, 1):
    old_slug = product["slug"]

    # Транслитерируем
    new_slug = transliterate(old_slug).lower()

    # Убираем множественные дефисы
    new_slug = re.sub(r"-+", "-", new_slug)

    # Убираем дефисы в начале/конце
    new_slug = new_slug.strip("-")

    if new_slug != old_slug:
        batch.append({"id": product["id"], "old_slug": old_slug, "new_slug": new_slug})

        # Обновляем по 100 товаров
        if len(batch) >= BATCH_SIZE:
            for item in batch:
                try:
                    supabase.table("products").update({"slug": item["new_slug"]}).eq(
                        "id", item["id"]
                    ).execute()
                    fixed_count += 1
                except Exception as e:
                    errors.append(f"ID {item['id']}: {str(e)}")

            print(f"  ✓ Обработано {fixed_count}/{len(products_with_cyrillic)}")
            batch = []

# Обновляем остаток
if batch:
    for item in batch:
        try:
            supabase.table("products").update({"slug": item["new_slug"]}).eq(
                "id", item["id"]
            ).execute()
            fixed_count += 1
        except Exception as e:
            errors.append(f"ID {item['id']}: {str(e)}")

print(f"\n✅ Исправлено: {fixed_count} товаров")
print(f"❌ Ошибок: {len(errors)}")

if errors:
    print("\n⚠️ Ошибки (первые 10):")
    for err in errors[:10]:
        print(f"  {err}")
