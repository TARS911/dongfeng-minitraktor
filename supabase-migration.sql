-- Миграция для добавления недостающих полей в таблицу products
-- Выполните этот скрипт в Supabase SQL Editor, если у вас уже есть таблица products

-- ========================================
-- 1. Добавление недостающих колонок
-- ========================================

-- Добавляем is_featured, если её нет
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Добавляем is_new, если её нет
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_new'
  ) THEN
    ALTER TABLE products ADD COLUMN is_new BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Добавляем updated_at, если её нет
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;
  END IF;
END $$;

-- Добавляем power, если её нет
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'power'
  ) THEN
    ALTER TABLE products ADD COLUMN power INTEGER;
  END IF;
END $$;

-- Добавляем drive, если её нет
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'drive'
  ) THEN
    ALTER TABLE products ADD COLUMN drive TEXT;
  END IF;
END $$;

-- Добавляем transmission, если её нет
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'transmission'
  ) THEN
    ALTER TABLE products ADD COLUMN transmission TEXT;
  END IF;
END $$;

-- ========================================
-- 2. Создание индексов
-- ========================================
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_new ON products(is_new);

-- ========================================
-- 3. Функция и триггер для updated_at
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 4. Проверка результата
-- ========================================
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- Показать количество записей
SELECT
  COUNT(*) as total_products,
  SUM(CASE WHEN in_stock THEN 1 ELSE 0 END) as in_stock_count,
  SUM(CASE WHEN is_featured THEN 1 ELSE 0 END) as featured_count,
  SUM(CASE WHEN is_new THEN 1 ELSE 0 END) as new_count
FROM products;
