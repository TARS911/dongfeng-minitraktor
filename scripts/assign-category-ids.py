#!/usr/bin/env python3
"""
Присваиваем правильные category_id товарам на основе specifications.category
"""

import os
from supabase import Client, create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

print("=" * 80)
print("🔧 ПРИСВАИВАЕМ CATEGORY_ID")
print("=" * 80 + "\n")

# Загружаем все категории
categories_result = supabase.table("categories").select("id, slug").execute()
category_map = {cat["slug"]: cat["id"] for cat in categories_result.data}

print(f"📦 Загружено {len(category_map)} категорий\n")

# Загружаем товары и обновляем
offset = 0
batch_size = 500
total_updated = 0

while offset < 11000:
    print(f"📦 Обработка batch {offset // batch_size + 1}...")

    result = supabase.table("products") \
        .select("id, category_id, specifications") \
        .range(offset, offset + batch_size - 1) \
        .execute()

    if not result.data:
        break

    batch_updated = 0

    for product in result.data:
        specs = product.get("specifications") or {}
        spec_category = specs.get("category", "")
        current_cat_id = product.get("category_id")

        # Если есть category в specifications и она есть в таблице categories
        if spec_category and spec_category in category_map:
            correct_cat_id = category_map[spec_category]

            # Обновляем только если category_id неправильный
            if current_cat_id != correct_cat_id:
                try:
                    supabase.table("products") \
                        .update({"category_id": correct_cat_id}) \
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
    (314, "parts-minitractors-foton"),
    (315, "parts-minitractors-jinma"),
    (316, "parts-minitractors-xingtai"),
    (311, "parts-filters"),
    (310, "parts-fuel-system"),
    (312, "parts-hydraulics"),
]

for cat_id, cat_slug in check_categories:
    result = supabase.table("products").select("id").eq("category_id", cat_id).execute()

    count = len(result.data) if result.data else 0
    print(f"✅ {cat_slug:35} (ID {cat_id}): {count:>6} товаров")

print("\n" + "=" * 80)
