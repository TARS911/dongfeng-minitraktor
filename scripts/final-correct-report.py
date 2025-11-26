#!/usr/bin/env python3
"""
ФИНАЛЬНЫЙ ПРАВИЛЬНЫЙ ОТЧЁТ
БЕЗ ДВОЙНОГО ПОДСЧЁТА!
"""

import os
from supabase import create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(url, key)

print("=" * 100)
print("📊 ФИНАЛЬНЫЙ ОТЧЁТ (БЕЗ ДВОЙНОГО ПОДСЧЁТА)")
print("=" * 100)
print()

total_db = supabase.table("products").select("id", count="exact").execute()
print(f"✅ ВСЕГО ТОВАРОВ В БД: {total_db.count}")
print()

# 1. ЗАПЧАСТИ - считаем по категориям
print("=" * 100)
print("📦 1. ЗАПЧАСТИ (по категориям)")
print("=" * 100)
print()

parts_category_ids = [303, 304, 305, 307, 310, 311, 312]
parts_category_names = {
    303: "Запчасти на ДВС",
    304: "Запчасти на Минитракторы",
    305: "Запчасти на Мототракторы",
    307: "Запчасти на Навесное оборудование",
    310: "Топливная система",
    311: "Фильтры",
    312: "Гидравлика",
}

parts_total = 0
parts_in_stock = 0

for cat_id in parts_category_ids:
    count_result = supabase.table("products").select("id", count="exact").eq("category_id", cat_id).execute()
    in_stock_result = supabase.table("products").select("id", count="exact").eq("category_id", cat_id).eq("in_stock", True).execute()

    total = count_result.count
    in_stock = in_stock_result.count

    parts_total += total
    parts_in_stock += in_stock

    print(f"  {total:5} товаров ({in_stock:5} в наличии) | {parts_category_names[cat_id]}")

print()
print(f"ИТОГО ЗАПЧАСТИ: {parts_total} ({parts_in_stock} в наличии)")
print()

# 2. УНИВЕРСАЛЬНЫЕ - считаем по manufacturer=UNIVERSAL
print("=" * 100)
print("📦 2. УНИВЕРСАЛЬНЫЕ ЗАПЧАСТИ (manufacturer=UNIVERSAL)")
print("=" * 100)
print()

universal_result = supabase.table("products").select("id", count="exact").eq("manufacturer", "UNIVERSAL").execute()
universal_in_stock = supabase.table("products").select("id", count="exact").eq("manufacturer", "UNIVERSAL").eq("in_stock", True).execute()

print(f"  {universal_result.count:5} товаров ({universal_in_stock.count:5} в наличии) | UNIVERSAL")
print()

# Проверяем пересечение
print("🔍 ПРОВЕРКА ПЕРЕСЕЧЕНИЯ:")
print("-" * 100)

# Сколько UNIVERSAL товаров в категориях "ЗАПЧАСТИ"?
overlap = 0
for cat_id in parts_category_ids:
    overlap_result = supabase.table("products")\
        .select("id", count="exact")\
        .eq("category_id", cat_id)\
        .eq("manufacturer", "UNIVERSAL")\
        .execute()

    if overlap_result.count > 0:
        print(f"  {overlap_result.count:5} UNIVERSAL товаров в категории {parts_category_names[cat_id]}")
        overlap += overlap_result.count

print()
print(f"⚠️  ПЕРЕСЕЧЕНИЕ: {overlap} товаров учтены ДВАЖДЫ!")
print(f"💡 {overlap} UNIVERSAL товаров УЖЕ входят в 'ЗАПЧАСТИ'!")
print()

# 3. ДВС В СБОРЕ
print("=" * 100)
print("📦 3. ДВС В СБОРЕ")
print("=" * 100)
print()

engines_result = supabase.table("products").select("id", count="exact").eq("category_id", 302).execute()
engines_in_stock = supabase.table("products").select("id", count="exact").eq("category_id", 302).eq("in_stock", True).execute()

print(f"  {engines_result.count:5} товаров ({engines_in_stock.count:5} в наличии) | ДВС в Сборе")
print()

# ФИНАЛЬНАЯ МАТЕМАТИКА - ПРАВИЛЬНАЯ!
print("=" * 100)
print("🧮 ПРАВИЛЬНАЯ МАТЕМАТИКА")
print("=" * 100)
print()

print(f"Всего товаров в БД: {total_db.count}")
print()
print("ВАША ГРУППИРОВКА:")
print("-" * 100)
print(f"  Запчасти (7 категорий):          {parts_total:5} ({parts_in_stock} в наличии)")
print(f"  Универсальные (UNIVERSAL):       {universal_result.count:5} ({universal_in_stock.count} в наличии)")
print(f"  ДВС в сборе:                     {engines_result.count:5} ({engines_in_stock.count} в наличии)")
print(f"  " + "-" * 60)
print(f"  СУММА (с пересечением):          {parts_total + universal_result.count + engines_result.count:5}")
print()
print(f"⚠️  НО! {overlap} товаров учтены ДВАЖДЫ (UNIVERSAL товары УЖЕ в 'Запчасти')")
print()
print(f"РЕАЛЬНАЯ СУММА (без пересечения):  {parts_total + universal_result.count + engines_result.count - overlap:5}")
print()

# Где остальные?
remaining = total_db.count - (parts_total + universal_result.count + engines_result.count - overlap)

print(f"❓ ОСТАЛОСЬ: {remaining} товаров")
print()
print("ГДЕ ОНИ?")
print("-" * 100)

# Загружаем все категории
categories_result = supabase.table("categories").select("id, name").execute()
categories = {cat["id"]: cat["name"] for cat in categories_result.data}

# Считаем все остальные категории
other_category_ids = [cat_id for cat_id in categories.keys() if cat_id not in parts_category_ids and cat_id != 302]

other_total = 0
other_in_stock = 0

print()
print("ОСТАЛЬНЫЕ КАТЕГОРИИ:")
print()

for cat_id in sorted(other_category_ids):
    count_result = supabase.table("products").select("id", count="exact").eq("category_id", cat_id).execute()
    in_stock_result = supabase.table("products").select("id", count="exact").eq("category_id", cat_id).eq("in_stock", True).execute()

    total = count_result.count
    in_stock = in_stock_result.count

    if total > 0:
        other_total += total
        other_in_stock += in_stock
        print(f"  {total:5} товаров ({in_stock:5} в наличии) | {categories[cat_id]}")

print()
print(f"ИТОГО в остальных категориях: {other_total} ({other_in_stock} в наличии)")
print()

# ФИНАЛЬНАЯ ПРОВЕРКА
print("=" * 100)
print("✅ ФИНАЛЬНАЯ ПРОВЕРКА")
print("=" * 100)
print()

calculated_total = parts_total + engines_result.count + other_total

print(f"Запчасти (7 категорий):    {parts_total:5}")
print(f"ДВС в сборе:               {engines_result.count:5}")
print(f"Остальные категории:       {other_total:5}")
print(f"" + "-" * 40)
print(f"СУММА:                     {calculated_total:5}")
print()
print(f"Всего в БД:                {total_db.count:5}")
print()

if calculated_total == total_db.count:
    print("✅ СХОДИТСЯ! ВСЕ ТОВАРЫ УЧТЕНЫ!")
else:
    print(f"❌ РАЗНИЦА: {total_db.count - calculated_total}")

print()
print("=" * 100)
