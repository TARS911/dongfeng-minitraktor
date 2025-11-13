#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Парсер ВСЕХ категорий запчастей с Agrodom (~4017 товаров)
"""

import json
import os
import sys
import time

import requests
from bs4 import BeautifulSoup

sys.stdout.reconfigure(line_buffering=True)

BASE_URL = "https://xn----7sbabpgpk4bsbesjp1f.xn--p1ai"
OUTPUT_FILE = "parsed_data/agrodom/all-parts-complete.json"

# ВСЕ категории со скриншота
    {
        "name": "Запчасти для тракторов",
        "url": f"{BASE_URL}/product-category/запчасти-для-тракторов/",
        "count": 1244,
    },
    {
        "name": "Запчасти для навесного оборудования",
        "url": f"{BASE_URL}/product-category/запчасти-для-навесного-оборудования/",
        "count": 772,
    },
    {
        "name": "Запчасти для дизелей",
        "url": f"{BASE_URL}/product-category/запчасти-для-дизелей/",
        "count": 763,
    },
    {
        "name": "Стандартные изделия",
        "url": f"{BASE_URL}/product-category/стандартные-изделия/",
        "count": 405,
    },
    {
        "name": "Прочие запчасти",
        "url": f"{BASE_URL}/product-category/прочие-запчасти/",
        "count": 254,
    },
    {
        "name": "Гидравлика",
        "url": f"{BASE_URL}/product-category/гидравлика/",
        "count": 138,
    },
    {
        "name": "Карданные валы",
        "url": f"{BASE_URL}/product-category/карданные-валы/",
        "count": 129,
    },
    {
        "name": "Колёса, шины, груза",
        "url": f"{BASE_URL}/product-category/колёса-шины-груза/",
        "count": 124,
    },
    {"name": "Фильтра", "url": f"{BASE_URL}/product-category/фильтра/", "count": 77},
    {
        "name": "Двигателя дизельные",
        "url": f"{BASE_URL}/product-category/двигателя-дизельные/",
        "count": 29,
    },
    {
        "name": "Стартеры, Генераторы",
        "url": f"{BASE_URL}/product-category/стартеры-генераторы/",
        "count": 27,
    },
    {
        "name": "Универсальные комплектующие",
        "url": f"{BASE_URL}/product-category/универсальные-комплектующие/",
        "count": 24,
    },
    {
        "name": "Сиденья (кресла)",
        "url": f"{BASE_URL}/product-category/сиденья-кресла/",
        "count": 14,
    },
    {"name": "ЗИП", "url": f"{BASE_URL}/product-category/зип/", "count": 8},
    {"name": "Ожидается", "url": f"{BASE_URL}/product-category/ожидается/", "count": 8},
]

session = requests.Session()
session.headers.update(
    {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
)


def get_products_from_page(url):
    """Парсит товары со страницы"""
    try:
        response = session.get(url, timeout=20)
        soup = BeautifulSoup(response.content, "html.parser")
        products = []

        items = soup.select(".product, .type-product")

        for item in items:
            name_elem = item.select_one(
                "h2, .product-title, .woocommerce-loop-product__title"
            )
            if not name_elem:
                continue

            name = name_elem.get_text(strip=True)

            # Пропускаем категории
            if "(" in name and ")" in name and name[-1] == ")":
                continue

            link = item.select_one("a")
            price = item.select_one(".price .amount, .woocommerce-Price-amount")
            image = item.select_one("img")

            if name and link:
                products.append(
                    {
                        "name": name,
                        "price": price.get_text(strip=True) if price else "",
                        "image_url": image.get("src", "") if image else "",
                        "link": link.get("href", ""),
                    }
                )

        return products
    except:
        return []


def parse_category(category):
    """Парсит все товары из категории с пагинацией"""
    print(f"\n📂 {category['name']} (ожидается {category['count']} товаров)")
    print("=" * 70)

    all_products = []

    # Вычисляем количество страниц (20 товаров на страницу)
    max_pages = (category["count"] // 20) + 2

    for page in range(1, max_pages + 1):
        if page == 1:
            page_url = category["url"]
        else:
            page_url = f"{category['url']}page/{page}/"

        products = get_products_from_page(page_url)

        if not products:
            # Если товаров нет, значит страницы закончились
            break

        all_products.extend(products)

        if page % 5 == 0 or page == 1:
            print(
                f"  Страница {page}: +{len(products)} товаров, всего: {len(all_products)}"
            )
            print(f"  Страница {page}: +{len(products)} товаров, всего: {len(all_products)}")

        time.sleep(0.4)

    print(f"✅ Завершено: {len(all_products)} товаров")
    return all_products


def main():
    os.makedirs("parsed_data/agrodom", exist_ok=True)

    print("\n" + "=" * 70)
    print("ПОЛНЫЙ ПАРСИНГ ВСЕХ ЗАПЧАСТЕЙ AGRODOM")
    print("=" * 70)
    print(f"Категорий: {len(CATEGORIES)}")
    print(f"Ожидается товаров: ~4017")
    print("=" * 70)

    all_products = []
    seen_names = set()

    for i, category in enumerate(CATEGORIES, 1):
        print(f"\n[{i}/{len(CATEGORIES)}]")

        try:
            products = parse_category(category)

            # Удаляем дубликаты
            new_count = 0
            for p in products:
                name_key = p["name"].lower().strip()
                if name_key not in seen_names:
                    seen_names.add(name_key)
                    all_products.append(p)
                    new_count += 1

            print(f"  Новых уникальных: {new_count}")

            # Сохраняем прогресс после каждой категории
            with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                json.dump(all_products, f, ensure_ascii=False, indent=2)

            print(f"💾 Прогресс сохранён. Всего уникальных: {len(all_products)}")

        except Exception as e:
            print(f"❌ Ошибка: {e}")

    print("\n" + "=" * 70)
    print("✅ ПАРСИНГ ЗАВЕРШЁН!")
    print("=" * 70)
    print(f"Всего уникальных товаров: {len(all_products)}")
    print(f"Ожидалось: ~4017")
    print(f"Разница: {4017 - len(all_products)}")
    print(f"Сохранено в: {OUTPUT_FILE}")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    main()
