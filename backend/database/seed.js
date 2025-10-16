import db from '../config/database.js';

console.log('🌱 Заполнение базы данных тестовыми данными...\n');

// Вставка категорий
const insertCategory = db.prepare(`
  INSERT INTO categories (name, slug, description)
  VALUES (?, ?, ?)
`);

const categories = [
  ['Минитрактора', 'minitractory', 'Компактные тракторы для дачи и небольших хозяйств'],
  ['Навесное оборудование', 'equipment', 'Навесное оборудование для минитракторов'],
  ['Запчасти', 'parts', 'Оригинальные запчасти DONGFENG']
];

categories.forEach(cat => {
  insertCategory.run(...cat);
});

console.log('✅ Категории добавлены');

// Вставка товаров
const insertProduct = db.prepare(`
  INSERT INTO products (
    name, slug, model, category_id, description, price, old_price,
    power, drive, transmission, engine_type, fuel_tank, weight,
    dimensions, warranty_years, in_stock, is_hit, is_new, image_url, specifications
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  )
`);

const products = [
  [
    'Минитрактор DONGFENG DF-244',
    'df-244',
    'DF-244',
    1, // category_id
    'Надежный минитрактор для небольших хозяйств и дачных участков. Отличное соотношение цены и качества.',
    285000,
    null,
    24, // power
    '4x4',
    '8+8',
    'Дизельный, 3-цилиндровый',
    30, // fuel_tank
    850, // weight
    '2800x1300x1450',
    3, // warranty_years
    1, // in_stock
    1, // is_hit
    0, // is_new
    '/images/tractor-1.jpg',
    JSON.stringify({
      engine: {
        type: 'Дизельный',
        cylinders: 3,
        displacement: '1.5 л',
        cooling: 'Водяное охлаждение',
        start: 'Электростартер'
      },
      transmission: {
        type: 'Механическая',
        gears: '8 вперед / 8 назад',
        clutch: 'Сухое, однодисковое'
      },
      hydraulics: {
        lift_capacity: '600 кг',
        connections: '2 задних вывода'
      },
      dimensions: {
        length: '2800 мм',
        width: '1300 мм',
        height: '1450 мм',
        clearance: '300 мм'
      }
    })
  ],
  [
    'Минитрактор DONGFENG DF-304',
    'df-304',
    'DF-304',
    1,
    'Мощный и производительный минитрактор для фермерских хозяйств. Новинка 2024 года с улучшенными характеристиками.',
    385000,
    420000, // old_price
    30,
    '4x4',
    '12+12',
    'Дизельный, 3-цилиндровый',
    40,
    950,
    '3000x1400x1500',
    3,
    1,
    0,
    1, // is_new
    '/images/tractor-2.jpg',
    JSON.stringify({
      engine: {
        type: 'Дизельный',
        cylinders: 3,
        displacement: '1.8 л',
        cooling: 'Водяное охлаждение',
        start: 'Электростартер'
      },
      transmission: {
        type: 'Механическая',
        gears: '12 вперед / 12 назад',
        clutch: 'Сухое, двухдисковое'
      },
      hydraulics: {
        lift_capacity: '800 кг',
        connections: '3 задних вывода'
      },
      dimensions: {
        length: '3000 мм',
        width: '1400 мм',
        height: '1500 мм',
        clearance: '320 мм'
      }
    })
  ],
  [
    'Минитрактор DONGFENG DF-404',
    'df-404',
    'DF-404',
    1,
    'Профессиональный минитрактор повышенной мощности для интенсивной работы. Идеален для крупных участков.',
    485000,
    null,
    40,
    '4x4',
    '16+8',
    'Дизельный, 4-цилиндровый',
    50,
    1100,
    '3200x1500x1600',
    3,
    1,
    0,
    0,
    '/images/tractor-3.jpg',
    JSON.stringify({
      engine: {
        type: 'Дизельный',
        cylinders: 4,
        displacement: '2.2 л',
        cooling: 'Водяное охлаждение',
        start: 'Электростартер'
      },
      transmission: {
        type: 'Механическая',
        gears: '16 вперед / 8 назад',
        clutch: 'Сухое, двухдисковое усиленное'
      },
      hydraulics: {
        lift_capacity: '1000 кг',
        connections: '4 задних вывода + передний ВОМ'
      },
      dimensions: {
        length: '3200 мм',
        width: '1500 мм',
        height: '1600 мм',
        clearance: '350 мм'
      }
    })
  ],
  [
    'Минитрактор DONGFENG DF-354',
    'df-354',
    'DF-354',
    1,
    'Универсальный минитрактор среднего класса. Оптимален для работы на участках до 5 гектаров.',
    435000,
    null,
    35,
    '4x4',
    '12+12',
    'Дизельный, 4-цилиндровый',
    45,
    1000,
    '3100x1450x1550',
    3,
    1,
    0,
    0,
    '/images/tractor-1.jpg',
    JSON.stringify({
      engine: {
        type: 'Дизельный',
        cylinders: 4,
        displacement: '2.0 л',
        cooling: 'Водяное охлаждение',
        start: 'Электростартер'
      },
      transmission: {
        type: 'Механическая',
        gears: '12 вперед / 12 назад',
        clutch: 'Сухое, двухдисковое'
      },
      hydraulics: {
        lift_capacity: '900 кг',
        connections: '3 задних вывода'
      },
      dimensions: {
        length: '3100 мм',
        width: '1450 мм',
        height: '1550 мм',
        clearance: '330 мм'
      }
    })
  ],
  [
    'Плуг однокорпусный ПЛ-1',
    'plug-pl-1',
    'ПЛ-1',
    2, // Навесное оборудование
    'Однокорпусный плуг для вспашки почвы. Совместим со всеми моделями минитракторов DONGFENG.',
    15000,
    null,
    0, // power (не применимо для навесного)
    'N/A',
    'N/A',
    null,
    null,
    45,
    '800x400x600',
    1,
    1,
    0,
    0,
    '/images/tractor-2.jpg',
    JSON.stringify({
      type: 'Плуг',
      compatibility: ['DF-244', 'DF-304', 'DF-354', 'DF-404'],
      working_width: '25 см',
      working_depth: '15-20 см',
      weight: '45 кг'
    })
  ],
  [
    'Фреза почвенная ФП-120',
    'freza-fp-120',
    'ФП-120',
    2,
    'Почвенная фреза для культивации и подготовки почвы. Ширина захвата 120 см.',
    45000,
    null,
    0,
    'N/A',
    'N/A',
    null,
    null,
    85,
    '1200x500x400',
    1,
    1,
    1,
    0,
    '/images/tractor-3.jpg',
    JSON.stringify({
      type: 'Фреза',
      compatibility: ['DF-304', 'DF-354', 'DF-404'],
      working_width: '120 см',
      working_depth: '12-18 см',
      blades: 36,
      weight: '85 кг'
    })
  ]
];

products.forEach(product => {
  insertProduct.run(...product);
});

console.log('✅ Товары добавлены');

// Статистика
const stats = {
  categories: db.prepare('SELECT COUNT(*) as count FROM categories').get(),
  products: db.prepare('SELECT COUNT(*) as count FROM products').get(),
  inStock: db.prepare('SELECT COUNT(*) as count FROM products WHERE in_stock = 1').get(),
  hits: db.prepare('SELECT COUNT(*) as count FROM products WHERE is_hit = 1').get(),
  new: db.prepare('SELECT COUNT(*) as count FROM products WHERE is_new = 1').get()
};

console.log('\n📊 Статистика базы данных:');
console.log(`   Категорий: ${stats.categories.count}`);
console.log(`   Товаров: ${stats.products.count}`);
console.log(`   В наличии: ${stats.inStock.count}`);
console.log(`   Хиты продаж: ${stats.hits.count}`);
console.log(`   Новинки: ${stats.new.count}`);

console.log('\n🎉 База данных успешно заполнена тестовыми данными!');

db.close();
