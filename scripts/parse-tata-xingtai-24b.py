#!/usr/bin/env python3
"""
Парсер запчастей Xingtai 24B с TATA-AGRO-MOTO.COM
"""

import requests
from bs4 import BeautifulSoup
import csv
import json
import time
import re
from pathlib import Path

BASE_URL = "https://tata-agro-moto.com/ru/zapchasti-k-traktoram-xingtai-24b/"

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
        items = soup.select('.product-list__item')

        print(f"   Страница {page_num}: найдено {len(items)} товаров")

        for item in items:
            try:
                # Название и код товара в одном элементе
                title_elem = item.select_one('.product-thumb__title')

                if title_elem:
                    # Название в первом span
                    name_span = title_elem.select_one('span:first-child')
                    name = name_span.get_text(strip=True) if name_span else "Без названия"

                    # Код товара во втором span с классом prodcode
                    code_elem = title_elem.select_one('.prodcode')
                    if code_elem:
                        code_match = re.search(r'Код:\s*(\d+)', code_elem.get_text())
                        article = code_match.group(1) if code_match else ""
                    else:
                        article = ""
                else:
                    name = "Без названия"
                    article = ""

                products.append({
                    'name': name,
                    'article': article,
                    'category': 'Запчасти к тракторам Xingtai 24B (TATA)'
                })

            except Exception as e:
                print(f"      ⚠️  Ошибка обработки товара: {e}")
                continue

        return products

    except Exception as e:
        print(f"   ❌ Ошибка загрузки страницы {page_num}: {e}")
        return []

def main():
    print("\n🚀 ПАРСИНГ ЗАПЧАСТЕЙ XINGTAI 24B С TATA-AGRO-MOTO.COM")
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
        time.sleep(1)  # Задержка между запросами

        # Ограничение на 30 страниц для безопасности
        if page > 30:
            print("   ⚠️  Достигнут лимит страниц (30)")
            break

    print(f"\n✅ Всего спарсено: {len(all_products)} товаров")

    # Сохраняем в CSV
    output_dir = Path("parsed_data")
    output_dir.mkdir(exist_ok=True)

    csv_file = output_dir / "tata-agro-xingtai-24b.csv"
    json_file = output_dir / "tata-agro-xingtai-24b.json"

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
