#!/usr/bin/env python3
"""
Перемещает товары Perkins в правильные категории
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
    "Content-Type": "application/json",
}

print("=" * 70)
print("🔄 ПЕРЕМЕЩЕНИЕ ТОВАРОВ PERKINS")
print("=" * 70)

# Получаем категорию "Perkins - Фильтра"
url = f"{SUPABASE_URL}/rest/v1/categories?select=id&slug=eq.perkins-filters"
response = requests.get(url, headers=headers)
perkins_filters_cat = response.json()

if not perkins_filters_cat:
    print("❌ Категория perkins-filters не найдена!")
    sys.exit(1)

perkins_category_id = perkins_filters_cat[0]["id"]
print(f"\n✅ Найдена категория Perkins - Фильтра (ID: {perkins_category_id})")

# Получаем все товары с Perkins в названии
url = f"{SUPABASE_URL}/rest/v1/products?select=*"
response = requests.get(url, headers=headers, params={"limit": "10000"})
all_products = response.json()

perkins_products = [p for p in all_products if "perkins" in p["name"].lower()]

print(f"\n📦 Найдено товаров с 'Perkins' в названии: {len(perkins_products)}")

# Перемещаем товары
moved = 0
for product in perkins_products:
    print(f"\n🔄 Перемещаю товар ID {product['id']}: {product['name'][:60]}...")

    # Обновляем category_id
    url = f"{SUPABASE_URL}/rest/v1/products?id=eq.{product['id']}"
    data = {"category_id": perkins_category_id}
    response = requests.patch(url, headers=headers, json=data)

    if response.status_code in [200, 204]:
        print(f"  ✅ Перемещен в категорию Perkins - Фильтра")
        moved += 1
    else:
        print(f"  ❌ Ошибка: {response.status_code} - {response.text}")

print(f"\n{'=' * 70}")
print(f"✅ Перемещено товаров: {moved} из {len(perkins_products)}")
print(f"{'=' * 70}")
