#!/usr/bin/env python3
"""
FAST ENRICHMENT - загружаем все товары в память, затем делаем batch update
"""

import os
import json
from supabase import Client, create_client

# Supabase
url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

print("=" * 80)
print("🚀 FAST ENRICHMENT")
print("=" * 80)

# Шаг 1: Загружаем ВСЕ товары из БД
print("\n📥 Загрузка товаров из БД...")
all_products = []
offset = 0
batch_size = 1000

while True:
    result = supabase.table("products").select("id, name, manufacturer, model, specifications").range(offset, offset + batch_size - 1).execute()

    if not result.data:
        break

    all_products.extend(result.data)
    offset += batch_size
    print(f"   Загружено: {len(all_products)} товаров...")

    if len(result.data) < batch_size:
        break

print(f"✅ Всего товаров: {len(all_products)}\n")

# Создаём индекс по началу названия для быстрого поиска
products_index = {}
for product in all_products:
    name_prefix = product["name"][:40].strip().lower()
    if name_prefix not in products_index:
        products_index[name_prefix] = []
    products_index[name_prefix].append(product)

print(f"✅ Создан индекс: {len(products_index)} уникальных префиксов\n")

# Шаг 2: Обрабатываем JSON файлы
JSON_FILES = [
    ("zip-agro-filters.json", {"part_type": "filter", "category": "parts-filters"}),
    ("zip-agro-fuel-system.json", {"part_type": "fuel-system", "category": "parts-fuel-system"}),
    ("zip-agro-pumps-hydraulic-fuel.json", {"part_type": "pump", "category": "parts-hydraulics"}),
    ("zip-agro-r180ne-parts.json", {"part_type": "engine-part", "engine_model": "R180", "category": "parts-engines"}),
    ("zip-agro-r190ne-parts.json", {"part_type": "engine-part", "engine_model": "R190", "category": "parts-engines"}),
    ("zip-agro-r195ne-parts.json", {"part_type": "engine-part", "engine_model": "R195", "category": "parts-engines"}),
    ("zip-agro-dongfeng-all.json", {"part_type": "minitractor-part", "category": "parts-minitractors-dongfeng"}),
    ("zip-agro-dongfeng-240-244.json", {"part_type": "minitractor-part", "model": "DF-240/DF-244", "category": "parts-minitractors-dongfeng"}),
    ("zip-agro-foton-all.json", {"part_type": "minitractor-part", "category": "parts-minitractors-foton"}),
    ("zip-agro-jinma-all.json", {"part_type": "minitractor-part", "category": "parts-minitractors-jinma"}),
    ("zip-agro-xingtai-all-sorted.json", {"part_type": "minitractor-part", "category": "parts-minitractors-xingtai"}),
    ("tata-agro-dongfeng.json", {"part_type": "minitractor-part", "category": "parts-minitractors-dongfeng"}),
    ("tata-agro-foton.json", {"part_type": "minitractor-part", "category": "parts-minitractors-foton"}),
    ("tata-agro-jinma.json", {"part_type": "minitractor-part", "category": "parts-minitractors-jinma"}),
    ("tata-agro-xingtai.json", {"part_type": "minitractor-part", "category": "parts-minitractors-xingtai"}),
]

# Будем собирать все обновления
updates = []

for filename, metadata in JSON_FILES:
    # Находим файл
    file_path = None
    for root in ["../parsed_data/zip-agro", "../parsed_data/tata-agro"]:
        potential_path = os.path.join(root, filename)
        if os.path.exists(potential_path):
            file_path = potential_path
            break

    if not file_path or not os.path.exists(file_path):
        print(f"⚠️  Файл не найден: {filename}")
        continue

    print(f"📦 {filename}")

    with open(file_path, 'r', encoding='utf-8') as f:
        products_data = json.load(f)

    found = 0
    not_found = 0

    for product_data in products_data:
        title = product_data.get("title", "")
        brand = product_data.get("brand", "")

        if not title:
            continue

        # Ищем в индексе
        name_prefix = title[:40].strip().lower()
        matches = products_index.get(name_prefix, [])

        if not matches:
            not_found += 1
            continue

        # Берём первый матч
        product = matches[0]
        found += 1

        # Формируем обновление
        update_data = {"id": product["id"]}

        # Бренд
        if brand and brand not in ["Неизвестно", "Unknown", ""]:
            update_data["manufacturer"] = brand

        # Model
        if "model" in metadata:
            update_data["model"] = metadata["model"]

        # Specifications
        current_specs = product.get("specifications") or {}
        new_specs = {**current_specs}

        if "part_type" in metadata:
            new_specs["part_type"] = metadata["part_type"]
        if "engine_model" in metadata:
            new_specs["engine_model"] = metadata["engine_model"]
        if "category" in metadata:
            new_specs["category"] = metadata["category"]
        if brand:
            new_specs["brand"] = brand

        update_data["specifications"] = new_specs

        updates.append(update_data)

    print(f"   ✅ Найдено: {found} | Не найдено: {not_found}")

print(f"\n📊 Всего обновлений: {len(updates)}")

# Шаг 3: Применяем обновления батчами
print("\n💾 Применение обновлений...")

batch_size = 100
for i in range(0, len(updates), batch_size):
    batch = updates[i:i+batch_size]

    for update in batch:
        product_id = update.pop("id")
        supabase.table("products").update(update).eq("id", product_id).execute()

    progress = min(i + batch_size, len(updates))
    print(f"   Прогресс: {progress}/{len(updates)}")

print("\n✅ Готово!")
print("=" * 80)
