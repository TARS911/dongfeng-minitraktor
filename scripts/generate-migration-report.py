#!/usr/bin/env python3
"""
Генерация полного отчета о миграции запчастей
"""

import os
from supabase import create_client
from collections import Counter, defaultdict
from datetime import datetime

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(url, key)

print("\n" + "=" * 100)
print("📋 ПОЛНЫЙ ОТЧЕТ О МИГРАЦИИ ЗАПЧАСТЕЙ")
print("=" * 100)
print(f"Дата: {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}")
print("Проект: БелТехФермЪ - Интернет-магазин минитракторов и запчастей")
print("=" * 100 + "\n")

# 1. ПРОВЕРКА КАТЕГОРИИ 'ЗАПЧАСТИ'
print('1️⃣  ПРОВЕРКА ОБЩЕЙ КАТЕГОРИИ "ЗАПЧАСТИ"')
print("-" * 100)

parts_cat = (
    supabase.table("products").select("*", count="exact").eq("category_id", 2).execute()
)
print(f'   Товаров в категории "Запчасти" (ID=2): {parts_cat.count}')

if parts_cat.count == 0:
    print("   ✅ УСПЕХ! Все товары мигрированы из общей категории\n")
else:
    print(f"   ⚠️  ВНИМАНИЕ! Осталось {parts_cat.count} товаров\n")

# 2. ОБЩАЯ СТАТИСТИКА
print("2️⃣  ОБЩАЯ СТАТИСТИКА БАЗЫ ДАННЫХ")
print("-" * 100)

all_products = []
offset = 0
while offset < 10000:
    batch = (
        supabase.table("products")
        .select("id, name, category_id, in_stock")
        .range(offset, offset + 999)
        .execute()
    )
    if not batch.data:
        break
    all_products.extend(batch.data)
    offset += 1000
    if len(batch.data) < 1000:
        break

total_products = len(all_products)
in_stock = sum(1 for p in all_products if p.get("in_stock"))

print(f"   Всего товаров в БД: {total_products}")
print(f"   В наличии: {in_stock} ({100 * in_stock / total_products:.1f}%)")
print(f"   Нет в наличии: {total_products - in_stock}\n")

# 3. РАСПРЕДЕЛЕНИЕ ПО КАТЕГОРИЯМ
print("3️⃣  РАСПРЕДЕЛЕНИЕ ПО КАТЕГОРИЯМ")
print("-" * 100)

cat_counts = Counter(p["category_id"] for p in all_products)
categories = supabase.table("categories").select("id, name, slug").execute()
cat_map = {cat["id"]: cat for cat in categories.data}

print(f"   Всего категорий в системе: {len(cat_map)}")
print(f"   Категорий с товарами: {len(cat_counts)}")
print(f"   Пустых категорий: {len(cat_map) - len(cat_counts)}\n")

print("   📊 ТОП 30 КАТЕГОРИЙ:\n")
print("   #    ID    Slug                                               Товаров")
print("   " + "-" * 90)

for i, (cat_id, count) in enumerate(cat_counts.most_common(30), 1):
    cat = cat_map.get(cat_id, {})
    slug = cat.get("slug", "unknown")

    if cat_id == 2:
        emoji = "⚠️"
    elif "universal" in slug:
        emoji = "🔧"
    elif "dongfeng" in slug or "km-engines" in slug:
        emoji = "🚜"
    else:
        emoji = "  "

    print(f"   {i:<4} {emoji}[{cat_id}]  {slug:<50} {count:>6}")

# 4. АНАЛИЗ ПО БРЕНДАМ
print("\n4️⃣  АНАЛИЗ ПО БРЕНДАМ")
print("-" * 100 + "\n")

brand_stats = defaultdict(int)
for p in all_products:
    cat_id = p["category_id"]
    cat = cat_map.get(cat_id, {})
    slug = cat.get("slug", "")

    if slug == "parts":
        brand = "parts"
    elif "-" in slug:
        brand = slug.split("-")[0]
    else:
        brand = slug

    brand_stats[brand] += 1

print("   Бренд                          Товаров    Процент    График")
print("   " + "-" * 80)

