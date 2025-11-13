#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Импорт товаров в БД"""

import json
import os
import re
import sys

from dotenv import load_dotenv
from supabase import create_client

load_dotenv("../frontend/.env.local")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv(
    "SUPABASE_SERVICE_ROLE_KEY"
)  # Используем service role для импорта
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

INPUT_FILE = "parsed_data/agrodom/parts-bs4-unique.json"
PARTS_CATEGORY_ID = 2


def create_slug(name):
    import hashlib
    import time

    slug = name.lower()
    slug = slug.replace(" ", "-")
    slug = re.sub(r"[^a-z0-9-]", "", slug)
    # Добавляем hash + timestamp для уникальности
    unique_str = f"{name}{time.time()}"
    hash_suffix = hashlib.md5(unique_str.encode()).hexdigest()[:8]
    slug = f"{slug[:85]}-{hash_suffix}" if slug else f"product-{hash_suffix}"
    return slug[:100]


def parse_price(price_str):
    if not price_str:
        return 0
    cleaned = re.sub(r"[^\d.]", "", price_str)
    try:
        return float(cleaned)
    except:
        return 0


def main():
    print("\n" + "=" * 70)
    print("ИМПОРТ ТОВАРОВ")
    print("=" * 70 + "\n")

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        products = json.load(f)

    print(f"📦 Загружено: {len(products)}")

    existing = supabase.table("products").select("name").execute()
    existing_names = {p["name"].lower().strip() for p in existing.data}
    print(f"📊 В БД: {len(existing_names)}")

    new_products = []
    for p in products:
        name = p.get("name", "").strip()
        if name and name.lower() not in existing_names:
            new_products.append(p)

    print(f"✨ Новых: {len(new_products)}\n")

    if not new_products:
        print("✅ Все уже в базе!")
        return

    imported = 0
    errors = 0
    BATCH = 50

    for i in range(0, len(new_products), BATCH):
        batch = new_products[i : i + BATCH]
        batch_data = []

        for p in batch:
            name = p.get("name", "").strip()
            if not name:
                continue

            price = parse_price(p.get("price", ""))
            slug = create_slug(name)

            batch_data.append(
                {
                    "name": name,
                    "slug": slug,
                    "category_id": PARTS_CATEGORY_ID,
                    "price": price,
                    "in_stock": price > 0,
                    "image_url": p.get("image_url", ""),
                    "description": f"Запчасть. Категория: {p.get('category', '')}",
                    "manufacturer": "universal",
                    "specifications": {"source": p.get("link", "")},
                }
            )

        try:
            supabase.table("products").insert(batch_data).execute()
            imported += len(batch_data)
            print(f"✅ {imported}/{len(new_products)}")
        except Exception as e:
            errors += len(batch_data)
            print(f"❌ Ошибка: {e}")

    print("\n" + "=" * 70)
    print(f"✅ Импортировано: {imported}")
    print(f"❌ Ошибок: {errors}")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    main()
