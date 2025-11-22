#!/usr/bin/env python3
"""
Поиск изображений с водяными знаками в базе данных
Проверяет URL и определяет наличие watermark по домену и пути
"""

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


def check_for_watermarks():
    """Находит товары с потенциальными водяными знаками"""
    print("\n" + "=" * 70)
    print("ПОИСК ИЗОБРАЖЕНИЙ С ВОДЯНЫМИ ЗНАКАМИ")
    print("=" * 70 + "\n")

    # Паттерны для определения водяных знаков
    watermark_patterns = [
        "watermark",
        "wm",
        "logo",
        "branded",
        "/w/",
        "/wm/",
        "_wm",
        "-wm",
        "водяной",
        "знак",
    ]

    # Домены, которые ОБЫЧНО добавляют водяные знаки
    # (для дальнейшей ручной проверки)
    domains_to_check = [
        "zip-agro.ru",
        "tata-agro-moto.com",
    ]

    # Получаем все товары с изображениями
    all_products = []
    page_size = 1000
    offset = 0

    print("📥 Загружаем товары из БД...")
    while True:
        response = (
            supabase.table("products")
            .select("id, name, image_url, manufacturer, specifications")
            .range(offset, offset + page_size - 1)
            .execute()
        )

        if not response.data:
            break

        all_products.extend(response.data)
        offset += page_size

        if len(response.data) < page_size:
            break

    print(f"✅ Загружено товаров: {len(all_products):,}\n")

    # Анализируем изображения
    products_with_watermarks = []
    products_without_images = []
    products_to_check_manually = []  # Требуют визуальной проверки
    by_domain = defaultdict(int)
    watermark_by_brand = defaultdict(int)
    check_by_brand = defaultdict(int)

    for product in all_products:
        image_url = product.get("image_url", "")

        if not image_url:
            products_without_images.append(product)
            continue

        # Подсчет по доменам
        if "zip-agro.ru" in image_url:
            by_domain["zip-agro.ru"] += 1
        elif "tata-agro-moto.com" in image_url:
            by_domain["tata-agro-moto.com"] += 1
        else:
            by_domain["other"] += 1

        # Проверка на водяные знаки в URL
        has_watermark = False
        for pattern in watermark_patterns:
            if pattern.lower() in image_url.lower():
                has_watermark = True
                break

        if has_watermark:
            products_with_watermarks.append(product)
            brand = product.get("manufacturer", "UNKNOWN")
            watermark_by_brand[brand] += 1

        # Помечаем товары из подозрительных доменов для ручной проверки
        needs_check = False
        for domain in domains_to_check:
            if domain in image_url:
                needs_check = True
                break

        if needs_check:
            products_to_check_manually.append(product)
            brand = product.get("manufacturer", "UNKNOWN")
            check_by_brand[brand] += 1

    # Вывод статистики
    print("📊 СТАТИСТИКА ПО ИЗОБРАЖЕНИЯМ")
    print("-" * 70)
    print(f"{'Всего товаров:':<40} {len(all_products):>10,}")
    print(f"{'С изображениями:':<40} {len(all_products) - len(products_without_images):>10,}")
    print(f"{'Без изображений:':<40} {len(products_without_images):>10,}")
    print(f"{'С водяными знаками в URL:':<40} {len(products_with_watermarks):>10,}")
    print(f"{'⚠️  ТРЕБУЮТ РУЧНОЙ ПРОВЕРКИ:':<40} {len(products_to_check_manually):>10,}")
    print("-" * 70 + "\n")

    print("📊 РАСПРЕДЕЛЕНИЕ ПО ДОМЕНАМ")
    print("-" * 70)
    for domain, count in sorted(by_domain.items(), key=lambda x: x[1], reverse=True):
        print(f"{domain:<40} {count:>10,}")
    print("-" * 70 + "\n")

    if watermark_by_brand:
        print("📊 ВОДЯНЫЕ ЗНАКИ ПО БРЕНДАМ (найдено в URL)")
        print("-" * 70)
        for brand, count in sorted(watermark_by_brand.items(), key=lambda x: x[1], reverse=True):
            print(f"{brand:<40} {count:>10,}")
        print("-" * 70 + "\n")

    if check_by_brand:
        print("⚠️  ТОВАРЫ ДЛЯ РУЧНОЙ ПРОВЕРКИ ПО БРЕНДАМ")
        print("-" * 70)
        print("(изображения с zip-agro.ru и tata-agro-moto.com)")
        print("-" * 70)
        for brand, count in sorted(check_by_brand.items(), key=lambda x: x[1], reverse=True):
            print(f"{brand:<40} {count:>10,}")
        print("-" * 70 + "\n")

    # Примеры товаров с водяными знаками
    if products_with_watermarks:
        print("📋 ПРИМЕРЫ ТОВАРОВ С ВОДЯНЫМИ ЗНАКАМИ В URL (Топ-20)")
        print("-" * 70)
        for i, p in enumerate(products_with_watermarks[:20], 1):
            print(f"\n{i}. {p['name'][:50]}")
            print(f"   ID: {p['id']}")
            print(f"   Brand: {p.get('manufacturer', 'N/A')}")
            print(f"   URL: {p['image_url'][:100]}...")

    # Товары без изображений
    if products_without_images:
        print(f"\n\n⚠️  ТОВАРЫ БЕЗ ИЗОБРАЖЕНИЙ ({len(products_without_images)})")
        print("-" * 70)
        for i, p in enumerate(products_without_images[:10], 1):
            print(f"{i}. [{p.get('manufacturer', 'N/A'):10}] {p['name'][:50]}")

    # Сохраняем списки товаров
    import json

    if products_with_watermarks:
        print("\n\n💾 СОХРАНЕНИЕ СПИСКА ТОВАРОВ С ВОДЯНЫМИ ЗНАКАМИ")
        print("-" * 70)

        output_file = "watermarked_products.json"

        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(products_with_watermarks, f, ensure_ascii=False, indent=2)

        print(f"✅ Сохранено в {output_file}")
        print(f"   Товаров: {len(products_with_watermarks):,}")

    if products_to_check_manually:
        print("\n💾 СОХРАНЕНИЕ СПИСКА ДЛЯ РУЧНОЙ ПРОВЕРКИ")
        print("-" * 70)

        output_file = "products_to_check_manually.json"

        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(products_to_check_manually, f, ensure_ascii=False, indent=2)

        print(f"✅ Сохранено в {output_file}")
        print(f"   Товаров: {len(products_to_check_manually):,}")
        print("\n💡 Эти товары используют изображения с zip-agro.ru и tata-agro-moto.com")
        print("   Рекомендуется визуально проверить на наличие водяных знаков")

    return {
        "total": len(all_products),
        "with_watermarks": len(products_with_watermarks),
        "to_check_manually": len(products_to_check_manually),
        "without_images": len(products_without_images),
        "by_domain": dict(by_domain),
        "watermark_by_brand": dict(watermark_by_brand),
        "check_by_brand": dict(check_by_brand),
    }


