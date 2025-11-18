#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Экспорт товаров в CSV формат
"""
import json
import csv
from pathlib import Path

# Пути
INPUT_FILE = Path(__file__).parent.parent / "parsed_data" / "agrodom" / "tractors-parts-recursive.json"
OUTPUT_CSV = Path(__file__).parent.parent / "parsed_data" / "agrodom" / "products.csv"
OUTPUT_JSON = Path(__file__).parent.parent / "parsed_data" / "agrodom" / "products-clean.json"

def main():
    print(f"📂 Загрузка данных из {INPUT_FILE}...")
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        products = json.load(f)

    print(f"✅ Загружено {len(products)} товаров")

    # Проверка дубликатов
    links = [p["link"] for p in products]
    unique_links = set(links)
    duplicates = len(links) - len(unique_links)

    if duplicates > 0:
        print(f"⚠️  Найдено {duplicates} дубликатов!")
        # Дедупликация
        seen = set()
        products_clean = []
        for p in products:
            if p["link"] not in seen:
                seen.add(p["link"])
                products_clean.append(p)
        products = products_clean
        print(f"✅ После дедупликации: {len(products)} уникальных товаров")
    else:
        print(f"✅ Дубликатов не найдено!")

    # Экспорт в CSV
    print(f"📝 Экспорт в CSV: {OUTPUT_CSV}...")
    with open(OUTPUT_CSV, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["name", "price", "image_url", "link", "sku"])
        writer.writeheader()
        writer.writerows(products)

    print(f"✅ CSV сохранен: {len(products)} товаров")

    # Экспорт в чистый JSON
    print(f"📝 Экспорт в JSON: {OUTPUT_JSON}...")
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    print(f"✅ JSON сохранен: {len(products)} товаров")

    print(f"\n{'='*60}")
    print(f"🎉 ЭКСПОРТ ЗАВЕРШЕН!")
    print(f"{'='*60}")
    print(f"📊 Всего товаров: {len(products)}")
    print(f"📁 CSV: {OUTPUT_CSV}")
    print(f"📁 JSON: {OUTPUT_JSON}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
