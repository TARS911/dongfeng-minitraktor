#!/usr/bin/env python3
"""
Перемещает товары с определенным брендом из универсальных категорий
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

BRAND_KEYWORDS = {
    "dongfeng-parts": ["dongfeng", "донгфенг", "донфенг", "dong feng", "df", "дф-"],
    "jinma": ["jinma", "джинма", "цзинма", "jm"],
    "xingtai": ["xingtai", "синтай", "синьтай", "xt"],
    "foton": ["foton", "фотон", "lovol", "ловол", "ft"],
    "shifeng": ["shifeng", "шифенг", "sf"],
    "yto": ["yto", "ито"],
    "fayter": ["файтер", "fayter", "fighter"],
}

PART_TYPE_FROM_SLUG = {
    "filters": "filters",
    "diesel-engines": "diesel-engines",
    "starters-generators": "starters-generators",
    "universal-parts": "universal-parts",
    "seats": "seats",
    "spare-parts-kit": "spare-parts-kit",
    "equipment-parts": "equipment-parts",
    "tractor-parts": "tractor-parts",
    "wheels-tires": "wheels-tires",
    "standard-parts": "standard-parts",
    "hydraulics": "hydraulics",
    "driveshafts": "driveshafts",
    "other-parts": "other-parts",
}


def detect_brand_from_name(name):
    name_lower = name.lower()
    for brand_slug, keywords in BRAND_KEYWORDS.items():
        for keyword in keywords:
            if keyword.lower() in name_lower:
                return brand_slug
    return None


def get_part_type_from_category_slug(category_slug):
    for part_type_slug in PART_TYPE_FROM_SLUG.keys():
        if part_type_slug in category_slug:
            return part_type_slug
    return None


def main():
    print("🔄 Перемещение товаров с определенным брендом...\n")

    # Получаем все категории
    all_categories = supabase.table("categories").select("*").execute().data
    category_map = {cat["slug"]: cat["id"] for cat in all_categories}

    # Получаем универсальные категории
    universal_categories = (
        supabase.table("categories").select("*").like("slug", "universal-%").execute()
    ).data

    moved = 0
    skipped = 0

    for univ_category in universal_categories:
        category_id = univ_category["id"]
        category_slug = univ_category["slug"]

        part_type = get_part_type_from_category_slug(category_slug)
        if not part_type:
            continue

        # Получаем товары
        products = (
            supabase.table("products")
            .select("id, name, category_id")
            .eq("category_id", category_id)
            .execute()
        ).data

        for product in products:
            brand = detect_brand_from_name(product["name"])

            if not brand:
                skipped += 1
                continue

            new_category_slug = f"{brand}-{part_type}"

            if new_category_slug not in category_map:
                print(f"⚠️  Категория не найдена: {new_category_slug}")
                skipped += 1
                continue

            new_category_id = category_map[new_category_slug]

            try:
                supabase.table("products").update({"category_id": new_category_id}).eq(
                    "id", product["id"]
                ).execute()

                moved += 1
                print(f"✅ {product['name'][:60]}... -> {brand}")

            except Exception as e:
                print(f"❌ Ошибка: {e}")
                skipped += 1

    print(f"\n{'=' * 60}")
    print(f"✅ Перемещено: {moved}")
    print(f"⚠️  Пропущено: {skipped}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
