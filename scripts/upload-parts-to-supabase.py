#!/usr/bin/env python3
"""
Загрузка запчастей в Supabase с подкатегориями
Постепенная загрузка по брендам
"""

import os
import csv
import json
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

# Отключаем прокси (избегаем ошибки socks://)
os.environ.pop('HTTP_PROXY', None)
os.environ.pop('HTTPS_PROXY', None)
os.environ.pop('http_proxy', None)
os.environ.pop('https_proxy', None)
os.environ.pop('ALL_PROXY', None)
os.environ.pop('all_proxy', None)

# Загружаем .env файл из корня проекта
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

# Конфигурация Supabase
SUPABASE_URL = (
    os.getenv('NEXT_PUBLIC_SUPABASE_URL') or
    os.getenv('SUPABASE_URL')
)

SUPABASE_KEY = (
    os.getenv('SUPABASE_SERVICE_ROLE_KEY') or
    os.getenv('SUPABASE_SERVICE_KEY') or
    os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY') or
    os.getenv('SUPABASE_ANON_KEY')
)

if not SUPABASE_URL:
    print("❌ ОШИБКА: Нет SUPABASE_URL в .env файле!")
    exit(1)

if not SUPABASE_KEY:
    print("❌ ОШИБКА: Нет SUPABASE_KEY в .env файле!")
    exit(1)

print(f"✅ Supabase URL: {SUPABASE_URL}")
print(f"✅ Ключ загружен ({len(SUPABASE_KEY)} символов)\n")

# Подключение к Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Маппинг файлов по брендам
BRAND_FILES = {
    'dongfeng': [
        'parsed_data/zip-agro/zip-agro-dongfeng-all.csv',
        'parsed_data/zip-agro/zip-agro-dongfeng-240-244.csv',
        'parsed_data/zip-agro/zip-agro-dongfeng-354-404.csv',
        'parsed_data/tata-agro/tata-agro-dongfeng.csv',
    ],
    'foton': [
        'parsed_data/zip-agro/zip-agro-foton-all.csv',
        'parsed_data/tata-agro/tata-agro-foton.csv',
    ],
    'jinma': [
        'parsed_data/zip-agro/zip-agro-jinma-all.csv',
        'parsed_data/tata-agro/tata-agro-jinma.csv',
    ],
    'xingtai': [
        'parsed_data/zip-agro/zip-agro-xingtai.csv',
        'parsed_data/zip-agro/zip-agro-xingtai-120-parts.csv',
        'parsed_data/zip-agro/zip-agro-xingtai-120-engine-parts.csv',
        'parsed_data/zip-agro/zip-agro-xingtai-xt-180-parts.csv',
        'parsed_data/tata-agro/tata-agro-xingtai.csv',
        'parsed_data/tata-agro/tata-agro-xingtai-24b.csv',
    ],
    'shifeng': [
        'parsed_data/tata-agro/tata-agro-shifeng.csv',
    ],
}

# Названия категорий
CATEGORY_NAMES = {
    'dongfeng': 'Запчасти DongFeng',
    'foton': 'Запчасти Foton/Lovol',
    'jinma': 'Запчасти Jinma',
    'xingtai': 'Запчасти Xingtai/Уралец',
    'shifeng': 'Запчасти Shifeng',
}


def create_categories():
    """Создаёт подкатегории запчастей для каждого бренда"""
    print("\n" + "="*80)
    print("📁 СОЗДАНИЕ КАТЕГОРИЙ")
    print("="*80)
    print()

    created = []

    for slug, name in CATEGORY_NAMES.items():
        try:
            # Проверяем есть ли уже
            result = supabase.table('categories').select('*').eq('slug', f'parts-{slug}').execute()

            if result.data and len(result.data) > 0:
                print(f"✅ {name} - уже существует (ID: {result.data[0]['id']})")
                created.append(result.data[0])
            else:
                # Создаём новую
                new_category = {
                    'name': name,
                    'slug': f'parts-{slug}',
                    'description': f'Оригинальные запчасти для минитракторов {slug.upper()}',
                }

                result = supabase.table('categories').insert(new_category).execute()
                print(f"🆕 {name} - создана (ID: {result.data[0]['id']})")
                created.append(result.data[0])

        except Exception as e:
            print(f"❌ Ошибка создания {name}: {e}")

    print(f"\n✅ Создано/проверено {len(created)} категорий")
    return {cat['slug']: cat['id'] for cat in created}


def create_slug(title):
    """Создаёт slug из названия товара"""
    import re
    # Транслитерация и очистка
    slug = title.lower()
    slug = re.sub(r'[^a-zа-яё0-9\s-]', '', slug)
    slug = re.sub(r'\s+', '-', slug)
    slug = slug[:100]  # Ограничение длины
    return slug


