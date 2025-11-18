-- Supabase Migration: Добавление таблицы запчастей (parts)
-- Версия: 1.1.0
-- Дата: 2025-11-18
-- Описание: Каталог запчастей для минитракторов (2836+ товаров из Agrodom)

-- ============================================
-- ТАБЛИЦА КАТЕГОРИЙ ЗАПЧАСТЕЙ
-- ============================================

CREATE TABLE IF NOT EXISTS parts_categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    parent_id BIGINT REFERENCES parts_categories(id) ON DELETE CASCADE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE parts_categories IS 'Категории запчастей (многоуровневая иерархия)';
COMMENT ON COLUMN parts_categories.parent_id IS 'ID родительской категории для вложенности';

-- ============================================
-- ТАБЛИЦА ЗАПЧАСТЕЙ
-- ============================================

CREATE TABLE IF NOT EXISTS parts (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    sku TEXT,
    category_id BIGINT REFERENCES parts_categories(id) ON DELETE SET NULL,
    subcategory TEXT,

    -- Цена и наличие
    price DECIMAL(10, 2) CHECK (price IS NULL OR price > 0),
    old_price DECIMAL(10, 2) CHECK (old_price IS NULL OR old_price > 0),
    in_stock BOOLEAN DEFAULT TRUE,
    stock_status TEXT DEFAULT 'unknown' CHECK (stock_status IN ('yes', 'no', 'unknown', 'on_order')),

    -- Производитель и совместимость
    manufacturer TEXT,
    compatible_models TEXT[], -- Массив совместимых моделей тракторов
    part_number TEXT, -- Оригинальный артикул производителя

    -- Описание и характеристики
    description TEXT,
    specifications JSONB, -- Технические характеристики в JSON

    -- Медиа
    image_url TEXT,
    images_gallery TEXT[], -- Массив дополнительных фото
    product_url TEXT, -- Ссылка на источник (Agrodom)

    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE parts IS 'Каталог запчастей для минитракторов';
COMMENT ON COLUMN parts.slug IS 'URL-friendly идентификатор запчасти';
COMMENT ON COLUMN parts.sku IS 'Артикул (SKU) - уникальный код товара';
COMMENT ON COLUMN parts.compatible_models IS 'Массив моделей тракторов (DongFeng DF-244, Jinma JM-244 и т.д.)';
COMMENT ON COLUMN parts.stock_status IS 'Статус наличия: yes (в наличии), no (отсутствует), unknown (неизвестно), on_order (под заказ)';
COMMENT ON COLUMN parts.specifications IS 'Технические характеристики в формате JSONB';

-- ============================================
-- ИНДЕКСЫ для ускорения поиска
-- ============================================

CREATE INDEX IF NOT EXISTS idx_parts_slug ON parts(slug);
CREATE INDEX IF NOT EXISTS idx_parts_sku ON parts(sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_parts_category ON parts(category_id);
CREATE INDEX IF NOT EXISTS idx_parts_in_stock ON parts(in_stock);
CREATE INDEX IF NOT EXISTS idx_parts_manufacturer ON parts(manufacturer);
CREATE INDEX IF NOT EXISTS idx_parts_price ON parts(price);
CREATE INDEX IF NOT EXISTS idx_parts_name_search ON parts USING gin(to_tsvector('russian', name));
CREATE INDEX IF NOT EXISTS idx_parts_compatible_models ON parts USING gin(compatible_models);

CREATE INDEX IF NOT EXISTS idx_parts_categories_slug ON parts_categories(slug);
CREATE INDEX IF NOT EXISTS idx_parts_categories_parent ON parts_categories(parent_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE parts_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;

-- Политики для parts_categories: публичное чтение
DROP POLICY IF EXISTS "Публичный доступ на чтение категорий запчастей" ON parts_categories;
CREATE POLICY "Публичный доступ на чтение категорий запчастей" ON parts_categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Изменение категорий запчастей только для авторизованных" ON parts_categories;
CREATE POLICY "Изменение категорий запчастей только для авторизованных" ON parts_categories
    FOR ALL USING (auth.role() = 'authenticated');

-- Политики для parts: публичное чтение
DROP POLICY IF EXISTS "Публичный доступ на чтение запчастей" ON parts;
CREATE POLICY "Публичный доступ на чтение запчастей" ON parts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Изменение запчастей только для авторизованных" ON parts;
CREATE POLICY "Изменение запчастей только для авторизованных" ON parts
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- ТРИГГЕРЫ
-- ============================================

-- Триггер для автоматического обновления updated_at (используем существующую функцию)
DROP TRIGGER IF EXISTS update_parts_updated_at ON parts;
CREATE TRIGGER update_parts_updated_at
    BEFORE UPDATE ON parts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ПОЛЕЗНЫЕ ФУНКЦИИ
-- ============================================

-- Функция для поиска запчастей по тексту (полнотекстовый поиск)
CREATE OR REPLACE FUNCTION search_parts(search_query TEXT)
RETURNS TABLE (
    id BIGINT,
    name TEXT,
    slug TEXT,
    sku TEXT,
    price DECIMAL,
    in_stock BOOLEAN,
    image_url TEXT,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.slug,
        p.sku,
        p.price,
        p.in_stock,
        p.image_url,
        ts_rank(to_tsvector('russian', p.name), plainto_tsquery('russian', search_query)) as rank
    FROM parts p
    WHERE to_tsvector('russian', p.name) @@ plainto_tsquery('russian', search_query)
    ORDER BY rank DESC, p.name;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_parts IS 'Полнотекстовый поиск запчастей по названию (русский язык)';

-- Функция для получения количества запчастей в категории
CREATE OR REPLACE FUNCTION get_parts_category_count(category_slug_param TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM parts p
        JOIN parts_categories c ON p.category_id = c.id
        WHERE c.slug = category_slug_param
    );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_parts_category_count IS 'Возвращает количество запчастей в категории по slug';

-- Функция для получения запчастей по модели трактора
CREATE OR REPLACE FUNCTION get_parts_by_tractor_model(model_name TEXT)
RETURNS TABLE (
    id BIGINT,
    name TEXT,
    slug TEXT,
    price DECIMAL,
    in_stock BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.slug,
        p.price,
        p.in_stock
    FROM parts p
    WHERE model_name = ANY(p.compatible_models)
    ORDER BY p.name;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_parts_by_tractor_model IS 'Возвращает все запчасти совместимые с указанной моделью трактора';

-- ============================================
-- ВЕРСИОНИРОВАНИЕ
-- ============================================

INSERT INTO schema_version (version, description)
VALUES ('1.1.0', 'Добавлены таблицы запчастей: parts, parts_categories')
ON CONFLICT (version) DO NOTHING;

-- ============================================
-- ТЕСТОВЫЕ КАТЕГОРИИ (для примера)
-- ============================================

INSERT INTO parts_categories (name, slug, description) VALUES
    ('Запчасти для тракторов', 'zapchasti-dlya-traktorov', 'Все запчасти для минитракторов'),
    ('DongFeng / MasterYard', 'dongfeng-masteryard', 'Запчасти для тракторов DongFeng и MasterYard'),
    ('Jinma', 'jinma', 'Запчасти для тракторов Jinma'),
    ('Уралец', 'uralets', 'Запчасти для тракторов Уралец'),
    ('Гидравлика', 'gidravlika', 'Гидравлические компоненты и системы'),
    ('Трансмиссия', 'transmissiya', 'Запчасти трансмиссии'),
    ('Двигатель', 'dvigatel', 'Запчасти двигателя'),
    ('Электрооборудование', 'elektrooborudovanie', 'Электрика и электроника'),
    ('Навесное оборудование', 'navesnoe-oborudovanie', 'Запчасти для навесного оборудования')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- ЗАВЕРШЕНИЕ
-- ============================================

DO $$
DECLARE
    parts_count INTEGER;
    categories_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO parts_count FROM parts;
    SELECT COUNT(*) INTO categories_count FROM parts_categories;

    RAISE NOTICE '✅ Миграция запчастей выполнена успешно!';
    RAISE NOTICE 'Категорий запчастей: %', categories_count;
    RAISE NOTICE 'Запчастей в базе: %', parts_count;
END $$;
