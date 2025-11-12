#!/usr/bin/env python3
"""
Перезагрузка изображений тракторов DongFeng в Supabase Storage
Удаляет старые файлы и загружает новые
"""

import json
import os
import sys
from pathlib import Path

import requests

# Supabase credentials
SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL", "https://dpsykseeqloturowdyzf.supabase.co"
)
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_KEY:
    print("❌ ОШИБКА: Не найден SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

# Пути
IMAGES_DIR = Path(__file__).parent.parent / "parsed_data" / "dongfeng_images"
STORAGE_BUCKET = "products"  # Название bucket в Supabase Storage

# Только файлы, которые нужно перезагрузить
IMAGE_MAPPING = {
    "dongfeng-804.jpg": "df-804",
    "dongfeng-904.jpg": "df-904",
    "dongfeng-1004.jpg": "df-1004",
    "dongfeng-1204.jpg": "df-1204",
}


def delete_from_storage(storage_path):
    """Удаляет файл из Supabase Storage"""
    url = f"{SUPABASE_URL}/storage/v1/object/{STORAGE_BUCKET}/{storage_path}"
    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    response = requests.delete(url, headers=headers)

    if response.status_code in [200, 204]:
        return True
    else:
        print(f"  ⚠️  Ошибка удаления (возможно файл не существует): {response.text}")
        return False


def upload_to_storage(file_path, storage_path):
    """Загружает файл в Supabase Storage"""
    url = f"{SUPABASE_URL}/storage/v1/object/{STORAGE_BUCKET}/{storage_path}"
    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "image/jpeg",
    }

    with open(file_path, "rb") as f:
        response = requests.post(url, headers=headers, data=f)

    if response.status_code in [200, 201]:
        public_url = (
            f"{SUPABASE_URL}/storage/v1/object/public/{STORAGE_BUCKET}/{storage_path}"
        )
        return public_url
    else:
        print(f"  ❌ Ошибка загрузки: {response.text}")
        return None


def update_product_image(slug, image_url):
    """Обновляет изображение товара в БД"""
    url = f"{SUPABASE_URL}/rest/v1/products"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    # Обновляем запись
    params = {"slug": f"eq.{slug}"}
    data = {"image_url": image_url}

    response = requests.patch(url, headers=headers, params=params, json=data)

    if response.status_code == 200:
        return True
    else:
        print(f"  ❌ Ошибка обновления БД: {response.text}")
        return False


def main():
    """Основная функция"""
    print("=" * 70)
    print("🔄 ПЕРЕЗАГРУЗКА ИЗОБРАЖЕНИЙ DONGFENG В SUPABASE")
    print("=" * 70)

    if not IMAGES_DIR.exists():
        print(f"\n❌ Папка не найдена: {IMAGES_DIR}")
        sys.exit(1)

    results = {"success": 0, "error": 0}

    for filename, slug in IMAGE_MAPPING.items():
        image_file = IMAGES_DIR / filename

        if not image_file.exists():
            print(f"\n⚠️  {filename} - файл не найден")
            results["error"] += 1
            continue

        print(f"\n📷 {filename}")
        storage_path = f"dongfeng/{filename}"

        # Удаляем старый файл
        print(f"  🗑️  Удаление старого файла...")
        delete_from_storage(storage_path)

        # Загружаем новый
        print(f"  ↗️  Загрузка нового файла...")
        public_url = upload_to_storage(image_file, storage_path)

        if not public_url:
            results["error"] += 1
            continue

        print(f"  ✓ URL: {public_url}")

        # Обновляем БД
        print(f"  ↗️  Обновление товара {slug}...")
        if update_product_image(slug, public_url):
            print(f"  ✅ Товар обновлен успешно")
            results["success"] += 1
        else:
            results["error"] += 1

    # Итоги
    print("\n" + "=" * 70)
    print("📊 РЕЗУЛЬТАТЫ ПЕРЕЗАГРУЗКИ")
    print("=" * 70)
    print(f"✅ Успешно обновлено:  {results['success']}")
    print(f"❌ Ошибок:             {results['error']}")
    print("=" * 70)

    if results["success"] > 0:
        print("\n🎉 Изображения успешно обновлены!")
        print("🌐 Проверьте на сайте: /catalog/dongfeng")


if __name__ == "__main__":
    main()
