#!/usr/bin/env python3
"""
Анализирует и перераспределяет товары из категории "Универсальные" по правильным брендам
"""

import os
import re
from collections import defaultdict

from supabase import create_client


# Загружаем переменные окружения
def load_env():
    env_path = os.path.join(os.path.dirname(__file__), "..", "frontend", ".env.local")
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    os.environ[key] = value


load_env()

supabase = create_client(
    os.getenv("NEXT_PUBLIC_SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

# Расширенные ключевые слова для определения брендов
BRAND_KEYWORDS = {
    "uralets": [
        "уралец",
        "uralets",
    ],
    "dongfeng-parts": [
        "dongfeng",
        "донгфенг",
        "донфенг",
        "dong feng",
        "df",
        "дф-",
    ],
    "jinma": [
        "jinma",
        "джинма",
        "цзинма",
        "jm",
    ],
    "xingtai": [
        "xingtai",
        "синтай",
        "синьтай",
        "xt",
    ],
    "foton": [
        "foton",
        "фотон",
        "lovol",
        "ловол",
        "ft",
    ],
    "shifeng": [
        "shifeng",
        "шифенг",
        "sf",
    ],
    "bulat": [
        "булат",
        "bulat",
    ],
    "scout": [
        "скаут",
        "scout",
    ],
    "mtz": [
        "беларус",
        "belarus",
        "мтз",
        "mtz",
    ],
    "kentavr": [
        "кентавр",
        "kentavr",
    ],
    "rusich": [
        "русич",
        "rusich",
    ],
    "fayter": [
        "файтер",
        "fayter",
        "fighter",
    ],
    "wirax": [
        "wirax",
        "виракс",
        "вайракс",
    ],
    "yto": [
        "yto",
        "ито",
    ],
    "neva": [
        "нева",
        "neva",
    ],
    "catmann": [
        "catmann",
        "катманн",
    ],
    "chuvashpiller": [
        "чувашпиллер",
        "chuvashpiller",
    ],
    "km-engines": [
        "км385",
        "км490",
        "км495",
        "км-",
    ],
    "dlh": [
        "dlh",
    ],
    "perkins": [
        "perkins",
        "перкинс",
    ],
}

# Маппинг типов запчастей по ключевым словам в slug категории
PART_TYPE_FROM_SLUG = {
    "filters": "Фильтра",
    "diesel-engines": "Двигателя дизельные",
    "starters-generators": "Стартеры, Генераторы",
    "universal-parts": "Универсальные комплектующие",
    "seats": "Сиденья (кресла)",
    "spare-parts-kit": "ЗИП",
    "equipment-parts": "Запчасти для навесного оборудования",
    "tractor-parts": "Запчасти для тракторов",
    "wheels-tires": "Колёса, шины, груза",
    "standard-parts": "Стандартные изделия",
    "hydraulics": "Гидравлика",
    "driveshafts": "Карданные валы",
    "other-parts": "Прочие запчасти",
}


def detect_brand_from_name(name):
    """Определяет бренд из названия товара"""
    name_lower = name.lower()

    # Проверяем каждый бренд
    for brand_slug, keywords in BRAND_KEYWORDS.items():
        for keyword in keywords:
            if keyword.lower() in name_lower:
                return brand_slug

    return None


def get_part_type_from_category_slug(category_slug):
    """Извлекает тип запчасти из slug категории (например: universal-filters -> filters)"""
    for part_type_slug in PART_TYPE_FROM_SLUG.keys():
        if part_type_slug in category_slug:
            return part_type_slug
    return None


def analyze_universal_products():
    """Анализирует товары в универсальных категориях"""

    print(f"\n{'=' * 80}")
    print("🔍 АНАЛИЗ ТОВАРОВ В КАТЕГОРИИ 'УНИВЕРСАЛЬНЫЕ'")
    print(f"{'=' * 80}\n")

    # Получаем все категории с префиксом "universal-"
    categories_result = (
        supabase.table("categories").select("*").like("slug", "universal-%").execute()
    )

    if not categories_result.data:
        print("❌ Категории 'universal-*' не найдены")
        return

    universal_categories = categories_result.data
    print(f"✅ Найдено универсальных категорий: {len(universal_categories)}")

    brand_distribution = defaultdict(lambda: defaultdict(int))
    undetected_products = []
    total_products = 0

    for category in universal_categories:
        category_id = category["id"]
        category_slug = category["slug"]
        category_name = category.get("name", category_slug)

        print(f"\n📂 Категория: {category_name} ({category_slug})")

        # Получаем товары из этой категории
        products_result = (
            supabase.table("products")
            .select("id, name, category_id")
            .eq("category_id", category_id)
            .execute()
        )

        products = products_result.data
        print(f"   Товаров: {len(products)}")

        total_products += len(products)

        # Анализируем каждый товар
        for product in products:
            brand = detect_brand_from_name(product["name"])

            if brand:
                brand_distribution[brand][category_slug] += 1
            else:
                undetected_products.append(
                    {
                        "id": product["id"],
                        "name": product["name"],
                        "category": category_name,
                    }
                )

    # Выводим статистику
    print(f"\n{'=' * 80}")
    print("📊 СТАТИСТИКА РАСПРЕДЕЛЕНИЯ ПО БРЕНДАМ")
    print(f"{'=' * 80}\n")

    print(f"Всего товаров в универсальных категориях: {total_products}")
    print(f"Определено брендов: {len(brand_distribution)}")
    print(f"Не определено: {len(undetected_products)}\n")

    # Распределение по брендам
    for brand, categories in sorted(brand_distribution.items()):
        total_brand = sum(categories.values())
        print(f"🏷️  {brand.upper()}: {total_brand} товаров")
        for cat_slug, count in sorted(
            categories.items(), key=lambda x: x[1], reverse=True
        ):
            part_type = get_part_type_from_category_slug(cat_slug)
            print(f"   └─ {part_type or cat_slug}: {count}")

    # Товары без определенного бренда
    if undetected_products:
        print(f"\n{'=' * 80}")
        print(f"⚠️  ТОВАРЫ БЕЗ ОПРЕДЕЛЕННОГО БРЕНДА ({len(undetected_products)})")
        print(f"{'=' * 80}\n")

        # Показываем первые 50
        for product in undetected_products[:50]:
            print(f"  • {product['name'][:70]}... ({product['category']})")

        if len(undetected_products) > 50:
            print(f"\n  ... и еще {len(undetected_products) - 50} товаров")

    return brand_distribution, undetected_products


def redistribute_products(dry_run=True):
    """Перераспределяет товары по правильным категориям"""

    print(f"\n{'=' * 80}")
    print(
        f"🔄 {'[РЕЖИМ ТЕСТА]' if dry_run else '[РЕАЛЬНОЕ ПЕРЕМЕЩЕНИЕ]'} ПЕРЕРАСПРЕДЕЛЕНИЕ ТОВАРОВ"
    )
    print(f"{'=' * 80}\n")

    # Получаем все универсальные категории
    universal_categories = (
        supabase.table("categories").select("*").like("slug", "universal-%").execute()
    ).data

    if not universal_categories:
        print("❌ Универсальные категории не найдены")
        return

    # Получаем все категории brand-type для маппинга
    all_categories = supabase.table("categories").select("*").execute().data
    category_map = {cat["slug"]: cat["id"] for cat in all_categories}

    stats = {
        "total_checked": 0,
        "redistributed": 0,
        "no_brand": 0,
        "no_category": 0,
        "errors": 0,
    }

    for univ_category in universal_categories:
        category_id = univ_category["id"]
        category_slug = univ_category["slug"]

        # Определяем тип запчасти из slug (например: universal-filters -> filters)
        part_type = get_part_type_from_category_slug(category_slug)

        if not part_type:
            print(f"⚠️  Не удалось определить тип запчасти для {category_slug}")
            continue

        print(f"\n📂 Обрабатываем: {category_slug} (тип: {part_type})")

        # Получаем товары
        products = (
            supabase.table("products")
            .select("id, name, category_id")
            .eq("category_id", category_id)
            .execute()
        ).data

        print(f"   Товаров: {len(products)}")

        for product in products:
            stats["total_checked"] += 1

            # Определяем бренд
            brand = detect_brand_from_name(product["name"])

            if not brand:
                stats["no_brand"] += 1
                continue

            # Формируем новый slug категории: brand-parttype
            new_category_slug = f"{brand}-{part_type}"

            # Проверяем существует ли такая категория
            if new_category_slug not in category_map:
                stats["no_category"] += 1
                print(f"   ⚠️  Категория не найдена: {new_category_slug}")
                continue

            new_category_id = category_map[new_category_slug]

            # Перемещаем товар
            if not dry_run:
                try:
                    supabase.table("products").update(
                        {"category_id": new_category_id}
                    ).eq("id", product["id"]).execute()

                    stats["redistributed"] += 1

                    if stats["redistributed"] % 100 == 0:
                        print(f"   ✅ Перемещено: {stats['redistributed']}")

                except Exception as e:
                    print(f"   ❌ Ошибка при перемещении {product['name'][:50]}: {e}")
                    stats["errors"] += 1
            else:
                stats["redistributed"] += 1

    # Итоговая статистика
    print(f"\n{'=' * 80}")
    print("📊 ИТОГОВАЯ СТАТИСТИКА")
    print(f"{'=' * 80}\n")
    print(f"Проверено товаров: {stats['total_checked']}")
    print(f"✅ Готово к перемещению: {stats['redistributed']}")
    print(f"⚠️  Без определенного бренда: {stats['no_brand']}")
    print(f"⚠️  Категория не найдена: {stats['no_category']}")
    print(f"❌ Ошибок: {stats['errors']}")

    return stats


def main():
    print("""
╔════════════════════════════════════════════════════════════════════════════╗
║                  ПЕРЕРАСПРЕДЕЛЕНИЕ УНИВЕРСАЛЬНЫХ ТОВАРОВ                   ║
╚════════════════════════════════════════════════════════════════════════════╝
    """)

    # Шаг 1: Анализ
    brand_dist, undetected = analyze_universal_products()

    # Шаг 2: Тестовое перемещение
    print("\n\n")
    input("Нажмите Enter для запуска ТЕСТОВОГО перераспределения...")
    redistribute_products(dry_run=True)

    # Шаг 3: Реальное перемещение
    print("\n\n")
    response = input("❗ Выполнить РЕАЛЬНОЕ перемещение товаров? (yes/no): ")

    if response.lower() == "yes":
        redistribute_products(dry_run=False)
        print("\n✅ ПЕРЕРАСПРЕДЕЛЕНИЕ ЗАВЕРШЕНО!")
    else:
        print("\n❌ Перемещение отменено")


if __name__ == "__main__":
    main()
