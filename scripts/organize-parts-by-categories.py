#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Организация запчастей по брендам и категориям
Создание структурированного каталога
"""
import json
import os
from collections import defaultdict
from urllib.parse import unquote
import sys
import datetime

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

INPUT_FILE = "parsed_data/agrodom/products-clean.json"
OUTPUT_DIR = "parsed_data/agrodom/organized"

# Импортируем функции из analyze-parts-categories.py
def extract_brand(name, url):
    """Извлекает бренд из названия или URL"""
    name_lower = name.lower()
    url_lower = unquote(url).lower() if url else ''

    brands = {
        'DongFeng': ['dongfeng', 'донгфенг', 'дф-', 'df-'],
        'MasterYard': ['masteryard', 'мастерярд'],
        'Jinma': ['jinma', 'джинма', 'jm-'],
        'Уралец': ['уралец', 'uralets'],
        'Xingtai': ['xingtai', 'синтай'],
        'Foton': ['foton', 'фотон'],
        'Swatt': ['swatt', 'сватт'],
        'Shifeng': ['shifeng', 'шифенг'],
        'Mahindra': ['mahindra', 'махиндра'],
        'YTO': ['yto'],
        'Scout': ['scout', 'скаут'],
    }

    for brand, keywords in brands.items():
        for keyword in keywords:
            if keyword in name_lower or keyword in url_lower:
                return brand

    # Проверяем на универсальные запчасти
    if 'универсальн' in name_lower or 'стандартн' in name_lower:
        return 'Универсальные'

    return 'Универсальные'  # Все остальные считаем универсальными

def extract_category(url):
    """Извлекает категорию из URL"""
    if not url:
        return 'Не определена'

    url_decoded = unquote(url).lower()

    categories = {
        'Гидравлика': ['гидравлика', 'гидро'],
        'Трансмиссия': ['трансмисси', 'коробка-передач', 'сцепление', 'дифференциал'],
        'Двигатель': ['двигател', 'дизел'],
        'Электрооборудование': ['электро', 'стартер', 'генератор'],
        'Навесное оборудование': ['навесное-оборудование', 'плуг', 'культиватор', 'косилк', 'борон', 'картофелекопалк', 'почвофрез', 'грабли', 'экскаватор', 'щетк', 'прицеп', 'пресс'],
        'Передний мост': ['передний-мост'],
        'Рулевое управление': ['рулев'],
        'Тормозная система': ['тормоз'],
        'Карданные валы': ['карданн'],
        'Колеса и шины': ['колёса', 'колеса', 'шины'],
        'Фильтры': ['фильтр'],
        'Кабина': ['кабин', 'стекл'],
        'Топливная система': ['топливн'],
        'Капот и крылья': ['капот', 'крыль'],
        'Стандартные изделия': ['стандартные-изделия', 'сальник', 'подшипник', 'палец', 'кольц', 'метиз', 'ремн'],
        'Сиденья': ['сиденья', 'кресла'],
        'РВД': ['рвд']
    }

    for category, keywords in categories.items():
        for keyword in keywords:
            if keyword in url_decoded:
                return category

    return 'Прочее'

def extract_subcategory(url, name):
    """Извлекает подкатегорию"""
    if not url:
        return None

    url_decoded = unquote(url).lower()
    name_lower = name.lower()

    subcategories = {
        # Гидравлика
        'Гидрораспределители': ['гидрораспределител'],
        'Гидроцилиндры': ['гидроцилиндр'],
        'Гидронасосы': ['гидронасос', 'насос'],
        'Гидробаки': ['гидробак'],

        # Трансмиссия
        'Сцепление': ['сцепление'],
        'Коробка передач': ['коробка-передач'],
        'Дифференциал': ['дифференциал'],
        'Раздаточный вал': ['раздаточн'],

        # Двигатель
        'Дизельные двигатели': ['дизел'],

        # Навесное
        'Плуги': ['плуг'],
        'Почвофрезы': ['почвофрез'],
        'Косилки': ['косилк'],
        'Культиваторы': ['культиватор'],
        'Бороны': ['борон'],
        'Картофелекопалки': ['картофелекопалк'],
        'Грабли': ['грабли'],
        'Прессподборщики': ['пресс'],

        # Карданы
        'Карданные валы': ['карданн-вал'],
        'Крестовины': ['крестовин'],
        'Муфты': ['муфт'],

        # Стандартные изделия
        'Подшипники': ['подшипник'],
        'Сальники': ['сальник'],
        'Кольца': ['кольц'],
        'Метизы': ['метиз', 'болт', 'гайк'],
    }

    for subcat, keywords in subcategories.items():
        for keyword in keywords:
            if keyword in url_decoded or keyword in name_lower:
                return subcat

    return None

def main():
    print("\n" + "="*70)
    print("ОРГАНИЗАЦИЯ ЗАПЧАСТЕЙ ПО БРЕНДАМ И КАТЕГОРИЯМ")
    print("="*70 + "\n")

    # Создаём выходную директорию
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(f"{OUTPUT_DIR}/by-brand", exist_ok=True)
    os.makedirs(f"{OUTPUT_DIR}/by-category", exist_ok=True)
    os.makedirs(f"{OUTPUT_DIR}/by-brand-category", exist_ok=True)

    # Загружаем данные
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        products = json.load(f)

    print(f"✓ Загружено {len(products)} товаров\n")

    # Структуры для организации
    by_brand = defaultdict(list)
    by_category = defaultdict(list)
    by_brand_category = defaultdict(lambda: defaultdict(list))
    all_organized = []

    # Обогащаем данные и сортируем
    for product in products:
        name = product.get('name', '')
        url = product.get('link', '')

        brand = extract_brand(name, url)
        category = extract_category(url)
        subcategory = extract_subcategory(url, name)

        # Добавляем метаданные
        enriched_product = {
            **product,
            'brand': brand,
            'category': category,
            'subcategory': subcategory
        }

        by_brand[brand].append(enriched_product)
        by_category[category].append(enriched_product)
        by_brand_category[brand][category].append(enriched_product)
        all_organized.append(enriched_product)

    print("📦 Сортировка по брендам...")
    for brand, items in sorted(by_brand.items(), key=lambda x: -len(x[1])):
        # Сортируем внутри бренда по категориям и названию
        items_sorted = sorted(items, key=lambda x: (x['category'], x['name']))

        filename = f"{OUTPUT_DIR}/by-brand/{brand.replace('/', '-')}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(items_sorted, f, ensure_ascii=False, indent=2)

        print(f"  ✓ {brand:20s} : {len(items):4d} товаров → {os.path.basename(filename)}")

    print(f"\n📂 Сортировка по категориям...")
    for category, items in sorted(by_category.items(), key=lambda x: -len(x[1])):
        # Сортируем внутри категории по бренду и названию
        items_sorted = sorted(items, key=lambda x: (x['brand'], x['name']))

        filename = f"{OUTPUT_DIR}/by-category/{category.replace('/', '-')}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(items_sorted, f, ensure_ascii=False, indent=2)

        print(f"  ✓ {category:30s} : {len(items):4d} товаров → {os.path.basename(filename)}")

    # Создаём сводный файл со всеми обогащёнными данными
    print(f"\n💾 Создание сводных файлов...")

    # Сортируем все товары: бренд → категория → название
    all_sorted = sorted(all_organized, key=lambda x: (x['brand'], x['category'], x['name']))

    with open(f"{OUTPUT_DIR}/all-parts-organized.json", 'w', encoding='utf-8') as f:
        json.dump(all_sorted, f, ensure_ascii=False, indent=2)
    print(f"  ✓ Все товары с метаданными → all-parts-organized.json")

    # Создаём индекс категорий
    catalog_index = {
        'total_products': len(products),
        'brands': {},
        'categories': {},
        'structure': {}
    }

    for brand, items in sorted(by_brand.items(), key=lambda x: x[0]):
        catalog_index['brands'][brand] = {
            'count': len(items),
            'file': f"by-brand/{brand.replace('/', '-')}.json"
        }

    for category, items in sorted(by_category.items(), key=lambda x: x[0]):
        catalog_index['categories'][category] = {
            'count': len(items),
            'file': f"by-category/{category.replace('/', '-')}.json"
        }

    # Структура: бренд → категории
    for brand in sorted(by_brand_category.keys()):
        catalog_index['structure'][brand] = {}
        for category, items in sorted(by_brand_category[brand].items()):
            catalog_index['structure'][brand][category] = len(items)

    with open(f"{OUTPUT_DIR}/catalog-index.json", 'w', encoding='utf-8') as f:
        json.dump(catalog_index, f, ensure_ascii=False, indent=2)
    print(f"  ✓ Индекс каталога → catalog-index.json")

    # Создаём README
    readme_content = f"""# Организованный каталог запчастей Agrodom

