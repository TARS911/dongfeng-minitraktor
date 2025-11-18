#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Выполнение SQL миграции в Supabase через API
"""
import requests
import json
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

SUPABASE_URL = "https://dpsykseeqloturowdyzf.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwc3lrc2VlcWxvdHVyb3dkeXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUwMjg1MywiZXhwIjoyMDc4MDc4ODUzfQ.wY2VoghxdIhgwEws_kUIUgZX1P3TTw-1PXh84GVbdJ4"

def execute_sql_via_rpc(sql_statements):
    """Выполняет SQL через Supabase RPC"""

    # Пробуем через разные методы

    # Метод 1: Попытка через прямой REST API
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    results = []

    for idx, sql in enumerate(sql_statements, 1):
        print(f"\n{'='*70}")
        print(f"Выполнение команды {idx}/{len(sql_statements)}")
        print(f"{'='*70}")
        print(f"SQL: {sql[:100]}...")

        # Для DROP TABLE используем прямой запрос
        if sql.strip().upper().startswith('DROP TABLE'):
            # Извлекаем имя таблицы
            table_name = sql.split()[4].replace('IF', '').replace('EXISTS', '').strip().rstrip(';').replace('CASCADE', '').strip()
            print(f"Удаление таблицы: {table_name}")

            # Попытка удалить через DELETE (не сработает для DDL, но попробуем)
            # На самом деле DROP TABLE нельзя выполнить через REST API
            print(f"⚠️  DROP TABLE нельзя выполнить через REST API")
            print(f"⚠️  Эту команду нужно выполнить в SQL Editor вручную")
            results.append({"success": False, "command": sql, "reason": "DDL через REST API недоступен"})
            continue

        elif sql.strip().upper().startswith('UPDATE'):
            # UPDATE categories
            print("Выполнение UPDATE...")
            # Это тоже сложно через REST API без знания структуры
            print(f"⚠️  UPDATE нужно выполнить в SQL Editor")
            results.append({"success": False, "command": sql, "reason": "UPDATE через REST API сложен"})
            continue

        elif sql.strip().upper().startswith('INSERT'):
            # INSERT categories
            print("Выполнение INSERT...")
            print(f"⚠️  INSERT нужно выполнить в SQL Editor")
            results.append({"success": False, "command": sql, "reason": "INSERT через REST API требует точной структуры"})
            continue

        else:
            print(f"⚠️  Команда не поддерживается через API")
            results.append({"success": False, "command": sql, "reason": "Не поддерживается"})

    return results

def main():
    print("\n" + "="*70)
    print("АВТОМАТИЧЕСКОЕ ВЫПОЛНЕНИЕ МИГРАЦИИ В SUPABASE")
    print("="*70 + "\n")

    print(f"🔗 Supabase URL: {SUPABASE_URL}")
    print(f"🔑 Используется Service Role Key\n")

    # SQL команды из миграции
    sql_statements = [
        "DROP TABLE IF EXISTS parts_categories CASCADE",
        "DROP TABLE IF EXISTS parts CASCADE",
        "UPDATE categories SET description = 'Запчасти для минитракторов' WHERE slug = 'parts' OR slug = 'zapchasti' OR name LIKE '%апчаст%'",
        "INSERT INTO categories (name, slug, description) SELECT 'Запчасти', 'parts', 'Запчасти для минитракторов' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'parts')"
    ]

    print("="*70)
    print("ВНИМАНИЕ: DDL операции (DROP TABLE) нельзя выполнить через REST API")
    print("="*70)
    print("\n⚠️  Supabase REST API не поддерживает DDL операции (CREATE/DROP TABLE)")
    print("⚠️  Эти команды можно выполнить только через SQL Editor\n")

    print("="*70)
    print("ГОТОВЫЙ SQL ДЛЯ КОПИРОВАНИЯ")
    print("="*70)
    print("\nСкопируйте и выполните в SQL Editor:\n")
    print("```sql")
    for sql in sql_statements:
        print(f"{sql};")
    print("```")

    print("\n" + "="*70)
    print("ПРЯМАЯ ССЫЛКА В SQL EDITOR")
    print("="*70)
    print(f"\n🔗 https://supabase.com/dashboard/project/dpsykseeqloturowdyzf/sql/new")
    print("\n1. Откройте ссылку выше")
    print("2. Вставьте SQL из блока выше")
    print("3. Нажмите RUN\n")

if __name__ == "__main__":
    main()
