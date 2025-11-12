#!/usr/bin/env python3
"""
Проверяет URL изображений товаров Perkins
"""

import os
import sys

import requests

SUPABASE_URL = "https://dpsykseeqloturowdyzf.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_KEY:
    print("❌ ОШИБКА: Не найден SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
}

print("=" * 70)
print("🔍 ПРОВЕРКА URL ИЗОБРАЖЕНИЙ")
print("=" * 70)

# Получаем категорию Perkins - Фильтра
url = f"{SUPABASE_URL}/rest/v1/categories?select=id&slug=eq.perkins-filters"
response = requests.get(url, headers=headers)
category = response.json()[0]

# Получаем товары
url = f"{SUPABASE_URL}/rest/v1/products?select=*&category_id=eq.{category['id']}"
response = requests.get(url, headers=headers)
products = response.json()

print(f"\n📦 Товаров в категории Perkins - Фильтра: {len(products)}\n")

for p in products:
    print(f"ID: {p['id']}")
    print(f"Название: {p['name'][:60]}")
    print(f"Image URL: {p.get('image_url', 'НЕТ')}")
    print(f"In stock: {p.get('in_stock', False)}")
    print()

print("=" * 70)
