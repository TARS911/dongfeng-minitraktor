#!/usr/bin/env python3
"""
ПОЛНЫЙ парсер сайта АГРОДОМ - ВСЕ запчасти по всем категориям
https://xn----7sbabpgpk4bsbesjp1f.xn--p1ai/
"""

import asyncio
import json
import re
import time
from pathlib import Path
from urllib.parse import urljoin

from playwright.async_api import async_playwright

# Базовые настройки
BASE_URL = "https://xn----7sbabpgpk4bsbesjp1f.xn--p1ai"
OUTPUT_DIR = Path(__file__).parent.parent / "parsed_data"
AGRODOM_DIR = OUTPUT_DIR / "agrodom"
DATA_FILE = AGRODOM_DIR / "parts-full.json"

# Создаем директории
AGRODOM_DIR.mkdir(parents=True, exist_ok=True)

# ВСЕ категории для парсинга (найденные на сайте)
CATEGORIES = [
    # Запчасти для тракторов (самая большая категория)
    {"name": "JINMA", "url": f"{BASE_URL}/product-category/jinma/", "expected": 414},
    {
        "name": "Xingtai, Уралец, Swatt от 12-24 л.с",
        "url": f"{BASE_URL}/product-category/xingtai-уралец-swatt-и-др-от-12-24-л-с/",
        "expected": 412,
    },
    {
        "name": "DongFeng MasterYard от 24 л.с",
        "url": f"{BASE_URL}/product-category/dongfeng-masteryard-от24-л-с/",
        "expected": 207,
    },
    {
        "name": "Уралец 224/Xingtai 240/244",
        "url": f"{BASE_URL}/product-category/уралец-224-xingtai-swatt-и-др-44/",
        "expected": 104,
    },
    {
        "name": "FOTON LOVOL TE-244",
        "url": f"{BASE_URL}/product-category/foton-244/",
        "expected": 42,
    },
    {
        "name": "Опции для тракторов",
        "url": f"{BASE_URL}/product-category/опции-для-тракторов/",
        "expected": 24,
    },
    {
        "name": "Запчасти для мототракторов и мотоблоков",
        "url": f"{BASE_URL}/product-category/запчасти-для-мототракторов-и-мото/",
        "expected": 22,
    },
    {
        "name": "Прочие трактора Shifeng/Mahindra/YTO",
        "url": f"{BASE_URL}/product-category/прочие-трактора-shifeng-шифенг-mahindra-yto/",
        "expected": 19,
    },
    # Остальные категории запчастей
    {
        "name": "Фильтра",
        "url": f"{BASE_URL}/product-category/фильтра/",
        "expected": 154,
    },
    {
        "name": "Двигателя дизельные",
        "url": f"{BASE_URL}/product-category/двигателя-дизельные/",
        "expected": 58,
    },
    {
        "name": "Стартеры, Генераторы",
        "url": f"{BASE_URL}/product-category/стартеры-генераторы/",
        "expected": 54,
    },
    {
        "name": "Универсальные комплектующие",
        "url": f"{BASE_URL}/product-category/универсальные-комплектующие/",
        "expected": 48,
    },
    {
        "name": "Сиденья (кресла)",
        "url": f"{BASE_URL}/product-category/сиденья-кресла/",
        "expected": 28,
    },
    {"name": "ЗИП", "url": f"{BASE_URL}/product-category/зип/", "expected": 16},
    {
        "name": "Гидравлика",
        "url": f"{BASE_URL}/product-category/гидравлика/",
        "expected": 0,  # Проверим есть ли товары
    },
    {
        "name": "Прочие запчасти",
        "url": f"{BASE_URL}/product-category/прочие-запчасти/",
        "expected": 500,
    },
]


