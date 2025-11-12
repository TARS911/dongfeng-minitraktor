#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Импорт тракторов DongFeng из JSON файла в Supabase
"""

import json
import os
import sys
from pathlib import Path

import requests

# Supabase credentials
SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL", "https://dpsykseeqloturowdyzf.supabase.co"
)
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_KEY:
    print("❌ ОШИБКА: Не найден SUPABASE_SERVICE_ROLE_KEY в переменных окружения")
    print("Установите переменную окружения:")
    print("export SUPABASE_SERVICE_ROLE_KEY='your-key-here'")
    sys.exit(1)

# Путь к JSON файлу
JSON_FILE = Path(__file__).parent.parent / "parsed_data" / "dongfeng_tractors.json"


def get_category_id(category_slug):
    """Получает ID категории по slug"""
    url = f"{SUPABASE_URL}/rest/v1/categories"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }
    params = {"slug": f"eq.{category_slug}", "select": "id,name"}

    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 200:
        data = response.json()
        if data and len(data) > 0:
            return data[0]["id"], data[0]["name"]

    return None, None


def create_category(name, slug, description=None, parent_id=None):
    """Создает новую категорию"""
    url = f"{SUPABASE_URL}/rest/v1/categories"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    data = {
        "name": name,
        "slug": slug,
        "description": description,
    }

    if parent_id:
        data["parent_id"] = parent_id

    response = requests.post(url, headers=headers, json=data)

    if response.status_code == 201:
        result = response.json()
        print(f"✅ Создана категория: {name} (ID: {result[0]['id']})")
        return result[0]["id"]
    else:
        print(f"❌ Ошибка создания категории {name}: {response.text}")
        return None


def import_tractor(tractor, category_id):
    """Импортирует один трактор в Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/products"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    # Проверяем, существует ли товар с таким slug
    check_url = f"{url}?slug=eq.{tractor['slug']}"
    check_response = requests.get(check_url, headers=headers)

    if check_response.status_code == 200 and len(check_response.json()) > 0:
        print(f"⚠️  Товар уже существует: {tractor['name']} (slug: {tractor['slug']})")
        return "skipped"

    # Формируем описание
    description = f"Мини-трактор {tractor['name']}"
    if tractor.get("engine"):
        description += f"\n\nДвигатель: {tractor['engine']}"
    if tractor.get("drive"):
        description += f"\nПривод: {tractor['drive']}"

    # Формируем спецификации
    specifications = {
        "power_hp": tractor.get("power_hp"),
        "power_kw": tractor.get("power_kw"),
        "engine": tractor.get("engine"),
        "drive": tractor.get("drive"),
    }

    # Удаляем None значения
    specifications = {k: v for k, v in specifications.items() if v is not None}

    # Подготавливаем данные для импорта
    product_data = {
        "name": tractor["name"],
        "slug": tractor["slug"],
        "description": description,
        "category_id": category_id,
        "manufacturer": tractor.get("brand", "DongFeng"),
        "model": tractor.get("model", ""),
        "price": tractor.get("price_from", 0),
        "in_stock": tractor.get("in_stock", True),
        "featured": tractor.get("featured", False),
        "specifications": specifications,
    }

    # Импортируем товар
    response = requests.post(url, headers=headers, json=product_data)

    if response.status_code == 201:
        print(
            f"✅ Импортирован: {tractor['name']} - {tractor['power_hp']} л.с. - от {tractor.get('price_from', 0):,} руб."
        )
        return "success"
    else:
        print(f"❌ Ошибка импорта {tractor['name']}: {response.text}")
        return "error"


def main():
    """Основная функция"""
    print("=" * 70)
    print("🚜 ИМПОРТ ТРАКТОРОВ DONGFENG В SUPABASE")
    print("=" * 70)

    # Проверяем наличие JSON файла
    if not JSON_FILE.exists():
        print(f"\n❌ Файл не найден: {JSON_FILE}")
        sys.exit(1)

    # Загружаем данные из JSON
    print(f"\n📂 Загрузка данных из {JSON_FILE.name}...")
    with open(JSON_FILE, "r", encoding="utf-8") as f:
        tractors = json.load(f)

    print(f"✅ Загружено тракторов: {len(tractors)}")

    # Получаем ID категории "Мини-тракторы"
    print("\n🔍 Поиск категории 'Мини-тракторы'...")
    mini_tractors_id, mini_tractors_name = get_category_id("mini-tractors")

    if not mini_tractors_id:
        print("❌ Категория 'mini-tractors' не найдена!")
        sys.exit(1)

    print(f"✅ Категория найдена: {mini_tractors_name} (ID: {mini_tractors_id})")

    # Проверяем/создаем подкатегорию DongFeng
    print("\n🔍 Поиск подкатегории 'DongFeng'...")
    dongfeng_id, dongfeng_name = get_category_id("dongfeng")

    if not dongfeng_id:
        print("📁 Создание подкатегории 'DongFeng'...")
        dongfeng_id = create_category(
            name="DongFeng",
            slug="dongfeng",
            description="Мини-тракторы китайского производителя DongFeng - надежная техника для сельского хозяйства",
            parent_id=mini_tractors_id,
        )

        if not dongfeng_id:
            print("❌ Не удалось создать категорию DongFeng")
            sys.exit(1)
    else:
        print(f"✅ Подкатегория найдена: {dongfeng_name} (ID: {dongfeng_id})")

    # Импортируем тракторы
    print("\n📦 Импорт тракторов в категорию DongFeng...")
    print("-" * 70)

    results = {"success": 0, "error": 0, "skipped": 0}

    for tractor in tractors:
        result = import_tractor(tractor, dongfeng_id)
        results[result] += 1

    # Итоги
    print("\n" + "=" * 70)
    print("📊 РЕЗУЛЬТАТЫ ИМПОРТА")
    print("=" * 70)
    print(f"✅ Успешно импортировано: {results['success']}")
    print(f"⚠️  Пропущено (дубликаты):  {results['skipped']}")
    print(f"❌ Ошибок:                 {results['error']}")
    print(f"📦 Всего обработано:       {len(tractors)}")
    print("=" * 70)

    if results["success"] > 0:
        print(f"\n🎉 Тракторы успешно добавлены!")
        print(f"🌐 Проверьте на сайте: /catalog/mini-tractors или /catalog/dongfeng")


if __name__ == "__main__":
    main()
