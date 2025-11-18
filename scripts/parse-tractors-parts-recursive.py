#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Рекурсивный парсер категории "Запчасти для тракторов" со ВСЕМИ подкатегориями
С возможностью возобновления работы с места остановки
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
START_CATEGORY = "запчасти-для-тракторов"
OUTPUT_DIR = Path(__file__).parent.parent / "parsed_data" / "agrodom"
OUTPUT_FILE = OUTPUT_DIR / "tractors-parts-recursive.json"
LOG_FILE = OUTPUT_DIR / "tractors-parse.log"
STATE_FILE = OUTPUT_DIR / "tractors-parse-state.json"

# Создаем директории
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# HTTP сессия
session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
})

# Глобальное состояние
visited_urls = set()
all_products = []
seen_product_links = set()
total_categories_parsed = 0


def log(message, level="INFO"):
    """Логирование в файл и консоль"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_message = f"[{timestamp}] [{level}] {message}"
    print(log_message)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(log_message + "\n")


def save_state():
    """Сохраняет текущее состояние парсинга"""
    state = {
        "visited_urls": list(visited_urls),
        "seen_product_links": list(seen_product_links),
        "total_products": len(all_products),
        "total_categories": total_categories_parsed,
        "timestamp": datetime.now().isoformat(),
    }
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)
    log(f"💾 Состояние сохранено: {len(all_products)} товаров, {total_categories_parsed} категорий")


def load_state():
    """Загружает состояние парсинга если есть"""
    global visited_urls, all_products, seen_product_links, total_categories_parsed

    if STATE_FILE.exists():
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            state = json.load(f)
        visited_urls = set(state.get("visited_urls", []))
        seen_product_links = set(state.get("seen_product_links", []))
        total_categories_parsed = state.get("total_categories", 0)
        log(f"✅ Загружено состояние: пропущено {len(visited_urls)} URLs")

    if OUTPUT_FILE.exists():
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            all_products = json.load(f)
        log(f"✅ Загружено {len(all_products)} товаров из предыдущего запуска")

        # Восстанавливаем seen_product_links из товаров если state файла не было
        if not STATE_FILE.exists():
            seen_product_links = set(p["link"] for p in all_products)
            log(f"✅ Восстановлено {len(seen_product_links)} уникальных ссылок из товаров")


def save_products():
    """Сохраняет все товары в JSON"""
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)
    log(f"📝 Сохранено {len(all_products)} товаров в {OUTPUT_FILE}")


def get_subcategories(url):
    """Находит все подкатегории на странице"""
    try:
        log(f"🔍 Поиск подкатегорий: {url.split('/')[-2]}")
        response = session.get(url, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")

        subcats = []
        # Ищем ссылки на подкатегории (WooCommerce стандарт)
        for link in soup.select('.product-categories a, .product-category a, .cat-item a'):
            href = link.get('href')
            if href and 'product-category' in href and href not in visited_urls:
                subcats.append(href)

        if subcats:
            log(f"  ✅ Найдено подкатегорий: {len(subcats)}")

        return subcats
    except Exception as e:
        log(f"  ❌ Ошибка поиска подкатегорий: {e}", "ERROR")
        return []


def get_products_from_page(url, retry=3):
    """Парсит товары с одной страницы с повторными попытками"""
    for attempt in range(retry):
        try:
            response = session.get(url, timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, "html.parser")

            products = []
            product_cards = soup.select(".product, .type-product")

            for item in product_cards:
                try:
                    # Название товара
                    name_elem = item.select_one(
                        "h2, .product-title, .woocommerce-loop-product__title"
                    )
                    if not name_elem:
                        continue

                    name = name_elem.get_text(strip=True)

                    # Пропускаем категории (обычно имеют название вида "Категория (123)")
                    if "(" in name and ")" in name and name[-1] == ")":
                        continue

                    # Ссылка на товар
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

                    # SKU (если есть на странице)
                    sku_elem = item.select_one(".sku")
                    sku = sku_elem.get_text(strip=True) if sku_elem else ""

                    if name and link:
                        products.append({
                            "name": name,
                            "price": price,
                            "image_url": image_url,
                            "link": link,
                            "sku": sku,
                        })
                        seen_product_links.add(link)

                except Exception as e:
                    log(f"    ⚠️  Ошибка парсинга товара: {e}", "WARN")
                    continue

            return products

        except requests.RequestException as e:
            if attempt < retry - 1:
                log(f"  ⚠️  Попытка {attempt + 1}/{retry} не удалась, повтор...", "WARN")
                time.sleep(2 * (attempt + 1))
            else:
                log(f"  ❌ Ошибка после {retry} попыток: {e}", "ERROR")
                return []

    return []


def parse_category_recursive(url, depth=0, max_depth=100):
    """Рекурсивно парсит категорию и все её подкатегории"""
    global total_categories_parsed

    # Проверяем не посещали ли уже
    if url in visited_urls:
        log(f"{'  ' * depth}⏭️  Пропуск (уже обработано): {url.split('/')[-2]}")
        return

    # Проверяем глубину
    if depth > max_depth:
        log(f"{'  ' * depth}⛔ Достигнута максимальная глубина", "WARN")
        return

    visited_urls.add(url)
    indent = "  " * depth
    category_name = url.split('/')[-2] if url.split('/')[-2] else url.split('/')[-3]

    log(f"{indent}{'=' * 60}")
    log(f"{indent}📂 Категория: {category_name} (глубина: {depth})")
    log(f"{indent}🔗 URL: {url}")

    category_products = []

    # Парсим товары со всех страниц (пагинация)
    for page_num in range(1, 101):  # максимум 100 страниц
        page_url = url if page_num == 1 else f"{url}page/{page_num}/"

        log(f"{indent}  📄 Страница {page_num}...")
        products = get_products_from_page(page_url)

        if not products:
            if page_num == 1:
                log(f"{indent}  ℹ️  Товаров не найдено (возможно только подкатегории)")
            break

        category_products.extend(products)
        log(f"{indent}    ✅ Получено товаров: {len(products)}")

        time.sleep(0.5)  # Задержка между страницами

    if category_products:
        all_products.extend(category_products)
        log(f"{indent}  💰 Всего товаров в категории: {len(category_products)}")
        log(f"{indent}  📊 ИТОГО в БД: {len(all_products)} товаров")

    total_categories_parsed += 1

    # Сохраняем прогресс после каждой категории
    save_products()
    save_state()

    # Ищем и парсим подкатегории
    subcategories = get_subcategories(url)

    if subcategories:
        log(f"{indent}  📁 Обработка {len(subcategories)} подкатегорий...")
        for i, subcat_url in enumerate(subcategories, 1):
            log(f"{indent}  [{i}/{len(subcategories)}] Подкатегория...")
            parse_category_recursive(subcat_url, depth + 1, max_depth)
            time.sleep(0.5)

    log(f"{indent}✅ Категория завершена: {category_name}")


def main():
    """Главная функция"""
    log("=" * 70)
    log("🚀 РЕКУРСИВНЫЙ ПАРСИНГ КАТЕГОРИИ 'ЗАПЧАСТИ ДЛЯ ТРАКТОРОВ'")
    log("=" * 70)

    # Загружаем предыдущее состояние
    load_state()

    start_url = f"{BASE_URL}/product-category/{START_CATEGORY}/"

    log(f"🎯 Начальная категория: {START_CATEGORY}")
    log(f"🔗 URL: {start_url}")
    log(f"📁 Файл вывода: {OUTPUT_FILE}")
    log(f"📝 Лог-файл: {LOG_FILE}")
    log("")

    try:
        # Начинаем парсинг
        start_time = time.time()
        parse_category_recursive(start_url)
        elapsed = time.time() - start_time

        # Итоговая статистика
        log("=" * 70)
        log("🎉 ПАРСИНГ ЗАВЕРШЕН!")
        log("=" * 70)
        log(f"✅ Всего товаров: {len(all_products)}")
        log(f"📂 Обработано категорий: {total_categories_parsed}")
        log(f"🔗 Уникальных URL: {len(visited_urls)}")
        log(f"⏱️  Время выполнения: {elapsed:.2f} сек ({elapsed/60:.2f} мин)")
        log(f"📁 Данные сохранены в: {OUTPUT_FILE}")
        log("=" * 70)

    except KeyboardInterrupt:
        log("\n⚠️  ПРЕРВАНО ПОЛЬЗОВАТЕЛЕМ", "WARN")
        log("💾 Сохранение прогресса...")
        save_products()
        save_state()
        log("✅ Прогресс сохранен. Запустите скрипт снова для продолжения.")

    except Exception as e:
        log(f"❌ КРИТИЧЕСКАЯ ОШИБКА: {e}", "ERROR")
        log("💾 Сохранение прогресса...")
        save_products()
        save_state()
        raise


if __name__ == "__main__":
    main()
