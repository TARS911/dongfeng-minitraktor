#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Простой парсер ВСЕХ товаров через пагинацию главной страницы
"""

import json
import os
import sys
import time

import requests
from bs4 import BeautifulSoup

sys.stdout.reconfigure(line_buffering=True)

BASE_URL = "https://xn----7sbabpgpk4bsbesjp1f.xn--p1ai"
OUTPUT_FILE = "parsed_data/agrodom/all-products.json"

session = requests.Session()
session.headers.update(
    {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
)


def get_max_page():
    """Определяет максимальное количество страниц"""
    try:
        url = f"{BASE_URL}/shop/"
        response = session.get(url, timeout=20)
        soup = BeautifulSoup(response.content, "html.parser")

        # Ищем информацию о количестве товаров
        result_count = soup.select_one(".woocommerce-result-count")
        if result_count:
            text = result_count.get_text()
            print(f"Информация о товарах: {text}")

        # Ищем максимальную страницу в пагинации
        pagination = soup.select(".page-numbers")
        max_page = 1

        for item in pagination:
            text = item.get_text(strip=True)
            if text.isdigit():
                max_page = max(max_page, int(text))

        return max_page
    except Exception as e:
        print(f"Ошибка определения страниц: {e}")
        return 1


def get_products_from_page(page_num):
    """Получает товары со страницы"""
    try:
        if page_num == 1:
            url = f"{BASE_URL}/shop/"
        else:
            url = f"{BASE_URL}/shop/page/{page_num}/"

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

            # Пропускаем категории (с числом в скобках)
            if "(" in name and ")" in name and name[-1] == ")":
                continue

            link_elem = item.select_one("a")
            price_elem = item.select_one(".price .amount, .woocommerce-Price-amount")
            image_elem = item.select_one("img")

            if name and link_elem:
                products.append(
                    {
                        "name": name,
                        "price": price_elem.get_text(strip=True) if price_elem else "",
                        "image_url": image_elem.get("src", "") if image_elem else "",
                        "link": link_elem.get("href", ""),
                    }
                )

        return products
    except Exception as e:
        print(f"  ❌ Ошибка на странице {page_num}: {e}")
        return []


def main():
    os.makedirs("parsed_data/agrodom", exist_ok=True)

    print("\n" + "=" * 70)
    print("ПАРСИНГ ВСЕХ ТОВАРОВ ЧЕРЕЗ /shop/")
    print("=" * 70 + "\n")

    # Определяем количество страниц
    print("🔍 Определяю количество страниц...")
    max_page = get_max_page()
    print(f"📄 Найдено страниц: {max_page}\n")

    all_products = []
    seen_names = set()

    # Парсим все страницы
    for page in range(1, max_page + 1):
        print(f"📄 Страница {page}/{max_page}...", end=" ")

        products = get_products_from_page(page)

        # Удаляем дубликаты
        new_count = 0
        for p in products:
            name_key = p["name"].lower().strip()
            if name_key not in seen_names:
                seen_names.add(name_key)
                all_products.append(p)
                new_count += 1

        print(
            f"Найдено: {len(products)}, новых: {new_count}, всего: {len(all_products)}"
        )

        # Сохраняем прогресс каждые 10 страниц
        if page % 10 == 0:
            with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                json.dump(all_products, f, ensure_ascii=False, indent=2)
            print(f"💾 Прогресс сохранён")

        time.sleep(0.5)

    # Финальное сохранение
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 70)
    print("✅ ПАРСИНГ ЗАВЕРШЁН!")
    print("=" * 70)
    print(f"Всего уникальных товаров: {len(all_products)}")
    print(f"Сохранено в: {OUTPUT_FILE}")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    main()
