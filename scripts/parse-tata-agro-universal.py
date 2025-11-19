#!/usr/bin/env python3
"""
Универсальный парсер TATA-AGRO-MOTO.COM с ПОЛНЫМИ данными
Использование: python3 parse-tata-agro-universal.py <URL> <output_filename>
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
        separator = '&' if '?' in url else '?'
        page_url = f"{url}{separator}page={page_num}"

    try:
        response = requests.get(page_url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        products = []
        items = soup.select('.product-list > li')

        print(f"   Страница {page_num}: найдено {len(items)} товаров")

        for item in items:
            try:
                # Название товара и URL
                link_elem = item.select_one('a[href]')
                title = ""
                product_url = link_elem.get('href', '') if link_elem else ""

                # Название в span внутри ссылки
                name_span = item.select_one('a span')
                if name_span:
                    title = name_span.text.strip()

                # Артикул из .prodcode (внутри есть span с наличием, нужно извлечь только "Код: XXXX")
                article_elem = item.select_one('.prodcode')
                article = ""
                if article_elem:
                    # Получаем весь текст и ищем "Код: XXXX"
                    full_text = article_elem.get_text()
                    code_match = re.search(r'(?:Код|Артикул|Code):\s*(\S+)', full_text, flags=re.IGNORECASE)
                    if code_match:
                        article = code_match.group(1).strip()

                # Цена из .price__current
                price_elem = item.select_one('.price__current')
                price = ""
                if price_elem:
                    price_text = price_elem.text.strip()
                    # Извлекаем только цифры
                    price_match = re.search(r'[\d\s]+\.?\d*', price_text.replace(' ', ''))
                    if price_match:
                        price = price_match.group(0).replace(' ', '')

                # Фото
                image_elem = item.select_one('img')
                image_url = ""
                if image_elem:
                    image_url = image_elem.get('src', '') or image_elem.get('data-src', '')
                    # Если URL относительный, делаем абсолютным
                    if image_url and not image_url.startswith('http'):
                        if image_url.startswith('//'):
                            image_url = 'https:' + image_url
                        else:
                            image_url = 'https://tata-agro-moto.com/' + image_url.lstrip('/')

                # Наличие
                stock_elem = item.select_one('.product-in-stock, .stock_status_id_7')
                stock = stock_elem.text.strip() if stock_elem else "Уточняйте"

                # Описание (если есть)
                description = ""

                # Бренд из URL
                brand = "Неизвестно"
                url_lower = url.lower()
                if 'dongfeng' in url_lower:
                    brand = "DongFeng"
                elif 'foton' in url_lower:
                    brand = "Foton"
                elif 'jinma' in url_lower:
                    brand = "Jinma"
                elif 'xingtai' in url_lower:
                    brand = "Xingtai"
                elif 'shifeng' in url_lower:
                    brand = "Shifeng"
                elif 'zubr' in url_lower:
                    brand = "Zubr"

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
        print("Использование: python3 parse-tata-agro-universal.py <URL> <output_filename>")
        sys.exit(1)

    base_url = sys.argv[1]
    output_name = sys.argv[2]

    print(f"\n🚀 ПАРСИНГ: {base_url}")
    print("=" * 70)

    # Парсим все страницы
    all_products = []
    page = 1

    print("\n📥 Загрузка товаров...\n")

    while True:
        products = parse_page(base_url, page)

        if not products or len(products) == 0:
            break

        all_products.extend(products)
        page += 1
        time.sleep(0.5)

        # Ограничение на 50 страниц
        if page > 50:
            print("   ⚠️  Достигнут лимит страниц (50)")
            break

    print(f"\n✅ Всего спарсено: {len(all_products)} товаров")

    # Сохраняем
    output_dir = Path("parsed_data/tata-agro")
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