## Статистика

- **Всего товаров:** {len(products)}
- **Брендов:** {len(by_brand)}
- **Категорий:** {len(by_category)}

## Структура файлов

### По брендам (`by-brand/`)
"""

    for brand, items in sorted(by_brand.items(), key=lambda x: -len(x[1])):
        readme_content += f"- `{brand.replace('/', '-')}.json` - {len(items)} товаров\n"

    readme_content += "\n### По категориям (`by-category/`)\n"

    for category, items in sorted(by_category.items(), key=lambda x: -len(x[1])):
        readme_content += f"- `{category.replace('/', '-')}.json` - {len(items)} товаров\n"

    readme_content += f"""
### Сводные файлы

- `all-parts-organized.json` - все товары с метаданными (бренд, категория, подкатегория)
- `catalog-index.json` - индекс каталога со статистикой

## Использование

Каждый JSON файл содержит массив товаров с полями:
- `name` - название
- `price` - цена
- `image_url` - изображение
- `link` - ссылка на источник
- `sku` - артикул
- **`brand`** - бренд/производитель
- **`category`** - категория
- **`subcategory`** - подкатегория (если определена)

Дата создания: """ + datetime.datetime.now().strftime('%Y-%m-%d %H:%M') + """
"""

    with open(f"{OUTPUT_DIR}/README.md", 'w', encoding='utf-8') as f:
        f.write(readme_content)
    print(f"  ✓ README с описанием → README.md")

    print("\n" + "="*70)
    print("✅ ОРГАНИЗАЦИЯ ЗАВЕРШЕНА!")
    print("="*70)
    print(f"\n📁 Результаты в: {OUTPUT_DIR}/")
    print(f"   • По брендам: {len(by_brand)} файлов")
    print(f"   • По категориям: {len(by_category)} файлов")
    print(f"   • Сводные файлы: 3 файла")
    print()

if __name__ == "__main__":
    import datetime
    main()
