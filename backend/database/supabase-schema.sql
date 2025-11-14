-- Supabase Migration Script for dongfeng-minitraktor
-- PostgreSQL schema with Row Level Security (RLS)
-- Версия: 1.0.0

-- ============================================
-- ТАБЛИЦЫ
-- ============================================

-- Создаем таблицу категорий
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE categories IS 'Категории товаров (минитрактора, оборудование, запчасти)';
COMMENT ON COLUMN categories.slug IS 'URL-friendly идентификатор категории';

-- Создаем таблицу товаров
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    model TEXT NOT NULL,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT,
    price INTEGER NOT NULL CHECK (price > 0),
    old_price INTEGER CHECK (old_price IS NULL OR old_price > 0),
    power INTEGER NOT NULL CHECK (power > 0),
    drive TEXT NOT NULL,
    transmission TEXT NOT NULL,
    engine_type TEXT,
    fuel_tank INTEGER CHECK (fuel_tank IS NULL OR fuel_tank > 0),
    weight INTEGER CHECK (weight IS NULL OR weight > 0),
    dimensions TEXT,
    warranty_years INTEGER DEFAULT 3 CHECK (warranty_years >= 0),
    in_stock BOOLEAN DEFAULT TRUE,
    is_hit BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    images_gallery TEXT,
    specifications JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE products IS 'Каталог товаров (минитрактора, оборудование, запчасти)';
COMMENT ON COLUMN products.slug IS 'URL-friendly идентификатор товара';
COMMENT ON COLUMN products.specifications IS 'Технические характеристики в формате JSONB';
COMMENT ON COLUMN products.price IS 'Текущая цена товара в рублях';
COMMENT ON COLUMN products.old_price IS 'Старая цена для отображения скидки';

-- Создаем таблицу заявок обратной связи
CREATE TABLE IF NOT EXISTS contacts (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    message TEXT,
    product_model TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'processing', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE contacts IS 'Заявки обратной связи от клиентов';
COMMENT ON COLUMN contacts.status IS 'Статус обработки: new, processing, completed, cancelled';

-- Создаем таблицу расчета доставки
CREATE TABLE IF NOT EXISTS delivery_requests (
    id BIGSERIAL PRIMARY KEY,
    city TEXT NOT NULL,
    product_model TEXT NOT NULL,
    phone TEXT NOT NULL,
    estimated_cost INTEGER CHECK (estimated_cost IS NULL OR estimated_cost >= 0),
    estimated_days TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'calculated', 'confirmed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE delivery_requests IS 'Запросы на расчет стоимости доставки';
COMMENT ON COLUMN delivery_requests.status IS 'Статус: new, calculated, confirmed, cancelled';

-- ============================================
-- ИНДЕКСЫ для ускорения поиска
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_is_hit ON products(is_hit);
CREATE INDEX IF NOT EXISTS idx_products_is_new ON products(is_new);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_delivery_requests_status ON delivery_requests(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Включаем Row Level Security для всех таблиц
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_requests ENABLE ROW LEVEL SECURITY;

-- Политики для categories: публичное чтение
DROP POLICY IF EXISTS "Публичный доступ на чтение категорий" ON categories;
CREATE POLICY "Публичный доступ на чтение категорий" ON categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Изменение категорий только для авторизованных" ON categories;
CREATE POLICY "Изменение категорий только для авторизованных" ON categories
    FOR ALL USING (auth.role() = 'authenticated');

-- Политики для products: публичное чтение
DROP POLICY IF EXISTS "Публичный доступ на чтение товаров" ON products;
CREATE POLICY "Публичный доступ на чтение товаров" ON products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Изменение товаров только для авторизованных" ON products;
CREATE POLICY "Изменение товаров только для авторизованных" ON products
    FOR ALL USING (auth.role() = 'authenticated');

-- Политики для contacts: анонимная вставка, чтение только для авторизованных
DROP POLICY IF EXISTS "Анонимное создание контактов" ON contacts;
CREATE POLICY "Анонимное создание контактов" ON contacts
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Чтение контактов только для авторизованных" ON contacts;
CREATE POLICY "Чтение контактов только для авторизованных" ON contacts
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Обновление контактов только для авторизованных" ON contacts;
CREATE POLICY "Обновление контактов только для авторизованных" ON contacts
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Политики для delivery_requests: анонимная вставка, чтение только для авторизованных
DROP POLICY IF EXISTS "Анонимное создание запросов доставки" ON delivery_requests;
CREATE POLICY "Анонимное создание запросов доставки" ON delivery_requests
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Чтение запросов доставки только для авторизованных" ON delivery_requests;
CREATE POLICY "Чтение запросов доставки только для авторизованных" ON delivery_requests
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Обновление запросов доставки только для авторизованных" ON delivery_requests;
CREATE POLICY "Обновление запросов доставки только для авторизованных" ON delivery_requests
    FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================
-- ТРИГГЕРЫ
-- ============================================

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ВЕРСИОНИРОВАНИЕ СХЕМЫ
-- ============================================

CREATE TABLE IF NOT EXISTS schema_version (
    version TEXT PRIMARY KEY,
    description TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE schema_version IS 'Версии миграций схемы БД';

-- Вставляем текущую версию
INSERT INTO schema_version (version, description)
VALUES ('1.0.0', 'Начальная схема: категории, товары, контакты, доставка')
ON CONFLICT (version) DO NOTHING;

-- ============================================
-- ПОЛЕЗНЫЕ ФУНКЦИИ
-- ============================================

-- Функция для получения количества товаров в категории
CREATE OR REPLACE FUNCTION get_category_product_count(category_slug_param TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE c.slug = category_slug_param
    );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_category_product_count IS 'Возвращает количество товаров в категории по slug';

-- ============================================
-- ЗАВЕРШЕНИЕ
-- ============================================

-- Вывод информации о таблицах
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';

    RAISE NOTICE '✅ Схема создана успешно!';
    RAISE NOTICE 'Таблиц создано: %', table_count;
END $$;
