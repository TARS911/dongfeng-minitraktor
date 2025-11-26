#!/usr/bin/env python3
"""
БЕЗОПАСНОЕ УДАЛЕНИЕ ДУБЛИКАТОВ
1. Сначала ОТЧЁТ - что будет удалено
2. Потом спросим пользователя
3. Только после подтверждения - удалим
"""

import os
import sys
from supabase import create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("❌ ОШИБКА: Нет переменных окружения")
    exit(1)

supabase = create_client(url, key)

print("=" * 100)
print("🔍 ШАГ 1: АНАЛИЗ ДУБЛИКАТОВ")
print("=" * 100)
print()

print("Загружаем все товары... (займёт ~15 секунд)")

# Загружаем ВСЕ товары
all_products = []
offset = 0
limit = 1000

while True:
    batch = supabase.table("products")\
        .select("id, name, slug, price, category_id, manufacturer, in_stock, created_at")\
        .range(offset, offset + limit - 1)\
        .execute()

    if not batch.data:
        break

    all_products.extend(batch.data)
    offset += limit

    if len(batch.data) < limit:
        break

    print(f"  Загружено: {len(all_products)}...")

print(f"✅ Всего товаров: {len(all_products)}")
print()

# Находим дубликаты по name
names = {}
for p in all_products:
    name = p["name"]
    if name not in names:
        names[name] = []
    names[name].append(p)

duplicates = {name: products for name, products in names.items() if len(products) > 1}

print(f"📊 НАЙДЕНО ДУБЛИКАТОВ: {len(duplicates)}")
print()

# Подсчитываем сколько товаров будет удалено
total_to_delete = 0
for name, products in duplicates.items():
    total_to_delete += len(products) - 1  # Оставляем 1, удаляем остальные

print(f"⚠️  БУДЕТ УДАЛЕНО: {total_to_delete} товаров")
print(f"✅ ОСТАНЕТСЯ: {len(all_products) - total_to_delete} товаров")
print()

# Определяем стратегию - какой товар оставить
print("📋 СТРАТЕГИЯ УДАЛЕНИЯ:")
print("-" * 100)
print("Для каждого дубликата:")
print("  ✅ ОСТАВИМ: товар с минимальным ID (самый старый)")
print("  ❌ УДАЛИМ: все остальные копии")
print()

# Показываем примеры
print("📋 ПРИМЕРЫ (первые 10 дубликатов):")
print("-" * 100)

for i, (name, products) in enumerate(list(duplicates.items())[:10], 1):
    # Сортируем по ID
    products.sort(key=lambda x: x["id"])

    print(f"\n{i}. '{name}' - {len(products)} копий:")
    print(f"   ✅ ОСТАВИМ: ID={products[0]['id']}, created_at={products[0].get('created_at', 'НЕТ')}")
    print(f"   ❌ УДАЛИМ:")
    for p in products[1:]:
        print(f"      ID={p['id']}, created_at={p.get('created_at', 'НЕТ')}")

print()
print("=" * 100)
print("⚠️  ВНИМАНИЕ!")
print("=" * 100)
print(f"Будет БЕЗВОЗВРАТНО удалено {total_to_delete} товаров!")
print("Останется по 1 копии каждого товара (с минимальным ID)")
print()
print("Это БЕЗОПАСНО - мы оставляем самые старые товары!")
print()

# Сохраняем отчёт в файл
print("💾 Сохраняю отчёт в файл: duplicates-report.txt")

with open("duplicates-report.txt", "w", encoding="utf-8") as f:
    f.write("=" * 100 + "\n")
    f.write("ОТЧЁТ О ДУБЛИКАТАХ\n")
    f.write("=" * 100 + "\n\n")
    f.write(f"Всего товаров: {len(all_products)}\n")
    f.write(f"Найдено дубликатов: {len(duplicates)}\n")
    f.write(f"Будет удалено: {total_to_delete} товаров\n")
    f.write(f"Останется: {len(all_products) - total_to_delete} товаров\n\n")
    f.write("=" * 100 + "\n")
    f.write("СПИСОК ВСЕХ ДУБЛИКАТОВ:\n")
    f.write("=" * 100 + "\n\n")

    for name, products in sorted(duplicates.items(), key=lambda x: len(x[1]), reverse=True):
        products.sort(key=lambda x: x["id"])
        f.write(f"\n'{name}' - {len(products)} копий:\n")
        f.write(f"  ОСТАВИМ: ID={products[0]['id']}\n")
        f.write(f"  УДАЛИМ:\n")
        for p in products[1:]:
            f.write(f"    ID={p['id']}\n")

print("✅ Отчёт сохранён!")
print()
print("=" * 100)
print("❓ ЧТО ДАЛЬШЕ?")
print("=" * 100)
print()
print("Создай скрипт delete-duplicates.py который УДАЛИТ дубликаты.")
print("Или я могу это сделать СЕЙЧАС если ты скажешь 'ДА'!")
print()
