#!/usr/bin/env python3
"""
Удаление всех товаров DongFeng из Supabase
Чтобы можно было загрузить их заново с правильной дедупликацией
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
print("🗑️  УДАЛЕНИЕ ТОВАРОВ DONGFENG")
print("="*80)
print(f"\n✅ URL: {SUPABASE_URL}")
print(f"✅ Ключ: {len(SUPABASE_KEY)} символов\n")

# Подключение
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Получаем ID категории DongFeng
result = supabase.table('categories').select('id').eq('slug', 'parts-dongfeng').execute()

if not result.data or len(result.data) == 0:
    print("❌ Категория parts-dongfeng не найдена!")
    exit(1)

category_id = result.data[0]['id']
print(f"📁 Категория ID: {category_id}")

# Получаем все товары в этой категории
print(f"\n🔍 Поиск товаров DongFeng...")
result = supabase.table('products').select('id, name').eq('category_id', category_id).execute()

if not result.data or len(result.data) == 0:
    print("✅ Товары не найдены - ничего удалять не нужно")
    exit(0)

product_count = len(result.data)
print(f"📦 Найдено товаров: {product_count}")

# Спрашиваем подтверждение
print(f"\n⚠️  ВНИМАНИЕ: Будут удалены {product_count} товаров DongFeng")
print("   Это действие необратимо!")
confirm = input("\nПродолжить? (yes/no): ")

if confirm.lower() != 'yes':
    print("❌ Отменено")
    exit(0)

# Удаляем товары
print(f"\n🗑️  Удаление {product_count} товаров...")

try:
    result = supabase.table('products').delete().eq('category_id', category_id).execute()
    print(f"✅ Успешно удалено!")
except Exception as e:
    print(f"❌ Ошибка удаления: {e}")
    exit(1)

print("\n" + "="*80)
print("✅ ГОТОВО! Теперь можно загрузить товары заново")
print("="*80)
print("\n📝 Следующий шаг:")
print("   python3 scripts/upload-parts-to-supabase.py dongfeng")
print()
