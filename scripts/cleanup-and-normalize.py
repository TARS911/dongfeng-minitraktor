#!/usr/bin/env python3
"""
Очистка дубликатов и нормализация данных в Supabase
"""

import os
import sys
from collections import defaultdict

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv("frontend/.env.local")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Ошибка: Не найдены переменные окружения SUPABASE")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def find_duplicates():
    """Находит дубликаты по названию"""
    print("\n" + "=" * 70)
    print("ПОИСК ДУБЛИКАТОВ ПО НАЗВАНИЮ")
    print("=" * 70 + "\n")

    # Получаем все товары
    all_products = []
    page_size = 1000
    offset = 0

    print("📥 Загружаем все товары из БД...")
    while True:
        response = (
            supabase.table("products")
            .select("id, name, slug, manufacturer, price")
            .range(offset, offset + page_size - 1)
            .execute()
        )

        if not response.data:
            break

        all_products.extend(response.data)
        offset += page_size

        if len(response.data) < page_size:
            break

    print(f"✅ Загружено товаров: {len(all_products):,}\n")

    # Группируем по названию
    by_name = defaultdict(list)
    for product in all_products:
        name_lower = product["name"].lower().strip()
        by_name[name_lower].append(product)

    # Находим дубликаты
    duplicates = {name: items for name, items in by_name.items() if len(items) > 1}

    print(f"🔍 Найдено уникальных названий: {len(by_name):,}")
    print(f"⚠️  Найдено дубликатов: {len(duplicates):,}\n")

    if duplicates:
        print("📋 Топ-10 дубликатов:")
        print("-" * 70)
        for i, (name, items) in enumerate(
            sorted(duplicates.items(), key=lambda x: len(x[1]), reverse=True)[:10], 1
        ):
            print(f"{i:2}. {name[:50]:.<52} x{len(items)}")

    return duplicates


def remove_duplicates(duplicates, dry_run=True):
    """Удаляет дубликаты, оставляя самый дешевый товар"""
    print("\n" + "=" * 70)
    if dry_run:
        print("СИМУЛЯЦИЯ УДАЛЕНИЯ ДУБЛИКАТОВ (DRY RUN)")
    else:
        print("УДАЛЕНИЕ ДУБЛИКАТОВ")
    print("=" * 70 + "\n")

    total_to_remove = 0
    removed_count = 0

    for name, items in duplicates.items():
        # Сортируем по цене (самый дешевый первым)
        items_sorted = sorted(items, key=lambda x: x.get("price", 999999))

        # Оставляем первый (самый дешевый), удаляем остальные
        keep = items_sorted[0]
        to_remove = items_sorted[1:]

        total_to_remove += len(to_remove)

        if not dry_run:
            # Удаляем дубликаты
            for item in to_remove:
                try:
                    supabase.table("products").delete().eq("id", item["id"]).execute()
                    removed_count += 1
                except Exception as e:
                    print(f"❌ Ошибка удаления ID {item['id']}: {e}")

    if dry_run:
        print(f"📊 Будет удалено товаров: {total_to_remove:,}")
        print(f"📊 Останется уникальных: {len(duplicates):,}")
    else:
        print(f"✅ Удалено товаров: {removed_count:,}")

    print("\n" + "=" * 70 + "\n")


def normalize_brands():
    """Нормализует названия брендов (приводит к единому регистру)"""
    print("\n" + "=" * 70)
    print("НОРМАЛИЗАЦИЯ БРЕНДОВ")
    print("=" * 70 + "\n")

    # Маппинг для нормализации
    brand_mapping = {
        "dongfeng": "DONGFENG",
        "DongFeng": "DONGFENG",
        "foton": "FOTON",
        "Foton": "FOTON",
        "lovol": "FOTON",
        "Lovol": "FOTON",
        "jinma": "JINMA",
        "Jinma": "JINMA",
        "джинма": "JINMA",
        "xingtai": "XINGTAI",
        "Xingtai": "XINGTAI",
        "синтай": "XINGTAI",
        "xingtai/уралец": "XINGTAI",
        "XINGTAI/УРАЛЕЦ": "XINGTAI",
        "уралец": "XINGTAI",
        "universal": "UNIVERSAL",
        "Universal": "UNIVERSAL",
    }

    print("🔄 Маппинг брендов:")
    for old, new in sorted(brand_mapping.items()):
        print(f"  {old:.<25} → {new}")

    # Получаем все товары с брендами для нормализации
    all_products = []
    page_size = 1000
    offset = 0

    print("\n📥 Загружаем товары...")
    while True:
        response = (
            supabase.table("products")
            .select("id, manufacturer")
            .range(offset, offset + page_size - 1)
            .execute()
        )

        if not response.data:
            break

        all_products.extend(response.data)
        offset += page_size

        if len(response.data) < page_size:
            break

    print(f"✅ Загружено товаров: {len(all_products):,}\n")

    # Нормализуем бренды
    to_update = []
    for product in all_products:
        old_brand = product.get("manufacturer", "")
        if old_brand in brand_mapping:
            new_brand = brand_mapping[old_brand]
            if old_brand != new_brand:
                to_update.append(
                    {"id": product["id"], "old": old_brand, "new": new_brand}
                )

    print(f"📊 Товаров для обновления: {len(to_update):,}\n")

    if to_update:
        print("Обновляем бренды пакетами...")
        batch_size = 100
        updated = 0

        for i in range(0, len(to_update), batch_size):
            batch = to_update[i : i + batch_size]

            for item in batch:
                try:
                    supabase.table("products").update(
                        {"manufacturer": item["new"]}
                    ).eq("id", item["id"]).execute()
                    updated += 1
                except Exception as e:
                    print(f"❌ Ошибка обновления ID {item['id']}: {e}")

            print(f"✅ Обновлено {updated}/{len(to_update)}")

        print(f"\n✅ Всего обновлено: {updated:,}")

    print("\n" + "=" * 70 + "\n")


