#!/usr/bin/env python3
"""
Статистика базы данных и создание индексов для оптимизации
"""

import os
import sys

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv("frontend/.env.local")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Ошибка: Не найдены переменные окружения SUPABASE")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_statistics():
    """Получает полную статистику по базе данных"""
    print("\n" + "=" * 70)
    print("СТАТИСТИКА БАЗЫ ДАННЫХ SUPABASE")
    print("=" * 70 + "\n")

    # Получаем общее количество
    count_response = supabase.table("products").select("*", count="exact").execute()
    total_count = count_response.count

    print(f"📊 ВСЕГО ТОВАРОВ: {total_count:,}\n")

    # Получаем все товары для анализа (пагинация)
    all_products = []
    page_size = 1000
    offset = 0

    while True:
        response = (
            supabase.table("products")
            .select("manufacturer, price, in_stock, category_id, specifications")
            .range(offset, offset + page_size - 1)
            .execute()
        )

        if not response.data:
            break

        all_products.extend(response.data)
        offset += page_size

        if len(response.data) < page_size:
            break

    print(f"✅ Загружено товаров для анализа: {len(all_products):,}\n")

    # Статистика по брендам
    brands = {}
    for p in all_products:
        brand = p.get("manufacturer", "UNKNOWN")
        brands[brand] = brands.get(brand, 0) + 1

    print("📊 ПО БРЕНДАМ:")
    print("-" * 70)
    for brand, count in sorted(brands.items(), key=lambda x: x[1], reverse=True):
        percent = (count / len(all_products)) * 100
        print(f"  {brand:.<25} {count:>6,} ({percent:>5.1f}%)")

    # Статистика по типам запчастей
    part_types = {}
    for p in all_products:
        part_type = p.get("specifications", {}).get("part_type", "unknown")
        part_types[part_type] = part_types.get(part_type, 0) + 1

    print("\n📊 ПО ТИПАМ ЗАПЧАСТЕЙ:")
    print("-" * 70)
    for ptype, count in sorted(part_types.items(), key=lambda x: x[1], reverse=True)[
        :15
    ]:
        percent = (count / len(all_products)) * 100
        print(f"  {ptype:.<25} {count:>6,} ({percent:>5.1f}%)")

    # Статистика по ценам
    prices = [p["price"] for p in all_products if p.get("price")]
    avg_price = sum(prices) / len(prices) if prices else 0
    with_price = len([p for p in all_products if p.get("price", 0) > 0])
    in_stock = len([p for p in all_products if p.get("in_stock")])

    print("\n💰 ЦЕНЫ И НАЛИЧИЕ:")
    print("-" * 70)
    print(f"  Средняя цена.............. {avg_price:,.2f} руб")
    print(f"  Мин цена.................. {min(prices) if prices else 0:,.2f} руб")
    print(f"  Макс цена................. {max(prices) if prices else 0:,.2f} руб")
    print(
        f"  Товаров с ценой........... {with_price:,} ({with_price/len(all_products)*100:.1f}%)"
    )
    print(
        f"  Товаров в наличии......... {in_stock:,} ({in_stock/len(all_products)*100:.1f}%)"
    )

    # Статистика по категориям
    categories = {}
    for p in all_products:
        cat_id = p.get("category_id")
        categories[cat_id] = categories.get(cat_id, 0) + 1

    print("\n📁 ПО КАТЕГОРИЯМ:")
    print("-" * 70)
    for cat_id, count in sorted(categories.items(), key=lambda x: x[1], reverse=True)[
        :10
    ]:
        percent = (count / len(all_products)) * 100
        print(f"  Категория ID {cat_id}........ {count:>6,} ({percent:>5.1f}%)")

    print("\n" + "=" * 70 + "\n")


