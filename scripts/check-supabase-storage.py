#!/usr/bin/env python3
"""
Проверка и создание Storage bucket в Supabase
"""

import json
import os
import sys

import requests
SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL", "https://dpsykseeqloturowdyzf.supabase.co"
)
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_KEY:
    print("❌ SUPABASE_SERVICE_ROLE_KEY not set")
    sys.exit(1)

print("=" * 70)
print("ПРОВЕРКА SUPABASE STORAGE")
print("=" * 70)

# Проверяем существующие buckets
print("\n📦 Проверка существующих buckets...")
url = f"{SUPABASE_URL}/storage/v1/bucket"
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
}

response = requests.get(url, headers=headers)

if response.status_code == 200:
    buckets = response.json()
    print(f"✅ Найдено buckets: {len(buckets)}")
    for bucket in buckets:
        print(f"  - {bucket['name']} (public: {bucket.get('public', False)})")
else:
    print(f"❌ Ошибка: {response.text}")
    sys.exit(1)

# Создаем bucket "products" если его нет
bucket_names = [b["name"] for b in buckets]

if "products" not in bucket_names:
    print("\n📦 Создание bucket 'products'...")
    create_url = f"{SUPABASE_URL}/storage/v1/bucket"
    data = {
        "name": "products",
        "public": True,
        "file_size_limit": 5242880,  # 5MB
        "allowed_mime_types": ["image/jpeg", "image/png", "image/webp"],
        "allowed_mime_types": ["image/jpeg", "image/png", "image/webp"]
    }

    response = requests.post(create_url, headers=headers, json=data)

    if response.status_code in [200, 201]:
        print("✅ Bucket 'products' создан успешно!")
    else:
        print(f"❌ Ошибка создания bucket: {response.text}")
else:
    print("\n✅ Bucket 'products' уже существует")

print("\n" + "=" * 70)
print("✅ ГОТОВО!")
print("=" * 70)
