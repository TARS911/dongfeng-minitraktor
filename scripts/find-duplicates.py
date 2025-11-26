#!/usr/bin/env python3
"""
ПОИСК ДУБЛИКАТОВ В БД - почему показывает больше товаров!
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
print("🔍 ПОИСК ДУБЛИКАТОВ В БД")
print("=" * 100)
print()

# 1. Проверяем engines-assembled (category_id=302)
print("📊 ПРОБЛЕМА 1: engines-assembled - написано 12, показывает 16")
print("-" * 100)

engines = supabase.table("products")\
    .select("id, name, manufacturer, category_id, in_stock")\
    .eq("category_id", 302)\
    .eq("in_stock", True)\
    .order("id")\
    .execute()

print(f"Всего товаров в category_id=302: {len(engines.data)}")
print()

# Ищем дубликаты по названию
names = {}
for p in engines.data:
    name = p["name"]
    if name not in names:
        names[name] = []
    names[name].append(p)

duplicates = {name: products for name, products in names.items() if len(products) > 1}

if duplicates:
    print(f"⚠️  НАЙДЕНО ДУБЛИКАТОВ: {len(duplicates)}")
    print()
    for name, products in duplicates.items():
        print(f"📋 '{name}' - {len(products)} копий:")
        for p in products:
            print(f"   ID={p['id']}, manufacturer={p.get('manufacturer')}, in_stock={p.get('in_stock')}")
        print()
else:
    print("✅ Дубликатов НЕТ!")
print()

# Показываем ВСЕ товары
print("📋 ВСЕ ТОВАРЫ В engines-assembled:")
print("-" * 100)
for i, p in enumerate(engines.data, 1):
    print(f"{i}. ID={p['id']}: {p['name']}")
    print(f"   manufacturer={p.get('manufacturer')}")
print()

# 2. Проверяем DongFeng
print("=" * 100)
print("📊 ПРОБЛЕМА 2: DongFeng - 576 товаров, но 240-244 + 354-404 = 214")
print("-" * 100)

# Все DongFeng
all_dongfeng = supabase.table("products")\
    .select("id, name, manufacturer, in_stock")\
    .eq("manufacturer", "DongFeng")\
    .eq("in_stock", True)\
    .execute()

print(f"Всего DongFeng товаров: {len(all_dongfeng.data)}")
print()

# Считаем 240-244
count_240_244 = 0
count_354_404 = 0
count_other = 0

products_240_244 = []
products_354_404 = []
products_other = []

for p in all_dongfeng.data:
    name = p["name"].lower()
    if "240" in name or "244" in name:
        count_240_244 += 1
        products_240_244.append(p)
    elif "354" in name or "404" in name:
        count_354_404 += 1
        products_354_404.append(p)
    else:
        count_other += 1
        products_other.append(p)

print(f"С '240' или '244': {count_240_244}")
print(f"С '354' или '404': {count_354_404}")
print(f"ОСТАЛЬНЫЕ (без модели): {count_other}")
print(f"ИТОГО: {count_240_244 + count_354_404 + count_other}")
print()

# Показываем первые 20 "остальных"
print("📋 ПЕРВЫЕ 20 ТОВАРОВ БЕЗ МОДЕЛИ (остальные DongFeng):")
print("-" * 100)
for i, p in enumerate(products_other[:20], 1):
    print(f"{i}. ID={p['id']}: {p['name'][:80]}...")
print()

# 3. Проверяем дубликаты во ВСЕЙ БД
print("=" * 100)
print("📊 ПРОБЛЕМА 3: ДУБЛИКАТЫ ВО ВСЕЙ БД")
print("-" * 100)

print("Загружаем все товары... (это займёт ~10 секунд)")

# Загружаем ВСЕ товары по частям
all_products = []
offset = 0
limit = 1000

while True:
    batch = supabase.table("products")\
        .select("id, name, slug")\
        .range(offset, offset + limit - 1)\
        .execute()

    if not batch.data:
        break

    all_products.extend(batch.data)
    offset += limit

    if len(batch.data) < limit:
        break

print(f"Загружено товаров: {len(all_products)}")
print()

# Ищем дубликаты по name
all_names = {}
for p in all_products:
    name = p["name"]
    if name not in all_names:
        all_names[name] = []
    all_names[name].append(p)

all_duplicates = {name: products for name, products in all_names.items() if len(products) > 1}

print(f"⚠️  ДУБЛИКАТОВ ПО НАЗВАНИЮ: {len(all_duplicates)}")
print()

if all_duplicates:
    print("📋 ТОП-20 ДУБЛИКАТОВ:")
    print("-" * 100)

    sorted_dups = sorted(all_duplicates.items(), key=lambda x: len(x[1]), reverse=True)

    for i, (name, products) in enumerate(sorted_dups[:20], 1):
        print(f"{i}. '{name}' - {len(products)} копий:")
        for p in products[:3]:  # Показываем только первые 3
            print(f"   ID={p['id']}, slug={p.get('slug', 'НЕТ')}")
        if len(products) > 3:
            print(f"   ... и ещё {len(products) - 3} копий")
        print()

print()
print("=" * 100)
print("✅ ПРОВЕРКА ЗАВЕРШЕНА")
print("=" * 100)
