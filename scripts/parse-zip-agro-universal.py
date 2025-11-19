#!/usr/bin/env python3
"""
Универсальный парсер ZIP-AGRO.RU с ПОЛНЫМИ данными
Использование: python3 parse-zip-agro-universal.py <URL> <output_filename>
"""

import sys
import requests
from bs4 import BeautifulSoup
import csv
import json
import time
import re
from pathlib import Path

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def parse_page(url, page_num):
    """Парсит одну страницу"""
    if page_num == 1:
        page_url = url
    else:
        page_url = f"{url}?page={page_num}"

    try:
        response = requests.get(page_url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        products = []
        items = soup.select('.product-item')

        print(f"   Страница {page_num}: найдено {len(items)} товаров")

        for item in items:
            try:
                # Название товара
                name_elem = item.select_one('.product-name a')
                title = name_elem.text.strip() if name_elem else ""
                product_url = name_elem.get('href', '') if name_elem else ""
                if product_url and not product_url.startswith('http'):
                    product_url = 'https://zip-agro.ru' + product_url

                # Артикул
                article_elem = item.select_one('.badge.stiker-upc') or item.select_one('.badge.stiker-ean')
                article = article_elem.text.strip() if article_elem else ""

                # Цена
                price_elem = item.select_one('.price-new, .price')
                price = ""
                if price_elem:
                    price_text = price_elem.text.strip()
                    price_match = re.search(r'[\d\s]+\.?\d*', price_text.replace(' ', ''))
                    if price_match:
                        price = price_match.group(0).replace(' ', '')

                # Фото (из data-src, т.к. lazy loading)
                image_elem = item.select_one('img')
                image_url = ""
                if image_elem:
                    # Сначала пробуем data-src (для lazy loading)
                    image_url = image_elem.get('data-src', '') or image_elem.get('src', '')
                    # Если URL относительный, делаем абсолютным
                    if image_url and not image_url.startswith('http'):
                        image_url = 'https://zip-agro.ru/' + image_url.lstrip('/')

                # Наличие
                stock_elem = item.select_one('.stock-status, .availability')
                stock = stock_elem.text.strip() if stock_elem else "В наличии"

                # Описание (краткое)
                desc_elem = item.select_one('.product-description, .caption p')
                description = desc_elem.text.strip() if desc_elem else ""

                # Бренд из URL или категории
                brand = "Неизвестно"
                if 'dongfeng' in url.lower():
                    brand = "DongFeng"
                elif 'foton' in url.lower():
                    brand = "Foton"
                elif 'jinma' in url.lower():
                    brand = "Jinma"
                elif 'xingtai' in url.lower():
                    brand = "Xingtai"

                products.append({
                    'title': title,
                    'article': article,
                    'price': price,
                    'brand': brand,
                    'category': 'Запчасти',
                    'stock': stock,
                    'description': description,
                    'url': product_url,
                    'image_url': image_url
                })

            except Exception as e:
                print(f"      ⚠️  Ошибка обработки товара: {e}")
                continue

        return products

    except Exception as e:
        print(f"   ❌ Ошибка загрузки страницы {page_num}: {e}")
        return []

def main():
    if len(sys.argv) < 3:
        print("Использование: python3 parse-zip-agro-universal.py <URL> <output_filename>")
        sys.exit(1)

    base_url = sys.argv[1]
    output_name = sys.argv[2]

    print(f"\n🚀 ПАРСИНГ: {base_url}")
    print("=" * 70)

    # Парсим все страницы
    all_products = []
    seen_urls = set()  # Отслеживание уникальных URL
    page = 1

    print("\n📥 Загрузка товаров...\n")

    while True:
        products = parse_page(base_url, page)

        if not products or len(products) == 0:
            break

        # Проверяем, есть ли новые товары (не дубликаты)
        new_products = []
        for p in products:
            if p['url'] not in seen_urls:
                seen_urls.add(p['url'])
                new_products.append(p)

        # Если новых товаров нет - все товары уже спарсены
        if len(new_products) == 0:
            print(f"   ⚠️  Страница {page}: все товары уже спарсены, останавливаемся")
            break

        all_products.extend(new_products)

        # Если на странице меньше товаров чем обычно - возможно это последняя страница
        if len(new_products) < len(products):
            print(f"   ℹ️  Страница {page}: найдено {len(new_products)} новых товаров (пропущено {len(products) - len(new_products)} дубликатов)")

        page += 1
        time.sleep(0.5)

        # Ограничение на 50 страниц
        if page > 50:
            print("   ⚠️  Достигнут лимит страниц (50)")
            break

    print(f"\n✅ Всего спарсено: {len(all_products)} товаров")

    # Сохраняем
    output_dir = Path("parsed_data/zip-agro")
    output_dir.mkdir(parents=True, exist_ok=True)

    csv_file = output_dir / f"{output_name}.csv"
    json_file = output_dir / f"{output_name}.json"

    # CSV
    fieldnames = ['title', 'article', 'price', 'brand', 'category', 'stock', 'description', 'url', 'image_url']
    with open(csv_file, 'w', newline='', encoding='utf-8') as f:
        if all_products:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(all_products)

    print(f"💾 CSV: {csv_file}")

    # JSON
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)

    print(f"💾 JSON: {json_file}")
    print("✅ Готово!\n")

if __name__ == "__main__":
    main()
