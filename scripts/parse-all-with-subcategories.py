#!/usr/bin/env python3
"""
УСТОЙЧИВЫЙ парсер с поддержкой подкатегорий
Парсит категории → подкатегории → товары
Сохраняет промежуточные результаты после КАЖДОЙ подкатегории
"""

import json
import time

from playwright.sync_api import sync_playwright

BASE_URL = "https://xn----7sbabpgpk4bsbesjp1f.xn--p1ai"

# Основные категории
MAIN_CATEGORIES = [
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


def get_subcategories(page, category_url):
    """Получает список подкатегорий если они есть"""
    try:
        page.goto(category_url, wait_until="domcontentloaded", timeout=20000)
        time.sleep(2)

        # Ищем подкатегории
        subcategory_links = page.query_selector_all("ul.products li.product-category a")

        if not subcategory_links:
            return []

        subcategories = []
        for link in subcategory_links:
            try:
                url = link.get_attribute("href")
                name_elem = link.query_selector("h2.woocommerce-loop-category__title")
                name = name_elem.inner_text().strip() if name_elem else None

                # Извлекаем количество товаров
                count_elem = link.query_selector(".count")
                count_text = count_elem.inner_text().strip() if count_elem else "0"
                count = int(count_text.replace("(", "").replace(")", "").strip())

                if url and name and count > 0:
                    subcategories.append({"name": name, "url": url, "count": count})
            except:
                continue

        return subcategories

    except Exception as e:
        print(f"    ⚠ Ошибка при получении подкатегорий: {e}")
        return []


def parse_products_from_page(page):
    """Парсит товары с текущей страницы"""
    products = []
    product_cards = page.query_selector_all("li.product:not(.product-category)")

    for card in product_cards:
        try:
            name_elem = card.query_selector("h2.woocommerce-loop-product__title")
            name = name_elem.inner_text().strip() if name_elem else None

            link_elem = card.query_selector("a.woocommerce-LoopProduct-link")
            link = link_elem.get_attribute("href") if link_elem else None

            price_elem = card.query_selector("span.woocommerce-Price-amount")
            price = price_elem.inner_text().strip() if price_elem else None

            img_elem = card.query_selector("img")
            image_url = None
            if img_elem:
                image_url = img_elem.get_attribute("src") or img_elem.get_attribute(
                    "data-src"
                )

            if name and link:
                products.append(
                    {"name": name, "price": price, "image_url": image_url, "link": link}
                )
        except:
            continue

    return products


def parse_category_with_pagination(page, category_name, category_url):
    """Парсит все товары из категории со всех страниц"""
    all_products = []
    page_num = 1

    while True:
        url = category_url if page_num == 1 else f"{category_url}page/{page_num}/"

        try:
            page.goto(url, wait_until="domcontentloaded", timeout=20000)
            time.sleep(1.5)

            products = parse_products_from_page(page)

            if not products:
                break

            all_products.extend(products)
            print(
                f"      Страница {page_num}: +{len(products)} товаров (всего: {len(all_products)})"
            )

            # Проверяем есть ли следующая страница
            next_button = page.query_selector("a.next.page-numbers")
            if not next_button:
                break

            page_num += 1

        except Exception as e:
            print(f"      ⚠ Ошибка на странице {page_num}: {e}")
            break

    return all_products


def save_progress(all_products):
    """Сохраняет промежуточный результат"""
    with open(
        "parsed_data/agrodom/parts-complete-progress.json", "w", encoding="utf-8"
    ) as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)


def main():
    print("=" * 80)
    print("🔥 УСТОЙЧИВЫЙ ПАРСЕР С ПОДКАТЕГОРИЯМИ")
    print("=" * 80)
    print("✅ Парсит категории → подкатегории → товары")
    print("✅ Сохраняет прогресс после каждой подкатегории")
    print("✅ Можно возобновить если крашнется\n")

    all_products = []
    stats = {"categories": 0, "subcategories": 0, "products": 0}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        for i, main_cat in enumerate(MAIN_CATEGORIES, 1):
            print(f"\n{'#' * 80}")
            print(f"# [{i}/{len(MAIN_CATEGORIES)}] {main_cat['name']}")
            print(f"{'#' * 80}")

            try:
                # Проверяем есть ли подкатегории
                subcategories = get_subcategories(page, main_cat["url"])

                if subcategories:
                    print(f"  📁 Найдено подкатегорий: {len(subcategories)}")

                    for j, subcat in enumerate(subcategories, 1):
                        print(
                            f"\n  [{j}/{len(subcategories)}] {subcat['name']} ({subcat['count']} товаров)"
                        )

                        try:
                            products = parse_category_with_pagination(
                                page, subcat["name"], subcat["url"]
                            )

                            # Добавляем категорию к товарам
                            for p in products:
                                p["category"] = main_cat["name"]
                                p["subcategory"] = subcat["name"]

                            all_products.extend(products)
                            stats["subcategories"] += 1
                            stats["products"] += len(products)

                            print(f"  ✅ Спарсено: {len(products)} товаров")

                            # СОХРАНЯЕМ ПРОГРЕСС после каждой подкатегории!
                            save_progress(all_products)

                            time.sleep(1)

                        except Exception as e:
                            print(f"  ❌ Ошибка в подкатегории: {e}")
                            continue
                else:
                    # Нет подкатегорий - парсим напрямую
                    print(f"  📄 Подкатегорий нет, парсим напрямую...")

                    try:
                        products = parse_category_with_pagination(
                            page, main_cat["name"], main_cat["url"]
                        )

                        for p in products:
                            p["category"] = main_cat["name"]

                        all_products.extend(products)
                        stats["products"] += len(products)

                        print(f"  ✅ Спарсено: {len(products)} товаров")

                        # Сохраняем прогресс
                        save_progress(all_products)

                    except Exception as e:
                        print(f"  ❌ Ошибка: {e}")

                stats["categories"] += 1
                print(f"\n  📊 ИТОГО собрано: {len(all_products)} товаров")

            except Exception as e:
                print(f"  ❌ КРИТИЧЕСКАЯ ОШИБКА в категории: {e}")
                continue

        browser.close()

    # Сохраняем финальный результат
    output_file = "parsed_data/agrodom/parts-complete-final.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)

    print(f"\n{'=' * 80}")
    print("🎉 ПАРСИНГ ЗАВЕРШЕН!")
    print(f"{'=' * 80}")
    print(f"📊 Категорий обработано: {stats['categories']}")
    print(f"📁 Подкатегорий обработано: {stats['subcategories']}")
    print(f"📦 Всего товаров: {len(all_products)}")
    print(f"💾 Сохранено в: {output_file}")
    print(f"{'=' * 80}")


if __name__ == "__main__":
    main()