def mark_watermarked_products():
    """Помечает товары с водяными знаками в БД (добавляет флаг в specifications)"""
    print("\n" + "=" * 70)
    print("ПОМЕТКА ТОВАРОВ С ВОДЯНЫМИ ЗНАКАМИ В БД")
    print("=" * 70 + "\n")

    confirm = input("⚠️  Пометить товары с водяными знаками? (yes/no): ").strip().lower()
    if confirm != "yes":
        print("❌ Отменено")
        return

    # Загружаем список из файла
    if not os.path.exists("watermarked_products.json"):
        print("❌ Файл watermarked_products.json не найден")
        print("   Сначала запустите поиск водяных знаков (опция 1)")
        return

    import json
    with open("watermarked_products.json", "r", encoding="utf-8") as f:
        products = json.load(f)

    print(f"📊 Товаров для пометки: {len(products):,}\n")

    updated = 0
    for product in products:
        try:
            specs = product.get("specifications", {}) or {}
            specs["has_watermark"] = True
            specs["watermark_source"] = "url_pattern_detected"

            supabase.table("products").update(
                {"specifications": specs}
            ).eq("id", product["id"]).execute()

            updated += 1

            if updated % 100 == 0:
                print(f"✅ Обновлено {updated}/{len(products)}")

        except Exception as e:
            print(f"❌ Ошибка обновления ID {product['id']}: {e}")

    print(f"\n✅ Всего помечено товаров: {updated:,}")
    print("\n💡 Теперь вы можете фильтровать товары по флагу:")
    print("   specifications->>'has_watermark' = 'true'")


def main():
    """Главное меню"""
    print("\n" + "=" * 70)
    print("ПОИСК И УПРАВЛЕНИЕ ВОДЯНЫМИ ЗНАКАМИ")
    print("=" * 70 + "\n")

    print("1. Найти изображения с водяными знаками")
    print("2. Пометить товары с водяными знаками в БД")
    print("3. Выполнить оба действия")
    print("0. Выход")

    choice = input("\nВведите номер: ").strip()

    if choice == "1":
        check_for_watermarks()
    elif choice == "2":
        mark_watermarked_products()
    elif choice == "3":
        check_for_watermarks()
        print("\n" + "=" * 70 + "\n")
        mark_watermarked_products()
    elif choice == "0":
        print("👋 До свидания!")
    else:
        print("❌ Неверный выбор")


if __name__ == "__main__":
    main()
