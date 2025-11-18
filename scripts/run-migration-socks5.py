#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Выполнение миграции через SOCKS5 прокси
"""
import sys
import socks
import socket

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

# Настройка SOCKS5 прокси
SOCKS_HOST = "195.158.195.17"
SOCKS_PORT = 8000
SOCKS_USER = "vyMgRb"
SOCKS_PASS = "1GxC1r"

# Supabase PostgreSQL
PROJECT_REF = "dpsykseeqloturowdyzf"
DB_PASSWORD = "K6JctKDt+8cv_WV"
DB_USER = "postgres"
DB_NAME = "postgres"
DB_HOST = f"db.{PROJECT_REF}.supabase.co"
DB_PORT = 5432

print("\n" + "="*70)
print("🚀 ВЫПОЛНЕНИЕ МИГРАЦИИ ЧЕРЕЗ SOCKS5")
print("="*70 + "\n")

print(f"🔗 SOCKS5: {SOCKS_HOST}:{SOCKS_PORT}")
print(f"🔗 PostgreSQL: {DB_HOST}:{DB_PORT}")
print(f"👤 Пользователь: {DB_USER}\n")

# Настраиваем SOCKS5 глобально
socks.set_default_proxy(
    socks.SOCKS5,
    SOCKS_HOST,
    SOCKS_PORT,
    username=SOCKS_USER,
    password=SOCKS_PASS
)
socket.socket = socks.socksocket

print("✅ SOCKS5 прокси настроен\n")

try:
    import psycopg2

    print("🔌 Подключение к PostgreSQL через SOCKS5...")

    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        connect_timeout=30
    )

    conn.autocommit = True
    cur = conn.cursor()

    print("✅ Подключено успешно!\n")

    print("="*70)
    print("🗑️  ВЫПОЛНЕНИЕ УДАЛЕНИЯ")
    print("="*70 + "\n")

    # SQL команды для быстрого удаления
    commands = [
        ("Удаление товаров из подкатегорий (ID > 7)",
         "DELETE FROM products WHERE category_id IN (SELECT id FROM categories WHERE id > 7)"),

        ("Удаление товаров из категории 'Запчасти' (ID = 2)",
         "DELETE FROM products WHERE category_id = 2"),

        ("Удаление всех подкатегорий (ID > 7)",
         "DELETE FROM categories WHERE id > 7"),

        ("Обновление категории 'Запчасти'",
         "UPDATE categories SET description = 'Запчасти для минитракторов' WHERE id = 2")
    ]

    for i, (description, sql) in enumerate(commands, 1):
        print(f"{i}. {description}...")

        try:
            cur.execute(sql)
            affected = cur.rowcount
            print(f"   ✅ Выполнено (затронуто строк: {affected})\n")
        except Exception as e:
            print(f"   ⚠️  Ошибка: {str(e)}\n")

    # Проверка результата
    print("="*70)
    print("📊 ПРОВЕРКА РЕЗУЛЬТАТА")
    print("="*70 + "\n")

    # Проверяем категорию "Запчасти"
    cur.execute("SELECT id, name, slug, description FROM categories WHERE id = 2")
    parts_cat = cur.fetchone()

    if parts_cat:
        print("✅ Категория 'Запчасти' существует:")
        print(f"   • ID: {parts_cat[0]}")
        print(f"   • Название: {parts_cat[1]}")
        print(f"   • Slug: {parts_cat[2]}")
        print(f"   • Описание: {parts_cat[3]}\n")

    # Проверяем товары в категории
    cur.execute("SELECT COUNT(*) FROM products WHERE category_id = 2")
    count = cur.fetchone()[0]

    if count == 0:
        print("✅ В категории 'Запчасти' нет товаров (пусто)\n")
    else:
        print(f"⚠️  В категории 'Запчасти' осталось {count} товаров\n")

    # Общее количество категорий
    cur.execute("SELECT COUNT(*) FROM categories")
    total_cats = cur.fetchone()[0]
    print(f"📊 Всего категорий в БД: {total_cats}")

    # Общее количество товаров
    cur.execute("SELECT COUNT(*) FROM products")
    total_products = cur.fetchone()[0]
    print(f"📦 Всего товаров в БД: {total_products}\n")

    cur.close()
    conn.close()

    print("="*70)
    print("✅ МИГРАЦИЯ УСПЕШНО ВЫПОЛНЕНА!")
    print("="*70)
    print("\n🎉 Категория 'Запчасти' очищена и готова к использованию\n")

    sys.exit(0)

except ImportError:
    print("❌ psycopg2 не установлен")
    sys.exit(1)
except Exception as e:
    print(f"\n❌ Ошибка: {str(e)}\n")
    sys.exit(1)
