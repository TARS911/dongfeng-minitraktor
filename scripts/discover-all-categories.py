#!/usr/bin/env python3
"""
Находит ВСЕ категории и подкатегории запчастей на сайте
"""

import json
import time

from playwright.sync_api import sync_playwright

BASE_URL = "https://xn----7sbabpgpk4bsbesjp1f.xn--p1ai"


def discover_all_categories():
    """Находит все категории запчастей на сайте"""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Идем на главную страницу магазина
        shop_url = f"{BASE_URL}/shop/"
        print(f"Открываем: {shop_url}")
        page.goto(shop_url, wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)

        # Ищем все категории в сайдбаре или меню
        categories = []

        # Вариант 1: Ищем виджет категорий
        category_links = page.query_selector_all(
            "aside .product-categories a, .widget_product_categories a"
        )

        if not category_links:
            # Вариант 2: Ищем все ссылки на категории
            category_links = page.query_selector_all("a[href*='product-category']")

        print(f"\nНайдено ссылок на категории: {len(category_links)}")

        seen_urls = set()
        for link in category_links:
            try:
                url = link.get_attribute("href")
                text = link.inner_text().strip()

                if url and url not in seen_urls and "product-category" in url:
                    seen_urls.add(url)

                    # Извлекаем количество товаров если есть
                    count_elem = link.query_selector(".count")
                    count = count_elem.inner_text().strip() if count_elem else "?"

                    categories.append({"name": text, "url": url, "count": count})
                    print(f"  ✓ {text} ({count}) - {url}")

            except Exception as e:
                continue

        browser.close()

        return categories


def main():
    print("Поиск всех категорий запчастей на agrodom.ru\n")

    categories = discover_all_categories()

    # Сохраняем результат
    output_file = "parsed_data/agrodom/all-categories.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(categories, f, ensure_ascii=False, indent=2)

    print(f"\n{'=' * 60}")
    print(f"Найдено категорий: {len(categories)}")
    print(f"Сохранено в: {output_file}")
    print(f"{'=' * 60}")

    # Группируем по родительским категориям
    print("\nКатегории по группам:")
    for cat in categories:
        print(f"  {cat['name']}: {cat['count']} товаров")


if __name__ == "__main__":
    main()
