-- ============================================================================
-- КОНВЕРТАЦИЯ ЦЕН ТОВАРОВ TATA-AGRO ИЗ ГРИВЕН В РУБЛИ
-- Курс: 1 UAH = 1.85 RUB
-- Количество товаров: 286
-- ============================================================================
-- Запустите в: https://supabase.com/dashboard/project/dpsykseeqloturowdyzf/sql
-- ============================================================================

-- ШАГ 1: ПОКАЗАТЬ ЦЕНЫ ДО КОНВЕРТАЦИИ
-- ============================================================================
SELECT
    'ДО КОНВЕРТАЦИИ (UAH - гривны)' as status,
    COUNT(*) as total_products,
    MIN(price) as min_price_uah,
    MAX(price) as max_price_uah,
    ROUND(AVG(price), 2) as avg_price_uah
FROM products
WHERE image_url LIKE '%tata-agro%'
  AND price IS NOT NULL
  AND price > 0;

-- Примеры товаров ДО конвертации
SELECT
    id,
    price as price_uah,
    ROUND(price * 1.85, 2) as will_be_rub,
    LEFT(name, 60) as product_name
FROM products
WHERE image_url LIKE '%tata-agro%'
  AND price IS NOT NULL
  AND price > 0
ORDER BY price DESC
LIMIT 10;


-- ШАГ 2: КОНВЕРТАЦИЯ ЦЕН (UAH → RUB × 1.85)
-- ============================================================================
-- ВНИМАНИЕ! Это действие обновит цены ВСЕХ 286 товаров tata-agro!
-- Раскомментируйте строки ниже, когда будете готовы:

/*
UPDATE products
SET
    price = ROUND(price * 1.85, 2),
    old_price = CASE
        WHEN old_price IS NOT NULL AND old_price > 0
        THEN ROUND(old_price * 1.85, 2)
        ELSE old_price
    END,
    updated_at = NOW()
WHERE image_url LIKE '%tata-agro%'
  AND price IS NOT NULL
  AND price > 0;
*/


-- ШАГ 3: ПРОВЕРКА РЕЗУЛЬТАТОВ ПОСЛЕ КОНВЕРТАЦИИ
-- ============================================================================
SELECT
    'ПОСЛЕ КОНВЕРТАЦИИ (RUB - рубли)' as status,
    COUNT(*) as total_products,
    MIN(price) as min_price_rub,
    MAX(price) as max_price_rub,
    ROUND(AVG(price), 2) as avg_price_rub
FROM products
WHERE image_url LIKE '%tata-agro%'
  AND price IS NOT NULL
  AND price > 0;

-- Примеры товаров ПОСЛЕ конвертации
SELECT
    id,
    price as price_rub,
    LEFT(name, 60) as product_name
FROM products
WHERE image_url LIKE '%tata-agro%'
  AND price IS NOT NULL
  AND price > 0
ORDER BY price DESC
LIMIT 10;


-- ШАГ 4: ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА
-- ============================================================================
-- Проверяем, что конвертация прошла корректно
-- (цены должны быть больше исходных примерно в 1.85 раза)

SELECT
    COUNT(*) as converted_products,
    MIN(price) as min_rub,
    MAX(price) as max_rub
FROM products
WHERE image_url LIKE '%tata-agro%'
  AND price > 20;  -- Минимальная цена после конвертации должна быть > 20 руб


-- ============================================================================
-- ИНСТРУКЦИЯ:
-- ============================================================================
-- 1. Запустите ШАГ 1 - посмотрите текущие цены в гривнах
-- 2. Раскомментируйте UPDATE в ШАГ 2 (уберите /* и */)
-- 3. Выполните UPDATE - цены будут конвертированы
-- 4. Запустите ШАГ 3 - проверьте новые цены в рублях
--
-- РЕЗУЛЬТАТ:
-- ✅ 286 товаров tata-agro будут с ценами в рублях
-- ✅ Курс: 1 UAH = 1.85 RUB
-- ✅ old_price тоже будет конвертирован (если есть)
-- ============================================================================
