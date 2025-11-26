#!/usr/bin/env python3
"""
CSV ОТЧЁТ ПО UNIVERSAL ТОВАРАМ С КАТЕГОРИЗАЦИЕЙ
"""

import os
import csv
from supabase import create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(url, key)

print("📦 Загружаем UNIVERSAL товары...")
universal_products = []
offset = 0
limit = 1000

while True:
    batch = supabase.table("products")\
        .select("id, name, category_id, price, in_stock")\
        .eq("manufacturer", "UNIVERSAL")\
        .range(offset, offset + limit - 1)\
        .execute()

    if not batch.data:
        break

    universal_products.extend(batch.data)
    offset += limit

    if len(batch.data) < limit:
        break

print(f"✅ Найдено: {len(universal_products)}")

# Загружаем категории
categories_result = supabase.table("categories").select("id, name").execute()
categories = {cat["id"]: cat["name"] for cat in categories_result.data}

# Определяем типы
part_types_map = {
    "Вал": ["вал"],
    "Подшипник": ["подшипник"],
    "Сальник": ["сальник"],
    "Насос": ["насос"],
    "Прокладка": ["прокладка"],
    "Диск": ["диск"],
    "Ремень": ["ремень"],
    "Фильтр": ["фильтр"],
    "Шестерня": ["шестерня", "шестерн"],
    "Двигатель/ДВС": ["двигатель", "двс", "мотор"],
    "Форсунка": ["форсунка"],
    "Стартер": ["стартер"],
    "Генератор": ["генератор"],
    "Свеча": ["свеча"],
    "Гидрораспределитель": ["гидрораспределитель"],
    "Карданный вал": ["карданный", "кардан"],
    "Колесо/Шина": ["колес", "шина"],
    "Пресс-подборщик": ["пресс-подборщик"],
}

def detect_part_type(name):
    name_lower = name.lower()
    for part_type, keywords in part_types_map.items():
        if any(kw in name_lower for kw in keywords):
            return part_type
    return "Другое"

# Создаём CSV
csv_file = "universal-products-categorized.csv"
print(f"💾 Создаём {csv_file}...")

with open(csv_file, "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)

    writer.writerow([
        "ID",
        "Название",
        "Текущая категория",
        "Цена",
        "В наличии",
        "Тип запчасти (авто)",
        "Предлагаемое действие"
    ])

    # Сортируем по типу запчасти
    products_with_type = []
    for p in universal_products:
        part_type = detect_part_type(p["name"])
        products_with_type.append({**p, "part_type": part_type})

    products_with_type.sort(key=lambda x: x["part_type"])

    for p in products_with_type:
        cat_name = categories.get(p.get("category_id"), "Без категории")

        # Предлагаемое действие
        if p["part_type"] == "Другое":
            action = "Проверить вручную"
        else:
            action = f"Добавить в метаданные: part_type={p['part_type']}"

        writer.writerow([
            p["id"],
            p["name"],
            cat_name,
            p.get("price", 0),
            "ДА" if p.get("in_stock") else "НЕТ",
            p["part_type"],
            action
        ])

print(f"✅ CSV создан: {csv_file}")

# Статистика
print()
print("📊 СТАТИСТИКА ПО ТИПАМ:")
print("-" * 80)

type_counts = {}
for p in products_with_type:
    pt = p["part_type"]
    type_counts[pt] = type_counts.get(pt, 0) + 1

for part_type, count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True):
    print(f"{count:4} - {part_type}")

print()
print(f"✅ Отчёт готов: {csv_file}")
