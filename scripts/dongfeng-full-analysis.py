#!/usr/bin/env python3
"""
ПОЛНЫЙ АНАЛИЗ ТОВАРОВ DONGFENG
"""

import os
from supabase import create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(url, key)

print("=" * 100)
print("📊 ПОЛНЫЙ АНАЛИЗ DONGFENG")
print("=" * 100)
print()

# Загружаем ВСЕ DongFeng товары
all_dongfeng = supabase.table("products")\
    .select("id, name, price, in_stock")\
    .eq("manufacturer", "DongFeng")\
    .execute()

print(f"Всего товаров DongFeng: {len(all_dongfeng.data)}")
in_stock = [p for p in all_dongfeng.data if p.get("in_stock")]
print(f"В наличии: {len(in_stock)}")
print()

# Анализируем по моделям
models = {
    "240-244": [],
    "354-404": [],
    "504": [],
    "904": [],
    "1304": [],
    "Общие (без модели)": []
}

for p in in_stock:
    name = p["name"].lower()

    if "240" in name or "244" in name:
        models["240-244"].append(p)
    elif "354" in name or "404" in name:
        models["354-404"].append(p)
    elif "504" in name:
        models["504"].append(p)
    elif "904" in name:
        models["904"].append(p)
    elif "1304" in name:
        models["1304"].append(p)
    else:
        models["Общие (без модели)"].append(p)

print("📊 РАСПРЕДЕЛЕНИЕ ПО МОДЕЛЯМ (только in_stock):")
print("-" * 100)

for model, products in models.items():
    if len(products) > 0:
        print(f"  {model}: {len(products)} товаров")

print()
print(f"✅ ИТОГО в наличии: {sum(len(p) for p in models.values())}")
print()

# Проверяем математику
total_with_model = len(models["240-244"]) + len(models["354-404"]) + len(models["504"]) + len(models["904"]) + len(models["1304"])
total_without_model = len(models["Общие (без модели)"])

print("📐 ПРОВЕРКА МАТЕМАТИКИ:")
print("-" * 100)
print(f"С моделью (240/244 + 354/404 + 504 + 904 + 1304): {total_with_model}")
print(f"Без модели (общие): {total_without_model}")
print(f"ИТОГО: {total_with_model + total_without_model}")
print(f"Должно быть: {len(in_stock)}")

if total_with_model + total_without_model == len(in_stock):
    print("✅ СХОДИТСЯ!")
else:
    print("❌ НЕ СХОДИТСЯ!")

print()

# Примеры товаров без модели
print("📋 ПРИМЕРЫ ТОВАРОВ БЕЗ МОДЕЛИ (первые 10):")
print("-" * 100)

for i, p in enumerate(models["Общие (без модели)"][:10], 1):
    print(f"{i}. {p['name'][:80]}... ({p['price']} руб)")

print()
print("=" * 100)
print("✅ АНАЛИЗ ЗАВЕРШЁН")
print("=" * 100)
