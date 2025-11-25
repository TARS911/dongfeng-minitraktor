#!/usr/bin/env python3
"""
Определяем бренды из названий товаров для универсальных запчастей
"""

import os
import json
import re
from supabase import Client, create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

# Паттерны брендов в названиях
BRAND_PATTERNS = {
    "DongFeng": [
        r"\bdongfeng\b", r"\bдонгфенг\b", r"\bdf[-\s]?\d{3}", r"\bдф[-\s]?\d{3}",
        r"\b240\b", r"\b244\b", r"\b254\b", r"\b304\b", r"\b354\b", r"\b404\b",
        r"\b504\b", r"\b554\b", r"\b804\b", r"\b854\b", r"\b904\b"
    ],
    "Foton": [
        r"\bfoton\b", r"\bфотон\b", r"\blovol\b", r"\bловол\b",
        r"\bft[-\s]?\d{3}", r"\bфт[-\s]?\d{3}"
    ],
    "Jinma": [
        r"\bjinma\b", r"\bджинма\b", r"\bjm[-\s]?\d{3}", r"\bжм[-\s]?\d{3}"
    ],
    "Xingtai": [
        r"\bxingtai\b", r"\bсинтай\b", r"\bсингтай\b", r"\bxt[-\s]?\d{3}", r"\bхт[-\s]?\d{3}",
        r"\b120\b", r"\b180\b", r"\b220\b", r"\b224\b"
    ],
    "ZUBR": [
        r"\bzubr\b", r"\bзубр\b"
    ],
}

def detect_brand_from_name(name: str) -> str | None:
    """Определяет бренд из названия товара"""
    name_lower = name.lower()

    for brand, patterns in BRAND_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, name_lower, re.IGNORECASE):
                return brand

    return None

print("=" * 80)
print("🔍 ОПРЕДЕЛЕНИЕ БРЕНДОВ ИЗ НАЗВАНИЙ")
print("=" * 80 + "\n")

# Файлы с универсальными запчастями где brand = "Неизвестно"
UNIVERSAL_FILES = [
    "../parsed_data/zip-agro/zip-agro-filters.json",
    "../parsed_data/zip-agro/zip-agro-fuel-system.json",
    "../parsed_data/zip-agro/zip-agro-pumps-hydraulic-fuel.json",
    "../parsed_data/zip-agro/zip-agro-kpp-parts.json",
]

total_updated = 0
total_detected = 0
total_not_detected = 0

for file_path in UNIVERSAL_FILES:
    if not os.path.exists(file_path):
        continue

    print(f"📦 {os.path.basename(file_path)}")

    with open(file_path, 'r', encoding='utf-8') as f:
        products_data = json.load(f)

    detected = 0
    not_detected = 0
    updated = 0

    for product_data in products_data:
        title = product_data.get("title", "")

        if not title:
            continue

        # Пытаемся определить бренд из названия
        detected_brand = detect_brand_from_name(title)

        if detected_brand:
            detected += 1
        else:
            not_detected += 1
            continue

        # Ищем товар в БД
        title_search = title[:40].strip()
        result = supabase.table("products").select("id, name").ilike("name", f"{title_search}%").limit(1).execute()

        if not result.data:
            continue

        product_id = result.data[0]["id"]

        # Обновляем manufacturer
        try:
            supabase.table("products").update({"manufacturer": detected_brand}).eq("id", product_id).execute()
            updated += 1
        except Exception as e:
            pass

    print(f"   ✅ Обнаружен бренд: {detected}")
    print(f"   ⚠️  Бренд не обнаружен: {not_detected}")
    print(f"   💾 Обновлено в БД: {updated}\n")

    total_detected += detected
    total_not_detected += not_detected
    total_updated += updated

print("=" * 80)
print(f"📊 ИТОГО:")
print(f"   Обнаружен бренд: {total_detected}")
print(f"   Бренд не обнаружен: {total_not_detected}")
print(f"   Обновлено в БД: {total_updated}")
print("=" * 80)
