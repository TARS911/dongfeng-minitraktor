#!/usr/bin/env python3
"""
Точный парсер для ZIP-AGRO.RU (DongFeng)
Версия 2 - использует правильные селекторы
"""

import requests
from bs4 import BeautifulSoup
import csv
import json
import time
import re
from urllib.parse import urljoin

class ZipAgroParser:
    def __init__(self):
        self.base_url = "https://zip-agro.ru"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'ru-RU,ru;q=0.9',
            'Connection': 'keep-alive'
        })
        self.products = []

    def fetch_page(self, url):
        """Получает HTML страницы"""
        try:
            print(f"📄 Fetching: {url}")
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"❌ Error: {e}")
            return None

    def parse_product_item(self, item):
        """Парсит один товар из <div class="product-item">"""
        try:
            product = {}

            # Название товара (в .product-name a)
            name_link = item.select_one('.product-name a')
            if name_link:
                product['title'] = name_link.get_text(strip=True)
                product['url'] = urljoin(self.base_url, name_link.get('href', ''))
            else:
                return None

            # Картинка
            img = item.select_one('.product-image img')
            if img:
                img_src = img.get('data-src') or img.get('src')
                product['image_url'] = urljoin(self.base_url, img_src) if img_src else ''
            else:
                product['image_url'] = ''

            # Цена (в .price .h6)
            price_elem = item.select_one('.price .h6')
            if price_elem:
                price_text = price_elem.get_text(strip=True)
                # Извлекаем только цифры (убираем "р.")
                price_match = re.search(r'([\d\s,.]+)', price_text)
                if price_match:
                    price = price_match.group(1).replace(' ', '').replace(',', '.')
                    product['price'] = price
                else:
                    product['price'] = ''
            else:
                product['price'] = ''

            # Артикул (в .badge.stiker-upc)
            code_elem = item.select_one('.badge.stiker-upc')
            if code_elem:
                product['article'] = code_elem.get_text(strip=True)
            else:
                product['article'] = ''

            # Наличие (ищем .product-stock или in-stock)
            stock_elem = item.select_one('[class*="stock"]')
            if stock_elem:
                stock_text = stock_elem.get_text(strip=True).lower()
                if 'нет' in stock_text or 'отсутствует' in stock_text:
                    product['stock'] = 'Нет в наличии'
                elif 'заказ' in stock_text:
                    product['stock'] = 'Под заказ'
                else:
                    product['stock'] = 'В наличии'
            else:
                product['stock'] = 'В наличии'

            # Краткое описание (из .product-text, даже если скрыто через d-none)
            desc_elem = item.select_one('.product-text')
            product['description'] = desc_elem.get_text(strip=True) if desc_elem else ''

            # Категория/Бренд
            product['brand'] = 'DongFeng'
            product['category'] = 'Запчасти'

            return product

        except Exception as e:
            print(f"⚠ Error parsing item: {e}")
            return None

    def parse_page(self, url):
        """Парсит одну страницу"""
        html = self.fetch_page(url)
        if not html:
            return []

        soup = BeautifulSoup(html, 'html.parser')

        # Ищем контейнер с товарами: #content .products-container
        container = soup.find(id='content')
        if not container:
            print("⚠ #content not found")
            return []

        # Ищем все .product-item
        items = container.find_all('div', class_='product-item')
        print(f"✓ Found {len(items)} product items")

        products = []
        for i, item in enumerate(items, 1):
            product = self.parse_product_item(item)
            if product and product.get('title'):
                products.append(product)

                if i % 20 == 0:
                    print(f"  Parsed {i}/{len(items)}...")

        print(f"✓ Successfully parsed {len(products)} products from this page")
        return products

    def parse_all_pages(self, start_url, total_pages=5, limit=100):
        """Парсит все страницы"""
        all_products = []

        for page_num in range(1, total_pages + 1):
            url = f"{start_url}?limit={limit}&page={page_num}"
            print(f"\n{'='*70}")
            print(f"PAGE {page_num}/{total_pages}")
            print(f"{'='*70}")

            products = self.parse_page(url)
            all_products.extend(products)

            print(f"📊 Total so far: {len(all_products)} products")

            if page_num < total_pages:
                print("⏳ Waiting 2 seconds...")
                time.sleep(2)

        return all_products

    def save_to_csv(self, products, filename='parsed_data/zip-agro-dongfeng.csv'):
        """Сохраняет в CSV"""
        if not products:
            print("❌ No products to save!")
            return

        import os
        os.makedirs(os.path.dirname(filename), exist_ok=True)

        fieldnames = ['title', 'article', 'price', 'brand', 'category', 'stock',
                     'description', 'url', 'image_url']

        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
            writer.writeheader()
            writer.writerows(products)

        print(f"\n✅ Saved {len(products)} products to {filename}")

        # JSON
        json_file = filename.replace('.csv', '.json')
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        print(f"✅ Saved JSON to {json_file}")

    def show_stats(self, products):
        """Показывает статистику"""
        print(f"\n{'='*70}")
        print(f"📊 СТАТИСТИКА")
        print(f"{'='*70}")
        print(f"Всего товаров: {len(products)}")

        # С артикулом
        with_article = sum(1 for p in products if p.get('article'))
        print(f"С артикулом: {with_article}")

        # С ценой
        with_price = sum(1 for p in products if p.get('price'))
        print(f"С ценой: {with_price}")

        # С картинками
        with_image = sum(1 for p in products if p.get('image_url'))
        print(f"С картинкой: {with_image}")

        print(f"\n{'='*70}")
        print("📦 ПРИМЕРЫ (первые 5):")
        print(f"{'='*70}")

        for i, p in enumerate(products[:5], 1):
            print(f"\n{i}. {p['title']}")
            print(f"   Артикул: {p.get('article', 'Нет')}")
            print(f"   Цена: {p.get('price', 'Нет')} ₽")
            print(f"   URL: {p.get('url', 'Нет')[:80]}")


def main():
    print("=" * 70)
    print("ZIP-AGRO.RU DongFeng Parser v2")
    print("=" * 70)

    parser = ZipAgroParser()

    # Парсим 5 страниц по 100 товаров
    products = parser.parse_all_pages(
        start_url="https://zip-agro.ru/dongfeng",
        total_pages=5,
        limit=100
    )

    # Статистика
    parser.show_stats(products)

    # Сохраняем
    parser.save_to_csv(products)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠ Interrupted")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
