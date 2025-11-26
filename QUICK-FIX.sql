-- ============================================================================
-- БЫСТРОЕ ИСПРАВЛЕНИЕ БД SUPABASE
-- Скопируйте и запустите в: https://supabase.com/dashboard/project/dpsykseeqloturowdyzf/sql
-- ============================================================================

-- ШАГ 1: Создать категории (если еще нет)
-- ============================================================================
INSERT INTO categories (name, slug, description) VALUES
('ДВС в сборе', 'engines-assembled', 'Полнокомплектные дизельные двигатели'),
('Запчасти на ДВС', 'engine-parts', 'Запасные части для двигателей'),
('Запчасти на Минитракторы', 'tractor-parts', 'Запчасти для минитракторов'),
('Минитракторы', 'mini-tractors', 'Минитракторы различных брендов'),
('Ходовая часть', 'chassis', 'Детали ходовой части'),
('Трансмиссия', 'transmission', 'Детали трансмиссии'),
('Карданные валы', 'cardan-shafts', 'Карданные валы и крестовины'),
('Топливная система', 'fuel-system', 'Компоненты топливной системы'),
('Фильтры', 'filters', 'Масляные, топливные, воздушные фильтры'),
('Гидравлика', 'hydraulics', 'Гидравлические компоненты'),
('Колёса и шины', 'wheels-tires', 'Колёса, диски, шины'),
('Электрика', 'electrical', 'Электрооборудование'),
('Система охлаждения', 'cooling-system', 'Радиаторы, термостаты'),
('Тормозная система', 'brake-system', 'Тормозные диски, колодки'),
('Рулевое управление', 'steering', 'Компоненты рулевого управления'),
('Ремни', 'belts', 'Приводные ремни'),
('Навесное оборудование', 'attachments', 'Навесное оборудование'),
('Пресс-подборщики', 'balers', 'Пресс-подборщики'),
('Плуги', 'plows', 'Плуги различных типов'),
('Культиваторы', 'cultivators', 'Культиваторы'),
('Бороны', 'harrows', 'Бороны дисковые'),
('Косилки', 'mowers', 'Косилки роторные'),
('Грабли-ворошилки', 'rakes', 'Грабли-ворошилки'),
('Почвофрезы', 'rotary-tillers', 'Почвофрезы'),
('Картофелекопалки', 'potato-diggers', 'Картофелекопалки и сажалки')
ON CONFLICT (slug) DO NOTHING;


-- ШАГ 2: Добавить индексы для скорости
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_manufacturer ON products(manufacturer);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- GIN индекс для полнотекстового поиска
CREATE INDEX IF NOT EXISTS idx_products_title_gin
ON products USING GIN (to_tsvector('russian', title));

-- Составные индексы
CREATE INDEX IF NOT EXISTS idx_products_category_stock
ON products(category, stock) WHERE stock > 0;

CREATE INDEX IF NOT EXISTS idx_products_manufacturer_category
ON products(manufacturer, category);


-- ШАГ 3: ИСПРАВИТЬ КАТЕГОРИИ ДВС
-- ============================================================================
-- Перенести полные ДВС из "Запчасти на ДВС" в "ДВС в сборе"
UPDATE products
SET category = 'ДВС в сборе'
WHERE category = 'Запчасти на ДВС'
  AND (
    title ILIKE '%Двигатель дизельный%л.с%' OR
    title ILIKE '%Дизельный двигатель%л.с%'
  )
  AND title NOT ILIKE '%редуктор%'
  AND title NOT ILIKE '%вентилятор%'
  AND title NOT ILIKE '%стартер%'
  AND title NOT ILIKE '%сальник%'
  AND title NOT ILIKE '%коленвал%'
  AND title NOT ILIKE '%шестерня%';


-- ШАГ 4: Синхронизировать category_id с category
-- ============================================================================
UPDATE products p
SET category_id = c.id
FROM categories c
WHERE p.category = c.name
  AND (p.category_id IS NULL OR p.category_id != c.id);


-- ШАГ 5: Обновить статистику
-- ============================================================================
ANALYZE products;
ANALYZE categories;


-- ============================================================================
-- ПРОВЕРКА РЕЗУЛЬТАТОВ
-- ============================================================================

-- Количество товаров по категориям
SELECT
    category,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE stock > 0) as in_stock
FROM products
WHERE category IS NOT NULL
GROUP BY category
ORDER BY count DESC;

-- Проверить ДВС
SELECT id, title, category, manufacturer
FROM products
WHERE category = 'ДВС в сборе'
ORDER BY id;

-- Проверить индексы
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'products'
ORDER BY indexname;
