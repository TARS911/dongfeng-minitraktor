#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ПОЛНЫЙ ПАРСЕР всех товаров с Agrodom
Рекурсивно обходит все категории и подкатегории
"""

import json
import os
import sys
import time

import requests
from bs4 import BeautifulSoup

sys.stdout.reconfigure(line_buffering=True)

BASE_URL = "https://xn----7sbabpgpk4bsbesjp1f.xn--p1ai"
OUTPUT_FILE = "parsed_data/agrodom/parts-full.json"

session = requests.Session()
session.headers.update(
    {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
)


def get_all_products_from_category(url, depth=0):
    """Рекурсивно получает все товары из категории и её подкатегорий"""
    indent = "  " * depth
    print(f"{indent}📂 Обработка: {url}")

    all_products = []
    seen_urls = set()

    try:
        response = session.get(url, timeout=20)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")

        # 1. Ищем подкатегории
        subcats = soup.select(".product-categories a, .product-category a")
        if subcats and depth < 3:  # Ограничиваем глубину рекурсии
            print(f"{indent}  Найдено подкатегорий: {len(subcats)}")
            for subcat in subcats:
                subcat_url = subcat.get("href")
                if subcat_url and subcat_url not in seen_urls:
                    seen_urls.add(subcat_url)
                    # Рекурсивно парсим подкатегорию
                    sub_products = get_all_products_from_category(subcat_url, depth + 1)
                    all_products.extend(sub_products)
                    time.sleep(0.3)

        # 2. Парсим товары на текущей странице
        products = get_products_from_page(url)
        all_products.extend(products)

        # 3. Обрабатываем пагинацию
        pagination = soup.select(".page-numbers a")
        max_page = 1
        for link in pagination:
            text = link.get_text(strip=True)
            if text.isdigit():
                max_page = max(max_page, int(text))

        if max_page > 1:
            print(f"{indent}  Страниц пагинации: {max_page}")
            for page in range(2, max_page + 1):
                page_url = f"{url}page/{page}/"
                page_products = get_products_from_page(page_url)
                all_products.extend(page_products)
                time.sleep(0.3)

        print(f"{indent}  ✅ Товаров: {len(all_products)}")

    except Exception as e:
        print(f"{indent}  ❌ Ошибка: {e}")

    return all_products


def get_products_from_page(url):
    """Парсит товары со страницы"""
    try:
        response = session.get(url, timeout=20)
        soup = BeautifulSoup(response.content, "html.parser")
        products = []

        items = soup.select(".product, .type-product")

        for item in items:
            # Пропускаем категории (у них есть count в названии)
            name_elem = item.select_one(
                "h2, .product-title, .woocommerce-loop-product__title"
            )
            if not name_elem:
                continue

            name = name_elem.get_text(strip=True)

            # Пропускаем если это категория (содержит число в скобках)
            if "(" in name and ")" in name:
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


def main():
    os.makedirs("parsed_data/agrodom", exist_ok=True)

    print("\n" + "=" * 70)
    print("ПОЛНЫЙ ПАРСИНГ ВСЕХ ТОВАРОВ AGRODOM")
    print("=" * 70 + "\n")

    # Основные категории запчастей
    main_categories = [
        f"{BASE_URL}/product-category/двигателя-дизельные/",
        f"{BASE_URL}/product-category/фильтра/",
        f"{BASE_URL}/product-category/гидравлика/",
        f"{BASE_URL}/product-category/карданные-валы/",
        f"{BASE_URL}/product-category/универсальные-комплектующие/",
        f"{BASE_URL}/product-category/зип/",
        f"{BASE_URL}/product-category/стандартные-изделия/",
        f"{BASE_URL}/product-category/запчасти-для-тракторов/",
        f"{BASE_URL}/product-category/запчасти-для-навесного-оборудования/",
        f"{BASE_URL}/product-category/запчасти-для-дизелей/",
        f"{BASE_URL}/product-category/колёса-шины-груза/",
        f"{BASE_URL}/product-category/прочие-запчасти/",
        f"{BASE_URL}/product-category/стартеры-генераторы/",
        f"{BASE_URL}/product-category/сиденья-кресла/",
    ]

    all_products = []
    seen_names = set()

    for i, cat_url in enumerate(main_categories, 1):
        print(f"\n[{i}/{len(main_categories)}]")

        try:
            products = get_all_products_from_category(cat_url)

            # Удаляем дубликаты
            for p in products:
                name_key = p["name"].lower().strip()
                if name_key not in seen_names:
                    seen_names.add(name_key)
                    all_products.append(p)

            # Сохраняем прогресс
            with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                json.dump(all_products, f, ensure_ascii=False, indent=2)

            print(f"💾 Сохранено. Всего уникальных: {len(all_products)}")

        except Exception as e:
            print(f"❌ Ошибка: {e}")

    print("\n" + "=" * 70)
    print("✅ ПАРСИНГ ЗАВЕРШЁН!")
    print("=" * 70)
    print(f"Уникальных товаров: {len(all_products)}")
    print(f"Сохранено в: {OUTPUT_FILE}")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    main()
