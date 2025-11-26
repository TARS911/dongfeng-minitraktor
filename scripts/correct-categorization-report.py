#!/usr/bin/env python3
"""
ПРАВИЛЬНЫЙ ОТЧЁТ ПО КАТЕГОРИЯМ
Показываем ВСЕ товары правильно!
"""

import os
from supabase import create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(url, key)

print("=" * 100)
print("📊 ПРАВИЛЬНАЯ КАТЕГОРИЗАЦИЯ ТОВАРОВ")
print("=" * 100)
print()

# Загружаем все категории
categories_result = supabase.table("categories").select("id, name, slug").execute()
categories = {cat["id"]: cat for cat in categories_result.data}

# ID категорий которые нас интересуют
print("🔍 АНАЛИЗИРУЕМ СТРУКТУРУ:")
print("-" * 100)

# ЗАПЧАСТИ - это несколько категорий
parts_categories = {
    303: "Запчасти на ДВС",
    304: "Запчасти на Минитракторы",
    305: "Запчасти на Мототракторы",
    307: "Запчасти на Навесное оборудование",
    310: "Топливная система",
    311: "Фильтры",
    312: "Гидравлика",
}

# УНИВЕРСАЛЬНЫЕ - отдельная группа
# МИНИТРАКТОРЫ - отдельная группа
# НАВЕСНОЕ - отдельная группа
# ДВС В СБОРЕ - отдельная категория

print()
print("=" * 100)
print("📦 ГРУППА 'ЗАПЧАСТИ' (основные категории запчастей)")
print("=" * 100)
print()

parts_total = 0
parts_in_stock = 0

for cat_id, cat_name in parts_categories.items():
    count_result = supabase.table("products").select("id", count="exact").eq("category_id", cat_id).execute()
    in_stock_result = supabase.table("products").select("id", count="exact").eq("category_id", cat_id).eq("in_stock", True).execute()

    total = count_result.count
    in_stock = in_stock_result.count

    parts_total += total
    parts_in_stock += in_stock

    print(f"{total:5} товаров ({in_stock:5} в наличии) | {cat_name}")

print()
print(f"ИТОГО в группе 'Запчасти': {parts_total} ({parts_in_stock} в наличии)")
print()

# УНИВЕРСАЛЬНЫЕ товары (manufacturer=UNIVERSAL)
print("=" * 100)
print("📦 УНИВЕРСАЛЬНЫЕ ЗАПЧАСТИ (manufacturer=UNIVERSAL)")
print("=" * 100)
print()

universal_result = supabase.table("products").select("id", count="exact").eq("manufacturer", "UNIVERSAL").execute()
universal_in_stock = supabase.table("products").select("id", count="exact").eq("manufacturer", "UNIVERSAL").eq("in_stock", True).execute()

print(f"{universal_result.count:5} товаров ({universal_in_stock.count:5} в наличии) | UNIVERSAL (все категории)")
print()

# МИНИТРАКТОРЫ
print("=" * 100)
print("📦 МИНИТРАКТОРЫ (готовые машины)")
print("=" * 100)
print()

tractor_categories = {
    313: "МиниТрактора Dongfeng",
    314: "МиниТрактора Foton/Lovol",
    315: "МиниТрактора Jinma",
    316: "МиниТрактора Xingtai/Уралец",
}

tractors_total = 0
tractors_in_stock = 0

for cat_id, cat_name in tractor_categories.items():
    count_result = supabase.table("products").select("id", count="exact").eq("category_id", cat_id).execute()
    in_stock_result = supabase.table("products").select("id", count="exact").eq("category_id", cat_id).eq("in_stock", True).execute()

    total = count_result.count
    in_stock = in_stock_result.count

    tractors_total += total
    tractors_in_stock += in_stock

    print(f"{total:5} товаров ({in_stock:5} в наличии) | {cat_name}")

print()
print(f"ИТОГО минитракторов: {tractors_total} ({tractors_in_stock} в наличии)")
print()

# ДВС В СБОРЕ
print("=" * 100)
print("📦 ДВС В СБОРЕ")
print("=" * 100)
print()

engines_result = supabase.table("products").select("id", count="exact").eq("category_id", 302).execute()
engines_in_stock = supabase.table("products").select("id", count="exact").eq("category_id", 302).eq("in_stock", True).execute()

print(f"{engines_result.count:5} товаров ({engines_in_stock.count:5} в наличии) | ДВС в Сборе")
print()

# ОСТАЛЬНЫЕ КАТЕГОРИИ (системы и узлы)
print("=" * 100)
print("📦 СИСТЕМЫ И УЗЛЫ (отдельные категории)")
print("=" * 100)
print()

