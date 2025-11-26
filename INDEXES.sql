-- ============================================================================
-- ИНДЕКСЫ ДЛЯ ТАБЛИЦЫ PRODUCTS
-- Проект: beltehferm (dpsykseeqloturowdyzf)
-- ============================================================================
-- Скопируйте весь файл и выполните в Supabase Dashboard → SQL Editor
-- https://supabase.com/dashboard/project/dpsykseeqloturowdyzf/sql
-- ============================================================================

-- Основные B-Tree индексы
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_manufacturer ON products(manufacturer);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);

-- GIN индексы для полнотекстового поиска
CREATE INDEX IF NOT EXISTS idx_products_name_gin 
ON products USING GIN (to_tsvector('russian', name));

CREATE INDEX IF NOT EXISTS idx_products_specifications_gin 
ON products USING GIN (specifications);

-- Составные индексы для часто используемых комбинаций
CREATE INDEX IF NOT EXISTS idx_products_category_in_stock 
ON products(category_id, in_stock) 
WHERE in_stock = true;

CREATE INDEX IF NOT EXISTS idx_products_manufacturer_category 
ON products(manufacturer, category_id);

-- Дополнительные индексы
CREATE INDEX IF NOT EXISTS idx_products_created_at 
ON products(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_updated_at 
ON products(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_slug 
ON products(slug);

-- Анализ таблицы для обновления статистики
ANALYZE products;

-- ============================================================================
-- ПРОВЕРКА СОЗДАННЫХ ИНДЕКСОВ
-- ============================================================================

SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'products'
ORDER BY indexname;
