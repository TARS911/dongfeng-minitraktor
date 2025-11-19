#!/usr/bin/env python3
"""
Разделяет запчасти ZIP-AGRO на модели:
- DongFeng 240/244
- DongFeng 354/404
"""

import csv
import json
import re
from collections import defaultdict

def determine_model(title, description):
    """Определяет модель трактора по названию и описанию"""
    text = f"{title} {description}".lower()

    # Паттерны для моделей
    patterns_240_244 = [
        r'\b240\b', r'\b244\b',
        r'240/244', r'244/240',
        r'df-?240', r'df-?244'
    ]

    patterns_354_404 = [
        r'\b354\b', r'\b404\b',
        r'354/404', r'404/354',
        r'df-?354', r'df-?404'
    ]

    # Проверяем 240/244
    for pattern in patterns_240_244:
        if re.search(pattern, text, re.I):
            return '240_244'

    # Проверяем 354/404
    for pattern in patterns_354_404:
        if re.search(pattern, text, re.I):
            return '354_404'

    # Универсальные запчасти (если не указана конкретная модель)
    return 'universal'

def split_csv(input_file, output_prefix='parsed_data/zip-agro'):
    """Разделяет CSV файл по моделям"""

    models_data = {
        '240_244': [],
        '354_404': [],
        'universal': []
    }

    # Читаем исходный CSV
    print(f"📄 Reading {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            model = determine_model(row['title'], row.get('description', ''))
            models_data[model].append(row)

    # Статистика
    print(f"\n{'='*70}")
    print("📊 СТАТИСТИКА РАСПРЕДЕЛЕНИЯ:")
    print(f"{'='*70}")
    print(f"DongFeng 240/244: {len(models_data['240_244'])} товаров")
    print(f"DongFeng 354/404: {len(models_data['354_404'])} товаров")
    print(f"Универсальные:    {len(models_data['universal'])} товаров")
    print(f"{'='*70}")

    # Сохраняем отдельные файлы
    saved_files = []

    for model_key, products in models_data.items():
        if not products:
            continue

        # Сортируем по названию
        products.sort(key=lambda x: x['title'])

        # Имя файла
        if model_key == '240_244':
            filename_csv = f"{output_prefix}-dongfeng-240-244.csv"
            filename_json = f"{output_prefix}-dongfeng-240-244.json"
            model_name = "DongFeng 240/244"
        elif model_key == '354_404':
            filename_csv = f"{output_prefix}-dongfeng-354-404.csv"
            filename_json = f"{output_prefix}-dongfeng-354-404.json"
            model_name = "DongFeng 354/404"
        else:
            filename_csv = f"{output_prefix}-dongfeng-universal.csv"
            filename_json = f"{output_prefix}-dongfeng-universal.json"
            model_name = "Универсальные запчасти"

        # Сохраняем CSV
        with open(filename_csv, 'w', newline='', encoding='utf-8') as f:
            if products:
                writer = csv.DictWriter(f, fieldnames=products[0].keys())
                writer.writeheader()
                writer.writerows(products)

        # Сохраняем JSON
        with open(filename_json, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)

        saved_files.append((model_name, filename_csv, len(products)))
        print(f"✅ {model_name}: {filename_csv} ({len(products)} товаров)")

    # Создаем общий отсортированный файл
    all_products = []
    for products in models_data.values():
        all_products.extend(products)

    all_products.sort(key=lambda x: x['title'])

    sorted_file = f"{output_prefix}-dongfeng-all-sorted.csv"
    with open(sorted_file, 'w', newline='', encoding='utf-8') as f:
        if all_products:
            writer = csv.DictWriter(f, fieldnames=all_products[0].keys())
            writer.writeheader()
            writer.writerows(all_products)

    print(f"\n✅ Отсортированный файл со всеми товарами: {sorted_file}")

    # Примеры из каждой категории
    print(f"\n{'='*70}")
    print("📦 ПРИМЕРЫ ТОВАРОВ ПО МОДЕЛЯМ:")
    print(f"{'='*70}")

    for model_key, products in models_data.items():
        if not products:
            continue

        if model_key == '240_244':
            model_name = "DongFeng 240/244"
        elif model_key == '354_404':
            model_name = "DongFeng 354/404"
        else:
            model_name = "Универсальные"

        print(f"\n{model_name} (первые 3):")
        for i, p in enumerate(products[:3], 1):
            print(f"{i}. {p['title']}")
            print(f"   Артикул: {p.get('article', 'Нет')} | Цена: {p.get('price', 'Нет')} ₽")

    return saved_files

def main():
    print("="*70)
    print("РАЗДЕЛЕНИЕ ЗАПЧАСТЕЙ ZIP-AGRO ПО МОДЕЛЯМ")
    print("="*70)

    input_file = 'parsed_data/zip-agro-dongfeng.csv'

    try:
        split_csv(input_file)
        print(f"\n{'='*70}")
        print("✅ ГОТОВО!")
        print(f"{'='*70}")
    except FileNotFoundError:
        print(f"❌ Файл {input_file} не найден!")
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
