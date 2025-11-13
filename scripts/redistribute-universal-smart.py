#!/usr/bin/env python3
"""
УМНОЕ ПЕРЕРАСПРЕДЕЛЕНИЕ ИЗ UNIVERSAL
Анализирует товары и переносит их в подходящие категории
"""

import os
from collections import defaultdict

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Паттерны для определения специфичных брендов в Universal
ENGINE_PATTERNS = {
    "s1100": ["s1100", "с1100", "s-1100"],
    "s195": ["s195", "с195", "s-195"],
    "zs": ["zs1100", "zs1105", "zs1110", "zs1115", "zs1125", "zs195"],
    "r175": ["r175", "р175", "r-175"],
    "r180": ["r180", "р180", "r-180"],
}

# Паттерны для типов запчастей
TYPE_PATTERNS = {
    "engines-diesel-engines": [
        "двигател",
        "мотор",
        "engine",
        "поршн",
        "цилиндр",
        "коленвал",
        "распредвал",
    ],
    "hydraulics": ["гидравлик", "гур", "насос", "hydraulic", "шланг"],
    "transmissions": ["кпп", "коробка передач", "сцепление", "transmission"],
    "electrical": ["генератор", "стартер", "провод", "электр", "акб", "аккумулятор"],
    "cooling": ["радиатор", "охлажд", "термостат", "помпа"],
    "fuel-systems": ["топлив", "инжектор", "форсунка", "тнвд", "карбюратор"],
}


def detect_engine_brand(name):
    """Определяет бренд двигателя из названия"""
    name_lower = name.lower()

    for brand, patterns in ENGINE_PATTERNS.items():
        for pattern in patterns:
            if pattern in name_lower:
                return brand
    return None


def detect_type(name):
    """Определяет тип запчасти"""
    name_lower = name.lower()

    # Приоритет: сначала более специфичные типы
    for type_key, patterns in TYPE_PATTERNS.items():
        for pattern in patterns:
            if pattern in name_lower:
                return type_key

    return "other-spare-parts"  # По умолчанию