def create_indexes():
    """Создает индексы для оптимизации запросов"""
    print("\n" + "=" * 70)
    print("СОЗДАНИЕ ИНДЕКСОВ ДЛЯ ОПТИМИЗАЦИИ")
    print("=" * 70 + "\n")

    # SQL для создания индексов
    indexes = [
        # Индекс для поиска по бренду
        {
            "name": "idx_products_manufacturer",
            "sql": "CREATE INDEX IF NOT EXISTS idx_products_manufacturer ON products(manufacturer);",
            "description": "Индекс для фильтрации по брендам",
        },
        # Индекс для фильтрации по наличию
        {
            "name": "idx_products_in_stock",
            "sql": "CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);",
            "description": "Индекс для фильтра 'В наличии'",
        },
        # Индекс для сортировки по цене
        {
            "name": "idx_products_price",
            "sql": "CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);",
            "description": "Индекс для сортировки по цене",
        },
        # Индекс для категорий
        {
            "name": "idx_products_category",
            "sql": "CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);",
            "description": "Индекс для фильтрации по категориям",
        },
        # Композитный индекс для популярных запросов
        {
            "name": "idx_products_brand_stock",
            "sql": "CREATE INDEX IF NOT EXISTS idx_products_brand_stock ON products(manufacturer, in_stock);",
            "description": "Композитный индекс (бренд + наличие)",
        },
        # Индекс для полнотекстового поиска по названию
        {
            "name": "idx_products_name_search",
            "sql": "CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('russian', name));",
            "description": "Полнотекстовый поиск по названию (русский)",
        },
        # Индекс для поиска по slug
        {
            "name": "idx_products_slug",
            "sql": "CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);",
            "description": "Индекс для поиска по slug (уже есть UNIQUE, но дополнительный для быстроты)",
        },
    ]

    print("📝 Создаём индексы для оптимизации запросов...\n")

    for idx in indexes:
        try:
            # Используем rpc для выполнения SQL
            # Примечание: это требует создания функции в Supabase
            # Альтернатива - выполнить SQL вручную через Supabase Dashboard
            print(f"  ⏳ {idx['name']}...")
            print(f"     {idx['description']}")
            print(f"     SQL: {idx['sql'][:60]}...")

            # Для выполнения SQL нужно использовать REST API напрямую или Dashboard
            # Здесь просто выводим SQL для ручного выполнения
            print(f"     ⚠️  Выполните SQL вручную в Supabase Dashboard\n")

        except Exception as e:
            print(f"     ❌ Ошибка: {e}\n")

    print("\n💡 КАК СОЗДАТЬ ИНДЕКСЫ:")
    print("-" * 70)
    print("1. Откройте Supabase Dashboard")
    print("2. Перейдите в SQL Editor")
    print("3. Скопируйте и выполните следующий SQL:\n")

    print("```sql")
    for idx in indexes:
        print(idx["sql"])
    print("```")

    print("\n" + "=" * 70 + "\n")


def recommendations():
    """Выводит рекомендации по оптимизации"""
    print("\n" + "=" * 70)
    print("РЕКОМЕНДАЦИИ ПО ОПТИМИЗАЦИИ")
    print("=" * 70 + "\n")

    recommendations = [
        "✅ Создать индексы для часто используемых полей (manufacturer, category_id, in_stock, price)",
        "✅ Настроить полнотекстовый поиск (GIN индекс на to_tsvector)",
        "✅ Использовать пагинацию на фронтенде (limit + offset или cursor-based)",
        "✅ Кэшировать список брендов и категорий (они меняются редко)",
        "✅ Настроить Row Level Security (RLS) для безопасности",
        "✅ Создать материализованное представление для популярных запросов",
        "✅ Унифицировать регистр брендов (DONGFENG vs DongFeng)",
        "✅ Добавить поле search_vector для быстрого поиска",
    ]

    for i, rec in enumerate(recommendations, 1):
        print(f"{i}. {rec}")

    print("\n" + "=" * 70 + "\n")


if __name__ == "__main__":
    get_statistics()
    create_indexes()
    recommendations()
