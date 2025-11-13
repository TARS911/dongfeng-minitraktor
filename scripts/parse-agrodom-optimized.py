#!/usr/bin/env python3
"""
ОПТИМИЗИРОВАННЫЙ ПАРСЕР AGRODOM
Минимальное использование памяти + удаление дубликатов на лету
"""

import json
import os
import sys
import time

import requests
from bs4 import BeautifulSoup

# Отключаем буферизацию
sys.stdout.reconfigure(line_buffering=True)

BASE_URL = "https://xn----7sbabpgpk4bsbesjp1f.xn--p1ai"
OUTPUT_FILE = "parsed_data/agrodom/parts-complete-optimized.json"

# Сокращённый список основных категорий запчастей
CATEGORIES = [
    {"name": "Двигателя", "url": f"{BASE_URL}/product-category/двигателя-дизельные/"},
    {"name": "Фильтра", "url": f"{BASE_URL}/product-category/фильтра/"},
    {"name": "Гидравлика", "url": f"{BASE_URL}/product-category/гидравлика/"},
    {"name": "Карданы", "url": f"{BASE_URL}/product-category/карданные-валы/"},
    {
        "name": "Комплектующие",
        "url": f"{BASE_URL}/product-category/универсальные-комплектующие/",
    },
    {"name": "ЗИП", "url": f"{BASE_URL}/product-category/зип/"},
    {"name": "Стандартные", "url": f"{BASE_URL}/product-category/стандартные-изделия/"},
    {
        "name": "Для тракторов",
        "url": f"{BASE_URL}/product-category/запчасти-для-тракторов/",
    },
    {
        "name": "Для навесного",
        "url": f"{BASE_URL}/product-category/запчасти-для-навесного-оборудования/",
    },
    {
        "name": "Для дизелей",
        "url": f"{BASE_URL}/product-category/запчасти-для-дизелей/",
    },
    {"name": "Колёса, шины", "url": f"{BASE_URL}/product-category/колёса-шины-груза/"},
    {"name": "Прочие", "url": f"{BASE_URL}/product-category/прочие-запчасти/"},
    {"name": "Стартеры", "url": f"{BASE_URL}/product-category/стартеры-генераторы/"},
    {"name": "Сиденья", "url": f"{BASE_URL}/product-category/сиденья-кресла/"},
]

session = requests.Session()
session.headers.update(
    {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
)


def get_products_from_page(page_url, category_name):
    """Парсит товары со страницы"""
    try:
        response = session.get(page_url, timeout=20)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")
        products = []

        # Ищем товары на странице
        items = soup.select(".product, .type-product")

        for item in items:
            link = item.select_one("a")
            name = item.select_one(
                "h2, .product-title, .woocommerce-loop-product__title"
            )
            price = item.select_one(".price .amount, .woocommerce-Price-amount")
            image = item.select_one("img")

            if name and link:
                products.append(
                    {
                        "name": name.get_text(strip=True),
                        "price": price.get_text(strip=True) if price else "",
                        "image_url": image.get("src", "") if image else "",
                        "link": link.get("href", ""),
                        "category": category_name,
                    }
                )

        return products
    except Exception as e:
        print(f"  ⚠️  Ошибка: {e}")
        return []


def get_max_page(url):
    """Определяет максимальное количество страниц"""
    try:
        response = session.get(url, timeout=20)
        soup = BeautifulSoup(response.content, "html.parser")
        pages = soup.select(".page-numbers a")
        max_p = 1
        for p in pages:
            txt = p.get_text(strip=True)
            if txt.isdigit():
                max_p = max(max_p, int(txt))
        return max_p
    except:
        return 1


def parse_category(category, seen_names):
    """Парсит категорию и возвращает уникальные товары"""
    print(f"\n{'=' * 60}")
    print(f"📂 {category['name']}")
    print(f"{'=' * 60}")

    products = []
    max_pages = get_max_page(category["url"])
    print(f"  Страниц: {max_pages}")

    for page in range(1, max_pages + 1):
        page_url = f"{category['url']}page/{page}/" if page > 1 else category["url"]
        page_products = get_products_from_page(page_url, category["name"])

        # Фильтруем дубликаты на лету
        for p in page_products:
            name_key = p["name"].lower().strip()
            if name_key not in seen_names:
                seen_names.add(name_key)
                products.append(p)

        if page % 3 == 0:
            print(f"  ✓ Страница {page}/{max_pages}, новых товаров: {len(products)}")

        time.sleep(0.3)

    print(f"✅ Категория завершена! Новых товаров: {len(products)}")
    return products


def main():
    os.makedirs("parsed_data/agrodom", exist_ok=True)

    print("\n" + "=" * 60)
    print("🚀 ОПТИМИЗИРОВАННЫЙ ПАРСИНГ AGRODOM")
    print("=" * 60 + "\n")

    all_products = []
    seen_names = set()

    for i, category in enumerate(CATEGORIES, 1):
        print(f"\n[{i}/{len(CATEGORIES)}]")

        try:
            products = parse_category(category, seen_names)
            all_products.extend(products)

            # Сохраняем после каждой категории
            with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                json.dump(all_products, f, ensure_ascii=False, indent=2)

            print(f"💾 Сохранено. Всего уникальных: {len(all_products)}")

        except Exception as e:
            print(f"❌ Ошибка: {e}")
            continue

    print("\n" + "=" * 60)
    print("✅ ПАРСИНГ ЗАВЕРШЁН!")
    print("=" * 60)
    print(f"Уникальных товаров: {len(all_products)}")
    print(f"Сохранено в: {OUTPUT_FILE}")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
