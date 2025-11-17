#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Парсинг подкатегорий из "Запчасти для тракторов"
"""

import json
import requests
from bs4 import BeautifulSoup

BASE_URL = "https://xn----7sbabpgpk4bsbesjp1f.xn--p1ai"
CATEGORY_URL = f"{BASE_URL}/product-category/запчасти-для-тракторов/"

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
})

def parse_subcategories():
    """Парсит подкатегории"""
    print("🔍 Парсинг подкатегорий из: Запчасти для тракторов")
    print(f"📍 URL: {CATEGORY_URL}\n")

    try:
        response = session.get(CATEGORY_URL, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")

        subcategories = []

        # Метод 1: Ищем через .product-categories
        subcat_links = soup.select(".product-categories a")
        print(f"✓ Метод 1 (.product-categories a): найдено {len(subcat_links)} ссылок")

        for link in subcat_links:
            href = link.get("href")
            name = link.get_text(strip=True)

            # Извлекаем количество товаров из текста
            count = 0
            count_elem = link.select_one(".count")
            if count_elem:
                count_text = count_elem.get_text(strip=True)
                count = int(count_text.replace("(", "").replace(")", ""))

            if href and name:
                subcategories.append({
                    "name": name,
                    "url": href,
                    "count": count
                })

        # Метод 2: Ищем через .cat-item
        if not subcategories:
            cat_items = soup.select(".cat-item a, .product-category a")
            print(f"✓ Метод 2 (.cat-item a): найдено {len(cat_items)} ссылок")

            for link in cat_items:
                href = link.get("href")
                name = link.get_text(strip=True)

                if href and name:
                    subcategories.append({
                        "name": name,
                        "url": href,
                        "count": 0
                    })

        # Метод 3: Ищем все ссылки с product-category в URL
        if not subcategories:
            all_links = soup.select("a[href*='product-category']")
            print(f"✓ Метод 3 (все ссылки с product-category): найдено {len(all_links)} ссылок")

            seen = set()
            for link in all_links:
                href = link.get("href")
                name = link.get_text(strip=True)

                if href and name and href not in seen:
                    seen.add(href)
                    subcategories.append({
                        "name": name,
                        "url": href,
                        "count": 0
                    })

        # Дедупликация по URL
        unique_subcats = {}
        for subcat in subcategories:
            url = subcat["url"]
            if url not in unique_subcats:
                unique_subcats[url] = subcat

        result = list(unique_subcats.values())

        # Сортируем по количеству товаров
        result.sort(key=lambda x: x.get("count", 0), reverse=True)

        return result

    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return []

def main():
    print("=" * 70)
    print("  ПАРСИНГ ПОДКАТЕГОРИЙ: Запчасти для тракторов")
    print("=" * 70 + "\n")

    subcategories = parse_subcategories()

    if subcategories:
        print(f"\n✅ Найдено подкатегорий: {len(subcategories)}\n")
        print("=" * 70)

        total_products = 0
        for i, subcat in enumerate(subcategories, 1):
            count = subcat.get("count", 0)
            total_products += count

            print(f"{i:2}. {subcat['name']}")
            print(f"    URL: {subcat['url']}")
            if count > 0:
                print(f"    Товаров: {count}")
            print()

        print("=" * 70)
        if total_products > 0:
            print(f"📊 ВСЕГО товаров в подкатегориях: {total_products}")
        print("=" * 70)

        # Сохраняем результат
        output_file = "parsed_data/agrodom/tractor-parts-subcategories.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(subcategories, f, ensure_ascii=False, indent=2)

        print(f"\n💾 Результат сохранен в: {output_file}")

    else:
        print("\n❌ Подкатегории не найдены!")
        print("\n🔍 Попробуем посмотреть структуру страницы...")

        # Отладочная информация
        response = session.get(CATEGORY_URL, timeout=30)
        soup = BeautifulSoup(response.content, "html.parser")

        print("\n📋 Найденные классы на странице:")
        all_classes = set()
        for elem in soup.find_all(class_=True):
            all_classes.update(elem.get("class", []))

        relevant_classes = [c for c in all_classes if any(
            word in c.lower() for word in ['category', 'product', 'cat', 'menu', 'nav']
        )]

        for cls in sorted(relevant_classes)[:20]:
            print(f"  - .{cls}")

if __name__ == "__main__":
    main()
