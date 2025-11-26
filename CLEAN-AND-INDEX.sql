--d  ============================================================================
-- ОЧИСТКА БД + ДОБАВЛЕНИЕ ИНДЕКСОВ
-- 1. Удаляет ПУСТЫЕ категории (без товаров)
-- 2. Оставляет только используемые (~20 категорий)
-- 3. Добавляет индексы для скорости
-- ============================================================================
-- Запустите в: https://supabase.com/dashboard/project/dpsykseeqloturowdyzf/sql
-- ============================================================================

-- ШАГ 1: ПОКАЗАТЬ ПУСТЫЕ КАТЕГОРИИ (перед удалением)
-- ============================================================================
SELECT
    c.id,
    c.slug,
    c.name,
    COUNT(p.id) as product_count
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.id, c.slug, c.name
HAVING COUNT(p.id) = 0
ORDER BY c.id;

-- Пауза для проверки (закомментируйте если уверены)
-- ОСТАНОВИТЕСЬ ЗДЕСЬ! Проверьте список выше - это категории, которые будут удалены!


-- ШАГ 2: УДАЛИТЬ ПУСТЫЕ КАТЕГОРИИ
-- ============================================================================
-- РАСКОММЕНТИРУЙТЕ СТРОКУ НИЖЕ, КОГДА БУДЕТЕ ГОТОВЫ УДАЛИТЬ!
-- DELETE FROM categories WHERE id NOT IN (SELECT DISTINCT category_id FROM products WHERE category_id IS NOT NULL);


-- ШАГ 3: ПОКАЗАТЬ ОСТАВШИЕСЯ КАТЕГОРИИ
-- ============================================================================
SELECT
    c.id,
    c.slug,
    c.name,
    COUNT(p.id) as products
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.id, c.slug, c.name
HAVING COUNT(p.id) > 0
ORDER BY products DESC;


-- ШАГ 4: ДОБАВИТЬ ИНДЕКСЫ ДЛЯ СКОРОСТИ
-- ============================================================================
-- Основные B-Tree индексы
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_manufacturer ON products(manufacturer);
CREATE INDEX IF NOT EXISTS idx_products_model ON products(model);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);

-- GIN индекс для полнотекстового поиска
CREATE INDEX IF NOT EXISTS idx_products_name_gin
ON products USING GIN (to_tsvector('russian', name));

-- GIN индекс для JSONB
CREATE INDEX IF NOT EXISTS idx_products_specifications_gin
ON products USING GIN (specifications);

-- Составные индексы
CREATE INDEX IF NOT EXISTS idx_products_category_in_stock
ON products(category_id, in_stock)
WHERE in_stock = true;

CREATE INDEX IF NOT EXISTS idx_products_manufacturer_category
ON products(manufacturer, category_id);

CREATE INDEX IF NOT EXISTS idx_products_category_featured
ON products(category_id, featured)
WHERE featured = true;

-- Индексы для сортировки
CREATE INDEX IF NOT EXISTS idx_products_created_at
ON products(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_updated_at
ON products(updated_at DESC);

-- Индекс для slug
CREATE INDEX IF NOT EXISTS idx_products_slug
ON products(slug);


-- ШАГ 5: ОБНОВИТЬ СТАТИСТИКУ
-- ============================================================================
ANALYZE products;
ANALYZE categories;


-- ============================================================================
-- ИТОГОВАЯ СТАТИСТИКА
-- ============================================================================

-- Категории с товарами
SELECT
    '✅ ИСПОЛЬЗУЕМЫЕ КАТЕГОРИИ' as status,
    COUNT(*) as count
FROM (
    SELECT c.id
    FROM categories c
    INNER JOIN products p ON p.category_id = c.id
    GROUP BY c.id
) as used_categories;

-- Всего товаров
SELECT
    '📦 ВСЕГО ТОВАРОВ' as status,
    COUNT(*) as count
FROM products;

-- Товары по категориям (топ-10)
SELECT
    c.name as category,
    COUNT(p.id) as products,
    COUNT(p.id) FILTER (WHERE p.in_stock = true) as in_stock
FROM categories c
INNER JOIN products p ON p.category_id = c.id
GROUP BY c.name
ORDER BY products DESC
LIMIT 10;

-- Индексы на products
SELECT
    '📊 ИНДЕКСЫ НА PRODUCTS' as info,
    indexname
FROM pg_indexes
WHERE tablename = 'products'
ORDER BY indexname;


-- ============================================================================
-- ГОТОВО! ✅
-- ============================================================================
-- Что сделано:
-- 1. Показаны пустые категории (ШАГ 1)
-- 2. Удалены пустые категории (ШАГ 2 - РАСКОММЕНТИРУЙТЕ!)
-- 3. Показаны используемые категории (ШАГ 3)
-- 4. Добавлено 12 индексов (ШАГ 4)
-- 5. Обновлена статистика (ШАГ 5)
--
-- РЕЗУЛЬТАТ:
-- ✅ Чистая БД (только нужные категории)
-- ✅ Быстрые запросы (индексы работают)
-- ✅ Легко управлять (через БД, не через код)
-- ============================================================================
