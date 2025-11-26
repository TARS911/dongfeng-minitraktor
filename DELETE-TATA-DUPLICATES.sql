-- ============================================================================
-- УДАЛЕНИЕ ДУБЛИКАТОВ ТОВАРОВ TATA-AGRO
-- ============================================================================
-- На основе глубокого исследования:
-- - Найдено 133 точных дубликата (одинаковое название + цена)
-- - Найдено 27 товаров с неконвертированными ценами (< 25 руб)
-- - Товары с одинаковым названием но РАЗНЫМИ ценами НЕ удаляются
--   (это могут быть разные модификации)
-- ============================================================================

-- ШАГ 1: КОНВЕРТАЦИЯ НЕКОНВЕРТИРОВАННЫХ ЦЕН
-- ============================================================================
-- Товары с ценой < 25 руб не были конвертированы из UAH в RUB
-- Нужно умножить на 1.85

UPDATE products
SET
    price = ROUND(price * 1.85, 2),
    updated_at = NOW()
WHERE image_url LIKE '%tata-agro%'
  AND price < 25
  AND price > 0;

-- Проверка результата:
SELECT
    'После конвертации' as step,
    COUNT(*) as count,
    MIN(price) as min_price,
    MAX(price) as max_price
FROM products
WHERE image_url LIKE '%tata-agro%';


-- ============================================================================
-- ШАГ 2: УДАЛЕНИЕ ТОЧНЫХ ДУБЛИКАТОВ (название + цена)
-- ============================================================================
-- Стратегия: из каждой группы дубликатов оставляем товар с МИНИМАЛЬНЫМ ID
-- (самый старый), остальные удаляем

-- Сначала посмотрим, что будем удалять:
WITH duplicates AS (
    SELECT
        id,
        name,
        price,
        created_at,
        ROW_NUMBER() OVER (PARTITION BY name, price ORDER BY id) as rn
    FROM products
    WHERE image_url LIKE '%tata-agro%'
)
SELECT
    'Будет удалено точных дубликатов:' as info,
    COUNT(*) as count
FROM duplicates
WHERE rn > 1;

-- Примеры товаров, которые будут удалены:
WITH duplicates AS (
    SELECT
        id,
        name,
        price,
        created_at,
        ROW_NUMBER() OVER (PARTITION BY name, price ORDER BY id) as rn
    FROM products
    WHERE image_url LIKE '%tata-agro%'
)
SELECT
    id,
    name,
    price,
    created_at
FROM duplicates
WHERE rn > 1
ORDER BY id
LIMIT 20;

-- ВНИМАНИЕ! Следующий запрос УДАЛЯЕТ данные.
-- Убедитесь, что вы проверили результаты выше перед выполнением.
-- ============================================================================

-- УДАЛЕНИЕ ТОЧНЫХ ДУБЛИКАТОВ:
WITH duplicates AS (
    SELECT
        id,
        ROW_NUMBER() OVER (PARTITION BY name, price ORDER BY id) as rn
    FROM products
    WHERE image_url LIKE '%tata-agro%'
)
DELETE FROM products
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- ============================================================================
-- ШАГ 3: ФИНАЛЬНАЯ ПРОВЕРКА
-- ============================================================================

-- Общая статистика после очистки:
SELECT
    'Всего товаров tata-agro' as metric,
    COUNT(*) as count
FROM products
WHERE image_url LIKE '%tata-agro%'

UNION ALL

SELECT
    'Уникальных названий',
    COUNT(DISTINCT name)
FROM products
WHERE image_url LIKE '%tata-agro%'

UNION ALL

SELECT
    'Товаров с дубликатами названий',
    COUNT(*)
FROM (
    SELECT name
    FROM products
    WHERE image_url LIKE '%tata-agro%'
    GROUP BY name
    HAVING COUNT(*) > 1
) subq

UNION ALL

SELECT
    'Точных дубликатов (название + цена)',
    COUNT(*)
FROM (
    SELECT name, price
    FROM products
    WHERE image_url LIKE '%tata-agro%'
    GROUP BY name, price
    HAVING COUNT(*) > 1
) subq;

-- Проверка цен:
SELECT
    'Минимальная цена' as metric,
    MIN(price) as value
FROM products
WHERE image_url LIKE '%tata-agro%'

UNION ALL

SELECT
    'Максимальная цена',
    MAX(price)
FROM products
WHERE image_url LIKE '%tata-agro%'

UNION ALL

SELECT
    'Средняя цена',
    ROUND(AVG(price), 2)
FROM products
WHERE image_url LIKE '%tata-agro%'

UNION ALL

SELECT
    'Товаров с ценой < 25 руб',
    COUNT(*)
FROM products
WHERE image_url LIKE '%tata-agro%' AND price < 25;

-- ============================================================================
-- ИТОГОВЫЙ РЕЗУЛЬТАТ
-- ============================================================================
-- После выполнения этого скрипта должно остаться:
-- - ~2,433 товаров (3566 - 133 точных дубликата)
-- - 0 товаров с ценой < 25 руб (все конвертированы)
-- - ~1,362 товаров с дубликатами названий, но разными ценами (оставляем!)
--
-- ВАЖНО: Товары с одинаковым названием но РАЗНЫМИ ценами НЕ удаляются,
-- т.к. это могут быть разные модификации одного и того же товара
-- ============================================================================
