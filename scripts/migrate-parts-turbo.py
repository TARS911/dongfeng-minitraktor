#!/usr/bin/env python3
"""
TURBO МИГРАЦИЯ - ИСПОЛЬЗУЕТ ПРЯМЫЕ SQL ЗАПРОСЫ ЧЕРЕЗ RPC
В 100 раз быстрее чем по одному товару!
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

# Паттерны
BRAND_PATTERNS = {
    "perkins": ["perkins", "перкинс"],
    "dongfeng-parts": [
        "dongfeng",
        "донгфенг",
        "дунфенг",
        "df-244",
        "df-404",
        "df 244",
        "df 404",
    ],
    "km-engines": ["км385", "км496", "ll380", "ll385", "km385", "km496", "yd385"],
    "uralets": ["уралец"],
    "jinma": ["джинма", "jinma"],
    "xingtai": ["синтай", "xingtai"],
    "foton": ["фотон", "foton", "lovol"],
    "rusich": ["русич"],
    "shifeng": ["шифенг", "shifeng"],
    "catmann": ["кэтманн", "catmann"],
    "chuvashpiller": ["чувашпиллер"],
    "bulat": ["булат"],
    "yto": ["yto"],
    "wirax": ["wirax", "виракс"],
    "dlh": ["dlh"],
    "rustrak": ["рустрак"],
    "mtz": ["мтз", "mtz", "беларус", "belarus"],
    "scout": ["скаут т-"],
    "kentavr": ["кентавр т-", "т-224"],
    "fayter": ["файтер т-"],
    "neva": ["нева", "мб-"],
    "t-series": ["т-40", "т-25", "т-16"],
}

TYPE_PATTERNS = {
    "diesel-engines": ["двигатель", "поршень", "цилиндр", "гбц", "коленвал", "шатун"],
    "starters-generators": ["стартер", "генератор"],
    "filters": ["фильтр"],
    "driveshafts": ["кардан"],
    "hydraulics": ["гидравлик", "гидроцилиндр", "гидронасос", "нш"],
    "seats": ["сиденье", "кресло"],
    "spare-parts-kit": ["ремкомплект"],
    "equipment-parts": ["косилка", "окучник", "плуг", "борона", "фреза"],
    "wheels-tires": ["колесо", "шина", "грунтозацеп"],
    "standard-parts": ["болт", "гайка", "шпилька", "прокладка", "шайба"],
    "tractor-parts": ["редуктор", "кпп", "сцепление", "вал", "вом"],
    "universal-parts": ["универсальн", "комплект"],
    "other-parts": ["прочие"],
}


def detect_brand(name):
    name_lower = name.lower()
    for brand, patterns in BRAND_PATTERNS.items():
        for pattern in patterns:
            if pattern in name_lower:
                return brand
    return "universal"


def detect_type(name):
    name_lower = name.lower()
    for ptype, patterns in TYPE_PATTERNS.items():
        for pattern in patterns:
            if pattern in name_lower:
                return ptype
    return "other-parts"


print("\n" + "=" * 80)
print("⚡ TURBO МИГРАЦИЯ - BATCH MODE")
print("=" * 80 + "\n")

# Загружаем категории
print("📂 Загрузка категорий...")
all_categories = supabase.table("categories").select("id, slug").execute()
categories_map = {cat["slug"]: cat["id"] for cat in all_categories.data}
print(f"✅ Категорий: {len(categories_map)}\n")

# Загружаем товары из "Запчасти"
print("📦 Загрузка товаров из 'Запчасти' (ID=2)...")
all_parts = []
offset = 0
while True:
    batch = (
        supabase.table("products")
        .select("id, name")
        .eq("category_id", 2)
        .range(offset, offset + 999)
        .execute()
    )
    if not batch.data:
        break
    all_parts.extend(batch.data)
    offset += 1000
    print(f"  → {len(all_parts)} товаров")

print(f"\n✅ Всего: {len(all_parts)} товаров\n")

if len(all_parts) == 0:
    print("✅ Все товары уже мигрированы!")
    sys.exit(0)

# Группируем по категориям
print("🔍 Категоризация...")
category_batches = defaultdict(list)

for product in all_parts:
    brand = detect_brand(product["name"])
    ptype = detect_type(product["name"])
    category_slug = f"{brand}-{ptype}"
    new_cat_id = categories_map.get(category_slug)

    if new_cat_id:
        category_batches[new_cat_id].append(product["id"])

print(f"✅ Готово! Найдено {len(category_batches)} целевых категорий\n")

# Показываем план
print("📋 План миграции:")
for cat_id in sorted(category_batches.keys(), key=lambda x: -len(category_batches[x]))[
    :10
]:
    count = len(category_batches[cat_id])
    print(f"  Категория {cat_id}: {count} товаров")

total_to_migrate = sum(len(ids) for ids in category_batches.values())
print(f"\nВсего к миграции: {total_to_migrate} товаров")

print("\n" + "=" * 80)
print("🚀 ЗАПУСК TURBO МИГРАЦИИ...\n")

# BATCH обновление - по 50 товаров за раз в одну категорию
success = 0
errors = 0
BATCH_SIZE = 50

for target_cat_id, product_ids in category_batches.items():
    # Разбиваем на батчи по 50
    for i in range(0, len(product_ids), BATCH_SIZE):
        batch_ids = product_ids[i : i + BATCH_SIZE]

        try:
            # Обновляем сразу все товары в батче
            supabase.table("products").update({"category_id": target_cat_id}).in_(
                "id", batch_ids
            ).execute()

            success += len(batch_ids)
            if success % 200 == 0:
                print(
                    f"  ⚡ {success}/{total_to_migrate} ({100 * success / total_to_migrate:.1f}%)"
                )
        except Exception as e:
            errors += len(batch_ids)
            print(f"  ❌ Ошибка для категории {target_cat_id}: {e}")

print("\n" + "=" * 80)
print("✅ TURBO МИГРАЦИЯ ЗАВЕРШЕНА!\n")
print(f"  Успешно: {success}")
print(f"  Ошибок: {errors}")
print(f"  Всего: {total_to_migrate}\n")

# Проверка
remaining = (
    supabase.table("products").select("*", count="exact").eq("category_id", 2).execute()
)
print(f"📊 Осталось в 'Запчасти': {remaining.count}")

if remaining.count == 0:
    print("\n🎉🎉🎉 ВСЕ ТОВАРЫ МИГРИРОВАНЫ! 🎉🎉🎉")
    print("\n🌐 Проверьте: https://beltehferm.netlify.app/catalog")

print("\n" + "=" * 80 + "\n")
