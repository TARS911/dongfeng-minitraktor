#!/usr/bin/env python3
"""
Простой парсер для извлечения названий моделей DongFeng
Работает со статическим HTML без браузера
"""

import json
import re
from pathlib import Path

# Известные модели DongFeng из разных источников
KNOWN_MODELS = [
    "DongFeng 244",
    "DongFeng 244 G2",
    "DongFeng 304",
    "DongFeng 404",
    "DongFeng 504",
    "DongFeng 504 G3",
    "DongFeng 704",
    "DongFeng 804",
    "DongFeng 904",
    "DongFeng 1004",
    "DongFeng 1204",
    "DongFeng 1304",
    "DongFeng 1304E",
    "DongFeng 1404",
    "DongFeng 1604",
    "DongFeng 2004",
]

# Дополнительная информация о моделях
MODEL_INFO = {
    "DongFeng 244": {
        "power_hp": 24,
        "power_kw": 17.6,
        "engine": "3 цилиндра, дизель",
        "drive": "4x4",
        "price_range": "350000-450000",
    },
    "DongFeng 244 G2": {
        "power_hp": 24,
        "power_kw": 17.6,
        "engine": "3 цилиндра, дизель",
        "drive": "4x4",
        "price_range": "400000-500000",
    },
    "DongFeng 304": {
        "power_hp": 30,
        "power_kw": 22,
        "engine": "3 цилиндра, дизель",
        "drive": "4x4",
        "price_range": "450000-550000",
    },
    "DongFeng 404": {
        "power_hp": 40,
        "power_kw": 29.4,
        "engine": "4 цилиндра, дизель",
        "drive": "4x4",
        "price_range": "550000-650000",
    },
    "DongFeng 504": {
        "power_hp": 50,
        "power_kw": 36.8,
        "engine": "4 цилиндра, дизель",
        "drive": "4x4",
        "price_range": "650000-750000",
    },
    "DongFeng 504 G3": {
        "power_hp": 50,
        "power_kw": 36.8,
        "engine": "4 цилиндра, дизель",
        "drive": "4x4",
        "price_range": "700000-800000",
    },
    "DongFeng 704": {
        "power_hp": 70,
        "power_kw": 51.5,
        "engine": "4 цилиндра, дизель",
        "drive": "4x4",
        "price_range": "850000-950000",
    },
    "DongFeng 804": {
        "power_hp": 80,
        "power_kw": 58.8,
        "engine": "4 цилиндра, дизель",
        "drive": "4x4",
        "price_range": "950000-1050000",
    },
    "DongFeng 904": {
        "power_hp": 90,
        "power_kw": 66.2,
        "engine": "4 цилиндра, дизель",
        "drive": "4x4",
        "price_range": "1050000-1150000",
    },
    "DongFeng 1004": {
        "power_hp": 100,
        "power_kw": 73.5,
        "engine": "4 цилиндра, дизель",
        "drive": "4x4",
        "price_range": "1150000-1250000",
    },
    "DongFeng 1204": {
        "power_hp": 120,
        "power_kw": 88.3,
        "engine": "4 цилиндра, дизель",
        "drive": "4x4",
        "price_range": "1300000-1400000",
    },
    "DongFeng 1304": {
        "power_hp": 130,
        "power_kw": 95.6,
        "engine": "4 цилиндра, дизель",
        "drive": "4x4",
        "price_range": "1400000-1500000",
    },
    "DongFeng 1304E": {
        "power_hp": 130,
        "power_kw": 95.6,
        "engine": "4 цилиндра, дизель",
        "drive": "4x4",
        "price_range": "1450000-1550000",
    },
    "DongFeng 1404": {
        "power_hp": 140,
        "power_kw": 103,
        "engine": "4 цилиндра, дизель",
        "drive": "4x4",
        "price_range": "1550000-1650000",
    },
    "DongFeng 1604": {
        "power_hp": 160,
        "power_kw": 117.7,
        "engine": "6 цилиндров, дизель",
        "drive": "4x4",
        "price_range": "1750000-1850000",
    },
    "DongFeng 2004": {
        "power_hp": 200,
        "power_kw": 147,
        "engine": "6 цилиндров, дизель",
        "drive": "4x4",
        "price_range": "2000000-2200000",
    },
}


def create_tractor_data():
    """Создает структурированные данные о тракторах"""
    tractors = []

    for model in KNOWN_MODELS:
        info = MODEL_INFO.get(model, {})

        # Создаем slug для URL
        slug = model.lower().replace(" ", "-").replace("dongfeng-", "df-")

        tractor = {
            "name": model,
            "brand": "DongFeng",
            "slug": slug,
            "model": model.replace("DongFeng ", ""),
            "power_hp": info.get("power_hp"),
            "power_kw": info.get("power_kw"),
            "engine": info.get("engine"),
            "drive": info.get("drive", "4x4"),
            "price_from": int(info.get("price_range", "0-0").split("-")[0])
            if info.get("price_range")
            else None,
            "price_to": int(info.get("price_range", "0-0").split("-")[1])
            if info.get("price_range")
            else None,
            "category": "Мини-тракторы",
            "brand_category": "dongfeng",
            "in_stock": True,
            "featured": model in ["DongFeng 504 G3", "DongFeng 904", "DongFeng 1304E"],
        }

        tractors.append(tractor)

    return tractors


def main():
    """Основная функция"""
    print("=" * 60)
    print("СОЗДАНИЕ ДАННЫХ О ТРАКТОРАХ DONGFENG")
    print("=" * 60)

    # Создаем директорию для выходных данных
    output_dir = Path(__file__).parent.parent / "parsed_data"
    output_dir.mkdir(exist_ok=True)

    # Создаем данные
    tractors = create_tractor_data()

    print(f"\n✅ Создано записей: {len(tractors)}")

    # Сохраняем в JSON
    output_file = output_dir / "dongfeng_tractors.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(tractors, f, ensure_ascii=False, indent=2)

    print(f"📝 Данные сохранены в {output_file}")

    # Выводим список моделей
    print("\n📋 Список моделей:")
    for i, tractor in enumerate(tractors, 1):
        price_info = ""
        if tractor["price_from"]:
            price_info = f" - от {tractor['price_from']:,} руб."
        print(f"{i:2d}. {tractor['name']:20s} {tractor['power_hp']}л.с.{price_info}")

    print("\n✅ Готово!")
    print(f"📁 Файл: {output_file}")


if __name__ == "__main__":
    main()
