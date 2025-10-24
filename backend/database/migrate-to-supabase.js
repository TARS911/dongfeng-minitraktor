import { createClient } from '@supabase/supabase-js';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase credentials
const SUPABASE_URL = 'https://wbfhvcmvkyjsjvqkbxpz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZmh2Y212a3lqc2p2cWtieHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNzg1MzksImV4cCI6MjA3Njg1NDUzOX0.5yHwVSIkbhDnnUKrPSe6uTCW-ImZYrczI-8nRQB0fHY';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Initialize SQLite database
const dbPath = path.join(__dirname, 'dongfeng.db');
const db = new Database(dbPath, { readonly: true });

console.log('🚀 Начинаем миграцию данных из SQLite в Supabase...\n');

async function migrateCategories() {
    console.log('📦 Миграция категорий...');

    const categories = db.prepare('SELECT * FROM categories').all();

    if (categories.length === 0) {
        console.log('⚠️  Нет категорий для миграции');
        return;
    }

    for (const category of categories) {
        const { id, ...categoryData } = category;

        const { data, error } = await supabase
            .from('categories')
            .insert({
                ...categoryData,
                created_at: new Date(category.created_at).toISOString()
            })
            .select();

        if (error) {
            console.error(`❌ Ошибка при миграции категории "${category.name}":`, error.message);
        } else {
            console.log(`✅ Категория "${category.name}" мигрирована (ID: ${data[0].id})`);
        }
    }
}

async function migrateProducts() {
    console.log('\n🚜 Миграция товаров...');

    const products = db.prepare('SELECT * FROM products').all();

    if (products.length === 0) {
        console.log('⚠️  Нет товаров для миграции');
        return;
    }

    // Получаем маппинг старых ID категорий на новые
    const { data: supabaseCategories } = await supabase
        .from('categories')
        .select('id, slug');

    const sqliteCategories = db.prepare('SELECT id, slug FROM categories').all();
    const categoryIdMap = {};

    sqliteCategories.forEach(sqliteCat => {
        const supabaseCat = supabaseCategories.find(sc => sc.slug === sqliteCat.slug);
        if (supabaseCat) {
            categoryIdMap[sqliteCat.id] = supabaseCat.id;
        }
    });

    for (const product of products) {
        const { id, specifications, ...productData } = product;

        // Парсим specifications из TEXT в JSONB
        let specsJson = null;
        if (specifications) {
            try {
                specsJson = JSON.parse(specifications);
            } catch (e) {
                console.warn(`⚠️  Не удалось распарсить specifications для ${product.name}`);
            }
        }

        const { data, error } = await supabase
            .from('products')
            .insert({
                ...productData,
                category_id: categoryIdMap[product.category_id] || null,
                specifications: specsJson,
                in_stock: Boolean(product.in_stock),
                is_hit: Boolean(product.is_hit),
                is_new: Boolean(product.is_new),
                created_at: new Date(product.created_at).toISOString(),
                updated_at: new Date(product.updated_at).toISOString()
            })
            .select();

        if (error) {
            console.error(`❌ Ошибка при миграции товара "${product.name}":`, error.message);
        } else {
            console.log(`✅ Товар "${product.name}" мигрирован (ID: ${data[0].id})`);
        }
    }
}

async function migrateContacts() {
    console.log('\n📧 Миграция контактов...');

    const contacts = db.prepare('SELECT * FROM contacts').all();

    if (contacts.length === 0) {
        console.log('⚠️  Нет контактов для миграции');
        return;
    }

    for (const contact of contacts) {
        const { id, ...contactData } = contact;

        const { error } = await supabase
            .from('contacts')
            .insert({
                ...contactData,
                created_at: new Date(contact.created_at).toISOString()
            });

        if (error) {
            console.error(`❌ Ошибка при миграции контакта:`, error.message);
        } else {
            console.log(`✅ Контакт от ${contact.name} мигрирован`);
        }
    }
}

async function migrateDeliveryRequests() {
    console.log('\n🚚 Миграция запросов доставки...');

    const requests = db.prepare('SELECT * FROM delivery_requests').all();

    if (requests.length === 0) {
        console.log('⚠️  Нет запросов доставки для миграции');
        return;
    }

    for (const request of requests) {
        const { id, ...requestData } = request;

        const { error } = await supabase
            .from('delivery_requests')
            .insert({
                ...requestData,
                created_at: new Date(request.created_at).toISOString()
            });

        if (error) {
            console.error(`❌ Ошибка при миграции запроса доставки:`, error.message);
        } else {
            console.log(`✅ Запрос доставки в ${request.city} мигрирован`);
        }
    }
}

async function migrate() {
    try {
        await migrateCategories();
        await migrateProducts();
        await migrateContacts();
        await migrateDeliveryRequests();

        console.log('\n🎉 Миграция завершена успешно!');
        console.log('\n📊 Проверьте данные в Supabase Dashboard:');
        console.log(`   ${SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/')}`);
    } catch (error) {
        console.error('\n❌ Ошибка при миграции:', error);
    } finally {
        db.close();
    }
}

migrate();
