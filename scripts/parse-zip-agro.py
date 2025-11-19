#!/usr/bin/env python3
"""
Парсер для сайта zip-agro.ru (категория DongFeng)
Парсит все страницы с запчастями и сохраняет в CSV
"""

import requests
from bs4 import BeautifulSoup
import csv
import time
import sys
from urllib.parse import urljoin

BASE_URL = "https://zip-agro.ru"
CATEGORY_URL = f"{BASE_URL}/dongfeng"

# Headers для имитации браузера
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
}

def fetch_page(page_num, limit=100):
    """Получает HTML страницы с товарами"""
    url = f"{CATEGORY_URL}?limit={limit}&page={page_num}"
    print(f"Fetching page {page_num}: {url}")

    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"Error fetching page {page_num}: {e}")
        return None

def parse_product(product_elem):
    """Парсит данные одного товара"""
    try:
        # Название товара
        title_elem = product_elem.find('a', class_='product-card__title')
        if not title_elem:
            title_elem = product_elem.find('h3')

        title = title_elem.get_text(strip=True) if title_elem else ""
        product_url = urljoin(BASE_URL, title_elem['href']) if title_elem and title_elem.get('href') else ""

        # Артикул
        article_elem = product_elem.find('div', class_='product-card__article')
        if not article_elem:
            article_elem = product_elem.find(string=lambda text: 'Артикул' in str(text) if text else False)
        article = article_elem.get_text(strip=True).replace('Артикул:', '').strip() if article_elem else ""

        # Цена
        price_elem = product_elem.find('div', class_='product-card__price')
        if not price_elem:
            price_elem = product_elem.find('span', class_='price')
        price = price_elem.get_text(strip=True).replace('₽', '').replace(' ', '').strip() if price_elem else ""

        # Наличие
        stock_elem = product_elem.find('div', class_='product-card__stock')
        if not stock_elem:
            stock_elem = product_elem.find('span', class_='in-stock')
        stock = stock_elem.get_text(strip=True) if stock_elem else "Нет данных"

        # Описание
        desc_elem = product_elem.find('div', class_='product-card__description')
        description = desc_elem.get_text(strip=True) if desc_elem else ""

        # Картинка
        img_elem = product_elem.find('img')
        image_url = urljoin(BASE_URL, img_elem['src']) if img_elem and img_elem.get('src') else ""

        return {
            'title': title,
            'article': article,
            'price': price,
            'stock': stock,
            'description': description,
            'url': product_url,
            'image_url': image_url
        }
    except Exception as e:
        print(f"Error parsing product: {e}")
        return None

def parse_all_pages(total_pages=5, limit=100):
    """Парсит все страницы и возвращает список товаров"""
    all_products = []

    for page_num in range(1, total_pages + 1):
        html = fetch_page(page_num, limit)

        if not html:
            print(f"Failed to fetch page {page_num}, skipping...")
            continue

        soup = BeautifulSoup(html, 'html.parser')

        # Ищем карточки товаров (различные варианты селекторов)
        products = soup.find_all('div', class_='product-card')
        if not products:
            products = soup.find_all('div', class_='product-item')
        if not products:
            products = soup.find_all('article')

        print(f"Found {len(products)} products on page {page_num}")

        for product_elem in products:
            product_data = parse_product(product_elem)
            if product_data and product_data['title']:
                all_products.append(product_data)

        # Задержка между запросами
        if page_num < total_pages:
            time.sleep(2)

    return all_products

def save_to_csv(products, filename='parsed_data/zip-agro-dongfeng.csv'):
    """Сохраняет товары в CSV файл"""
    if not products:
        print("No products to save!")
        return

    # Создаем директорию если не существует
    import os
    os.makedirs(os.path.dirname(filename), exist_ok=True)

    fieldnames = ['title', 'article', 'price', 'stock', 'description', 'url', 'image_url']

    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(products)

    print(f"\n✓ Saved {len(products)} products to {filename}")

def main():
    print("=" * 60)
    print("ZIP-AGRO.RU DongFeng Parser")
    print("=" * 60)

    # Парсим все 5 страниц
    products = parse_all_pages(total_pages=5, limit=100)

    print(f"\n{'=' * 60}")
    print(f"Total products parsed: {len(products)}")
    print(f"{'=' * 60}")

    # Сохраняем в CSV
    save_to_csv(products)

    # Вывод примера первых 3 товаров
    if products:
        print("\nFirst 3 products:")
        for i, product in enumerate(products[:3], 1):
            print(f"\n{i}. {product['title']}")
            print(f"   Артикул: {product['article']}")
            print(f"   Цена: {product['price']}")
            print(f"   Наличие: {product['stock']}")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nПарсинг прерван пользователем")
        sys.exit(0)
    except Exception as e:
        print(f"\nОшибка: {e}")
        sys.exit(1)
