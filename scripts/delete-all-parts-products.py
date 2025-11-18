#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Удаление ВСЕХ товаров из категории Запчасти и всех подкатегорий
"""
import sys
import requests
import time

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

def get_all_parts_category_ids():
    """Получаем ID всех категорий связанных с запчастями"""

    print("🔍 Поиск всех категорий запчастей...")

    try:
        # Ищем категорию "Запчасти" и все подкатегории
        # Подкатегории имеют slug вида "brand-category" (уралец-фильтры, джинма-гидравлика и т.д.)

        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/categories",
            headers=headers,
            proxies=PROXY,
            timeout=30
        )

        if response.status_code == 200:
            all_categories = response.json()

            # Главная категория "Запчасти"
            parts_main_id = None

            # Все подкатегории (ID от 8 до 300+)
            parts_subcategory_ids = []

            for cat in all_categories:
                slug = cat.get('slug', '')
                cat_id = cat.get('id')
                name = cat.get('name', '')

                # Главная категория
                if slug == 'parts':
                    parts_main_id = cat_id
                    print(f"   ✅ Главная категория: {name} (ID: {cat_id})")

                # Подкатегории - все что содержит бренды и категории запчастей
                # Например: "уралец-фильтры", "джинма-гидравлика" и т.д.
                elif any(keyword in slug.lower() or keyword in name.lower() for keyword in [
                    'фильтр', 'двигател', 'стартер', 'генератор', 'универсальн',
                    'сиденья', 'зип', 'навесн', 'тракто', 'колёс', 'шин', 'груз',
                    'стандарт', 'гидравлик', 'кардан', 'прочие', 'запчаст',
                    'filter', 'engine', 'starter', 'generator', 'universal',
                    'seat', 'spare', 'equipment', 'wheel', 'tire', 'hydraulic', 'driveshaft'
                ]):
                    # Исключаем основные категории (мини-тракторы, коммунальная техника)
                    if cat_id not in [1, 3, 4, 5, 6, 7]:  # ID основных категорий тракторов
                        parts_subcategory_ids.append(cat_id)

            print(f"\n   📊 Найдено подкатегорий запчастей: {len(parts_subcategory_ids)}")

            # Все ID категорий запчастей
            all_parts_ids = []
            if parts_main_id:
                all_parts_ids.append(parts_main_id)
            all_parts_ids.extend(parts_subcategory_ids)

            return all_parts_ids

        else:
            print(f"   ❌ Ошибка получения категорий: {response.status_code}")
            return []

    except Exception as e:
        print(f"   ❌ Ошибка: {str(e)}")
        return []

def count_products_in_categories(category_ids):
    """Подсчитываем количество товаров в категориях"""

    if not category_ids:
        return 0

    print(f"\n📊 Подсчёт товаров в {len(category_ids)} категориях...")

    total = 0

    try:
        # Для каждой категории подсчитываем товары
        for cat_id in category_ids:
            response = requests.get(
                f"{SUPABASE_URL}/rest/v1/products",
                headers={**headers, "Prefer": "count=exact"},
                params={"category_id": f"eq.{cat_id}", "limit": "0"},
                proxies=PROXY,
                timeout=10
            )

            if response.status_code == 200:
                count = int(response.headers.get('Content-Range', '0/0').split('/')[-1])
                if count > 0:
                    total += count
                    print(f"   • Категория {cat_id}: {count} товаров")

        print(f"\n   📦 Всего товаров для удаления: {total}\n")
        return total

    except Exception as e:
        print(f"   ❌ Ошибка подсчёта: {str(e)}")
        return 0

def delete_products_in_categories(category_ids):
    """Удаляем все товары из указанных категорий"""

    if not category_ids:
        print("❌ Нет категорий для удаления")
        return False

    print(f"\n🗑️  УДАЛЕНИЕ ТОВАРОВ ИЗ {len(category_ids)} КАТЕГОРИЙ")
    print("="*70)

    deleted_total = 0

    try:
        # Удаляем товары из каждой категории
        for i, cat_id in enumerate(category_ids, 1):
            print(f"\n{i}/{len(category_ids)}. Удаление из категории ID={cat_id}...")

            # Используем фильтр category_id=eq.{cat_id} для удаления
            response = requests.delete(
                f"{SUPABASE_URL}/rest/v1/products",
                headers={**headers, "Prefer": "return=minimal"},
                params={"category_id": f"eq.{cat_id}"},
                proxies=PROXY,
                timeout=30
            )

            if response.status_code in [200, 204]:
                print(f"   ✅ Товары удалены")
                deleted_total += 1
            elif response.status_code == 404:
                print(f"   ⚠️  Товары не найдены (уже удалены)")
            else:
                print(f"   ⚠️  Ошибка: {response.status_code}")
                print(f"   {response.text[:200]}")

            # Небольшая пауза чтобы не перегрузить API
            time.sleep(0.1)

        print(f"\n✅ Обработано категорий: {deleted_total}/{len(category_ids)}")
        return True

    except Exception as e:
        print(f"\n❌ Ошибка удаления: {str(e)}")
        return False

def delete_parts_categories(category_ids):
    """Удаляем сами категории запчастей (кроме главной)"""

    print(f"\n🗑️  УДАЛЕНИЕ ПОДКАТЕГОРИЙ ЗАПЧАСТЕЙ")
    print("="*70)

    # Оставляем только главную категорию "Запчасти" (ID: 2)
    # Удаляем все остальные
    categories_to_delete = [cat_id for cat_id in category_ids if cat_id != 2]

    print(f"\nУдаляем {len(categories_to_delete)} подкатегорий (оставляем главную 'Запчасти' ID=2)...\n")

    deleted = 0

    try:
        for i, cat_id in enumerate(categories_to_delete, 1):
            print(f"{i}/{len(categories_to_delete)}. Удаление категории ID={cat_id}...", end=" ")

            response = requests.delete(
                f"{SUPABASE_URL}/rest/v1/categories",
                headers={**headers, "Prefer": "return=minimal"},
                params={"id": f"eq.{cat_id}"},
                proxies=PROXY,
                timeout=10
            )

            if response.status_code in [200, 204]:
                print("✅")
                deleted += 1
            else:
                print(f"⚠️  ({response.status_code})")

            time.sleep(0.05)

        print(f"\n✅ Удалено категорий: {deleted}/{len(categories_to_delete)}\n")
        return True

    except Exception as e:
        print(f"\n❌ Ошибка: {str(e)}")
        return False

def main():
    print("\n" + "="*70)
    print("🗑️  ПОЛНАЯ ОЧИСТКА КАТЕГОРИИ 'ЗАПЧАСТИ'")
    print("="*70 + "\n")

    # 1. Получаем ID всех категорий запчастей
    category_ids = get_all_parts_category_ids()

    if not category_ids:
        print("\n❌ Категории запчастей не найдены")
        return False

    print(f"\n📋 Найдено категорий для очистки: {len(category_ids)}")

    # 2. Подсчитываем товары
    total_products = count_products_in_categories(category_ids)

    if total_products == 0:
        print("✅ Товаров в категориях запчастей нет")
    else:
        # 3. Удаляем все товары
        input(f"\n⚠️  Будет удалено {total_products} товаров. Нажмите Enter для продолжения...")
        delete_products_in_categories(category_ids)

    # 4. Удаляем подкатегории (оставляем только главную)
    delete_parts_categories(category_ids)

    # 5. Финальная проверка
    print("\n" + "="*70)
    print("📊 ФИНАЛЬНАЯ ПРОВЕРКА")
    print("="*70 + "\n")

    # Проверяем категорию "Запчасти"
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
            print(f"✅ Категория 'Запчасти' существует:")
            print(f"   • ID: {cat.get('id')}")
            print(f"   • Название: {cat.get('name')}")
            print(f"   • Slug: {cat.get('slug')}")
            print(f"   • Описание: {cat.get('description')}\n")

            # Проверяем товары
            cat_id = cat.get('id')
            response = requests.get(
                f"{SUPABASE_URL}/rest/v1/products",
                headers={**headers, "Prefer": "count=exact"},
                params={"category_id": f"eq.{cat_id}", "limit": "0"},
                proxies=PROXY,
                timeout=10
            )

            if response.status_code == 200:
                count = int(response.headers.get('Content-Range', '0/0').split('/')[-1])
                if count == 0:
                    print(f"✅ В категории 'Запчасти' нет товаров (пусто)")
                else:
                    print(f"⚠️  В категории 'Запчасти' осталось {count} товаров")

    print("\n" + "="*70)
    print("✅ ОЧИСТКА ЗАВЕРШЕНА!")
    print("="*70)
    print("\n🎉 Категория 'Запчасти' теперь пуста и готова к использованию\n")

    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
