#!/usr/bin/env python3
"""
Простой анализ БД Supabase через REST API
"""

import urllib.request
import urllib.parse
import json
import os
from collections import Counter

# Загружаем переменные окружения
SUPABASE_URL = "https://dpsykseeqloturowdyzf.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwc3lrc2VlcWxvdHVyb3dkeXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUwMjg1MywiZXhwIjoyMDc4MDc4ODUzfQ.wY2VoghxdIhgwEws_kUIUgZX1P3TTw-1PXh84GVbdJ4"

def make_request(endpoint):
    """Выполняет GET запрос к Supabase API"""
    # Используем urllib.parse.quote для правильного кодирования URL
    url = f"{SUPABASE_URL}{endpoint}"
    req = urllib.request.Request(url)
    req.add_header("apikey", SUPABASE_KEY)
    req.add_header("Authorization", f"Bearer {SUPABASE_KEY}")
    req.add_header("Content-Type", "application/json; charset=utf-8")
    req.add_header("Prefer", "count=exact")

    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            content_range = response.getheader('Content-Range')
            return data, content_range
    except urllib.error.HTTPError as e:
        print(f"   ❌ HTTP Error {e.code}: {e.reason}")
        return None, None
    except Exception as e:
        print(f"   ❌ Ошибка запроса: {e}")
        return None, None

print("=" * 100)
print("📊 АНАЛИЗ БАЗЫ ДАННЫХ SUPABASE")
print("=" * 100)
print()

# 1. Общее количество товаров
print("🔍 1. ОБЩЕЕ КОЛИЧЕСТВО ТОВАРОВ:")
data, content_range = make_request("/rest/v1/products?select=id&limit=1")
if content_range:
    total_count = content_range.split('/')[-1]
    print(f"   Всего товаров: {total_count}")
else:
    print("   ❌ Не удалось получить количество")
print()

# 2. Товары по категориям (поле category STRING)
print("🔍 2. ТОВАРЫ ПО ПОЛЮ CATEGORY (топ-20):")
# Ограничиваем выборку для быстрой работы
products, _ = make_request("/rest/v1/products?select=category&limit=5846")

if products:
    categories = Counter([p.get('category') if p.get('category') else 'NULL' for p in products])

    for i, (cat, count) in enumerate(categories.most_common(20), 1):
        print(f"   {i:2}. {cat:50} {count:>5} товаров")

    print(f"\n   📌 Всего уникальных категорий: {len(categories)}")
    print(f"   📌 Товаров без категории (NULL): {categories.get('NULL', 0)}")

print()

# 3. Товары по полю manufacturer
print("🔍 3. ТОВАРЫ ПО ПРОИЗВОДИТЕЛЮ (топ-15):")
products, _ = make_request("/rest/v1/products?select=manufacturer&limit=5846")

if products:
    manufacturers = Counter([p.get('manufacturer') if p.get('manufacturer') else 'NULL' for p in products])

    for i, (mfr, count) in enumerate(manufacturers.most_common(15), 1):
        print(f"   {i:2}. {mfr:50} {count:>5} товаров")

    print(f"\n   📌 Всего уникальных производителей: {len(manufacturers)}")

print()

# 4. Проверка ДВС
print("🔍 4. АНАЛИЗ ДВС В СБОРЕ:")
# Используем title like для поиска ДВС вместо фильтра по категории
products, _ = make_request("/rest/v1/products?select=id,title,category&title=ilike.*Двигатель*л.с*&limit=100")

if products:
    # Разделим на правильные и неправильные категории
    wrong_cat = [p for p in products if p.get('category') and 'Запчасти' in p.get('category', '')]
    correct_cat = [p for p in products if p.get('category') and 'ДВС' in p.get('category', '') and 'сборе' in p.get('category', '')]

    print(f"   Найдено ДВС (с 'Двигатель' и 'л.с' в названии): {len(products)}")
    print(f"   ❌ В неправильной категории 'Запчасти...': {len(wrong_cat)}")
    print(f"   ✅ В правильной категории 'ДВС в сборе': {len(correct_cat)}")

    if wrong_cat:
        print(f"\n   Примеры неправильных (первые 5):")
        for p in wrong_cat[:5]:
            print(f"      ID {p['id']}: {p.get('title', 'N/A')[:70]}")
            print(f"         Категория: {p.get('category', 'NULL')}")

print()

# 5. Проверка категории 'ДВС в сборе' - используем title с LIKE
print("🔍 5. ВСЕ ДВС В СБОРЕ (ПРАВИЛЬНАЯ КАТЕГОРИЯ):")
products, _ = make_request("/rest/v1/products?select=id,title,category&category=like.*ДВС*сборе*")

if products:
    print(f"   ✅ В правильной категории 'ДВС в сборе': {len(products)}")

    if products:
        print(f"\n   Примеры:")
        for p in products[:5]:
            print(f"      ID {p['id']}: {p.get('title', 'N/A')[:70]}")

print()
print("=" * 100)
print("✅ АНАЛИЗ ЗАВЕРШЁН")
print("=" * 100)
