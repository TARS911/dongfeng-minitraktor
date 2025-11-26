#!/usr/bin/env python3
"""
АНАЛИЗ UNIVERSAL ТОВАРОВ
Разбираем 1803 товара с manufacturer=UNIVERSAL
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
print("🔍 АНАЛИЗ UNIVERSAL ТОВАРОВ")
print("=" * 100)
print()

# Загружаем все UNIVERSAL товары
print("📦 Загружаем UNIVERSAL товары...")
universal_products = []
offset = 0
limit = 1000

while True:
    batch = supabase.table("products")\
        .select("id, name, slug, price, category_id, manufacturer, in_stock")\
        .eq("manufacturer", "UNIVERSAL")\
        .range(offset, offset + limit - 1)\
        .execute()

    if not batch.data:
        break

    universal_products.extend(batch.data)
    offset += limit

    if len(batch.data) < limit:
        break

print(f"✅ Найдено UNIVERSAL товаров: {len(universal_products)}")
print()

# Загружаем категории
categories_result = supabase.table("categories")\
    .select("id, name, slug")\
    .execute()

categories = {cat["id"]: cat for cat in categories_result.data}

# АНАЛИЗ ПО КАТЕГОРИЯМ
print("📊 РАСПРЕДЕЛЕНИЕ ПО КАТЕГОРИЯМ:")
print("-" * 100)

by_category = defaultdict(list)
for p in universal_products:
    cat_id = p.get("category_id")
    by_category[cat_id].append(p)

sorted_categories = sorted(by_category.items(), key=lambda x: len(x[1]), reverse=True)

for cat_id, products in sorted_categories[:20]:
    cat_name = categories.get(cat_id, {}).get("name", f"Category {cat_id}") if cat_id else "Без категории"
    in_stock = len([p for p in products if p.get("in_stock")])
    print(f"{len(products):4} товаров ({in_stock:4} в наличии) - {cat_name}")

print()

# АНАЛИЗ ПО КЛЮЧЕВЫМ СЛОВАМ В НАЗВАНИЯХ
print("📊 АНАЛИЗ ПО КЛЮЧЕВЫМ СЛОВАМ:")
print("-" * 100)

keywords = {
    "DongFeng": [],
    "Dongfeng": [],
    "ДонгФенг": [],
    "240": [],
    "244": [],
    "354": [],
    "404": [],
    "504": [],
    "904": [],
    "1304": [],
    "Foton": [],
    "Фотон": [],
    "Xingtai": [],
    "Синтай": [],
    "Уралец": [],
    "Jinma": [],
    "Джинма": [],
    "двигатель": [],
    "ДВС": [],
    "мотор": [],
    "фильтр": [],
    "насос": [],
    "подшипник": [],
    "сальник": [],
    "прокладка": [],
    "шестерня": [],
    "вал": [],
    "диск": [],
    "колодки": [],
    "ремень": [],
    "шланг": [],
    "форсунка": [],
    "свеча": [],
    "стартер": [],
    "генератор": [],
}

for product in universal_products:
    name = product["name"]
    name_lower = name.lower()

    for keyword in keywords:
        if keyword.lower() in name_lower:
            keywords[keyword].append(product)

# Показываем топ ключевых слов
print("\nТОП КЛЮЧЕВЫХ СЛОВ В НАЗВАНИЯХ:")
sorted_keywords = sorted(keywords.items(), key=lambda x: len(x[1]), reverse=True)

for keyword, products in sorted_keywords[:30]:
    if len(products) > 0:
        in_stock = len([p for p in products if p.get("in_stock")])
        print(f"{len(products):4} товаров ({in_stock:4} в наличии) - содержат '{keyword}'")

print()

# АНАЛИЗ: товары с упоминанием конкретных производителей
print("📊 ТОВАРЫ С УПОМИНАНИЕМ ПРОИЗВОДИТЕЛЕЙ В НАЗВАНИИ:")
print("-" * 100)

manufacturer_mentions = {
    "DongFeng": [],
    "Foton": [],
    "Xingtai": [],
    "Jinma": [],
    "ZUBR": [],
}

for product in universal_products:
    name_lower = product["name"].lower()

    if "dongfeng" in name_lower or "донгфенг" in name_lower:
        manufacturer_mentions["DongFeng"].append(product)
    elif "foton" in name_lower or "фотон" in name_lower:
        manufacturer_mentions["Foton"].append(product)
    elif "xingtai" in name_lower or "синтай" in name_lower or "уралец" in name_lower:
        manufacturer_mentions["Xingtai"].append(product)
    elif "jinma" in name_lower or "джинма" in name_lower:
        manufacturer_mentions["Jinma"].append(product)
    elif "zubr" in name_lower or "зубр" in name_lower:
        manufacturer_mentions["ZUBR"].append(product)

total_with_manufacturer = 0
for manufacturer, products in manufacturer_mentions.items():
    if len(products) > 0:
        in_stock = len([p for p in products if p.get("in_stock")])
        print(f"{len(products):4} товаров ({in_stock:4} в наличии) - упоминают {manufacturer}")
        total_with_manufacturer += len(products)

print()
print(f"ИТОГО с упоминанием производителя: {total_with_manufacturer}")
print(f"БЕЗ упоминания производителя: {len(universal_products) - total_with_manufacturer}")
print()

# ПРИМЕРЫ товаров БЕЗ упоминания производителя
print("📋 ПРИМЕРЫ ТОВАРОВ БЕЗ УПОМИНАНИЯ ПРОИЗВОДИТЕЛЯ (первые 20):")
print("-" * 100)

no_manufacturer_products = []
for product in universal_products:
    name_lower = product["name"].lower()
    has_manufacturer = any(
        mf.lower() in name_lower
        for mf in ["dongfeng", "донгфенг", "foton", "фотон", "xingtai", "синтай", "уралец", "jinma", "джинма", "zubr", "зубр"]
    )

    if not has_manufacturer:
        no_manufacturer_products.append(product)

for i, p in enumerate(no_manufacturer_products[:20], 1):
    cat_name = categories.get(p.get("category_id"), {}).get("name", "Без категории")
    print(f"{i:2}. {p['name'][:70]:70} | {cat_name[:25]:25}")

print()
print(f"Всего товаров без упоминания производителя: {len(no_manufacturer_products)}")

print()
print("=" * 100)
print("💡 РЕКОМЕНДАЦИИ")
print("=" * 100)
print()
print("1. Товары с упоминанием производителя в названии:")
print(f"   → Переназначить manufacturer с UNIVERSAL на конкретного производителя")
print(f"   → Это {total_with_manufacturer} товаров")
print()
print("2. Товары без упоминания производителя:")
print(f"   → Оставить manufacturer=UNIVERSAL")
print(f"   → Это {len(no_manufacturer_products)} товаров")
print(f"   → Это действительно универсальные запчасти")
print()
print("3. Можно добавить дополнительные поля:")
print("   → compatible_with (список совместимых производителей)")
print("   → part_type (тип запчасти: фильтр, насос, подшипник и т.д.)")
print()
print("=" * 100)
