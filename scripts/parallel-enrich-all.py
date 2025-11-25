#!/usr/bin/env python3
"""
ПАРАЛЛЕЛЬНАЯ ОБРАБОТКА ВСЕХ ФАЙЛОВ - 8 ПРОЦЕССОВ
"""

import os
import json
import re
from multiprocessing import Pool, cpu_count
from supabase import Client, create_client

# Supabase
url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

# Паттерны брендов
BRAND_PATTERNS = {
    "DongFeng": [
        r"\bdongfeng\b", r"\bдонгфенг\b", r"\bдф\b",
        r"\bdf[-\s]?\d{3}", r"\bдф[-\s]?\d{3}",
        r"\b240\b", r"\b244\b", r"\b254\b", r"\b304\b", r"\b354\b", r"\b404\b",
        r"\b504\b", r"\b554\b", r"\b804\b", r"\b854\b", r"\b904\b",
    ],
    "Foton": [
        r"\bfoton\b", r"\bфотон\b", r"\blovol\b", r"\bловол\b",
        r"\bft[-\s]?\d{3}", r"\bфт[-\s]?\d{3}",
    ],
    "Jinma": [
        r"\bjinma\b", r"\bджинма\b", r"\bjm[-\s]?\d{3}", r"\bжм[-\s]?\d{3}",
    ],
    "Xingtai": [
        r"\bxingtai\b", r"\bсинтай\b", r"\bсингтай\b", r"\bуралец\b",
        r"\bxt[-\s]?\d{3}", r"\bхт[-\s]?\d{3}",
        r"\b120\b", r"\b180\b", r"\b220\b", r"\b224\b",
    ],
    "ZUBR": [r"\bзубр\b", r"\bzubr\b"],
    "Scout": [r"\bscout\b", r"\bскаут\b"],
}

# Маппинг двигателей
ENGINE_BRAND_MAP = {
    "KM385": "DongFeng", "LL380": "DongFeng", "LL385": "DongFeng",
    "ZN490": "DongFeng", "TY290": "DongFeng", "TY295": "DongFeng",
    "JD295": "DongFeng", "S195": "DongFeng", "HS380": "DongFeng",
    "ZS1110": "Xingtai", "ZS1115": "Xingtai",
    "R180": "Xingtai", "R190": "Xingtai", "R195": "Xingtai",
}

def detect_brand(name: str) -> str | None:
    """Определяет бренд из названия"""
    name_lower = name.lower()

    # Прямые паттерны
    for brand, patterns in BRAND_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, name_lower, re.IGNORECASE):
                return brand

    # Двигатели
    for engine, brand in ENGINE_BRAND_MAP.items():
        if engine.lower() in name_lower:
            return brand

    return None

def process_file(file_path: str) -> dict:
    """Обрабатывает один JSON файл"""
    supabase = create_client(url, key)

    if not os.path.exists(file_path):
        return {"file": file_path, "updated": 0, "skipped": 0, "error": "File not found"}

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        if not isinstance(data, list):
            return {"file": file_path, "updated": 0, "skipped": 0, "error": "Not a list"}

        updated = 0
        skipped = 0

        for item in data:
            title = item.get("title") or item.get("name", "")
            brand = item.get("brand") or item.get("manufacturer", "")

            if not title:
                skipped += 1
                continue

            # Определяем бренд если нет
            if not brand or brand in ["Неизвестно", "Unknown", "UNIVERSAL", ""]:
                brand = detect_brand(title)

            if not brand:
                skipped += 1
                continue

            # Ищем в БД
            title_search = title[:40].strip()

            try:
                result = supabase.table("products").select("id").ilike("name", f"{title_search}%").limit(1).execute()

                if not result.data:
                    skipped += 1
                    continue

                product_id = result.data[0]["id"]

                # Обновляем
                supabase.table("products").update({"manufacturer": brand}).eq("id", product_id).execute()
                updated += 1

            except Exception:
                skipped += 1

        return {"file": os.path.basename(file_path), "updated": updated, "skipped": skipped}

    except Exception as e:
        return {"file": file_path, "updated": 0, "skipped": 0, "error": str(e)}

# Все файлы для обработки
FILES = [
    "/home/ibm/dongfeng-minitraktor/parsed_data/tata-agro/tata-agro-dongfeng.json",
    "/home/ibm/dongfeng-minitraktor/parsed_data/tata-agro/tata-agro-foton.json",
    "/home/ibm/dongfeng-minitraktor/parsed_data/tata-agro/tata-agro-jinma.json",
    "/home/ibm/dongfeng-minitraktor/parsed_data/tata-agro/tata-agro-xingtai.json",
    "/home/ibm/dongfeng-minitraktor/parsed_data/tata-agro/tata-agro-zubr-16.json",
    "/home/ibm/dongfeng-minitraktor/parsed_data/tata-agro/tata-agro-shifeng.json",
    "/home/ibm/dongfeng-minitraktor/parsed_data/tata-agro/tata-agro-garden.json",
    "/home/ibm/dongfeng-minitraktor/parsed_data/tata-agro/tata-agro-zn490bt-engine.json",
    "/home/ibm/dongfeng-minitraktor/parsed_data/tata-agro/tata-agro-km385vt-engine.json",
    "/home/ibm/dongfeng-minitraktor/parsed_data/zip-agro/zip-agro-filters.json",
    "/home/ibm/dongfeng-minitraktor/parsed_data/zip-agro/zip-agro-fuel-system.json",
    "/home/ibm/dongfeng-minitraktor/parsed_data/zip-agro/zip-agro-kpp-parts.json",
    "/home/ibm/dongfeng-minitraktor/parsed_data/zip-agro/zip-agro-r180ne-parts.json",
    "/home/ibm/dongfeng-minitraktor/parsed_data/zip-agro/zip-agro-r190ne-parts.json",
    "/home/ibm/dongfeng-minitraktor/parsed_data/zip-agro/zip-agro-r195ne-parts.json",
    "/home/ibm/dongfeng-minitraktor/parsed_data/zip-agro/zip-agro-zs1100-1115-parts.json",
    "/home/ibm/dongfeng-minitraktor/parsed_data/zip-agro/zip-agro-km385-ll380-parts.json",
    "/home/ibm/dongfeng-minitraktor/parsed_data/zip-agro/zip-agro-zn490bt-parts.json",
]

if __name__ == '__main__':
    print("=" * 80)
    print(f"🚀 ПАРАЛЛЕЛЬНАЯ ОБРАБОТКА - {cpu_count()} ЯДЕР")
    print("=" * 80 + "\n")

    print(f"📦 Файлов к обработке: {len(FILES)}\n")

    # Параллельная обработка
    with Pool(processes=min(8, cpu_count())) as pool:
        results = pool.map(process_file, FILES)

    # Статистика
    total_updated = sum(r.get("updated", 0) for r in results)
    total_skipped = sum(r.get("skipped", 0) for r in results)

    print("\n" + "=" * 80)
    print("📊 РЕЗУЛЬТАТЫ:")
    print("=" * 80 + "\n")

    for result in results:
        if "error" in result:
            print(f"❌ {result['file']}: {result['error']}")
        else:
            print(f"✅ {result['file']}: обновлено {result['updated']}, пропущено {result['skipped']}")

    print("\n" + "=" * 80)
    print(f"📊 ИТОГО:")
    print(f"   Обновлено: {total_updated}")
    print(f"   Пропущено: {total_skipped}")
    print("=" * 80)
