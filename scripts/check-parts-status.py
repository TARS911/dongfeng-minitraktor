#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Проверка текущего состояния категории Запчасти в Supabase
"""
import sys
import requests
import json

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

# Прокси
PROXY = {
    'http': 'http://zCMDSs:JQSGrr@168.181.52.199:8000',
    'https': 'http://zCMDSs:JQSGrr@168.181.52.199:8000'
}

# Supabase
PROJECT_REF = "dpsykseeqloturowdyzf"
SUPABASE_URL = f"https://{PROJECT_REF}.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwc3lrc2VlcWxvdHVyb3dkeXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUwMjg1MywiZXhwIjoyMDc4MDc4ODUzfQ.wY2VoghxdIhgwEws_kUIUgZX1P3TTw-1PXh84GVbdJ4"

headers = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json"
}

def main():
    print("\n" + "="*70)
    print("📊 ПРОВЕРКА СОСТОЯНИЯ КАТЕГОРИИ 'ЗАПЧАСТИ'")
    print("="*70 + "\n")

    # 1. Проверяем все категории
    print("1. Все категории в БД:")
    print("-" * 70)
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/categories",
            headers=headers,
            proxies=PROXY,
            timeout=10
        )

        if response.status_code == 200:
            categories = response.json()
            print(f"   Всего категорий: {len(categories)}\n")

            for cat in categories:
                print(f"   • ID: {cat.get('id')}")
                print(f"     Название: {cat.get('name')}")
                print(f"     Slug: {cat.get('slug')}")
                print(f"     Описание: {cat.get('description', 'нет')}")
                print()
        else:
            print(f"   ❌ Ошибка: {response.status_code}")
            print(f"   {response.text}\n")
    except Exception as e:
        print(f"   ❌ Ошибка: {str(e)}\n")

    # 2. Ищем категорию Запчасти
    print("\n2. Категория 'Запчасти' (slug='parts'):")
    print("-" * 70)
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/categories",
            headers=headers,
            params={"slug": "eq.parts"},
            proxies=PROXY,
            timeout=10
        )

        if response.status_code == 200:
            parts_cat = response.json()
            if parts_cat:
                cat = parts_cat[0]
                print(f"   ✅ Категория найдена:")
                print(f"   • ID: {cat.get('id')}")
                print(f"   • Название: {cat.get('name')}")
                print(f"   • Slug: {cat.get('slug')}")
                print(f"   • Описание: {cat.get('description')}")

                parts_category_id = cat.get('id')
            else:
                print("   ❌ Категория 'Запчасти' не найдена")
                parts_category_id = None
        else:
            print(f"   ❌ Ошибка: {response.status_code}")
            parts_category_id = None
    except Exception as e:
        print(f"   ❌ Ошибка: {str(e)}")
        parts_category_id = None

    # 3. Проверяем товары в категории Запчасти
    if parts_category_id:
        print(f"\n3. Товары в категории 'Запчасти' (category_id={parts_category_id}):")
        print("-" * 70)
        try:
            response = requests.get(
                f"{SUPABASE_URL}/rest/v1/products",
                headers=headers,
                params={"category_id": f"eq.{parts_category_id}"},
                proxies=PROXY,
                timeout=10
            )

            if response.status_code == 200:
                products = response.json()
                print(f"   📦 Всего товаров: {len(products)}\n")

                if products:
                    print("   ⚠️  ВНИМАНИЕ: В категории есть товары!")
                    print("   Первые 5 товаров:\n")
                    for i, prod in enumerate(products[:5], 1):
                        print(f"   {i}. {prod.get('name', 'Без имени')} (ID: {prod.get('id')})")
                    if len(products) > 5:
                        print(f"   ... и ещё {len(products) - 5} товаров\n")
                else:
                    print("   ✅ Категория пуста - товаров нет\n")
            elif response.status_code == 404:
                print("   ⚠️  Таблица products не найдена\n")
            else:
                print(f"   ⚠️  Ошибка: {response.status_code}")
                print(f"   {response.text}\n")
        except Exception as e:
            print(f"   ❌ Ошибка: {str(e)}\n")

    # 4. Проверяем существование таблиц parts и parts_categories
    print("\n4. Проверка специальных таблиц:")
    print("-" * 70)

    for table_name in ['parts', 'parts_categories']:
        try:
            response = requests.get(
                f"{SUPABASE_URL}/rest/v1/{table_name}",
                headers={**headers, "Prefer": "count=exact"},
                params={"limit": "0"},
                proxies=PROXY,
                timeout=10
            )

            if response.status_code == 200:
                count = response.headers.get('Content-Range', '').split('/')[-1]
                print(f"   ⚠️  Таблица '{table_name}' существует (записей: {count})")
            elif response.status_code == 404:
                print(f"   ✅ Таблица '{table_name}' не найдена (удалена)")
            else:
                print(f"   ❓ Таблица '{table_name}': статус {response.status_code}")
        except Exception as e:
            print(f"   ❌ Ошибка проверки '{table_name}': {str(e)}")

    print("\n" + "="*70)
    print("✅ ПРОВЕРКА ЗАВЕРШЕНА")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
