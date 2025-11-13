#!/usr/bin/env python3
"""
Объединяет данные из parts.json и parts-all.json
Удаляет подкатегории и дубликаты товаров
"""

import json


def is_subcategory(item):
    """Проверяет является ли запись подкатегорией"""
    name = item.get("name", "")
    url = item.get("url", item.get("link", ""))

    # Подкатегории имеют формат "Название (число)" и ссылку на product-category
    has_count = "(" in name and ")" in name
    is_category_url = url and "product-category" in url
    no_price = not item.get("price")

    return has_count and is_category_url and no_price


def clean_name(name):
    """Очищает название для сравнения"""
    return name.lower().strip()


def main():
    print("=" * 70)
    print("ОБЪЕДИНЕНИЕ И ДЕДУПЛИКАЦИЯ ДАННЫХ")
    print("=" * 70)

    # Загружаем оба файла
    print("\nЗагрузка файлов...")

    with open("parsed_data/agrodom/parts.json", "r", encoding="utf-8") as f:
        old_data = json.load(f)
    print(f"  parts.json: {len(old_data)} записей")

    with open("parsed_data/agrodom/parts-all.json", "r", encoding="utf-8") as f:
        new_data = json.load(f)
    print(f"  parts-all.json: {len(new_data)} записей")

    # Фильтруем старые данные - убираем подкатегории
    print("\nФильтрация старых данных...")
    old_products = [item for item in old_data if not is_subcategory(item)]
    old_subcategories = len(old_data) - len(old_products)
    print(f"  Удалено подкатегорий: {old_subcategories}")
    print(f"  Осталось товаров: {len(old_products)}")

    # Объединяем данные
    print("\nОбъединение данных...")
    all_products = old_products + new_data
    print(f"  Всего записей: {len(all_products)}")

    # Дедупликация по названию и ссылке
    print("\nУдаление дубликатов...")
    seen = {}
    unique_products = []
    duplicates = 0

    for product in all_products:
        name = clean_name(product.get("name", ""))
        url = product.get("url", product.get("link", ""))

        # Ключ для уникальности - комбинация названия и URL
        key = (name, url)

        if key not in seen:
            seen[key] = True
            unique_products.append(product)
        else:
            duplicates += 1

    print(f"  Удалено дубликатов: {duplicates}")
    print(f"  Уникальных товаров: {len(unique_products)}")

    # Сохраняем результат
    output_file = "parsed_data/agrodom/parts-final.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(unique_products, f, ensure_ascii=False, indent=2)

    print(f"\n{'=' * 70}")
    print(f"✅ ГОТОВО!")
    print(f"{'=' * 70}")
    print(f"Финальный файл: {output_file}")
    print(f"Уникальных товаров: {len(unique_products)}")

    # Статистика по категориям
    print(f"\n📋 СТАТИСТИКА ПО КАТЕГОРИЯМ:")
    print(f"{'=' * 70}")
    category_counts = {}
    for product in unique_products:
        cat = product.get("category", "Без категории")
        category_counts[cat] = category_counts.get(cat, 0) + 1

    for cat, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  • {cat}: {count} товаров")
    print(f"{'=' * 70}")


if __name__ == "__main__":
    main()
