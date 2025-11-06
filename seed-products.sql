-- Добавление тестовых товаров в Supabase
-- Скопируйте этот код и запустите в Supabase SQL Editor

-- Удаляем старые товары (если есть)
DELETE FROM products;

-- Добавляем товары по категориям

-- ========================================
-- КАТЕГОРИЯ 1: Минитрактора (ID = 7)
-- ========================================
INSERT INTO products (name, slug, description, price, original_price, image_url, category_id, in_stock, is_new, is_featured, power, drive, transmission, specifications) VALUES
(
  'DONGFENG DF-244',
  'df-244',
  'Компактный мини-трактор с кабиной, идеально подходит для небольших хозяйств и дачных участков. Полный привод 4WD обеспечивает отличную проходимость.',
  850000,
  950000,
  'https://via.placeholder.com/400x300?text=DF-244',
  7,
  true,
  true,
  true,
  24,
  '4WD',
  'Механическая',
  '{"engine": {"type": "4-цилиндровый дизельный", "displacement": "2.4L", "cooling": "Водяное охлаждение", "power": "24 л.с."}, "transmission": {"type": "Механическая", "gears": "8 вперед / 2 назад"}, "dimensions": {"length": "3200 мм", "width": "1500 мм", "height": "2400 мм", "weight": "1200 кг"}, "features": ["Кабина с отоплением", "Полный привод 4WD", "Гидравлическая навеска", "Блокировка дифференциала"]}'::jsonb
),
(
  'DONGFENG DF-354',
  'df-354',
  'Мощный и надежный трактор для серьезных сельскохозяйственных задач. Увеличенная мощность двигателя позволяет работать с тяжелым навесным оборудованием.',
  1200000,
  1350000,
  'https://via.placeholder.com/400x300?text=DF-354',
  7,
  true,
  false,
  true,
  35,
  '4WD',
  'Механическая',
  '{"engine": {"type": "4-цилиндровый дизельный", "displacement": "3.5L", "cooling": "Водяное охлаждение", "power": "35 л.с."}, "transmission": {"type": "Механическая", "gears": "12 вперед / 4 назад"}, "dimensions": {"length": "3600 мм", "width": "1700 мм", "height": "2500 мм", "weight": "1600 кг"}, "features": ["Усиленная рама", "Полный привод 4WD", "Двойная гидравлика", "Комфортная кабина"]}'::jsonb
),
(
  'DONGFENG DF-454',
  'df-454',
  'Профессиональный трактор высокого класса для интенсивного использования. Максимальная мощность и производительность.',
  1500000,
  1700000,
  'https://via.placeholder.com/400x300?text=DF-454',
  7,
  true,
  true,
  true,
  45,
  '4WD',
  'Механическая',
  '{"engine": {"type": "4-цилиндровый дизельный турбо", "displacement": "4.5L", "cooling": "Водяное охлаждение", "power": "45 л.с."}, "transmission": {"type": "Механическая", "gears": "16 вперед / 8 назад"}, "dimensions": {"length": "4000 мм", "width": "1850 мм", "height": "2600 мм", "weight": "2000 кг"}, "features": ["Турбированный двигатель", "Полный привод 4WD", "Тройная гидравлика", "Кондиционер", "Круиз-контроль"]}'::jsonb
);

-- ========================================
-- КАТЕГОРИЯ 2: Коммунальная техника (ID = 8)
-- ========================================
INSERT INTO products (name, slug, description, price, image_url, category_id, in_stock, is_new, is_featured, specifications) VALUES
(
  'Снегоуборщик для минитрактора',
  'snow-plow',
  'Навесной снегоуборщик для эффективной очистки территорий от снега. Совместим со всеми моделями DONGFENG.',
  85000,
  'https://via.placeholder.com/400x300?text=Snow-Plow',
  8,
  true,
  false,
  false,
  '{"width": "1500 мм", "type": "Роторный", "compatibility": ["DF-244", "DF-354", "DF-454"], "features": ["Регулируемый угол выброса", "Дальность выброса до 10м", "Прочная конструкция"]}'::jsonb
),
(
  'Коммунальная щетка',
  'sweeper-brush',
  'Универсальная щетка для уборки дорог, тротуаров и территорий. Подходит для круглогодичного использования.',
  65000,
  'https://via.placeholder.com/400x300?text=Sweeper',
  8,
  true,
  true,
  false,
  '{"width": "1200 мм", "type": "Роторная щетка", "compatibility": ["DF-244", "DF-354", "DF-454"], "features": ["Регулируемая скорость вращения", "Боковой выброс мусора", "Износостойкая щетина"]}'::jsonb
);

-- ========================================
-- КАТЕГОРИЯ 3: Запасные части (ID = 9)
-- ========================================
INSERT INTO products (name, slug, description, price, image_url, category_id, in_stock, is_new, is_featured, specifications) VALUES
(
  'Фильтр масляный DONGFENG',
  'oil-filter',
  'Оригинальный масляный фильтр для двигателей DONGFENG. Обеспечивает надежную защиту двигателя.',
  850,
  'https://via.placeholder.com/400x300?text=Oil-Filter',
  9,
  true,
  false,
  false,
  '{"compatibility": ["DF-244", "DF-354", "DF-454"], "type": "Оригинальная запчасть", "article": "DF-OF-001"}'::jsonb
),
(
  'Фильтр воздушный DONGFENG',
  'air-filter',
  'Оригинальный воздушный фильтр. Защищает двигатель от пыли и загрязнений.',
  1200,
  'https://via.placeholder.com/400x300?text=Air-Filter',
  9,
  true,
  false,
  false,
  '{"compatibility": ["DF-244", "DF-354", "DF-454"], "type": "Оригинальная запчасть", "article": "DF-AF-001"}'::jsonb
),
(
  'Комплект ремней DONGFENG',
  'belt-kit',
  'Полный комплект приводных ремней для технического обслуживания.',
  4500,
  'https://via.placeholder.com/400x300?text=Belt-Kit',
  9,
  true,
  true,
  false,
  '{"compatibility": ["DF-244", "DF-354"], "type": "Оригинальная запчасть", "article": "DF-BK-001", "contents": "3 ремня в комплекте"}'::jsonb
);

-- Проверяем результат
SELECT
  p.id,
  p.name,
  p.price,
  c.name as category,
  p.in_stock,
  p.is_featured
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
ORDER BY c.id, p.id;
