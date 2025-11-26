#!/usr/bin/env python3
"""
Распределение товаров из parts-minitractors по брендовым категориям
"""

import os
from supabase import Client, create_client
from multiprocessing import Pool, cpu_count

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

# Маппинг производителей на категории
BRAND_TO_CATEGORY = {
    "DongFeng": "parts-minitractors-dongfeng",
    "Foton": "parts-minitractors-foton",
    "Jinma": "parts-minitractors-jinma",
    "Xingtai": "parts-minitractors-xingtai",
    "ZUBR": "parts-mototractors",
    "Scout": "parts-mototractors",
}

def process_batch(batch_num: int):
    """Обрабатывает один батч товаров"""
    supabase = create_client(url, key)

    offset = batch_num * 500

    # Получаем товары из parts-minitractors
    result = supabase.table("products") \
        .select("id, name, manufacturer, specifications") \
        .range(offset, offset + 499) \
        .execute()

    if not result.data:
        return {"batch": batch_num, "updated": 0, "skipped": 0}

    updated = 0
    skipped = 0

    for product in result.data:
        specs = product.get("specifications") or {}
        current_cat = specs.get("category", "")
        manufacturer = product.get("manufacturer", "")

        # Обрабатываем только товары из parts-minitractors
        if current_cat != "parts-minitractors":
            skipped += 1
            continue

        # Определяем новую категорию по бренду
        new_category = BRAND_TO_CATEGORY.get(manufacturer)

        if not new_category:
            skipped += 1
            continue

        # Обновляем категорию
        specs["category"] = new_category

        try:
            supabase.table("products") \
                .update({"specifications": specs}) \
                .eq("id", product["id"]) \
                .execute()
            updated += 1
        except Exception as e:
            skipped += 1

    return {"batch": batch_num, "updated": updated, "skipped": skipped}

if __name__ == "__main__":
    print("=" * 80)
    print("🔄 РАСПРЕДЕЛЕНИЕ ТОВАРОВ ПО БРЕНДОВЫМ КАТЕГОРИЯМ")
    print("=" * 80 + "\n")

    # Получаем общее количество товаров
    supabase = create_client(url, key)
    count_result = supabase.table("products").select("id", count="exact").execute()
    total_products = count_result.count

    print(f"📦 Всего товаров: {total_products}")

    # Определяем количество батчей
    batch_size = 500
    num_batches = (total_products // batch_size) + 1

    print(f"📊 Количество батчей: {num_batches}")
    print(f"💻 Используем {min(12, cpu_count())} процессоров\n")

    # Параллельная обработка
    with Pool(processes=min(12, cpu_count())) as pool:
        results = pool.map(process_batch, range(num_batches))

    # Подсчет результатов
    total_updated = sum(r["updated"] for r in results)
    total_skipped = sum(r["skipped"] for r in results)

    print("\n" + "=" * 80)
    print("📊 РЕЗУЛЬТАТЫ:")
    print("=" * 80)
    print(f"✅ Перемещено: {total_updated:>6} товаров")
    print(f"⏭️  Пропущено:  {total_skipped:>6} товаров")
    print("=" * 80)

    # Статистика по категориям
    print("\n🔍 Распределение по брендовым категориям:\n")

    brand_categories = [
        "parts-minitractors",
        "parts-minitractors-dongfeng",
        "parts-minitractors-foton",
        "parts-minitractors-jinma",
        "parts-minitractors-xingtai",
        "parts-mototractors",
    ]

    for cat_slug in brand_categories:
        offset = 0
        count = 0

        while offset < total_products:
            result = supabase.table("products") \
                .select("id") \
                .range(offset, offset + 999) \
                .execute()

            if not result.data:
                break

            for p in result.data:
                full = supabase.table("products").select("specifications").eq("id", p["id"]).execute()
                if full.data:
                    specs = full.data[0].get("specifications") or {}
                    if specs.get("category") == cat_slug:
                        count += 1

            offset += 1000

            if len(result.data) < 1000:
                break

        print(f"{cat_slug:45} {count:>6}")

    print("\n" + "=" * 80)
