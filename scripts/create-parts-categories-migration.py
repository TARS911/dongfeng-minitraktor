#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Создание SQL миграции для категорий запчастей
Генерирует INSERT для 18 категорий на основе реальных данных
"""
import sys
import json

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

CATALOG_INDEX = "parsed_data/agrodom/organized/catalog-index.json"
OUTPUT_SQL = "backend/database/migrations/001-parts-categories.sql"

def create_slug(text):
    """Создаёт slug из названия категории"""
    translit = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
        ' ': '-'
    }

    text = text.lower()
    result = ''
    for char in text:
        result += translit.get(char, char)

    return result.replace('--', '-').strip('-')

# Описания для категорий
CATEGORY_DESCRIPTIONS = {
    'Гидравлика': 'Гидравлические системы, насосы, распределители, шланги РВД',
    'Двигатель': 'Запчасти для двигателя: поршни, кольца, прокладки, фильтры',
    'Кабина': 'Элементы кабины: стёкла, уплотнители, замки, обшивка',
    'Капот и крылья': 'Кузовные элементы: капот, крылья, облицовка',
    'Карданные валы': 'Карданные валы, крестовины, муфты',
    'Колеса и шины': 'Шины, диски, камеры для минитракторов',
    'Навесное оборудование': 'Навеска, прицепы, плуги, культиваторы, КУН',
    'Передний мост': 'Передняя ось, ступицы, подшипники, поворотные кулаки',
    'Прочее': 'Прочие запчасти и комплектующие',
    'РВД': 'Рукава высокого давления, фитинги, быстросъёмы',
    'Рулевое управление': 'Рулевой механизм, рулевая колонка, наконечники тяг',
    'Сиденья': 'Сиденья для трактора, амортизаторы сидений',
    'Стандартные изделия': 'Метизы, крепёж, болты, гайки, шайбы',
    'Топливная система': 'Топливные насосы, фильтры, форсунки, баки',
    'Тормозная система': 'Тормозные колодки, диски, цилиндры, шланги',
    'Трансмиссия': 'КПП, сцепление, валы, шестерни, подшипники',
    'Фильтры': 'Масляные, воздушные, топливные фильтры',
    'Электрооборудование': 'Генераторы, стартеры, проводка, датчики, фары'
}

def main():
    print("\n" + "="*70)
    print("СОЗДАНИЕ SQL МИГРАЦИИ ДЛЯ КАТЕГОРИЙ ЗАПЧАСТЕЙ")
    print("="*70 + "\n")

    # Загружаем индекс
    print(f"📂 Загрузка {CATALOG_INDEX}...")
    with open(CATALOG_INDEX, 'r', encoding='utf-8') as f:
        catalog = json.load(f)

    categories_data = catalog['categories']
    print(f"✅ Найдено {len(categories_data)} категорий\n")

    # Сортируем категории по количеству товаров
    sorted_categories = sorted(categories_data.items(), key=lambda x: -x[1]['count'])

    # Генерируем SQL
    sql_lines = []
    sql_lines.append("-- Миграция: Создание категорий запчастей")
    sql_lines.append("-- Дата: 2025-11-18")
    sql_lines.append(f"-- Категорий: {len(sorted_categories)}")
    sql_lines.append(f"-- Всего товаров: {catalog['total_products']}\n")

    sql_lines.append("-- Создаём таблицу категорий запчастей (если не существует)")
    sql_lines.append("CREATE TABLE IF NOT EXISTS parts_categories (")
    sql_lines.append("  id SERIAL PRIMARY KEY,")
    sql_lines.append("  name VARCHAR(255) NOT NULL,")
    sql_lines.append("  slug VARCHAR(255) NOT NULL UNIQUE,")
    sql_lines.append("  description TEXT,")
    sql_lines.append("  product_count INTEGER DEFAULT 0,")
    sql_lines.append("  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,")
    sql_lines.append("  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    sql_lines.append(");")
    sql_lines.append("")

    sql_lines.append("-- Очищаем таблицу перед вставкой")
    sql_lines.append("TRUNCATE TABLE parts_categories RESTART IDENTITY CASCADE;")
    sql_lines.append("")

    sql_lines.append("-- Вставляем категории")
    for i, (name, data) in enumerate(sorted_categories, 1):
        slug = create_slug(name)
        description = CATEGORY_DESCRIPTIONS.get(name, f'Запчасти категории {name}')
        count = data['count']

        sql_lines.append(f"INSERT INTO parts_categories (id, name, slug, description, product_count)")
        sql_lines.append(f"VALUES ({i}, '{name}', '{slug}', '{description}', {count});")

    sql_lines.append("")

    sql_lines.append("-- Индексы для оптимизации")
    sql_lines.append("CREATE INDEX IF NOT EXISTS idx_parts_categories_slug ON parts_categories(slug);")
    sql_lines.append("CREATE INDEX IF NOT EXISTS idx_parts_categories_name ON parts_categories(name);")
    sql_lines.append("")

    sql_lines.append("-- Проверка результата")
    sql_lines.append("SELECT id, name, slug, product_count FROM parts_categories ORDER BY product_count DESC;")

    # Сохраняем
    from pathlib import Path
    Path(OUTPUT_SQL).parent.mkdir(parents=True, exist_ok=True)

    sql_content = '\n'.join(sql_lines)

    with open(OUTPUT_SQL, 'w', encoding='utf-8') as f:
        f.write(sql_content)

    print(f"💾 SQL миграция сохранена в {OUTPUT_SQL}\n")

    print("=" * 70)
    print("📊 СТАТИСТИКА КАТЕГОРИЙ (TOP 10)")
    print("=" * 70)
    for i, (name, data) in enumerate(sorted_categories[:10], 1):
        print(f"{i:2d}. {name:30s} : {data['count']:4d} товаров")

    print(f"\n✅ Миграция готова!")
    print(f"📁 Файл: {OUTPUT_SQL}")
    print(f"\n🚀 Для применения в Supabase:")
    print(f"   1. Откройте Supabase Dashboard → SQL Editor")
    print(f"   2. Загрузите файл {OUTPUT_SQL}")
    print(f"   3. Выполните миграцию\n")

if __name__ == "__main__":
    main()
