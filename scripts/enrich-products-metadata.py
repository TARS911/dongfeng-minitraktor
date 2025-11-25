#!/usr/bin/env python3
"""
Обогащение метаданных товаров на основе parsed_data
Заполняем manufacturer, model, specifications для правильной фильтрации
НЕ переносим товары по категориям - они остаются в одной куче!
"""

import os
import json
import re
import time
from supabase import Client, create_client

# Supabase setup
url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

# ВСЕ JSON файлы из parsed_data с метаданными
FILE_METADATA_MAPPING = {
    # ============================================================================
    # ZIP-AGRO (31 файл)
    # ============================================================================

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

    # ДВС В СБОРЕ
    "../parsed_data/zip-agro/zip-agro-dvigateli-dlya-minitraktorov.json": {
        "part_type": "engine-assembled",
        "category": "engines-assembled",
    },

    # ЗАПЧАСТИ ДВИГАТЕЛЕЙ - R180
    "../parsed_data/zip-agro/zip-agro-r180ne-parts.json": {
        "part_type": "engine-part",
        "engine_model": "R180",
        "category": "parts-engines",
    },

    # ЗАПЧАСТИ ДВИГАТЕЛЕЙ - R190
    "../parsed_data/zip-agro/zip-agro-r190ne-parts.json": {
        "part_type": "engine-part",
        "engine_model": "R190",
        "category": "parts-engines",
    },

    # ЗАПЧАСТИ ДВИГАТЕЛЕЙ - R195
    "../parsed_data/zip-agro/zip-agro-r195ne-parts.json": {
        "part_type": "engine-part",
        "engine_model": "R195",
        "category": "parts-engines",
    },

    # ЗАПЧАСТИ ДВИГАТЕЛЕЙ - ZS1100/ZS1115
    "../parsed_data/zip-agro/zip-agro-zs1100-1115-parts.json": {
        "part_type": "engine-part",
        "engine_model": "ZS1100/ZS1115",
        "category": "parts-engines",
    },

    # ЗАПЧАСТИ ДВИГАТЕЛЕЙ - KM385/LL380
    "../parsed_data/zip-agro/zip-agro-km385-ll380-parts.json": {
        "part_type": "engine-part",
        "engine_model": "KM385/LL380",
        "category": "parts-engines",
    },

    # ЗАПЧАСТИ ДВИГАТЕЛЕЙ - ZN490
    "../parsed_data/zip-agro/zip-agro-zn490bt-parts.json": {
        "part_type": "engine-part",
        "engine_model": "ZN490",
        "category": "parts-engines",
    },

    # ЗАПЧАСТИ МИНИТРАКТОРОВ - DongFeng (все)
    "../parsed_data/zip-agro/zip-agro-dongfeng-all.json": {
        "part_type": "minitractor-part",
        "category": "parts-minitractors-dongfeng",
    },

    # ЗАПЧАСТИ МИНИТРАКТОРОВ - DongFeng 240/244
    "../parsed_data/zip-agro/zip-agro-dongfeng-240-244.json": {
        "part_type": "minitractor-part",
        "model": "DF-240/DF-244",
        "category": "parts-minitractors-dongfeng",
    },

    # ЗАПЧАСТИ МИНИТРАКТОРОВ - DongFeng 354/404
    "../parsed_data/zip-agro/zip-agro-dongfeng-354-404.json": {
        "part_type": "minitractor-part",
        "model": "DF-354/DF-404",
        "category": "parts-minitractors-dongfeng",
    },

    # ЗАПЧАСТИ МИНИТРАКТОРОВ - Foton (все)
    "../parsed_data/zip-agro/zip-agro-foton-all.json": {
        "part_type": "minitractor-part",
        "category": "parts-minitractors-foton",
    },

    # ЗАПЧАСТИ МИНИТРАКТОРОВ - Jinma (все)
    "../parsed_data/zip-agro/zip-agro-jinma-all.json": {
        "part_type": "minitractor-part",
        "category": "parts-minitractors-jinma",
    },

    # ЗАПЧАСТИ МИНИТРАКТОРОВ - Xingtai (все)
    "../parsed_data/zip-agro/zip-agro-xingtai-all-sorted.json": {
        "part_type": "minitractor-part",
        "category": "parts-minitractors-xingtai",
    },

    # ЗАПЧАСТИ МИНИТРАКТОРОВ - Xingtai 120
    "../parsed_data/zip-agro/zip-agro-xingtai-120-parts.json": {
        "part_type": "minitractor-part",
        "model": "XT-120",
        "category": "parts-minitractors-xingtai",
    },

    # ЗАПЧАСТИ МИНИТРАКТОРОВ - Xingtai 120 (двигатель)
    "../parsed_data/zip-agro/zip-agro-xingtai-120-engine-parts.json": {
        "part_type": "engine-part",
        "model": "XT-120",
        "category": "parts-engines",
    },

    # ЗАПЧАСТИ МИНИТРАКТОРОВ - Xingtai XT-180
    "../parsed_data/zip-agro/zip-agro-xingtai-xt-180-parts.json": {
        "part_type": "minitractor-part",
        "model": "XT-180",
        "category": "parts-minitractors-xingtai",
    },

    # ============================================================================
    # TATA-AGRO (11 файлов)
    # ============================================================================

    # ЗАПЧАСТИ МИНИТРАКТОРОВ - DongFeng
    "../parsed_data/tata-agro/tata-agro-dongfeng.json": {
        "part_type": "minitractor-part",
        "category": "parts-minitractors-dongfeng",
    },

    # ЗАПЧАСТИ МИНИТРАКТОРОВ - Foton
    "../parsed_data/tata-agro/tata-agro-foton.json": {
        "part_type": "minitractor-part",
        "category": "parts-minitractors-foton",
    },

    # ЗАПЧАСТИ МИНИТРАКТОРОВ - Jinma
    "../parsed_data/tata-agro/tata-agro-jinma.json": {
        "part_type": "minitractor-part",
        "category": "parts-minitractors-jinma",
    },

    # ЗАПЧАСТИ МИНИТРАКТОРОВ - Xingtai
    "../parsed_data/tata-agro/tata-agro-xingtai.json": {
        "part_type": "minitractor-part",
        "category": "parts-minitractors-xingtai",
    },

    # ЗАПЧАСТИ МИНИТРАКТОРОВ - Xingtai 24B
    "../parsed_data/tata-agro/tata-agro-xingtai-24b.json": {
        "part_type": "minitractor-part",
        "model": "XT-24B",
        "category": "parts-minitractors-xingtai",
    },

    # ЗАПЧАСТИ ДВИГАТЕЛЕЙ - KM385BT
    "../parsed_data/tata-agro/tata-agro-km385vt-engine.json": {
        "part_type": "engine-part",
        "engine_model": "KM385BT",
        "category": "parts-engines",
    },

    # ЗАПЧАСТИ ДВИГАТЕЛЕЙ - ZN490BT
    "../parsed_data/tata-agro/tata-agro-zn490bt-engine.json": {
        "part_type": "engine-part",
        "engine_model": "ZN490",
        "category": "parts-engines",
    },

    # ЗАПЧАСТИ МОТОТРАКТОРОВ - Зубр 16
    "../parsed_data/tata-agro/tata-agro-zubr-16.json": {
        "part_type": "mototractor-part",
        "manufacturer": "ZUBR",
        "category": "parts-mototractors",
    },

    # ЗАПЧАСТИ МОТОТРАКТОРОВ - мототрактор 16"
    "../parsed_data/tata-agro/tata-agro-mototraktor-16.json": {
        "part_type": "mototractor-part",
        "category": "parts-mototractors",
    },

    # ЗАПЧАСТИ НА САДОВУЮ ТЕХНИКУ
    "../parsed_data/tata-agro/tata-agro-garden.json": {
        "part_type": "garden-equipment-part",
        "category": "parts-attachments",
    },
}


