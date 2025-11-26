-- Индексы для оптимизации производительности таблицы products
-- Выполнить в Supabase Dashboard → SQL Editor

-- ============================================================================
-- ОСНОВНЫЕ B-TREE ИНДЕКСЫ
-- ============================================================================

-- Индекс на category_id (критичный - основной фильтр на сайте)
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Индекс на manufacturer (фильтр по брендам: DongFeng, Foton, Jinma, Xingtai, ZUBR)
CREATE INDEX IF NOT EXISTS idx_products_manufacturer ON products(manufacturer);

-- Индекс на price (сортировка по цене)
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Индекс на stock (фильтр "В наличии")
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);

-- ============================================================================
-- GIN ИНДЕКСЫ ДЛЯ ПОЛНОТЕКСТОВОГО ПОИСКА
-- ============================================================================

-- Полнотекстовый поиск по названию товара (русский язык)
CREATE INDEX IF NOT EXISTS idx_products_name_gin
ON products
USING GIN (to_tsvector('russian', name));

-- Поиск по JSONB полю specifications
CREATE INDEX IF NOT EXISTS idx_products_specifications_gin
ON products
USING GIN (specifications);

-- ============================================================================
-- СОСТАВНЫЕ ИНДЕКСЫ
-- ============================================================================

-- Фильтрация по категории + наличие (только товары в наличии)
CREATE INDEX IF NOT EXISTS idx_products_category_stock
ON products(category_id, stock)
WHERE stock > 0;

-- Фильтрация по производителю + категория
CREATE INDEX IF NOT EXISTS idx_products_manufacturer_category
ON products(manufacturer, category_id);

-- ============================================================================
-- ДОПОЛНИТЕЛЬНЫЕ ИНДЕКСЫ (опционально)
-- ============================================================================

-- Индекс на created_at для сортировки "Новинки"
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Индекс на updated_at
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at DESC);

-- ============================================================================
-- АНАЛИЗ ТАБЛИЦЫ ПОСЛЕ СОЗДАНИЯ ИНДЕКСОВ
-- ============================================================================

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
