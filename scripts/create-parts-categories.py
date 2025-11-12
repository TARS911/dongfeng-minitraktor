#!/usr/bin/env python3
"""
Создание категорий для запчастей в Supabase
Создает плоские категории типа "Бренд - Тип запчасти"
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
    print("❌ ОШИБКА: Не найден SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

# Список брендов
BRANDS = [
    {"name": "Уралец", "slug": "uralets"},
    {"name": "Джинма", "slug": "jinma"},
    {"name": "Синтай", "slug": "xingtai"},
    {"name": "КМ (двигатели)", "slug": "km-engines"},
    {"name": "ДонгФенг", "slug": "dongfeng-parts"},
    {"name": "Скаут", "slug": "scout"},
    {"name": "Фотон", "slug": "foton"},
    {"name": "Русич", "slug": "rusich"},
    {"name": "МТЗ (Беларус)", "slug": "mtz"},
    {"name": "Т-серия", "slug": "t-series"},
    {"name": "Шифенг", "slug": "shifeng"},
    {"name": "Кэтманн", "slug": "catmann"},
    {"name": "Чувашпиллер", "slug": "chuvashpiller"},
]

# Типы запчастей
PART_TYPES = [
    {"name": "Прочие запчасти", "slug": "other-parts"},
    {"name": "Фильтра", "slug": "filters"},
    {"name": "Двигателя дизельные", "slug": "diesel-engines"},
    {"name": "Стартеры, Генераторы", "slug": "starters-generators"},
    {"name": "Универсальные комплектующие", "slug": "universal-parts"},
    {"name": "Сиденья (кресла)", "slug": "seats"},
    {"name": "ЗИП", "slug": "spare-parts-kit"},
    {"name": "Запчасти для навесного оборудования", "slug": "equipment-parts"},
    {"name": "Запчасти для тракторов", "slug": "tractor-parts"},
    {"name": "Колёса, шины, груза", "slug": "wheels-tires"},
    {"name": "Стандартные изделия", "slug": "standard-parts"},
    {"name": "Гидравлика", "slug": "hydraulics"},
    {"name": "Карданные валы", "slug": "driveshafts"},
]


def create_category(name, slug, description=None):
    """Создает категорию в Supabase"""
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
    }

    if description:
        data["description"] = description

    response = requests.post(url, headers=headers, json=data)

    if response.status_code in [200, 201]:
        category = response.json()
        if isinstance(category, list):
            return category[0]
        return category
    else:
        print(f"  ❌ Ошибка создания категории '{name}': {response.text}")
        return None


def get_category_by_slug(slug):
    """Получает категорию по slug"""
    url = f"{SUPABASE_URL}/rest/v1/categories"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }
    params = {"slug": f"eq.{slug}"}

    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 200:
        categories = response.json()
        if categories:
            return categories[0]
    return None


def main():
    """Основная функция"""
    print("=" * 70)
    print("🏗️  СОЗДАНИЕ КАТЕГОРИЙ ДЛЯ ЗАПЧАСТЕЙ")
    print("=" * 70)
    print("\nСоздаем категории в формате: 'Бренд - Тип запчасти'")
    print("Пример: 'Уралец - Фильтра', 'Джинма - Двигатели' и т.д.")
    print("-" * 70)

    total_created = 0
    total_existing = 0
    errors = 0

    # Создаем категорию для каждой комбинации бренд + тип запчасти
    for brand in BRANDS:
        print(f"\n🏷️  {brand['name']}:")

        for part_type in PART_TYPES:
            # Создаем название и slug
            category_name = f"{brand['name']} - {part_type['name']}"
            category_slug = f"{brand['slug']}-{part_type['slug']}"
            description = f"Запчасти {part_type['name']} для тракторов {brand['name']}"

            # Проверяем, существует ли категория
            existing_cat = get_category_by_slug(category_slug)
            if existing_cat:
                print(f"  ℹ️  {part_type['name']} - уже существует")
                total_existing += 1
            else:
                # Создаем категорию
                new_cat = create_category(category_name, category_slug, description)
                if new_cat:
                    print(f"  ✅ {part_type['name']}")
                    total_created += 1
                else:
                    errors += 1

    # Итоги
    print("\n" + "=" * 70)
    print("📊 РЕЗУЛЬТАТЫ СОЗДАНИЯ КАТЕГОРИЙ")
    print("=" * 70)
    print(f"✅ Создано новых:      {total_created}")
    print(f"ℹ️  Уже существовало:   {total_existing}")
    print(f"❌ Ошибок:             {errors}")
    print(f"📦 Всего категорий:    {total_created + total_existing}")
    print("=" * 70)

    if total_created > 0:
        print("\n🎉 Категории успешно созданы!")
        print("\nПримеры созданных категорий:")
        for brand in BRANDS[:2]:
            for part_type in PART_TYPES[:2]:
                print(f"  • {brand['name']} - {part_type['name']}")
            print(f"  • ... ({len(PART_TYPES)} типов для {brand['name']})")
            print()


if __name__ == "__main__":
    main()
