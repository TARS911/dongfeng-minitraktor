#!/usr/bin/env python3
"""
Полный парсер всех запчастей с agrodom.ru
Парсит ВСЕ категории запчастей без пропусков
"""

import json
import time
from urllib.parse import urljoin

from playwright.sync_api import sync_playwright

BASE_URL = "https://xn----7sbabpgpk4bsbesjp1f.xn--p1ai"

# Все основные категории запчастей на сайте
MAIN_CATEGORIES = [
    f"{BASE_URL}/product-category/jinma/",
    f"{BASE_URL}/product-category/xingtai-uralets-swatt-ot-12-24-l-s/",
    f"{BASE_URL}/product-category/dongfeng/",
    f"{BASE_URL}/product-category/foton-lovol/",
    f"{BASE_URL}/product-category/zapchasti-k-swatt/",
    f"{BASE_URL}/product-category/zapchasti-dlja-minitraktorov-serija-t/",
    f"{BASE_URL}/product-category/zapchasti-k-amerikanskim-traktoram/",
    f"{BASE_URL}/product-category/prochie-zapchasti/",
]


def parse_category(page, category_url, category_name):
    """Парсит все товары из одной категории со всех страниц пагинации"""
    print(f"\n{'=' * 60}")
    print(f"Парсинг категории: {category_name}")
    print(f"URL: {category_url}")
    print(f"{'=' * 60}")

    products = []
    page_num = 1

    while True:
        if page_num == 1:
            url = category_url
        else:
            url = f"{category_url}page/{page_num}/"

        print(f"\nСтраница {page_num}: {url}")

        try:
            page.goto(url, wait_until="domcontentloaded", timeout=30000)
            time.sleep(2)

            # Ищем товары на странице
            product_cards = page.query_selector_all("li.product")

            if not product_cards:
                print(f"  ✓ Нет товаров на странице {page_num}, это конец категории")
                break

            print(f"  Найдено товаров на странице: {len(product_cards)}")

            for card in product_cards:
                try:
                    # Название
                    name_elem = card.query_selector(
                        "h2.woocommerce-loop-product__title"
                    )
                    name = name_elem.inner_text().strip() if name_elem else None

                    # Ссылка
                    link_elem = card.query_selector("a.woocommerce-LoopProduct-link")
                    link = link_elem.get_attribute("href") if link_elem else None

                    # Цена
                    price_elem = card.query_selector("span.woocommerce-Price-amount")
                    price = price_elem.inner_text().strip() if price_elem else None

                    # Изображение
                    img_elem = card.query_selector("img")
                    image_url = None
                    if img_elem:
                        image_url = img_elem.get_attribute(
                            "src"
                        ) or img_elem.get_attribute("data-src")

                    # Артикул (если есть)
                    sku = None

                    if name and link:
                        product = {
                            "name": name,
                            "category": category_name,
                            "price": price,
                            "image_url": image_url,
                            "link": link,
                            "sku": sku,
                        }
                        products.append(product)

                except Exception as e:
                    print(f"    Ошибка при парсинге товара: {e}")
                    continue

            print(f"  ✓ Спарсено с этой страницы: {len(product_cards)} товаров")
            print(f"  Всего в категории: {len(products)} товаров")

            # Проверяем есть ли кнопка "Следующая страница"
            next_button = page.query_selector("a.next.page-numbers")
            if not next_button:
                print(f"  ✓ Нет кнопки 'Далее', это последняя страница")
                break

            page_num += 1

        except Exception as e:
            print(f"  ✗ Ошибка при парсинге страницы {page_num}: {e}")
            break

    print(f"\n✓ Категория '{category_name}' завершена: {len(products)} товаров")
    return products


def main():
    print("Запуск полного парсера запчастей agrodom.ru")
    print(f"Будет спарсено {len(MAIN_CATEGORIES)} основных категорий\n")

    all_products = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        for i, category_url in enumerate(MAIN_CATEGORIES, 1):
            # Извлекаем имя категории из URL
            category_slug = category_url.rstrip("/").split("/")[-1]
            category_name = category_slug.replace("-", " ").title()

            print(
                f"\n[{i}/{len(MAIN_CATEGORIES)}] Обрабатываем категорию: {category_name}"
            )

            try:
                category_products = parse_category(page, category_url, category_name)
                all_products.extend(category_products)

                print(f"\n{'=' * 60}")
                print(f"ИТОГО собрано товаров: {len(all_products)}")
                print(f"{'=' * 60}")

                # Сохраняем промежуточный результат после каждой категории
                with open(
                    "parsed_data/agrodom/parts-complete-temp.json",
                    "w",
                    encoding="utf-8",
                ) as f:
                    json.dump(all_products, f, ensure_ascii=False, indent=2)
                print(f"✓ Промежуточный результат сохранен")

                # Небольшая пауза между категориями
                time.sleep(3)

            except Exception as e:
                print(f"\n✗ ОШИБКА при парсинге категории {category_name}: {e}")
                continue

        browser.close()

    # Сохраняем финальный результат
    output_file = "parsed_data/agrodom/parts-complete.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)

    print(f"\n{'=' * 60}")
    print(f"ПАРСИНГ ЗАВЕРШЕН!")
    print(f"{'=' * 60}")
    print(f"Всего категорий обработано: {len(MAIN_CATEGORIES)}")
    print(f"Всего товаров спарсено: {len(all_products)}")
    print(f"Сохранено в: {output_file}")

    # Статистика по категориям
    print(f"\nСтатистика по категориям:")
    category_counts = {}
    for product in all_products:
        cat = product.get("category", "Unknown")
        category_counts[cat] = category_counts.get(cat, 0) + 1

    for cat, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {cat}: {count} товаров")


if __name__ == "__main__":
    main()
