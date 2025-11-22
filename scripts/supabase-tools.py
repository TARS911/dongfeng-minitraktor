#!/usr/bin/env python3
"""
Инструменты для работы с данными в Supabase:
- Фильтрация
- Сортировка
- Поиск
- Экспорт
"""

import json
import os
import sys
from collections import defaultdict

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv("frontend/.env.local")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Ошибка: Не найдены переменные окружения SUPABASE")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def filter_by_brand(brand):
    """Фильтрация по бренду"""
    print(f"\n🔍 Поиск товаров бренда: {brand}")
    print("=" * 70)

    response = (
        supabase.table("products")
        .select("id, name, manufacturer, price, in_stock")
        .eq("manufacturer", brand.upper())
        .order("price", desc=False)
        .limit(20)
        .execute()
    )

    products = response.data
    print(f"\n✅ Найдено товаров: {len(products)}\n")

    for i, p in enumerate(products, 1):
        stock = "✅" if p.get("in_stock") else "❌"
        print(
            f"{i:2}. {p['name'][:50]:.<52} {p['price']:>8,.2f} ₽ {stock}"
        )

    return products


def filter_by_part_type(part_type):
    """Фильтрация по типу запчасти"""
    print(f"\n🔍 Поиск запчастей типа: {part_type}")
    print("=" * 70)

    # Получаем все товары и фильтруем по part_type в specifications
    all_products = []
    page_size = 1000
    offset = 0

    while True:
        response = (
            supabase.table("products")
            .select("id, name, manufacturer, price, in_stock, specifications")
            .range(offset, offset + page_size - 1)
            .execute()
        )

        if not response.data:
            break

        for product in response.data:
            ptype = product.get("specifications", {}).get("part_type", "")
            if ptype == part_type:
                all_products.append(product)

        offset += page_size

        if len(response.data) < page_size:
            break

    # Сортируем по цене
    all_products.sort(key=lambda x: x.get("price", 999999))

    print(f"\n✅ Найдено товаров: {len(all_products)}\n")

    for i, p in enumerate(all_products[:20], 1):
        stock = "✅" if p.get("in_stock") else "❌"
        brand = p.get("manufacturer", "?")[:10]
        print(
            f"{i:2}. [{brand:10}] {p['name'][:40]:.<42} {p['price']:>8,.2f} ₽ {stock}"
        )

    return all_products


def search_by_name(query):
    """Поиск по названию (регистронезависимый)"""
    print(f"\n🔍 Поиск: '{query}'")
    print("=" * 70)

    # Используем ilike для регистронезависимого поиска
    response = (
        supabase.table("products")
        .select("id, name, manufacturer, price, in_stock")
        .ilike("name", f"%{query}%")
        .order("price", desc=False)
        .limit(50)
        .execute()
    )

    products = response.data
    print(f"\n✅ Найдено товаров: {len(products)}\n")

    for i, p in enumerate(products, 1):
        stock = "✅" if p.get("in_stock") else "❌"
        brand = p.get("manufacturer", "?")[:10]
        print(
            f"{i:2}. [{brand:10}] {p['name'][:40]:.<42} {p['price']:>8,.2f} ₽ {stock}"
        )

    return products


def get_price_range(min_price, max_price):
    """Фильтрация по диапазону цен"""
    print(f"\n💰 Товары от {min_price} до {max_price} руб")
    print("=" * 70)

    response = (
        supabase.table("products")
        .select("id, name, manufacturer, price, in_stock")
        .gte("price", min_price)
        .lte("price", max_price)
        .order("price", desc=False)
        .limit(50)
        .execute()
    )

    products = response.data
    print(f"\n✅ Найдено товаров: {len(products)}\n")

    for i, p in enumerate(products, 1):
        stock = "✅" if p.get("in_stock") else "❌"
        brand = p.get("manufacturer", "?")[:10]
        print(
            f"{i:2}. [{brand:10}] {p['name'][:40]:.<42} {p['price']:>8,.2f} ₽ {stock}"
        )

    return products


