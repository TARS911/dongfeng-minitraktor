#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Удаление дубликатов товаров
Оставляет самый старый товар по каждому названию, удаляет остальные
"""
import os
import sys
from dotenv import load_dotenv
from supabase import create_client
from collections import defaultdict

load_dotenv("../frontend/.env.local")

supabase = create_client(
    os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

print("=" * 70)
print("УДАЛЕНИЕ ДУБЛИКАТОВ ТОВАРОВ")
print("=" * 70)

# Загружаем все товары
print("\n1. Загрузка товаров из БД...")
all_products = []
page_size = 1000
offset = 0

while True:
    response = supabase.table("products")\
        .select("id, name, created_at")\
        .range(offset, offset + page_size - 1)\
        .order("created_at")\
        .execute()
    
    if not response.data:
        break
    
    all_products.extend(response.data)
    offset += page_size
    print(f"   Загружено: {len(all_products)}")
    
    if len(response.data) < page_size:
        break

print(f"\n   Всего товаров: {len(all_products)}")

# Группируем по названию
print("\n2. Поиск дубликатов...")
products_by_name = defaultdict(list)

for product in all_products:
    products_by_name[product['name']].append(product)

# Находим дубликаты
duplicates_to_delete = []

for name, products in products_by_name.items():
    if len(products) > 1:
        # Сортируем по дате создания, оставляем самый старый
        products_sorted = sorted(products, key=lambda x: x['created_at'])
        # Все кроме первого (самого старого) - удаляем
        duplicates_to_delete.extend([p['id'] for p in products_sorted[1:]])

print(f"   Найдено дубликатов для удаления: {len(duplicates_to_delete)}")
print(f"   Уникальных названий с дубликатами: {sum(1 for products in products_by_name.values() if len(products) > 1)}")

if not duplicates_to_delete:
    print("\n✅ Дубликатов не найдено!")
    sys.exit(0)

# Подтверждение
print(f"\n⚠️  ВНИМАНИЕ: будет удалено {len(duplicates_to_delete)} товаров")
print(f"   Останется: {len(all_products) - len(duplicates_to_delete)} товаров")

response = input("\nПродолжить? (yes/no): ")
if response.lower() != 'yes':
    print("Отменено")
    sys.exit(0)

# Удаляем дубликаты пакетами
print("\n3. Удаление дубликатов...")
BATCH_SIZE = 100
deleted_count = 0

for i in range(0, len(duplicates_to_delete), BATCH_SIZE):
    batch = duplicates_to_delete[i:i + BATCH_SIZE]
    
    try:
        for product_id in batch:
            supabase.table("products").delete().eq("id", product_id).execute()
            deleted_count += 1
        
        if deleted_count % 500 == 0:
            print(f"   Удалено: {deleted_count}/{len(duplicates_to_delete)}")
    except Exception as e:
        print(f"   Ошибка при удалении: {e}")

print(f"\n✅ Удалено: {deleted_count} дубликатов")

# Проверяем результат
final_count = supabase.table("products").select("id", count="exact").execute()
print(f"✅ Осталось товаров: {final_count.count}")

print("\n" + "=" * 70)
print("ГОТОВО!")
print("=" * 70)