def main():
    print("🔍 Загружаю товары из Universal категорий...")

    # Получаем все категории Universal
    categories = (
        supabase.table("categories")
        .select("id, name, slug")
        .like("slug", "universal-%")
        .execute()
    )
    universal_cat_ids = [cat["id"] for cat in categories.data]

    print(f"📦 Найдено {len(universal_cat_ids)} Universal категорий")

    # Получаем все товары из Universal
    products = (
        supabase.table("products")
        .select("id, name, category_id")
        .in_("category_id", universal_cat_ids)
        .execute()
    )

    print(f"📊 Всего товаров в Universal: {len(products.data)}")

    # Анализируем каждый товар
    redistribution_plan = defaultdict(list)
    stats = defaultdict(int)

    for product in products.data:
        name = product["name"]

        # Проверяем, упоминается ли конкретный двигатель
        engine_brand = detect_engine_brand(name)

        if engine_brand:
            # Определяем тип запчасти
            part_type = detect_type(name)

            # Формируем целевую категорию
            target_slug = f"{engine_brand}-{part_type}"

            redistribution_plan[target_slug].append(
                {
                    "id": product["id"],
                    "name": name,
                    "old_category_id": product["category_id"],
                }
            )

            stats[engine_brand] += 1

    print("\n" + "=" * 80)
    print("📊 ПЛАН ПЕРЕРАСПРЕДЕЛЕНИЯ:")
    print("=" * 80)

    total_to_move = sum(len(products) for products in redistribution_plan.values())
    print(f"\n✅ Можно перенести: {total_to_move} товаров")
    print(f"❌ Останется в Universal: {len(products.data) - total_to_move} товаров\n")

    print("Распределение по брендам:")
    for brand, count in sorted(stats.items(), key=lambda x: -x[1]):
        print(f"  {brand:20s} {count:4d} товаров")

    print("\nРаспределение по категориям:")
    for target_slug, products_list in sorted(
        redistribution_plan.items(), key=lambda x: -len(x[1])
    ):
        print(f"  {target_slug:40s} {len(products_list):4d} товаров")

    # Проверяем, существуют ли целевые категории
    print("\n🔍 Проверяю существование целевых категорий...")

    all_categories = supabase.table("categories").select("id, slug").execute()
    existing_slugs = {cat["slug"]: cat["id"] for cat in all_categories.data}

    missing_categories = []
    for target_slug in redistribution_plan.keys():
        if target_slug not in existing_slugs:
            missing_categories.append(target_slug)

    if missing_categories:
        print("\n⚠️  ВНИМАНИЕ! Отсутствуют категории:")
        for slug in missing_categories:
            print(f"  ❌ {slug}")
        print("\n🔧 Создаю отсутствующие категории...")

        # Создаём недостающие категории
        for slug in missing_categories:
            # Разбираем slug на бренд и тип
            parts = slug.split("-", 1)
            if len(parts) == 2:
                brand, part_type = parts

                # Формируем название
                brand_names = {
                    "s1100": "S1100",
                    "s195": "S195",
                    "zs": "ZS",
                    "r175": "R175",
                    "r180": "R180",
                }

                type_names = {
                    "engines-diesel-engines": "Двигатели",
                    "filters": "Фильтры",
                    "hydraulics": "Гидравлика",
                    "transmissions": "Трансмиссия",
                    "electrical": "Электрика",
                    "cooling": "Охлаждение",
                    "fuel-systems": "Топливная система",
                    "other-spare-parts": "Прочие запчасти",
                }

                brand_name = brand_names.get(brand, brand.upper())
                type_name = type_names.get(
                    part_type, part_type.replace("-", " ").title()
                )

                category_name = f"{brand_name} - {type_name}"

                # Создаём категорию
                try:
                    result = (
                        supabase.table("categories")
                        .insert(
                            {
                                "name": category_name,
                                "slug": slug,
                                "description": f"Запчасти для двигателей {brand_name}",
                            }
                        )
                        .execute()
                    )

                    new_cat_id = result.data[0]["id"]
                    existing_slugs[slug] = new_cat_id
                    print(f"  ✅ Создана: {slug} → {category_name} (ID: {new_cat_id})")
                except Exception as e:
                    print(f"  ❌ Ошибка при создании {slug}: {e}")

    # Выполняем перераспределение
    print("\n🚀 НАЧИНАЮ ПЕРЕРАСПРЕДЕЛЕНИЕ...")

    moved_count = 0
    skipped_count = 0

    for target_slug, products_list in redistribution_plan.items():
        if target_slug not in existing_slugs:
            print(
                f"⚠️  Пропускаю {len(products_list)} товаров для {target_slug} (категория не существует)"
            )
            skipped_count += len(products_list)
            continue

        target_cat_id = existing_slugs[target_slug]
        product_ids = [p["id"] for p in products_list]

        # Батч обновление
        BATCH_SIZE = 50
        for i in range(0, len(product_ids), BATCH_SIZE):
            batch_ids = product_ids[i : i + BATCH_SIZE]
            supabase.table("products").update({"category_id": target_cat_id}).in_(
                "id", batch_ids
            ).execute()

            moved_count += len(batch_ids)
            print(f"✅ {target_slug}: перенесено {len(batch_ids)} товаров")

    print("\n" + "=" * 80)
    print("🎉 ПЕРЕРАСПРЕДЕЛЕНИЕ ЗАВЕРШЕНО!")
    print("=" * 80)
    print(f"✅ Перенесено:    {moved_count} товаров")
    print(f"⚠️  Пропущено:    {skipped_count} товаров")
    print(f"📦 Осталось в Universal: {len(products.data) - moved_count} товаров")
    print("=" * 80)

    print("=" * 80)


if __name__ == "__main__":
    main()
