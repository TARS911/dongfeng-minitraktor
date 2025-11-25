#!/usr/bin/env python3
"""
Обработка файлов AGRODOM - параллельная фильтрация
"""

import os
import json
from supabase import Client, create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

print("=" * 80)
print("🚀 ОБРАБОТКА AGRODOM")
print("=" * 80 + "\n")

# Файлы AGRODOM
AGRODOM_FILES = [
    "/home/ibm/dongfeng-minitraktor/parsed_data/agrodom/parts-complete-progress.json",
    "/home/ibm/dongfeng-minitraktor/parsed_data/agrodom/parts-final.json",
    "/home/ibm/dongfeng-minitraktor/parsed_data/agrodom/parts-merged.json",
]

# Находим самый полный файл
best_file = None
max_count = 0

for file_path in AGRODOM_FILES:
    if not os.path.exists(file_path):
        continue

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if len(data) > max_count:
                max_count = len(data)
                best_file = file_path
    except:
        pass

if not best_file:
    print("❌ Файлы не найдены!")
    exit(1)

print(f"📦 Используем: {os.path.basename(best_file)}")
print(f"   Товаров: {max_count}\n")

# Загружаем товары
with open(best_file, 'r', encoding='utf-8') as f:
    products_data = json.load(f)

updated = 0
skipped = 0

# Обрабатываем батчами
for i, product_data in enumerate(products_data):
    title = product_data.get("title") or product_data.get("name", "")
    brand = product_data.get("brand") or product_data.get("manufacturer", "")

    if not title:
        skipped += 1
        continue

    # Ищем в БД
    title_search = title[:40].strip()

    try:
        result = supabase.table("products").select("id").ilike("name", f"{title_search}%").limit(1).execute()

        if not result.data:
            skipped += 1
            continue

        product_id = result.data[0]["id"]

        # Обновляем если есть бренд
        if brand and brand not in ["Неизвестно", "Unknown", "UNIVERSAL", ""]:
            supabase.table("products").update({"manufacturer": brand}).eq("id", product_id).execute()
            updated += 1

    except Exception as e:
        skipped += 1

    # Прогресс каждые 100
    if (i + 1) % 100 == 0:
        print(f"   Прогресс: {i + 1}/{max_count} | Обновлено: {updated}")

print(f"\n✅ ИТОГО:")
print(f"   Обновлено: {updated}")
print(f"   Пропущено: {skipped}")
print("=" * 80)