system_categories = {
    331: "Ходовая часть",
    325: "Трансмиссия",
    330: "Рулевое управление",
    327: "Электрика",
    332: "Колёса и шины",
    328: "Карданные валы",
    326: "Система охлаждения",
    329: "Тормозная система",
    333: "Ремни",
}

systems_total = 0
systems_in_stock = 0

for cat_id, cat_name in system_categories.items():
    count_result = supabase.table("products").select("id", count="exact").eq("category_id", cat_id).execute()
    in_stock_result = supabase.table("products").select("id", count="exact").eq("category_id", cat_id).eq("in_stock", True).execute()

    total = count_result.count
    in_stock = in_stock_result.count

    systems_total += total
    systems_in_stock += in_stock

    print(f"{total:5} товаров ({in_stock:5} в наличии) | {cat_name}")

print()
print(f"ИТОГО систем и узлов: {systems_total} ({systems_in_stock} в наличии)")
print()

# НАВЕСНОЕ ОБОРУДОВАНИЕ
print("=" * 100)
print("📦 НАВЕСНОЕ ОБОРУДОВАНИЕ")
print("=" * 100)
print()

attachment_categories = {
    336: "Пресс-подборщики",
    337: "Плуги",
    335: "Почвофрезы",
    338: "Бороны",
    340: "Картофелекопалки и сажалки",
    341: "Грабли-ворошилки",
    339: "Культиваторы",
    334: "Косилки",
}

attachments_total = 0
attachments_in_stock = 0

for cat_id, cat_name in attachment_categories.items():
    count_result = supabase.table("products").select("id", count="exact").eq("category_id", cat_id).execute()
    in_stock_result = supabase.table("products").select("id", count="exact").eq("category_id", cat_id).eq("in_stock", True).execute()

    total = count_result.count
    in_stock = in_stock_result.count

    attachments_total += total
    attachments_in_stock += in_stock

    print(f"{total:5} товаров ({in_stock:5} в наличии) | {cat_name}")

print()
print(f"ИТОГО навесного оборудования: {attachments_total} ({attachments_in_stock} в наличии)")
print()

# ФИНАЛЬНАЯ МАТЕМАТИКА
print("=" * 100)
print("🧮 ФИНАЛЬНАЯ МАТЕМАТИКА")
print("=" * 100)
print()

total_db = supabase.table("products").select("id", count="exact").execute()

print(f"Всего товаров в БД: {total_db.count}")
print()
print("РАСПРЕДЕЛЕНИЕ:")
print(f"  Запчасти (основные категории):  {parts_total:5}")
print(f"  Универсальные запчасти:          {universal_result.count:5}")
print(f"  Минитракторы (готовые):          {tractors_total:5}")
print(f"  ДВС в сборе:                     {engines_result.count:5}")
print(f"  Системы и узлы:                  {systems_total:5}")
print(f"  Навесное оборудование:           {attachments_total:5}")
print(f"  " + "-" * 40)
print(f"  СУММА:                           {parts_total + universal_result.count + tractors_total + engines_result.count + systems_total + attachments_total:5}")
print()

# Проверяем сходится ли
calculated_sum = parts_total + universal_result.count + tractors_total + engines_result.count + systems_total + attachments_total

if calculated_sum == total_db.count:
    print("✅ СХОДИТСЯ! Все товары учтены!")
else:
    print(f"⚠️  РАЗНИЦА: {total_db.count - calculated_sum} товаров")
    print()
    print("Проверяем что осталось...")

    # Ищем товары которые не попали в наш подсчёт
    all_counted_category_ids = list(parts_categories.keys()) + \
                                list(tractor_categories.keys()) + \
                                [302] + \
                                list(system_categories.keys()) + \
                                list(attachment_categories.keys())

    print(f"Категорий учтено: {len(all_counted_category_ids)}")
    print(f"Всего категорий: {len(categories)}")
    print()
    print("Не учтённые категории:")

    other_total = 0
    for cat_id, cat in categories.items():
        if cat_id not in all_counted_category_ids:
            count_result = supabase.table("products").select("id", count="exact").eq("category_id", cat_id).execute()
            if count_result.count > 0:
                print(f"  {count_result.count:5} товаров | {cat['name']}")
                other_total += count_result.count

    print()
    print(f"ИТОГО в не учтённых категориях: {other_total}")

print()
print("=" * 100)
print("✅ ОТЧЁТ ЗАВЕРШЁН")
print("=" * 100)
