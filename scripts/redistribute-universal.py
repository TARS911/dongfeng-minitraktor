#!/usr/bin/env python3
"""
ПЕРЕСОРТИРОВКА КАТЕГОРИИ UNIVERSAL
Переносит товары с упоминанием брендов из universal-* в соответствующие бренд-*
"""

import os
import sys
from collections import defaultdict

from supabase import Client, create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("❌ ОШИБКА: Установите переменные окружения")
    sys.exit(1)

supabase: Client = create_client(url, key)

# УЛУЧШЕННЫЕ ПАТТЕРНЫ БРЕНДОВ (более строгие)
BRAND_PATTERNS = {
    "km-engines": ["км385", "км496", "km385", "km496", "ll380", "ll385", "yd385"],
    "dongfeng": [
        "dongfeng",
        "донгфенг",
        "дунфенг",
        "df-244",
        "df-404",
        "df 244",
        "df 404",
        "df244",
        "df404",
    ],
    "uralets": ["уралец"],
    "jinma": ["джинма", "jinma"],
    "xingtai": ["синтай", "xingtai"],
    "foton": ["фотон", "foton", "lovol"],
    "rusich": ["русич"],
    "shifeng": ["шифенг", "shifeng"],
    "mtz": ["мтз", "беларус", "belarus"],
    "yto": ["yto"],
    "dlh": ["dlh"],
    "perkins": ["perkins", "перкинс"],
    "wirax": ["wirax", "виракс"],
    "scout": ["скаут т-", "scout t-"],
    "neva": ["нева", "мб-"],
    "bulat": ["булат"],
    "kentavr": ["кентавр"],
    "fayter": ["файтер"],
    "catmann": ["кэтманн", "catmann"],
}


def detect_brand_strict(name: str) -> str:
    """Определяет бренд СТРОГО (только если явное упоминание)"""
    name_lower = name.lower()

    for brand_key, patterns in BRAND_PATTERNS.items():
        for pattern in patterns:
            if pattern in name_lower:
                return brand_key

    return "universal"  # Остаётся universal если бренд не найден


def extract_type_from_slug(slug: str) -> str:
    """Извлекает тип из slug (universal-diesel-engines → diesel-engines)"""
    if "-" in slug:
        parts = slug.split("-")
        if len(parts) > 1:
            return "-".join(parts[1:])  # Всё после 'universal-'
    return "other-parts"


print("\n" + "=" * 100)
print("🔄 ПЕРЕСОРТИРОВКА UNIVERSAL КАТЕГОРИИ")
print("=" * 100 + "\n")

# Загружаем все категории
print("📂 Загрузка категорий...")
all_categories = supabase.table("categories").select("id, slug").execute()
categories_map = {cat["slug"]: cat["id"] for cat in all_categories.data}
print(f"✅ Категорий: {len(categories_map)}\n")

# Находим все universal категории
universal_cats = [cat for cat in all_categories.data if "universal" in cat["slug"]]
print(f"📦 Universal категорий: {len(universal_cats)}\n")

# Загружаем ВСЕ товары из universal
print("📦 Загрузка товаров из Universal...")
all_universal = []

for cat in universal_cats:
    offset = 0
    while True:
        batch = (
            supabase.table("products")
            .select("id, name, category_id")
            .eq("category_id", cat["id"])
            .range(offset, offset + 999)
            .execute()
        )
        if not batch.data:
            break
        all_universal.extend(batch.data)
        offset += 1000
        if len(batch.data) < 1000:
            break

print(f"✅ Загружено: {len(all_universal)} товаров\n")
print("=" * 100)

# Анализируем каждый товар
print("\n🔍 Анализ товаров...\n")

redistribution_plan = []
stats = defaultdict(int)

