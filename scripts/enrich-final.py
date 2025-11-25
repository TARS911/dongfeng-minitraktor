#!/usr/bin/env python3
"""
FINAL ENRICHMENT - с паузами, retry и прогрессом
"""

import os
import json
import time
from supabase import Client, create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

print("=" * 80)
print("🚀 FINAL ENRICHMENT WITH RETRY")
print("=" * 80)

# Загружаем все товары
print("\n📥 Загрузка товаров...")
all_products = []
offset = 0
batch_size = 1000

while True:
    result = supabase.table("products").select("id, name, manufacturer, model, specifications").range(offset, offset + batch_size - 1).execute()

    if not result.data:
        break

    all_products.extend(result.data)
    offset += batch_size
    print(f"   {len(all_products)} товаров...")

    if len(result.data) < batch_size:
        break

print(f"✅ Всего: {len(all_products)}\n")

# Индекс по названию
products_index = {}
for product in all_products:
    name_prefix = product["name"][:40].strip().lower()
    if name_prefix not in products_index:
        products_index[name_prefix] = []
    products_index[name_prefix].append(product)

# Список файлов (ВСЕ 30+ файлов!)
JSON_FILES = [
    ("zip-agro-filters.json", {"part_type": "filter", "category": "parts-filters"}),
    ("zip-agro-fuel-system.json", {"part_type": "fuel-system", "category": "parts-fuel-system"}),
    ("zip-agro-pumps-hydraulic-fuel.json", {"part_type": "pump", "category": "parts-hydraulics"}),
    ("zip-agro-kpp-parts.json", {"part_type": "transmission", "category": "parts-minitractors"}),
    ("zip-agro-dvigateli-dlya-minitraktorov.json", {"part_type": "engine-assembled", "category": "engines-assembled"}),

    # Двигатели
    ("zip-agro-r180ne-parts.json", {"part_type": "engine-part", "engine_model": "R180", "category": "parts-engines"}),
    ("zip-agro-r190ne-parts.json", {"part_type": "engine-part", "engine_model": "R190", "category": "parts-engines"}),
    ("zip-agro-r195ne-parts.json", {"part_type": "engine-part", "engine_model": "R195", "category": "parts-engines"}),
    ("zip-agro-zs1100-1115-parts.json", {"part_type": "engine-part", "engine_model": "ZS1100/ZS1115", "category": "parts-engines"}),
    ("zip-agro-km385-ll380-parts.json", {"part_type": "engine-part", "engine_model": "KM385/LL380", "category": "parts-engines"}),
    ("zip-agro-zn490bt-parts.json", {"part_type": "engine-part", "engine_model": "ZN490", "category": "parts-engines"}),

    # DongFeng
    ("zip-agro-dongfeng-all.json", {"part_type": "minitractor-part", "category": "parts-minitractors-dongfeng"}),
    ("zip-agro-dongfeng-240-244.json", {"part_type": "minitractor-part", "model": "DF-240/DF-244", "category": "parts-minitractors-dongfeng"}),
    ("zip-agro-dongfeng-354-404.json", {"part_type": "minitractor-part", "model": "DF-354/DF-404", "category": "parts-minitractors-dongfeng"}),

    # Foton
    ("zip-agro-foton-all.json", {"part_type": "minitractor-part", "category": "parts-minitractors-foton"}),

    # Jinma
    ("zip-agro-jinma-all.json", {"part_type": "minitractor-part", "category": "parts-minitractors-jinma"}),

    # Xingtai
    ("zip-agro-xingtai-all-sorted.json", {"part_type": "minitractor-part", "category": "parts-minitractors-xingtai"}),
    ("zip-agro-xingtai-120-parts.json", {"part_type": "minitractor-part", "model": "XT-120", "category": "parts-minitractors-xingtai"}),
    ("zip-agro-xingtai-120-engine-parts.json", {"part_type": "engine-part", "model": "XT-120", "category": "parts-engines"}),
    ("zip-agro-xingtai-xt-180-parts.json", {"part_type": "minitractor-part", "model": "XT-180", "category": "parts-minitractors-xingtai"}),

    # Tata-Agro
    ("tata-agro-dongfeng.json", {"part_type": "minitractor-part", "category": "parts-minitractors-dongfeng"}),
    ("tata-agro-foton.json", {"part_type": "minitractor-part", "category": "parts-minitractors-foton"}),
    ("tata-agro-jinma.json", {"part_type": "minitractor-part", "category": "parts-minitractors-jinma"}),
    ("tata-agro-xingtai.json", {"part_type": "minitractor-part", "category": "parts-minitractors-xingtai"}),
    ("tata-agro-xingtai-24b.json", {"part_type": "minitractor-part", "model": "XT-24B", "category": "parts-minitractors-xingtai"}),
    ("tata-agro-km385vt-engine.json", {"part_type": "engine-part", "engine_model": "KM385BT", "category": "parts-engines"}),
    ("tata-agro-zn490bt-engine.json", {"part_type": "engine-part", "engine_model": "ZN490", "category": "parts-engines"}),
    ("tata-agro-zubr-16.json", {"part_type": "mototractor-part", "manufacturer": "ZUBR", "category": "parts-mototractors"}),
    ("tata-agro-mototraktor-16.json", {"part_type": "mototractor-part", "category": "parts-mototractors"}),
    ("tata-agro-garden.json", {"part_type": "garden-equipment-part", "category": "parts-attachments"}),
]

# Собираем обновления
updates = []

for filename, metadata in JSON_FILES:
    file_path = None
    for root in ["../parsed_data/zip-agro", "../parsed_data/tata-agro"]:
        potential_path = os.path.join(root, filename)
        if os.path.exists(potential_path):
            file_path = potential_path
            break

    if not file_path:
        continue

    print(f"📦 {filename}")

    with open(file_path, 'r', encoding='utf-8') as f:
        products_data = json.load(f)

    found = 0

    for product_data in products_data:
        title = product_data.get("title", "")
        brand = product_data.get("brand", "")

        if not title:
            continue

        name_prefix = title[:40].strip().lower()
        matches = products_index.get(name_prefix, [])

        if not matches:
            continue

        product = matches[0]
        found += 1

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

    print(f"   ✅ Найдено: {found}")

print(f"\n📊 Всего обновлений: {len(updates)}\n")

# Применяем обновления с ПАУЗАМИ
print("💾 Применение обновлений...")

batch_size = 50  # Маленькие батчи
success_count = 0
error_count = 0

for i in range(0, len(updates), batch_size):
    batch = updates[i:i+batch_size]

    for update in batch:
        product_id = update.pop("id")

        # Retry логика
        for attempt in range(3):
            try:
                supabase.table("products").update(update).eq("id", product_id).execute()
                success_count += 1
                break
            except Exception as e:
                if attempt < 2:
                    time.sleep(2)
                else:
                    error_count += 1

    progress = min(i + batch_size, len(updates))
    print(f"   Прогресс: {progress}/{len(updates)} | Успешно: {success_count} | Ошибок: {error_count}")

    # Пауза между батчами
    time.sleep(1)

print(f"\n✅ Готово! Обновлено: {success_count}, Ошибок: {error_count}")
print("=" * 80)
