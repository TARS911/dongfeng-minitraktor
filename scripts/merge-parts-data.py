#!/usr/bin/env python3
"""
Объединяет данные из parts.json и parts-full.json
Удаляет дубликаты и создает финальный файл
"""

import json
from pathlib import Path

AGRODOM_DIR = Path(__file__).parent.parent / "parsed_data" / "agrodom"
OLD_FILE = AGRODOM_DIR / "parts.json"
NEW_FILE = AGRODOM_DIR / "parts-full.json"
MERGED_FILE = AGRODOM_DIR / "parts-merged.json"

print("=" * 70)
print("🔗 ОБЪЕДИНЕНИЕ ДАННЫХ ЗАПЧАСТЕЙ")
print("=" * 70)

# Загружаем старые данные
print("\n📂 Загружаю parts.json...")
with open(OLD_FILE, "r", encoding="utf-8") as f:
    old_parts = json.load(f)
print(f"✅ Загружено: {len(old_parts)} записей")

# Фильтруем только записи с ценами
old_parts_with_price = [p for p in old_parts if p.get("price")]
print(f"📊 С ценами: {len(old_parts_with_price)} товаров")

# Загружаем новые данные
print("\n📂 Загружаю parts-full.json...")
with open(NEW_FILE, "r", encoding="utf-8") as f:
    new_parts = json.load(f)
print(f"✅ Загружено: {len(new_parts)} записей")

# Объединяем
all_parts = old_parts_with_price + new_parts
print(f"\n📦 Всего записей до удаления дубликатов: {len(all_parts)}")

# Удаляем дубликаты по названию
seen_names = set()
unique_parts = []

for part in all_parts:
    name = part.get("name", "").strip()
    if name and name not in seen_names:
        seen_names.add(name)
        unique_parts.append(part)

print(f"✅ Уникальных товаров: {len(unique_parts)}")
print(f"🗑️  Удалено дубликатов: {len(all_parts) - len(unique_parts)}")

# Статистика по категориям
from collections import Counter

categories = Counter(p.get("category", "Unknown") for p in unique_parts)

print("\n📊 СТАТИСТИКА ПО КАТЕГОРИЯМ:")
print("-" * 70)
for cat, count in categories.most_common():
    print(f"  {cat}: {count} товаров")

print("\n💾 Сохраняю в parts-merged.json...")
with open(MERGED_FILE, "w", encoding="utf-8") as f:
    json.dump(unique_parts, f, ensure_ascii=False, indent=2)

print(f"✅ Сохранено: {MERGED_FILE}")
print("\n" + "=" * 70)
print("🎉 ОБЪЕДИНЕНИЕ ЗАВЕРШЕНО!")
print("=" * 70)
print(f"\n📦 ИТОГО: {len(unique_parts)} уникальных товаров")
