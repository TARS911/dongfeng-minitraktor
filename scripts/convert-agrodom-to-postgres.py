#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Конвертер данных Agrodom из JSON в PostgreSQL SQL
Преобразует 2836 запчастей в INSERT statements для Supabase
"""
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

# Пути к файлам
INPUT_FILE = "parsed_data/agrodom/products-clean.json"
OUTPUT_FILE = "backend/database/supabase-parts-data.sql"

def create_slug(text):
    """Создаёт URL-friendly slug из текста"""
    # Приводим к нижнему регистру
    text = text.lower()

    # Заменяем русские буквы на транслит
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

    # Убираем всё кроме букв, цифр и дефисов
    result = re.sub(r'[^a-z0-9\-\s]', '', result)
    # Заменяем пробелы на дефисы
    result = re.sub(r'\s+', '-', result)
    # Убираем множественные дефисы
    result = re.sub(r'-+', '-', result)
    # Убираем дефисы в начале и конце
    result = result.strip('-')

    return result[:100]  # Ограничиваем длину

def extract_price(price_str):
    """Извлекает числовое значение цены из строки"""
    if not price_str:
        return None

    # Убираем всё кроме цифр, точек и запятых
    price = re.sub(r'[^\d.,]', '', price_str)
    # Заменяем запятую на точку
    price = price.replace(',', '.')

    try:
        return float(price)
    except:
        return None

def detect_manufacturer(name, url):
    """Определяет производителя из названия или URL"""
    name_lower = name.lower()
    url_lower = url.lower() if url else ''

    manufacturers = {
        'dongfeng': ['dongfeng', 'донгфенг', 'дф-', 'df-'],
        'masteryard': ['masteryard', 'мастерярд'],
        'jinma': ['jinma', 'джинма', 'jm-'],
        'uralets': ['уралец', 'uralets'],
        'xingtai': ['xingtai', 'синтай'],
        'foton': ['foton', 'фотон'],
        'swatt': ['swatt', 'сватт']
    }

    for manufacturer, keywords in manufacturers.items():
        for keyword in keywords:
            if keyword in name_lower or keyword in url_lower:
                return manufacturer.capitalize()

    return None

def detect_category(url):
    """Определяет категорию из URL"""
    if not url:
        return None

    url_decoded = unquote(url).lower()

    categories = {
        'dongfeng-masteryard': 'DongFeng / MasterYard',
        'jinma': 'Jinma',
        'уралец': 'Уралец',
        'гидравлика': 'Гидравлика',
        'трансмиссия': 'Трансмиссия',
        'двигател': 'Двигатель',
        'электро': 'Электрооборудование',
        'навесное-оборудование': 'Навесное оборудование',
        'карданн': 'Карданные валы',
        'фильтр': 'Фильтры',
        'стекл': 'Стекла'
    }

    for keyword, category in categories.items():
        if keyword in url_decoded:
            return category

    return 'Прочее'

def escape_sql(text):
    """Экранирует одинарные кавычки для SQL"""
    if text is None:
        return 'NULL'
    return f"'{text.replace(chr(39), chr(39)+chr(39))}'"

def generate_sql_inserts(products):
    """Генерирует SQL INSERT statements"""
    sql_lines = []

    sql_lines.append("-- Импорт данных запчастей Agrodom")
    sql_lines.append(f"-- Всего записей: {len(products)}")
    sql_lines.append(f"-- Дата генерации: 2025-11-18\n")

    # Временно отключаем триггеры для ускорения импорта
    sql_lines.append("-- Отключаем триггеры для ускорения импорта")
    sql_lines.append("ALTER TABLE parts DISABLE TRIGGER ALL;\n")

    sql_lines.append("-- Начинаем транзакцию")
    sql_lines.append("BEGIN;\n")

    slugs_seen = set()
    skipped = 0
    inserted = 0

    for idx, product in enumerate(products, 1):
        name = product.get('name', '').strip()
        if not name:
            skipped += 1
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

        manufacturer = detect_manufacturer(name, product_url)
        category = detect_category(product_url)

        # Формируем SQL INSERT
        values = []
        values.append(escape_sql(name))  # name
        values.append(escape_sql(slug))  # slug
        values.append(escape_sql(sku))   # sku
        values.append('NULL')  # category_id (заполним позже)
        values.append('NULL')  # subcategory
        values.append(str(price) if price else 'NULL')  # price
        values.append('NULL')  # old_price
        values.append('true')  # in_stock (по умолчанию)
        values.append("'unknown'")  # stock_status
        values.append(escape_sql(manufacturer))  # manufacturer
        values.append('NULL')  # compatible_models
        values.append('NULL')  # part_number
        values.append('NULL')  # description
        values.append('NULL')  # specifications
        values.append(escape_sql(image_url))  # image_url
        values.append('NULL')  # images_gallery
        values.append(escape_sql(product_url))  # product_url

        insert_sql = f"INSERT INTO parts (name, slug, sku, category_id, subcategory, price, old_price, in_stock, stock_status, manufacturer, compatible_models, part_number, description, specifications, image_url, images_gallery, product_url) VALUES ({', '.join(values)});"
        sql_lines.append(insert_sql)

        inserted += 1

        # Добавляем комментарий каждые 100 записей
        if idx % 100 == 0:
            sql_lines.append(f"\n-- Обработано: {idx}/{len(products)}\n")

    sql_lines.append("\n-- Завершаем транзакцию")
    sql_lines.append("COMMIT;\n")

    # Включаем триггеры обратно
    sql_lines.append("-- Включаем триггеры обратно")
    sql_lines.append("ALTER TABLE parts ENABLE TRIGGER ALL;\n")

    sql_lines.append("-- Статистика импорта")
    sql_lines.append(f"-- Успешно импортировано: {inserted}")
    sql_lines.append(f"-- Пропущено (пустые названия): {skipped}")

    # Добавляем проверочные запросы
    sql_lines.append("\n-- Проверка результатов импорта")
    sql_lines.append("SELECT COUNT(*) as total_parts FROM parts;")
    sql_lines.append("SELECT manufacturer, COUNT(*) as count FROM parts WHERE manufacturer IS NOT NULL GROUP BY manufacturer ORDER BY count DESC;")
    sql_lines.append("SELECT COUNT(*) as parts_with_price FROM parts WHERE price IS NOT NULL;")
    sql_lines.append("SELECT COUNT(*) as parts_with_images FROM parts WHERE image_url IS NOT NULL;")

    return '\n'.join(sql_lines), inserted, skipped

def main():
    print("\n" + "="*70)
    print("КОНВЕРТЕР ДАННЫХ AGRODOM → POSTGRESQL")
    print("="*70 + "\n")

    # Проверяем наличие входного файла
    if not Path(INPUT_FILE).exists():
        print(f"❌ Ошибка: Файл {INPUT_FILE} не найден!")
        sys.exit(1)

    # Загружаем JSON
    print(f"📂 Загрузка данных из {INPUT_FILE}...")
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        products = json.load(f)

    print(f"✅ Загружено {len(products)} товаров\n")

    # Генерируем SQL
    print("🔄 Генерация SQL INSERT statements...")
    sql_content, inserted, skipped = generate_sql_inserts(products)

    # Сохраняем SQL файл
    print(f"💾 Сохранение в {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(sql_content)

    file_size = Path(OUTPUT_FILE).stat().st_size / 1024  # KB

    print("\n" + "="*70)
    print("✅ КОНВЕРТАЦИЯ ЗАВЕРШЕНА!")
    print("="*70)
    print(f"📊 Статистика:")
    print(f"   • Всего товаров в JSON: {len(products)}")
    print(f"   • Успешно конвертировано: {inserted}")
    print(f"   • Пропущено: {skipped}")
    print(f"   • Размер SQL файла: {file_size:.1f} KB")
    print(f"\n📄 SQL файл: {OUTPUT_FILE}")
    print("\n🚀 Для импорта в Supabase используйте SQL Editor:")
    print("   1. Откройте Supabase Dashboard → SQL Editor")
    print("   2. Загрузите файл supabase-parts-data.sql")
    print("   3. Выполните миграцию\n")

if __name__ == "__main__":
    main()
