#!/usr/bin/env python3
"""
Скрипт для создания 11 подкатегорий в разделе "Запчасти" в Supabase
"""

import psycopg2
from psycopg2 import sql

# Параметры подключения к Supabase PostgreSQL (прямое подключение)
DB_CONFIG = {
    'host': 'aws-0-eu-central-1.pooler.supabase.com',
    'port': 5432,
    'database': 'postgres',
    'user': 'postgres.dpsykseeqloturowdyzf',
    'password': 'beltehferm K6JctKDt+8cv_WV'
}

def execute_migration():
    """Выполняет SQL миграцию для создания подкатегорий"""

    conn = None
    try:
        # Подключение к БД
        print("Подключение к Supabase PostgreSQL...")
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # Читаем SQL из файла миграции
        with open('migrations/CREATE-PARTS-SUBCATEGORIES.sql', 'r', encoding='utf-8') as f:
            migration_sql = f.read()

        # Выполняем миграцию
        print("\nВыполнение миграции...")
        cursor.execute(migration_sql)

        # Коммитим изменения
        conn.commit()
        print("✅ Миграция успешно выполнена!")

        # Проверяем результат
        print("\n📊 Созданные подкатегории:")
        cursor.execute("""
            SELECT
                c.id,
                c.name,
                c.slug,
                c.display_order,
                p.name as parent_name
            FROM categories c
            LEFT JOIN categories p ON c.parent_id = p.id
            WHERE c.parent_id = 2
            ORDER BY c.display_order;
        """)

        results = cursor.fetchall()
        print(f"\nВсего подкатегорий: {len(results)}\n")

        for row in results:
            cat_id, name, slug, order, parent = row
            print(f"{order}. {name}")
            print(f"   Slug: {slug}")
            print(f"   ID: {cat_id}")
            print(f"   Родитель: {parent}\n")

        cursor.close()

    except Exception as e:
        print(f"❌ Ошибка при выполнении миграции: {e}")
        if conn:
            conn.rollback()
        raise

    finally:
        if conn:
            conn.close()
            print("Соединение закрыто")

if __name__ == "__main__":
    execute_migration()
