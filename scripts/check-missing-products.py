#!/usr/bin/env python3
import os

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Общее количество
total = supabase.table("products").select("id", count="exact").execute()

print("=" * 80)
print("📊 АНАЛИЗ: БД vs AGRODOM")
print("=" * 80)
print(f"\n{'Всего товаров в БД:':30s} {total.count:5d}")
print(f"{'На сайте Agrodom:':30s}  4017")
print(f"{'НЕ ХВАТАЕТ:':30s} {4017 - total.count:5d} товаров")
print()

# Проверяем структуру товаров
sample = supabase.table("products").select("*").limit(1).execute()
if sample.data:
    fields = list(sample.data[0].keys())
    print(f"Поля в таблице products: {', '.join(fields[:8])}...")
print()

print("=" * 80)
print("📦 РАСПРЕДЕЛЕНИЕ ПО КАТЕГОРИЯМ (TOP-15):")
print("=" * 80)

categories = supabase.table("categories").select("id, name, slug").execute()
cat_counts = []

for cat in categories.data:
    count = (
        supabase.table("products")
        .select("id", count="exact")
        .eq("category_id", cat["id"])
        .execute()
    )
    if count.count > 0:
        cat_counts.append((cat["name"], cat["slug"], count.count))

cat_counts.sort(key=lambda x: -x[2])

for name, slug, count in cat_counts[:15]:
    print(f"  {name[:45]:45s} {count:5d}")

print()
print("=" * 80)
print("🔍 ВЫВОД:")
print("=" * 80)
print(f"Нужно допарсить и добавить: {4017 - total.count} товаров с Agrodom")
print("=" * 80)
