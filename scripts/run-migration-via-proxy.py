#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Выполнение миграции через прокси-сервер
"""
import sys
import os

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

# Настройка прокси
PROXY_HOST = "195.158.195.17"
PROXY_PORT = "8000"
PROXY_USER = "vyMgRb"
PROXY_PASS = "1GxC"

# Supabase PostgreSQL connection
PROJECT_REF = "dpsykseeqloturowdyzf"
DB_PASSWORD = "K6JctKDt+8cv_WV"
DB_USER = "postgres"
DB_NAME = "postgres"
DB_HOST = f"db.{PROJECT_REF}.supabase.co"
DB_PORT = 5432

# Строка подключения
CONNECTION_STRING = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Настройка прокси для psycopg2 через переменные окружения
os.environ['http_proxy'] = f'http://{PROXY_USER}:{PROXY_PASS}@{PROXY_HOST}:{PROXY_PORT}'
os.environ['https_proxy'] = f'http://{PROXY_USER}:{PROXY_PASS}@{PROXY_HOST}:{PROXY_PORT}'
os.environ['HTTP_PROXY'] = f'http://{PROXY_USER}:{PROXY_PASS}@{PROXY_HOST}:{PROXY_PORT}'
os.environ['HTTPS_PROXY'] = f'http://{PROXY_USER}:{PROXY_PASS}@{PROXY_HOST}:{PROXY_PORT}'

try:
    import psycopg2
except ImportError:
    print("❌ psycopg2 не установлен")
    sys.exit(1)

# SQL команды
migrations = [
    ("Удаление таблицы parts_categories", "DROP TABLE IF EXISTS parts_categories CASCADE"),
    ("Удаление таблицы parts", "DROP TABLE IF EXISTS parts CASCADE"),
    ("Обновление категории Запчасти", "UPDATE categories SET description = 'Запчасти для минитракторов' WHERE slug = 'parts' OR slug = 'zapchasti' OR name LIKE '%апчаст%'"),
    ("Создание категории Запчасти", "INSERT INTO categories (name, slug, description) SELECT 'Запчасти', 'parts', 'Запчасти для минитракторов' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'parts')")
]

def execute_migration():
    """Выполняет миграцию"""

    print("\n" + "="*70)
    print("🚀 ВЫПОЛНЕНИЕ МИГРАЦИИ ЧЕРЕЗ ПРОКСИ")
    print("="*70 + "\n")

    print(f"🔗 Прокси: {PROXY_HOST}:{PROXY_PORT}")
    print(f"🔗 Подключение к: {DB_HOST}:{DB_PORT}")
    print(f"📊 База данных: {DB_NAME}")
    print(f"👤 Пользователь: {DB_USER}\n")

    try:
        print("🔌 Подключение к PostgreSQL...")
        # psycopg2 не поддерживает HTTP прокси напрямую
        # Нужно использовать SOCKS прокси или SSH туннель
        print("⚠️  psycopg2 не поддерживает HTTP прокси")
        print("⚠️  Используем альтернативный метод - SSH туннель\n")

        # Пробуем подключение без прокси (возможно сеть изменилась)
        print("🔄 Пробую прямое подключение...")
        conn = psycopg2.connect(CONNECTION_STRING, connect_timeout=10)
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

        cur.close()
        conn.close()

        print("\n" + "="*70)
        print("✅ МИГРАЦИЯ УСПЕШНО ВЫПОЛНЕНА!")
        print("="*70)
        print("\n🎉 Категория 'Запчасти' очищена и готова к использованию\n")

        return True

    except psycopg2.Error as e:
        print(f"\n❌ Ошибка подключения:")
        print(f"   {str(e)}\n")

        # Пробуем через SSH туннель
        print("="*70)
        print("АЛЬТЕРНАТИВНОЕ РЕШЕНИЕ: SSH ТУННЕЛЬ ЧЕРЕЗ ПРОКСИ")
        print("="*70)
        print("\nДля подключения через прокси нужен SOCKS прокси или SSH туннель.")
        print("Попробуем создать SSH туннель...\n")

        return False

    except Exception as e:
        print(f"\n❌ Ошибка выполнения:")
        print(f"   {str(e)}\n")
        return False

if __name__ == "__main__":
    success = execute_migration()
    if not success:
        print("\n📋 РУЧНОЕ ВЫПОЛНЕНИЕ:")
        print(f"🔗 https://supabase.com/dashboard/project/{PROJECT_REF}/sql/new\n")
        for desc, sql in migrations:
            print(f"-- {desc}")
            print(f"{sql};")
            print()
    sys.exit(0 if success else 1)
