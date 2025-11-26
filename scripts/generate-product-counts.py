#!/usr/bin/env python3
"""
СИСТЕМА СЧЁТЧИКОВ ДЛЯ ВСЕГО САЙТА
Генерирует JSON с количеством товаров по всем категориям и производителям
"""

import os
import json
from supabase import create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("❌ ОШИБКА: Нет переменных окружения")
    exit(1)

supabase = create_client(url, key)

print("=" * 100)
print("📊 ГЕНЕРАЦИЯ СЧЁТЧИКОВ")
print("=" * 100)
print()

# Загружаем ВСЕ товары
print("📦 Загружаем все товары...")
all_products = []
offset = 0
limit = 1000

while True:
    batch = supabase.table("products")\
        .select("id, name, category_id, manufacturer, in_stock, price")\
        .range(offset, offset + limit - 1)\
        .execute()

    if not batch.data:
        break

    all_products.extend(batch.data)
    offset += limit

    if len(batch.data) < limit:
        break

    print(f"  Загружено: {len(all_products)}...")

print(f"✅ Всего товаров: {len(all_products)}")
print()

# Загружаем все категории
print("📁 Загружаем категории...")
categories_result = supabase.table("categories")\
    .select("id, name, slug")\
    .execute()

categories = {cat["id"]: cat for cat in categories_result.data}
print(f"✅ Всего категорий: {len(categories)}")
print()

# СЧЁТЧИКИ
counts = {
    "total": len(all_products),
    "in_stock": len([p for p in all_products if p.get("in_stock")]),
    "by_category": {},
    "by_manufacturer": {},
    "dongfeng_by_model": {}
}

# Считаем по категориям
print("📊 Считаем по категориям...")
for product in all_products:
    cat_id = product.get("category_id")
    in_stock = product.get("in_stock", False)

    if cat_id not in counts["by_category"]:
        cat_name = categories.get(cat_id, {}).get("name", f"Category {cat_id}")
        cat_slug = categories.get(cat_id, {}).get("slug", f"category-{cat_id}")
        counts["by_category"][cat_id] = {
            "name": cat_name,
            "slug": cat_slug,
            "total": 0,
            "in_stock": 0
        }

    counts["by_category"][cat_id]["total"] += 1
    if in_stock:
        counts["by_category"][cat_id]["in_stock"] += 1

print(f"✅ Категорий с товарами: {len(counts['by_category'])}")
print()

# Считаем по производителям
print("📊 Считаем по производителям...")
for product in all_products:
    manufacturer = product.get("manufacturer", "Unknown")
    in_stock = product.get("in_stock", False)

    if manufacturer not in counts["by_manufacturer"]:
        counts["by_manufacturer"][manufacturer] = {
            "total": 0,
            "in_stock": 0
        }

    counts["by_manufacturer"][manufacturer]["total"] += 1
    if in_stock:
        counts["by_manufacturer"][manufacturer]["in_stock"] += 1

print(f"✅ Производителей: {len(counts['by_manufacturer'])}")
print()

# Специальный счётчик для DongFeng по моделям
print("📊 Считаем DongFeng по моделям...")
dongfeng_products = [p for p in all_products if p.get("manufacturer") == "DongFeng"]

dongfeng_models = {
    "240-244": 0,
    "354-404": 0,
    "504": 0,
    "904": 0,
    "1304": 0,
    "general": 0
}

for p in dongfeng_products:
    if not p.get("in_stock"):
        continue

    name = p["name"].lower()

    if "240" in name or "244" in name:
        dongfeng_models["240-244"] += 1
    elif "354" in name or "404" in name:
        dongfeng_models["354-404"] += 1
    elif "504" in name:
        dongfeng_models["504"] += 1
    elif "904" in name:
        dongfeng_models["904"] += 1
    elif "1304" in name:
        dongfeng_models["1304"] += 1
    else:
        dongfeng_models["general"] += 1

counts["dongfeng_by_model"] = dongfeng_models

print(f"✅ DongFeng товаров: {sum(dongfeng_models.values())}")
print()

# Сохраняем в JSON
output_file = "product-counts.json"
print(f"💾 Сохраняем в {output_file}...")

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(counts, f, ensure_ascii=False, indent=2)

print(f"✅ Сохранено!")
print()

# Красивый вывод
print("=" * 100)
print("📊 ИТОГОВЫЕ СЧЁТЧИКИ")
print("=" * 100)
print()

print(f"📦 ВСЕГО ТОВАРОВ: {counts['total']}")
print(f"✅ В НАЛИЧИИ: {counts['in_stock']}")
print()

print("📁 ПО КАТЕГОРИЯМ (топ-10):")
print("-" * 100)
sorted_categories = sorted(
    counts["by_category"].items(),
    key=lambda x: x[1]["in_stock"],
    reverse=True
)

for i, (cat_id, cat_data) in enumerate(sorted_categories[:10], 1):
    print(f"{i:2}. {cat_data['name']:40} - {cat_data['in_stock']:4} в наличии (из {cat_data['total']})")

print()

print("🏭 ПО ПРОИЗВОДИТЕЛЯМ (топ-10):")
print("-" * 100)
sorted_manufacturers = sorted(
    counts["by_manufacturer"].items(),
    key=lambda x: x[1]["in_stock"],
    reverse=True
)

for i, (manufacturer, data) in enumerate(sorted_manufacturers[:10], 1):
    print(f"{i:2}. {manufacturer:40} - {data['in_stock']:4} в наличии (из {data['total']})")

print()

print("🚜 DONGFENG ПО МОДЕЛЯМ:")
print("-" * 100)
for model, count in dongfeng_models.items():
    print(f"  {model:15} - {count:4} товаров")

print()
print("=" * 100)
print("✅ ГОТОВО!")
print("=" * 100)
print()
print(f"📁 Файл: {output_file}")
print("💡 Используй эти счётчики на фронтенде!")
