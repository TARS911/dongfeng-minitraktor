#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import os
import sys
import time
import requests
from bs4 import BeautifulSoup

sys.stdout.reconfigure(line_buffering=True)

BASE_URL = "https://xn----7sbabpgpk4bsbesjp1f.xn--p1ai"
OUTPUT_FILE = "parsed_data/agrodom/all-parts-recursive.json"

MAIN_CATEGORIES = [
    "запчасти-для-тракторов",
    "запчасти-для-навесного-оборудования",
    "запчасти-для-дизелей",
    "стандартные-изделия",
    "прочие-запчасти",
    "гидравлика",
    "карданные-валы",
    "колёса-шины-груза",
    "фильтра",
    "двигателя-дизельные",
    "стартеры-генераторы",
    "универсальные-комплектующие",
    "сиденья-кресла",
    "зип",
    "ожидается",
]

session = requests.Session()
session.headers.update({"User-Agent": "Mozilla/5.0"})
visited_urls = set()

def get_subcategories(url):
    try:
        response = session.get(url, timeout=20)
        soup = BeautifulSoup(response.content, "html.parser")
        subcats = []
        for link in soup.select('.product-categories a, .product-category a'):
            href = link.get('href')
            if href and 'product-category' in href and href not in visited_urls:
                subcats.append(href)
        return subcats
    except:
        return []

def get_products_from_page(url):
    try:
        response = session.get(url, timeout=20)
        soup = BeautifulSoup(response.content, "html.parser")
        products = []
        for item in soup.select(".product, .type-product"):
            name_elem = item.select_one("h2, .product-title, .woocommerce-loop-product__title")
            if not name_elem:
                continue
            name = name_elem.get_text(strip=True)
            if "(" in name and ")" in name and name[-1] == ")":
                continue
            link = item.select_one("a")
            price = item.select_one(".price .amount, .woocommerce-Price-amount")
            image = item.select_one("img")
            if name and link:
                products.append({
                    "name": name,
                    "price": price.get_text(strip=True) if price else "",
                    "image_url": image.get("src", "") if image else "",
                    "link": link.get("href", ""),
                })
        return products
    except:
        return []

def parse_category_recursive(url, depth=0):
    if url in visited_urls or depth > 2:
        return []
    visited_urls.add(url)
    indent = "  " * depth
    print(f"{indent}Парсинг: {url.split('/')[-2]}")
    
    all_products = []
    
    # Парсим товары с текущей страницы и пагинацией
    for page in range(1, 100):
        page_url = url if page == 1 else f"{url}page/{page}/"
        products = get_products_from_page(page_url)
        if not products:
            break
        all_products.extend(products)
        time.sleep(0.3)
    
    if all_products:
        print(f"{indent}  Товаров: {len(all_products)}")
    
    # Ищем подкатегории
    subcats = get_subcategories(url)
    if subcats:
        print(f"{indent}  Подкатегорий: {len(subcats)}")
        for subcat_url in subcats:
            sub_products = parse_category_recursive(subcat_url, depth + 1)
            all_products.extend(sub_products)
            time.sleep(0.3)
    
    return all_products

def main():
    os.makedirs("parsed_data/agrodom", exist_ok=True)
    print("\nРЕКУРСИВНЫЙ ПАРСИНГ ВСЕХ ЗАПЧАСТЕЙ")
    print("=" * 70)
    
    all_products = []
    seen_names = set()
    
    for i, cat_slug in enumerate(MAIN_CATEGORIES, 1):
        print(f"\n[{i}/{len(MAIN_CATEGORIES)}] {cat_slug}")
        url = f"{BASE_URL}/product-category/{cat_slug}/"
        
        try:
            products = parse_category_recursive(url)
            new_count = 0
            for p in products:
                name_key = p["name"].lower().strip()
                if name_key not in seen_names:
                    seen_names.add(name_key)
                    all_products.append(p)
                    new_count += 1
            
            print(f"  Новых: {new_count}, Всего: {len(all_products)}")
            
            with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                json.dump(all_products, f, ensure_ascii=False, indent=2)
            
            if i % 3 == 0:
                print(f"💾 Прогресс сохранён")
        except Exception as e:
            print(f"  Ошибка: {e}")
    
    print(f"\n{'='*70}")
    print(f"ЗАВЕРШЕНО: {len(all_products)} уникальных товаров")
    print(f"Сохранено: {OUTPUT_FILE}")
    print(f"{'='*70}\n")

if __name__ == "__main__":
    main()
