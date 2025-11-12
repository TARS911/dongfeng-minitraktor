#!/usr/bin/env python3
"""
Загрузка изображений тракторов DongFeng в Supabase Storage
и обновление записей в БД
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

# Маппинг файлов к slug товаров
IMAGE_MAPPING = {
    "dongfeng-244.jpg": "df-244",
    "dongfeng-244-g2.jpg": "df-244-g2",
    "dongfeng-304.jpg": "df-304",
    "dongfeng-404.jpg": "df-404",
    "dongfeng-504.jpg": "df-504",
    "dongfeng-504-g3.jpg": "df-504-g3",
    "dongfeng-704.jpg": "df-704",
    "dongfeng-804.jpg": "df-804",
    "dongfeng-904.jpg": "df-904",
    "dongfeng-1004.jpg": "df-1004",
    "dongfeng-1204.jpg": "df-1204",
    "dongfeng-1304.jpg": "df-1304",
    "dongfeng-1304e.jpg": "df-1304e",
    "dongfeng-1404.jpg": "df-1404",
    "dongfeng-1604.jpg": "df-1604",
    "dongfeng-2004.jpg": "df-2004",
}


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
    print("📸 ЗАГРУЗКА ИЗОБРАЖЕНИЙ DONGFENG В SUPABASE")
    print("=" * 70)

    if not IMAGES_DIR.exists():
        print(f"\n❌ Папка не найдена: {IMAGES_DIR}")
        print("Создайте папку и поместите в нее изображения.")
        sys.exit(1)

    # Получаем список изображений
    image_files = list(IMAGES_DIR.glob("*.jpg")) + list(IMAGES_DIR.glob("*.png"))

    if not image_files:
        print(f"\n❌ Изображения не найдены в {IMAGES_DIR}")
        print("\nИнструкция:")
        print("1. Скачайте изображения тракторов")
        print("2. Переименуйте их согласно формату: dongfeng-244.jpg")
        print(f"3. Поместите в папку: {IMAGES_DIR}")
        sys.exit(1)

    print(f"\n📁 Найдено изображений: {len(image_files)}")

    results = {"success": 0, "error": 0, "skipped": 0}

    for image_file in image_files:
        filename = image_file.name
        print(f"\n📷 {filename}")

        # Проверяем маппинг
        if filename not in IMAGE_MAPPING:
            print(f"  ⚠️  Пропущено - нет маппинга для {filename}")
            results["skipped"] += 1
            continue

        slug = IMAGE_MAPPING[filename]
        storage_path = f"dongfeng/{filename}"

        # Загружаем в Storage
        print(f"  ↗️  Загрузка в Storage...")
        public_url = upload_to_storage(image_file, storage_path)

        if not public_url:
            results["error"] += 1
            continue

        print(f"  ✓ URL: {public_url}")

        # Обновляем БД
        print(f"  ↗️  Обновление товара {slug}...")
        if update_product_image(slug, public_url):
            print(f"  ✓ Товар обновлен")
            results["success"] += 1
        else:
            results["error"] += 1

    # Итоги
    print("\n" + "=" * 70)
    print("📊 РЕЗУЛЬТАТЫ ЗАГРУЗКИ")
    print("=" * 70)
    print(f"✅ Успешно загружено:  {results['success']}")
    print(f"⚠️  Пропущено:          {results['skipped']}")
    print(f"❌ Ошибок:             {results['error']}")
    print("=" * 70)

    if results["success"] > 0:
        print("\n🎉 Изображения успешно загружены!")
        print("🌐 Проверьте на сайте: /catalog/dongfeng")


if __name__ == "__main__":
    main()
