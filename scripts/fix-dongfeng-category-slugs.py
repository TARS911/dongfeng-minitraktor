#!/usr/bin/env python3
"""
Исправление slug категорий DongFeng для соответствия роутингу Next.js
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
print("🔧 ИСПРАВЛЕНИЕ SLUG КАТЕГОРИЙ DONGFENG")
print("="*80)
print(f"\n✅ URL: {SUPABASE_URL}")
print(f"✅ Ключ: {len(SUPABASE_KEY)} символов\n")

# Подключение
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Маппинг старых slug → новых slug
SLUG_UPDATES = {
    'parts-dongfeng-240-244': 'dongfeng-parts-240-244',
    'parts-dongfeng-354-404': 'dongfeng-parts-354-404',
}

print("📝 Обновление slug категорий...\n")

for old_slug, new_slug in SLUG_UPDATES.items():
    try:
        # Проверяем существует ли категория со старым slug
        result = supabase.table('categories').select('*').eq('slug', old_slug).execute()

        if not result.data or len(result.data) == 0:
            print(f"⚠️  Категория {old_slug} не найдена, пропускаем")
            continue

        category = result.data[0]
        category_id = category['id']

        # Обновляем slug
        result = supabase.table('categories').update({
            'slug': new_slug
        }).eq('id', category_id).execute()

        if result.data:
            print(f"✅ {old_slug:30} → {new_slug}")
        else:
            print(f"❌ Ошибка обновления {old_slug}")

    except Exception as e:
        print(f"❌ Ошибка для {old_slug}: {str(e)[:50]}")

print("\n" + "="*80)
print("✅ ГОТОВО! Slug категорий обновлены")
print("="*80)
print()
