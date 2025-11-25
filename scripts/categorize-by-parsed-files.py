#!/usr/bin/env python3
"""
Категоризация товаров на основе структуры parsed_data
Использует точные маппинги файлов на категории/подкатегории
"""

import os
import json
from supabase import Client, create_client

# Supabase setup
url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

# Маппинг файлов parsed_data на категории/подкатегории
# Формат: "путь/к/файлу.json": "category-slug"
FILE_CATEGORY_MAPPING = {
    # ФИЛЬТРЫ (parts-filters)
    "parsed_data/zip-agro/zip-agro-filters.json": "parts-filters",

    # ТОПЛИВНАЯ СИСТЕМА (parts-fuel-system)
    "parsed_data/zip-agro/zip-agro-fuel-system.json": "parts-fuel-system",
    "parsed_data/zip-agro/zip-agro-pumps-hydraulic-fuel.json": "parts-fuel-system",

    # ГИДРАВЛИКА (parts-hydraulics)
    "parsed_data/zip-agro/zip-agro-pumps-hydraulic-fuel.json": "parts-hydraulics",  # Насосы гидравлические

    # ДВС В СБОРЕ (engines-assembled)
    "parsed_data/zip-agro/zip-agro-dvigateli-dlya-minitraktorov.json": "engines-assembled",

    # ЗАПЧАСТИ НА ДВС - R180 (parts-engines/r180)
    "parsed_data/zip-agro/zip-agro-r180ne-parts.json": "parts-engines",  # Будем уточнять по спецификациям

    # ЗАПЧАСТИ НА ДВС - R190 (parts-engines/r190)
    "parsed_data/zip-agro/zip-agro-r190ne-parts.json": "parts-engines",

    # ЗАПЧАСТИ НА ДВС - R195 (parts-engines/r195)
    "parsed_data/zip-agro/zip-agro-r195ne-parts.json": "parts-engines",

    # ЗАПЧАСТИ НА ДВС - ZS1100/ZS1115 (parts-engines)
    "parsed_data/zip-agro/zip-agro-zs1100-1115-parts.json": "parts-engines",

    # ЗАПЧАСТИ НА ДВС - KM385/LL380 (parts-engines)
    "parsed_data/zip-agro/zip-agro-km385-ll380-parts.json": "parts-engines",
    "parsed_data/tata-agro/tata-agro-km385vt-engine.json": "parts-engines",

    # ЗАПЧАСТИ НА ДВС - ZN490 (parts-engines)
    "parsed_data/zip-agro/zip-agro-zn490bt-parts.json": "parts-engines",
    "parsed_data/tata-agro/tata-agro-zn490bt-engine.json": "parts-engines",

    # ЗАПЧАСТИ НА МИНИТРАКТОРЫ - DongFeng (parts-minitractors-dongfeng)
    "parsed_data/zip-agro/zip-agro-dongfeng-all.json": "parts-minitractors-dongfeng",
    "parsed_data/zip-agro/zip-agro-dongfeng-240-244.json": "parts-minitractors-dongfeng",
    "parsed_data/zip-agro/zip-agro-dongfeng-354-404.json": "parts-minitractors-dongfeng",
    "parsed_data/tata-agro/tata-agro-dongfeng.json": "parts-minitractors-dongfeng",

    # ЗАПЧАСТИ НА МИНИТРАКТОРЫ - Foton (parts-minitractors-foton)
    "parsed_data/zip-agro/zip-agro-foton-all.json": "parts-minitractors-foton",
    "parsed_data/tata-agro/tata-agro-foton.json": "parts-minitractors-foton",

    # ЗАПЧАСТИ НА МИНИТРАКТОРЫ - Jinma (parts-minitractors-jinma)
    "parsed_data/zip-agro/zip-agro-jinma-all.json": "parts-minitractors-jinma",
    "parsed_data/tata-agro/tata-agro-jinma.json": "parts-minitractors-jinma",

    # ЗАПЧАСТИ НА МИНИТРАКТОРЫ - Xingtai (parts-minitractors-xingtai)
    "parsed_data/zip-agro/zip-agro-xingtai-all-sorted.json": "parts-minitractors-xingtai",
    "parsed_data/zip-agro/zip-agro-xingtai-120-parts.json": "parts-minitractors-xingtai",
    "parsed_data/zip-agro/zip-agro-xingtai-120-engine-parts.json": "parts-minitractors-xingtai",
    "parsed_data/zip-agro/zip-agro-xingtai-xt-180-parts.json": "parts-minitractors-xingtai",
    "parsed_data/tata-agro/tata-agro-xingtai.json": "parts-minitractors-xingtai",
    "parsed_data/tata-agro/tata-agro-xingtai-24b.json": "parts-minitractors-xingtai",

    # ЗАПЧАСТИ НА МОТОТРАКТОРЫ (parts-mototractors)
    "parsed_data/tata-agro/tata-agro-mototraktor-16.json": "parts-mototractors",

    # КПП (можно добавить в parts-minitractors или создать отдельную категорию)
    "parsed_data/zip-agro/zip-agro-kpp-parts.json": "parts-minitractors",  # Универсальные запчасти КПП
}