def get_stats_by_brand():
    """Статистика по брендам"""
    print("\n📊 СТАТИСТИКА ПО БРЕНДАМ")
    print("=" * 70)

    all_products = []
    page_size = 1000
    offset = 0

    print("\n📥 Загружаем данные...")
    while True:
        response = (
            supabase.table("products")
            .select("manufacturer, price, in_stock")
            .range(offset, offset + page_size - 1)
            .execute()
        )

        if not response.data:
            break

        all_products.extend(response.data)
        offset += page_size

        if len(response.data) < page_size:
            break

    # Группируем по брендам
    brands = defaultdict(lambda: {"count": 0, "total_price": 0, "in_stock": 0})

    for p in all_products:
        brand = p.get("manufacturer", "UNKNOWN")
        brands[brand]["count"] += 1
        brands[brand]["total_price"] += p.get("price", 0)
        if p.get("in_stock"):
            brands[brand]["in_stock"] += 1

    print("\n" + "-" * 90)
    print(f"{'Бренд':<20} {'Товаров':>10} {'В наличии':>10} {'Средняя цена':>15} {'% в наличии':>12}")
    print("-" * 90)

    for brand, stats in sorted(brands.items(), key=lambda x: x[1]["count"], reverse=True):
        avg_price = stats["total_price"] / stats["count"] if stats["count"] > 0 else 0
        stock_percent = (stats["in_stock"] / stats["count"] * 100) if stats["count"] > 0 else 0

        print(
            f"{brand:<20} {stats['count']:>10,} {stats['in_stock']:>10,} "
            f"{avg_price:>15,.2f} ₽ {stock_percent:>11.1f}%"
        )

    print("-" * 90 + "\n")


def export_to_json(filename, filters=None):
    """Экспорт данных в JSON с фильтрами"""
    print(f"\n📤 Экспорт данных в {filename}")
    print("=" * 70)

    all_products = []
    page_size = 1000
    offset = 0

    print("\n📥 Загружаем данные...")
    while True:
        query = supabase.table("products").select("*")

        # Применяем фильтры
        if filters:
            if "brand" in filters:
                query = query.eq("manufacturer", filters["brand"])
            if "min_price" in filters:
                query = query.gte("price", filters["min_price"])
            if "max_price" in filters:
                query = query.lte("price", filters["max_price"])
            if "in_stock" in filters:
                query = query.eq("in_stock", filters["in_stock"])

        response = query.range(offset, offset + page_size - 1).execute()

        if not response.data:
            break

        all_products.extend(response.data)
        offset += page_size

        if len(response.data) < page_size:
            break

    # Сохраняем в JSON
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)

    print(f"✅ Экспортировано товаров: {len(all_products):,}")
    print(f"✅ Файл сохранён: {filename}\n")

    return all_products


def main():
    """Главное меню"""
    print("\n" + "=" * 70)
    print("ИНСТРУМЕНТЫ ДЛЯ РАБОТЫ С ДАННЫМИ SUPABASE")
    print("=" * 70 + "\n")

    print("1. Фильтр по бренду")
    print("2. Фильтр по типу запчасти")
    print("3. Поиск по названию")
    print("4. Фильтр по цене")
    print("5. Статистика по брендам")
    print("6. Экспорт в JSON (все товары)")
    print("7. Экспорт в JSON (только DONGFENG)")
    print("8. Экспорт в JSON (только в наличии)")
    print("0. Выход")

    choice = input("\nВведите номер: ").strip()

    if choice == "1":
        brand = input("Введите бренд (DONGFENG, FOTON, JINMA, XINGTAI): ").strip()
        filter_by_brand(brand)

    elif choice == "2":
        ptype = input(
            "Введите тип (filters, engines, pumps, transmission, etc): "
        ).strip()
        filter_by_part_type(ptype)

    elif choice == "3":
        query = input("Введите поисковый запрос: ").strip()
        search_by_name(query)

    elif choice == "4":
        min_price = float(input("Минимальная цена: ").strip())
        max_price = float(input("Максимальная цена: ").strip())
        get_price_range(min_price, max_price)

    elif choice == "5":
        get_stats_by_brand()

    elif choice == "6":
        export_to_json("export_all_products.json")

    elif choice == "7":
        export_to_json("export_dongfeng.json", {"brand": "DONGFENG"})

    elif choice == "8":
        export_to_json("export_in_stock.json", {"in_stock": True})

    elif choice == "0":
        print("👋 До свидания!")

    else:
        print("❌ Неверный выбор")


if __name__ == "__main__":
    main()
