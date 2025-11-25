#!/usr/bin/env python3
"""
Проверка распределения товаров по брендам и категориям
"""

import os
from supabase import Client, create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

print("=" * 80)
print("📊 ПРОВЕРКА РАСПРЕДЕЛЕНИЯ ТОВАРОВ")
print("=" * 80 + "\n")

# Загружаем все товары
all_products = []
offset = 0
batch_size = 1000

while True:
    result = supabase.table("products").select("manufacturer, specifications").range(offset, offset + batch_size - 1).execute()

    if not result.data:
        break

    all_products.extend(result.data)
    offset += batch_size

    if len(result.data) < batch_size:
        break

print(f"✅ Всего товаров: {len(all_products)}\n")

# Анализ по брендам
brands = {}
for product in all_products:
    brand = product.get("manufacturer") or "UNKNOWN"
    brands[brand] = brands.get(brand, 0) + 1

print("📦 РАСПРЕДЕЛЕНИЕ ПО БРЕНДАМ:")
print("-" * 80)
for brand, count in sorted(brands.items(), key=lambda x: x[1], reverse=True):
    print(f"   {brand}: {count}")

# Анализ по категориям из specifications
categories = {}
part_types = {}

for product in all_products:
    specs = product.get("specifications") or {}

    # Категория
    cat = specs.get("category") or "NO_CATEGORY"
    categories[cat] = categories.get(cat, 0) + 1

    # Тип запчасти
    part_type = specs.get("part_type") or "NO_PART_TYPE"
    part_types[part_type] = part_types.get(part_type, 0) + 1

print("\n" + "=" * 80)
print("📂 РАСПРЕДЕЛЕНИЕ ПО КАТЕГОРИЯМ (specifications.category):")
print("-" * 80)
for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True)[:20]:
    print(f"   {cat}: {count}")

print("\n" + "=" * 80)
print("🔧 РАСПРЕДЕЛЕНИЕ ПО ТИПАМ ЗАПЧАСТЕЙ (specifications.part_type):")
print("-" * 80)
for ptype, count in sorted(part_types.items(), key=lambda x: x[1], reverse=True):
    print(f"   {ptype}: {count}")

print("\n" + "=" * 80)
