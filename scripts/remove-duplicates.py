#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Удаление дубликатов из организованных данных запчастей
Стратегия: оставляем запись с максимальной информацией (с ценой, изображением и т.д.)
"""
import json
import sys
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

INPUT_FILE = "parsed_data/agrodom/organized/all-parts-organized.json"
OUTPUT_FILE = "parsed_data/agrodom/organized/all-parts-organized-clean.json"
REPORT_FILE = "parsed_data/agrodom/organized/DEDUPLICATION_REPORT.txt"

def score_product(product):
    """Оценивает полноту информации о товаре (больше = лучше)"""
    score = 0

    # Есть цена
    if product.get('price') and product.get('price').strip():
        score += 10

    # Есть изображение
    if product.get('image_url') and product.get('image_url').strip():
        score += 5

    # Есть SKU
    if product.get('sku') and product.get('sku').strip():
        score += 3

    # Есть категория
    if product.get('category') and product.get('category').strip():
        score += 2

    # Есть подкатегория
    if product.get('subcategory') and product.get('subcategory').strip():
        score += 2

    # Есть бренд
    if product.get('brand') and product.get('brand').strip():
        score += 1

    return score

def remove_duplicates(products):
    """Удаляет дубликаты, оставляя наиболее полную запись"""

    # Группируем по нормализованному названию
    by_name = defaultdict(list)

    for idx, product in enumerate(products):
        name = product.get('name', '').strip().lower()
        if name:
            by_name[name].append((idx, product))

    # Выбираем лучшие записи
    unique_products = []
    removed_indices = []
    dedup_report = []

    for name, items in by_name.items():
        if len(items) == 1:
            # Нет дубликатов
            unique_products.append(items[0][1])
        else:
            # Есть дубликаты - выбираем лучший
            # Сортируем по score (больше = лучше)
            items_scored = [(idx, prod, score_product(prod)) for idx, prod in items]
            items_scored.sort(key=lambda x: -x[2])  # По убыванию score

            # Берём лучший
            best_idx, best_product, best_score = items_scored[0]
            unique_products.append(best_product)

            # Остальные - в удалённые
            for idx, prod, score in items_scored[1:]:
                removed_indices.append(idx)

            # Отчёт
            report_entry = {
                'name': name.title(),
                'kept': {
                    'index': best_idx,
                    'score': best_score,
                    'price': best_product.get('price', 'N/A'),
                    'brand': best_product.get('brand', 'N/A'),
                    'category': best_product.get('category', 'N/A')
                },
                'removed': [
                    {
                        'index': idx,
                        'score': score,
                        'price': prod.get('price', 'N/A'),
                        'brand': prod.get('brand', 'N/A'),
                        'category': prod.get('category', 'N/A')
                    }
                    for idx, prod, score in items_scored[1:]
                ]
            }
            dedup_report.append(report_entry)

    return unique_products, removed_indices, dedup_report

def main():
    print("\n" + "="*70)
    print("УДАЛЕНИЕ ДУБЛИКАТОВ ИЗ ДАННЫХ")
    print("="*70 + "\n")

    # Загружаем данные
    print(f"📂 Загрузка данных из {INPUT_FILE}...")
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        products = json.load(f)
    print(f"✅ Загружено {len(products)} товаров\n")

    # Удаляем дубликаты
    print("🔄 Удаление дубликатов...")
    unique_products, removed_indices, dedup_report = remove_duplicates(products)

    removed_count = len(removed_indices)
    print(f"✅ Удалено {removed_count} дубликатов")
    print(f"✅ Осталось {len(unique_products)} уникальных товаров\n")

    # Сохраняем очищенные данные
    print(f"💾 Сохранение в {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(unique_products, f, ensure_ascii=False, indent=2)
    print(f"✅ Сохранено\n")

    # Создаём отчёт
    print(f"📄 Создание отчёта в {REPORT_FILE}...")
    with open(REPORT_FILE, 'w', encoding='utf-8') as f:
        f.write("=" * 70 + "\n")
        f.write("ОТЧЁТ ОБ УДАЛЕНИИ ДУБЛИКАТОВ\n")
        f.write("=" * 70 + "\n\n")

        f.write(f"Исходное количество: {len(products)}\n")
        f.write(f"Удалено дубликатов: {removed_count}\n")
        f.write(f"Осталось уникальных: {len(unique_products)}\n\n")

        f.write("=" * 70 + "\n")
        f.write("ДЕТАЛИ УДАЛЁННЫХ ДУБЛИКАТОВ\n")
        f.write("=" * 70 + "\n\n")

        for i, entry in enumerate(dedup_report, 1):
            f.write(f"{i}. {entry['name']}\n")
            f.write(f"   ОСТАВЛЕНО:\n")
            f.write(f"      • Index: #{entry['kept']['index']}\n")
            f.write(f"      • Score: {entry['kept']['score']}\n")
            f.write(f"      • Price: {entry['kept']['price']}\n")
            f.write(f"      • Brand: {entry['kept']['brand']}\n")
            f.write(f"      • Category: {entry['kept']['category']}\n")

            f.write(f"   УДАЛЕНО ({len(entry['removed'])}):\n")
            for removed in entry['removed']:
                f.write(f"      • Index: #{removed['index']} | Score: {removed['score']} | "
                       f"Price: {removed['price']} | Brand: {removed['brand']}\n")
            f.write("\n")

    print(f"✅ Отчёт сохранён\n")

    # Итоговая статистика
    print("=" * 70)
    print("📊 СТАТИСТИКА ОЧИСТКИ")
    print("=" * 70)
    print(f"\n• Исходных товаров: {len(products)}")
    print(f"• Удалено дубликатов: {removed_count}")
    print(f"• Осталось уникальных: {len(unique_products)}")
    print(f"• Процент уникальных: {len(unique_products) / len(products) * 100:.2f}%")

    print("\n📁 Созданные файлы:")
    print(f"  • {OUTPUT_FILE}")
    print(f"  • {REPORT_FILE}")

    print("\n" + "=" * 70 + "\n")

if __name__ == "__main__":
    main()
