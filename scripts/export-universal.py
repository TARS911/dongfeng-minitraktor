#!/usr/bin/env python3
"""
Экспорт всех UNIVERSAL товаров для анализа и сортировки
"""

import os
import csv
from supabase import Client, create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

print("=" * 80)
print("📤 ЭКСПОРТ UNIVERSAL ТОВАРОВ")
print("=" * 80 + "\n")

# Загружаем все UNIVERSAL товары
all_universal = []
offset = 0
batch_size = 1000

print("📥 Загрузка товаров...")

while True:
    result = supabase.table("products") \
        .select("id, name, manufacturer, category_id, specifications") \
        .eq("manufacturer", "UNIVERSAL") \
        .range(offset, offset + batch_size - 1) \
        .execute()

    if not result.data:
        break

    all_universal.extend(result.data)
    offset += batch_size
    print(f"   Загружено: {len(all_universal)} товаров...")

    if len(result.data) < batch_size:
        break

print(f"\n✅ Всего UNIVERSAL товаров: {len(all_universal)}\n")

# Сохраняем в CSV
output_file = "../parsed_data/universal-products.csv"

with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
    fieldnames = ['id', 'name', 'category_id', 'part_type', 'engine_model', 'category_spec']

    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()

    for product in all_universal:
        specs = product.get('specifications') or {}

        writer.writerow({
            'id': product['id'],
            'name': product['name'],
            'category_id': product.get('category_id', ''),
            'part_type': specs.get('part_type', ''),
            'engine_model': specs.get('engine_model', ''),
            'category_spec': specs.get('category', ''),
        })

print(f"✅ Экспортировано в: {output_file}")
print(f"📊 Всего строк: {len(all_universal)}")
print("\n" + "=" * 80)