for brand, count in sorted(brand_stats.items(), key=lambda x: -x[1])[:20]:
    percent = (count / total_products) * 100
    bar = "█" * min(int(percent / 2), 30)
    print(f"   {brand:<30} {count:>8}    {percent:>5.1f}%    {bar}")

# 5. АНАЛИЗ ПО ТИПАМ
print("\n5️⃣  АНАЛИЗ ПО ТИПАМ ЗАПЧАСТЕЙ")
print("-" * 100 + "\n")

type_stats = defaultdict(int)
for p in all_products:
    cat_id = p["category_id"]
    cat = cat_map.get(cat_id, {})
    slug = cat.get("slug", "")

    if "-" in slug:
        parts = slug.split("-")
        ptype = "-".join(parts[1:]) if len(parts) > 1 else slug
    else:
        ptype = slug

    type_stats[ptype] += 1

print("   Тип                                        Товаров    Процент")
print("   " + "-" * 70)

for ptype, count in sorted(type_stats.items(), key=lambda x: -x[1])[:15]:
    percent = (count / total_products) * 100
    print(f"   {ptype:<45} {count:>8}    {percent:>5.1f}%")

# 6. КЛЮЧЕВЫЕ БРЕНДЫ
print("\n6️⃣  СТАТИСТИКА ПО КЛЮЧЕВЫМ БРЕНДАМ")
print("-" * 100 + "\n")

key_brands = {
    "km-engines": "🚜 KM Engines",
    "dongfeng": "🚜 DongFeng",
    "uralets": "🇷🇺 Уралец",
    "universal": "🔧 Universal",
}

for brand_key, brand_name in key_brands.items():
    brand_cats = [
        cat_id for cat_id, cat in cat_map.items() if brand_key in cat.get("slug", "")
    ]
    brand_total = sum(cat_counts.get(cat_id, 0) for cat_id in brand_cats)
    percent = (brand_total / total_products) * 100

    print(f"   {brand_name}")
    print(f"      Товаров: {brand_total} ({percent:.1f}%)")
    print(f"      Категорий: {len(brand_cats)}\n")

# 7. ФИНАЛЬНАЯ ОЦЕНКА
print("7️⃣  ФИНАЛЬНАЯ ОЦЕНКА МИГРАЦИИ")
print("-" * 100 + "\n")

success = []
warnings = []
issues = []

if parts_cat.count == 0:
    success.append("✅ Все товары мигрированы из общей категории")
else:
    issues.append(f'❌ Осталось {parts_cat.count} товаров в "Запчасти"')

if total_products >= 4000:
    success.append(f"✅ Достаточно товаров ({total_products})")

if len(cat_counts) >= 40:
    success.append(f"✅ Товары в {len(cat_counts)} категориях")

if in_stock / total_products > 0.9:
    success.append(f"✅ {100 * in_stock / total_products:.1f}% товаров в наличии")

if success:
    print("   УСПЕХИ:")
    for s in success:
        print(f"      {s}")
    print()

if not issues:
    print("   🎉 ОБЩАЯ ОЦЕНКА: ОТЛИЧНО (100%)")
    print("   📊 Миграция выполнена полностью успешно!\n")
else:
    print("   ⚠️  ОБЩАЯ ОЦЕНКА: ТРЕБУЕТСЯ ДОРАБОТКА\n")

# 8. РЕКОМЕНДАЦИИ
print("8️⃣  РЕКОМЕНДАЦИИ")
print("-" * 100 + "\n")

print("   💡 Следующие шаги:")
print("      1. Добавить индексы для category_id")
print("      2. Настроить фильтры на сайте")
print("      3. Добавить breadcrumbs навигацию")
print("      4. Настроить SEO для категорий\n")

# 9. ССЫЛКИ
print("9️⃣  ССЫЛКИ")
print("-" * 100 + "\n")

print("   🌐 Сайт: https://beltehferm.netlify.app/catalog")
print("   📂 GitHub: https://github.com/TARS911/dongfeng-minitraktor\n")

print("=" * 100)
print("📋 ОТЧЕТ ЗАВЕРШЕН")
print("=" * 100 + "\n")
print('='*100 + '\n')
