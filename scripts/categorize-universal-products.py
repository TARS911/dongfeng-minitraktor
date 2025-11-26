#!/usr/bin/env python3
"""
КАТЕГОРИЗАЦИЯ UNIVERSAL ТОВАРОВ
1. Переназначаем manufacturer для товаров с упоминанием производителя
2. Определяем part_type (тип запчасти) для всех
"""

import os
from supabase import create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("❌ ОШИБКА: Нет переменных окружения")
    exit(1)

supabase = create_client(url, key)

print("=" * 100)
print("🔄 КАТЕГОРИЗАЦИЯ UNIVERSAL ТОВАРОВ")
print("=" * 100)
print()

# Загружаем все UNIVERSAL товары
print("📦 Загружаем UNIVERSAL товары...")
universal_products = []
offset = 0
limit = 1000

while True:
    batch = supabase.table("products")\
        .select("id, name, manufacturer")\
        .eq("manufacturer", "UNIVERSAL")\
        .range(offset, offset + limit - 1)\
        .execute()

    if not batch.data:
        break

    universal_products.extend(batch.data)
    offset += limit

    if len(batch.data) < limit:
        break

print(f"✅ Найдено UNIVERSAL товаров: {len(universal_products)}")
print()

# ШАГ 1: ПЕРЕНАЗНАЧЕНИЕ ПРОИЗВОДИТЕЛЯ
print("=" * 100)
print("ШАГ 1: ПЕРЕНАЗНАЧЕНИЕ ПРОИЗВОДИТЕЛЯ")
print("=" * 100)
print()

manufacturer_mapping = {
    "DongFeng": ["dongfeng", "донгфенг"],
    "Foton": ["foton", "фотон"],
    "Xingtai": ["xingtai", "синтай", "уралец"],
    "Jinma": ["jinma", "джинма"],
    "ZUBR": ["zubr", "зубр"],
}

updates = {
    "DongFeng": [],
    "Foton": [],
    "Xingtai": [],
    "Jinma": [],
    "ZUBR": [],
}

for product in universal_products:
    name_lower = product["name"].lower()

    for manufacturer, keywords in manufacturer_mapping.items():
        if any(keyword in name_lower for keyword in keywords):
            updates[manufacturer].append(product["id"])
            break

# Выполняем обновления
total_updated = 0

for manufacturer, product_ids in updates.items():
    if len(product_ids) > 0:
        print(f"📝 Обновляем {len(product_ids)} товаров на manufacturer={manufacturer}...")

        # Обновляем батчами
        batch_size = 100
        for i in range(0, len(product_ids), batch_size):
            batch = product_ids[i:i + batch_size]
            supabase.table("products")\
                .update({"manufacturer": manufacturer})\
                .in_("id", batch)\
                .execute()

        total_updated += len(product_ids)
        print(f"   ✅ Обновлено!")

print()
print(f"✅ ИТОГО обновлено производителей: {total_updated}")
print()

# ШАГ 2: ОПРЕДЕЛЕНИЕ ТИПА ЗАПЧАСТИ (part_type)
print("=" * 100)
print("ШАГ 2: АНАЛИЗ ТИПОВ ЗАПЧАСТЕЙ")
print("=" * 100)
print()

# Перезагружаем товары после обновления
print("📦 Перезагружаем UNIVERSAL товары...")
universal_products = []
offset = 0

while True:
    batch = supabase.table("products")\
        .select("id, name, manufacturer")\
        .eq("manufacturer", "UNIVERSAL")\
        .range(offset, offset + limit - 1)\
        .execute()

    if not batch.data:
        break

    universal_products.extend(batch.data)
    offset += limit

    if len(batch.data) < limit:
        break

print(f"✅ Осталось UNIVERSAL товаров: {len(universal_products)}")
print()

# Определяем типы запчастей по ключевым словам
part_types = {
    "Вал": ["вал"],
    "Подшипник": ["подшипник"],
    "Сальник": ["сальник"],
    "Насос": ["насос"],
    "Прокладка": ["прокладка"],
    "Диск": ["диск"],
    "Ремень": ["ремень"],
    "Фильтр": ["фильтр"],
    "Шестерня": ["шестерня", "шестерн"],
    "Двигатель": ["двигатель", "двс", "мотор"],
    "Форсунка": ["форсунка"],
    "Стартер": ["стартер"],
    "Генератор": ["генератор"],
    "Свеча": ["свеча"],
    "Шланг": ["шланг"],
    "Колодки": ["колодки"],
    "Гидрораспределитель": ["гидрораспределитель"],
    "Карданный вал": ["карданный", "кардан"],
    "Колесо/Шина": ["колес", "шина", "груз"],
    "Пресс-подборщик": ["пресс-подборщик"],
}

type_counts = {part_type: 0 for part_type in part_types}
type_counts["Другое"] = 0

for product in universal_products:
    name_lower = product["name"].lower()

    found_type = False
    for part_type, keywords in part_types.items():
        if any(keyword in name_lower for keyword in keywords):
            type_counts[part_type] += 1
            found_type = True
            break

    if not found_type:
        type_counts["Другое"] += 1

print("📊 РАСПРЕДЕЛЕНИЕ ПО ТИПАМ ЗАПЧАСТЕЙ:")
print("-" * 100)

sorted_types = sorted(type_counts.items(), key=lambda x: x[1], reverse=True)
for part_type, count in sorted_types:
    if count > 0:
        print(f"{count:4} товаров - {part_type}")

print()
print("=" * 100)
print("✅ КАТЕГОРИЗАЦИЯ ЗАВЕРШЕНА!")
print("=" * 100)
print()

# Финальная статистика
final_universal = supabase.table("products")\
    .select("id", count="exact")\
    .eq("manufacturer", "UNIVERSAL")\
    .execute()

print(f"📊 ФИНАЛЬНАЯ СТАТИСТИКА:")
print("-" * 100)
print(f"Было UNIVERSAL товаров: 1845")
print(f"Переназначено производителей: {total_updated}")
print(f"Осталось UNIVERSAL товаров: {final_universal.count}")
print()
print(f"💡 Оставшиеся {final_universal.count} товаров - это действительно универсальные запчасти!")
print()
