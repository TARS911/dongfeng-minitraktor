-- ============================================================================
-- ИСПРАВЛЕНИЕ: 1 товар не был конвертирован (ID 8370)
-- Подъемник в сборе TΛTΛ на трактор DongFeng DF404DHL
-- Курс: 1 UAH = 1.85 RUB
-- ============================================================================

-- Проверка ДО:
SELECT id, name, price as price_uah, ROUND(price * 1.85, 2) as should_be_rub
FROM products
WHERE id = 8370;

-- UPDATE:
UPDATE products
SET
    price = ROUND(price * 1.85, 2),
    updated_at = NOW()
WHERE id = 8370;

-- Проверка ПОСЛЕ:
SELECT id, name, price as price_rub
FROM products
WHERE id = 8370;

-- Ожидаемый результат:
-- price_rub: 24706.75 (было 13355.00)
