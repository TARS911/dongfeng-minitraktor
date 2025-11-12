#!/usr/bin/env python3
"""
Парсер изображений тракторов DongFeng с сайта dongfeng-traktor.com
"""

import asyncio
import json
import re
from pathlib import Path
from urllib.parse import urljoin, urlparse

import aiohttp
from playwright.async_api import async_playwright

# Базовые настройки
BASE_URL = "https://dongfeng-traktor.com/"
OUTPUT_DIR = Path(__file__).parent.parent / "parsed_data"
IMAGES_DIR = OUTPUT_DIR / "dongfeng_images"
MAPPING_FILE = OUTPUT_DIR / "dongfeng_image_mapping.json"

# Создаем директории
IMAGES_DIR.mkdir(exist_ok=True)

# Модели для поиска
MODELS = [
    "244",
    "244 G2",
    "244G2",
    "304",
    "404",
    "504",
    "504 G3",
    "504G3",
    "704",
    "804",
    "904",
    "1004",
    "1204",
    "1304",
    "1304E",
    "1404",
    "1604",
    "2004",
]


async def download_image(session, url, filename):
    """Скачивает изображение по URL"""
    try:
        async with session.get(url, timeout=30) as response:
            if response.status == 200:
                filepath = IMAGES_DIR / filename
                content = await response.read()
                with open(filepath, "wb") as f:
                    f.write(content)
                print(f"  ✓ Скачано: {filename}")
                return str(filepath)
    except Exception as e:
        print(f"  ✗ Ошибка скачивания {filename}: {e}")
    return None


async def parse_images():
    """Парсит изображения с сайта"""
    print("=" * 70)
    print("ПАРСИНГ ИЗОБРАЖЕНИЙ ТРАКТОРОВ DONGFENG")
    print("=" * 70)

    async with async_playwright() as p:
        print("\n🚀 Запуск браузера...")
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        print(f"📄 Загрузка страницы {BASE_URL}...")
        await page.goto(BASE_URL, wait_until="networkidle", timeout=60000)
        await page.wait_for_timeout(5000)  # Ждем загрузки динамического контента

        print("\n🔍 Поиск изображений тракторов...")

        # Ищем все изображения на странице
        all_images = await page.query_selector_all("img")
        print(f"Найдено изображений на странице: {len(all_images)}")

        image_mapping = {}
        found_images = []

        for img in all_images:
            try:
                # Получаем URL изображения
                src = await img.get_attribute("src")
                if not src:
                    src = await img.get_attribute("data-src")
                if not src:
                    continue

                # Делаем URL абсолютным
                if not src.startswith("http"):
                    src = urljoin(BASE_URL, src)

                # Получаем alt текст и title
                alt = await img.get_attribute("alt") or ""
                title = await img.get_attribute("title") or ""

                # Получаем текст рядом с изображением
                parent = await img.evaluate_handle("el => el.parentElement")
                parent_text = (
                    await parent.evaluate("el => el.textContent") if parent else ""
                )

                combined_text = f"{alt} {title} {parent_text}".lower()

                # Проверяем, относится ли изображение к DongFeng
                if (
                    "dongfeng" in combined_text
                    or "донгфенг" in combined_text
                    or "дф" in combined_text
                ):
                    # Пытаемся найти модель
                    for model in MODELS:
                        model_pattern = model.replace(" ", "\\s*")
                        if re.search(
                            rf"\b{model_pattern}\b", combined_text, re.IGNORECASE
                        ):
                            found_images.append(
                                {
                                    "model": model,
                                    "url": src,
                                    "alt": alt,
                                    "title": title,
                                }
                            )
                            print(f"  ✓ Найдено: DongFeng {model}")
                            break

            except Exception as e:
                continue

        print(f"\n✅ Найдено изображений для моделей: {len(found_images)}")

        await browser.close()

        return found_images


async def download_all_images(images):
    """Скачивает все найденные изображения"""
    print("\n📥 Скачивание изображений...")

    image_mapping = {}

    async with aiohttp.ClientSession() as session:
        for i, img_data in enumerate(images):
            model = img_data["model"]
            url = img_data["url"]

            # Формируем имя файла
            ext = Path(urlparse(url).path).suffix or ".jpg"
            filename = f"dongfeng-{model.replace(' ', '-').lower()}{ext}"

            print(f"\n📷 DongFeng {model}")
            print(f"  URL: {url}")

            filepath = await download_image(session, url, filename)

            if filepath:
                image_mapping[model] = {
                    "filename": filename,
                    "filepath": filepath,
                    "url": url,
                    "alt": img_data.get("alt"),
                    "title": img_data.get("title"),
                }

    return image_mapping


async def main():
    """Основная функция"""
    # Парсим изображения
    images = await parse_images()

    if not images:
        print("\n⚠️  Изображения не найдены автоматически.")
        print("Попробуем найти изображения вручную...")

        # Альтернативный метод - ищем все изображения с DongFeng
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()

            await page.goto(BASE_URL, wait_until="networkidle")
            await page.wait_for_timeout(5000)

            # Получаем все изображения
            all_images = await page.evaluate("""
                () => {
                    const images = [];
                    document.querySelectorAll('img').forEach(img => {
                        if (img.src && img.src.includes('http')) {
                            images.push({
                                src: img.src,
                                alt: img.alt || '',
                                title: img.title || '',
                                width: img.width,
                                height: img.height
                            });
                        }
                    });
                    return images;
                }
            """)

            await browser.close()

            # Фильтруем изображения (большие, вероятно тракторы)
            print(f"\n📊 Всего изображений: {len(all_images)}")

            tractor_images = []
            for img in all_images:
                # Берем изображения больше 200x200
                if img["width"] >= 200 and img["height"] >= 200:
                    # Исключаем логотипы и иконки
                    if (
                        "logo" not in img["src"].lower()
                        and "icon" not in img["src"].lower()
                    ):
                        tractor_images.append(
                            {
                                "model": "unknown",
                                "url": img["src"],
                                "alt": img["alt"],
                                "title": img["title"],
                            }
                        )

            print(f"🖼️  Потенциальных изображений тракторов: {len(tractor_images)}")

            if tractor_images:
                images = tractor_images[:20]  # Берем первые 20

    if not images:
        print("\n❌ Изображения не найдены!")
        return

    # Скачиваем изображения
    mapping = await download_all_images(images)

    # Сохраняем маппинг
    with open(MAPPING_FILE, "w", encoding="utf-8") as f:
        json.dump(mapping, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Маппинг сохранен: {MAPPING_FILE}")
    print(f"📁 Изображения сохранены в: {IMAGES_DIR}")
    print(f"\n📊 Скачано: {len(mapping)} изображений")


if __name__ == "__main__":
    asyncio.run(main())
