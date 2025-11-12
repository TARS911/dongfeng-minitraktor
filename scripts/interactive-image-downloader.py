#!/usr/bin/env python3
"""
Интерактивный скрипт для скачивания изображений с dongfeng-traktor.com
Открывает браузер в НЕ headless режиме и показывает изображения
"""

import asyncio
import json
from pathlib import Path
from urllib.parse import urljoin

import aiohttp
from playwright.async_api import async_playwright

# Настройки
BASE_URL = "https://dongfeng-traktor.com/"
OUTPUT_DIR = Path(__file__).parent.parent / "parsed_data" / "dongfeng_images"
OUTPUT_DIR.mkdir(exist_ok=True)


async def download_image(url, filename):
    """Скачивает изображение"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=30) as response:
                if response.status == 200:
                    filepath = OUTPUT_DIR / filename
                    with open(filepath, "wb") as f:
                        f.write(await response.read())
                    print(f"  ✅ Сохранено: {filename}")
                    return True
    except Exception as e:
        print(f"  ❌ Ошибка: {e}")
    return False


async def main():
    """Основная функция"""
    print("=" * 70)
    print("🖼️  ИНТЕРАКТИВНОЕ СКАЧИВАНИЕ ИЗОБРАЖЕНИЙ DONGFENG")
    print("=" * 70)
    print("\n📌 Инструкция:")
    print("1. Сейчас откроется браузер")
    print("2. Дождитесь полной загрузки страницы")
    print("3. Изображения будут автоматически найдены и скачаны")
    print("4. Или вы можете вручную указать URL изображений")
    print("\n" + "=" * 70)

    input("\n👉 Нажмите Enter чтобы открыть браузер...")

    async with async_playwright() as p:
        print("\n🚀 Запуск браузера (с графическим интерфейсом)...")
        browser = await p.chromium.launch(
            headless=False,  # Показываем браузер
            slow_mo=1000,  # Замедляем для наблюдения
        )

        page = await browser.new_page()

        print(f"📄 Открываем {BASE_URL}...")
        try:
            await page.goto(BASE_URL, timeout=30000)
            print("✅ Страница загружена")
        except Exception as e:
            print(f"⚠️  Ошибка загрузки: {e}")
            print("Попробуйте открыть сайт вручную в браузере")

        # Ждем загрузки контента
        print("\n⏳ Ждем загрузки изображений (15 секунд)...")
        await asyncio.sleep(15)

        print("\n🔍 Поиск изображений на странице...")

        # Получаем все изображения
        images = await page.evaluate("""
            () => {
                const imgs = [];
                document.querySelectorAll('img').forEach(img => {
                    if (img.src &&
                        img.src.includes('http') &&
                        img.width > 150 &&
                        !img.src.includes('logo') &&
                        !img.src.includes('icon')) {
                        imgs.push({
                            src: img.src,
                            alt: img.alt || '',
                            title: img.title || '',
                            width: img.width,
                            height: img.height
                        });
                    }
                });
                return imgs;
            }
        """)

        print(f"\n✅ Найдено потенциальных изображений тракторов: {len(images)}")

        if images:
            print("\n📋 Список найденных изображений:")
            print("-" * 70)
            for i, img in enumerate(images, 1):
                print(f"\n{i}. {img['alt'] or img['title'] or 'Без названия'}")
                print(f"   URL: {img['src']}")
                print(f"   Размер: {img['width']}x{img['height']}")

        # Интерактивный выбор
        print("\n" + "=" * 70)
        print("📥 СКАЧИВАНИЕ ИЗОБРАЖЕНИЙ")
        print("=" * 70)

        mode = input(
            "\nВыберите режим:\n1 - Скачать все автоматически\n2 - Выбрать вручную\n3 - Ввести URL вручную\nВаш выбор (1/2/3): "
        )

        downloaded = []

        if mode == "1":
            # Автоматическое скачивание
            print("\n📥 Автоматическое скачивание всех изображений...")
            for i, img in enumerate(images[:16], 1):  # Первые 16
                filename = f"dongfeng-auto-{i}.jpg"
                print(f"\n{i}/16: {img['src'][:60]}...")
                if await download_image(img["src"], filename):
                    downloaded.append(filename)

        elif mode == "2":
            # Выбор вручную
            print("\n📥 Выбор изображений вручную...")
            print("Введите номера изображений через запятую (например: 1,3,5)")
            print("Или введите 'all' чтобы скачать все")

            choice = input("\nВаш выбор: ").strip()

            if choice.lower() == "all":
                indices = range(len(images))
            else:
                try:
                    indices = [int(x.strip()) - 1 for x in choice.split(",")]
                except:
                    print("❌ Неверный формат")
                    indices = []

            for idx in indices:
                if 0 <= idx < len(images):
                    img = images[idx]
                    # Запрашиваем имя файла
                    print(f"\n📷 Изображение: {img['alt']}")
                    model = input("   Введите модель (например: 244, 504-g3): ").strip()
                    if model:
                        filename = f"dongfeng-{model.lower().replace(' ', '-')}.jpg"
                        if await download_image(img["src"], filename):
                            downloaded.append(filename)

        elif mode == "3":
            # Ввод URL вручную
            print("\n📥 Ввод URL вручную...")
            print("Введите URL изображения и модель трактора")
            print("Для завершения введите пустую строку")

            while True:
                print("\n" + "-" * 70)
                url = input("URL изображения (или Enter для завершения): ").strip()
                if not url:
                    break

                model = input("Модель (например: 244, 504-g3): ").strip()
                if not model:
                    print("⚠️  Пропущено - не указана модель")
                    continue

                filename = f"dongfeng-{model.lower().replace(' ', '-')}.jpg"
                print(f"💾 Скачивание {filename}...")
                if await download_image(url, filename):
                    downloaded.append(filename)

        print("\n" + "=" * 70)
        print("📊 РЕЗУЛЬТАТЫ")
        print("=" * 70)
        print(f"✅ Скачано изображений: {len(downloaded)}")
        print(f"📁 Папка: {OUTPUT_DIR}")

        if downloaded:
            print("\n📋 Скачанные файлы:")
            for f in downloaded:
                print(f"  - {f}")

        print("\n👉 Не закрывайте браузер! Изучите страницу.")
        input("   Нажмите Enter когда закончите...")

        await browser.close()

    print("\n✅ Готово!")

    if downloaded:
        print("\n📤 Следующий шаг:")
        print("   python scripts/upload-dongfeng-images.py")


if __name__ == "__main__":
    asyncio.run(main())