# Дополнительный маппинг для определения модели двигателя по названию
ENGINE_MODEL_PATTERNS = {
    "r180": ["r180", "р180"],
    "r190": ["r190", "р190"],
    "r195": ["r195", "р195"],
    "zs1115": ["zs1115", "зс1115", "zs-1115"],
    "zs1100": ["zs1100", "зс1100", "zs-1100"],
    "km385bt": ["km385", "км385", "km-385"],
    "ll380": ["ll380", "лл380", "ll-380"],
    "zn490": ["zn490", "зн490", "zn-490"],
    "zn390": ["zn390", "зн390", "zn-390"],
}


def detect_engine_model(product_name: str) -> str | None:
    """Определяет модель двигателя из названия товара"""
    name_lower = product_name.lower()
    for model, patterns in ENGINE_MODEL_PATTERNS.items():
        for pattern in patterns:
            if pattern in name_lower:
                return model
    return None


def load_categories():
    """Загружает все категории из БД"""
    print("📁 Загрузка категорий из БД...")
    result = supabase.table("categories").select("id, name, slug").execute()
    categories_map = {cat["slug"]: cat for cat in result.data}
    print(f"✅ Загружено {len(categories_map)} категорий\n")
    return categories_map


def process_file(file_path: str, category_slug: str, categories_map: dict):
    """Обрабатывает один JSON файл и категоризирует товары"""

    if not os.path.exists(file_path):
        print(f"⚠️  Файл не найден: {file_path}")
        return 0, 0

    # Проверяем, что категория существует
    if category_slug not in categories_map:
        print(f"⚠️  Категория не найдена в БД: {category_slug}")
        return 0, 0

    category_id = categories_map[category_slug]["id"]
    category_name = categories_map[category_slug]["name"]

    print(f"\n📦 Обработка: {os.path.basename(file_path)}")
    print(f"   → Категория: {category_name} ({category_slug})")

    # Загружаем JSON
    with open(file_path, 'r', encoding='utf-8') as f:
        products_data = json.load(f)

    if not products_data or len(products_data) == 0:
        print(f"   ⚠️  Файл пустой")
        return 0, 0

    updated = 0
    skipped = 0

    # Обрабатываем каждый товар
    for product_data in products_data:
        title = product_data.get("title", "")
        article = product_data.get("article", "")

        if not title:
            continue

        # Ищем товар в БД по названию и артикулу
        query = supabase.table("products").select("id, name, category_id")

        # Пробуем найти по артикулу (точнее)
        if article:
            result = query.eq("article", article).execute()
        else:
            # Если нет артикула, ищем по названию
            result = query.ilike("name", f"%{title[:50]}%").limit(1).execute()

        if not result.data or len(result.data) == 0:
            skipped += 1
            continue

        product = result.data[0]

        # Обновляем категорию товара
        update_data = {"category_id": category_id}

        # Для запчастей двигателей добавляем модель в specifications
        if category_slug == "parts-engines":
            engine_model = detect_engine_model(title)
            if engine_model:
                update_data["specifications"] = {"engine_model": engine_model}

        supabase.table("products").update(update_data).eq("id", product["id"]).execute()
        updated += 1

    print(f"   ✅ Обновлено: {updated} | Пропущено: {skipped}")
    return updated, skipped


def main():
    """Основная функция"""
    print("=" * 80)
    print("🔄 КАТЕГОРИЗАЦИЯ ТОВАРОВ ПО PARSED_DATA")
    print("=" * 80 + "\n")

    # Загружаем категории
    categories_map = load_categories()

    # Обрабатываем каждый файл
    total_updated = 0
    total_skipped = 0

    for file_path, category_slug in FILE_CATEGORY_MAPPING.items():
        updated, skipped = process_file(file_path, category_slug, categories_map)
        total_updated += updated
        total_skipped += skipped

    print("\n" + "=" * 80)
    print("📊 ИТОГОВАЯ СТАТИСТИКА")
    print("=" * 80)
    print(f"✅ Всего обновлено: {total_updated}")
    print(f"⚠️  Всего пропущено: {total_skipped}")
    print("\n✨ Готово!\n")


if __name__ == "__main__":
    main()
