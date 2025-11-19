-- Добавление индексов в таблицу products для быстрой фильтрации

-- Индекс на производителя (для фильтрации по брендам)
CREATE INDEX IF NOT EXISTS idx_products_manufacturer ON products(manufacturer);

-- Индекс на модель (для фильтрации по моделям)
CREATE INDEX IF NOT EXISTS idx_products_model ON products(model);

-- Индекс на наличие (для показа только товаров в наличии)
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);

-- Составной индекс для частых запросов (производитель + наличие)
CREATE INDEX IF NOT EXISTS idx_products_manufacturer_in_stock ON products(manufacturer, in_stock);

-- Индекс на цену (для сортировки)
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Индекс на дату создания (для сортировки новинок)
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Индекс на slug (для быстрого поиска по URL)
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Полнотекстовый поиск по названию
CREATE INDEX IF NOT EXISTS idx_products_name_gin ON products USING gin(to_tsvector('russian', name));
