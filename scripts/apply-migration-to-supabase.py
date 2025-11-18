#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Применение миграции CLEAR-ALL-PARTS.sql к Supabase
Выполняет SQL напрямую через Supabase API
"""
import sys
import os
import requests
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

# Загружаем .env
SUPABASE_URL = "https://dpsykseeqloturowdyzf.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwc3lrc2VlcWxvdHVyb3dkeXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUwMjg1MywiZXhwIjoyMDc4MDc4ODUzfQ.wY2VoghxdIhgwEws_kUIUgZX1P3TTw-1PXh84GVbdJ4"

SQL_FILE = "backend/database/migrations/CLEAR-ALL-PARTS.sql"

def execute_sql(sql):
    """Выполняет SQL через Supabase REST API"""
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"

    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json"
    }

    # Пробуем выполнить через PostgREST
    # Для выполнения SQL нужно использовать Supabase Management API

    # Альтернатива: используем psycopg2 для прямого подключения
    try:
        import psycopg2

        # Строка подключения для Supabase
        # Формат: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

        print("⚠️  Для выполнения миграции нужен пароль от Supabase PostgreSQL")
        print("⚠️  Альтернатива: выполните SQL вручную в Supabase Dashboard")
        print(f"\n📁 Файл миграции: {SQL_FILE}\n")

        # Читаем SQL
        with open(SQL_FILE, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        print("📄 Содержимое миграции:")
        print("=" * 70)
        print(sql_content)
        print("=" * 70)

        return False

    except ImportError:
        print("⚠️  psycopg2 не установлен")
        print("⚠️  Выполните миграцию вручную в Supabase Dashboard\n")

        # Читаем и показываем SQL
        with open(SQL_FILE, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        print("📄 Содержимое миграции:")
        print("=" * 70)
        print(sql_content)
        print("=" * 70)

        return False

def main():
    print("\n" + "="*70)
    print("ПРИМЕНЕНИЕ МИГРАЦИИ К SUPABASE")
    print("="*70 + "\n")

    print(f"🔗 Supabase URL: {SUPABASE_URL}")
    print(f"📁 SQL файл: {SQL_FILE}\n")

    if not Path(SQL_FILE).exists():
        print(f"❌ Файл {SQL_FILE} не найден!")
        sys.exit(1)

    # Пытаемся выполнить
    result = execute_sql(None)

    if not result:
        print("\n" + "="*70)
        print("ИНСТРУКЦИЯ ПО РУЧНОМУ ПРИМЕНЕНИЮ")
        print("="*70)
        print("\n1. Откройте Supabase Dashboard:")
        print(f"   {SUPABASE_URL.replace('/rest/v1', '')}")
        print("\n2. Перейдите в SQL Editor")
        print("\n3. Скопируйте содержимое файла:")
        print(f"   {SQL_FILE}")
        print("\n4. Вставьте в SQL Editor и нажмите RUN\n")

if __name__ == "__main__":
    main()
