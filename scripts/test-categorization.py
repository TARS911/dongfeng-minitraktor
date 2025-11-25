#!/usr/bin/env python3
"""
Тестовый запуск категоризации - показывает что будет изменено без фактических изменений
"""

import os
import json
from supabase import Client, create_client

# Supabase setup
url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

# Простой маппинг для теста
TEST_FILES = {
    "../parsed_data/zip-agro/zip-agro-filters.json": "parts-filters",
    "../parsed_data/zip-agro/zip-agro-fuel-system.json": "parts-fuel-system",
    "../parsed_data/zip-agro/zip-agro-dongfeng-240-244.json": "parts-minitractors-dongfeng",
}

def load_categories():
    """Загружает все категории из БД"""
    print("📁 Загрузка категорий из БД...")
    result = supabase.table("categories").select("id, name, slug").execute()
    categories_map = {cat["slug"]: cat for cat in result.data}
    print(f"✅ Загружено {len(categories_map)} категорий\n")
    return categories_map

def test_file(file_path: str, target_category_slug: str, categories_map: dict):
    """Тестирует обработку одного файла"""

    if not os.path.exists(file_path):
        print(f"⚠️  Файл не найден: {file_path}")
        return

    if target_category_slug not in categories_map:
        print(f"⚠️  Категория не найдена в БД: {target_category_slug}")
        return

    target_category = categories_map[target_category_slug]

    print(f"\n{'='*80}")
    print(f"📦 Файл: {os.path.basename(file_path)}")
    print(f"🎯 Целевая категория: {target_category['name']} ({target_category_slug})")
    print(f"{'='*80}\n")

    # Загружаем JSON
    with open(file_path, 'r', encoding='utf-8') as f:
        products_data = json.load(f)

    print(f"📊 Товаров в файле: {len(products_data)}\n")

    found = 0
    not_found = 0
    wrong_category = 0
    correct_category = 0

    # Проверяем первые 10 товаров
    for i, product_data in enumerate(products_data[:10]):
        title = product_data.get("title", "")
        article = product_data.get("article", "")

        if not title:
            continue

        # Ищем товар в БД
        if article:
            result = supabase.table("products").select("id, name, category_id").eq("article", article).execute()
        else:
            result = supabase.table("products").select("id, name, category_id").ilike("name", f"%{title[:30]}%").limit(1).execute()

        if not result.data or len(result.data) == 0:
            not_found += 1
            print(f"❌ НЕ НАЙДЕН: {title[:60]}")
            print(f"   Артикул: {article or 'нет'}\n")
            continue

        product = result.data[0]
        found += 1

        if product["category_id"] == target_category["id"]:
            correct_category += 1
            print(f"✅ УЖЕ В НУЖНОЙ КАТЕГОРИИ: {product['name'][:60]}")
        else:
            wrong_category += 1
            current_cat = next((c for c in categories_map.values() if c["id"] == product["category_id"]), {"name": "Неизвестно"})
            print(f"🔄 БУДЕТ ПЕРЕМЕЩЕН: {product['name'][:60]}")
            print(f"   Из: {current_cat['name']}")
            print(f"   В:  {target_category['name']}")
        print()

    print(f"{'='*80}")
    print(f"📊 Результаты (первые 10 товаров):")
    print(f"   ✅ Найдено в БД: {found}")
    print(f"   ❌ Не найдено в БД: {not_found}")
    print(f"   ✅ Уже в нужной категории: {correct_category}")
    print(f"   🔄 Будут перемещены: {wrong_category}")
    print(f"{'='*80}\n")

def main():
    print("\n" + "="*80)
    print("🧪 ТЕСТОВЫЙ РЕЖИМ КАТЕГОРИЗАЦИИ")
    print("="*80 + "\n")

    categories_map = load_categories()

    for file_path, category_slug in TEST_FILES.items():
        test_file(file_path, category_slug, categories_map)

    print("\n✅ Тест завершен!\n")

if __name__ == "__main__":
    main()
