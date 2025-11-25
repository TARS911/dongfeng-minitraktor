#!/usr/bin/env python3
"""
Исправление категорий - перенос part_type в category
"""

import os
from supabase import Client, create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

print("=" * 80)
print("🔧 ИСПРАВЛЕНИЕ КАТЕГОРИЙ")
print("=" * 80 + "\n")

# Маппинг part_type → category
PART_TYPE_TO_CATEGORY = {
    "filters": "parts-filters",
    "filter": "parts-filters",
    "fuel-system": "parts-fuel-system",
    "hydraulics": "parts-hydraulics",
    "hydraulic": "parts-hydraulics",
    "pump": "parts-hydraulics",
    "pumps": "parts-hydraulics",
    "transmission": "parts-transmission",
    "brake": "parts-brakes",
    "steering": "parts-steering",
    "cooling": "parts-cooling",
    "electrical": "parts-electrical",
}

total_updated = 0
offset = 0
batch_size = 500

while offset < 11000:
    print(f"📦 Обработка batch {offset // batch_size + 1}...")

    result = supabase.table("products") \
        .select("id, name, specifications") \
        .range(offset, offset + batch_size - 1) \
        .execute()

    if not result.data:
        break

    batch_updated = 0

    for product in result.data:
        specs = product.get("specifications") or {}
        part_type = specs.get("part_type", "")
        current_cat = specs.get("category", "")

        # Если part_type подходит и category пустая или неправильная
        if part_type in PART_TYPE_TO_CATEGORY:
            new_category = PART_TYPE_TO_CATEGORY[part_type]

            # Обновляем только если category не установлена или не начинается с parts-
            if not current_cat or not current_cat.startswith("parts-"):
                specs["category"] = new_category

                try:
                    supabase.table("products") \
                        .update({"specifications": specs}) \
                        .eq("id", product["id"]) \
                        .execute()

                    batch_updated += 1
                    total_updated += 1
                except Exception as e:
                    pass

    print(f"   ✅ Обновлено: {batch_updated}")
    offset += batch_size

    if len(result.data) < batch_size:
        break

print("\n" + "=" * 80)
print(f"📊 ВСЕГО ОБНОВЛЕНО: {total_updated}")
print("=" * 80)

# Проверяем результат
print("\n🔍 Проверка результатов...\n")

check_categories = [
    "parts-filters",
    "parts-fuel-system",
    "parts-hydraulics",
    "parts-transmission",
]

for cat in check_categories:
    offset = 0
    count = 0

    while offset < 11000:
        result = supabase.table("products") \
            .select("id") \
            .range(offset, offset + 1000 - 1) \
            .execute()

        if not result.data:
            break

        for p in result.data:
            # Загружаем полный продукт
            full = supabase.table("products").select("specifications").eq("id", p["id"]).execute()
            if full.data:
                specs = full.data[0].get("specifications") or {}
                if specs.get("category") == cat:
                    count += 1

        offset += 1000

        if len(result.data) < 1000:
            break

    print(f"✅ {cat:30} {count:>6} товаров")

print("\n" + "=" * 80)