for product in all_universal:
    # Определяем реальный бренд
    real_brand = detect_brand_strict(product["name"])

    if real_brand != "universal":
        # Товар нужно перенести!

        # Получаем текущую категорию для определения типа
        current_cat = next(
            (c for c in all_categories.data if c["id"] == product["category_id"]), None
        )
        if not current_cat:
            continue

        # Извлекаем тип из текущего slug
        part_type = extract_type_from_slug(current_cat["slug"])

        # Формируем новый slug
        new_slug = f"{real_brand}-{part_type}"

        # Проверяем существование целевой категории
        new_cat_id = categories_map.get(new_slug)

        if new_cat_id:
            redistribution_plan.append(
                {
                    "product_id": product["id"],
                    "product_name": product["name"],
                    "old_category": product["category_id"],
                    "new_category": new_cat_id,
                    "old_slug": current_cat["slug"],
                    "new_slug": new_slug,
                    "brand": real_brand,
                    "type": part_type,
                }
            )
            stats[real_brand] += 1

print(f"✅ Анализ завершён!")
print(f"📊 Товаров к переносу: {len(redistribution_plan)}")
print(f"📊 Останется в Universal: {len(all_universal) - len(redistribution_plan)}\n")

# Показываем статистику
print("📊 ПЛАН ПЕРЕНОСА ПО БРЕНДАМ:\n")
print("   Бренд                  Товаров")
print("   " + "-" * 45)

for brand, count in sorted(stats.items(), key=lambda x: -x[1]):
    print(f"   {brand:<25} {count:>8}")

print("   " + "-" * 45)
print(f"   ИТОГО:                 {len(redistribution_plan):>8}\n")

# Показываем примеры
print("📋 ПРИМЕРЫ ПЕРЕНОСОВ (первые 10):\n")
for i, item in enumerate(redistribution_plan[:10], 1):
    print(f"{i:2}. {item['product_name'][:70]}")
    print(f"    {item['old_slug']} → {item['new_slug']}")
    print()

# Подтверждение
print("=" * 100)
response = input("\n🚀 Начать пересортировку? (yes/no): ")

if response.lower() != "yes":
    print("\n❌ Пересортировка отменена")
    sys.exit(0)

# Выполняем перенос
print("\n🚀 Начинаем пересортировку...")
print("=" * 100 + "\n")

success = 0
errors = 0
BATCH_SIZE = 50

# Группируем по целевым категориям для batch обновления
batches_by_category = defaultdict(list)
for item in redistribution_plan:
    batches_by_category[item["new_category"]].append(item["product_id"])

# Batch обновление
for target_cat_id, product_ids in batches_by_category.items():
    for i in range(0, len(product_ids), BATCH_SIZE):
        batch_ids = product_ids[i : i + BATCH_SIZE]

        try:
            supabase.table("products").update({"category_id": target_cat_id}).in_(
                "id", batch_ids
            ).execute()

            success += len(batch_ids)

            if success % 100 == 0:
                progress = (success / len(redistribution_plan)) * 100
                print(f"  ⏳ {success}/{len(redistribution_plan)} ({progress:.1f}%)")

        except Exception as e:
            errors += len(batch_ids)
            print(f"  ❌ Ошибка для категории {target_cat_id}: {e}")

print("\n" + "=" * 100)
print("\n✅ ПЕРЕСОРТИРОВКА ЗАВЕРШЕНА!\n")
print(f"  Успешно: {success}")
print(f"  Ошибок: {errors}")
print(f"  Всего: {len(redistribution_plan)}\n")

# Проверка результатов
print("📊 Проверка результатов...\n")

# Считаем сколько осталось в Universal
remaining_universal = 0
for cat in universal_cats:
    count = (
        supabase.table("products")
        .select("*", count="exact")
        .eq("category_id", cat["id"])
        .execute()
    )
    remaining_universal += count.count

print(f"   Было в Universal: {len(all_universal)}")
print(f"   Перенесено: {success}")
print(f"   Осталось: {remaining_universal}")
print(f"   Ожидалось остаться: {len(all_universal) - len(redistribution_plan)}")

if remaining_universal == len(all_universal) - len(redistribution_plan):
    print("\n   ✅ Числа сходятся! Пересортировка прошла корректно.")
else:
    print(
        f"\n   ⚠️  Расхождение: {abs(remaining_universal - (len(all_universal) - len(redistribution_plan)))} товаров"
    )

print("\n" + "=" * 100)
print("\n🎉 Готово! Проверьте: https://beltehferm.netlify.app/catalog/parts")
print("=" * 100 + "\n")
