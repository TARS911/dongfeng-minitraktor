#!/usr/bin/env python3
"""
Исправление Xingtai и ZUBR категорий
"""

import os
from supabase import Client, create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

print("=" * 80)
print("🔧 ИСПРАВЛЕНИЕ XINGTAI И ZUBR")
print("=" * 80 + "\n")

# 1. Xingtai с parts-minitractors → parts-minitractors-xingtai (ID: 316)
print("1️⃣ Исправление Xingtai...")

result = supabase.table("products") \
    .select("id, specifications") \
    .eq("manufacturer", "Xingtai") \
    .execute()

xingtai_updated = 0

for p in result.data:
    specs = p.get("specifications") or {}
    cat = specs.get("category", "")

    # Если категория parts-minitractors без бренда
    if cat in ["parts-minitractors", "Запчасти", ""]:
        specs["category"] = "parts-minitractors-xingtai"

        supabase.table("products") \
            .update({"category_id": 316, "specifications": specs}) \
            .eq("id", p["id"]) \
            .execute()

        xingtai_updated += 1

print(f"   ✅ Xingtai обновлено: {xingtai_updated}\n")

# 2. ZUBR → parts-mototractors (ID: 305)
print("2️⃣ Исправление ZUBR (мототракторы)...")

result2 = supabase.table("products") \
    .select("id, specifications") \
    .eq("manufacturer", "ZUBR") \
    .execute()

zubr_updated = 0

for p in result2.data:
    specs = p.get("specifications") or {}
    cat = specs.get("category", "")

    # Если не гидравлика
    if cat != "parts-hydraulics":
        specs["category"] = "parts-mototractors"

        supabase.table("products") \
            .update({"category_id": 305, "specifications": specs}) \
            .eq("id", p["id"]) \
            .execute()

        zubr_updated += 1

print(f"   ✅ ZUBR обновлено: {zubr_updated}\n")

# Проверка
print("=" * 80)
print("📊 РЕЗУЛЬТАТ:")
print("=" * 80)

check = [
    (316, "parts-minitractors-xingtai"),
    (305, "parts-mototractors"),
]

for cat_id, cat_name in check:
    result = supabase.table("products").select("id").eq("category_id", cat_id).execute()
    count = len(result.data) if result.data else 0
    print(f"{cat_name:40} (ID {cat_id}): {count:>6} товаров")

print("=" * 80)
