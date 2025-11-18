#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Выполнение миграции через прокси с помощью Supabase API
"""
import sys
import requests

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

# Прокси настройки
PROXY_USA = {
    'http': 'http://zCMDSs:JQSGrr@168.181.52.199:8000',
    'https': 'http://zCMDSs:JQSGrr@168.181.52.199:8000'
}

PROXY_SWE = {
    'http': 'http://vyMgRb:1GxC@195.158.195.17:8000',
    'https': 'http://vyMgRb:1GxC@195.158.195.17:8000'
}

# Supabase credentials
PROJECT_REF = "dpsykseeqloturowdyzf"
SUPABASE_URL = f"https://{PROJECT_REF}.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwc3lrc2VlcWxvdHVyb3dkeXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUwMjg1MywiZXhwIjoyMDc4MDc4ODUzfQ.wY2VoghxdIhgwEws_kUIUgZX1P3TTw-1PXh84GVbdJ4"

headers = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json"
}

def test_connection(proxy):
    """Тестируем подключение через прокси"""
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/",
            headers=headers,
            proxies=proxy,
            timeout=10
        )
        return response.status_code == 200
    except Exception as e:
        return False

def clear_parts_via_api(proxy):
    """
    Очищаем категорию запчастей через REST API
    Мы не можем выполнить DROP TABLE через API, но можем:
    1. Удалить все записи из parts и parts_categories (если они есть)
    2. Обновить категорию Запчасти
    """

    print("\n" + "="*70)
    print("🚀 ОЧИСТКА КАТЕГОРИИ 'ЗАПЧАСТИ' ЧЕРЕЗ REST API")
    print("="*70 + "\n")

    results = []

    # 1. Пробуем удалить все записи из parts
    print("1. Удаление всех записей из таблицы 'parts'...")
    try:
        response = requests.delete(
            f"{SUPABASE_URL}/rest/v1/parts",
            headers={**headers, "Prefer": "return=minimal"},
            params={"id": "neq.0"},  # Удаляем все записи где id != 0 (т.е. все)
            proxies=proxy,
            timeout=30
        )

        if response.status_code in [200, 204]:
            print("   ✅ Записи удалены из 'parts'\n")
            results.append(("Удаление parts", True))
        elif response.status_code == 404:
            print("   ⚠️  Таблица 'parts' не найдена (возможно уже удалена)\n")
            results.append(("Удаление parts", True))
        else:
            print(f"   ⚠️  Статус: {response.status_code}")
            print(f"   Ответ: {response.text[:200]}\n")
            results.append(("Удаление parts", False))
    except Exception as e:
        print(f"   ⚠️  Ошибка: {str(e)}\n")
        results.append(("Удаление parts", False))

    # 2. Пробуем удалить все записи из parts_categories
    print("2. Удаление всех записей из таблицы 'parts_categories'...")
    try:
        response = requests.delete(
            f"{SUPABASE_URL}/rest/v1/parts_categories",
            headers={**headers, "Prefer": "return=minimal"},
            params={"id": "neq.0"},
            proxies=proxy,
            timeout=30
        )

        if response.status_code in [200, 204]:
            print("   ✅ Записи удалены из 'parts_categories'\n")
            results.append(("Удаление parts_categories", True))
        elif response.status_code == 404:
            print("   ⚠️  Таблица 'parts_categories' не найдена\n")
            results.append(("Удаление parts_categories", True))
        else:
            print(f"   ⚠️  Статус: {response.status_code}")
            print(f"   Ответ: {response.text[:200]}\n")
            results.append(("Удаление parts_categories", False))
    except Exception as e:
        print(f"   ⚠️  Ошибка: {str(e)}\n")
        results.append(("Удаление parts_categories", False))

    # 3. Обновляем категорию Запчасти
    print("3. Обновление категории 'Запчасти'...")
    try:
        # Сначала найдём категорию
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/categories",
            headers=headers,
            params={"slug": "eq.parts"},
            proxies=proxy,
            timeout=10
        )

        if response.status_code == 200:
            categories = response.json()
            if categories:
                category_id = categories[0]['id']
                print(f"   Найдена категория ID: {category_id}")

                # Обновляем описание
                response = requests.patch(
                    f"{SUPABASE_URL}/rest/v1/categories",
                    headers=headers,
                    params={"id": f"eq.{category_id}"},
                    json={"description": "Запчасти для минитракторов"},
                    proxies=proxy,
                    timeout=10
                )

                if response.status_code in [200, 204]:
                    print("   ✅ Категория обновлена\n")
                    results.append(("Обновление категории", True))
                else:
                    print(f"   ⚠️  Ошибка обновления: {response.status_code}\n")
                    results.append(("Обновление категории", False))
            else:
                # Создаём категорию
                print("   Категория не найдена, создаём...")
                response = requests.post(
                    f"{SUPABASE_URL}/rest/v1/categories",
                    headers=headers,
                    json={
                        "name": "Запчасти",
                        "slug": "parts",
                        "description": "Запчасти для минитракторов"
                    },
                    proxies=proxy,
                    timeout=10
                )

                if response.status_code in [200, 201]:
                    print("   ✅ Категория создана\n")
                    results.append(("Создание категории", True))
                else:
                    print(f"   ⚠️  Ошибка создания: {response.status_code}\n")
                    results.append(("Создание категории", False))
        else:
            print(f"   ⚠️  Ошибка поиска категории: {response.status_code}\n")
            results.append(("Обновление категории", False))

    except Exception as e:
        print(f"   ⚠️  Ошибка: {str(e)}\n")
        results.append(("Обновление категории", False))

    return results

def main():
    print("\n" + "="*70)
    print("🔄 ВЫПОЛНЕНИЕ МИГРАЦИИ ЧЕРЕЗ ПРОКСИ")
    print("="*70 + "\n")

    # Тестируем прокси
    print("🔌 Тестирование прокси...")

    proxy = None
    if test_connection(PROXY_USA):
        print("   ✅ USA прокси работает\n")
        proxy = PROXY_USA
    elif test_connection(PROXY_SWE):
        print("   ✅ SWE прокси работает\n")
        proxy = PROXY_SWE
    else:
        print("   ❌ Ни один прокси не работает\n")
        return False

    # Выполняем очистку
    results = clear_parts_via_api(proxy)

    # Итог
    print("="*70)
    print("📊 РЕЗУЛЬТАТ")
    print("="*70 + "\n")

    success_count = sum(1 for _, success in results if success)
    total_count = len(results)

    for operation, success in results:
        status = "✅" if success else "❌"
        print(f"{status} {operation}")

    print(f"\nУспешно: {success_count}/{total_count}\n")

    if success_count < total_count:
        print("⚠️  ВНИМАНИЕ:")
        print("REST API не может выполнить DROP TABLE (DDL операции)")
        print("Таблицы 'parts' и 'parts_categories' могут всё ещё существовать\n")
        print("📋 Для полной очистки выполните в SQL Editor:")
        print("   DROP TABLE IF EXISTS parts_categories CASCADE;")
        print("   DROP TABLE IF EXISTS parts CASCADE;\n")
        print(f"🔗 https://supabase.com/dashboard/project/{PROJECT_REF}/sql/new\n")

    return success_count > 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