async def parse_page_products(page, url, category_name):
    """Парсит товары с одной страницы"""
    products = []

    try:
        print(f"  📄 Парсинг страницы: {url}")
        await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        await page.wait_for_timeout(2000)

        # Ищем все товары на странице
        product_cards = await page.query_selector_all(".product")

        for card in product_cards:
            try:
                # Название товара
                name_el = await card.query_selector(".woocommerce-loop-product__title")
                name = await name_el.inner_text() if name_el else None

                # Ссылка на товар
                link_el = await card.query_selector("a.woocommerce-LoopProduct-link")
                link = await link_el.get_attribute("href") if link_el else None

                # Цена
                price_el = await card.query_selector(".price .woocommerce-Price-amount")
                price_text = await price_el.inner_text() if price_el else None

                # Изображение
                img_el = await card.query_selector("img")
                image_url = None
                if img_el:
                    image_url = await img_el.get_attribute("src")
                    if not image_url:
                        image_url = await img_el.get_attribute("data-src")

                # SKU (если есть)
                sku_el = await card.query_selector(".sku")
                sku = await sku_el.inner_text() if sku_el else None

                if name and price_text:
                    products.append(
                        {
                            "name": name.strip(),
                            "category": category_name,
                            "price": price_text.strip(),
                            "image_url": image_url,
                            "link": link,
                            "sku": sku.strip() if sku else None,
                        }
                    )

            except Exception as e:
                print(f"    ⚠️  Ошибка парсинга товара: {e}")
                continue

        return products

    except Exception as e:
        print(f"    ❌ Ошибка загрузки страницы: {e}")
        return []


async def parse_category(page, category):
    """Парсит все товары из категории (со всех страниц)"""
    all_products = []
    category_name = category["name"]
    base_url = category["url"]

    print(f"\n{'=' * 70}")
    print(f"📦 Категория: {category_name}")
    print(f"🔗 URL: {base_url}")
    print(f"📊 Ожидается товаров: {category['expected']}")
    print(f"{'=' * 70}")

    try:
        # Парсим первую страницу
        products = await parse_page_products(page, base_url, category_name)
        all_products.extend(products)

        # Проверяем есть ли пагинация
        pagination = await page.query_selector(".woocommerce-pagination")

        if pagination:
            # Находим все ссылки на страницы
            page_links = await pagination.query_selector_all("a.page-numbers")

            if page_links:
                # Находим последнюю страницу
                last_page = 1
                for link in page_links:
                    text = await link.inner_text()
                    if text.isdigit():
                        last_page = max(last_page, int(text))

                print(f"  📄 Найдено страниц: {last_page}")

                # Парсим остальные страницы
                for page_num in range(2, last_page + 1):
                    page_url = f"{base_url}page/{page_num}/"
                    products = await parse_page_products(page, page_url, category_name)
                    all_products.extend(products)

                    # Небольшая задержка между страницами
                    await asyncio.sleep(1)

        print(f"\n✅ Спарсено товаров: {len(all_products)}")
        print(f"📊 Ожидалось: {category['expected']}")

        if len(all_products) < category["expected"]:
            print(f"⚠️  Внимание! Спарсено меньше чем ожидалось!")

        return all_products

    except Exception as e:
        print(f"❌ Ошибка парсинга категории: {e}")
        return all_products


async def main():
    """Основная функция парсинга"""
    print("=" * 70)
    print("🚀 ПОЛНЫЙ ПАРСИНГ АГРОДОМ - ВСЕ ЗАПЧАСТИ")
    print("=" * 70)

    all_products = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Парсим каждую категорию
        for i, category in enumerate(CATEGORIES, 1):
            print(f"\n\n{'#' * 70}")
            print(f"# Категория {i}/{len(CATEGORIES)}")
            print(f"{'#' * 70}")

            products = await parse_category(page, category)
            all_products.extend(products)

            print(f"\n💾 Всего спарсено товаров: {len(all_products)}")

            # Сохраняем промежуточный результат
            with open(DATA_FILE, "w", encoding="utf-8") as f:
                json.dump(all_products, f, ensure_ascii=False, indent=2)

            # Задержка между категориями
            await asyncio.sleep(2)

        await browser.close()

    # Итоговая статистика
    print("\n\n" + "=" * 70)
    print("📊 ИТОГОВАЯ СТАТИСТИКА")
    print("=" * 70)
    print(f"✅ Всего спарсено товаров: {len(all_products)}")
    print(f"📁 Сохранено в: {DATA_FILE}")

    # Статистика по категориям
    print("\n📈 По категориям:")
    from collections import Counter

    category_counts = Counter(p["category"] for p in all_products)
    for cat, count in category_counts.most_common():
        print(f"  - {cat}: {count} товаров")

    print("\n" + "=" * 70)
    print("🎉 ПАРСИНГ ЗАВЕРШЕН!")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
