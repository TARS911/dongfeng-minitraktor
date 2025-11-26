#!/usr/bin/env python3
"""
ПОЛНЫЙ АУДИТ БАЗЫ ДАННЫХ
Ищем где 1933 пропавших товара!
"""

import os
from collections import defaultdict
from supabase import create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("❌ ОШИБКА: Нет переменных окружения")
    exit(1)

supabase = create_client(url, key)

print("=" * 100)
print("🔍 ПОЛНЫЙ АУДИТ БАЗЫ ДАННЫХ")
print("=" * 100)
print()

# Загружаем ВСЕ товары
print("📦 Загружаем ВСЕ товары...")
all_products = []
offset = 0
limit = 1000

while True:
    batch = supabase.table("products")\
        .select("id, name, category_id, manufacturer, in_stock")\
        .range(offset, offset + limit - 1)\
        .execute()

    if not batch.data:
        break

    all_products.extend(batch.data)
    offset += limit

    if len(batch.data) < limit:
        break

    print(f"  Загружено: {len(all_products)}...")

print(f"✅ ВСЕГО ТОВАРОВ В БД: {len(all_products)}")
print()

# Загружаем ВСЕ категории
print("📁 Загружаем категории...")
categories_result = supabase.table("categories")\
    .select("id, name, slug")\
    .execute()

categories = {cat["id"]: cat for cat in categories_result.data}
print(f"✅ Всего категорий: {len(categories)}")
print()

# Считаем по категориям
print("=" * 100)
print("📊 ПОЛНОЕ РАСПРЕДЕЛЕНИЕ ПО КАТЕГОРИЯМ")
print("=" * 100)
print()

by_category = defaultdict(lambda: {"total": 0, "in_stock": 0, "products": []})

for p in all_products:
    cat_id = p.get("category_id")
    in_stock = p.get("in_stock", False)

    by_category[cat_id]["total"] += 1
    by_category[cat_id]["products"].append(p)
    if in_stock:
        by_category[cat_id]["in_stock"] += 1

# Сортируем по количеству (больше → меньше)
sorted_categories = sorted(by_category.items(), key=lambda x: x[1]["total"], reverse=True)

total_sum = 0

for cat_id, data in sorted_categories:
    cat_name = categories.get(cat_id, {}).get("name", f"Category {cat_id}") if cat_id else "БЕЗ КАТЕГОРИИ"
    cat_slug = categories.get(cat_id, {}).get("slug", "no-slug") if cat_id else "no-slug"

    total = data["total"]
    in_stock = data["in_stock"]
    total_sum += total

    print(f"{total:5} товаров ({in_stock:5} в наличии) | ID: {str(cat_id):5} | {cat_name:45} | /{cat_slug}")

print()
print("-" * 100)
print(f"ИТОГО: {total_sum} товаров")
print()

# Проверяем математику
if total_sum == len(all_products):
    print("✅ СХОДИТСЯ! Все товары распределены по категориям")
else:
    print(f"❌ НЕ СХОДИТСЯ! Разница: {len(all_products) - total_sum}")

print()

# Считаем по производителям
print("=" * 100)
print("📊 РАСПРЕДЕЛЕНИЕ ПО ПРОИЗВОДИТЕЛЯМ")
print("=" * 100)
print()

by_manufacturer = defaultdict(lambda: {"total": 0, "in_stock": 0})

for p in all_products:
    manufacturer = p.get("manufacturer", "Unknown")
    in_stock = p.get("in_stock", False)

    by_manufacturer[manufacturer]["total"] += 1
    if in_stock:
        by_manufacturer[manufacturer]["in_stock"] += 1

sorted_manufacturers = sorted(by_manufacturer.items(), key=lambda x: x[1]["total"], reverse=True)

mfr_sum = 0

for manufacturer, data in sorted_manufacturers:
    total = data["total"]
    in_stock = data["in_stock"]
    mfr_sum += total

    print(f"{total:5} товаров ({in_stock:5} в наличии) | {manufacturer}")

print()
print("-" * 100)
print(f"ИТОГО: {mfr_sum} товаров")
print()

# СПЕЦИАЛЬНЫЙ АНАЛИЗ: Ищем "ЗАПЧАСТИ"
print("=" * 100)
print("🔍 АНАЛИЗ КАТЕГОРИИ 'ЗАПЧАСТИ'")
print("=" * 100)
print()

parts_categories = [cat_id for cat_id, cat in categories.items() if "запчаст" in cat.get("name", "").lower()]

print(f"Найдено категорий со словом 'запчасти': {len(parts_categories)}")
print()

parts_total = 0

for cat_id in parts_categories:
    cat_name = categories[cat_id]["name"]
    count = by_category[cat_id]["total"]
    in_stock = by_category[cat_id]["in_stock"]
    parts_total += count

    print(f"{count:5} товаров ({in_stock:5} в наличии) | {cat_name}")

print()
print(f"ИТОГО в категориях 'Запчасти': {parts_total}")
print()

# Ищем другие большие категории
print("=" * 100)
print("📊 ВСЕ ОСТАЛЬНЫЕ БОЛЬШИЕ КАТЕГОРИИ (>50 товаров)")
print("=" * 100)
print()

other_total = 0

for cat_id, data in sorted_categories:
    if data["total"] < 50:
        continue

    cat_name = categories.get(cat_id, {}).get("name", f"Category {cat_id}") if cat_id else "БЕЗ КАТЕГОРИИ"

    # Пропускаем уже посчитанные "запчасти"
    if cat_id in parts_categories:
        continue

    other_total += data["total"]
    print(f"{data['total']:5} товаров ({data['in_stock']:5} в наличии) | {cat_name}")

print()
print(f"ИТОГО в других категориях (>50): {other_total}")
print()

# ФИНАЛЬНАЯ МАТЕМАТИКА
print("=" * 100)
print("🧮 ФИНАЛЬНАЯ МАТЕМАТИКА")
print("=" * 100)
print()

print(f"Всего товаров в БД: {len(all_products)}")
print()
print(f"Категории 'Запчасти': {parts_total}")
print(f"Другие категории (>50): {other_total}")
print(f"Сумма: {parts_total + other_total}")
print()
print(f"Осталось в мелких категориях (<50): {len(all_products) - parts_total - other_total}")
print()

print("=" * 100)
print("✅ АУДИТ ЗАВЕРШЁН")
print("=" * 100)
