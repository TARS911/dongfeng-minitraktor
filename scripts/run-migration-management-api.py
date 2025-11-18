#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Выполнение миграции через Supabase Management API
"""
import sys
import requests
import json

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

# Supabase Management API
PROJECT_REF = "dpsykseeqloturowdyzf"
# Service role key для Management API
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwc3lrc2VlcWxvdHVyb3dkeXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUwMjg1MywiZXhwIjoyMDc4MDc4ODUzfQ.wY2VoghxdIhgwEws_kUIUgZX1P3TTw-1PXh84GVbdJ4"

# SQL команды
SQL_COMMANDS = """
DROP TABLE IF EXISTS parts_categories CASCADE;
DROP TABLE IF EXISTS parts CASCADE;
UPDATE categories SET description = 'Запчасти для минитракторов' WHERE slug = 'parts' OR slug = 'zapchasti' OR name LIKE '%апчаст%';
INSERT INTO categories (name, slug, description) SELECT 'Запчасти', 'parts', 'Запчасти для минитракторов' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'parts');
"""

def execute_via_rpc():
    """Попытка выполнить через RPC функцию"""
    url = f"https://{PROJECT_REF}.supabase.co/rest/v1/rpc/exec_sql"

    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "query": SQL_COMMANDS
    }

    print("🔄 Попытка выполнить через RPC...")
    response = requests.post(url, headers=headers, json=payload)

    print(f"   Статус: {response.status_code}")
    print(f"   Ответ: {response.text[:200]}")

    return response.status_code == 200

def create_exec_sql_function():
    """Создаём RPC функцию для выполнения SQL"""

    # Сначала пытаемся создать функцию через REST API
    # Это не сработает, но попробуем

    print("\n⚠️  Management API не поддерживает прямое выполнение DDL")
    print("⚠️  Нужно использовать Supabase Dashboard SQL Editor\n")

    return False

def main():
    print("\n" + "="*70)
    print("🚀 ВЫПОЛНЕНИЕ МИГРАЦИИ ЧЕРЕЗ MANAGEMENT API")
    print("="*70 + "\n")

    print(f"🔗 Project: {PROJECT_REF}")
    print(f"📝 SQL команды готовы\n")

    # Пробуем через RPC
    success = execute_via_rpc()

    if not success:
        print("\n" + "="*70)
        print("❌ АВТОМАТИЧЕСКОЕ ВЫПОЛНЕНИЕ НЕВОЗМОЖНО")
        print("="*70)
        print("\n📋 РЕШЕНИЕ: Выполнить SQL вручную в Dashboard\n")
        print("="*70)
        print("ГОТОВЫЙ SQL ДЛЯ КОПИРОВАНИЯ")
        print("="*70)
        print("\n```sql")
        print(SQL_COMMANDS.strip())
        print("```\n")
        print("="*70)
        print("ИНСТРУКЦИЯ")
        print("="*70)
        print("\n1. Откройте SQL Editor:")
        print(f"   🔗 https://supabase.com/dashboard/project/{PROJECT_REF}/sql/new\n")
        print("2. Скопируйте SQL выше (4 команды)\n")
        print("3. Вставьте в SQL Editor\n")
        print("4. Нажмите RUN (или Ctrl+Enter)\n")
        print("5. Проверьте результат:\n")
        print("   - ✅ Таблицы parts и parts_categories удалены")
        print("   - ✅ Категория 'Запчасти' существует и пуста\n")

if __name__ == "__main__":
    main()
