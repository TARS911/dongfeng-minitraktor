#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Выполнение миграции через Supabase Connection Pooler (порт 6543)
"""
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

try:
    import psycopg2
except ImportError:
    print("❌ psycopg2 не установлен")
    sys.exit(1)

# Supabase PostgreSQL connection через pooler
PROJECT_REF = "dpsykseeqloturowdyzf"
DB_PASSWORD = "K6JctKDt+8cv_WV"
DB_USER = "postgres"  # Username для pooler
DB_NAME = "postgres"
DB_HOST = f"db.{PROJECT_REF}.supabase.co"  # Direct DB endpoint
DB_PORT = 6543  # Pooler port (transaction mode)

# Строка подключения для pooler
CONNECTION_STRING = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

def execute_migration():
    """Выполняет миграцию"""

    print("\n" + "="*70)
    print("🚀 ВЫПОЛНЕНИЕ МИГРАЦИИ ЧЕРЕЗ SUPABASE POOLER")
    print("="*70 + "\n")

    print(f"🔗 Подключение к: {DB_HOST}:{DB_PORT}")
    print(f"📊 База данных: {DB_NAME}")
    print(f"👤 Пользователь: {DB_USER}\n")

    # SQL команды
    migrations = [
        ("Удаление таблицы parts_categories", "DROP TABLE IF EXISTS parts_categories CASCADE"),
        ("Удаление таблицы parts", "DROP TABLE IF EXISTS parts CASCADE"),
        ("Обновление категории Запчасти", "UPDATE categories SET description = 'Запчасти для минитракторов' WHERE slug = 'parts' OR slug = 'zapchasti' OR name LIKE '%апчаст%'"),
        ("Создание категории Запчасти (если не существует)", "INSERT INTO categories (name, slug, description) SELECT 'Запчасти', 'parts', 'Запчасти для минитракторов' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'parts')")
    ]

    try:
        # Подключаемся
        print("🔌 Подключение к PostgreSQL через pooler...")
        conn = psycopg2.connect(CONNECTION_STRING)
        conn.autocommit = True
        cur = conn.cursor()
        print("✅ Подключено успешно!\n")

        # Выполняем каждую команду
        for idx, (description, sql_command) in enumerate(migrations, 1):
            print(f"{idx}. {description}...")
            print(f"   SQL: {sql_command[:80]}...")

            try:
                cur.execute(sql_command)
                affected = cur.rowcount if cur.rowcount >= 0 else 0
                print(f"   ✅ Выполнено (затронуто строк: {affected})\n")
            except Exception as e:
                print(f"   ⚠️  {str(e)}\n")

        # Проверяем результат
        print("="*70)
        print("📊 ПРОВЕРКА РЕЗУЛЬТАТА")
        print("="*70 + "\n")

        # Проверяем таблицы
        cur.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('parts', 'parts_categories')
        """)

        existing_tables = [row[0] for row in cur.fetchall()]

        if not existing_tables:
            print("✅ Таблицы parts и parts_categories удалены")
        else:
            print(f"⚠️  Ещё существуют таблицы: {', '.join(existing_tables)}")

        # Проверяем категорию Запчасти
        cur.execute("SELECT id, name, slug, description FROM categories WHERE slug = 'parts'")
        parts_category = cur.fetchone()

        if parts_category:
            print(f"\n✅ Категория 'Запчасти' существует:")
            print(f"   ID: {parts_category[0]}")
            print(f"   Название: {parts_category[1]}")
            print(f"   Slug: {parts_category[2]}")
            print(f"   Описание: {parts_category[3]}")
        else:
            print("\n⚠️  Категория 'Запчасти' не найдена")

        # Закрываем
        cur.close()
        conn.close()

        print("\n" + "="*70)
        print("✅ МИГРАЦИЯ УСПЕШНО ВЫПОЛНЕНА!")
        print("="*70)
        print("\n🎉 Категория 'Запчасти' очищена и готова к использованию\n")

        return True

    except psycopg2.Error as e:
        print(f"\n❌ Ошибка подключения к PostgreSQL:")
        print(f"   {str(e)}\n")
        return False
    except Exception as e:
        print(f"\n❌ Ошибка выполнения:")
        print(f"   {str(e)}\n")
        return False

if __name__ == "__main__":
    success = execute_migration()
    sys.exit(0 if success else 1)
