#!/usr/bin/env python3
"""
ЭКСТРЕННАЯ ПРОВЕРКА БД SUPABASE
"""

import os
from supabase import Client, create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("❌ ОШИБКА: Нет переменных окружения SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY")
    exit(1)

supabase = create_client(url, key)

print("=" * 80)
print("🚨 ЭКСТРЕННАЯ ДИАГНОСТИКА БАЗЫ ДАННЫХ")
print("=" * 80)
print()

# 1. Общее количество товаров
try:
    result = supabase.table("products").select("id", count="exact").execute()
    total = result.count
    print(f"📦 Всего товаров в БД: {total}")
except Exception as e:
    print(f"❌ ОШИБКА при подсчёте товаров: {e}")
    total = 0

# 2. Проверка первых 5 товаров
print("\n" + "=" * 80)
print("🔍 ПРОВЕРКА ПЕРВЫХ 5 ТОВАРОВ:")
print("=" * 80)

try:
    result = supabase.table("products").select("id, name, category_id, manufacturer, in_stock, price").limit(5).execute()

    if result.data:
        for p in result.data:
            print(f"\n✓ ID: {p['id']}")
            print(f"  Название: {p.get('name', 'НЕТ')[:50]}...")
            print(f"  category_id: {p.get('category_id', 'NULL')}")
            print(f"  manufacturer: {p.get('manufacturer', 'NULL')}")
            print(f"  in_stock: {p.get('in_stock', 'NULL')}")
            print(f"  price: {p.get('price', 'NULL')}")
    else:
        print("❌ НЕТ ДАННЫХ!")

except Exception as e:
    print(f"❌ ОШИБКА при чтении товаров: {e}")

# 3. Количество товаров с category_id
print("\n" + "=" * 80)
print("📊 СТАТИСТИКА CATEGORY_ID:")
print("=" * 80)

try:
    # С category_id
    with_cat = supabase.table("products").select("id", count="exact").not_.is_("category_id", "null").execute()
    print(f"✓ С category_id: {with_cat.count}")

    # Без category_id
    without_cat = supabase.table("products").select("id", count="exact").is_("category_id", "null").execute()
    print(f"❌ Без category_id: {without_cat.count}")

except Exception as e:
    print(f"❌ ОШИБКА: {e}")

# 4. Проверка категорий
print("\n" + "=" * 80)
print("📁 ПРОВЕРКА ТАБЛИЦЫ CATEGORIES:")
print("=" * 80)

try:
    result = supabase.table("categories").select("id, slug, name", count="exact").execute()
    print(f"✓ Всего категорий: {result.count}")

    if result.data:
        print("\nПервые 10 категорий:")
        for cat in result.data[:10]:
            print(f"  • ID {cat['id']}: {cat['slug']} ({cat.get('name', 'без названия')})")

except Exception as e:
    print(f"❌ ОШИБКА: {e}")

# 5. Проверка товаров по категориям
print("\n" + "=" * 80)
print("📊 ТОВАРЫ ПО КАТЕГОРИЯМ (первые 10):")
print("=" * 80)

try:
    categories = supabase.table("categories").select("id, slug").limit(10).execute()

    for cat in categories.data:
        count = supabase.table("products").select("id", count="exact").eq("category_id", cat["id"]).execute()
        print(f"{cat['slug']:40} → {count.count:>5} товаров")

except Exception as e:
    print(f"❌ ОШИБКА: {e}")

print("\n" + "=" * 80)
print("✅ ДИАГНОСТИКА ЗАВЕРШЕНА")
print("=" * 80)
