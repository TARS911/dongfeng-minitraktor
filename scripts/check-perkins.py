#!/usr/bin/env python3
"""
Проверяет товары Perkins в базе данных
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
print("🔍 ПРОВЕРКА ТОВАРОВ PERKINS")
print("=" * 70)

# Получаем все товары с Perkins в названии
url = f"{SUPABASE_URL}/rest/v1/products?select=*"
response = requests.get(url, headers=headers, params={"limit": "10000"})
all_products = response.json()

perkins_products = [p for p in all_products if "perkins" in p["name"].lower()]

print(f"\n📦 Найдено товаров Perkins: {len(perkins_products)}")

if len(perkins_products) > 0:
    print("\n📋 Список товаров:")
    for p in perkins_products:
        print(f"  - ID: {p['id']}")
        print(f"    Название: {p['name']}")
        print(f"    Category ID: {p['category_id']}")

        # Получаем категорию
        url = f"{SUPABASE_URL}/rest/v1/categories?id=eq.{p['category_id']}"
        response = requests.get(url, headers=headers)
        category = response.json()

        if category:
            print(f"    Категория: {category[0]['name']} ({category[0]['slug']})")
        print()

# Получаем все категории perkins
url = f"{SUPABASE_URL}/rest/v1/categories?select=*"
response = requests.get(url, headers=headers)
all_categories = response.json()

perkins_cats = [c for c in all_categories if "perkins" in c["slug"]]

print(f"\n📦 Категорий Perkins: {len(perkins_cats)}")
print("\n📋 Список категорий:")
for c in perkins_cats:
    # Считаем товары в категории
    url = f"{SUPABASE_URL}/rest/v1/products?select=id&category_id=eq.{c['id']}"
    response = requests.get(url, headers=headers)
    products_in_cat = response.json()

    print(f"  - {c['name']} ({c['slug']}) - {len(products_in_cat)} товаров")

print("=" * 70)
