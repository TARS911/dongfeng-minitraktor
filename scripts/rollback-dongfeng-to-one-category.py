#!/usr/bin/env python3
"""
Откат: возвращаем все товары DongFeng в одну категорию parts-dongfeng
"""

import os
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

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
print("🔄 ОТКАТ: Возврат товаров DongFeng в одну категорию")
print("="*80)
print(f"\n✅ URL: {SUPABASE_URL}")
print(f"✅ Ключ: {len(SUPABASE_KEY)} символов\n")

# Подключение
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Получаем ID основной категории
result = supabase.table('categories').select('id').eq('slug', 'parts-dongfeng').execute()

if not result.data or len(result.data) == 0:
    print("❌ Основная категория parts-dongfeng не найдена!")
    exit(1)

main_category_id = result.data[0]['id']
print(f"📁 Основная категория ID: {main_category_id}")

# ID подкатегорий моделей
model_category_slugs = ['dongfeng-parts-240-244', 'dongfeng-parts-354-404']
model_category_ids = []

for slug in model_category_slugs:
    result = supabase.table('categories').select('id').eq('slug', slug).execute()
    if result.data and len(result.data) > 0:
        model_category_ids.append(result.data[0]['id'])

print(f"🔍 Найдено подкатегорий моделей: {len(model_category_ids)}")

# Переносим все товары из подкатегорий в основную
total_moved = 0

for cat_id in model_category_ids:
    # Получаем товары
    result = supabase.table('products').select('id').eq('category_id', cat_id).execute()

    if result.data:
        count = len(result.data)
        print(f"\n   🔄 Переносим {count} товаров из категории {cat_id}...")

        # Обновляем категорию для всех товаров
        result = supabase.table('products').update({
            'category_id': main_category_id
        }).eq('category_id', cat_id).execute()

        if result.data:
            moved = len(result.data)
            print(f"   ✅ Перенесено: {moved}")
            total_moved += moved

# Удаляем подкатегории моделей
print(f"\n🗑️  Удаление подкатегорий моделей...")

for slug in model_category_slugs:
    try:
        result = supabase.table('categories').delete().eq('slug', slug).execute()
        print(f"   ✅ Удалена: {slug}")
    except Exception as e:
        print(f"   ⚠️  Ошибка удаления {slug}: {str(e)[:50]}")

print("\n" + "="*80)
print(f"✅ ГОТОВО! Перенесено {total_moved} товаров в основную категорию")
print("="*80)
print()
