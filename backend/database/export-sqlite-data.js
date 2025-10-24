import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'dongfeng.db');
const db = new Database(dbPath, { readonly: true });

console.log('📦 Экспортируем данные из SQLite...\n');

const data = {
    categories: db.prepare('SELECT * FROM categories').all(),
    products: db.prepare('SELECT * FROM products').all(),
    contacts: db.prepare('SELECT * FROM contacts').all(),
    delivery_requests: db.prepare('SELECT * FROM delivery_requests').all()
};

const outputPath = path.join(__dirname, 'sqlite-export.json');
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

console.log('✅ Данные экспортированы в sqlite-export.json');
console.log(`📊 Статистика:`);
console.log(`   - Категорий: ${data.categories.length}`);
console.log(`   - Товаров: ${data.products.length}`);
console.log(`   - Контактов: ${data.contacts.length}`);
console.log(`   - Запросов доставки: ${data.delivery_requests.length}`);

db.close();
