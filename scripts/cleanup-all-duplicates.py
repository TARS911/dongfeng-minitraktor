#!/usr/bin/env python3
"""Удаление ВСЕХ дубликатов за один раз"""
import os
from dotenv import load_dotenv
from supabase import create_client
from collections import defaultdict

load_dotenv("../frontend/.env.local")
supabase = create_client(os.getenv("NEXT_PUBLIC_SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

print("Загрузка всех товаров...")
all_products = []
offset = 0
while True:
    r = supabase.table("products").select("id, name").range(offset, offset+999).order("id").execute()
    if not r.data:
        break
    all_products.extend(r.data)
    offset += 1000
    print(f"  {len(all_products)}")
    if len(r.data) < 1000:
        break

print(f"Всего: {len(all_products)}")

# Группируем по имени
by_name = defaultdict(list)
for p in all_products:
    by_name[p['name']].append(p['id'])

# Находим все дубликаты
to_delete = []
for name, ids in by_name.items():
    if len(ids) > 1:
        # Оставляем первый (с минимальным id), удаляем остальные
        to_delete.extend(sorted(ids)[1:])

print(f"К удалению: {len(to_delete)}")

# Удаляем
deleted = 0
for pid in to_delete:
    try:
        supabase.table("products").delete().eq("id", pid).execute()
        deleted += 1
        if deleted % 100 == 0:
            print(f"  {deleted}/{len(to_delete)}")
    except:
        pass

print(f"Удалено: {deleted}")

# Проверяем
final = supabase.table("products").select("id", count="exact").execute()
print(f"Осталось: {final.count}")
