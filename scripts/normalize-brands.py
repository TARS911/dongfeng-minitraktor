#!/usr/bin/env python3
"""
Нормализация брендов - убираем дубликаты с разными регистрами
"""

import os
from supabase import Client, create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

print("=" * 80)
print("🔧 НОРМАЛИЗАЦИЯ БРЕНДОВ")
print("=" * 80 + "\n")

# Маппинг нормализации
BRAND_NORMALIZE = {
    "DONGFENG": "DongFeng",
    "dongfeng": "DongFeng",
    "Dongfeng": "DongFeng",

    "XINGTAI": "Xingtai",
    "xingtai": "Xingtai",
    "Синтай": "Xingtai",
    "СИНТАЙ": "Xingtai",

    "JINMA": "Jinma",
    "jinma": "Jinma",

    "FOTON": "Foton",
    "foton": "Foton",
    "LOVOL": "Foton",
    "Lovol": "Foton",

    "ZUBR": "ZUBR",
    "Zubr": "ZUBR",
    "Зубр": "ZUBR",

    "SCOUT": "Scout",
    "scout": "Scout",
    "Скаут": "Scout",

    "Xingtai/Уралец": "Xingtai",
    "Уралец": "Xingtai",

    "НЕИЗВЕСТНО": "UNIVERSAL",
    "Неизвестно": "UNIVERSAL",
    "Unknown": "UNIVERSAL",
}

total_updated = 0

for old_brand, new_brand in BRAND_NORMALIZE.items():
    print(f"📝 {old_brand} → {new_brand}")

    try:
        result = supabase.table("products") \
            .update({"manufacturer": new_brand}) \
            .eq("manufacturer", old_brand) \
            .execute()

        # Считаем обновленные
        count = len(result.data) if result.data else 0
        total_updated += count

        if count > 0:
            print(f"   ✅ Обновлено: {count}")

    except Exception as e:
        print(f"   ❌ Ошибка: {str(e)[:50]}")

print("\n" + "=" * 80)
print(f"📊 ВСЕГО ОБНОВЛЕНО: {total_updated}")
print("=" * 80)

# Финальная статистика
print("\n🔍 Получаю финальное распределение...\n")

offset = 0
batch_size = 1000
brands = {}

while True:
    result = supabase.table("products").select("manufacturer").range(offset, offset + batch_size - 1).execute()

    if not result.data:
        break

    for p in result.data:
        brand = p.get("manufacturer", "UNKNOWN")
        brands[brand] = brands.get(brand, 0) + 1

    offset += batch_size

    if len(result.data) < batch_size:
        break

print("=" * 80)
print("📊 ФИНАЛЬНОЕ РАСПРЕДЕЛЕНИЕ")
print("=" * 80)

for brand, count in sorted(brands.items(), key=lambda x: -x[1]):
    print(f"{brand:20} {count:>6}")

print("=" * 80)
print(f"ВСЕГО: {sum(brands.values())}")
print("=" * 80)
