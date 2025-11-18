#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Удаление дубликатов из исходного файла products-clean.json
"""
import json
import sys
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

INPUT_FILE = "parsed_data/agrodom/products-clean.json"
OUTPUT_FILE = "parsed_data/agrodom/products-clean-dedup.json"
BACKUP_FILE = "parsed_data/agrodom/products-clean.json.backup"

def score_product(product):
    """Оценивает полноту информации о товаре"""
    score = 0
    if product.get('price') and product.get('price').strip():
        score += 10
    if product.get('image_url') and product.get('image_url').strip():
        score += 5
    if product.get('sku') and product.get('sku').strip():
        score += 3
    return score

def remove_duplicates(products):
    """Удаляет дубликаты, оставляя наиболее полную запись"""
    by_name = defaultdict(list)

    for idx, product in enumerate(products):
        name = product.get('name', '').strip().lower()
        if name:
            by_name[name].append((idx, product))

    unique_products = []
    removed_count = 0

    for name, items in by_name.items():
        if len(items) == 1:
            unique_products.append(items[0][1])
        else:
            # Выбираем лучший
            items_scored = [(idx, prod, score_product(prod)) for idx, prod in items]
            items_scored.sort(key=lambda x: -x[2])
            unique_products.append(items_scored[0][1])
            removed_count += len(items) - 1

    return unique_products, removed_count

def main():
    print("\n" + "="*70)
    print("ОЧИСТКА ИСХОДНОГО ФАЙЛА ОТ ДУБЛИКАТОВ")
    print("="*70 + "\n")

    # Загружаем
    print(f"📂 Загрузка {INPUT_FILE}...")
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        products = json.load(f)
    print(f"✅ Загружено {len(products)} товаров\n")

    # Удаляем дубликаты
    print("🔄 Удаление дубликатов...")
    unique_products, removed_count = remove_duplicates(products)
    print(f"✅ Удалено {removed_count} дубликатов")
    print(f"✅ Осталось {len(unique_products)} уникальных товаров\n")

    # Создаём бэкап
    print(f"💾 Создание бэкапа {BACKUP_FILE}...")
    with open(BACKUP_FILE, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    print(f"✅ Бэкап создан\n")

    # Сохраняем очищенные данные
    print(f"💾 Сохранение очищенных данных...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(unique_products, f, ensure_ascii=False, indent=2)
    print(f"✅ Сохранено в {OUTPUT_FILE}\n")

    print("=" * 70)
    print("✅ ОЧИСТКА ЗАВЕРШЕНА!")
    print("=" * 70)
    print(f"\n📊 Было: {len(products)}")
    print(f"📊 Стало: {len(unique_products)}")
    print(f"📊 Удалено: {removed_count}")
    print(f"\n⚠️  Для применения изменений замените исходный файл:")
    print(f"   mv {OUTPUT_FILE} {INPUT_FILE}\n")

if __name__ == "__main__":
    main()
