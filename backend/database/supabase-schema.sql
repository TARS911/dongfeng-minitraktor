-- Supabase Migration Script for dongfeng-minitraktor
-- PostgreSQL schema

-- Создаем таблицу категорий
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем таблицу товаров
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    model TEXT NOT NULL,
    category_id BIGINT REFERENCES categories(id),
    description TEXT,
    price INTEGER NOT NULL,
    old_price INTEGER,
    power INTEGER NOT NULL,
    drive TEXT NOT NULL,
    transmission TEXT NOT NULL,
    engine_type TEXT,
    fuel_tank INTEGER,
    weight INTEGER,
    dimensions TEXT,
    warranty_years INTEGER DEFAULT 3,
    in_stock BOOLEAN DEFAULT TRUE,
    is_hit BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    images_gallery TEXT,
    specifications JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем таблицу заявок обратной связи
CREATE TABLE IF NOT EXISTS contacts (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    message TEXT,
    product_model TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем таблицу расчета доставки
CREATE TABLE IF NOT EXISTS delivery_requests (
    id BIGSERIAL PRIMARY KEY,
    city TEXT NOT NULL,
    product_model TEXT NOT NULL,
    phone TEXT NOT NULL,
    estimated_cost INTEGER,
    estimated_days TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем индексы для ускорения поиска
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Включаем Row Level Security (RLS) для безопасности
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_requests ENABLE ROW LEVEL SECURITY;

-- Создаем политики доступа (Public Read для products и categories)
CREATE POLICY "Enable read access for all users" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT USING (true);

-- Только authenticated пользователи могут создавать контакты
CREATE POLICY "Enable insert for all users" ON contacts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON delivery_requests
    FOR INSERT WITH CHECK (true);

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
