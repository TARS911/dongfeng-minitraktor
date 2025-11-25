#!/usr/bin/env python3
"""
Быстрое исправление категорий через SQL UPDATE
"""

import os
from supabase import Client, create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

print("=" * 80)
print("🔧 БЫСТРОЕ ИСПРАВЛЕНИЕ КАТЕГОРИЙ")
print("=" * 80 + "\n")

# Загружаем все товары с part_type
print("📥 Загрузка товаров...")

offset = 0
batch_size = 1000
products_to_update = []

while offset < 11000:
    result = supabase.table("products") \
        .select("id, specifications") \
        .range(offset, offset + batch_size - 1) \
        .execute()

    if not result.data:
        break

    for p in result.data:
        specs = p.get("specifications") or {}
        part_type = specs.get("part_type", "")
        current_cat = specs.get("category", "")

        # Маппинг
        new_cat = None
        if part_type in ["filters", "filter"]:
            new_cat = "parts-filters"
        elif part_type == "fuel-system":
            new_cat = "parts-fuel-system"
        elif part_type in ["hydraulics", "hydraulic", "pump", "pumps"]:
            new_cat = "parts-hydraulics"
        elif part_type == "transmission":
            new_cat = "parts-minitractors"  # КПП относятся к минитракторам
        elif part_type == "brake":
            new_cat = "parts-minitractors"
        elif part_type == "steering":
            new_cat = "parts-minitractors"
        elif part_type == "cooling":
            new_cat = "parts-minitractors"

        # Обновляем если нужно
        if new_cat and (not current_cat or not current_cat.startswith("parts-")):
            specs["category"] = new_cat
            products_to_update.append({
                "id": p["id"],
                "specifications": specs
            })

    offset += batch_size
    print(f"   Загружено: {offset} товаров...")

    if len(result.data) < batch_size:
        break

print(f"\n✅ Найдено {len(products_to_update)} товаров для обновления\n")

# Обновляем батчами
print("💾 Применение обновлений...")

updated = 0
for i, update_data in enumerate(products_to_update):
    try:
        supabase.table("products") \
            .update({"specifications": update_data["specifications"]}) \
            .eq("id", update_data["id"]) \
            .execute()

        updated += 1

        if (i + 1) % 100 == 0:
            print(f"   Прогресс: {i + 1}/{len(products_to_update)}")

    except Exception as e:
        pass

print(f"\n✅ ОБНОВЛЕНО: {updated} товаров")

# Быстрая проверка
print("\n🔍 Проверка результатов...")

check_data = {}
offset = 0

while offset < 11000:
    result = supabase.table("products") \
        .select("specifications") \
        .range(offset, offset + 1000 - 1) \
        .execute()

    if not result.data:
        break

    for p in result.data:
        specs = p.get("specifications") or {}
        cat = specs.get("category", "NO_CATEGORY")
        check_data[cat] = check_data.get(cat, 0) + 1

    offset += 1000

    if len(result.data) < 1000:
        break

print("\n" + "=" * 80)
print("📊 ФИНАЛЬНЫЕ КАТЕГОРИИ:")
print("=" * 80)

important_cats = [
    "parts-filters",
    "parts-fuel-system",
    "parts-hydraulics",
    "parts-transmission",
    "parts-minitractors",
    "parts-minitractors-dongfeng",
    "parts-engines",
]

for cat in important_cats:
    count = check_data.get(cat, 0)
    print(f"{cat:35} {count:>6}")

print("=" * 80)
