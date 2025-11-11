#!/usr/bin/env python3
"""
Парсер сайта dongfeng-traktor.com
Извлекает названия тракторов, характеристики и изображения
"""

import asyncio
import json
import os
import re
from pathlib import Path
from urllib.parse import urljoin, urlparse
import aiohttp
from playwright.async_api import async_playwright

# Базовые настройки
BASE_URL = "https://dongfeng-traktor.com/"
OUTPUT_DIR = Path(__file__).parent.parent / "parsed_data"
IMAGES_DIR = OUTPUT_DIR / "images"
DATA_FILE = OUTPUT_DIR / "tractors.json"

# Создаем директории
OUTPUT_DIR.mkdir(exist_ok=True)
IMAGES_DIR.mkdir(exist_ok=True)


async def download_image(session, url, filename):
    """Скачивает изображение по URL"""
    try:
        async with session.get(url) as response:
            if response.status == 200:
                filepath = IMAGES_DIR / filename
                with open(filepath, 'wb') as f:
                    f.write(await response.read())
                print(f"✓ Скачано: {filename}")
                return True
    except Exception as e:
        print(f"✗ Ошибка скачивания {url}: {e}")
    return False


async def parse_site():
    """Парсит сайт с помощью Playwright"""
    async with async_playwright() as p:
        print("🚀 Запуск браузера...")
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        print(f"📄 Загрузка страницы {BASE_URL}...")
        await page.goto(BASE_URL, wait_until="networkidle")

        # Ждем загрузки динамического контента
        await page.wait_for_timeout(3000)

        tractors = []

        # Пытаемся найти карточки тракторов
        print("🔍 Поиск тракторов на странице...")

        # Вариант 1: Поиск в магазине/каталоге
        product_cards = await page.query_selector_all('.t-store__card, .t-product, .product-card')

        if product_cards:
            print(f"Найдено {len(product_cards)} карточек товаров")
            for i, card in enumerate(product_cards):
                try:
                    # Название
                    title_elem = await card.query_selector('.t-store__card__title, .t-product__title, .product-title, h3, h4')
                    title = await title_elem.inner_text() if title_elem else f"Трактор {i+1}"

                    # Изображение
                    img_elem = await card.query_selector('img')
                    img_url = await img_elem.get_attribute('src') if img_elem else None
                    if img_url and not img_url.startswith('http'):
                        img_url = urljoin(BASE_URL, img_url)

                    # Цена
                    price_elem = await card.query_selector('.t-store__card__price, .t-product__price, .price')
                    price = await price_elem.inner_text() if price_elem else None

                    # Описание
                    desc_elem = await card.query_selector('.t-store__card__descr, .t-product__descr, .description')
                    description = await desc_elem.inner_text() if desc_elem else None

                    tractor = {
                        "name": title.strip(),
                        "image_url": img_url,
                        "price": price.strip() if price else None,
                        "description": description.strip() if description else None
                    }

                    tractors.append(tractor)
                    print(f"✓ {title.strip()}")

                except Exception as e:
                    print(f"✗ Ошибка обработки карточки {i}: {e}")

        # Вариант 2: Поиск по всем изображениям и заголовкам
        if not tractors:
            print("⚠️  Карточки не найдены, пробуем альтернативный метод...")

            # Ищем все заголовки с моделями DongFeng
            all_text = await page.inner_text('body')
            dongfeng_models = re.findall(r'DongFeng\s+\d+[A-Z0-9\s]*', all_text, re.IGNORECASE)

            unique_models = list(set(dongfeng_models))
            print(f"Найдено {len(unique_models)} уникальных моделей: {unique_models}")

            # Ищем все изображения
            all_images = await page.query_selector_all('img')
            print(f"Найдено {len(all_images)} изображений")

            for model in unique_models:
                tractors.append({
                    "name": model.strip(),
                    "image_url": None,
                    "price": None,
                    "description": None
                })

        await browser.close()

        return tractors


async def main():
    """Основная функция"""
    print("=" * 60)
    print("ПАРСЕР САЙТА dongfeng-traktor.com")
    print("=" * 60)

    # Парсим сайт
    tractors = await parse_site()

    if not tractors:
        print("❌ Тракторы не найдены!")
        return

    print(f"\n✅ Найдено тракторов: {len(tractors)}")

    # Сохраняем данные в JSON
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(tractors, f, ensure_ascii=False, indent=2)
    print(f"📝 Данные сохранены в {DATA_FILE}")

    # Скачиваем изображения
    print("\n📥 Скачивание изображений...")
    async with aiohttp.ClientSession() as session:
        tasks = []
        for i, tractor in enumerate(tractors):
            if tractor.get('image_url'):
                ext = Path(urlparse(tractor['image_url']).path).suffix or '.jpg'
                filename = f"{i+1:03d}_{tractor['name'].replace(' ', '_').replace('/', '_')}{ext}"
                tasks.append(download_image(session, tractor['image_url'], filename))

        if tasks:
            await asyncio.gather(*tasks)
        else:
            print("⚠️  Изображения не найдены")

    print("\n✅ Парсинг завершен!")
    print(f"📁 Данные: {OUTPUT_DIR}")
    print(f"🖼️  Изображения: {IMAGES_DIR}")


if __name__ == "__main__":
    asyncio.run(main())
