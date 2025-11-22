-- ============================================================================
-- СОЗДАНИЕ ИНДЕКСОВ ДЛЯ ОПТИМИЗАЦИИ ПРОИЗВОДИТЕЛЬНОСТИ
-- ============================================================================
-- Выполните этот SQL в Supabase Dashboard → SQL Editor
-- Или используйте скрипт: python3 scripts/apply-indexes.py
-- ============================================================================

-- 1. Индекс для фильтрации по брендам
CREATE INDEX IF NOT EXISTS idx_products_manufacturer
ON products(manufacturer);

-- 2. Индекс для фильтра "В наличии"
CREATE INDEX IF NOT EXISTS idx_products_in_stock
ON products(in_stock);

-- 3. Индекс для сортировки по цене
CREATE INDEX IF NOT EXISTS idx_products_price
ON products(price);

-- 4. Индекс для фильтрации по категориям
CREATE INDEX IF NOT EXISTS idx_products_category
ON products(category_id);

-- 5. Композитный индекс для фильтра "Бренд + Наличие" (самый популярный запрос)
CREATE INDEX IF NOT EXISTS idx_products_brand_stock
ON products(manufacturer, in_stock);

-- 6. Композитный индекс для сортировки с фильтром наличия
CREATE INDEX IF NOT EXISTS idx_products_stock_price
ON products(in_stock, price);

-- 7. Полнотекстовый поиск по названию (русский язык)
CREATE INDEX IF NOT EXISTS idx_products_name_search
ON products USING gin(to_tsvector('russian', name));

-- 8. Индекс для поиска по описанию (опционально, если нужен поиск по описанию)
CREATE INDEX IF NOT EXISTS idx_products_description_search
ON products USING gin(to_tsvector('russian', description));

-- 9. Индекс по slug (уже должен быть UNIQUE, но добавим для ускорения)
CREATE INDEX IF NOT EXISTS idx_products_slug
ON products(slug);

-- 10. Индекс по created_at для сортировки "Новинки"
CREATE INDEX IF NOT EXISTS idx_products_created_at
ON products(created_at DESC);

-- 11. Индекс для популярных товаров (featured)
CREATE INDEX IF NOT EXISTS idx_products_featured
ON products(featured) WHERE featured = true;

-- 12. Композитный индекс для категории + бренд + наличие
CREATE INDEX IF NOT EXISTS idx_products_cat_brand_stock
ON products(category_id, manufacturer, in_stock);

-- ============================================================================
-- СОЗДАНИЕ МАТЕРИАЛИЗОВАННОГО ПРЕДСТАВЛЕНИЯ ДЛЯ КАТАЛОГА
-- ============================================================================
-- Материализованное представление для быстрого доступа к данным каталога

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_catalog_products AS
SELECT
    p.id,
    p.name,
    p.slug,
    p.price,
    p.old_price,
    p.in_stock,
    p.manufacturer,
    p.image_url,
    p.specifications->>'part_type' as part_type,
    p.category_id,
    c.name as category_name,
    c.slug as category_slug,
    p.featured,
    p.created_at
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.in_stock = true
ORDER BY p.created_at DESC;

-- Индекс для материализованного представления
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_catalog_id ON mv_catalog_products(id);
CREATE INDEX IF NOT EXISTS idx_mv_catalog_manufacturer ON mv_catalog_products(manufacturer);
CREATE INDEX IF NOT EXISTS idx_mv_catalog_part_type ON mv_catalog_products(part_type);
CREATE INDEX IF NOT EXISTS idx_mv_catalog_price ON mv_catalog_products(price);

-- Для автоматического обновления материализованного представления (опционально)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_catalog_products;

-- ============================================================================
-- АНАЛИЗ ТАБЛИЦЫ ДЛЯ ОБНОВЛЕНИЯ СТАТИСТИКИ
-- ============================================================================

ANALYZE products;
ANALYZE categories;

-- ============================================================================
-- ГОТОВО!
-- ============================================================================
-- Индексы созданы. Теперь можно проверить их использование:
-- EXPLAIN ANALYZE SELECT * FROM products WHERE manufacturer = 'DONGFENG' AND in_stock = true;
