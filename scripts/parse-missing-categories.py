#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Парсер для конкретных категорий, которые были пропущены
Парсит: Xingtai (412), JINMA (414) и другие глубокие подкатегории
"""
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path
import requests
from bs4 import BeautifulSoup

sys.stdout.reconfigure(line_buffering=True)

# Настройки
BASE_URL = "https://xn----7sbabpgpk4bsbesjp1f.xn--p1ai"
OUTPUT_DIR = Path(__file__).parent.parent / "parsed_data" / "agrodom"
OUTPUT_FILE = OUTPUT_DIR / "missing-categories.json"
LOG_FILE = OUTPUT_DIR / "missing-parse.log"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# HTTP сессия
session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
})

# Глобальное состояние
all_products = []
seen_product_links = set()

# Конкретные категории для парсинга
MISSING_CATEGORIES = [
    {
        "name": "Xingtai, Уралец, Swatt и др от 12-24 л.с",
        "url": f"{BASE_URL}/product-category/запчасти-для-тракторов/xingtai-уралец-swatt-и-др-от-12-24-л-с/",
        "expected": 412
    },
    {
        "name": "JINMA",
        "url": f"{BASE_URL}/product-category/запчасти-для-тракторов/jinma/",
        "expected": 414
    },
]


def log(message, level="INFO"):
    """Логирование"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_message = f"[{timestamp}] [{level}] {message}"
    print(log_message)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(log_message + "\n")


def get_products_from_page(url, category_name, retry=3):
    """Парсит товары с одной страницы"""
    for attempt in range(retry):
        try:
            response = session.get(url, timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, "html.parser")

            products = []
            product_cards = soup.select(".product, .type-product")

            for item in product_cards:
                try:
                    # Название
                    name_elem = item.select_one(
                        "h2, .product-title, .woocommerce-loop-product__title"
                    )
                    if not name_elem:
                        continue

                    name = name_elem.get_text(strip=True)

                    # Пропускаем категории
                    if "(" in name and ")" in name and name[-1] == ")":
                        continue

                    # Ссылка
                    link_elem = item.select_one("a")
                    if not link_elem:
                        continue

                    link = link_elem.get("href", "")

                    # Пропускаем дубликаты
                    if link in seen_product_links:
                        continue

                    # Цена
                    price_elem = item.select_one(".price .amount, .woocommerce-Price-amount")
                    price = price_elem.get_text(strip=True) if price_elem else ""

                    # Изображение
                    image_elem = item.select_one("img")
                    image_url = ""
                    if image_elem:
                        image_url = image_elem.get("src", "") or image_elem.get("data-src", "")

                    # SKU
                    sku_elem = item.select_one(".sku")
                    sku = sku_elem.get_text(strip=True) if sku_elem else ""

                    if name and link:
                        products.append({
                            "name": name,
                            "category": category_name,
                            "price": price,
                            "image_url": image_url,
                            "link": link,
                            "sku": sku,
                        })
                        seen_product_links.add(link)

                except Exception as e:
                    log(f"Ошибка парсинга товара: {e}", "WARN")
                    continue

            return products

        except requests.RequestException as e:
            if attempt < retry - 1:
                log(f"Попытка {attempt + 1}/{retry} не удалась, повтор...", "WARN")
                time.sleep(2 * (attempt + 1))
            else:
                log(f"Ошибка после {retry} попыток: {e}", "ERROR")
                return []

    return []


def parse_category(category):
    """Парсит все товары категории со всех страниц"""
    log(f"=" * 70)
    log(f"📦 Категория: {category['name']}")
    log(f"🔗 URL: {category['url']}")
    log(f"📊 Ожидается: {category['expected']} товаров")
    log(f"=" * 70)

    category_products = []

    for page_num in range(1, 101):  # Максимум 100 страниц
        page_url = category['url'] if page_num == 1 else f"{category['url']}page/{page_num}/"

        log(f"📄 Страница {page_num}...")
        products = get_products_from_page(page_url, category['name'])

        if not products:
            if page_num == 1:
                log(f"⚠️  Товары не найдены на первой странице!", "WARN")
            break

        category_products.extend(products)
        log(f"  ✅ Получено товаров: {len(products)} (всего в категории: {len(category_products)})")

        time.sleep(0.5)  # Задержка между страницами

    log(f"")
    log(f"💰 Всего товаров в категории: {len(category_products)}")
    log(f"📊 Ожидалось: {category['expected']}")

    if len(category_products) < category['expected']:
        diff = category['expected'] - len(category_products)
        log(f"⚠️  Недостает {diff} товаров!", "WARN")

    return category_products


def main():
    """Главная функция"""
    log("=" * 70)
    log("🚀 ПАРСИНГ ПРОПУЩЕННЫХ КАТЕГОРИЙ")
    log("=" * 70)
    log("")

    start_time = time.time()

    for i, category in enumerate(MISSING_CATEGORIES, 1):
        log(f"")
        log(f"[{i}/{len(MISSING_CATEGORIES)}] Обработка категории...")

        products = parse_category(category)
        all_products.extend(products)

        # Сохраняем после каждой категории
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(all_products, f, ensure_ascii=False, indent=2)

        log(f"💾 Сохранено. Всего товаров: {len(all_products)}")
        log("")

        time.sleep(1)  # Задержка между категориями

    elapsed = time.time() - start_time

    # Итоговая статистика
    log("=" * 70)
    log("🎉 ПАРСИНГ ЗАВЕРШЕН!")
    log("=" * 70)
    log(f"✅ Всего товаров: {len(all_products)}")
    log(f"📁 Сохранено в: {OUTPUT_FILE}")
    log(f"⏱️  Время: {elapsed:.2f} сек ({elapsed/60:.2f} мин)")
    log("=" * 70)


if __name__ == "__main__":
    main()
