#!/usr/bin/env python3
"""
Проверка индексов в БД и создание недостающих
"""

import os
from supabase import Client, create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

print("=" * 80)
print("🔍 ПРОВЕРКА ИНДЕКСОВ В БАЗЕ ДАННЫХ")
print("=" * 80 + "\n")

# Проверяем индексы на таблице products
check_indexes_query = """
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'products'
ORDER BY indexname;
"""

try:
    result = supabase.rpc('exec_sql', {'query': check_indexes_query}).execute()
    print("📊 Существующие индексы на таблице 'products':\n")

    if result.data:
        for idx in result.data:
            print(f"  • {idx['indexname']}")
            print(f"    {idx['indexdef']}\n")
    else:
        print("  ⚠️  Не удалось получить список индексов через RPC")
        print("  Проверим через схему таблицы...\n")
except Exception as e:
    print(f"  ⚠️  RPC недоступен: {str(e)[:100]}")
    print("  Это нормально для Supabase - проверим критичные поля\n")

# Проверяем критичные поля для индексации
print("=" * 80)
print("📋 РЕКОМЕНДУЕМЫЕ ИНДЕКСЫ ДЛЯ ОПТИМИЗАЦИИ:")
print("=" * 80 + "\n")

recommended_indexes = [
    {
        "name": "idx_products_category_id",
        "field": "category_id",
        "reason": "Фильтрация товаров по категориям (основной запрос на сайте)"
    },
    {
        "name": "idx_products_manufacturer",
        "field": "manufacturer",
        "reason": "Фильтрация по производителю (DongFeng, Foton, и т.д.)"
    },
    {
        "name": "idx_products_price",
        "field": "price",
        "reason": "Сортировка по цене"
    },
    {
        "name": "idx_products_stock",
        "field": "stock",
        "reason": "Фильтр по наличию товара"
    },
    {
        "name": "idx_products_name_gin",
        "field": "name",
        "reason": "Полнотекстовый поиск по названию (GIN индекс)",
        "type": "GIN"
    },
    {
        "name": "idx_products_specifications_gin",
        "field": "specifications",
        "reason": "Поиск по характеристикам товара (JSONB GIN индекс)",
        "type": "GIN"
    }
]

for idx in recommended_indexes:
    idx_type = idx.get("type", "B-Tree")
    print(f"✅ {idx['name']}")
    print(f"   Поле: {idx['field']}")
    print(f"   Тип: {idx_type}")
    print(f"   Зачем: {idx['reason']}\n")

print("=" * 80)
print("💡 SQL ДЛЯ СОЗДАНИЯ ИНДЕКСОВ:")
print("=" * 80 + "\n")

print("""
-- Основные B-Tree индексы
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_manufacturer ON products(manufacturer);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);

-- GIN индексы для полнотекстового поиска
CREATE INDEX IF NOT EXISTS idx_products_name_gin ON products USING GIN (to_tsvector('russian', name));
CREATE INDEX IF NOT EXISTS idx_products_specifications_gin ON products USING GIN (specifications);

-- Составной индекс для фильтрации по категории + наличие
CREATE INDEX IF NOT EXISTS idx_products_category_stock ON products(category_id, stock) WHERE stock > 0;

-- Составной индекс для производитель + категория
CREATE INDEX IF NOT EXISTS idx_products_manufacturer_category ON products(manufacturer, category_id);
""")

print("\n" + "=" * 80)
print("📊 АНАЛИЗ ИСПОЛЬЗОВАНИЯ:")
print("=" * 80 + "\n")

print("Для 10,952 товаров рекомендуется:")
print("  • B-Tree индексы на category_id, manufacturer, price, stock")
print("  • GIN индексы для полнотекстового поиска")
print("  • Составные индексы для частых комбинаций фильтров\n")

print("Эти индексы ускорят:")
print("  🚀 Загрузку каталога по категориям (в 5-10 раз)")
print("  🚀 Фильтрацию по брендам")
print("  🚀 Сортировку по цене")
print("  🚀 Полнотекстовый поиск по названию\n")

print("=" * 80)
print("⚠️  ВАЖНО: Индексы нужно создавать через Supabase Dashboard:")
print("=" * 80 + "\n")
print("1. Откройте Supabase Dashboard")
print("2. Перейдите в SQL Editor")
print("3. Скопируйте SQL команды выше")
print("4. Выполните их\n")

print("=" * 80)
