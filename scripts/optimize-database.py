#!/usr/bin/env python3
"""
ПОЛНАЯ ОПТИМИЗАЦИЯ БАЗЫ ДАННЫХ:
1. Удаление дубликатов
2. Нормализация брендов
3. Определение типов запчастей
4. Применение индексов (через SQL файл)
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


def main():
    """Главная функция - выполняет все оптимизации"""
    print("\n" + "=" * 70)
    print("ПОЛНАЯ ОПТИМИЗАЦИЯ БАЗЫ ДАННЫХ SUPABASE")
    print("=" * 70 + "\n")

    # Шаг 1: Удаление дубликатов
    print("📋 ШАГ 1: УДАЛЕНИЕ ДУБЛИКАТОВ")
    print("-" * 70)

    confirm = input("\n⚠️  Удалить дубликаты? (yes/no): ").strip().lower()
    if confirm == "yes":
        remove_duplicates()
    else:
        print("⏭️  Пропущено\n")

    # Шаг 2: Нормализация брендов
    print("\n📋 ШАГ 2: НОРМАЛИЗАЦИЯ БРЕНДОВ")
    print("-" * 70)
    normalize_brands()

    # Шаг 3: Определение типов запчастей
    print("\n📋 ШАГ 3: ОПРЕДЕЛЕНИЕ ТИПОВ ЗАПЧАСТЕЙ")
    print("-" * 70)
    fix_part_types()

    # Шаг 4: Инструкции по индексам
    print("\n📋 ШАГ 4: СОЗДАНИЕ ИНДЕКСОВ")
    print("-" * 70)
    print_index_instructions()

    print("\n" + "=" * 70)
    print("✅ ОПТИМИЗАЦИЯ ЗАВЕРШЕНА!")
    print("=" * 70 + "\n")


def remove_duplicates():
    """Удаляет дубликаты, оставляя самый дешевый товар"""
    print("\n🔍 Поиск дубликатов...")

    # Получаем все товары
    all_products = []
    page_size = 1000
    offset = 0

    while True:
        response = (
            supabase.table("products")
            .select("id, name, price")
            .range(offset, offset + page_size - 1)
            .execute()
        )

        if not response.data:
            break

        all_products.extend(response.data)
        offset += page_size

        if len(response.data) < page_size:
            break

    # Группируем по названию
    by_name = defaultdict(list)
    for product in all_products:
        name_lower = product["name"].lower().strip()
        by_name[name_lower].append(product)

    # Находим дубликаты
    duplicates = {name: items for name, items in by_name.items() if len(items) > 1}

    print(f"⚠️  Найдено дубликатов: {len(duplicates)}")

    if not duplicates:
        print("✅ Дубликатов не найдено!")
        return

    # Удаляем дубликаты
    removed_count = 0
    total_to_remove = sum(len(items) - 1 for items in duplicates.values())

    print(f"🗑️  Будет удалено записей: {total_to_remove}")

    for name, items in duplicates.items():
        # Сортируем по цене (самый дешевый первым)
        items_sorted = sorted(items, key=lambda x: x.get("price", 999999))

        # Удаляем все кроме первого
        to_remove = items_sorted[1:]

        for item in to_remove:
            try:
                supabase.table("products").delete().eq("id", item["id"]).execute()
                removed_count += 1

                if removed_count % 100 == 0:
                    print(f"  ✅ Удалено {removed_count}/{total_to_remove}")

            except Exception as e:
                print(f"  ❌ Ошибка удаления ID {item['id']}: {e}")

    print(f"\n✅ Удалено дубликатов: {removed_count}")


def normalize_brands():
    """Нормализует названия брендов"""
    print("\n🔄 Нормализация брендов...")

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

    # Получаем товары для обновления
    all_products = []
    page_size = 1000
    offset = 0

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

    # Нормализуем
    to_update = []
    for product in all_products:
        old_brand = product.get("manufacturer", "")
        if old_brand in brand_mapping:
            new_brand = brand_mapping[old_brand]
            if old_brand != new_brand:
                to_update.append({"id": product["id"], "new": new_brand})

    if not to_update:
        print("✅ Все бренды уже нормализованы!")
        return

    print(f"🔄 Обновляем {len(to_update)} товаров...")

    updated = 0
    for item in to_update:
        try:
            supabase.table("products").update({"manufacturer": item["new"]}).eq(
                "id", item["id"]
            ).execute()
            updated += 1

            if updated % 100 == 0:
                print(f"  ✅ Обновлено {updated}/{len(to_update)}")

        except Exception as e:
            print(f"  ❌ Ошибка обновления ID {item['id']}: {e}")

    print(f"\n✅ Обновлено брендов: {updated}")


def fix_part_types():
    """Определяет part_type для товаров с unknown"""
    print("\n🔍 Определение типов запчастей...")

    type_keywords = {
        "filters": ["фильтр", "filter"],
        "engines": ["двигател", "мотор", "engine", "поршн", "цилиндр", "коленвал"],
        "hydraulics": ["гидравлик", "насос гидравлик", "hydraul", "гур"],
        "transmission": ["кпп", "коробка передач", "сцепление", "clutch", "вал карданный"],
        "fuel-system": ["топлив", "fuel", "форсунк", "бак топлив"],
        "pumps": ["насос", "pump"],
        "electrical": ["генератор", "стартер", "аккумулятор", "проводка", "свеча"],
        "cooling": ["радиатор", "охлаждени", "cooling"],
        "brake": ["тормоз", "brake"],
        "steering": ["рулев", "steering"],
    }

    # Получаем товары с unknown
    all_products = []
    page_size = 1000
    offset = 0

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
            if part_type == "unknown" or not part_type:
                all_products.append(product)

        offset += page_size

        if len(response.data) < page_size:
            break

    if not all_products:
        print("✅ Все типы уже определены!")
        return

    print(f"🔍 Найдено товаров с неопределенным типом: {len(all_products)}")

    # Определяем типы
    to_update = []
    for product in all_products:
        name_lower = product["name"].lower()
        detected_type = "parts"

        for ptype, keywords in type_keywords.items():
            for keyword in keywords:
                if keyword in name_lower:
                    detected_type = ptype
                    break
            if detected_type != "parts":
                break

        if detected_type != "parts":
            specs = product.get("specifications", {}) or {}
            specs["part_type"] = detected_type
            to_update.append({"id": product["id"], "specs": specs})

    if not to_update:
        print("✅ Нечего обновлять!")
        return

    print(f"🔄 Обновляем {len(to_update)} товаров...")

    updated = 0
    for item in to_update:
        try:
            supabase.table("products").update({"specifications": item["specs"]}).eq(
                "id", item["id"]
            ).execute()
            updated += 1

            if updated % 100 == 0:
                print(f"  ✅ Обновлено {updated}/{len(to_update)}")

        except Exception as e:
            print(f"  ❌ Ошибка обновления ID {item['id']}: {e}")

    print(f"\n✅ Обновлено типов: {updated}")


def print_index_instructions():
    """Выводит инструкции по созданию индексов"""
    print("\n📝 СОЗДАНИЕ ИНДЕКСОВ:")
    print("\nВыполните в Supabase Dashboard → SQL Editor:\n")

    sql_file = "scripts/create-indexes.sql"

    if os.path.exists(sql_file):
        with open(sql_file, "r", encoding="utf-8") as f:
            content = f.read()

        # Извлекаем только CREATE INDEX команды
        lines = content.split("\n")
        for line in lines:
            if line.strip().startswith("CREATE INDEX") or line.strip().startswith(
                "CREATE MATERIALIZED"
            ):
                print(f"  {line}")

        print(f"\n💡 Полный SQL доступен в файле: {sql_file}")
        print(
            f"   Скопируйте содержимое файла и выполните в Supabase SQL Editor\n"
        )
    else:
        print(f"  ⚠️  Файл {sql_file} не найден!")


if __name__ == "__main__":
    main()
