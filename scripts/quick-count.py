#!/usr/bin/env python3
import os

from supabase import create_client


def load_env():
    env_path = os.path.join(os.path.dirname(__file__), "..", "frontend", ".env.local")
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    os.environ[key] = value


load_env()
supabase = create_client(
    os.getenv("NEXT_PUBLIC_SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

# Получаем все категории с дефисом (это категории запчастей)
categories = supabase.table("categories").select("id, slug").execute().data
parts_cat_ids = [c["id"] for c in categories if "-" in c["slug"]]

# Считаем товары
result = (
    supabase.table("products")
    .select("*", count="exact", head=True)
    .in_("category_id", parts_cat_ids)
    .eq("in_stock", True)
    .execute()
)

print(f"\n{'=' * 60}")
print(f"ВСЕГО ТОВАРОВ В ЗАПЧАСТЯХ: {result.count}")
print(f"{'=' * 60}\n")
