#!/usr/bin/env python3
"""
Поиск двигателей в БД для категории engines-assembled
"""

import os
from supabase import create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("❌ ОШИБКА: Нет переменных окружения SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY")
    exit(1)

supabase = create_client(url, key)

print("=" * 80)
print("🔍 ПОИСК ДВИГАТЕЛЕЙ ДЛЯ КАТЕГОРИИ engines-assembled")
print("=" * 80)
print()

# 1. Проверяем категорию engines-assembled
cat = supabase.table("categories").select("id, name, slug").eq("slug", "engines-assembled").maybe_single().execute()

if cat.data:
    cat_id = cat.data["id"]
    print(f"✅ Категория engines-assembled: ID={cat_id}, Name={cat.data['name']}")

    # Считаем товары в категории
    count = supabase.table("products").select("id", count="exact").eq("category_id", cat_id).execute()
    print(f"📦 Товаров в категории engines-assembled: {count.count}")
    print()
else:
    print("❌ Категория engines-assembled НЕ НАЙДЕНА!")
    cat_id = None

# 2. Ищем двигатели по ключевым словам
print("=" * 80)
print("🔍 ПОИСК ДВИГАТЕЛЕЙ ПО КЛЮЧЕВЫМ СЛОВАМ:")
print("=" * 80)
print()

keywords = [
    "двигатель",
    "двс",
    "engine",
    "мотор",
    "дизель",
    "дизельный",
    "R180",
    "R190",
    "R195",
    "ZS1100",
    "ZS1115",
    "в сборе",
    "assembled"
]

all_engines = []

for keyword in keywords:
    result = supabase.table("products").select("id, name, category_id, price, in_stock").ilike("name", f"%{keyword}%").execute()

    if result.data:
        print(f"✅ По слову '{keyword}': {len(result.data)} товаров")

        for p in result.data:
            if p["id"] not in [e["id"] for e in all_engines]:
                all_engines.append(p)

print()
print("=" * 80)
print(f"📦 ВСЕГО НАЙДЕНО УНИКАЛЬНЫХ ДВИГАТЕЛЕЙ: {len(all_engines)}")
print("=" * 80)
print()

# 3. Показываем все найденные двигатели
if all_engines:
    print("📋 СПИСОК ВСЕХ НАЙДЕННЫХ ДВИГАТЕЛЕЙ:")
    print("-" * 80)

    for i, p in enumerate(all_engines, 1):
        cat_text = f"category_id={p['category_id']}" if p['category_id'] else "БЕЗ КАТЕГОРИИ"
        stock_text = "✅ В наличии" if p.get("in_stock") else "❌ Нет"
        price_text = f"{p.get('price', 0)} руб" if p.get('price') else "Нет цены"

        print(f"\n{i}. ID={p['id']} | {cat_text} | {stock_text} | {price_text}")
        print(f"   {p['name'][:100]}")

        if cat_id and p['category_id'] == cat_id:
            print("   ✅ УЖЕ В КАТЕГОРИИ engines-assembled")

# 4. Подсчёт товаров без категории или в неправильной категории
print()
print("=" * 80)
print("📊 СТАТИСТИКА:")
print("=" * 80)
print()

if cat_id:
    already_in_cat = [p for p in all_engines if p['category_id'] == cat_id]
    need_to_add = [p for p in all_engines if not p['category_id'] or p['category_id'] != cat_id]

    print(f"✅ Уже в категории engines-assembled: {len(already_in_cat)}")
    print(f"⚠️  Нужно добавить в категорию: {len(need_to_add)}")

    if need_to_add:
        print()
        print("📋 ТОВАРЫ, КОТОРЫЕ НУЖНО ДОБАВИТЬ:")
        print("-" * 80)
        for p in need_to_add[:20]:  # Показываем первые 20
            print(f"  • ID {p['id']}: {p['name'][:80]}...")

print()
print("=" * 80)
print("✅ ПОИСК ЗАВЕРШЁН")
print("=" * 80)
