#!/usr/bin/env python3
"""
Batch enrichment - обрабатываем товары батчами для ускорения
"""

import os
import json
import time
from supabase import Client, create_client

# Supabase setup
url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

# Маппинг файлов (сокращённый для теста)
FILE_METADATA_MAPPING = {
    # ФИЛЬТРЫ
    "../parsed_data/zip-agro/zip-agro-filters.json": {
        "part_type": "filter",
        "category": "parts-filters",
    },

    # ТОПЛИВНАЯ СИСТЕМА
    "../parsed_data/zip-agro/zip-agro-fuel-system.json": {
        "part_type": "fuel-system",
        "category": "parts-fuel-system",
    },

    # НАСОСЫ
    "../parsed_data/zip-agro/zip-agro-pumps-hydraulic-fuel.json": {
        "part_type": "pump",
        "category": "parts-hydraulics",
    },

    # КПП
    "../parsed_data/zip-agro/zip-agro-kpp-parts.json": {
        "part_type": "transmission",
        "category": "parts-minitractors",
    },

    # ДВИГАТЕЛИ В СБОРЕ
    "../parsed_data/zip-agro/zip-agro-dvigateli-dlya-minitraktorov.json": {
        "part_type": "engine-assembled",
        "category": "engines-assembled",
    },

    # ЗАПЧАСТИ ДВИГАТЕЛЕЙ
    "../parsed_data/zip-agro/zip-agro-r180ne-parts.json": {
        "part_type": "engine-part",
        "engine_model": "R180",
        "category": "parts-engines",
    },

    "../parsed_data/zip-agro/zip-agro-r190ne-parts.json": {
        "part_type": "engine-part",
        "engine_model": "R190",
        "category": "parts-engines",
    },

    "../parsed_data/zip-agro/zip-agro-r195ne-parts.json": {
        "part_type": "engine-part",
        "engine_model": "R195",
        "category": "parts-engines",
    },

    "../parsed_data/zip-agro/zip-agro-zs1100-1115-parts.json": {
        "part_type": "engine-part",
        "engine_model": "ZS1100/ZS1115",
        "category": "parts-engines",
    },

    "../parsed_data/zip-agro/zip-agro-km385-ll380-parts.json": {
        "part_type": "engine-part",
        "engine_model": "KM385/LL380",
        "category": "parts-engines",
    },

    "../parsed_data/zip-agro/zip-agro-zn490bt-parts.json": {
        "part_type": "engine-part",
        "engine_model": "ZN490",
        "category": "parts-engines",
    },

    # DONGFENG
    "../parsed_data/zip-agro/zip-agro-dongfeng-all.json": {
        "part_type": "minitractor-part",
        "category": "parts-minitractors-dongfeng",
    },

    "../parsed_data/zip-agro/zip-agro-dongfeng-240-244.json": {
        "part_type": "minitractor-part",
        "model": "DF-240/DF-244",
        "category": "parts-minitractors-dongfeng",
    },

    "../parsed_data/zip-agro/zip-agro-dongfeng-354-404.json": {
        "part_type": "minitractor-part",
        "model": "DF-354/DF-404",
        "category": "parts-minitractors-dongfeng",
    },

    # FOTON
    "../parsed_data/zip-agro/zip-agro-foton-all.json": {
        "part_type": "minitractor-part",
        "category": "parts-minitractors-foton",
    },

    # JINMA
    "../parsed_data/zip-agro/zip-agro-jinma-all.json": {
        "part_type": "minitractor-part",
        "category": "parts-minitractors-jinma",
    },

    # XINGTAI
    "../parsed_data/zip-agro/zip-agro-xingtai-all-sorted.json": {
        "part_type": "minitractor-part",
        "category": "parts-minitractors-xingtai",
    },

    "../parsed_data/zip-agro/zip-agro-xingtai-120-parts.json": {
        "part_type": "minitractor-part",
        "model": "XT-120",
        "category": "parts-minitractors-xingtai",
    },

    "../parsed_data/zip-agro/zip-agro-xingtai-120-engine-parts.json": {
        "part_type": "engine-part",
        "model": "XT-120",
        "category": "parts-engines",
    },

    "../parsed_data/zip-agro/zip-agro-xingtai-xt-180-parts.json": {
        "part_type": "minitractor-part",
        "model": "XT-180",
        "category": "parts-minitractors-xingtai",
    },

    # TATA-AGRO
    "../parsed_data/tata-agro/tata-agro-dongfeng.json": {
        "part_type": "minitractor-part",
        "category": "parts-minitractors-dongfeng",
    },

    "../parsed_data/tata-agro/tata-agro-foton.json": {
        "part_type": "minitractor-part",
        "category": "parts-minitractors-foton",
    },

    "../parsed_data/tata-agro/tata-agro-jinma.json": {
        "part_type": "minitractor-part",
        "category": "parts-minitractors-jinma",
    },

    "../parsed_data/tata-agro/tata-agro-xingtai.json": {
        "part_type": "minitractor-part",
        "category": "parts-minitractors-xingtai",
    },

    "../parsed_data/tata-agro/tata-agro-xingtai-24b.json": {
        "part_type": "minitractor-part",
        "model": "XT-24B",
        "category": "parts-minitractors-xingtai",
    },

    "../parsed_data/tata-agro/tata-agro-km385vt-engine.json": {
        "part_type": "engine-part",
        "engine_model": "KM385BT",
        "category": "parts-engines",
    },

    "../parsed_data/tata-agro/tata-agro-zn490bt-engine.json": {
        "part_type": "engine-part",
        "engine_model": "ZN490",
        "category": "parts-engines",
    },

    "../parsed_data/tata-agro/tata-agro-zubr-16.json": {
        "part_type": "mototractor-part",
        "manufacturer": "ZUBR",
        "category": "parts-mototractors",
    },

    "../parsed_data/tata-agro/tata-agro-mototraktor-16.json": {
        "part_type": "mototractor-part",
        "category": "parts-mototractors",
    },

    "../parsed_data/tata-agro/tata-agro-garden.json": {
        "part_type": "garden-equipment-part",
        "category": "parts-attachments",
    },
}


