import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DB_PATH || join(__dirname, '../database/dongfeng.db');

// Создаем подключение к БД
const db = new Database(dbPath, { verbose: console.log });

// Включаем внешние ключи
db.pragma('foreign_keys = ON');

export default db;
