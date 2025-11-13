#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
БЫСТРОЕ удаление дубликатов через SQL
"""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv("../frontend/.env.local")
supabase = create_client(
    os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

print("БЫСТРОЕ УДАЛЕНИЕ ДУБЛИКАТОВ")
print("=" * 70)

# Проверяем текущее количество
before = supabase.table("products").select("id", count="exact").execute()
print(f"До удаления: {before.count} товаров")

# Используем SQL для удаления дубликатов
# Оставляем только товар с минимальным id для каждого названия
sql_query = """
DELETE FROM products
WHERE id NOT IN (
    SELECT MIN(id)
    FROM products
    GROUP BY name
)
"""

print("\nУдаление дубликатов...")
try:
    # Выполняем через RPC если есть, или через прямой запрос
    result = supabase.rpc('exec_sql', {'query': sql_query}).execute()
    print("✅ Дубликаты удалены")
except Exception as e:
    print(f"Ошибка SQL: {e}")
    print("\nИспользую альтернативный метод...")
    
    # Альтернативный способ - через Python
    all_products = []
    offset = 0
    while True:
        response = supabase.table("products").select("id, name").range(offset, offset + 999).execute()
        if not response.data:
            break
        all_products.extend(response.data)
        offset += 1000
        if len(response.data) < 1000:
            break
    
    from collections import defaultdict
    by_name = defaultdict(list)
    for p in all_products:
        by_name[p['name']].append(p['id'])
    
    to_delete = []
    for name, ids in by_name.items():
        if len(ids) > 1:
            to_delete.extend(sorted(ids)[1:])
    
    print(f"Найдено для удаления: {len(to_delete)}")
    
    deleted = 0
    for i in range(0, len(to_delete), 100):
        batch = to_delete[i:i+100]
        for pid in batch:
            supabase.table("products").delete().eq("id", pid).execute()
            deleted += 1
        if deleted % 500 == 0:
            print(f"  Удалено: {deleted}/{len(to_delete)}")
    
    print(f"✅ Удалено: {deleted}")

# Проверяем результат
after = supabase.table("products").select("id", count="exact").execute()
print(f"\nПосле удаления: {after.count} товаров")
print(f"Удалено: {before.count - after.count} дубликатов")
print("=" * 70)
