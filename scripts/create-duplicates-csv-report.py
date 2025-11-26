#!/usr/bin/env python3
"""
СОЗДАТЬ CSV ОТЧЁТ О ДУБЛЯХ ДЛЯ РУЧНОЙ ПРОВЕРКИ
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
print("📊 СОЗДАНИЕ CSV ОТЧЁТА О ДУБЛЯХ")
print("=" * 100)
print()

print("Загружаем все товары...")

# Загружаем ВСЕ товары
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

# Находим дубликаты по name
print("Ищем дубликаты...")

names = {}
for p in all_products:
    name = p["name"]
    if name not in names:
        names[name] = []
    names[name].append(p)

duplicates = {name: products for name, products in names.items() if len(products) > 1}

print(f"✅ Найдено групп дубликатов: {len(duplicates)}")

# Подсчитываем общее количество дублей
total_duplicates = sum(len(products) for products in duplicates.values())
print(f"✅ Всего товаров-дублей: {total_duplicates}")
print()

# Создаём CSV отчёт
csv_file = "duplicates-report.csv"

print(f"📝 Создаём CSV отчёт: {csv_file}")

with open(csv_file, "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)

    # Заголовок
    writer.writerow([
        "Группа",
        "Название товара",
        "ID",
        "Slug",
        "Цена",
        "Category ID",
        "Manufacturer",
        "В наличии",
        "Дата создания",
        "ОСТАВИТЬ?",
        "Комментарий"
    ])

    # Сортируем дубликаты по количеству (больше → меньше)
    sorted_duplicates = sorted(duplicates.items(), key=lambda x: len(x[1]), reverse=True)

    group_num = 0

    for name, products in sorted_duplicates:
        group_num += 1

        # Сортируем по ID (минимальный первый)
        products.sort(key=lambda x: x["id"])

        for i, p in enumerate(products):
            # Первый товар (минимальный ID) - оставляем
            keep = "✅ ДА" if i == 0 else "❌ НЕТ"
            comment = "Самый старый (min ID)" if i == 0 else f"Дубль #{i}"

            writer.writerow([
                f"Группа {group_num}",
                p["name"],
                p["id"],
                p.get("slug", "НЕТ"),
                p.get("price", 0),
                p.get("category_id", "НЕТ"),
                p.get("manufacturer", "НЕТ"),
                "ДА" if p.get("in_stock") else "НЕТ",
                p.get("created_at", "НЕТ"),
                keep,
                comment
            ])

        # Пустая строка между группами
        writer.writerow([])

print(f"✅ CSV отчёт создан: {csv_file}")
print()

# Статистика
print("📊 СТАТИСТИКА:")
print("-" * 100)
print(f"Всего товаров в БД: {len(all_products)}")
print(f"Групп дубликатов: {len(duplicates)}")
print(f"Товаров-дублей: {total_duplicates}")
print(f"Уникальных товаров: {len(all_products) - total_duplicates + len(duplicates)}")
print()

# Топ-10 групп с наибольшим количеством дублей
print("🏆 ТОП-10 ГРУПП С НАИБОЛЬШИМ КОЛИЧЕСТВОМ ДУБЛЕЙ:")
print("-" * 100)

for i, (name, products) in enumerate(sorted_duplicates[:10], 1):
    print(f"{i}. '{name}' - {len(products)} копий")

print()
print("=" * 100)
print("✅ ГОТОВО!")
print("=" * 100)
print()
print(f"📁 Открой файл: {csv_file}")
print("🔍 Проверь дубли вручную!")
print("💡 Колонка 'ОСТАВИТЬ?' показывает какой товар будет оставлен (с минимальным ID)")