def upload_products_for_brand(brand, category_id, limit=None):
    """Загружает товары для одного бренда"""
    print(f"\n📦 Загрузка товаров для {brand.upper()}...")
    print(f"   Категория ID: {category_id}")

    files = BRAND_FILES.get(brand, [])

    # ШАГ 1: Загружаем ВСЕ товары из ВСЕХ файлов
    print(f"\n   📂 Загрузка данных из файлов...")
    all_products = []
    file_counts = {}

    for file_path in files:
        if not Path(file_path).exists():
            print(f"   ⚠️  Файл не найден: {file_path}")
            continue

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                products = list(reader)
                all_products.extend(products)
                file_counts[Path(file_path).name] = len(products)
                print(f"      ✅ {Path(file_path).name}: {len(products)} строк")

        except Exception as e:
            print(f"   ❌ Ошибка чтения {Path(file_path).name}: {e}")

    print(f"\n   📊 Всего строк из файлов: {len(all_products)}")

    # ШАГ 2: Дедупликация по URL МЕЖДУ ВСЕМИ файлами
    print(f"   🔍 Удаление дубликатов по URL...")
    seen_urls = {}
    unique_products = []
    duplicates = 0

    for product in all_products:
        url = product['url']
        if url not in seen_urls:
            seen_urls[url] = True
            unique_products.append(product)
        else:
            duplicates += 1

    print(f"   ✨ Уникальных товаров: {len(unique_products)}")
    print(f"   🗑️  Дубликатов между файлами: {duplicates}")

    # ШАГ 3: Загрузка уникальных товаров
    print(f"\n   📤 Загрузка в Supabase...")
    total_uploaded = 0
    total_skipped = 0

    for product in unique_products:
        # Проверяем лимит
        if limit and total_uploaded >= limit:
            print(f"   ⏸️  Достигнут лимит {limit} товаров")
            break

        try:
            # Подготовка данных
            slug = create_slug(product['title'])

            # Проверяем существует ли
            existing = supabase.table('products').select('id').eq('slug', slug).execute()

            if existing.data and len(existing.data) > 0:
                total_skipped += 1
                continue

            # Создаём товар
            new_product = {
                'name': product['title'],
                'slug': slug,
                'description': product.get('description', ''),
                'price': float(product['price']) if product.get('price') else 0,
                'image_url': product.get('image_url', ''),
                'category_id': category_id,
                'manufacturer': brand.upper(),
                'model': product.get('article', ''),
                'in_stock': product.get('stock', 'В наличии') == 'В наличии',
                'featured': False,
                'specifications': {
                    'article': product.get('article', ''),
                    'source_url': product.get('url', ''),
                }
            }

            result = supabase.table('products').insert(new_product).execute()

            if result.data:
                total_uploaded += 1

        except Exception as e:
            print(f"      ⚠️  Ошибка: {str(e)[:50]}")
            continue

    print(f"\n   ✅ Загружено новых: {total_uploaded}")
    print(f"   ⏭️  Пропущено (уже в БД): {total_skipped}")

    return total_uploaded


def main():
    import sys

    print("\n" + "="*80)
    print("🚀 ЗАГРУЗКА ЗАПЧАСТЕЙ В SUPABASE")
    print("="*80)

    # Создаём категории
    categories = create_categories()

    # Определяем бренд и лимит из аргументов
    brand = sys.argv[1] if len(sys.argv) > 1 else None
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else None

    if not brand:
        print("\n" + "="*80)
        print("📋 ИСПОЛЬЗОВАНИЕ:")
        print("="*80)
        print()
        print("python3 scripts/upload-parts-to-supabase.py <brand> [limit]")
        print()
        print("Доступные бренды:")
        for b in BRAND_FILES.keys():
            print(f"  • {b}")
        print()
        print("Примеры:")
        print("  python3 scripts/upload-parts-to-supabase.py dongfeng 100")
        print("  python3 scripts/upload-parts-to-supabase.py foton")
        print()
        return

    if brand not in BRAND_FILES:
        print(f"\n❌ Неизвестный бренд: {brand}")
        print(f"Доступные: {', '.join(BRAND_FILES.keys())}")
        return

    category_slug = f'parts-{brand}'
    if category_slug not in categories:
        print(f"\n❌ Категория не найдена: {category_slug}")
        return

    category_id = categories[category_slug]

    print(f"\n🎯 Загружаем товары для: {CATEGORY_NAMES[brand]}")
    if limit:
        print(f"⏱️  Лимит: {limit} товаров")

    # Загружаем товары
    uploaded = upload_products_for_brand(brand, category_id, limit)

    print("\n" + "="*80)
    print(f"✅ ГОТОВО! Загружено {uploaded} товаров")
    print("="*80)
    print()


if __name__ == "__main__":
    main()
