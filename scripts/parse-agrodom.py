#!/usr/bin/env python3
"""
Парсер сайта АГРОДОМ - запчасти для тракторов
https://xn----7sbabpgpk4bsbesjp1f.xn--p1ai/
"""

import asyncio
import json
import re
from pathlib import Path
from urllib.parse import urljoin, urlparse

import aiohttp
from playwright.async_api import async_playwright

# Базовые настройки
BASE_URL = "https://запчасти-агродом.рф/"
OUTPUT_DIR = Path(__file__).parent.parent / "parsed_data"
AGRODOM_DIR = OUTPUT_DIR / "agrodom"
DATA_FILE = AGRODOM_DIR / "parts.json"
IMAGES_DIR = AGRODOM_DIR / "images"

# Создаем директории
AGRODOM_DIR.mkdir(parents=True, exist_ok=True)
IMAGES_DIR.mkdir(exist_ok=True)

# Категории для парсинга
CATEGORIES = [
    {"name": "Гидравлика", "slug": "гидравлика"},
    {"name": "Двигателя дизельные", "slug": "двигателя-дизельные"},
    {
        "name": "Запчасти для навесного оборудования",
        "slug": "запчасти-для-навесного-оборудования",
    },
    {"name": "Запчасти для тракторов", "slug": "запчасти-для-тракторов"},
    {"name": "ЗИП", "slug": "зип"},
    {"name": "Карданные валы", "slug": "карданные-валы"},
    {"name": "Колёса, шины, груза", "slug": "колёса-шины-груза"},
    {"name": "Прочие запчасти", "slug": "прочие-запчасти"},
    {"name": "Сиденья (кресла)", "slug": "сиденья-кресла"},
    {"name": "Стандартные изделия", "slug": "стандартные-изделия"},
    {"name": "Стартеры, Генераторы", "slug": "стартеры-генераторы"},
    {"name": "Универсальные комплектующие", "slug": "универсальные-комплектующие"},
    {"name": "Фильтра", "slug": "фильтра"},
]


async def parse_category(page, category):
    """Парсит одну категорию товаров"""
    category_url = f"{BASE_URL}product-category/{category['slug']}/"
    print(f"\n📂 Категория: {category['name']}")
    print(f"🔗 URL: {category_url}")

    try:
        await page.goto(category_url, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(2000)
    except Exception as e:
        print(f"❌ Ошибка загрузки страницы: {e}")
        return []

    products = []
    page_num = 1

    while True:
        print(f"   📄 Страница {page_num}...")

        # Ищем товары на странице (WooCommerce)
        product_cards = await page.query_selector_all(
            ".product, .woocommerce-loop-product__link, article.product"
        )

        if not product_cards:
            print(f"   ⚠️  Товары не найдены")
            break

        print(f"   Найдено карточек: {len(product_cards)}")

        for i, card in enumerate(product_cards):
            try:
                # Название
                title_elem = await card.query_selector(
                    "h2, h3, .woocommerce-loop-product__title, .product-title"
                )
                title = await title_elem.inner_text() if title_elem else None

                # Ссылка на товар
                link_elem = await card.query_selector("a")
                product_url = (
                    await link_elem.get_attribute("href") if link_elem else None
                )

                # Цена
                price_elem = await card.query_selector(
                    ".price, .woocommerce-Price-amount, .amount"
                )
                price_text = await price_elem.inner_text() if price_elem else None

                # Изображение
                img_elem = await card.query_selector("img")
                img_url = None
                if img_elem:
                    img_url = await img_elem.get_attribute(
                        "src"
                    ) or await img_elem.get_attribute("data-src")
                    if img_url and not img_url.startswith("http"):
                        img_url = urljoin(BASE_URL, img_url)

                # SKU/артикул (может быть на странице товара)
                sku = None

                if title:
                    product = {
                        "name": title.strip(),
                        "category": category["name"],
                        "category_slug": category["slug"],
                        "url": product_url,
                        "price": price_text.strip() if price_text else None,
                        "image_url": img_url,
                        "sku": sku,
                    }
                    products.append(product)

            except Exception as e:
                print(f"   ❌ Ошибка обработки товара {i}: {e}")
                continue

        # Проверяем наличие следующей страницы
        next_button = await page.query_selector(".next.page-numbers, a.next")
        if next_button:
            try:
                await next_button.click()
                await page.wait_for_timeout(2000)
                page_num += 1
            except:
                break
        else:
            break

    print(f"   ✅ Найдено товаров: {len(products)}")
    return products


async def parse_site():
    """Основная функция парсинга"""
    all_products = []

    async with async_playwright() as p:
        print("🚀 Запуск браузера...")
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Парсим каждую категорию
        for category in CATEGORIES:
            products = await parse_category(page, category)
            all_products.extend(products)
            await asyncio.sleep(1)  # Пауза между категориями

        await browser.close()

    return all_products


async def download_image(session, url, filename):
    """Скачивает изображение"""
    try:
        async with session.get(url, timeout=30) as response:
            if response.status == 200:
                filepath = IMAGES_DIR / filename
                with open(filepath, "wb") as f:
                    f.write(await response.read())
                return True
    except Exception as e:
        print(f"✗ Ошибка скачивания {filename}: {e}")
    return False


async def main():
    """Главная функция"""
    print("=" * 70)
    print("ПАРСЕР САЙТА АГРОДОМ - Запчасти для тракторов")
    print("=" * 70)

    # Парсим сайт
    products = await parse_site()

    if not products:
        print("\n❌ Товары не найдены!")
        return

    print(f"\n✅ ИТОГО найдено товаров: {len(products)}")

    # Статистика по категориям
    print("\n📊 Статистика по категориям:")
    category_stats = {}
    for product in products:
        cat = product["category"]
        category_stats[cat] = category_stats.get(cat, 0) + 1

    for cat, count in sorted(category_stats.items(), key=lambda x: x[1], reverse=True):
        print(f"   {cat}: {count} товаров")

    # Сохраняем данные
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    print(f"\n📝 Данные сохранены в {DATA_FILE}")

    # Опционально: скачивание изображений
    download_images = input("\n📥 Скачать изображения? (y/n): ").lower() == "y"

    if download_images:
        print("\n📥 Скачивание изображений...")
        async with aiohttp.ClientSession() as session:
            tasks = []
            for i, product in enumerate(products):
                if product.get("image_url"):
                    ext = Path(urlparse(product["image_url"]).path).suffix or ".jpg"
                    filename = f"{i + 1:04d}_{product['category_slug']}{ext}"
                    tasks.append(
                        download_image(session, product["image_url"], filename)
                    )
                    tasks.append(
                        download_image(session, product["image_url"], filename)
                    )

            if tasks:
                results = await asyncio.gather(*tasks)
                success = sum(results)
                print(f"✅ Скачано: {success}/{len(tasks)} изображений")

    print("\n✅ Парсинг завершен!")
    print(f"📁 Данные: {AGRODOM_DIR}")


if __name__ == "__main__":
    asyncio.run(main())
