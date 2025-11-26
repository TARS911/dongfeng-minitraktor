-- ============================================================================
-- ИССЛЕДОВАНИЕ ПРОБЛЕМЫ С ДУБЛИКАТАМИ ТОВАРОВ TATA-AGRO
-- Ожидалось: ~2,073 товаров
-- Фактически: 3,566 товаров
-- Разница: ~1,493 лишних товаров
-- ============================================================================

-- ШАГ 1: ОБЩАЯ СТАТИСТИКА
-- ============================================================================
SELECT
    'Всего товаров в БД' as metric,
    COUNT(*) as count
FROM products

UNION ALL

SELECT
    'Товары tata-agro',
    COUNT(*)
FROM products
WHERE image_url LIKE '%tata-agro%'

UNION ALL

SELECT
    'Товары БЕЗ tata-agro',
    COUNT(*)
FROM products
WHERE image_url NOT LIKE '%tata-agro%' OR image_url IS NULL;


-- ШАГ 2: АНАЛИЗ ДУБЛИКАТОВ ПО НАЗВАНИЮ
-- ============================================================================
-- Находим товары с одинаковым названием
SELECT
    name,
    COUNT(*) as duplicate_count,
    STRING_AGG(id::text, ', ' ORDER BY id) as product_ids,
    MIN(price) as min_price,
    MAX(price) as max_price
FROM products
WHERE image_url LIKE '%tata-agro%'
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, name
LIMIT 50;


-- ШАГ 3: ПРОВЕРКА ПО ДАТАМ СОЗДАНИЯ
-- ============================================================================
-- Когда были созданы товары?
SELECT
    DATE(created_at) as creation_date,
    COUNT(*) as products_created,
    MIN(id) as min_id,
    MAX(id) as max_id
FROM products
WHERE image_url LIKE '%tata-agro%'
GROUP BY DATE(created_at)
ORDER BY creation_date DESC;


-- ШАГ 4: АНАЛИЗ ПО ЦЕНАМ
-- ============================================================================
-- Распределение цен
SELECT
    CASE
        WHEN price < 25 THEN '<25 руб (не конвертировано)'
        WHEN price >= 25 AND price < 100 THEN '25-100 руб'
        WHEN price >= 100 AND price < 500 THEN '100-500 руб'
        WHEN price >= 500 AND price < 1000 THEN '500-1000 руб'
        WHEN price >= 1000 AND price < 5000 THEN '1000-5000 руб'
        WHEN price >= 5000 THEN '>5000 руб'
        ELSE 'Без цены'
    END as price_range,
    COUNT(*) as count
FROM products
WHERE image_url LIKE '%tata-agro%'
GROUP BY
    CASE
        WHEN price < 25 THEN '<25 руб (не конвертировано)'
        WHEN price >= 25 AND price < 100 THEN '25-100 руб'
        WHEN price >= 100 AND price < 500 THEN '100-500 руб'
        WHEN price >= 500 AND price < 1000 THEN '500-1000 руб'
        WHEN price >= 1000 AND price < 5000 THEN '1000-5000 руб'
        WHEN price >= 5000 THEN '>5000 руб'
        ELSE 'Без цены'
    END
ORDER BY
    CASE
        WHEN price < 25 THEN 1
        WHEN price >= 25 AND price < 100 THEN 2
        WHEN price >= 100 AND price < 500 THEN 3
        WHEN price >= 500 AND price < 1000 THEN 4
        WHEN price >= 1000 AND price < 5000 THEN 5
        WHEN price >= 5000 THEN 6
        ELSE 7
    END;


-- ШАГ 5: ПОИСК ТОЧНЫХ ДУБЛИКАТОВ
-- ============================================================================
-- Товары с одинаковым названием И ценой (точные дубликаты)
SELECT
    name,
    price,
    COUNT(*) as exact_duplicates,
    STRING_AGG(id::text, ', ' ORDER BY id) as product_ids,
    MIN(created_at) as first_created,
    MAX(created_at) as last_created
FROM products
WHERE image_url LIKE '%tata-agro%'
GROUP BY name, price
HAVING COUNT(*) > 1
ORDER BY exact_duplicates DESC, name
LIMIT 30;


-- ШАГ 6: ТОВАРЫ С НИЗКИМИ ЦЕНАМИ (не конвертированные)
-- ============================================================================
SELECT
    id,
    name,
    price as price_uah,
    ROUND(price * 1.85, 2) as should_be_rub,
    created_at
FROM products
WHERE image_url LIKE '%tata-agro%'
  AND price > 0
  AND price < 25
ORDER BY price;


-- ШАГ 7: АНАЛИЗ SLUG
-- ============================================================================
-- Проверка уникальности slug
SELECT
    slug,
    COUNT(*) as count
FROM products
WHERE image_url LIKE '%tata-agro%'
  AND slug IS NOT NULL
GROUP BY slug
HAVING COUNT(*) > 1
ORDER BY count DESC
LIMIT 20;


-- ШАГ 8: СРАВНЕНИЕ СТАРЫХ И НОВЫХ ТОВАРОВ
-- ============================================================================
-- Товары созданные давно (до сегодня) vs новые
SELECT
    CASE
        WHEN DATE(created_at) < CURRENT_DATE THEN 'Старые (до сегодня)'
        WHEN DATE(created_at) = CURRENT_DATE THEN 'Новые (сегодня)'
        ELSE 'Другое'
    END as age_group,
    COUNT(*) as count,
    MIN(price) as min_price,
    MAX(price) as max_price,
    ROUND(AVG(price), 2) as avg_price
FROM products
WHERE image_url LIKE '%tata-agro%'
GROUP BY
    CASE
        WHEN DATE(created_at) < CURRENT_DATE THEN 'Старые (до сегодня)'
        WHEN DATE(created_at) = CURRENT_DATE THEN 'Новые (сегодня)'
        ELSE 'Другое'
    END;


-- ============================================================================
-- ВЫВОДЫ:
-- ============================================================================
-- После выполнения всех запросов выше вы поймете:
-- 1. Сколько точных дубликатов (одинаковое название + цена)
-- 2. Когда были созданы товары (старые vs новые)
-- 3. Есть ли товары с неконвертированными ценами
-- 4. Есть ли дубликаты по slug
--
-- На основе этого можно будет создать стратегию удаления дубликатов
-- ============================================================================
