#!/usr/bin/env python3
"""
Переназначение товаров DongFeng в подкатегории по моделям
Читает CSV файлы моделей и переназначает товары в соответствующие категории
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
print("🔄 ПЕРЕНАЗНАЧЕНИЕ ТОВАРОВ DONGFENG В ПОДКАТЕГОРИИ")
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


def reassign_products(file_path, target_category_slug, model_name):
    """Переназначает товары из файла в указанную категорию"""
    print(f"\n{'='*80}")
    print(f"📦 {model_name}")
    print(f"{'='*80}\n")

    # Получаем ID целевой категории
    result = supabase.table('categories').select('id').eq('slug', target_category_slug).execute()

    if not result.data or len(result.data) == 0:
        print(f"   ❌ Категория {target_category_slug} не найдена!")
        return 0

    target_category_id = result.data[0]['id']
    print(f"   📁 Целевая категория ID: {target_category_id}")

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

    # Переназначаем товары
    print(f"\n   🔄 Переназначение товаров...")
    updated = 0
    not_found = 0
    already_in_category = 0

    for product in products:
        try:
            slug = create_slug(product['title'])

            # Ищем товар по slug
            result = supabase.table('products').select('id, category_id').eq('slug', slug).execute()

            if not result.data or len(result.data) == 0:
                not_found += 1
                continue

            product_data = result.data[0]
            product_id = product_data['id']
            current_category_id = product_data['category_id']

            # Если уже в нужной категории - пропускаем
            if current_category_id == target_category_id:
                already_in_category += 1
                continue

            # Обновляем категорию
            result = supabase.table('products').update({
                'category_id': target_category_id
            }).eq('id', product_id).execute()

            if result.data:
                updated += 1

        except Exception as e:
            print(f"      ⚠️  Ошибка: {str(e)[:50]}")
            continue

    print(f"\n   ✅ Переназначено: {updated}")
    print(f"   ℹ️  Уже в нужной категории: {already_in_category}")
    print(f"   ⚠️  Не найдено в БД: {not_found}")

    return updated


# Переназначаем товары по моделям
print("\n🔄 Начинаем переназначение...\n")

total_updated = 0

# DongFeng 240-244
total_updated += reassign_products(
    'parsed_data/zip-agro/zip-agro-dongfeng-240-244.csv',
    'dongfeng-parts-240-244',
    'Запчасти DongFeng 240-244'
)

# DongFeng 354-404
total_updated += reassign_products(
    'parsed_data/zip-agro/zip-agro-dongfeng-354-404.csv',
    'dongfeng-parts-354-404',
    'Запчасти DongFeng 354-404'
)

print("\n" + "="*80)
print(f"✅ ГОТОВО! Всего переназначено: {total_updated} товаров")
print("="*80)
print()
