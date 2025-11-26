#!/usr/bin/env python3
"""
БЫСТРЫЙ импорт 12 двигателей в категорию "ДВС в Сборе"
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

# Читаем файл с двигателями
json_file = "parsed_data/zip-agro/zip-agro-dvigateli-dlya-minitraktorov.json"

with open(json_file, "r", encoding="utf-8") as f:
    engines = json.load(f)

print("=" * 80)
print(f"🔧 ИМПОРТ {len(engines)} ДВИГАТЕЛЕЙ В КАТЕГОРИЮ 'ДВС В СБОРЕ'")
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
    # Простая транслитерация
    translit_map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    }

    slug = title.lower()

    # Транслитерация
    for ru, en in translit_map.items():
        slug = slug.replace(ru, en)

    # Заменяем всё что не буквы/цифры на дефис
    slug = re.sub(r'[^a-z0-9]+', '-', slug)

    # Убираем дефисы в начале и конце
    slug = slug.strip('-')

    return slug

def extract_manufacturer(title):
    """Извлечь производителя из названия"""
    # Ищем модели: R180, R190, R195, KM385BT, ZS1100, ZS1115, SF138, SF188, TY295, 4L23
    patterns = [
        r'R\d+[A-Z]*',
        r'KM\d+[A-Z]*',
        r'ZS\d+[A-Z-]*',
        r'SF\d+[A-Z-]*',
        r'TY\d+[A-Z]*',
        r'\d+L\d+[A-Z]*'
    ]

    for pattern in patterns:
        match = re.search(pattern, title)
        if match:
            return match.group(0)

    return "Разные"

# Проверяем и добавляем двигатели
added = 0
skipped = 0

for i, engine in enumerate(engines, 1):
    title = engine["title"]
    price = float(engine["price"])
    image_url = engine["image_url"]
    description = engine.get("description", "")

    # Создаём slug
    slug = create_slug(title)

    # Извлекаем производителя
    manufacturer = extract_manufacturer(title)

    print(f"{i}. {title}")
    print(f"   Price: {price} руб | Manufacturer: {manufacturer}")
    print(f"   Slug: {slug}")

    # Проверяем: уже есть?
    existing = supabase.table("products").select("id").eq("name", title).maybe_single().execute()

    if existing and existing.data:
        print(f"   ⚠️  УЖЕ ЕСТЬ В БД (ID={existing.data['id']})")
        skipped += 1
    else:
        # Добавляем
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

        result = supabase.table("products").insert(new_product).execute()

        if result.data:
            print(f"   ✅ ДОБАВЛЕН (ID={result.data[0]['id']})")
            added += 1
        else:
            print(f"   ❌ ОШИБКА при добавлении")

    print()

print("=" * 80)
print("📊 РЕЗУЛЬТАТ:")
print("=" * 80)
print(f"✅ Добавлено: {added}")
print(f"⚠️  Пропущено (уже есть): {skipped}")
print(f"📦 Всего обработано: {len(engines)}")
print()

# Финальная проверка
count = supabase.table("products").select("id", count="exact").eq("category_id", category_id).execute()
print(f"🔍 Итого товаров в категории 'ДВС в Сборе': {count.count}")
print()
print("=" * 80)
print("✅ ИМПОРТ ЗАВЕРШЁН")
print("=" * 80)
