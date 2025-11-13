#!/usr/bin/env python3
"""
Подсчитывает товары в категориях запчастей
"""

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


def main():
    print("\n" + "=" * 70)
    print("ПОДСЧЕТ ТОВАРОВ В КАТЕГОРИЯХ ЗАПЧАСТЕЙ")
    print("=" * 70 + "\n")

    # Получаем все категории запчастей (содержат дефис в slug, например: brand-type)
    categories = supabase.table("categories").select("*").execute().data

    # Фильтруем только категории запчастей (с дефисом в slug)
    parts_categories = [cat for cat in categories if "-" in cat["slug"]]

    total_products = 0
    by_brand = {}
    by_type = {}

    for category in parts_categories:
        slug = category["slug"]
        name = category.get("name", slug)

        # Считаем товары в категории
        result = (
            supabase.table("products")
            .select("*", count="exact", head=True)
            .eq("category_id", category["id"])
            .eq("in_stock", True)
            .execute()
        )

        count = result.count or 0

        if count > 0:
            print(f"  {name}: {count}")
            total_products += count

            # Группируем по брендам
            if slug.startswith("universal-"):
                brand = "Универсальные"
                part_type = slug.replace("universal-", "")
            else:
                parts = slug.split("-", 1)
                if len(parts) == 2:
                    brand = parts[0]
                    part_type = parts[1]
                else:
                    brand = "other"
                    part_type = slug

            by_brand[brand] = by_brand.get(brand, 0) + count
            by_type[part_type] = by_type.get(part_type, 0) + count

    print("\n" + "=" * 70)
    print("СТАТИСТИКА ПО БРЕНДАМ")
    print("=" * 70 + "\n")

    for brand, count in sorted(by_brand.items(), key=lambda x: x[1], reverse=True):
        print(f"  {brand}: {count} товаров")

    print("\n" + "=" * 70)
    print("СТАТИСТИКА ПО ТИПАМ ЗАПЧАСТЕЙ")
    print("=" * 70 + "\n")

    for part_type, count in sorted(by_type.items(), key=lambda x: x[1], reverse=True):
        print(f"  {part_type}: {count} товаров")

    print("\n" + "=" * 70)
    print(f"ВСЕГО ТОВАРОВ В ЗАПЧАСТЯХ: {total_products}")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    main()
