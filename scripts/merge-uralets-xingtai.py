#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Объединение данных Уралец и Xingtai в одну таблицу
Создаёт объединённые JSON, CSV и SQL файлы
"""
import json
import csv
import sys
import re
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

# Пути к файлам
BASE_DIR = "parsed_data/agrodom/organized"
URALETS_JSON = f"{BASE_DIR}/by-brand/Уралец.json"
XINGTAI_JSON = f"{BASE_DIR}/by-brand/Xingtai.json"

OUTPUT_JSON = f"{BASE_DIR}/by-brand/Уралец-Xingtai.json"
OUTPUT_CSV = f"{BASE_DIR}/csv/by-brand/Уралец-Xingtai.csv"
OUTPUT_SQL = f"{BASE_DIR}/sql/Уралец-Xingtai-parts.sql"

def create_slug(text):
    """Создаёт URL-friendly slug из текста"""
    text = text.lower()

    translit = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    }

    result = ''
    for char in text:
        result += translit.get(char, char)

    result = re.sub(r'[^a-z0-9\-\s]', '', result)
    result = re.sub(r'\s+', '-', result)
    result = re.sub(r'-+', '-', result)
    result = result.strip('-')

    return result[:100]

def extract_price(price_str):
    """Извлекает числовое значение цены из строки"""
    if not price_str:
        return None

    price = re.sub(r'[^\d.,]', '', price_str)
    price = price.replace(',', '.')

    try:
        return float(price)
    except:
        return None

def escape_sql(text):
    """Экранирует одинарные кавычки для SQL"""
    if text is None:
        return 'NULL'
    return f"'{text.replace(chr(39), chr(39)+chr(39))}'"

def generate_sql_inserts(products, brand_name):
    """Генерирует SQL INSERT statements"""
    sql_lines = []

    sql_lines.append(f"-- Импорт данных запчастей: {brand_name}")
    sql_lines.append(f"-- Всего записей: {len(products)}")
    sql_lines.append(f"-- Дата генерации: 2025-11-18\n")

    sql_lines.append("-- Начинаем транзакцию")
    sql_lines.append("BEGIN;\n")

    slugs_seen = set()
    inserted = 0

    for idx, product in enumerate(products, 1):
        name = product.get('name', '').strip()
        if not name:
            continue

        # Создаём уникальный slug
        base_slug = create_slug(name)
        slug = base_slug
        counter = 1
        while slug in slugs_seen:
            slug = f"{base_slug}-{counter}"
            counter += 1
        slugs_seen.add(slug)

        # Извлекаем данные
        price = extract_price(product.get('price', ''))
        sku = product.get('sku', '').strip() or None
        image_url = product.get('image_url', '').strip() or None
        product_url = product.get('link', '').strip() or None

        brand = product.get('brand', brand_name)
        category = product.get('category', 'Прочее')
        subcategory = product.get('subcategory')

        # Формируем SQL INSERT
        values = []
        values.append(escape_sql(name))
        values.append(escape_sql(slug))
        values.append(escape_sql(sku))
        values.append('NULL')  # category_id
        values.append(escape_sql(subcategory))
        values.append(str(price) if price else 'NULL')
        values.append('NULL')  # old_price
        values.append('true')  # in_stock
        values.append("'unknown'")  # stock_status
        values.append(escape_sql(brand))
        values.append('NULL')  # compatible_models
        values.append('NULL')  # part_number
        values.append('NULL')  # description
        values.append('NULL')  # specifications
        values.append(escape_sql(image_url))
        values.append('NULL')  # images_gallery
        values.append(escape_sql(product_url))

        insert_sql = f"INSERT INTO parts (name, slug, sku, category_id, subcategory, price, old_price, in_stock, stock_status, manufacturer, compatible_models, part_number, description, specifications, image_url, images_gallery, product_url) VALUES ({', '.join(values)}); -- {category}"
        sql_lines.append(insert_sql)

        inserted += 1

        if idx % 100 == 0:
            sql_lines.append(f"\n-- Обработано: {idx}/{len(products)}\n")

    sql_lines.append("\n-- Завершаем транзакцию")
    sql_lines.append("COMMIT;\n")

    sql_lines.append(f"-- Успешно импортировано: {inserted}")

    return '\n'.join(sql_lines), inserted

def main():
    print("\n" + "="*70)
    print("ОБЪЕДИНЕНИЕ ДАННЫХ: УРАЛЕЦ + XINGTAI")
    print("="*70 + "\n")

    # Загружаем данные
    print("📂 Загрузка данных...")
    with open(URALETS_JSON, 'r', encoding='utf-8') as f:
        uralets_data = json.load(f)
    print(f"  ✓ Уралец: {len(uralets_data)} товаров")

    with open(XINGTAI_JSON, 'r', encoding='utf-8') as f:
        xingtai_data = json.load(f)
    print(f"  ✓ Xingtai: {len(xingtai_data)} товаров")

    # Объединяем данные
    merged_data = uralets_data + xingtai_data
    total = len(merged_data)
    print(f"\n✅ Объединено: {total} товаров\n")

    # Сортируем по категориям и названию
    merged_data.sort(key=lambda x: (x.get('category', ''), x.get('name', '')))

    # 1. Сохраняем JSON
    print("💾 Сохранение JSON...")
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(merged_data, f, ensure_ascii=False, indent=2)
    file_size = Path(OUTPUT_JSON).stat().st_size / 1024
    print(f"  ✓ {OUTPUT_JSON}")
    print(f"  ✓ Размер: {file_size:.1f} KB\n")

    # 2. Экспортируем CSV
    print("📊 Экспорт в CSV...")
    fieldnames = ['name', 'price', 'brand', 'category', 'subcategory', 'sku', 'image_url', 'link']
    with open(OUTPUT_CSV, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(merged_data)
    file_size = Path(OUTPUT_CSV).stat().st_size / 1024
    print(f"  ✓ {OUTPUT_CSV}")
    print(f"  ✓ Размер: {file_size:.1f} KB\n")

    # 3. Генерируем SQL
    print("🗄️ Генерация SQL...")
    Path(OUTPUT_SQL).parent.mkdir(parents=True, exist_ok=True)
    sql_content, inserted = generate_sql_inserts(merged_data, "Уралец/Xingtai")
    with open(OUTPUT_SQL, 'w', encoding='utf-8') as f:
        f.write(sql_content)
    file_size = Path(OUTPUT_SQL).stat().st_size / 1024
    print(f"  ✓ {OUTPUT_SQL}")
    print(f"  ✓ Размер: {file_size:.1f} KB")
    print(f"  ✓ INSERT statements: {inserted}\n")

    # Статистика по категориям
    print("📊 Статистика по категориям:")
    categories = {}
    for product in merged_data:
        cat = product.get('category', 'Неизвестно')
        categories[cat] = categories.get(cat, 0) + 1

    for cat, count in sorted(categories.items(), key=lambda x: -x[1])[:10]:
        print(f"  • {cat:30s} : {count:3d} товаров")

    print("\n" + "="*70)
    print("✅ ОБЪЕДИНЕНИЕ ЗАВЕРШЕНО!")
    print("="*70)
    print(f"\n📁 Созданные файлы:")
    print(f"  • JSON: {OUTPUT_JSON}")
    print(f"  • CSV:  {OUTPUT_CSV}")
    print(f"  • SQL:  {OUTPUT_SQL}")
    print(f"\n📊 Всего товаров: {total}")
    print(f"  • Уралец:  {len(uralets_data)}")
    print(f"  • Xingtai: {len(xingtai_data)}\n")

if __name__ == "__main__":
    main()
