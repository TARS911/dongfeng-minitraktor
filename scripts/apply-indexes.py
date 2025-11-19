#!/usr/bin/env python3
"""
Применение индексов к таблице products
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
print("🔧 ПРИМЕНЕНИЕ ИНДЕКСОВ К ТАБЛИЦЕ PRODUCTS")
print("="*80)
print(f"\n✅ URL: {SUPABASE_URL}")
print(f"✅ Ключ: {len(SUPABASE_KEY)} символов\n")

# Подключение
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Читаем SQL файл
sql_file = Path(__file__).parent / 'add-indexes-to-products.sql'

if not sql_file.exists():
    print("❌ SQL файл не найден!")
    exit(1)

with open(sql_file, 'r', encoding='utf-8') as f:
    sql_content = f.read()

print("📝 SQL команды:\n")
print(sql_content)
print("\n" + "="*80)

# Выполняем SQL через RPC
# Note: Supabase не поддерживает прямое выполнение DDL через Python SDK
# Нужно использовать SQL Editor в Supabase Dashboard или создать миграцию

print("\n⚠️  ВАЖНО!")
print("Для применения индексов выполните следующее:")
print("1. Откройте Supabase Dashboard → SQL Editor")
print("2. Скопируйте содержимое файла add-indexes-to-products.sql")
print("3. Выполните SQL команды")
print("\nИли используйте Supabase CLI:")
print("  supabase db push")
print()

print("✅ Индексы подготовлены для применения")
print("="*80)
