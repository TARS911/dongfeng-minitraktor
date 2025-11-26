#!/usr/bin/env python3
"""
ПРОВЕРКА ОДНОЙ ПОДКАТЕГОРИИ - почему не сходятся товары?
"""

import os
from supabase import create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("❌ ОШИБКА: Нет переменных окружения")
    exit(1)

supabase = create_client(url, key)

print("=" * 80)
print("🔍 ПРОВЕРКА: DongFeng 240-244")
print("=" * 80)
print()

# 1. Проверяем всех DongFeng товаров
print("📊 ШАГ 1: Всего товаров DongFeng в БД")
print("-" * 80)

all_dongfeng = supabase.table("products")\
    .select("id, name, manufacturer, in_stock", count="exact")\
    .eq("manufacturer", "DongFeng")\
    .execute()

print(f"Всего товаров с manufacturer='DongFeng': {all_dongfeng.count}")
print(f"Из них in_stock=true: {len([p for p in all_dongfeng.data if p.get('in_stock')])}")
print(f"Из них in_stock=false: {len([p for p in all_dongfeng.data if not p.get('in_stock')])}")
print()

# 2. Проверяем товары с 240 или 244 в названии
print("📊 ШАГ 2: Товары DongFeng с '240' или '244' в названии")
print("-" * 80)

products_240_244 = []
for p in all_dongfeng.data:
    name = p['name'].lower()
    if '240' in name or '244' in name:
        products_240_244.append(p)

print(f"Найдено товаров с '240' или '244': {len(products_240_244)}")
print(f"Из них in_stock=true: {len([p for p in products_240_244 if p.get('in_stock')])}")
print(f"Из них in_stock=false: {len([p for p in products_240_244 if not p.get('in_stock')])}")
print()

# 3. Что показывает фронтенд?
print("📊 ШАГ 3: Что ДОЛЖЕН показать фронтенд?")
print("-" * 80)

# Фронтенд фильтрует по:
# 1. manufacturer='DongFeng'
# 2. in_stock=true
# 3. '240' или '244' в названии

frontend_products = [p for p in products_240_244 if p.get('in_stock')]

print(f"Фронтенд ДОЛЖЕН показать: {len(frontend_products)} товаров")
print()

# 4. ПРОБЛЕМА - проверяем разные варианты
print("📊 ШАГ 4: ПРОВЕРКА ПРОБЛЕМ")
print("-" * 80)

# Проблема 1: Разный регистр manufacturer?
variants = ["DongFeng", "DONGFENG", "dongfeng", "Dongfeng"]
print("Проверка регистра manufacturer:")
for variant in variants:
    count = supabase.table("products").select("id", count="exact").eq("manufacturer", variant).execute()
    if count.count > 0:
        print(f"  manufacturer='{variant}': {count.count} товаров")
print()

# Проблема 2: in_stock = null?
print("Проверка товаров с in_stock=NULL:")
null_stock = supabase.table("products")\
    .select("id, name, manufacturer, in_stock", count="exact")\
    .eq("manufacturer", "DongFeng")\
    .is_("in_stock", "null")\
    .execute()
print(f"  Товаров с in_stock=NULL: {null_stock.count}")
print()

# Проблема 3: Товары без category_id?
print("Проверка товаров без category_id:")
no_category = supabase.table("products")\
    .select("id, name, manufacturer, category_id", count="exact")\
    .eq("manufacturer", "DongFeng")\
    .is_("category_id", "null")\
    .execute()
print(f"  Товаров без category_id: {no_category.count}")
print()

# 5. Показываем первые 10 товаров которые ДОЛЖНЫ отображаться
print("📋 ШАГ 5: ПЕРВЫЕ 10 ТОВАРОВ для DongFeng 240-244")
print("-" * 80)

for i, p in enumerate(frontend_products[:10], 1):
    print(f"{i}. ID={p['id']}: {p['name'][:70]}...")
    print(f"   in_stock={p.get('in_stock')}, manufacturer={p.get('manufacturer')}")
    print()

print("=" * 80)
print("✅ ПРОВЕРКА ЗАВЕРШЕНА")
print("=" * 80)
print()
print(f"📊 ИТОГ: Фронтенд должен показать {len(frontend_products)} товаров для DongFeng 240-244")
