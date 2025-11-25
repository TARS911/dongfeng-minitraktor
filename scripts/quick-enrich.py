#!/usr/bin/env python3
"""
Быстрое обогащение - обрабатываем по 100 товаров за раз
"""

import os
import json
import time
from supabase import Client, create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

print("🚀 QUICK ENRICHMENT\n")

# Загружаем один тестовый JSON файл
test_file = "../parsed_data/zip-agro/zip-agro-dongfeng-all.json"

print(f"📦 Обработка: {os.path.basename(test_file)}")

with open(test_file, 'r', encoding='utf-8') as f:
    products_data = json.load(f)

print(f"   Товаров в файле: {len(products_data)}\n")

updated = 0
not_found = 0

# Обрабатываем по 100 товаров
for i, product_data in enumerate(products_data[:100]):
    title = product_data.get("title", "")
    brand = product_data.get("brand", "")

    if not title or not brand:
        continue

    # Ищем товар
    title_search = title[:40].strip()
    result = supabase.table("products").select("id").ilike("name", f"{title_search}%").limit(1).execute()

    if not result.data:
        not_found += 1
        continue

    product_id = result.data[0]["id"]

    # Обновляем manufacturer
    try:
        supabase.table("products").update({"manufacturer": brand}).eq("id", product_id).execute()
        updated += 1

        if updated % 10 == 0:
            print(f"   Прогресс: {updated} обновлено...")

    except Exception as e:
        print(f"   Ошибка: {str(e)[:50]}")

    # Пауза каждые 20 товаров
    if (i + 1) % 20 == 0:
        time.sleep(0.5)

print(f"\n✅ Результат:")
print(f"   Обновлено: {updated}")
print(f"   Не найдено: {not_found}")
