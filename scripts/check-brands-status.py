#!/usr/bin/env python3
"""
Проверяет статус всех брендов в базе данных
"""

import json
import os
import sys

import requests

SUPABASE_URL = "https://dpsykseeqloturowdyzf.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_KEY:
    print("❌ ОШИБКА: Не найден SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}

# Загружаем финальный список брендов
with open("parsed_data/agrodom/brands-final.json", "r", encoding="utf-8") as f:
    brands = json.load(f)

print("=" * 70)
print("🔍 ПРОВЕРКА СТАТУСА БРЕНДОВ В БАЗЕ ДАННЫХ")
print("=" * 70)

# Получаем все категории
url = f"{SUPABASE_URL}/rest/v1/categories?select=*&order=name.asc"
response = requests.get(url, headers=headers)
categories = response.json()

print(f"\n📦 Всего категорий в БД: {len(categories)}\n")

# Получаем все товары
url = f"{SUPABASE_URL}/rest/v1/products?select=name,category_id"
response = requests.get(url, headers=headers, params={"limit": "10000"})
products = response.json()

print(f"📦 Всего товаров в БД: {len(products)}\n")
print("=" * 70)

# Проверяем каждый бренд
for brand in brands:
    brand_name = brand["name"]
    brand_slug = brand["slug"]
    brand_count = brand["count"]

    # Ищем категории бренда
    brand_categories = [c for c in categories if c["slug"].startswith(brand_slug)]

    # Ищем товары бренда (по названию)
    brand_products = [
        p
        for p in products
        if any(
            keyword in p["name"]
            for keyword in [brand_name, brand_name.split("(")[0].strip()]
        )
    ]

    status = "✅" if len(brand_categories) > 0 else "❌"

    print(f"{status} {brand_name} ({brand_slug})")
    print(f"   Категорий: {len(brand_categories)}")
    print(f"   Товаров в parts.json: {brand_count}")
    print(f"   Товаров в БД: {len(brand_products)}")

    if len(brand_categories) == 0:
        print(f"   ⚠️  БРЕНД БЕЗ КАТЕГОРИЙ - НУЖНО СОЗДАТЬ!")

    print()

print("=" * 70)
