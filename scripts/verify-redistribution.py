#!/usr/bin/env python3
"""
ПРОВЕРКА РЕЗУЛЬТАТОВ ПЕРЕРАСПРЕДЕЛЕНИЯ
Показывает распределение товаров по всем категориям
"""

import os
from collections import defaultdict

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("🔍 Загружаю данные из БД...")

# Получаем все категории
categories = supabase.table("categories").select("id, name, slug").execute()
cat_dict = {cat["id"]: cat for cat in categories.data}

# Получаем все товары
products = supabase.table("products").select("id, name, category_id").execute()

print(f"📊 Всего категорий: {len(categories.data)}")
print(f"📦 Всего товаров: {len(products.data)}\n")

# Подсчитываем товары по категориям
category_counts = defaultdict(int)
for product in products.data:
    category_counts[product["category_id"]] += 1

# Сортируем по количеству товаров
sorted_categories = sorted(category_counts.items(), key=lambda x: -x[1])
print("=" * 100)
print("📊 РАСПРЕДЕЛЕНИЕ ТОВАРОВ ПО КАТЕГОРИЯМ")
print("=" * 100)

# Группируем по типам
universal_total = 0
new_engines_total = 0
other_brands_total = 0

print("\n🔧 УНИВЕРСАЛЬНЫЕ КАТЕГОРИИ:")
print("-" * 100)
for cat_id, count in sorted_categories:
    if cat_id in cat_dict:
        cat = cat_dict[cat_id]
        if "universal" in cat["slug"]:
            print(f"  {cat['name']:50s} {count:4d} товаров")
            universal_total += count

print(f"\n{'ИТОГО UNIVERSAL:':50s} {universal_total:4d} товаров")

print("\n🇨🇳 НОВЫЕ КАТЕГОРИИ (Китайские двигатели):")
print("-" * 100)
new_brands = ["s1100", "s195", "zs", "r175", "r180"]
for cat_id, count in sorted_categories:
    if cat_id in cat_dict:
        cat = cat_dict[cat_id]
        if any(brand in cat["slug"] for brand in new_brands):
            print(f"  {cat['name']:50s} {count:4d} товаров")
            new_engines_total += count

print(f"\n{'ИТОГО НОВЫЕ БРЕНДЫ:':50s} {new_engines_total:4d} товаров")

print("\n🚜 ДРУГИЕ БРЕНДЫ:")
print("-" * 100)
for cat_id, count in sorted_categories:
    if cat_id in cat_dict:
        cat = cat_dict[cat_id]
        if not (
            "universal" in cat["slug"]
            or any(brand in cat["slug"] for brand in new_brands)
        ):
            if count > 0:  # Показываем только непустые
                print(f"  {cat['name']:50s} {count:4d} товаров")
                other_brands_total += count

print(f"\n{'ИТОГО ДРУГИЕ БРЕНДЫ:':50s} {other_brands_total:4d} товаров")

print("\n" + "=" * 100)
print("📈 ОБЩАЯ СТАТИСТИКА:")
print("=" * 100)
print(
    f"  Universal категории:        {universal_total:4d} товаров ({universal_total / len(products.data) * 100:.1f}%)"
)
print(
    f"  Китайские двигатели (NEW):  {new_engines_total:4d} товаров ({new_engines_total / len(products.data) * 100:.1f}%)"
)
print(
    f"  Другие бренды:              {other_brands_total:4d} товаров ({other_brands_total / len(products.data) * 100:.1f}%)"
)
print("-" * 100)
print(f"  ВСЕГО:                      {len(products.data):4d} товаров")
print("=" * 100)

# Показываем новые категории детально
print("\n🎯 ДЕТАЛИЗАЦИЯ НОВЫХ КАТЕГОРИЙ:")
print("=" * 100)
print("="*100)
for brand in ["s1100", "s195", "zs", "r180"]:
    brand_categories = [
        (cat_dict[cat_id], count)
        for cat_id, count in category_counts.items()
        if cat_id in cat_dict and brand in cat_dict[cat_id]["slug"]
    ]

    if brand_categories:
        brand_total = sum(count for _, count in brand_categories)
        print(f"\n{brand.upper()}:")
        for cat, count in sorted(brand_categories, key=lambda x: -x[1]):
            print(f"  ├─ {cat['name']:45s} {count:4d} товаров")
        print(f"  └─ {'ИТОГО:':45s} {brand_total:4d} товаров")

print("\n✅ Проверка завершена!")
