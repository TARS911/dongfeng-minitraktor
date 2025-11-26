-- ============================================================================
-- ТРАНСЛИТЕРАЦИЯ КИРИЛЛИЧЕСКИХ SLUG'ОВ В ЛАТИНИЦУ
-- ============================================================================
-- Исправляет ВСЕ slug с кириллицей на латиницу
-- Применяется ко всем товарам, включая 1,350 товаров с одинаковыми названиями
-- ============================================================================

-- Создаем функцию транслитерации
CREATE OR REPLACE FUNCTION transliterate_cyrillic(text) RETURNS text AS $$
BEGIN
    RETURN lower(
        translate(
            $1,
            'абвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ',
            'abvgdeyozhziyklmnoprstufhtschchshschyeyuyaABVGDEYOZHZIYKLMNOPRSTUFHTSCHCHSHSCHYEYUYA'
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Транслитерация для более точной замены букв
CREATE OR REPLACE FUNCTION transliterate_slug(slug_text text) RETURNS text AS $$
DECLARE
    result text;
BEGIN
    result := slug_text;

    -- Заменяем двухбуквенные комбинации
    result := replace(result, 'ё', 'yo');
    result := replace(result, 'ж', 'zh');
    result := replace(result, 'й', 'y');
    result := replace(result, 'ц', 'ts');
    result := replace(result, 'ч', 'ch');
    result := replace(result, 'ш', 'sh');
    result := replace(result, 'щ', 'sch');
    result := replace(result, 'ю', 'yu');
    result := replace(result, 'я', 'ya');

    result := replace(result, 'Ё', 'Yo');
    result := replace(result, 'Ж', 'Zh');
    result := replace(result, 'Й', 'Y');
    result := replace(result, 'Ц', 'Ts');
    result := replace(result, 'Ч', 'Ch');
    result := replace(result, 'Ш', 'Sh');
    result := replace(result, 'Щ', 'Sch');
    result := replace(result, 'Ю', 'Yu');
    result := replace(result, 'Я', 'Ya');

    -- Заменяем однобуквенные
    result := translate(result,
        'абвгдезиклмнопрстуфхыэъьАБВГДЕЗИКЛМНОПРСТУФХЫЭЪЬ',
        'abvgdeziklmnoprstufhyeABVGDEZIKLMNOPRSTUFHYE'
    );

    -- Приводим к нижнему регистру
    result := lower(result);

    -- Убираем множественные дефисы
    result := regexp_replace(result, '-+', '-', 'g');

    -- Убираем дефисы в начале/конце
    result := trim(both '-' from result);

    RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- ПРЕДВАРИТЕЛЬНАЯ ПРОВЕРКА
-- ============================================================================

-- Проверяем, сколько товаров с кириллицей
SELECT
    'Товаров с кириллицей в slug' as metric,
    COUNT(*) as count
FROM products
WHERE slug ~ '[а-яА-ЯёЁ]';

-- Примеры slug, которые будут исправлены
SELECT
    id,
    name,
    slug as old_slug,
    transliterate_slug(slug) as new_slug
FROM products
WHERE slug ~ '[а-яА-ЯёЁ]'
ORDER BY id
LIMIT 20;

-- ============================================================================
-- ВЫПОЛНЕНИЕ ТРАНСЛИТЕРАЦИИ
-- ============================================================================

-- ВНИМАНИЕ! Следующий запрос изменяет данные!
-- Убедитесь, что вы проверили примеры выше

UPDATE products
SET
    slug = transliterate_slug(slug),
    updated_at = NOW()
WHERE slug ~ '[а-яА-ЯёЁ]';

-- ============================================================================
-- ФИНАЛЬНАЯ ПРОВЕРКА
-- ============================================================================

-- Проверяем, остались ли товары с кириллицей
SELECT
    'Товаров с кириллицей после исправления' as metric,
    COUNT(*) as count
FROM products
WHERE slug ~ '[а-яА-ЯёЁ]';

-- Проверяем исправленные slug (первые 20)
SELECT
    id,
    name,
    slug
FROM products
WHERE updated_at > NOW() - INTERVAL '5 minutes'
ORDER BY id
LIMIT 20;

-- Статистика по всем товарам
SELECT
    'Всего товаров' as metric,
    COUNT(*) as count
FROM products

UNION ALL

SELECT
    'Товаров с латинскими slug',
    COUNT(*)
FROM products
WHERE slug !~ '[а-яА-ЯёЁ]'

UNION ALL

SELECT
    'Товаров с кириллическими slug',
    COUNT(*)
FROM products
WHERE slug ~ '[а-яА-ЯёЁ]';

-- ============================================================================
-- ОЧИСТКА
-- ============================================================================

-- Можно удалить функции после выполнения (опционально)
-- DROP FUNCTION IF EXISTS transliterate_cyrillic(text);
-- DROP FUNCTION IF EXISTS transliterate_slug(text);

-- ============================================================================
-- ИТОГ
-- ============================================================================
-- После выполнения этого скрипта:
-- - Все slug с кириллицей будут транслитерированы в латиницу
-- - Множественные дефисы будут убраны
-- - Дефисы в начале/конце будут убраны
-- - Все slug будут в нижнем регистре
-- ============================================================================
