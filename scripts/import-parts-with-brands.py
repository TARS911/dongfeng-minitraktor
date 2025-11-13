#!/usr/bin/env python3
"""
Импортирует запчасти в БД с определением бренда из названия товара
"""

import json
import os
import re

from supabase import create_client


# Загружаем переменные окружения из .env файла
def load_env():
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
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

# Маппинг категорий типа запчастей на slug
PART_TYPE_MAPPING = {
    "Двигателя дизельные": "diesel-engines",
    "Фильтра": "filters",
    "Прочие запчасти": "other-parts",
    "Стартеры, Генераторы": "starters-generators",
    "Универсальные комплектующие": "universal-parts",
    "Сиденья (кресла)": "seats",
    "ЗИП": "spare-parts-kits",
    "Ожидается": "coming-soon",
}

# Бренды для определения из названия товара
BRAND_KEYWORDS = {
    "uralets": ["уралец", "uralets", "уралец"],
    "dongfeng": ["dongfeng", "донгфенг", "донфенг", "dong feng"],
    "jinma": ["jinma", "джинма", "цзинма"],
    "xingtai": ["xingtai", "синтай", "синьтай"],
    "foton": ["foton", "фотон", "lovol", "ловол"],
    "swatt": ["swatt", "сват", "свот"],
    "shifeng": ["shifeng", "шифенг"],
    "булат": ["булат", "bulat"],
    "скаут": ["скаут", "scout"],
    "беларус": ["беларус", "belarus", "мтз"],
    "кентавр": ["кентавр", "kentavr"],
    "zubr": ["zubr", "зубр"],
    "crosser": ["crosser", "кроссер"],
    "dw": ["dw"],
    "ty": ["ty290", "ty295", "ty2100", "ty395"],
    "км": ["км385", "км490", "км495"],
    "jd": ["jd295", "jd385"],
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


def get_or_create_category(part_type_category, brand_slug):
    """Получает или создает категорию brand-parttype"""

    # Формируем slug категории: например "uralets-filters"
    category_slug = f"{brand_slug}-{part_type_category}"

    # Ищем категорию в БД
    result = (
        supabase.table("categories").select("*").eq("slug", category_slug).execute()
    )

    if result.data:
        return result.data[0]["id"]

    # Если категории нет - возвращаем None (не создаем автоматически)
    return None


def get_universal_category(part_type_category):
    """Получает универсальную категорию для товаров без бренда"""

    # Универсальные категории имеют префикс "universal-"
    category_slug = f"universal-{part_type_category}"

    result = (
        supabase.table("categories").select("*").eq("slug", category_slug).execute()
    )

    if result.data:
        return result.data[0]["id"]

    return None


def import_products(products):
    """Импортирует товары в БД"""

    print(f"\n{'=' * 70}")
    print("ИМПОРТ ТОВАРОВ В БАЗУ ДАННЫХ")
    print(f"{'=' * 70}")

    stats = {
        "total": len(products),
        "imported": 0,
        "skipped_no_brand": 0,
        "skipped_no_category": 0,
        "skipped_no_price": 0,
        "errors": 0,
    }

    brand_stats = {}
    category_stats = {}

    for i, product in enumerate(products, 1):
        name = product.get("name", "")
        category = product.get("category", "")
        price_str = product.get("price", "")
        image_url = product.get("image_url", "")
        link = product.get("link", product.get("url", ""))

        if i % 50 == 0:
            print(f"\nОбработано: {i}/{len(products)}")

        # Определяем тип запчасти
        part_type = PART_TYPE_MAPPING.get(category)
        if not part_type:
            print(f"  ⚠ Неизвестная категория: {category}")
            stats["skipped_no_category"] += 1
            continue

        # Определяем бренд из названия
        brand_slug = detect_brand_from_name(name)

        if not brand_slug:
            # Пробуем использовать универсальную категорию
            category_id = get_universal_category(part_type)
            if not category_id:
                stats["skipped_no_brand"] += 1
                continue
        else:
            # Получаем категорию brand-parttype
            category_id = get_or_create_category(part_type, brand_slug)
            if not category_id:
                stats["skipped_no_category"] += 1
                continue

        # Парсим цену
        price = None
        if price_str:
            try:
                # Убираем все кроме цифр и точки
                price_clean = re.sub(r"[^\d.]", "", price_str)
                if price_clean:
                    price = float(price_clean)
            except:
                pass

        if not price:
            stats["skipped_no_price"] += 1
            continue

        # Формируем данные для импорта
        product_data = {
            "name": name,
            "category_id": category_id,
            "price": price,
            "image_url": image_url,
            "in_stock": True,
            "is_featured": False,
        }

        try:
            # Проверяем существует ли товар
            existing = (
                supabase.table("products")
                .select("id")
                .eq("name", name)
                .eq("category_id", category_id)
                .execute()
            )

            if existing.data:
                # Товар уже существует - пропускаем
                continue

            # Импортируем товар
            supabase.table("products").insert(product_data).execute()

            stats["imported"] += 1

            # Статистика
            brand_stats[brand_slug or "universal"] = (
                brand_stats.get(brand_slug or "universal", 0) + 1
            )
            category_stats[category] = category_stats.get(category, 0) + 1

        except Exception as e:
            print(f"  ✗ Ошибка: {name[:50]}... - {e}")
            stats["errors"] += 1

    # Выводим статистику
    print(f"\n{'=' * 70}")
    print("📊 СТАТИСТИКА ИМПОРТА")
    print(f"{'=' * 70}")
    print(f"Всего товаров: {stats['total']}")
    print(f"✅ Импортировано: {stats['imported']}")
    print(f"⚠ Пропущено (нет бренда): {stats['skipped_no_brand']}")
    print(f"⚠ Пропущено (нет категории): {stats['skipped_no_category']}")
    print(f"⚠ Пропущено (нет цены): {stats['skipped_no_price']}")
    print(f"❌ Ошибок: {stats['errors']}")

    print(f"\n📋 По брендам:")
    for brand, count in sorted(brand_stats.items(), key=lambda x: x[1], reverse=True):
        print(f"  • {brand}: {count} товаров")

    print(f"\n📋 По категориям:")
    for cat, count in sorted(category_stats.items(), key=lambda x: x[1], reverse=True):
        print(f"  • {cat}: {count} товаров")

    return stats


def main():
    print("Загрузка товаров из parts-final.json...")

    with open("parsed_data/agrodom/parts-final.json", "r", encoding="utf-8") as f:
        products = json.load(f)

    print(f"Загружено товаров: {len(products)}")

    # Импортируем товары
    stats = import_products(products)

    print(f"\n{'=' * 70}")
    print("✅ ИМПОРТ ЗАВЕРШЕН!")
    print(f"{'=' * 70}")

    print(f"{'=' * 70}")


if __name__ == "__main__":
    main()
