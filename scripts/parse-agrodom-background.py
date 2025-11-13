#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
СТАБИЛЬНЫЙ ФОНОВЫЙ ПАРСЕР для длительной работы
Парсит все категории с подкатегориями, сохраняет прогресс
"""
import json
import os
import sys
import time
import requests
from bs4 import BeautifulSoup

sys.stdout.reconfigure(line_buffering=True)

BASE_URL = "https://xn----7sbabpgpk4bsbesjp1f.xn--p1ai"
OUTPUT_FILE = "parsed_data/agrodom/background-parse-result.json"
PROGRESS_FILE = "parsed_data/agrodom/background-parse-progress.txt"

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

def log(msg):
    timestamp = time.strftime("%H:%M:%S")
    print(f"[{timestamp}] {msg}")
    sys.stdout.flush()

def get_subcategories(url):
    try:
        response = session.get(url, timeout=30)
        soup = BeautifulSoup(response.content, "html.parser")
        subcats = []
        for link in soup.select('.product-categories a, .product-category a'):
            href = link.get('href')
            if href and 'product-category' in href:
                subcats.append(href)
        return list(set(subcats))
    except Exception as e:
        log(f"  Ошибка получения подкатегорий: {e}")
        return []

def get_products_from_page(url):
    try:
        response = session.get(url, timeout=30)
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
    except Exception as e:
        log(f"  Ошибка парсинга страницы: {e}")
        return []

def parse_url_with_pagination(url, max_pages=50):
    all_products = []
    for page in range(1, max_pages + 1):
        page_url = url if page == 1 else f"{url}page/{page}/"
        products = get_products_from_page(page_url)
        if not products:
            break
        all_products.extend(products)
        if page % 10 == 0:
            log(f"    Страница {page}: {len(all_products)} товаров")
        time.sleep(0.5)
    return all_products

def parse_category_with_subcats(cat_slug):
    log(f"Категория: {cat_slug}")
    url = f"{BASE_URL}/product-category/{cat_slug}/"
    
    all_products = []
    visited = set()
    
    # Парсим главную страницу категории
    products = parse_url_with_pagination(url)
    all_products.extend(products)
    log(f"  Главная страница: {len(products)} товаров")
    visited.add(url)
    
    # Получаем подкатегории
    subcats = get_subcategories(url)
    log(f"  Найдено подкатегорий: {len(subcats)}")
    
    for i, subcat_url in enumerate(subcats, 1):
        if subcat_url in visited:
            continue
        visited.add(subcat_url)
        
        log(f"  [{i}/{len(subcats)}] Подкатегория: {subcat_url.split('/')[-2][:30]}")
        sub_products = parse_url_with_pagination(subcat_url, max_pages=30)
        all_products.extend(sub_products)
        log(f"    Товаров: {len(sub_products)}")
        
        time.sleep(1)
    
    return all_products

def main():
    os.makedirs("parsed_data/agrodom", exist_ok=True)
    
    log("="*70)
    log("ФОНОВЫЙ ПАРСИНГ ВСЕХ ЗАПЧАСТЕЙ AGRODOM")
    log("="*70)
    log(f"Категорий: {len(MAIN_CATEGORIES)}")
    log(f"Ожидается несколько часов работы")
    log("="*70)
    
    all_products = []
    seen_names = set()
    
    # Загружаем существующие данные если есть
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
                all_products = json.load(f)
                seen_names = {p["name"].lower().strip() for p in all_products}
            log(f"Загружено из предыдущего запуска: {len(all_products)} товаров")
        except:
            pass
    
    for i, cat_slug in enumerate(MAIN_CATEGORIES, 1):
        log(f"\n{'='*70}")
        log(f"[{i}/{len(MAIN_CATEGORIES)}]")
        
        try:
            products = parse_category_with_subcats(cat_slug)
            
            new_count = 0
            for p in products:
                name_key = p["name"].lower().strip()
                if name_key not in seen_names:
                    seen_names.add(name_key)
                    all_products.append(p)
                    new_count += 1
            
            log(f"Новых уникальных: {new_count}")
            log(f"ВСЕГО УНИКАЛЬНЫХ: {len(all_products)}")
            
            # Сохраняем после каждой категории
            with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                json.dump(all_products, f, ensure_ascii=False, indent=2)
            
            with open(PROGRESS_FILE, "w") as f:
                f.write(f"Обработано {i}/{len(MAIN_CATEGORIES)} категорий\n")
                f.write(f"Всего товаров: {len(all_products)}\n")
            
            log(f"Прогресс сохранён")
            
        except Exception as e:
            log(f"ОШИБКА: {e}")
        
        time.sleep(2)
    
    log("\n" + "="*70)
    log("ПАРСИНГ ЗАВЕРШЁН!")
    log("="*70)
    log(f"Всего уникальных товаров: {len(all_products)}")
    log(f"Сохранено: {OUTPUT_FILE}")
    log("="*70)

if __name__ == "__main__":
    main()
