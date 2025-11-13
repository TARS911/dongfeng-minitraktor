#!/usr/bin/env python3
"""
НАДЕЖНЫЙ ПАРСЕР AGRODOM с BeautifulSoup + Requests
Парсит ВСЕ товары со всех категорий и подкатегорий
"""

import json
import os
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

# Отключаем буферизацию вывода
sys.stdout = os.fdopen(sys.stdout.fileno(), "w", buffering=1)
sys.stderr = os.fdopen(sys.stderr.fileno(), "w", buffering=1)

BASE_URL = "https://xn----7sbabpgpk4bsbesjp1f.xn--p1ai"
OUTPUT_FILE = "parsed_data/agrodom/parts-complete-bs4.json"
PROGRESS_FILE = "parsed_data/agrodom/parts-progress-bs4.json"

# Основные категории запчастей
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
    {
        "name": "Стартеры, Генераторы",
        "url": f"{BASE_URL}/product-category/стартеры-генераторы/",
    },
    {"name": "Сиденья (кресла)", "url": f"{BASE_URL}/product-category/сиденья-кресла/"},
    {"name": "Ожидается", "url": f"{BASE_URL}/product-category/ожидается/"},
]

session = requests.Session()
session.headers.update(
    {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
)


def get_subcategories(category_url):
    """Получает подкатегории из категории"""
    try:
        response = session.get(category_url, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")

        subcategories = []
        # Ищем подкатегории
        subcat_links = soup.select(".product-categories a, .cat-item a")

        for link in subcat_links:
            href = link.get("href")
            name = link.get_text(strip=True)
            if href and name:
                subcategories.append({"name": name, "url": href})

        return subcategories
    except Exception as e:
        print(f"  ⚠️  Ошибка получения подкатегорий: {e}")
        return []


def parse_product_page(product_url):
    """Парсит страницу товара для получения полной информации"""
    try:
        response = session.get(product_url, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")

        # Название
        name_elem = soup.select_one("h1.product_title, .product-title h1")
        name = name_elem.get_text(strip=True) if name_elem else ""

        # Цена
        price_elem = soup.select_one(
            ".woocommerce-Price-amount, .price ins .amount, .price .amount"
        )
        price = price_elem.get_text(strip=True) if price_elem else ""

        # Изображение
        image_elem = soup.select_one(
            ".woocommerce-product-gallery__image img, .product-images img"
        )
        image_url = (
            image_elem.get("src") or image_elem.get("data-src") if image_elem else ""
        )

        return {
            "name": name,
            "price": price,
            "image_url": image_url,
            "link": product_url,
        }
    except Exception as e:
        return None


def get_products_from_page(page_url, category_name):
    """Получает товары со страницы каталога"""
    try:
        response = session.get(page_url, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")

        products = []

        # Ищем товары
        product_items = soup.select(".product, .type-product, .product-grid-item")

        for item in product_items:
            # Ссылка на товар
            link_elem = item.select_one(
                "a.woocommerce-LoopProduct-link, a.product-link, h2 a, .product-title a"
            )
            if not link_elem:
                continue

            product_url = link_elem.get("href")

            # Название
            name_elem = item.select_one(
                "h2, .product-title, .woocommerce-loop-product__title"
            )
            name = name_elem.get_text(strip=True) if name_elem else ""

            # Цена
            price_elem = item.select_one(
                ".woocommerce-Price-amount, .price ins .amount, .price .amount"
            )
            price = price_elem.get_text(strip=True) if price_elem else ""

            # Изображение
            image_elem = item.select_one("img")
            image_url = (
                image_elem.get("src") or image_elem.get("data-src")
                if image_elem
                else ""
            )

            if name and product_url:
                products.append(
                    {
                        "name": name,
                        "price": price,
                        "image_url": image_url,
                        "link": product_url,
                        "category": category_name,
                    }
                )

        return products
    except Exception as e:
        print(f"  ⚠️  Ошибка парсинга страницы: {e}")
        return []


def get_total_pages(category_url):
    """Определяет общее количество страниц в категории"""
    try:
        response = session.get(category_url, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")

        # Ищем пагинацию
        pagination = soup.select(".page-numbers a, .pagination a")
        max_page = 1

        for link in pagination:
            text = link.get_text(strip=True)
            if text.isdigit():
                max_page = max(max_page, int(text))

        return max_page
    except:
        return 1


def parse_category(category):
    """Парсит все товары из категории и её подкатегорий"""
    print(f"\n{'=' * 70}")
    print(f"📂 {category['name']}")
    print(f"{'=' * 70}")

    all_products = []

    # Получаем подкатегории
    subcategories = get_subcategories(category["url"])

    if subcategories:
        print(f"  Найдено подкатегорий: {len(subcategories)}")

        for subcat in subcategories:
            print(f"  📁 {subcat['name']}...")

            # Определяем количество страниц
            total_pages = get_total_pages(subcat["url"])
            print(f"     Страниц: {total_pages}")

            # Парсим все страницы
            for page in range(1, total_pages + 1):
                page_url = f"{subcat['url']}page/{page}/" if page > 1 else subcat["url"]
                products = get_products_from_page(page_url, category["name"])
                all_products.extend(products)

                if page % 5 == 0:
                    print(
                        f"     ✓ Обработано страниц: {page}/{total_pages}, товаров: {len(all_products)}"
                    )

                time.sleep(0.5)  # Небольшая задержка

            print(f"     ✅ Подкатегория завершена. Товаров: {len(products)}")
    else:
        # Если нет подкатегорий, парсим саму категорию
        print(f"  Парсинг основной категории...")
        total_pages = get_total_pages(category["url"])
        print(f"  Страниц: {total_pages}")

        for page in range(1, total_pages + 1):
            page_url = f"{category['url']}page/{page}/" if page > 1 else category["url"]
            products = get_products_from_page(page_url, category["name"])
            all_products.extend(products)

            if page % 5 == 0:
                print(
                    f"  ✓ Обработано страниц: {page}/{total_pages}, товаров: {len(all_products)}"
                )

            time.sleep(0.5)

    print(f"\n✅ Категория завершена! Всего товаров: {len(all_products)}")
    return all_products


def main():
    # Создаём директории для вывода
    os.makedirs("parsed_data/agrodom", exist_ok=True)

    print("""
╔══════════════════════════════════════════════════════════════════════════╗
║              ПОЛНЫЙ ПАРСИНГ AGRODOM (BeautifulSoup + Requests)          ║
╚══════════════════════════════════════════════════════════════════════════╝
""")
    sys.stdout.flush()

    all_products = []

    for i, category in enumerate(CATEGORIES, 1):
        print(f"\n[{i}/{len(CATEGORIES)}] Обработка категории...")

        try:
            products = parse_category(category)
            all_products.extend(products)

            # Сохраняем прогресс после каждой категории
            with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
                json.dump(all_products, f, ensure_ascii=False, indent=2)

            print(f"\n💾 Прогресс сохранен. Всего товаров: {len(all_products)}")

        except Exception as e:
            print(f"\n❌ Ошибка в категории {category['name']}: {e}")
            continue

    # Удаляем дубликаты по названию
    unique_products = {}
    for product in all_products:
        key = product["name"].lower().strip()
        if key not in unique_products:
            unique_products[key] = product

    final_products = list(unique_products.values())

    # Сохраняем финальный результат
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(final_products, f, ensure_ascii=False, indent=2)

    print(f"\n{'=' * 70}")
    print(f"✅ ПАРСИНГ ЗАВЕРШЕН!")
    print(f"{'=' * 70}")
    print(f"Всего спарсено: {len(all_products)} товаров")
    print(f"Уникальных: {len(final_products)} товаров")
    print(f"Сохранено в: {OUTPUT_FILE}")
    print(f"{'=' * 70}\n")


if __name__ == "__main__":
    main()
