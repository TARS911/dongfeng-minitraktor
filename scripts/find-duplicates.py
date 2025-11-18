#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Поиск дубликатов в организованных данных запчастей
"""
import json
import sys
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

INPUT_FILE = "parsed_data/agrodom/organized/all-parts-organized.json"

def find_duplicates(products):
    """Находит дубликаты по названию и другим полям"""

    # По названию
    by_name = defaultdict(list)
    # По названию + цене
    by_name_price = defaultdict(list)
    # По ссылке
    by_link = defaultdict(list)

    for idx, product in enumerate(products):
        name = product.get('name', '').strip().lower()
        price = product.get('price', '').strip()
        link = product.get('link', '').strip()

        if name:
            by_name[name].append(idx)

        if name and price:
            key = f"{name}|{price}"
            by_name_price[key].append(idx)

        if link:
            by_link[link].append(idx)

    # Анализ дубликатов
    name_duplicates = {k: v for k, v in by_name.items() if len(v) > 1}
    name_price_duplicates = {k: v for k, v in by_name_price.items() if len(v) > 1}
    link_duplicates = {k: v for k, v in by_link.items() if len(v) > 1}

    return {
        'by_name': name_duplicates,
        'by_name_price': name_price_duplicates,
        'by_link': link_duplicates
    }

def main():
    print("\n" + "="*70)
    print("ПОИСК ДУБЛИКАТОВ В ДАННЫХ")
    print("="*70 + "\n")

    # Загружаем данные
    print(f"📂 Загрузка данных из {INPUT_FILE}...")
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        products = json.load(f)
    print(f"✅ Загружено {len(products)} товаров\n")

    # Ищем дубликаты
    print("🔍 Поиск дубликатов...\n")
    duplicates = find_duplicates(products)

    # Отчёт по названиям
    print("=" * 70)
    print("📊 ДУБЛИКАТЫ ПО НАЗВАНИЮ (без учёта регистра)")
    print("=" * 70)

    if duplicates['by_name']:
        total_dup_items = sum(len(v) for v in duplicates['by_name'].values())
        unique_dup_names = len(duplicates['by_name'])

        print(f"\n⚠️  Найдено {unique_dup_names} уникальных названий с дубликатами")
        print(f"⚠️  Всего дублирующихся записей: {total_dup_items}")
        print(f"⚠️  Можно удалить примерно: {total_dup_items - unique_dup_names} записей\n")

        # Показываем примеры
        print("Примеры дубликатов (первые 20):")
        for i, (name, indices) in enumerate(list(duplicates['by_name'].items())[:20], 1):
            print(f"\n{i}. '{name.title()}' - {len(indices)} экземпляров:")
            for idx in indices[:3]:  # Показываем первые 3
                product = products[idx]
                print(f"   • #{idx}: {product.get('price', 'N/A'):15s} | "
                      f"{product.get('brand', 'N/A'):15s} | "
                      f"{product.get('category', 'N/A')}")
    else:
        print("✅ Дубликатов по названию НЕ НАЙДЕНО\n")

    # Отчёт по названию + цене
    print("\n" + "=" * 70)
    print("📊 ПОЛНЫЕ ДУБЛИКАТЫ (название + цена)")
    print("=" * 70)

    if duplicates['by_name_price']:
        total_exact_dup = sum(len(v) for v in duplicates['by_name_price'].values())
        unique_exact = len(duplicates['by_name_price'])

        print(f"\n⚠️  Найдено {unique_exact} уникальных пар (название + цена)")
        print(f"⚠️  Всего точных дубликатов: {total_exact_dup}")
        print(f"⚠️  Можно удалить: {total_exact_dup - unique_exact} записей\n")

        print("Примеры (первые 15):")
        for i, (key, indices) in enumerate(list(duplicates['by_name_price'].items())[:15], 1):
            name, price = key.split('|')
            print(f"\n{i}. '{name.title()}' @ {price} - {len(indices)} копий:")
            for idx in indices[:3]:
                product = products[idx]
                print(f"   • #{idx}: {product.get('brand', 'N/A'):15s} | "
                      f"{product.get('category', 'N/A')}")
    else:
        print("✅ Точных дубликатов НЕ НАЙДЕНО\n")

    # Отчёт по ссылкам
    print("\n" + "=" * 70)
    print("📊 ДУБЛИКАТЫ ПО ССЫЛКЕ (один URL → несколько записей)")
    print("=" * 70)

    if duplicates['by_link']:
        total_link_dup = sum(len(v) for v in duplicates['by_link'].values())
        unique_links = len(duplicates['by_link'])

        print(f"\n⚠️  Найдено {unique_links} уникальных ссылок с дубликатами")
        print(f"⚠️  Всего дублирующихся записей: {total_link_dup}")
        print(f"⚠️  Можно удалить: {total_link_dup - unique_links} записей\n")

        print("Примеры (первые 10):")
        for i, (link, indices) in enumerate(list(duplicates['by_link'].items())[:10], 1):
            print(f"\n{i}. {len(indices)} копий одной ссылки:")
            for idx in indices:
                product = products[idx]
                print(f"   • #{idx}: {product.get('name', 'N/A')[:50]}")
    else:
        print("✅ Дубликатов по ссылкам НЕ НАЙДЕНО\n")

    # Итоговая статистика
    print("\n" + "=" * 70)
    print("📈 ИТОГОВАЯ СТАТИСТИКА")
    print("=" * 70)
    print(f"\n• Всего товаров: {len(products)}")
    print(f"• Уникальных названий: {len(set(p.get('name', '').strip().lower() for p in products))}")
    print(f"• Уникальных ссылок: {len(set(p.get('link', '').strip() for p in products if p.get('link')))}")

    if duplicates['by_name_price']:
        items_to_remove = sum(len(v) - 1 for v in duplicates['by_name_price'].values())
        print(f"\n🗑️  Рекомендуется удалить: ~{items_to_remove} дубликатов")
        print(f"✨  После очистки останется: ~{len(products) - items_to_remove} товаров")

    print("\n" + "=" * 70 + "\n")

if __name__ == "__main__":
    main()
