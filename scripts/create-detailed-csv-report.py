#!/usr/bin/env python3
"""
ДЕТАЛЬНЫЙ CSV ОТЧЁТ ПО ВСЕМ ТОВАРАМ
"""

import os
import csv
from supabase import create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("❌ ОШИБКА: Нет переменных окружения")
    exit(1)

supabase = create_client(url, key)

print("=" * 100)
print("📊 СОЗДАНИЕ ДЕТАЛЬНОГО CSV ОТЧЁТА")
print("=" * 100)
print()

# Загружаем ВСЕ товары
print("📦 Загружаем все товары...")
all_products = []
offset = 0
limit = 1000

while True:
    batch = supabase.table("products")\
        .select("id, name, slug, price, category_id, manufacturer, in_stock, image_url, created_at")\
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

# Загружаем категории
print("📁 Загружаем категории...")
categories_result = supabase.table("categories")\
    .select("id, name, slug")\
    .execute()

categories = {cat["id"]: cat for cat in categories_result.data}
print(f"✅ Всего категорий: {len(categories)}")
print()

# Создаём CSV
csv_file = "products-full-report.csv"
print(f"💾 Создаём {csv_file}...")

with open(csv_file, "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)

    # Заголовок
    writer.writerow([
        "ID",
        "Название",
        "Slug",
        "Цена",
        "Category ID",
        "Категория",
        "Производитель",
        "В наличии",
        "Есть фото",
        "Дата создания"
    ])

    # Сортируем по category_id, потом по manufacturer
    all_products.sort(key=lambda x: (
        x.get("category_id") or 0,
        x.get("manufacturer", ""),
        x.get("name", "")
    ))

    # Записываем все товары
    for p in all_products:
        cat_id = p.get("category_id")
        cat_name = categories.get(cat_id, {}).get("name", "Без категории") if cat_id else "Без категории"

        writer.writerow([
            p["id"],
            p["name"],
            p.get("slug", "НЕТ"),
            p.get("price", 0),
            cat_id or "НЕТ",
            cat_name,
            p.get("manufacturer", "НЕТ"),
            "ДА" if p.get("in_stock") else "НЕТ",
            "ДА" if p.get("image_url") else "НЕТ",
            p.get("created_at", "НЕТ")
        ])

print(f"✅ CSV создан!")
print()

# Статистика
print("=" * 100)
print("📊 СТАТИСТИКА")
print("=" * 100)
print()

total = len(all_products)
in_stock = len([p for p in all_products if p.get("in_stock")])
with_image = len([p for p in all_products if p.get("image_url")])
with_category = len([p for p in all_products if p.get("category_id")])

print(f"📦 Всего товаров: {total}")
print(f"✅ В наличии: {in_stock} ({in_stock * 100 // total}%)")
print(f"📷 С фото: {with_image} ({with_image * 100 // total}%)")
print(f"📁 С категорией: {with_category} ({with_category * 100 // total}%)")
print()

print("=" * 100)
print("✅ ГОТОВО!")
print("=" * 100)
print()
print(f"📁 Файл: {csv_file}")
print("📊 Открой в Excel/LibreOffice для анализа!")
