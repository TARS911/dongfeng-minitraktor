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
OUTPUT_FILE = "parsed_data/agrodom/all-parts-complete.json"

CATEGORIES = [
    {"name": "Zapchasti dlya traktorov", "slug": "запчасти-для-тракторов", "count": 1244},
    {"name": "Zapchasti dlya navesnogo", "slug": "запчасти-для-навесного-оборудования", "count": 772},
    {"name": "Zapchasti dlya dizeley", "slug": "запчасти-для-дизелей", "count": 763},
    {"name": "Standartnye izdeliya", "slug": "стандартные-изделия", "count": 405},
    {"name": "Prochie zapchasti", "slug": "прочие-запчасти", "count": 254},
    {"name": "Gidravlika", "slug": "гидравлика", "count": 138},
    {"name": "Kardannye valy", "slug": "карданные-валы", "count": 129},
    {"name": "Kolyosa shiny", "slug": "колёса-шины-груза", "count": 124},
    {"name": "Filtra", "slug": "фильтра", "count": 77},
    {"name": "Dvigateli", "slug": "двигателя-дизельные", "count": 29},
    {"name": "Startery", "slug": "стартеры-генераторы", "count": 27},
    {"name": "Universalnye", "slug": "универсальные-комплектующие", "count": 24},
    {"name": "Sidenya", "slug": "сиденья-кресла", "count": 14},
    {"name": "ZIP", "slug": "зип", "count": 8},
    {"name": "Ozhidaetsya", "slug": "ожидается", "count": 8},
]

session = requests.Session()
session.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"})

def get_products(url):
    try:
        response = session.get(url, timeout=20)
        soup = BeautifulSoup(response.content, "html.parser")
        products = []
        items = soup.select(".product, .type-product")
        for item in items:
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

def parse_category(cat):
    print(f"\n{cat['name']} (ожидается {cat['count']} товаров)")
    all_products = []
    max_pages = (cat['count'] // 20) + 2
    for page in range(1, max_pages + 1):
        url = f"{BASE_URL}/product-category/{cat['slug']}/" if page == 1 else f"{BASE_URL}/product-category/{cat['slug']}/page/{page}/"
        products = get_products(url)
        if not products:
            break
        all_products.extend(products)
        if page % 5 == 0:
            print(f"  Страница {page}: {len(all_products)} товаров")
        time.sleep(0.4)
    print(f"Завершено: {len(all_products)} товаров")
    return all_products

def main():
    os.makedirs("parsed_data/agrodom", exist_ok=True)
    print("\nПАРСИНГ ВСЕХ ЗАПЧАСТЕЙ AGRODOM")
    print("=" * 70)
    all_products = []
    seen_names = set()
    for i, cat in enumerate(CATEGORIES, 1):
        print(f"\n[{i}/{len(CATEGORIES)}]")
        try:
            products = parse_category(cat)
            new_count = 0
            for p in products:
                name_key = p["name"].lower().strip()
                if name_key not in seen_names:
                    seen_names.add(name_key)
                    all_products.append(p)
                    new_count += 1
            print(f"Новых уникальных: {new_count}")
            with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                json.dump(all_products, f, ensure_ascii=False, indent=2)
            print(f"Сохранено. Всего: {len(all_products)}")
        except Exception as e:
            print(f"Ошибка: {e}")
    print(f"\nВСЕГО УНИКАЛЬНЫХ: {len(all_products)}")
    print(f"Ожидалось: 4017")
    print(f"Сохранено в: {OUTPUT_FILE}\n")

if __name__ == "__main__":
    main()
