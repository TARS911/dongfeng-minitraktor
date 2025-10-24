import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wbfhvcmvkyjsjvqkbxpz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZmh2Y212a3lqc2p2cWtieHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNzg1MzksImV4cCI6MjA3Njg1NDUzOX0.5yHwVSIkbhDnnUKrPSe6uTCW-ImZYrczI-8nRQB0fHY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('🚀 Добавление остальных товаров...\n');

// Остальные 8 товаров
const products = [
    {
        name: 'Минитрактор Xingtai (Синтай) 244 с кабиной',
        slug: 'xingtai-244-s-kabinoy',
        model: 'Xingtai 244',
        category_slug: 'minitractory',
        description: 'Минитрактор Xingtai (Синтай) 244 с кабиной - надежная китайская техника по доступной цене.',
        price: 310000,
        power: 24,
        drive: '4x4',
        transmission: '8+8',
        engine_type: 'Дизельный, 3-цилиндровый',
        fuel_tank: 32,
        weight: 920,
        dimensions: '2850x1280x2100',
        warranty_years: 2,
        in_stock: true,
        is_hit: false,
        is_new: false,
        image_url: 'https://res.cloudinary.com/drenz1aia/image/upload/v1760698081/dongfeng-minitraktor/df-304-main.jpg',
        specifications: {
            engine: { type: 'Дизельный', cylinders: 3, displacement: '1.5 л', cooling: 'Водяное охлаждение', start: 'Электростартер' },
            transmission: { type: 'Механическая', gears: '8 вперед / 8 назад', clutch: 'Сухое, однодисковое' },
            hydraulics: { lift_capacity: '650 кг', connections: '2 задних вывода' },
            cabin: { heating: 'Есть', ventilation: 'Есть' },
            dimensions: { length: '2850 мм', width: '1280 мм', height: '2100 мм (с кабиной)', clearance: '310 мм' }
        }
    },
    {
        name: 'Минитрактор Xingtai (Синтай) 244 без кабины',
        slug: 'xingtai-244-bez-kabiny',
        model: 'Xingtai 244',
        category_slug: 'minitractory',
        description: 'Минитрактор Xingtai (Синтай) 244 в базовой комплектации. Экономичный и надежный помощник.',
        price: 275000,
        power: 24,
        drive: '4x4',
        transmission: '8+8',
        engine_type: 'Дизельный, 3-цилиндровый',
        fuel_tank: 32,
        weight: 820,
        dimensions: '2850x1280x1420',
        warranty_years: 2,
        in_stock: true,
        is_hit: false,
        is_new: false,
        image_url: 'https://res.cloudinary.com/drenz1aia/image/upload/v1760698081/dongfeng-minitraktor/df-304-main.jpg',
        specifications: {
            engine: { type: 'Дизельный', cylinders: 3, displacement: '1.5 л', cooling: 'Водяное охлаждение', start: 'Электростартер' },
            transmission: { type: 'Механическая', gears: '8 вперед / 8 назад', clutch: 'Сухое, однодисковое' },
            hydraulics: { lift_capacity: '650 кг', connections: '2 задних вывода' },
            dimensions: { length: '2850 мм', width: '1280 мм', height: '1420 мм', clearance: '310 мм' }
        }
    },
    {
        name: 'Трактор LOVOL TE-244 без кабины',
        slug: 'lovol-te-244-bez-kabiny',
        model: 'LOVOL TE-244',
        category_slug: 'minitractory',
        description: 'Трактор LOVOL TE-244 - надежная техника от известного китайского производителя.',
        price: 295000,
        power: 24,
        drive: '4x4',
        transmission: '8+8',
        engine_type: 'Дизельный, 3-цилиндровый',
        fuel_tank: 35,
        weight: 870,
        dimensions: '2900x1320x1480',
        warranty_years: 2,
        in_stock: true,
        is_hit: false,
        is_new: false,
        image_url: 'https://res.cloudinary.com/drenz1aia/image/upload/v1760698081/dongfeng-minitraktor/df-354-main.jpg',
        specifications: {
            engine: { type: 'Дизельный', cylinders: 3, displacement: '1.6 л', cooling: 'Водяное охлаждение', start: 'Электростартер' },
            transmission: { type: 'Механическая', gears: '8 вперед / 8 назад', clutch: 'Сухое, однодисковое' },
            hydraulics: { lift_capacity: '700 кг', connections: '2 задних вывода' },
            dimensions: { length: '2900 мм', width: '1320 мм', height: '1480 мм', clearance: '320 мм' }
        }
    },
    {
        name: 'Трактор LOVOL TE-244 с кабиной',
        slug: 'lovol-te-244-s-kabinoy',
        model: 'LOVOL TE-244',
        category_slug: 'minitractory',
        description: 'Трактор LOVOL TE-244 с комфортабельной кабиной. Работа в любую погоду с максимальным комфортом.',
        price: 330000,
        power: 24,
        drive: '4x4',
        transmission: '8+8',
        engine_type: 'Дизельный, 3-цилиндровый',
        fuel_tank: 35,
        weight: 970,
        dimensions: '2900x1320x2150',
        warranty_years: 2,
        in_stock: true,
        is_hit: false,
        is_new: false,
        image_url: 'https://res.cloudinary.com/drenz1aia/image/upload/v1760698081/dongfeng-minitraktor/df-354-main.jpg',
        specifications: {
            engine: { type: 'Дизельный', cylinders: 3, displacement: '1.6 л', cooling: 'Водяное охлаждение', start: 'Электростартер' },
            transmission: { type: 'Механическая', gears: '8 вперед / 8 назад', clutch: 'Сухое, однодисковое' },
            hydraulics: { lift_capacity: '700 кг', connections: '2 задних вывода' },
            cabin: { heating: 'Есть', ventilation: 'Есть', windows: 'Панорамные' },
            dimensions: { length: '2900 мм', width: '1320 мм', height: '2150 мм (с кабиной)', clearance: '320 мм' }
        }
    },
    {
        name: 'Минитрактор Кентавр 244',
        slug: 'kentavr-244',
        model: 'Кентавр 244',
        category_slug: 'minitractory',
        description: 'Российский минитрактор Кентавр 244 - надежность и качество отечественного производства.',
        price: 290000,
        power: 24,
        drive: '4x4',
        transmission: '8+8',
        engine_type: 'Дизельный, 3-цилиндровый',
        fuel_tank: 33,
        weight: 880,
        dimensions: '2820x1310x1460',
        warranty_years: 2,
        in_stock: true,
        is_hit: false,
        is_new: false,
        image_url: 'https://res.cloudinary.com/drenz1aia/image/upload/v1760698080/dongfeng-minitraktor/df-244-main.jpg',
        specifications: {
            engine: { type: 'Дизельный', cylinders: 3, displacement: '1.5 л', cooling: 'Водяное охлаждение', start: 'Электростартер' },
            transmission: { type: 'Механическая', gears: '8 вперед / 8 назад', clutch: 'Сухое, однодисковое' },
            hydraulics: { lift_capacity: '680 кг', connections: '2 задних вывода' },
            dimensions: { length: '2820 мм', width: '1310 мм', height: '1460 мм', clearance: '310 мм' }
        }
    },
    {
        name: 'Минитрактор Русич 244',
        slug: 'rusich-244',
        model: 'Русич 244',
        category_slug: 'minitractory',
        description: 'Минитрактор Русич 244 - качественная российская техника для сельского хозяйства.',
        price: 285000,
        power: 24,
        drive: '4x4',
        transmission: '8+8',
        engine_type: 'Дизельный, 3-цилиндровый',
        fuel_tank: 32,
        weight: 860,
        dimensions: '2800x1300x1450',
        warranty_years: 2,
        in_stock: true,
        is_hit: false,
        is_new: false,
        image_url: 'https://res.cloudinary.com/drenz1aia/image/upload/v1760698081/dongfeng-minitraktor/df-304-main.jpg',
        specifications: {
            engine: { type: 'Дизельный', cylinders: 3, displacement: '1.5 л', cooling: 'Водяное охлаждение', start: 'Электростартер' },
            transmission: { type: 'Механическая', gears: '8 вперед / 8 назад', clutch: 'Сухое, однодисковое' },
            hydraulics: { lift_capacity: '650 кг', connections: '2 задних вывода' },
            dimensions: { length: '2800 мм', width: '1300 мм', height: '1450 мм', clearance: '305 мм' }
        }
    },
    {
        name: 'Минитрактор Скаут 244',
        slug: 'skaut-244',
        model: 'Скаут 244',
        category_slug: 'minitractory',
        description: 'Минитрактор Скаут 244 - современная техника с отличным соотношением цены и качества.',
        price: 280000,
        power: 24,
        drive: '4x4',
        transmission: '8+8',
        engine_type: 'Дизельный, 3-цилиндровый',
        fuel_tank: 31,
        weight: 840,
        dimensions: '2790x1290x1440',
        warranty_years: 2,
        in_stock: true,
        is_hit: false,
        is_new: false,
        image_url: 'https://res.cloudinary.com/drenz1aia/image/upload/v1760698081/dongfeng-minitraktor/df-354-main.jpg',
        specifications: {
            engine: { type: 'Дизельный', cylinders: 3, displacement: '1.5 л', cooling: 'Водяное охлаждение', start: 'Электростартер' },
            transmission: { type: 'Механическая', gears: '8 вперед / 8 назад', clutch: 'Сухое, однодисковое' },
            hydraulics: { lift_capacity: '630 кг', connections: '2 задних вывода' },
            dimensions: { length: '2790 мм', width: '1290 мм', height: '1440 мм', clearance: '300 мм' }
        }
    },
    {
        name: 'Минитрактор Рустрак 244',
        slug: 'rustrak-244',
        model: 'Рустрак 244',
        category_slug: 'minitractory',
        description: 'Минитрактор Рустрак 244 - надежная техника российского производства.',
        price: 292000,
        power: 24,
        drive: '4x4',
        transmission: '8+8',
        engine_type: 'Дизельный, 3-цилиндровый',
        fuel_tank: 33,
        weight: 890,
        dimensions: '2830x1315x1470',
        warranty_years: 2,
        in_stock: true,
        is_hit: false,
        is_new: false,
        image_url: 'https://res.cloudinary.com/drenz1aia/image/upload/v1760698082/dongfeng-minitraktor/df-404-main.jpg',
        specifications: {
            engine: { type: 'Дизельный', cylinders: 3, displacement: '1.5 л', cooling: 'Водяное охлаждение', start: 'Электростартер' },
            transmission: { type: 'Механическая', gears: '8 вперед / 8 назад', clutch: 'Сухое, однодисковое' },
            hydraulics: { lift_capacity: '670 кг', connections: '2 задних вывода' },
            dimensions: { length: '2830 мм', width: '1315 мм', height: '1470 мм', clearance: '315 мм' }
        }
    }
];

async function importProducts() {
    try {
        // Получаем ID категории минитракторов
        const { data: cats } = await supabase
            .from('categories')
            .select('id, slug')
            .eq('slug', 'minitractory')
            .single();

        if (!cats) {
            console.error('❌ Категория minitractory не найдена!');
            return;
        }

        const categoryId = cats.id;

        // Импортируем товары
        for (const prod of products) {
            const { category_slug, ...productData } = prod;
            productData.category_id = categoryId;

            const { error } = await supabase
                .from('products')
                .insert(productData);

            if (error) {
                console.error(`❌ ${prod.name} - ${error.message}`);
            } else {
                console.log(`✅ ${prod.name}`);
            }
        }

        console.log('\n🎉 Все товары добавлены! Всего: 11 товаров');
        console.log('📊 Проверьте: https://supabase.com/dashboard/project/wbfhvcmvkyjsjvqkbxpz/editor');
    } catch (error) {
        console.error('❌ Ошибка:', error);
    }
}

importProducts();
