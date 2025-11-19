#!/usr/bin/env python3
"""
Универсальный парсер для e-commerce сайтов
Поддерживает множество стратегий извлечения данных
"""

import requests
from bs4 import BeautifulSoup
import csv
import json
import time
import sys
import re
from urllib.parse import urljoin, urlparse
from typing import List, Dict, Optional

class UniversalParser:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive'
        })
        self.products = []

    def fetch_page(self, url: str) -> Optional[str]:
        """Получает HTML страницы с повторными попытками"""
        for attempt in range(3):
            try:
                print(f"Fetching: {url} (attempt {attempt + 1}/3)")
                response = self.session.get(url, timeout=30)
                response.raise_for_status()
                return response.text
            except Exception as e:
                print(f"Error: {e}")
                if attempt < 2:
                    time.sleep(5)
        return None

    def find_product_containers(self, soup: BeautifulSoup) -> List:
        """Находит контейнеры с товарами, используя множество стратегий"""
        strategies = [
            # Стратегия 1: Поиск по классам product
            lambda: soup.find_all(['div', 'article', 'li'], class_=re.compile(r'product(?!-card__)', re.I)),

            # Стратегия 2: Поиск по data-атрибутам
            lambda: soup.find_all(attrs={'data-product-id': True}),
            lambda: soup.find_all(attrs={'data-id': True}),

            # Стратегия 3: Поиск itemtype для Schema.org
            lambda: soup.find_all(attrs={'itemtype': re.compile(r'Product', re.I)}),

            # Стратегия 4: Поиск по структуре (родитель с несколькими товарами)
            lambda: soup.find_all(['div', 'ul'], class_=re.compile(r'catalog|products|items|grid|list', re.I)),

            # Стратегия 5: Поиск article тегов
            lambda: soup.find_all('article'),

            # Стратегия 6: Поиск по ссылкам на товары
            lambda: [a.parent for a in soup.find_all('a', href=re.compile(r'/product|/item|/p/', re.I))],
        ]

        for i, strategy in enumerate(strategies):
            try:
                containers = strategy()
                if containers:
                    print(f"Strategy {i+1} found {len(containers)} containers")
                    # Проверяем, что нашли не весь контейнер каталога, а именно товары
                    if 2 < len(containers) < 300:
                        return containers
            except Exception as e:
                print(f"Strategy {i+1} failed: {e}")
                continue

        return []

    def extract_text(self, elem, selectors: List) -> str:
        """Извлекает текст из элемента, перебирая селекторы"""
        if not elem:
            return ""

        for selector in selectors:
            try:
                if isinstance(selector, str):
                    # CSS селектор
                    found = elem.select_one(selector)
                    if found:
                        return found.get_text(strip=True)
                elif callable(selector):
                    # Функция-селектор
                    result = selector(elem)
                    if result:
                        return result if isinstance(result, str) else result.get_text(strip=True)
            except:
                continue

        return ""

    def extract_price(self, elem) -> str:
        """Извлекает цену из элемента"""
        selectors = [
            '[itemprop="price"]',
            '.price',
            '[class*="price"]',
            '[data-price]',
            lambda e: e.find(string=re.compile(r'\d+\s*₽|\d+\s*руб', re.I)),
        ]

        price_text = self.extract_text(elem, selectors)

        # Также проверяем data-price атрибут
        if not price_text:
            price_elem = elem.find(attrs={'data-price': True})
            if price_elem:
                price_text = price_elem.get('data-price', '')

        # Очищаем цену
        if price_text:
            price_text = re.sub(r'[^\d.,]', '', price_text)
            price_text = price_text.replace(',', '.')

        return price_text

    def extract_title(self, elem) -> str:
        """Извлекает название товара"""
        selectors = [
            '[itemprop="name"]',
            'h1', 'h2', 'h3', 'h4',
            '.title', '[class*="title"]',
            '.name', '[class*="name"]',
            'a[href*="/product"]',
            'a[href*="/item"]',
        ]
        return self.extract_text(elem, selectors)

    def extract_article(self, elem) -> str:
        """Извлекает артикул"""
        selectors = [
            '[itemprop="sku"]',
            '.article', '.sku', '.code',
            '[class*="article"]', '[class*="sku"]',
            lambda e: e.find(string=re.compile(r'артикул|sku|код', re.I)),
        ]

        article = self.extract_text(elem, selectors)

        # Очищаем от лишних слов
        if article:
            article = re.sub(r'артикул:?\s*|sku:?\s*|код:?\s*', '', article, flags=re.I)

        return article.strip()

    def extract_image(self, elem) -> str:
        """Извлекает URL картинки"""
        img = elem.find('img')
        if img:
            # Проверяем разные атрибуты
            for attr in ['data-src', 'src', 'data-lazy-src']:
                url = img.get(attr)
                if url:
                    return urljoin(self.base_url, url)
        return ""

    def extract_url(self, elem) -> str:
        """Извлекает URL товара"""
        link = elem.find('a', href=True)
        if link:
            return urljoin(self.base_url, link['href'])
        return ""

    def parse_product(self, container) -> Optional[Dict]:
        """Парсит один товар со всеми данными"""
        try:
            product = {
                'title': self.extract_title(container),
                'article': self.extract_article(container),
                'price': self.extract_price(container),
                'url': self.extract_url(container),
                'image_url': self.extract_image(container),
                'stock': 'В наличии',  # По умолчанию
                'description': ''
            }

            # Проверяем наличие
            stock_text = container.get_text()
            if 'нет в наличии' in stock_text.lower() or 'под заказ' in stock_text.lower():
                product['stock'] = 'Под заказ'

            # Фильтруем пустые товары
            if not product['title'] or len(product['title']) < 3:
                return None

            return product

        except Exception as e:
            print(f"Error parsing product: {e}")
            return None

    def parse_page(self, url: str) -> List[Dict]:
        """Парсит одну страницу каталога"""
        html = self.fetch_page(url)
        if not html:
            return []

        soup = BeautifulSoup(html, 'html.parser')

        # Сохраняем HTML для отладки
        with open('/tmp/zip-agro-debug.html', 'w', encoding='utf-8') as f:
            f.write(soup.prettify()[:50000])  # Первые 50KB для анализа

        containers = self.find_product_containers(soup)
        products = []

        print(f"Processing {len(containers)} product containers...")

        for container in containers:
            product = self.parse_product(container)
            if product:
                products.append(product)
                if len(products) % 10 == 0:
                    print(f"Parsed {len(products)} products...")

        return products

    def parse_catalog(self, start_url: str, total_pages: int = 5, limit: int = 100) -> List[Dict]:
        """Парсит все страницы каталога"""
        all_products = []

        for page_num in range(1, total_pages + 1):
            url = f"{start_url}?limit={limit}&page={page_num}"
            products = self.parse_page(url)

            print(f"Page {page_num}: found {len(products)} products")
            all_products.extend(products)

            if page_num < total_pages:
                time.sleep(2)  # Задержка между страницами

        return all_products

    def save_to_csv(self, filename: str = 'parsed_data/zip-agro-dongfeng.csv'):
        """Сохраняет товары в CSV"""
        if not self.products:
            print("No products to save!")
            return

        import os
        os.makedirs(os.path.dirname(filename), exist_ok=True)

        with open(filename, 'w', newline='', encoding='utf-8') as f:
            if self.products:
                writer = csv.DictWriter(f, fieldnames=self.products[0].keys())
                writer.writeheader()
                writer.writerows(self.products)

        print(f"\n✓ Saved {len(self.products)} products to {filename}")

        # Также сохраняем в JSON для удобства
        json_file = filename.replace('.csv', '.json')
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(self.products, f, ensure_ascii=False, indent=2)
        print(f"✓ Saved JSON to {json_file}")


def main():
    print("="  * 70)
    print("УНИВЕРСАЛЬНЫЙ ПАРСЕР ZIP-AGRO.RU (DongFeng)")
    print("=" * 70)

    parser = UniversalParser("https://zip-agro.ru")

    # Парсим все 5 страниц
    products = parser.parse_catalog(
        start_url="https://zip-agro.ru/dongfeng",
        total_pages=5,
        limit=100
    )

    parser.products = products

    print(f"\n{'=' * 70}")
    print(f"ВСЕГО СПАРСЕНО: {len(products)} товаров")
    print(f"{'=' * 70}")

    # Сохраняем
    parser.save_to_csv()

    # Показываем примеры
    if products:
        print("\n📦 Примеры товаров:")
        for i, p in enumerate(products[:5], 1):
            print(f"\n{i}. {p['title']}")
            print(f"   Артикул: {p['article']}")
            print(f"   Цена: {p['price']} ₽")
            print(f"   URL: {p['url']}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠ Парсинг прерван")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
