#!/usr/bin/env python3
"""
Анализ спарсенных данных: подсчет товаров, поиск дубликатов, проверка качества
"""

import csv
from pathlib import Path
from collections import defaultdict, Counter

def analyze_data():
    """Анализирует все CSV файлы в parsed_data/"""

    data_dir = Path("parsed_data")
    csv_files = sorted(data_dir.glob("*.csv"))

    print("\n" + "="*80)
    print("📊 АНАЛИЗ СПАРСЕННЫХ ДАННЫХ")
    print("="*80 + "\n")

    # Статистика
    total_products = 0
    products_by_source = defaultdict(int)
    products_by_file = {}

    # Для поиска дубликатов
    all_articles = []
    all_products = []
    products_without_article = []
    categories = set()

    # Чтение всех файлов
    print("📁 Обработка файлов:\n")

    for csv_file in csv_files:
        try:
            with open(csv_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                rows = list(reader)

                file_count = len(rows)
                products_by_file[csv_file.name] = file_count
                total_products += file_count

                # Определяем источник (tata или zip-agro)
                if 'tata' in csv_file.name:
                    source = 'TATA-AGRO-MOTO'
                else:
                    source = 'ZIP-AGRO'

                products_by_source[source] += file_count

                # Собираем данные для анализа
                for row in rows:
                    article = row.get('article', '').strip()
                    name = row.get('name', '').strip()
                    category = row.get('category', '').strip()

                    all_products.append({
                        'name': name,
                        'article': article,
                        'category': category,
                        'file': csv_file.name
                    })

                    if article:
                        all_articles.append(article)
                    else:
                        products_without_article.append({
                            'name': name,
                            'file': csv_file.name
                        })

                    if category:
                        categories.add(category)

                print(f"   ✓ {csv_file.name:<50} {file_count:>6} товаров")

        except Exception as e:
            print(f"   ✗ {csv_file.name}: Ошибка - {e}")

    print("\n" + "="*80)
    print("📈 ОБЩАЯ СТАТИСТИКА")
    print("="*80 + "\n")

    print(f"Всего файлов обработано: {len(csv_files)}")
    print(f"Всего товаров: {total_products}")
    print(f"Уникальных категорий: {len(categories)}\n")

    print("По источникам:")
    for source, count in sorted(products_by_source.items()):
        print(f"   {source:<25} {count:>6} товаров")

    print("\n" + "="*80)
    print("🔍 ПОИСК ДУБЛИКАТОВ ПО АРТИКУЛАМ")
    print("="*80 + "\n")

    # Подсчет дубликатов
    article_counts = Counter(all_articles)
    duplicates = {art: count for art, count in article_counts.items() if count > 1}

    if duplicates:
        print(f"Найдено {len(duplicates)} артикулов-дубликатов:")
        print(f"Общее количество дублирующихся записей: {sum(duplicates.values())}\n")

        # Показываем топ-10 самых частых дубликатов
        top_duplicates = sorted(duplicates.items(), key=lambda x: x[1], reverse=True)[:10]
        print("Топ-10 самых частых дубликатов:\n")
        for article, count in top_duplicates:
            print(f"   Артикул: {article:<20} встречается {count} раз")
            # Показываем в каких файлах встречается
            files = [p['file'] for p in all_products if p['article'] == article]
            unique_files = set(files)
            if len(unique_files) > 1:
                print(f"      └─ В файлах: {', '.join(sorted(unique_files)[:3])}")
    else:
        print("✅ Дубликатов по артикулам не найдено!")

    print("\n" + "="*80)
    print("⚠️  ТОВАРЫ БЕЗ АРТИКУЛОВ")
    print("="*80 + "\n")

    if products_without_article:
        print(f"Найдено {len(products_without_article)} товаров без артикулов:\n")

        # Группируем по файлам
        by_file = defaultdict(list)
        for p in products_without_article:
            by_file[p['file']].append(p['name'])

        for file, names in sorted(by_file.items()):
            print(f"   {file}: {len(names)} товаров")
            # Показываем первые 3 примера
            for name in names[:3]:
                print(f"      - {name}")
            if len(names) > 3:
                print(f"      ... и еще {len(names) - 3}")
    else:
        print("✅ Все товары имеют артикулы!")

    print("\n" + "="*80)
    print("📂 КАТЕГОРИИ")
    print("="*80 + "\n")

    print(f"Всего уникальных категорий: {len(categories)}\n")
    for i, cat in enumerate(sorted(categories), 1):
        # Подсчитываем товары в категории
        cat_count = sum(1 for p in all_products if p['category'] == cat)
        print(f"{i:2}. {cat:<60} ({cat_count} товаров)")

    print("\n" + "="*80)
    print("💾 СОХРАНЕНИЕ ОТЧЕТА")
    print("="*80 + "\n")

    # Сохраняем детальный отчет
    report_file = Path("parsed_data/ANALYSIS_REPORT.txt")
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write("="*80 + "\n")
        f.write("ДЕТАЛЬНЫЙ ОТЧЕТ АНАЛИЗА ДАННЫХ\n")
        f.write("="*80 + "\n\n")

        f.write(f"Всего файлов: {len(csv_files)}\n")
        f.write(f"Всего товаров: {total_products}\n")
        f.write(f"Дубликатов артикулов: {len(duplicates)}\n")
        f.write(f"Товаров без артикулов: {len(products_without_article)}\n")
        f.write(f"Уникальных категорий: {len(categories)}\n\n")

        f.write("КАТЕГОРИИ:\n")
        for cat in sorted(categories):
            cat_count = sum(1 for p in all_products if p['category'] == cat)
            f.write(f"  - {cat} ({cat_count} товаров)\n")

    print(f"✅ Отчет сохранен: {report_file}")
    print("\n✅ Анализ завершен!\n")

    return {
        'total_products': total_products,
        'total_files': len(csv_files),
        'duplicates': len(duplicates),
        'no_article': len(products_without_article),
        'categories': len(categories)
    }

if __name__ == "__main__":
    analyze_data()
