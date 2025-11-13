#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Экспорт всех товаров в Excel для анализа дубликатов
"""
import os
import sys
from dotenv import load_dotenv
from supabase import create_client
import pandas as pd

load_dotenv("../frontend/.env.local")

supabase = create_client(
    os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

print("Загрузка товаров из БД...")

# Получаем ВСЕ товары порциями
all_products = []
page_size = 1000
offset = 0

while True:
    response = supabase.table("products")\
        .select("id, name, slug, price, old_price, category_id, manufacturer, in_stock, created_at")\
        .range(offset, offset + page_size - 1)\
        .execute()
    
    if not response.data:
        break
    
    all_products.extend(response.data)
    offset += page_size
    print(f"  Загружено: {len(all_products)}")
    
    if len(response.data) < page_size:
        break

print(f"\nВсего товаров: {len(all_products)}")

# Создаём DataFrame
df = pd.DataFrame(all_products)

# Сортируем по названию для удобства поиска дубликатов
df = df.sort_values('name')

# Добавляем колонку с количеством дубликатов
df['duplicate_count'] = df.groupby('name')['name'].transform('count')

# Добавляем колонку "is_duplicate" (True если больше 1)
df['is_duplicate'] = df['duplicate_count'] > 1

# Сохраняем в Excel
output_file = "products_export.xlsx"
df.to_excel(output_file, index=False, sheet_name="Товары")

print(f"\n✅ Экспортировано в: {output_file}")
print(f"📊 Товаров всего: {len(df)}")
print(f"🔄 С дубликатами: {df['is_duplicate'].sum()}")
print(f"📝 Уникальных названий с дубликатами: {len(df[df['is_duplicate']]['name'].unique())}")

# Создаём отдельный лист только с дубликатами
duplicates_df = df[df['is_duplicate']].sort_values(['name', 'created_at'])

with pd.ExcelWriter(output_file, engine='openpyxl', mode='a') as writer:
    duplicates_df.to_excel(writer, sheet_name="Только дубликаты", index=False)

print(f"\n💡 Откройте файл {output_file} для анализа")
print("   Лист 'Только дубликаты' содержит все повторяющиеся товары")
