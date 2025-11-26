#!/usr/bin/env python3
"""
ПЕРЕМЕСТИТЬ двигатели в категорию "ДВС в Сборе" (category_id=302)
НЕ добавляем новые, а обновляем существующие!
"""

import os
import json
from supabase import create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("❌ ОШИБКА: Нет переменных окружения")
    exit(1)

supabase = create_client(url, key)

# Читаем файл с двигателями
json_file = "parsed_data/zip-agro/zip-agro-dvigateli-dlya-minitraktorov.json"

with open(json_file, "r", encoding="utf-8") as f:
    engines = json.load(f)

print("=" * 80)
print(f"🔧 ПЕРЕМЕЩЕНИЕ ДВИГАТЕЛЕЙ В КАТЕГОРИЮ 'ДВС В СБОРЕ'")
print("=" * 80)
print()

# Проверяем категорию
cat = supabase.table("categories").select("id, name").eq("slug", "engines-assembled").maybe_single().execute()

if not cat.data:
    print("❌ Категория engines-assembled НЕ НАЙДЕНА!")
    exit(1)

category_id = cat.data["id"]
print(f"✅ Целевая категория: {cat.data['name']} (ID={category_id})")
print()

# Проверяем сколько товаров уже в категории
current_count = supabase.table("products").select("id", count="exact").eq("category_id", category_id).execute()
print(f"📦 Товаров в категории СЕЙЧАС: {current_count.count}")
print()

# Ищем и перемещаем двигатели
moved = 0
not_found = 0
already_there = 0

for i, engine in enumerate(engines, 1):
    title = engine["title"]

    print(f"{i}. {title}")

    # Ищем товар в БД по точному названию
    result = supabase.table("products").select("id, name, category_id").eq("name", title).execute()

    if not result.data or len(result.data) == 0:
        print(f"   ❌ НЕ НАЙДЕН в БД")
        not_found += 1
    else:
        product = result.data[0]
        product_id = product["id"]
        current_cat_id = product["category_id"]

        if current_cat_id == category_id:
            print(f"   ✅ УЖЕ В НУЖНОЙ КАТЕГОРИИ (ID={product_id})")
            already_there += 1
        else:
            # Обновляем category_id
            update_result = supabase.table("products").update({"category_id": category_id}).eq("id", product_id).execute()

            if update_result.data:
                print(f"   🔄 ПЕРЕМЕЩЁН: {current_cat_id} → {category_id} (ID={product_id})")
                moved += 1
            else:
                print(f"   ❌ ОШИБКА при перемещении (ID={product_id})")

    print()

print("=" * 80)
print("📊 РЕЗУЛЬТАТ:")
print("=" * 80)
print(f"🔄 Перемещено: {moved}")
print(f"✅ Уже было в категории: {already_there}")
print(f"❌ Не найдено в БД: {not_found}")
print(f"📦 Всего обработано: {len(engines)}")
print()

# Финальная проверка
final_count = supabase.table("products").select("id", count="exact").eq("category_id", category_id).execute()
print(f"🔍 Итого товаров в категории 'ДВС в Сборе': {final_count.count}")
print()
print("=" * 80)
print("✅ ГОТОВО!")
print("=" * 80)
