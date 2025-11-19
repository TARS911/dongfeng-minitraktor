#!/usr/bin/env python3
"""
Создание подкатегорий для запчастей DongFeng по моделям
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
print("📁 СОЗДАНИЕ ПОДКАТЕГОРИЙ DONGFENG ПО МОДЕЛЯМ")
print("="*80)
print(f"\n✅ URL: {SUPABASE_URL}")
print(f"✅ Ключ: {len(SUPABASE_KEY)} символов\n")

# Подключение
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Категории для создания
CATEGORIES = {
    'parts-dongfeng-240-244': {
        'name': 'Запчасти DongFeng 240-244',
        'description': 'Оригинальные запчасти для минитракторов DongFeng 240-244',
    },
    'parts-dongfeng-354-404': {
        'name': 'Запчасти DongFeng 354-404',
        'description': 'Оригинальные запчасти для минитракторов DongFeng 354-404',
    },
}

print("📂 Создание подкатегорий...\n")

created = []

for slug, info in CATEGORIES.items():
    try:
        # Проверяем существует ли
        result = supabase.table('categories').select('*').eq('slug', slug).execute()

        if result.data and len(result.data) > 0:
            print(f"✅ {info['name']:40} - уже существует (ID: {result.data[0]['id']})")
            created.append(result.data[0])
        else:
            # Создаём
            new_cat = {
                'name': info['name'],
                'slug': slug,
                'description': info['description'],
            }

            result = supabase.table('categories').insert(new_cat).execute()

            if result.data:
                print(f"🆕 {info['name']:40} - создана (ID: {result.data[0]['id']})")
                created.append(result.data[0])
            else:
                print(f"❌ {info['name']:40} - ошибка создания")

    except Exception as e:
        print(f"❌ {info['name']:40} - ошибка: {str(e)[:50]}")

print("\n" + "="*80)
print(f"✅ ГОТОВО! Создано/проверено {len(created)} подкатегорий")
print("="*80)
print("\n📝 Следующий шаг: загрузить товары в подкатегории")
print("   python3 scripts/upload-dongfeng-by-models.py")
print()
