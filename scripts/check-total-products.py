#!/usr/bin/env python3
import os

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Проверяем общее количество товаров
all_products = supabase.table("products").select("id", count="exact").execute()
print(f"📊 ВСЕГО товаров в БД: {all_products.count}")

# Проверяем Universal
categories = (
    supabase.table("categories")
    .select("id, slug")
    .like("slug", "universal-%")
    .execute()
)
universal_cat_ids = [cat["id"] for cat in categories.data]

universal_count = (
    supabase.table("products")
    .select("id", count="exact")
    .in_("category_id", universal_cat_ids)
    .execute()
)
print(f"📦 Товаров в Universal: {universal_count.count}")

# Проверяем новые категории
new_cats = (
    supabase.table("categories")
    .select("id, name, slug")
    .or_("slug.like.s1100-%,slug.like.zs-%,slug.like.r180-%,slug.like.s195-%")
    .execute()
)
print(f"\n🇨🇳 Новые категории ({len(new_cats.data)}):")
for cat in new_cats.data:
    count = (
        supabase.table("products")
        .select("id", count="exact")
        .eq("category_id", cat["id"])
        .execute()
    )
    print(f"  {cat['name']:45s} {count.count:4d} товаров")
