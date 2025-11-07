-- ============================================
-- SUPABASE SCHEMA для dongfeng-minitraktor
-- ============================================

-- 1. Таблица категорий товаров
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Таблица товаров (мини-тракторы)
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  old_price NUMERIC(10,2),
  image_url TEXT,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  manufacturer TEXT,
  model TEXT,
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  specifications JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Таблица клиентов
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Таблица заказов
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  shipping_address JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Таблица позиций заказа
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Таблица контактных форм
CREATE TABLE IF NOT EXISTS contacts (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ИНДЕКСЫ для ускорения запросов
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ============================================
-- ТЕСТОВЫЕ ДАННЫЕ
-- ============================================

-- Категории
INSERT INTO categories (name, slug, description) VALUES
('Мини-тракторы', 'mini-tractors', 'Компактные тракторы для сельского хозяйства'),
('Запчасти', 'parts', 'Оригинальные запчасти для мини-тракторов'),
('Навесное оборудование', 'equipment', 'Плуги, культиваторы, косилки')
ON CONFLICT (slug) DO NOTHING;

-- Товары (мини-тракторы)
INSERT INTO products (name, slug, description, price, old_price, category_id, manufacturer, model, image_url, in_stock, featured) VALUES
(
  'DONGFENG DF-244',
  'df-244',
  'Компактный мини-трактор DONGFENG DF-244 с дизельным двигателем 24 л.с. Идеален для небольших хозяйств и дачных участков.',
  450000,
  500000,
  (SELECT id FROM categories WHERE slug = 'mini-tractors'),
  'DONGFENG',
  'DF-244',
  '/images/df-244.jpg',
  true,
  true
),
(
  'DONGFENG DF-304',
  'df-304',
  'Мощный мини-трактор DONGFENG DF-304 с дизельным двигателем 30 л.с. Подходит для средних хозяйств.',
  550000,
  600000,
  (SELECT id FROM categories WHERE slug = 'mini-tractors'),
  'DONGFENG',
  'DF-304',
  '/images/df-304.jpg',
  true,
  true
),
(
  'DONGFENG DF-404',
  'df-404',
  'Профессиональный мини-трактор DONGFENG DF-404 с двигателем 40 л.с. Для больших объёмов работ.',
  650000,
  NULL,
  (SELECT id FROM categories WHERE slug = 'mini-tractors'),
  'DONGFENG',
  'DF-404',
  '/images/df-404.jpg',
  true,
  false
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- ВКЛЮЧАЕМ RLS (Row Level Security)
-- ============================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ПОЛИТИКИ ДОСТУПА (публичное чтение)
-- ============================================

-- Категории - все могут читать
CREATE POLICY "Allow public read access on categories"
  ON categories FOR SELECT
  USING (true);

-- Товары - все могут читать
CREATE POLICY "Allow public read access on products"
  ON products FOR SELECT
  USING (true);

-- Контакты - все могут создавать
CREATE POLICY "Allow public insert on contacts"
  ON contacts FOR INSERT
  WITH CHECK (true);

-- ============================================
-- ГОТОВО! ✅
-- ============================================
