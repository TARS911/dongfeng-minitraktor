#!/usr/bin/env python3
"""
ТЕСТОВЫЙ скрипт: только создание категорий
НЕ загружает товары - только проверяет подключение и создаёт категории
"""

import os
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
print("🧪 ТЕСТОВЫЙ ЗАПУСК: Создание категорий запчастей")
print("="*80)
print(f"\n✅ URL: {SUPABASE_URL}")
print(f"✅ Ключ: {len(SUPABASE_KEY)} символов\n")

# Подключение
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Категории для создания
CATEGORIES = {
    'parts-dongfeng': 'Запчасти DongFeng',
    'parts-foton': 'Запчасти Foton/Lovol',
    'parts-jinma': 'Запчасти Jinma',
    'parts-xingtai': 'Запчасти Xingtai/Уралец',
    'parts-shifeng': 'Запчасти Shifeng',
}

print("📁 Создание категорий...\n")

for slug, name in CATEGORIES.items():
    try:
        # Проверяем существует ли
        result = supabase.table('categories').select('*').eq('slug', slug).execute()

        if result.data and len(result.data) > 0:
            print(f"✅ {name:30} - уже существует (ID: {result.data[0]['id']})")
        else:
            # Создаём
            new_cat = {
                'name': name,
                'slug': slug,
                'description': f'Оригинальные запчасти для минитракторов {slug.replace("parts-", "").upper()}',
            }

            result = supabase.table('categories').insert(new_cat).execute()

            if result.data:
                print(f"🆕 {name:30} - создана (ID: {result.data[0]['id']})")
            else:
                print(f"❌ {name:30} - ошибка создания")

    except Exception as e:
        print(f"❌ {name:30} - ошибка: {str(e)[:50]}")

print("\n" + "="*80)
print("✅ ТЕСТ ЗАВЕРШЁН")
print("="*80)
print("\n📝 Следующий шаг: запустить загрузку товаров")
print("   python3 scripts/upload-parts-to-supabase.py dongfeng 50")
print()