def enrich_file_batch(file_path: str, metadata: dict):
    """Обрабатывает файл батчами по 50 товаров"""

    if not os.path.exists(file_path):
        print(f"⚠️  Файл не найден: {file_path}")
        return 0, 0

    print(f"\n📦 {os.path.basename(file_path)}")

    with open(file_path, 'r', encoding='utf-8') as f:
        products_data = json.load(f)

    if not products_data:
        return 0, 0

    updated = 0
    skipped = 0
    batch_size = 50

    for i in range(0, len(products_data), batch_size):
        batch = products_data[i:i+batch_size]

        for product_data in batch:
            title = product_data.get("title", "")
            brand_from_json = product_data.get("brand", "")

            if not title:
                continue

            # Поиск в БД
            try:
                title_search = title[:40].strip()
                result = supabase.table("products").select("id, specifications").ilike("name", f"{title_search}%").limit(1).execute()

                if not result.data:
                    skipped += 1
                    continue

                product = result.data[0]

                # Формируем обновление
                update_data = {}

                # Бренд
                if brand_from_json and brand_from_json not in ["Неизвестно", "Unknown", ""]:
                    update_data["manufacturer"] = brand_from_json
                elif "manufacturer" in metadata:
                    update_data["manufacturer"] = metadata["manufacturer"]

                # Model
                if "model" in metadata:
                    update_data["model"] = metadata["model"]

                # Specifications
                current_specs = product.get("specifications") or {}
                new_specs = {**current_specs}

                if "part_type" in metadata:
                    new_specs["part_type"] = metadata["part_type"]
                if "engine_model" in metadata:
                    new_specs["engine_model"] = metadata["engine_model"]
                if "category" in metadata:
                    new_specs["category"] = metadata["category"]
                if brand_from_json:
                    new_specs["brand"] = brand_from_json

                update_data["specifications"] = new_specs

                # Обновляем
                if update_data:
                    supabase.table("products").update(update_data).eq("id", product["id"]).execute()
                    updated += 1

            except Exception as e:
                print(f"   ⚠️  Ошибка: {str(e)[:50]}")
                skipped += 1

        # Пауза между батчами
        if i + batch_size < len(products_data):
            time.sleep(0.5)

        # Прогресс
        progress = min(i + batch_size, len(products_data))
        print(f"   Прогресс: {progress}/{len(products_data)} | Обновлено: {updated} | Пропущено: {skipped}")

    print(f"   ✅ Итого: {updated} обновлено, {skipped} пропущено")
    return updated, skipped


def main():
    print("=" * 80)
    print("🔄 BATCH ENRICHMENT")
    print("=" * 80 + "\n")

    total_updated = 0
    total_skipped = 0

    for file_path, metadata in FILE_METADATA_MAPPING.items():
        updated, skipped = enrich_file_batch(file_path, metadata)
        total_updated += updated
        total_skipped += skipped

    print("\n" + "=" * 80)
    print(f"📊 ИТОГО: {total_updated} обновлено, {total_skipped} пропущено")
    print("=" * 80)


if __name__ == "__main__":
    main()
