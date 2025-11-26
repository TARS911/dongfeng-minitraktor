#!/usr/bin/env python3
"""
УДАЛЕНИЕ ВСЕХ ДУБЛИКАТОВ ИЗ БД
ОСТАВЛЯЕМ ТОЛЬКО 1 КОПИЮ (с минимальным ID)
"""

import os
from supabase import create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("❌ ОШИБКА: Нет переменных окружения")
    exit(1)

supabase = create_client(url, key)

print("=" * 100)
print("🗑️  УДАЛЕНИЕ ДУБЛИКАТОВ")
print("=" * 100)
print()

print("📊 ШАГ 1: Загрузка всех товаров...")

# Загружаем ВСЕ товары
all_products = []
offset = 0
limit = 1000

while True:
    batch = supabase.table("products")\
        .select("id, name")\
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

# Находим дубликаты
print("📊 ШАГ 2: Поиск дубликатов...")

names = {}
for p in all_products:
    name = p["name"]
    if name not in names:
        names[name] = []
    names[name].append(p)

duplicates = {name: products for name, products in names.items() if len(products) > 1}

print(f"✅ Найдено дубликатов: {len(duplicates)}")
print()

# Собираем ID для удаления
print("📊 ШАГ 3: Подготовка списка для удаления...")

ids_to_delete = []

for name, products in duplicates.items():
    # Сортируем по ID
    products.sort(key=lambda x: x["id"])

    # ОСТАВЛЯЕМ первый (минимальный ID), удаляем остальные
    for p in products[1:]:
        ids_to_delete.append(p["id"])

print(f"✅ Будет удалено: {len(ids_to_delete)} товаров")
print()

# УДАЛЯЕМ батчами по 100
print("📊 ШАГ 4: УДАЛЕНИЕ...")
print("-" * 100)

deleted = 0
batch_size = 100

for i in range(0, len(ids_to_delete), batch_size):
    batch = ids_to_delete[i:i + batch_size]

    # УДАЛЯЕМ
    result = supabase.table("products").delete().in_("id", batch).execute()

    deleted += len(batch)
    print(f"  Удалено: {deleted}/{len(ids_to_delete)} ({deleted * 100 // len(ids_to_delete)}%)")

print()
print("=" * 100)
print("✅ УДАЛЕНИЕ ЗАВЕРШЕНО!")
print("=" * 100)
print()

# Финальная проверка
print("📊 ФИНАЛЬНАЯ ПРОВЕРКА:")
print("-" * 100)

final_count = supabase.table("products").select("id", count="exact").execute()
print(f"Было товаров: {len(all_products)}")
print(f"Удалено: {deleted}")
print(f"Осталось: {final_count.count}")
print()

# Проверяем что дубликатов больше нет
print("Проверяем дубликаты...")

all_products_after = []
offset = 0

while True:
    batch = supabase.table("products")\
        .select("id, name")\
        .range(offset, offset + limit - 1)\
        .execute()

    if not batch.data:
        break

    all_products_after.extend(batch.data)
    offset += limit

    if len(batch.data) < limit:
        break

names_after = {}
for p in all_products_after:
    name = p["name"]
    names_after[name] = names_after.get(name, 0) + 1

duplicates_after = {name: count for name, count in names_after.items() if count > 1}

if duplicates_after:
    print(f"⚠️  ЕЩЁ ОСТАЛИСЬ ДУБЛИКАТЫ: {len(duplicates_after)}")
else:
    print(f"✅ ДУБЛИКАТОВ НЕТ! БД ЧИСТАЯ!")

print()
print("=" * 100)
print("🎉 ГОТОВО!")
print("=" * 100)
