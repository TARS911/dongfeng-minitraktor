#!/usr/bin/env python3
"""
Полный парсер всех запчастей с agrodom.ru
Парсит из настоящих категорий по типу запчастей
"""

import json
import time

from playwright.sync_api import sync_playwright

BASE_URL = "https://xn----7sbabpgpk4bsbesjp1f.xn--p1ai"

# Настоящие категории запчастей (по типу)
CATEGORIES = [
    {
        "name": "Двигателя дизельные",
        "url": f"{BASE_URL}/product-category/двигателя-дизельные/",
    },
    {"name": "Фильтра", "url": f"{BASE_URL}/product-category/фильтра/"},
    {"name": "Гидравлика", "url": f"{BASE_URL}/product-category/гидравлика/"},
    {"name": "Карданные валы", "url": f"{BASE_URL}/product-category/карданные-валы/"},
    {
        "name": "Универсальные комплектующие",
        "url": f"{BASE_URL}/product-category/универсальные-комплектующие/",
    },
    {"name": "ЗИП", "url": f"{BASE_URL}/product-category/зип/"},
    {
        "name": "Стандартные изделия",
        "url": f"{BASE_URL}/product-category/стандартные-изделия/",
    },
    {
        "name": "Запчасти для тракторов",
        "url": f"{BASE_URL}/product-category/запчасти-для-тракторов/",
    },
    {
        "name": "Запчасти для навесного оборудования",
        "url": f"{BASE_URL}/product-category/запчасти-для-навесного-оборудования/",
    },
    {
        "name": "Запчасти для дизелей",
        "url": f"{BASE_URL}/product-category/запчасти-для-дизелей/",
    },
    {
        "name": "Колёса, шины, груза",
        "url": f"{BASE_URL}/product-category/колёса-шины-груза/",
    },
    {"name": "Прочие запчасти", "url": f"{BASE_URL}/product-category/прочие-запчасти/"},
    {"name": "Ожидается", "url": f"{BASE_URL}/product-category/ожидается/"},
]


def parse_products_from_page(page, category_name):
    """Парсит все товары с текущей страницы"""
    products = []

    # Ищем товары на странице
    product_cards = page.query_selector_all("li.product")

    if not product_cards:
        return products

    for card in product_cards:
        try:
            # Название
            name_elem = card.query_selector("h2.woocommerce-loop-product__title")
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
                image_url = img_elem.get_attribute("src") or img_elem.get_attribute(
                    "data-src"
                )

            if name and link:
                product = {
                    "name": name,
                    "category": category_name,
                    "price": price,
                    "image_url": image_url,
                    "link": link,
                    "sku": None,
                }
                products.append(product)

        except Exception as e:
            print(f"      Ошибка при парсинге товара: {e}")
            continue

    return products


def parse_category(page, category_name, category_url):
    """Парсит все товары из одной категории со всех страниц"""
    print(f"\n{'=' * 70}")
    print(f"📦 Категория: {category_name}")
    print(f"🔗 URL: {category_url}")
    print(f"{'=' * 70}")

    all_products = []
    page_num = 1

    while True:
        # Формируем URL страницы
        if page_num == 1:
            url = category_url
        else:
            url = f"{category_url}page/{page_num}/"

        print(f"\n  📄 Страница {page_num}: {url}")

        try:
            page.goto(url, wait_until="domcontentloaded", timeout=30000)
            time.sleep(2)

            # Парсим товары со страницы
            products = parse_products_from_page(page, category_name)

            if not products:
                print(f"  ✓ Нет товаров на странице {page_num}")
                break

            all_products.extend(products)
            print(f"  ✓ Спарсено: {len(products)} товаров")
            print(f"  📊 Всего в категории: {len(all_products)} товаров")

            # Проверяем есть ли следующая страница
            next_button = page.query_selector("a.next.page-numbers")
            if not next_button:
                print(f"  ✓ Это последняя страница")
                break

            page_num += 1

        except Exception as e:
            print(f"  ✗ Ошибка на странице {page_num}: {e}")
            # Если первая страница не работает, пропускаем категорию
            if page_num == 1:
                break
            # Если не первая страница - это конец пагинации
            else:
                break

    print(f"\n✅ Категория '{category_name}' завершена: {len(all_products)} товаров")
    return all_products


def main():
    print("=" * 70)
    print("🚀 ПОЛНЫЙ ПАРСЕР ЗАПЧАСТЕЙ AGRODOM.RU")
    print("=" * 70)
    print(f"Будет спарсено {len(CATEGORIES)} категорий запчастей\n")

    all_products = []
    category_stats = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        for i, category in enumerate(CATEGORIES, 1):
            print(f"\n{'#' * 70}")
            print(f"# [{i}/{len(CATEGORIES)}] Обрабатываем: {category['name']}")
            print(f"{'#' * 70}")

            try:
                products = parse_category(page, category["name"], category["url"])
                all_products.extend(products)
                category_stats[category["name"]] = len(products)

                print(f"\n{'=' * 70}")
                print(f"📈 ПРОМЕЖУТОЧНЫЙ ИТОГ: {len(all_products)} товаров")
                print(f"{'=' * 70}")

                # Сохраняем промежуточный результат
                with open(
                    "parsed_data/agrodom/parts-all-temp.json", "w", encoding="utf-8"
                ) as f:
                    json.dump(all_products, f, ensure_ascii=False, indent=2)
                print(f"💾 Промежуточный результат сохранен")

                # Пауза между категориями
                time.sleep(2)

            except Exception as e:
                print(f"\n❌ КРИТИЧЕСКАЯ ОШИБКА в категории {category['name']}: {e}")
                category_stats[category["name"]] = 0
                continue

        browser.close()

    # Сохраняем финальный результат
    output_file = "parsed_data/agrodom/parts-all.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)

    print(f"\n{'=' * 70}")
    print(f"🎉 ПАРСИНГ ЗАВЕРШЕН!")
    print(f"{'=' * 70}")
    print(f"📊 Всего категорий: {len(CATEGORIES)}")
    print(f"📦 Всего товаров: {len(all_products)}")
    print(f"💾 Сохранено в: {output_file}")
    print(f"{'=' * 70}")

    # Статистика по категориям
    print(f"\n📋 СТАТИСТИКА ПО КАТЕГОРИЯМ:")
    print(f"{'=' * 70}")
    for cat_name, count in sorted(
        category_stats.items(), key=lambda x: x[1], reverse=True
    ):
        print(f"  • {cat_name}: {count} товаров")
    print(f"{'=' * 70}")


if __name__ == "__main__":
    main()
