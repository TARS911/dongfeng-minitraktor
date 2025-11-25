#!/usr/bin/env python3
"""
Умная категоризация товаров по:
- Бренду (из JSON файлов)
- Типу запчасти (анализ названия)
- Подкатегории (модель двигателя, модель трактора)
"""

import os
import json
import re
from supabase import Client, create_client

# Supabase setup
url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

# Паттерны для определения типа запчасти по названию
PART_TYPE_PATTERNS = {
    "filter": ["фильтр", "filter"],
    "fuel-system": ["бак топливн", "кран топливн", "насос топливн", "карбюратор", "форсунк"],
    "pump": ["насос", "pump", "гидронасос"],
    "engine-part": ["поршень", "поршневые кольца", "цилиндр", "головка блока", "гбц", "клапан", "коленвал", "распредвал", "прокладк"],
    "transmission": ["шестерня", "вал кпп", "муфта", "сцепление", "корзина сцепления", "диск сцепления"],
    "steering": ["рулев", "гидроусилитель", "насос гур"],
    "hydraulics": ["гидравлик", "гидроцилиндр", "распределитель гидравлическ"],
    "electrical": ["генератор", "стартер", "аккумулятор", "проводка", "реле", "датчик"],
    "cooling": ["радиатор", "термостат", "помпа"],
    "brake": ["тормоз", "колодк тормозн"],
    "bearing": ["подшипник", "bearing"],
    "seal": ["сальник", "манжет", "уплотнитель"],
    "bolt": ["болт", "гайка", "шпилька"],
}

# Паттерны для определения модели двигателя
ENGINE_MODEL_PATTERNS = {
    "R180": ["r180", "р180", "r-180"],
    "R190": ["r190", "р190", "r-190"],
    "R195": ["r195", "р195", "r-195"],
    "ZS1115": ["zs1115", "зс1115", "zs-1115", "1115"],
    "ZS1100": ["zs1100", "зс1100", "zs-1100", "1100"],
    "KM385BT": ["km385", "км385", "km-385"],
    "LL380": ["ll380", "лл380", "ll-380"],
    "ZN490": ["zn490", "зн490", "zn-490"],
    "ZN390": ["zn390", "зн390", "zn-390"],
    "TY290": ["ty290", "ти290"],
    "TY295": ["ty295", "ти295"],
    "JD295": ["jd295", "жд295"],
    "4L22BT": ["4l22", "4л22"],
}

# Паттерны для определения модели трактора
TRACTOR_MODEL_PATTERNS = {
    "DF-240": ["240", "df-240", "dongfeng 240"],
    "DF-244": ["244", "df-244", "dongfeng 244"],
    "DF-354": ["354", "df-354", "dongfeng 354"],
    "DF-404": ["404", "df-404", "dongfeng 404"],
    "FT-244": ["foton 244", "ft-244", "lovol 244"],
    "FT-254": ["foton 254", "ft-254", "lovol 254"],
    "JM-244": ["jinma 244", "jm-244"],
    "JM-254": ["jinma 254", "jm-254"],
    "XT-120": ["xingtai 120", "xt-120", "синтай 120"],
    "XT-180": ["xingtai 180", "xt-180", "синтай 180"],
}


def detect_part_type(title: str) -> str | None:
    """Определяет тип запчасти из названия"""
    title_lower = title.lower()
    for part_type, patterns in PART_TYPE_PATTERNS.items():
        for pattern in patterns:
            if pattern in title_lower:
                return part_type
    return None


def detect_engine_model(title: str) -> str | None:
    """Определяет модель двигателя из названия"""
    title_lower = title.lower()
    for model, patterns in ENGINE_MODEL_PATTERNS.items():
        for pattern in patterns:
            if pattern in title_lower:
                return model
    return None


def detect_tractor_model(title: str) -> str | None:
    """Определяет модель трактора из названия"""
    title_lower = title.lower()
    for model, patterns in TRACTOR_MODEL_PATTERNS.items():
        for pattern in patterns:
            if pattern in title_lower:
                return model
    return None


def process_json_file(file_path: str):
    """Обрабатывает один JSON файл"""
    if not os.path.exists(file_path):
        return 0, 0

    print(f"\n📦 {os.path.basename(file_path)}")

    with open(file_path, 'r', encoding='utf-8') as f:
        products_data = json.load(f)

    if not products_data:
        return 0, 0

    updated = 0
    skipped = 0

    for product_data in products_data[:100]:  # Тест на первых 100
        title = product_data.get("title", "")
        brand_from_json = product_data.get("brand", "")

        if not title:
            continue

        # Ищем товар в БД
        title_search = title[:40].strip()
        result = supabase.table("products").select("id").ilike("name", f"{title_search}%").limit(1).execute()

        if not result.data:
            skipped += 1
            continue

        product_id = result.data[0]["id"]

        # Определяем все метаданные
        part_type = detect_part_type(title)
        engine_model = detect_engine_model(title)
        tractor_model = detect_tractor_model(title)

        # Формируем обновление
        update_data = {}

        # Бренд
        if brand_from_json and brand_from_json not in ["Неизвестно", "Unknown", ""]:
            update_data["manufacturer"] = brand_from_json

        # Model (трактора)
        if tractor_model:
            update_data["model"] = tractor_model

        # Specifications
        specs = {}
        if part_type:
            specs["part_type"] = part_type
        if engine_model:
            specs["engine_model"] = engine_model
        if brand_from_json:
            specs["brand"] = brand_from_json

        if specs:
            update_data["specifications"] = specs

        # Обновляем
        if update_data:
            supabase.table("products").update(update_data).eq("id", product_id).execute()
            updated += 1

            # Показываем примеры
            if updated <= 5:
                print(f"  ✓ {title[:60]}")
                print(f"    Brand: {brand_from_json} | Type: {part_type} | Engine: {engine_model} | Tractor: {tractor_model}")

    print(f"  ✅ {updated} updated, {skipped} skipped")
    return updated, skipped


def main():
    print("="*80)
    print("🧠 УМНАЯ КАТЕГОРИЗАЦИЯ ТОВАРОВ")
    print("="*80)

    # Список всех JSON файлов
    json_files = [
        "../parsed_data/zip-agro/zip-agro-filters.json",
        "../parsed_data/zip-agro/zip-agro-fuel-system.json",
        "../parsed_data/zip-agro/zip-agro-dongfeng-240-244.json",
        "../parsed_data/zip-agro/zip-agro-foton-all.json",
        "../parsed_data/zip-agro/zip-agro-jinma-all.json",
        "../parsed_data/zip-agro/zip-agro-xingtai-all-sorted.json",
    ]

    total_updated = 0
    total_skipped = 0

    for file_path in json_files:
        updated, skipped = process_json_file(file_path)
        total_updated += updated
        total_skipped += skipped

    print("\n" + "="*80)
    print(f"📊 ИТОГО: {total_updated} обновлено, {total_skipped} пропущено")
    print("="*80)


if __name__ == "__main__":
    main()
