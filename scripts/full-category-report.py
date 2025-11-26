#!/usr/bin/env python3
"""
ПОЛНЫЙ ОТЧЁТ ПО ВСЕМ КАТЕГОРИЯМ
Проверка где не сходятся товары
"""

import os
from supabase import create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("❌ ОШИБКА: Нет переменных окружения")
    exit(1)

supabase = create_client(url, key)

print("=" * 100)
print("📊 ПОЛНЫЙ ОТЧЁТ ПО КАТЕГОРИЯМ")
print("=" * 100)
print()

# 1. Общая статистика
print("📈 ОБЩАЯ СТАТИСТИКА:")
print("-" * 100)

total_products = supabase.table("products").select("id", count="exact").execute()
total_in_stock = supabase.table("products").select("id", count="exact").eq("in_stock", True).execute()
total_categories = supabase.table("categories").select("id", count="exact").execute()

print(f"Всего товаров в БД: {total_products.count}")
print(f"Из них в наличии (in_stock=true): {total_in_stock.count}")
print(f"Всего категорий: {total_categories.count}")
print()

# 2. Товары по категориям
print("📦 ТОВАРЫ ПО КАТЕГОРИЯМ:")
print("-" * 100)

categories = supabase.table("categories")\
    .select("id, name, slug")\
    .order("id")\
    .execute()

category_stats = []

for cat in categories.data:
    cat_id = cat["id"]
    cat_name = cat["name"]
    cat_slug = cat["slug"]

    # Считаем товары
    count_all = supabase.table("products").select("id", count="exact").eq("category_id", cat_id).execute()
    count_in_stock = supabase.table("products").select("id", count="exact").eq("category_id", cat_id).eq("in_stock", True).execute()

    category_stats.append({
        "id": cat_id,
        "name": cat_name,
        "slug": cat_slug,
        "total": count_all.count,
        "in_stock": count_in_stock.count,
        "not_in_stock": count_all.count - count_in_stock.count
    })

# Сортируем по количеству товаров (больше → меньше)
category_stats.sort(key=lambda x: x["total"], reverse=True)

print(f"{'ID':<5} {'Название':<50} {'Всего':<8} {'В наличии':<12} {'Нет в наличии':<15}")
print("-" * 100)

for stat in category_stats:
    if stat["total"] > 0:  # Показываем только категории с товарами
        print(f"{stat['id']:<5} {stat['name']:<50} {stat['total']:<8} {stat['in_stock']:<12} {stat['not_in_stock']:<15}")

print()

# 3. Топ-10 категорий
print("🏆 ТОП-10 КАТЕГОРИЙ ПО КОЛИЧЕСТВУ ТОВАРОВ:")
print("-" * 100)

for i, stat in enumerate(category_stats[:10], 1):
    print(f"{i}. {stat['name']}: {stat['total']} товаров ({stat['in_stock']} в наличии)")

print()

# 4. Пустые категории
print("⚠️  ПУСТЫЕ КАТЕГОРИИ (без товаров):")
print("-" * 100)

empty_cats = [s for s in category_stats if s["total"] == 0]

if empty_cats:
    for stat in empty_cats:
        print(f"  • ID {stat['id']}: {stat['name']} ({stat['slug']})")
else:
    print("  Все категории имеют товары!")

print()

# 5. Проверка товаров без категории
print("⚠️  ТОВАРЫ БЕЗ КАТЕГОРИИ:")
print("-" * 100)

no_category = supabase.table("products")\
    .select("id, name, manufacturer", count="exact")\
    .is_("category_id", "null")\
    .execute()

print(f"Товаров без category_id: {no_category.count}")

if no_category.count > 0:
    print("Первые 10:")
    for i, p in enumerate(no_category.data[:10], 1):
        print(f"  {i}. ID {p['id']}: {p['name'][:70]}...")

print()

# 6. Проверка товаров с in_stock=NULL
print("⚠️  ТОВАРЫ С in_stock=NULL:")
print("-" * 100)

null_stock = supabase.table("products")\
    .select("id, name", count="exact")\
    .is_("in_stock", "null")\
    .execute()

print(f"Товаров с in_stock=NULL: {null_stock.count}")

print()

# 7. Товары по производителям
print("🏭 ТОП-10 ПРОИЗВОДИТЕЛЕЙ:")
print("-" * 100)

# Получаем всех производителей
all_products = supabase.table("products").select("manufacturer").execute()

manufacturers = {}
for p in all_products.data:
    mfr = p.get("manufacturer") or "Без производителя"
    manufacturers[mfr] = manufacturers.get(mfr, 0) + 1

# Сортируем
top_manufacturers = sorted(manufacturers.items(), key=lambda x: x[1], reverse=True)[:10]

for i, (mfr, count) in enumerate(top_manufacturers, 1):
    print(f"{i}. {mfr}: {count} товаров")

print()

print("=" * 100)
print("✅ ОТЧЁТ ЗАВЕРШЁН")
print("=" * 100)
