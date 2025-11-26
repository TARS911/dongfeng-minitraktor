#!/usr/bin/env python3
"""
Исправляет slug товаров начинающихся с 'неизвестно-'
Заменяет на manufacturer + остальная часть slug
"""

import os

from supabase import create_client

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

# Получаем все товары с 'неизвестно-' в начале slug
response = (
    supabase.table("products")
    .select("id,slug,manufacturer,name")
    .like("slug", "неизвестно-%")
    .execute()
)

print(f"Найдено {len(response.data)} товаров с 'неизвестно-' в slug")
print()

fixed_count = 0
errors = []

for product in response.data:
    old_slug = product["slug"]
    manufacturer = product.get("manufacturer", "unknown")

    # Убираем 'неизвестно-' из начала
    new_slug_part = old_slug.replace("неизвестно-", "", 1)

    # Создаем новый slug: manufacturer-остальное
    if manufacturer and manufacturer.lower() != "неизвестно":
        new_slug = f"{manufacturer.lower()}-{new_slug_part}"
    else:
        new_slug = f"unknown-{new_slug_part}"

    # Обновляем в базе
    try:
        supabase.table("products").update({"slug": new_slug}).eq(
            "id", product["id"]
        ).execute()
        print(f"✓ ID {product['id']}: {old_slug[:50]} → {new_slug[:50]}")
        fixed_count += 1
    except Exception as e:
        error_msg = f"✗ ID {product['id']}: {str(e)}"
        print(error_msg)
        errors.append(error_msg)

print()
print(f"Исправлено: {fixed_count}")
print(f"Ошибок: {len(errors)}")

if errors:
    print("\nОшибки:")
    for err in errors[:10]:
        print(f"  {err}")
