#!/usr/bin/env python3
"""
Агрессивное определение брендов из UNIVERSAL товаров
"""

import os
import re
from supabase import Client, create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

# РАСШИРЕННЫЕ паттерны брендов
BRAND_PATTERNS = {
    "DongFeng": [
        r"\bdongfeng\b", r"\bдонгфенг\b", r"\bдф\b",
        r"\bdf[-\s]?\d{3}", r"\bдф[-\s]?\d{3}",
        # Модели DongFeng
        r"\b240\b", r"\b244\b", r"\b254\b", r"\b304\b", r"\b354\b", r"\b404\b",
        r"\b504\b", r"\b554\b", r"\b804\b", r"\b854\b", r"\b904\b",
        r"\b1804\b", r"\b2204\b",
    ],
    "Foton": [
        r"\bfoton\b", r"\bфотон\b", r"\blovol\b", r"\bловол\b",
        r"\bft[-\s]?\d{3}", r"\bфт[-\s]?\d{3}",
    ],
    "Jinma": [
        r"\bjinma\b", r"\bджинма\b", r"\bjm[-\s]?\d{3}", r"\bжм[-\s]?\d{3}",
        r"\bjm\b", r"\bжм\b",
    ],
    "Xingtai": [
        r"\bxingtai\b", r"\bсинтай\b", r"\bсингтай\b", r"\bуралец\b",
        r"\bxt[-\s]?\d{3}", r"\bхт[-\s]?\d{3}",
        # Модели Xingtai
        r"\b120\b", r"\b180\b", r"\b220\b", r"\b224\b", r"\b24b\b",
    ],
    "ZUBR": [
        r"\bзубр\b", r"\bzubr\b",
    ],
    "Scout": [
        r"\bscout\b", r"\bскаут\b",
    ],
}

# Паттерны двигателей - если есть модель двигателя, но нет бренда
ENGINE_BRAND_MAP = {
    "KM385": "DongFeng",
    "LL380": "DongFeng",
    "LL385": "DongFeng",
    "ZN490": "DongFeng",
    "TY290": "DongFeng",
    "TY295": "DongFeng",
    "JD295": "DongFeng",
    "JD2100": "DongFeng",
    "S195": "DongFeng",
    "HS380": "DongFeng",
    "ZS1110": "Xingtai",
    "ZS1115": "Xingtai",
    "R180": "Xingtai",
    "R190": "Xingtai",
    "R195": "Xingtai",
}

def detect_brand(name: str) -> str | None:
    """Агрессивное определение бренда"""
    name_lower = name.lower()

    # 1. Прямые паттерны брендов
    for brand, patterns in BRAND_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, name_lower, re.IGNORECASE):
                return brand

    # 2. Паттерны двигателей
    for engine, brand in ENGINE_BRAND_MAP.items():
        if engine.lower() in name_lower:
            return brand

    return None

print("=" * 80)
print("🎯 АГРЕССИВНОЕ ОПРЕДЕЛЕНИЕ БРЕНДОВ")
print("=" * 80 + "\n")

# Загружаем UNIVERSAL товары батчами
total_updated = 0
offset = 0
batch_size = 500

while True:
    print(f"📦 Обработка batch {offset//batch_size + 1}...")

    result = supabase.table("products") \
        .select("id, name") \
        .eq("manufacturer", "UNIVERSAL") \
        .range(offset, offset + batch_size - 1) \
        .execute()

    if not result.data:
        break

    batch_updated = 0

    for product in result.data:
        name = product["name"]
        detected_brand = detect_brand(name)

        if detected_brand:
            try:
                supabase.table("products") \
                    .update({"manufacturer": detected_brand}) \
                    .eq("id", product["id"]) \
                    .execute()

                batch_updated += 1
                total_updated += 1

            except Exception as e:
                pass

    print(f"   ✅ Обновлено: {batch_updated} из {len(result.data)}")

    offset += batch_size

    if len(result.data) < batch_size:
        break

print("\n" + "=" * 80)
print(f"📊 ИТОГО ОБНОВЛЕНО: {total_updated}")
print("=" * 80)
