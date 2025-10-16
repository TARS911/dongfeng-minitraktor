import db from '../../config/database.js';

console.log('⭐ Добавление таблицы отзывов...\n');

// Создаем таблицу отзывов
db.exec(`
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT NOT NULL,
    pros TEXT,
    cons TEXT,
    images TEXT,
    status TEXT DEFAULT 'pending',
    helpful_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );
`);

console.log('✅ Таблица reviews создана');

// Индексы
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
  CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
  CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
`);

console.log('✅ Индексы созданы');

// Добавляем тестовые отзывы
const insertReview = db.prepare(`
  INSERT INTO reviews (
    product_id, customer_name, rating, title, comment, pros, cons, status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, 'approved')
`);

const reviews = [
  [1, 'Иван Петров', 5, 'Отличный трактор!', 'Купил DF-244 для дачи. Очень доволен покупкой! Мощности хватает на все работы.', 'Надежный, экономичный, простой в обслуживании', 'Пока не нашел'],
  [1, 'Сергей Иванов', 4, 'Хорошее соотношение цены и качества', 'Трактор работает отлично, единственное - хотелось бы кабину попрочнее.', 'Цена, мощность, запчасти доступны', 'Кабина могла быть лучше'],
  [2, 'Алексей Смирнов', 5, 'Лучший в своем классе!', 'DF-304 превзошел все ожидания. Работает уже полгода без нареканий.', 'Мощный, надежный, хорошая комплектация', '']
];

reviews.forEach(review => {
  insertReview.run(...review);
});

console.log('✅ Тестовые отзывы добавлены');

console.log('\n🎉 Система отзывов успешно добавлена!');

db.close();
