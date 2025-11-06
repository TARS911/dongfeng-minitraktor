-- Полная схема базы данных для БелТехФермЪ
-- Выполните этот скрипт в Supabase SQL Editor

-- ========================================
-- 1. Создание таблицы categories
-- ========================================
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- 2. Создание таблицы products
-- ========================================
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),
  image_url TEXT,
  category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
  in_stock BOOLEAN DEFAULT true,
  is_new BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  power INTEGER,
  drive TEXT,
  transmission TEXT,
  specifications JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- 3. Индексы для оптимизации
-- ========================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- ========================================
-- 4. Функция для автоматического обновления updated_at
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================================
-- 5. Триггер для updated_at
-- ========================================
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 6. Включение Row Level Security (RLS)
-- ========================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 7. Политики доступа (публичное чтение)
-- ========================================
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
CREATE POLICY "Enable read access for all users" ON categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON products;
CREATE POLICY "Enable read access for all users" ON products
  FOR SELECT USING (true);

-- ========================================
-- 8. Добавление категорий
-- ========================================
INSERT INTO categories (id, name, slug, description) VALUES
  (7, 'Минитрактора', 'minitractory', 'Компактные и мощные минитрактора DONGFENG для любых сельскохозяйственных задач'),
  (8, 'Коммунальная техника', 'communal-equipment', 'Навесное оборудование для уборки территорий и коммунального хозяйства'),
  (9, 'Запасные части', 'parts', 'Оригинальные запасные части и расходники для техники DONGFENG')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description;

-- ========================================
-- 9. Проверка структуры
-- ========================================
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('categories', 'products')
ORDER BY table_name, ordinal_position;
