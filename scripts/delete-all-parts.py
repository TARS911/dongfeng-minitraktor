#!/usr/bin/env python3
"""
Удаляет все запчасти из базы данных (оставляет только мини-тракторы)
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
print("🗑️  УДАЛЕНИЕ ВСЕХ ЗАПЧАСТЕЙ ИЗ БАЗЫ ДАННЫХ")
print("=" * 70)

# Получаем все категории запчастей (все кроме mini-tractors)
print("\n📦 Загружаю категории запчастей...")
url = f"{SUPABASE_URL}/rest/v1/categories?select=id,name,slug"
response = requests.get(url, headers=headers, params={"limit": "1000"})
all_categories = response.json()

# Фильтруем только категории запчастей
parts_categories = []
for c in all_categories:
    if "-" in c["slug"] and not c["slug"].startswith("mini-tractors"):
        parts_categories.append(c)

print(f"✅ Найдено {len(parts_categories)} категорий запчастей")

if len(parts_categories) == 0:
    print("\n✅ Категорий запчастей не найдено. Нечего удалять.")
    sys.exit(0)

# Получаем все товары из этих категорий
category_ids = [c["id"] for c in parts_categories]
print(f"\n📦 Ищу товары в категориях запчастей...")

url = f"{SUPABASE_URL}/rest/v1/products?select=id,name,category_id"
response = requests.get(url, headers=headers, params={"limit": "10000"})
all_products = response.json()

# Фильтруем товары запчастей
parts_products = [p for p in all_products if p["category_id"] in category_ids]

print(f"✅ Найдено {len(parts_products)} товаров запчастей")
print(f"📊 Всего товаров в БД: {len(all_products)}")
print(f"📊 Останется после удаления: {len(all_products) - len(parts_products)}")

if len(parts_products) == 0:
    print("\n✅ Товаров запчастей не найдено. Нечего удалять.")
    sys.exit(0)

# Подтверждение
print(f"\n⚠️  ВНИМАНИЕ: Будет удалено {len(parts_products)} товаров!")
print("Нажмите Enter для продолжения или Ctrl+C для отмены...")
input()

# Удаляем товары пачками
print("\n🗑️  Удаляю товары...")
deleted = 0

for product in parts_products:
    url = f"{SUPABASE_URL}/rest/v1/products?id=eq.{product['id']}"
    response = requests.delete(url, headers=headers)

    if response.status_code in [200, 204]:
        deleted += 1
        if deleted % 50 == 0:
            print(f"  Удалено {deleted}/{len(parts_products)}...")
    else:
        print(f"  ❌ Ошибка удаления товара {product['id']}: {response.status_code}")

print(f"\n✅ Удалено {deleted} товаров")

# Проверяем результат
url = f"{SUPABASE_URL}/rest/v1/products?select=id"
response = requests.get(url, headers=headers, params={"limit": "10000"})
remaining = len(response.json())

print(f"📊 Осталось товаров в БД: {remaining}")
print("=" * 70)
