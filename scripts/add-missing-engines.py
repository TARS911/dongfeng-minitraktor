#!/usr/bin/env python3
"""
Добавить недостающие 3 двигателя в категорию "ДВС в Сборе"
ОСТОРОЖНО - только те которых НЕТ в БД!
"""

import os
import json
import re
from supabase import create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("❌ ОШИБКА: Нет переменных окружения")
    exit(1)

supabase = create_client(url, key)

# 3 недостающих двигателя
missing_engines = [
    {
        "title": "Дизельный двигатель KM385BT-47E1",
        "price": "210000.00",
        "image_url": "https://zip-agro.ru/image/cache/catalog/product/dvigatelya/KM385BT-47E1/KM385BT-47E1-1-170x170.jpg",
        "description": "Дизельный двигатель KM385BT-47E1 мощностью 24л.с"
    },
    {
        "title": "Дизельный двигатель SF188-2",
        "price": "212000.00",
        "image_url": "https://zip-agro.ru/image/cache/catalog/product/dvigatelya/sf138-2/photo1679648001%20%282%29-170x170.jpeg",
        "description": "SF188-2 — дизельный одноцилиндровый двигатель, который устанавливается на минитракторы"
    },
    {
        "title": "Дизельный двигатель TY295IT",
        "price": "207000.00",
        "image_url": "https://zip-agro.ru/image/cache/catalog/product/dvigatelya/TY295/photo_2022-03-25_14-12-23-170x170.jpg",
        "description": "Устанавливается на минитрактора Синтай, Уралец, Сватт, Калибр, Шифенг, Чувашпиллер и другие"
    }
]

print("=" * 80)
print("🔧 ДОБАВЛЕНИЕ НЕДОСТАЮЩИХ 3 ДВИГАТЕЛЕЙ")
print("=" * 80)
print()

# Проверяем категорию
cat = supabase.table("categories").select("id, name").eq("slug", "engines-assembled").maybe_single().execute()

if not cat.data:
    print("❌ Категория engines-assembled НЕ НАЙДЕНА!")
    exit(1)

category_id = cat.data["id"]
print(f"✅ Категория: {cat.data['name']} (ID={category_id})")
print()

def create_slug(title):
    """Создать slug из названия"""
    translit_map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    }

    slug = title.lower()
    for ru, en in translit_map.items():
        slug = slug.replace(ru, en)

    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug

def extract_manufacturer(title):
    """Извлечь производителя из названия"""
    patterns = [
        r'KM\d+[A-Z-]+',
        r'SF\d+[A-Z-]+',
        r'TY\d+[A-Z]+'
    ]

    for pattern in patterns:
        match = re.search(pattern, title)
        if match:
            return match.group(0)

    return "Разные"

# Добавляем недостающие
added = 0
skipped = 0

for i, engine in enumerate(missing_engines, 1):
    title = engine["title"]
    price = float(engine["price"])
    image_url = engine["image_url"]
    description = engine["description"]

    slug = create_slug(title)
    manufacturer = extract_manufacturer(title)

    print(f"{i}. {title}")
    print(f"   Price: {price} руб | Manufacturer: {manufacturer}")
    print(f"   Slug: {slug}")

    # ПРОВЕРЯЕМ: может уже есть в БД?
    existing = supabase.table("products").select("id, name").eq("name", title).execute()

    if existing.data and len(existing.data) > 0:
        print(f"   ⚠️  УЖЕ ЕСТЬ В БД (ID={existing.data[0]['id']})")
        skipped += 1
    else:
        # ДОБАВЛЯЕМ ОСТОРОЖНО!
        new_product = {
            "name": title,
            "slug": slug,
            "price": price,
            "category_id": category_id,
            "manufacturer": manufacturer,
            "image_url": image_url,
            "in_stock": True,
            "specifications": {"description": description}
        }

        try:
            result = supabase.table("products").insert(new_product).execute()

            if result.data:
                print(f"   ✅ ДОБАВЛЕН (ID={result.data[0]['id']})")
                added += 1
            else:
                print(f"   ❌ ОШИБКА: не удалось добавить")
        except Exception as e:
            print(f"   ❌ ОШИБКА: {str(e)}")

    print()

print("=" * 80)
print("📊 РЕЗУЛЬТАТ:")
print("=" * 80)
print(f"✅ Добавлено: {added}")
print(f"⚠️  Пропущено (уже есть): {skipped}")
print()

# Финальная проверка
final_count = supabase.table("products").select("id", count="exact").eq("category_id", category_id).execute()
print(f"🔍 Итого товаров в категории 'ДВС в Сборе': {final_count.count}")
print()
print("=" * 80)
print("✅ ГОТОВО!")
print("=" * 80)
