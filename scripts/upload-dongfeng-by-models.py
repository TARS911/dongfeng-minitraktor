#!/usr/bin/env python3
"""
Загрузка запчастей DongFeng в подкатегории по моделям
"""

import os
import csv
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv
import re

# Отключаем прокси
os.environ.pop('HTTP_PROXY', None)
os.environ.pop('HTTPS_PROXY', None)
os.environ.pop('http_proxy', None)
os.environ.pop('https_proxy', None)
os.environ.pop('ALL_PROXY', None)
os.environ.pop('all_proxy', None)

# Загружаем .env
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL') or os.getenv('SUPABASE_URL')
SUPABASE_KEY = (
    os.getenv('SUPABASE_SERVICE_ROLE_KEY') or
    os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
)

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Нет ключей Supabase!")
    exit(1)

print("="*80)
print("🚀 ЗАГРУЗКА ЗАПЧАСТЕЙ DONGFENG ПО МОДЕЛЯМ")
print("="*80)
print(f"\n✅ URL: {SUPABASE_URL}")
print(f"✅ Ключ: {len(SUPABASE_KEY)} символов\n")

# Подключение
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def create_slug(title):
    """Создаёт slug из названия товара"""
    slug = title.lower()
    slug = re.sub(r'[^a-zа-яё0-9\s-]', '', slug)
    slug = re.sub(r'\s+', '-', slug)
    slug = slug[:100]
    return slug


def upload_products(file_path, category_slug, category_name):
    """Загружает товары из файла в указанную категорию"""
    print(f"\n{'='*80}")
    print(f"📦 {category_name}")
    print(f"{'='*80}\n")

    # Получаем ID категории
    result = supabase.table('categories').select('id').eq('slug', category_slug).execute()

    if not result.data or len(result.data) == 0:
        print(f"❌ Категория {category_slug} не найдена!")
        return 0

    category_id = result.data[0]['id']
    print(f"   📁 Категория ID: {category_id}")

    # Проверяем файл
    if not Path(file_path).exists():
        print(f"   ⚠️  Файл не найден: {file_path}")
        return 0

    # Загружаем товары из файла
    print(f"   📂 Загрузка из {Path(file_path).name}...")

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            products = list(reader)
    except Exception as e:
        print(f"   ❌ Ошибка чтения файла: {e}")
        return 0

    print(f"   📊 Товаров в файле: {len(products)}")

    # Загружаем товары
    print(f"\n   📤 Загрузка в Supabase...")
    uploaded = 0
    skipped = 0

    for product in products:
        try:
            slug = create_slug(product['title'])

            # Проверяем существует ли
            existing = supabase.table('products').select('id').eq('slug', slug).execute()

            if existing.data and len(existing.data) > 0:
                skipped += 1
                continue

            # Создаём товар
            new_product = {
                'name': product['title'],
                'slug': slug,
                'description': product.get('description', ''),
                'price': float(product['price']) if product.get('price') else 0,
                'image_url': product.get('image_url', ''),
                'category_id': category_id,
                'manufacturer': 'DONGFENG',
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
                uploaded += 1

        except Exception as e:
            print(f"      ⚠️  Ошибка: {str(e)[:50]}")
            continue

    print(f"\n   ✅ Загружено новых: {uploaded}")
    print(f"   ⏭️  Пропущено (уже в БД): {skipped}")

    return uploaded


# Загружаем товары по моделям
print("\n🔄 Загрузка товаров...")

total_uploaded = 0

# DongFeng 240-244
total_uploaded += upload_products(
    'parsed_data/zip-agro/zip-agro-dongfeng-240-244.csv',
    'dongfeng-parts-240-244',
    'Запчасти DongFeng 240-244'
)

# DongFeng 354-404
total_uploaded += upload_products(
    'parsed_data/zip-agro/zip-agro-dongfeng-354-404.csv',
    'dongfeng-parts-354-404',
    'Запчасти DongFeng 354-404'
)

print("\n" + "="*80)
print(f"✅ ГОТОВО! Всего загружено: {total_uploaded} товаров")
print("="*80)
print()