def fix_part_types():
    """Определяет part_type для товаров с unknown"""
    print("\n" + "=" * 70)
    print("ОПРЕДЕЛЕНИЕ ТИПОВ ЗАПЧАСТЕЙ")
    print("=" * 70 + "\n")

    # Ключевые слова для определения типа
    type_keywords = {
        "filters": ["фильтр", "filter"],
        "engines": ["двигател", "мотор", "engine", "поршн", "цилиндр", "коленвал"],
        "hydraulics": ["гидравлик", "насос гидравлик", "hydraul", "гур"],
        "transmission": ["кпп", "коробка передач", "сцепление", "clutch"],
        "fuel-system": ["топлив", "fuel", "форсунк", "бак топлив"],
        "pumps": ["насос", "pump"],
        "electrical": ["генератор", "стартер", "аккумулятор", "проводка", "свеча"],
        "cooling": ["радиатор", "охлаждени", "cooling"],
        "brake": ["тормоз", "brake"],
        "steering": ["рулев", "steering"],
    }

    # Получаем товары с unknown part_type
    all_products = []
    page_size = 1000
    offset = 0

    print("📥 Загружаем товары с unknown part_type...")
    while True:
        response = (
            supabase.table("products")
            .select("id, name, specifications")
            .range(offset, offset + page_size - 1)
            .execute()
        )

        if not response.data:
            break

        for product in response.data:
            part_type = product.get("specifications", {}).get("part_type", "unknown")
            if part_type == "unknown":
                all_products.append(product)

        offset += page_size

        if len(response.data) < page_size:
            break

    print(f"✅ Найдено товаров с unknown: {len(all_products):,}\n")

    # Определяем типы
    to_update = []
    for product in all_products:
        name_lower = product["name"].lower()
        detected_type = "parts"  # По умолчанию

        for ptype, keywords in type_keywords.items():
            for keyword in keywords:
                if keyword in name_lower:
                    detected_type = ptype
                    break
            if detected_type != "parts":
                break

        if detected_type != "parts":
            specs = product.get("specifications", {})
            specs["part_type"] = detected_type
            to_update.append({"id": product["id"], "type": detected_type, "specs": specs})

    print(f"📊 Товаров для обновления: {len(to_update):,}\n")

    # Статистика по типам
    type_counts = defaultdict(int)
    for item in to_update:
        type_counts[item["type"]] += 1

    print("📊 Распределение по типам:")
    for ptype, count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {ptype:.<25} {count:>6,}")

    # Обновляем
    if to_update:
        print("\n🔄 Обновляем типы запчастей...")
        batch_size = 100
        updated = 0

        for i in range(0, len(to_update), batch_size):
            batch = to_update[i : i + batch_size]

            for item in batch:
                try:
                    supabase.table("products").update(
                        {"specifications": item["specs"]}
                    ).eq("id", item["id"]).execute()
                    updated += 1
                except Exception as e:
                    print(f"❌ Ошибка обновления ID {item['id']}: {e}")

            if (i // batch_size) % 10 == 0:
                print(f"✅ Обновлено {updated}/{len(to_update)}")

        print(f"\n✅ Всего обновлено: {updated:,}")

    print("\n" + "=" * 70 + "\n")


def main():
    """Главная функция"""
    print("\n" + "=" * 70)
    print("ОЧИСТКА И НОРМАЛИЗАЦИЯ ДАННЫХ SUPABASE")
    print("=" * 70 + "\n")

    print("Выберите действие:")
    print("1. Найти дубликаты")
    print("2. Удалить дубликаты (DRY RUN)")
    print("3. Удалить дубликаты (РЕАЛЬНО)")
    print("4. Нормализовать бренды")
    print("5. Определить типы запчастей")
    print("6. Выполнить всё (кроме удаления дубликатов)")
    print("0. Выход")

    choice = input("\nВведите номер: ").strip()

    if choice == "1":
        find_duplicates()
    elif choice == "2":
        duplicates = find_duplicates()
        remove_duplicates(duplicates, dry_run=True)
    elif choice == "3":
        duplicates = find_duplicates()
        confirm = input("\n⚠️  УДАЛИТЬ ДУБЛИКАТЫ? (yes/no): ").strip().lower()
        if confirm == "yes":
            remove_duplicates(duplicates, dry_run=False)
        else:
            print("❌ Отменено")
    elif choice == "4":
        normalize_brands()
    elif choice == "5":
        fix_part_types()
    elif choice == "6":
        normalize_brands()
        fix_part_types()
        print("\n✅ Все операции выполнены!")
    elif choice == "0":
        print("👋 До свидания!")
    else:
        print("❌ Неверный выбор")


if __name__ == "__main__":
    main()
