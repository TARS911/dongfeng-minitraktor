#!/usr/bin/env python3
"""
ЭКСПОРТ UNIVERSAL ТОВАРОВ В CSV
Выгружает все товары из Universal категорий в CSV для ручной обработки
"""

import csv
import os

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("🔍 Загружаю товары из Universal категорий...")

categories = (
    supabase.table("categories")
    .select("id, name, slug")
    .like("slug", "universal-%")
    .execute()
)
cat_dict = {cat["id"]: cat for cat in categories.data}
universal_cat_ids = [cat["id"] for cat in categories.data]

print(f"📦 Найдено {len(universal_cat_ids)} Universal категорий")

# Получаем все товары из Universal (без лимита)
all_products = []
offset = 0
batch_size = 1000

while True:
    products = (
        supabase.table("products")
        .select("*")
        .in_("category_id", universal_cat_ids)
        .range(offset, offset + batch_size - 1)
        .execute()
    )

    if not products.data:
        break

    all_products.extend(products.data)
    offset += batch_size
    print(f"  Загружено: {len(all_products)} товаров...")

    if len(products.data) < batch_size:
        break

print(f"📊 Всего загружено: {len(all_products)} товаров")

# Создаём CSV файл
csv_file = "/home/ibm/dongfeng-minitraktor/UNIVERSAL_PRODUCTS.csv"

with open(csv_file, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f, delimiter=";")

    # Заголовки
    writer.writerow(
        [
            "ID",
            "Название товара",
            "Цена",
            "Старая цена",
            "В наличии",
            "Категория",
            "Slug категории",
            "Артикул",
            "Бренд (из названия)",
            "Описание",
            "Создан",
            "Обновлён",
        ]
    )

    # Данные
    for product in all_products:
        category = cat_dict.get(product["category_id"], {})

        # Пытаемся определить бренд из названия
        name_lower = product["name"].lower()
        detected_brand = ""

        brands_to_check = {
            "s1100": ["s1100", "с1100", "s-1100"],
            "s195": ["s195", "с195", "s-195"],
            "zs": ["zs1100", "zs1105", "zs1110", "zs1115", "zs1125", "zs195"],
            "r175": ["r175", "р175", "r-175"],
            "r180": ["r180", "р180", "r-180"],
            "dongfeng": ["dongfeng", "донгфенг", "дунгфенг"],
            "uralets": ["уралец"],
            "km": ["км-385", "км385", "км-"],
            "jinma": ["джинма", "jinma"],
            "foton": ["фотон", "foton", "lovol"],
            "xingtai": ["синтай", "xingtai"],
            "shifeng": ["шифенг", "shifeng"],
        }

        for brand, patterns in brands_to_check.items():
            for pattern in patterns:
                if pattern in name_lower:
                    detected_brand = brand.upper()
                    break
            if detected_brand:
                break

        writer.writerow(
            [
                product["id"],
                product["name"],
                product.get("price", ""),
                product.get("old_price", ""),
                "ДА" if product.get("in_stock", False) else "НЕТ",
                category.get("name", ""),
                category.get("slug", ""),
                product.get("sku", ""),
                detected_brand,
                product.get("description", ""),
                product.get("created_at", ""),
                product.get("updated_at", ""),
            ]
        )

print(f"\n✅ CSV файл создан: {csv_file}")
print(f"📊 Экспортировано товаров: {len(all_products)}")
print("\n📝 Колонки в файле:")
print("  1. ID - ID товара в базе")
print("  2. Название товара")
print("  3. Цена")
print("  4. Старая цена")
print("  5. В наличии (ДА/НЕТ)")
print("  6. Категория")
print("  7. Slug категории")
print("  8. Артикул")
print("  9. Бренд (из названия) - автоматически определённый бренд")
print("  10. Описание")
print("  11. Создан")
print("  12. Обновлён")
print("\n💡 Разделитель: точка с запятой (;)")
print("💡 Кодировка: UTF-8")
print("\n🎯 Теперь можно открыть файл в Excel/LibreOffice и отфильтровать!")
