#!/usr/bin/env python3
"""
Парсер запчастей DongFeng 240-244 с ZIP-AGRO.RU
URL: https://zip-agro.ru/zapchasti-dongfeng-240-244
"""

import requests
from bs4 import BeautifulSoup
import csv
import json
import time
from pathlib import Path

BASE_URL = "https://zip-agro.ru/zapchasti-dongfeng-240-244"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def parse_page(page_num):
    """Парсит одну страницу"""
    if page_num == 1:
        url = BASE_URL
    else:
        url = f"{BASE_URL}?page={page_num}"

    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
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

                # Артикул (try both stiker-upc and stiker-ean)
                article_elem = item.select_one('.badge.stiker-upc') or item.select_one('.badge.stiker-ean')
                article = article_elem.text.strip() if article_elem else ""

                products.append({
                    'name': name,
                    'article': article,
                    'category': 'Запчасти DongFeng 240-244'
                })

            except Exception as e:
                print(f"      ⚠️  Ошибка обработки товара: {e}")
                continue

        return products

    except Exception as e:
        print(f"   ❌ Ошибка загрузки страницы {page_num}: {e}")
        return []

def main():
    print("\n🚀 ПАРСИНГ ЗАПЧАСТЕЙ DONGFENG 240-244 С ZIP-AGRO.RU")
    print("=" * 70)

    # Парсим все страницы
    all_products = []
    page = 1

    print("\n📥 Загрузка товаров...\n")

    while True:
        products = parse_page(page)

        if not products or len(products) == 0:
            break

        all_products.extend(products)
        page += 1
        time.sleep(0.5)  # Задержка между запросами

        # Ограничение на 30 страниц для безопасности
        if page > 30:
            print("   ⚠️  Достигнут лимит страниц (30)")
            break

    print(f"\n✅ Всего спарсено: {len(all_products)} товаров")

    # Сохраняем в CSV
    output_dir = Path("parsed_data/zip-agro")
    output_dir.mkdir(exist_ok=True)

    csv_file = output_dir / "zip-agro-dongfeng-240-244-new.csv"
    json_file = output_dir / "zip-agro-dongfeng-240-244-new.json"

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
