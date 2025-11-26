#!/usr/bin/env python3
"""
Проверка проблем с каталогом
"""

import os
from supabase import Client, create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(url, key)

print("=" * 80)
print("🔍 ДИАГНОСТИКА ПРОБЛЕМ КАТАЛОГА")
print("=" * 80)
print()

# 1. Проверка категории engines-assembled
print("1️⃣  КАТЕГОРИЯ engines-assembled:")
print("-" * 80)

cat_result = supabase.table("categories").select("id, name").eq("slug", "engines-assembled").maybe_single().execute()

if cat_result.data:
    cat_id = cat_result.data["id"]
    cat_name = cat_result.data["name"]
    print(f"✅ Категория найдена: ID={cat_id}, Name='{cat_name}'")

    # Считаем товары
    count = supabase.table("products").select("id", count="exact").eq("category_id", cat_id).eq("in_stock", True).execute()
    print(f"📦 Товаров в наличии: {count.count}")
else:
    print("❌ Категория НЕ НАЙДЕНА в БД!")

print()

# 2. Проверка DongFeng товаров
print("2️⃣  ТОВАРЫ DONGFENG:")
print("-" * 80)

# Проверяем разные варианты написания
variants = ["DongFeng", "DONGFENG", "dongfeng", "Dongfeng"]

for variant in variants:
    count = supabase.table("products").select("id", count="exact").eq("manufacturer", variant).eq("in_stock", True).execute()
    if count.count > 0:
        print(f"✅ manufacturer='{variant}': {count.count} товаров")
    else:
        print(f"❌ manufacturer='{variant}': 0 товаров")

print()

# 3. Проверка DongFeng 240-244
print("3️⃣  DONGFENG 240-244:")
print("-" * 80)

# Ищем правильным способом
result = supabase.table("products").select("id, name, manufacturer").eq("manufacturer", "DongFeng").eq("in_stock", True).limit(1000).execute()

if result.data:
    count_240_244 = 0
    count_354_404 = 0

    for p in result.data:
        name = p["name"].lower()
        if "240" in name or "244" in name:
            count_240_244 += 1
        if "354" in name or "404" in name:
            count_354_404 += 1

    print(f"✅ Всего DongFeng товаров: {len(result.data)}")
    print(f"📦 С '240' или '244' в названии: {count_240_244}")
    print(f"📦 С '354' или '404' в названии: {count_354_404}")
else:
    print("❌ Нет товаров DongFeng!")

print()
print("=" * 80)
print("✅ ДИАГНОСТИКА ЗАВЕРШЕНА")
print("=" * 80)
