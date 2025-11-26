#!/usr/bin/env python3
"""
Скачивает внешние картинки и загружает в Supabase Storage
"""

import hashlib
import os
import time
from pathlib import Path

import requests
from supabase import create_client

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

# Создаем папку для временного хранения
TEMP_DIR = Path("temp_images")
TEMP_DIR.mkdir(exist_ok=True)

BUCKET_NAME = "product-images"

print("🖼️ Скачивание и загрузка картинок в Supabase Storage")
print("=" * 60)

# Получаем товары с внешними картинками
print("\n📦 Загружаем товары с внешними картинками...")
products = (
    supabase.table("products")
    .select("id,name,image_url")
    .or_("image_url.ilike.%zip-agro%,image_url.ilike.%tata-agro%")
    .execute()
)

print(f"✓ Найдено {len(products.data)} товаров")
print(f"\n🚀 Начинаем обработку...\n")

success_count = 0
error_count = 0
skip_count = 0

for i, product in enumerate(products.data, 1):
    product_id = product["id"]
    old_url = product["image_url"]

    if not old_url or old_url.startswith("http") == False:
        skip_count += 1
        continue

    try:
        # Скачиваем картинку
        response = requests.get(
            old_url,
            timeout=10,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
        )

        if response.status_code != 200:
            print(f"  ❌ ID {product_id}: HTTP {response.status_code}")
            error_count += 1
            continue

        # Определяем расширение
        content_type = response.headers.get("Content-Type", "")
        if "jpeg" in content_type or "jpg" in content_type:
            ext = "jpg"
        elif "png" in content_type:
            ext = "png"
        elif "webp" in content_type:
            ext = "webp"
        else:
            ext = old_url.split(".")[-1].split("?")[0].lower()
            if ext not in ["jpg", "jpeg", "png", "webp", "gif"]:
                ext = "jpg"

        # Создаем уникальное имя файла
        filename = f"{product_id}.{ext}"
        file_path = TEMP_DIR / filename

        # Сохраняем временно
        with open(file_path, "wb") as f:
            f.write(response.content)

        # Загружаем в Supabase Storage
        with open(file_path, "rb") as f:
            storage_path = f"products/{filename}"
            supabase.storage.from_(BUCKET_NAME).upload(
                storage_path, f.read(), file_options={"content-type": f"image/{ext}"}
            )

        # Получаем публичный URL
        public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(storage_path)

        # Обновляем в базе
        supabase.table("products").update({"image_url": public_url}).eq(
            "id", product_id
        ).execute()

        # Удаляем временный файл
        file_path.unlink()

        success_count += 1
        if i % 10 == 0:
            print(
                f"  ✓ Обработано {i}/{len(products.data)} (успешно: {success_count}, ошибок: {error_count})"
            )

        # Небольшая задержка чтобы не перегружать серверы
        time.sleep(0.1)

    except Exception as e:
        print(f"  ❌ ID {product_id}: {str(e)[:50]}")
        error_count += 1
        continue

print(f"\n{'=' * 60}")
print(f"✅ Успешно: {success_count}")
print(f"❌ Ошибок: {error_count}")
print(f"⏭️  Пропущено: {skip_count}")
print(f"\n💾 Временные файлы удалены")

# Удаляем временную папку если пуста
if not list(TEMP_DIR.iterdir()):
    TEMP_DIR.rmdir()
