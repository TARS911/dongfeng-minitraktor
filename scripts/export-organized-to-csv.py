#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Экспорт организованных запчастей в CSV по брендам и категориям
"""
import json
import csv
import os
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

INPUT_FILE = "parsed_data/agrodom/organized/all-parts-organized.json"
OUTPUT_DIR = "parsed_data/agrodom/organized/csv"

def export_to_csv(data, filename):
    """Экспортирует данные в CSV"""
    if not data:
        return

    fieldnames = ['name', 'price', 'brand', 'category', 'subcategory', 'sku', 'image_url', 'link']

    with open(filename, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(data)

def main():
    print("\n" + "="*70)
    print("ЭКСПОРТ В CSV ПО БРЕНДАМ И КАТЕГОРИЯМ")
    print("="*70 + "\n")

    # Создаём директории
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(f"{OUTPUT_DIR}/by-brand", exist_ok=True)
    os.makedirs(f"{OUTPUT_DIR}/by-category", exist_ok=True)

    # Загружаем данные
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        all_products = json.load(f)

    print(f"✓ Загружено {len(all_products)} товаров\n")

    # Группируем по брендам
    by_brand = {}
    by_category = {}

    for product in all_products:
        brand = product.get('brand', 'Неизвестно')
        category = product.get('category', 'Неизвестно')

        if brand not in by_brand:
            by_brand[brand] = []
        by_brand[brand].append(product)

        if category not in by_category:
            by_category[category] = []
        by_category[category].append(product)

    # Экспортируем по брендам
    print("📦 Экспорт по брендам...")
    for brand, products in sorted(by_brand.items(), key=lambda x: -len(x[1])):
        filename = f"{OUTPUT_DIR}/by-brand/{brand.replace('/', '-')}.csv"
        export_to_csv(products, filename)
        print(f"  ✓ {brand:20s} : {len(products):4d} товаров → {os.path.basename(filename)}")

    # Экспортируем по категориям
    print(f"\n📂 Экспорт по категориям...")
    for category, products in sorted(by_category.items(), key=lambda x: -len(x[1])):
        filename = f"{OUTPUT_DIR}/by-category/{category.replace('/', '-')}.csv"
        export_to_csv(products, filename)
        print(f"  ✓ {category:30s} : {len(products):4d} товаров → {os.path.basename(filename)}")

    # Экспортируем общий файл
    print(f"\n💾 Экспорт общего файла...")
    export_to_csv(all_products, f"{OUTPUT_DIR}/all-parts-organized.csv")
    print(f"  ✓ Все товары → all-parts-organized.csv")

    print("\n" + "="*70)
    print("✅ ЭКСПОРТ В CSV ЗАВЕРШЁН!")
    print("="*70)
    print(f"\n📁 Результаты в: {OUTPUT_DIR}/")
    print(f"   • По брендам: {len(by_brand)} файлов")
    print(f"   • По категориям: {len(by_category)} файлов")
    print(f"   • Общий файл: 1 файл")
    print()

if __name__ == "__main__":
    main()
