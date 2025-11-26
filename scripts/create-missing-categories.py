#!/usr/bin/env python3
"""
Создание недостающих категорий в таблице categories
"""

import os
from supabase import Client, create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

print("=" * 80)
print("📁 СОЗДАНИЕ НЕДОСТАЮЩИХ КАТЕГОРИЙ")
print("=" * 80 + "\n")

# Новые категории для добавления
NEW_CATEGORIES = [
    # Основные системы
    {"slug": "parts-transmission", "name": "Трансмиссия"},
    {"slug": "parts-cooling", "name": "Система охлаждения"},
    {"slug": "parts-electrical", "name": "Электрика"},
    {"slug": "parts-driveshaft", "name": "Карданные валы"},
    {"slug": "parts-brakes", "name": "Тормозная система"},
    {"slug": "parts-steering", "name": "Рулевое управление"},
    {"slug": "parts-chassis", "name": "Ходовая часть"},
    {"slug": "parts-wheels-tires", "name": "Колёса и шины"},
    {"slug": "parts-belts", "name": "Ремни"},

    # Навесное оборудование - детализация
    {"slug": "parts-attachments-mowers", "name": "Косилки"},
    {"slug": "parts-attachments-tillers", "name": "Почвофрезы"},
    {"slug": "parts-attachments-balers", "name": "Пресс-подборщики"},
    {"slug": "parts-attachments-plows", "name": "Плуги"},
    {"slug": "parts-attachments-harrows", "name": "Бороны"},
    {"slug": "parts-attachments-cultivators", "name": "Культиваторы"},
    {"slug": "parts-attachments-potato", "name": "Картофелекопалки и сажалки"},
    {"slug": "parts-attachments-rakes", "name": "Грабли-ворошилки"},
]

# Получаем существующие категории
existing_result = supabase.table("categories").select("slug").execute()
existing_slugs = {cat["slug"] for cat in existing_result.data}

print(f"📋 Существующих категорий: {len(existing_slugs)}\n")

created = 0
skipped = 0

for category in NEW_CATEGORIES:
    slug = category["slug"]

    if slug in existing_slugs:
        print(f"⏭️  {slug:45} (уже существует)")
        skipped += 1
        continue

    try:
        # Создаем новую категорию
        result = supabase.table("categories").insert({
            "slug": slug,
            "name": category["name"]
        }).execute()

        print(f"✅ {slug:45} → {category['name']}")
        created += 1

    except Exception as e:
        print(f"❌ {slug:45} (ошибка: {str(e)[:50]})")

print("\n" + "=" * 80)
print("📊 РЕЗУЛЬТАТ:")
print("=" * 80)
print(f"✅ Создано:   {created:>3} категорий")
print(f"⏭️  Пропущено: {skipped:>3} категорий")
print("=" * 80)

# Проверяем финальное количество
final_result = supabase.table("categories").select("id", count="exact").execute()
print(f"\n📁 Всего категорий в базе: {final_result.count}")
print("=" * 80)
