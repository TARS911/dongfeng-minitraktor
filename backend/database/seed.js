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
  ['Запчасти', 'parts', 'Оригинальные запчасти']
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
  // 1. Минитрактор DF 244 с кабиной
  [
    'Минитрактор DF-244 с кабиной',
    'df-244-s-kabinoy',
    'DF-244',
    1,
    'Надежный минитрактор DONGFENG DF-244 с комфортабельной кабиной. Защита от непогоды, отопление, удобное рабочее место.',
    320000,
    null,
    24,
    '4x4',
    '8+8',
    'Дизельный, 3-цилиндровый',
    30,
    950,
    '2800x1300x2150',
    3,
    1,
    1, // is_hit
    0,
    'https://res.cloudinary.com/drenz1aia/image/upload/v1760698080/dongfeng-minitraktor/df-244-main.jpg',
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
      cabin: {
        heating: 'Есть',
        ventilation: 'Есть',
        windows: 'Панорамные'
      },
      dimensions: {
        length: '2800 мм',
        width: '1300 мм',
        height: '2150 мм (с кабиной)',
        clearance: '300 мм'
      }
    })
  ],

  // 2. Минитрактор DF 244 без кабины
  [
    'Минитрактор DF-244 без кабины',
    'df-244-bez-kabiny',
    'DF-244',
    1,
    'Минитрактор DONGFENG DF-244 в базовой комплектации без кабины. Отличное соотношение цены и качества.',
    285000,
    null,
    24,
    '4x4',
    '8+8',
    'Дизельный, 3-цилиндровый',
    30,
    850,
    '2800x1300x1450',
    3,
    1,
    0,
    0,
    'https://res.cloudinary.com/drenz1aia/image/upload/v1760698080/dongfeng-minitraktor/df-244-main.jpg',
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

  // 3. Минитрактор DF-404 с кабиной
  [
    'Минитрактор DF-404 с кабиной',
    'df-404-s-kabinoy',
    'DF-404',
    1,
    'Профессиональный минитрактор DONGFENG DF-404 повышенной мощности с комфортабельной кабиной. Для интенсивной работы на больших участках.',
    520000,
    null,
    40,
    '4x4',
    '16+8',
    'Дизельный, 4-цилиндровый',
    50,
    1200,
    '3200x1500x2200',
    3,
    1,
    0,
    1, // is_new
    'https://res.cloudinary.com/drenz1aia/image/upload/v1760698082/dongfeng-minitraktor/df-404-main.jpg',
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
      cabin: {
        heating: 'Есть',
        air_conditioning: 'Опция',
        ventilation: 'Есть',
        windows: 'Панорамные с тонировкой'
      },
      dimensions: {
        length: '3200 мм',
        width: '1500 мм',
        height: '2200 мм (с кабиной)',
        clearance: '350 мм'
      }
    })
  ],

  // 4. Минитрактор Xingtai 244 с кабиной
  [
    'Минитрактор Xingtai (Синтай) 244 с кабиной',
    'xingtai-244-s-kabinoy',
    'Xingtai 244',
    1,
    'Минитрактор Xingtai (Синтай) 244 с кабиной - надежная китайская техника по доступной цене. Отличное решение для фермерского хозяйства.',
    310000,
    null,
    24,
    '4x4',
    '8+8',
    'Дизельный, 3-цилиндровый',
    32,
    920,
    '2850x1280x2100',
    2,
    1,
    0,
    0,
    'https://res.cloudinary.com/drenz1aia/image/upload/v1760698081/dongfeng-minitraktor/df-304-main.jpg',
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
        lift_capacity: '650 кг',
        connections: '2 задних вывода'
      },
      cabin: {
        heating: 'Есть',
        ventilation: 'Есть'
      },
      dimensions: {
        length: '2850 мм',
        width: '1280 мм',
        height: '2100 мм (с кабиной)',
        clearance: '310 мм'
      }
    })
  ],

  // 5. Минитрактор Xingtai 244 без кабины
  [
    'Минитрактор Xingtai (Синтай) 244 без кабины',
    'xingtai-244-bez-kabiny',
    'Xingtai 244',
    1,
    'Минитрактор Xingtai (Синтай) 244 в базовой комплектации. Экономичный и надежный помощник для дачи и небольшого хозяйства.',
    275000,
    null,
    24,
    '4x4',
    '8+8',
    'Дизельный, 3-цилиндровый',
    32,
    820,
    '2850x1280x1420',
    2,
    1,
    0,
    0,
    'https://res.cloudinary.com/drenz1aia/image/upload/v1760698081/dongfeng-minitraktor/df-304-main.jpg',
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
        lift_capacity: '650 кг',
        connections: '2 задних вывода'
      },
      dimensions: {
        length: '2850 мм',
        width: '1280 мм',
        height: '1420 мм',
        clearance: '310 мм'
      }
    })
  ],

  // 6. Трактор LOVOL TE 244 без кабины
  [
    'Трактор LOVOL TE-244 без кабины',
    'lovol-te-244-bez-kabiny',
    'LOVOL TE-244',
    1,
    'Трактор LOVOL TE-244 - надежная техника от известного китайского производителя. Простота в обслуживании и экономичность.',
    295000,
    null,
    24,
    '4x4',
    '8+8',
    'Дизельный, 3-цилиндровый',
    35,
    870,
    '2900x1320x1480',
    2,
    1,
    0,
    0,
    'https://res.cloudinary.com/drenz1aia/image/upload/v1760698081/dongfeng-minitraktor/df-354-main.jpg',
    JSON.stringify({
      engine: {
        type: 'Дизельный',
        cylinders: 3,
        displacement: '1.6 л',
        cooling: 'Водяное охлаждение',
        start: 'Электростартер'
      },
      transmission: {
        type: 'Механическая',
        gears: '8 вперед / 8 назад',
        clutch: 'Сухое, однодисковое'
      },
      hydraulics: {
        lift_capacity: '700 кг',
        connections: '2 задних вывода'
      },
      dimensions: {
        length: '2900 мм',
        width: '1320 мм',
        height: '1480 мм',
        clearance: '320 мм'
      }
    })
  ],

  // 7. Трактор LOVOL TE 244 с кабиной
  [
    'Трактор LOVOL TE-244 с кабиной',
    'lovol-te-244-s-kabinoy',
    'LOVOL TE-244',
    1,
    'Трактор LOVOL TE-244 с комфортабельной кабиной. Работа в любую погоду с максимальным комфортом.',
    330000,
    null,
    24,
    '4x4',
    '8+8',
    'Дизельный, 3-цилиндровый',
    35,
    970,
    '2900x1320x2150',
    2,
    1,
    0,
    0,
    'https://res.cloudinary.com/drenz1aia/image/upload/v1760698081/dongfeng-minitraktor/df-354-main.jpg',
    JSON.stringify({
      engine: {
        type: 'Дизельный',
        cylinders: 3,
        displacement: '1.6 л',
        cooling: 'Водяное охлаждение',
        start: 'Электростартер'
      },
      transmission: {
        type: 'Механическая',
        gears: '8 вперед / 8 назад',
        clutch: 'Сухое, однодисковое'
      },
      hydraulics: {
        lift_capacity: '700 кг',
        connections: '2 задних вывода'
      },
      cabin: {
        heating: 'Есть',
        ventilation: 'Есть',
        windows: 'Панорамные'
      },
      dimensions: {
        length: '2900 мм',
        width: '1320 мм',
        height: '2150 мм (с кабиной)',
        clearance: '320 мм'
      }
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
