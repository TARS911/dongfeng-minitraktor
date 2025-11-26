#!/usr/bin/env python3
"""
Статистика по категориям
"""

import os
from supabase import Client, create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

print("=" * 80)
print("📊 СТАТИСТИКА ПО КАТЕГОРИЯМ")
print("=" * 80 + "\n")

# Получаем все категории
categories = supabase.table("categories").select("id, slug, name").execute()

stats = []

for cat in categories.data:
    # Считаем товары в категории
    count = supabase.table("products") \
        .select("id", count="exact") \
        .eq("category_id", cat["id"]) \
        .execute()
    
    if count.count and count.count > 0:
        stats.append({
            "id": cat["id"],
            "slug": cat["slug"],
            "name": cat["name"],
            "count": count.count
        })

# Сортируем по количеству
stats.sort(key=lambda x: -x["count"])

print(f"📦 Категории с товарами (топ-20):\n")

for i, stat in enumerate(stats[:20], 1):
    print(f"{i:2}. {stat['slug']:45} {stat['count']:>6} товаров (ID: {stat['id']})")

print("\n" + "=" * 80)
print(f"📊 Всего категорий с товарами: {len(stats)}")
print(f"📊 Всего товаров в БД: {sum(s['count'] for s in stats)}")
print("=" * 80)
