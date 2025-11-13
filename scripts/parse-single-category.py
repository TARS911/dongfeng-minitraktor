#!/usr/bin/env python3
"""
Парсит ОДНУ категорию запчастей
"""

import asyncio
import json
import sys
from pathlib import Path

from playwright.async_api import async_playwright

BASE_URL = "https://xn----7sbabpgpk4bsbesjp1f.xn--p1ai"
OUTPUT_DIR = Path(__file__).parent.parent / "parsed_data" / "agrodom"


async def parse_page_products(page, url, category_name):
    """Парсит товары с одной страницы"""
    products = []

    try:
        print(f"  📄 Парсинг: {url}")
        await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        await page.wait_for_timeout(2000)

        product_cards = await page.query_selector_all(".product")

        for card in product_cards:
            try:
                name_el = await card.query_selector(".woocommerce-loop-product__title")
                name = await name_el.inner_text() if name_el else None

                link_el = await card.query_selector("a.woocommerce-LoopProduct-link")
                link = await link_el.get_attribute("href") if link_el else None

                price_el = await card.query_selector(".price .woocommerce-Price-amount")
                price_text = await price_el.inner_text() if price_el else None

                img_el = await card.query_selector("img")
                image_url = None
                if img_el:
                    image_url = await img_el.get_attribute("src")
                    if not image_url:
                        image_url = await img_el.get_attribute("data-src")

                if name and price_text:
                    products.append(
                        {
                            "name": name.strip(),
                            "category": category_name,
                            "price": price_text.strip(),
                            "image_url": image_url,
                            "link": link,
                        }
                    )

            except Exception as e:
                continue

        return products

    except Exception as e:
        print(f"    ❌ Ошибка: {e}")
        return []


async def parse_category(category_name, category_url, output_file):
    """Парсит все товары из категории"""
    all_products = []

    print(f"\n{'=' * 70}")
    print(f"📦 Категория: {category_name}")
    print(f"🔗 URL: {category_url}")
    print(f"{'=' * 70}")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        try:
            # Парсим первую страницу
            products = await parse_page_products(page, category_url, category_name)
            all_products.extend(products)
            print(f"  ✅ Страница 1: {len(products)} товаров")

            # Проверяем пагинацию
            pagination = await page.query_selector(".woocommerce-pagination")

            if pagination:
                page_links = await pagination.query_selector_all("a.page-numbers")

                if page_links:
                    last_page = 1
                    for link in page_links:
                        text = await link.inner_text()
                        if text.isdigit():
                            last_page = max(last_page, int(text))

                    print(f"  📄 Найдено страниц: {last_page}")

                    # Парсим остальные страницы
                    for page_num in range(2, last_page + 1):
                        page_url = f"{category_url}page/{page_num}/"
                        products = await parse_page_products(
                            page, page_url, category_name
                        )
                        all_products.extend(products)
                        print(f"  ✅ Страница {page_num}: {len(products)} товаров")
                        await asyncio.sleep(1)

            print(f"\n✅ ИТОГО: {len(all_products)} товаров")

            # Сохраняем
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(all_products, f, ensure_ascii=False, indent=2)

            print(f"💾 Сохранено в: {output_file}")

        finally:
            await browser.close()

    return all_products


async def main():
    if len(sys.argv) < 4:
        print("Usage: python3 parse-single-category.py <name> <url> <output_file>")
        sys.exit(1)

    category_name = sys.argv[1]
    category_url = sys.argv[2]
    output_file = OUTPUT_DIR / sys.argv[3]

    await parse_category(category_name, category_url, output_file)


if __name__ == "__main__":
    asyncio.run(main())
