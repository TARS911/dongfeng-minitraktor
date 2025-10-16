import db from '../config/database.js';

console.log('🗄️  Инициализация базы данных...\n');

// Удаляем существующие таблицы (для чистой установки)
db.exec(`
  DROP TABLE IF EXISTS contacts;
  DROP TABLE IF EXISTS delivery_requests;
  DROP TABLE IF EXISTS products;
  DROP TABLE IF EXISTS categories;
`);

// Создаем таблицу категорий
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('✅ Таблица categories создана');

// Создаем таблицу товаров
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    model TEXT NOT NULL,
    category_id INTEGER,
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
    in_stock BOOLEAN DEFAULT 1,
    is_hit BOOLEAN DEFAULT 0,
    is_new BOOLEAN DEFAULT 0,
    image_url TEXT,
    images_gallery TEXT,
    specifications TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );
`);

console.log('✅ Таблица products создана');

// Создаем таблицу заявок обратной связи
db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    message TEXT,
    product_model TEXT,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('✅ Таблица contacts создана');

// Создаем таблицу расчета доставки
db.exec(`
  CREATE TABLE IF NOT EXISTS delivery_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city TEXT NOT NULL,
    product_model TEXT NOT NULL,
    phone TEXT NOT NULL,
    estimated_cost INTEGER,
    estimated_days TEXT,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('✅ Таблица delivery_requests создана');

// Создаем индексы для ускорения поиска
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
  CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
  CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
  CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
`);

console.log('✅ Индексы созданы');

console.log('\n🎉 База данных успешно инициализирована!');

db.close();