def enrich_file(file_path: str, metadata: dict):
    """Обогащает метаданные товаров из файла"""

    if not os.path.exists(file_path):
        print(f"⚠️  Файл не найден: {file_path}")
        return 0, 0

    print(f"\n📦 Обработка: {os.path.basename(file_path)}")
    print(f"   Метаданные: {metadata}")

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
        url = product_data.get("url", "")
        # ВАЖНО: Берем бренд из JSON файла, а не из метаданных!
        brand_from_json = product_data.get("brand", "")

        if not title:
            continue

        # Ищем товар в БД по названию (первые 40 символов для точности)
        title_search = title[:40].strip()
        result = supabase.table("products").select("id, name, manufacturer, model, specifications").ilike("name", f"{title_search}%").limit(1).execute()

        if not result.data or len(result.data) == 0:
            skipped += 1
            continue

        product = result.data[0]

        # Формируем обновления
        update_data = {}

        # ПРИОРИТЕТ: Сначала берем бренд из JSON файла, потом из метаданных
        if brand_from_json and brand_from_json not in ["Неизвестно", "Unknown", ""]:
            update_data["manufacturer"] = brand_from_json
        elif "manufacturer" in metadata and metadata["manufacturer"]:
            update_data["manufacturer"] = metadata["manufacturer"]

        # Обновляем model если указан в метаданных
        if "model" in metadata and metadata["model"]:
            update_data["model"] = metadata["model"]

        # Обновляем specifications
        current_specs = product.get("specifications") or {}
        new_specs = {**current_specs}

        if "part_type" in metadata:
            new_specs["part_type"] = metadata["part_type"]

        if "engine_model" in metadata:
            new_specs["engine_model"] = metadata["engine_model"]

        if "category" in metadata:
            new_specs["category"] = metadata["category"]

        # Добавляем бренд и в specifications для удобства фильтрации
        if brand_from_json and brand_from_json not in ["Неизвестно", "Unknown", ""]:
            new_specs["brand"] = brand_from_json

        update_data["specifications"] = new_specs

        # Обновляем товар с retry логикой
        if update_data:
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    supabase.table("products").update(update_data).eq("id", product["id"]).execute()
                    updated += 1
                    break
                except Exception as e:
                    if attempt < max_retries - 1:
                        print(f"   ⚠️  Ошибка при обновлении, попытка {attempt + 1}/{max_retries}...")
                        time.sleep(2)
                    else:
                        print(f"   ❌ Не удалось обновить товар: {title[:40]}")
                        skipped += 1

    print(f"   ✅ Обновлено: {updated} | Пропущено: {skipped}")
    return updated, skipped


def main():
    """Основная функция"""
    print("=" * 80)
    print("🔄 ОБОГАЩЕНИЕ МЕТАДАННЫХ ТОВАРОВ")
    print("=" * 80 + "\n")
    print("ℹ️  Товары остаются в одной куче, обновляются только метаданные!\n")

    # Обрабатываем каждый файл
    total_updated = 0
    total_skipped = 0

    for file_path, metadata in FILE_METADATA_MAPPING.items():
        updated, skipped = enrich_file(file_path, metadata)
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
