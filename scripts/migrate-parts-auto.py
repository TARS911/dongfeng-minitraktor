#!/usr/bin/env python3
"""
АВТОМАТИЧЕСКАЯ МИГРАЦИЯ ЗАПЧАСТЕЙ (БЕЗ ПОДТВЕРЖДЕНИЯ)
"""

import os
import sys
from collections import defaultdict

from supabase import Client, create_client

# Получаем переменные окружения
url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("❌ ОШИБКА: Установите переменные окружения")
    sys.exit(1)

supabase: Client = create_client(url, key)

# Паттерны брендов
BRAND_PATTERNS = {
    "perkins": ["perkins", "перкинс"],
    "dongfeng-parts": [
        "dongfeng",
        "донгфенг",
        "дунфенг",
        "dong feng",
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
    "scout": ["скаут т-", "scout t-"],
    "kentavr": ["кентавр т-", "т-224"],
    "fayter": ["файтер т-"],
    "neva": ["нева", "мб-", "мб "],
    "t-series": ["т-40", "т-25", "т-16"],
}

TYPE_PATTERNS = {
    "diesel-engines": [
        "двигатель",
        "двигателя",
        "поршень",
        "цилиндр",
        "гбц",
        "головка блока",
        "коленвал",
        "шатун",
        "маховик",
    ],
    "starters-generators": ["стартер", "генератор"],
    "filters": ["фильтр"],
    "driveshafts": ["кардан"],
    "hydraulics": ["гидравлик", "гидроцилиндр", "гидронасос", "нш-", "нш "],
    "seats": ["сиденье", "кресло"],
    "spare-parts-kit": ["зип", "ремкомплект"],
    "equipment-parts": [
        "картофелекопалка",
        "косилка",
        "окучник",
        "плуг",
        "борона",
        "фреза",
        "снегоуборщик",
        "прицеп",
    ],
    "wheels-tires": ["колесо", "колёс", "шина", "грунтозацеп"],
    "standard-parts": [
        "болт",
        "гайка",
        "шпилька",
        "прокладка",
        "кольцо",
        "шайба",
        "пружина",
    ],
    "tractor-parts": ["редуктор", "кпп", "сцепление", "вал", "вом", "тормоз"],
    "universal-parts": ["универсальн", "комплект"],
    "other-parts": ["прочие", "навесное", "крепление", "кабина", "крыло", "зеркало"],
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
print("🚀 АВТОМАТИЧЕСКАЯ МИГРАЦИЯ ЗАПЧАСТЕЙ")
print("=" * 80 + "\n")

# Загружаем категории
print("📂 Загрузка категорий...")
all_categories = supabase.table("categories").select("id, name, slug").execute()
categories_map = {cat["slug"]: cat["id"] for cat in all_categories.data}
print(f"✅ Категорий: {len(categories_map)}\n")

# Находим категорию "Запчасти"
parts_cat = None
for cat in all_categories.data:
    if cat["slug"] == "parts":
        parts_cat = cat
        break

if not parts_cat:
    print("❌ Категория 'Запчасти' не найдена!")
    sys.exit(1)

parts_cat_id = parts_cat["id"]
print(f"✅ Категория 'Запчасти': ID={parts_cat_id}\n")

# Загружаем товары
print("📦 Загрузка товаров...")
all_parts = []
offset = 0
while True:
    batch = (
        supabase.table("products")
        .select("id, name, category_id")
        .eq("category_id", parts_cat_id)
        .range(offset, offset + 999)
        .execute()
    )
    if not batch.data:
        break
    all_parts.extend(batch.data)
    offset += 1000
    print(f"  → {len(all_parts)} товаров")

print(f"\n✅ Всего товаров: {len(all_parts)}\n")
print("=" * 80)

if len(all_parts) == 0:
    print("\n✅ Все товары уже мигрированы!")
    sys.exit(0)

# Анализируем
print("\n🔍 Категоризация...\n")
migration_plan = []
stats = defaultdict(int)

for product in all_parts:
    brand = detect_brand(product["name"])
    ptype = detect_type(product["name"])
    category_slug = f"{brand}-{ptype}"
    new_cat_id = categories_map.get(category_slug)

    if new_cat_id:
        migration_plan.append(
            {
                "product_id": product["id"],
                "new_category": new_cat_id,
                "slug": category_slug,
            }
        )
        stats[category_slug] += 1

print(f"✅ К миграции: {len(migration_plan)} товаров")
print(f"📊 Категорий: {len(stats)}\n")

# Топ 10
print("📋 Топ 10 категорий:")
for slug, count in sorted(stats.items(), key=lambda x: -x[1])[:10]:
    print(f"  {slug:40} → {count:4} товаров")

print("\n" + "=" * 80)
print("\n🚀 ЗАПУСК МИГРАЦИИ...\n")

# Миграция
success = 0
errors = 0

for i, item in enumerate(migration_plan, 1):
    try:
        supabase.table("products").update({"category_id": item["new_category"]}).eq(
            "id", item["product_id"]
        ).execute()
        success += 1
        if success % 100 == 0:
            print(
                f"  ⏳ {success}/{len(migration_plan)} ({100 * success / len(migration_plan):.1f}%)"
            )
    except Exception as e:
        errors += 1
        if errors < 10:
            print(f"  ❌ Ошибка ID={item['product_id']}: {e}")

print("\n" + "=" * 80)
print("\n✅ МИГРАЦИЯ ЗАВЕРШЕНА!\n")
print(f"  Успешно: {success}")
print(f"  Ошибок: {errors}")
print(f"  Всего: {len(migration_plan)}\n")

# Проверка
remaining = (
    supabase.table("products")
    .select("*", count="exact")
    .eq("category_id", parts_cat_id)
    .execute()
)
print(f"📊 Осталось в 'Запчасти': {remaining.count}")
print("\n" + "=" * 80)
print("\n🎉 Готово! Проверьте: https://beltehferm.netlify.app/catalog")
print("=" * 80 + "\n")
