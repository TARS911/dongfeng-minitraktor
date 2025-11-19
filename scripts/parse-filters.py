#!/usr/bin/env python3
"""
Парсер фильтров с ZIP-AGRO.RU
"""

import requests
from bs4 import BeautifulSoup
import csv
import json
import time
from pathlib import Path

BASE_URL = "https://zip-agro.ru/filtry"

def parse_page(page_num):
    """Парсит одну страницу"""
    url = f"{BASE_URL}?page={page_num}"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        products = []
        items = soup.select('.product-item')

        print(f"   Страница {page_num}: найдено {len(items)} товаров")

        for item in items:
            try:
                # Название товара
                name_elem = item.select_one('.product-name a')
                name = name_elem.text.strip() if name_elem else "Без названия"

                # Артикул
                article_elem = item.select_one('.badge.stiker-upc') or item.select_one('.badge.stiker-ean')
                article = article_elem.text.strip() if article_elem else ""

                products.append({
                    'name': name,
                    'article': article,
                    'category': 'Фильтры'
                })

            except Exception as e:
                print(f"      ⚠️  Ошибка обработки товара: {e}")
                continue

        return products

    except Exception as e:
        print(f"   ❌ Ошибка загрузки страницы {page_num}: {e}")
        return []

def main():
    print("\n🚀 ПАРСИНГ ФИЛЬТРОВ С ZIP-AGRO.RU")
    print("=" * 70)

    # Определяем количество страниц
    response = requests.get(BASE_URL, timeout=10)
    soup = BeautifulSoup(response.content, 'html.parser')

    # Ищем пагинацию
    pagination_text = soup.select_one('.pagination-info')
    if pagination_text:
        text = pagination_text.text
        print(f"\n📋 {text}")

    # Парсим все страницы
    all_products = []
    page = 1

    print("\n📥 Загрузка товаров...\n")

    while True:
        products = parse_page(page)

        if not products:
            break

        all_products.extend(products)
        page += 1
        time.sleep(0.5)  # Задержка между запросами

    print(f"\n✅ Всего спарсено: {len(all_products)} товаров")

    # Сохраняем в CSV
    output_dir = Path("parsed_data")
    output_dir.mkdir(exist_ok=True)

    csv_file = output_dir / "zip-agro-filters.csv"
    json_file = output_dir / "zip-agro-filters.json"

    # CSV
    with open(csv_file, 'w', newline='', encoding='utf-8') as f:
        if all_products:
            writer = csv.DictWriter(f, fieldnames=['name', 'article', 'category'])
            writer.writeheader()
            writer.writerows(all_products)

    print(f"💾 CSV: {csv_file}")

    # JSON
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)

    print(f"💾 JSON: {json_file}")
    print("\n✅ Готово!\n")

if __name__ == "__main__":
    main()
