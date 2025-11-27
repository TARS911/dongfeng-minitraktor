#!/usr/bin/env node

require('dotenv').config();
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_DB_PASSWORD:', process.env.SUPABASE_DB_PASSWORD);

const { SUPABASE_URL, SUPABASE_DB_PASSWORD } = process.env;

if (!SUPABASE_URL || !SUPABASE_DB_PASSWORD) {
  console.error('❌ Ошибка: Не заданы переменные окружения SUPABASE_URL и SUPABASE_DB_PASSWORD');
  process.exit(1);
}

const dbHost = SUPABASE_URL.replace('https://', '');
const dbUrl = `postgres://postgres:${SUPABASE_DB_PASSWORD}@${dbHost}:5432/postgres`;
const sql = postgres(dbUrl);

const migrationsDir = path.join(__dirname, '../migrations');

async function ensureMigrationsLogTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS migrations_log (
      id SERIAL PRIMARY KEY,
      migration_name VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
}

async function getAppliedMigrations(sql) {
  const result = await sql`SELECT migration_name FROM migrations_log`;
  return result.map(r => r.migration_name);
}

async function applyMigration(sql, fileName, sqlContent) {
  console.log(`\n🚀 Применяю миграцию: ${fileName}...`);
  await sql.unsafe(sqlContent);
  await sql`INSERT INTO migrations_log (migration_name) VALUES (${fileName})`;
  console.log(`✅ Миграция ${fileName} успешно применена и залогирована.`);
}

async function main() {
  console.log('🚀 Запускаю скрипт применения миграций...');

  await sql.begin(async sql => {
    await ensureMigrationsLogTable(sql);
    const appliedMigrations = await getAppliedMigrations(sql);

    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const fileName of migrationFiles) {
      if (appliedMigrations.includes(fileName)) {
        console.log(`⏭️  Миграция ${fileName} уже была применена, пропускаю.`);
        continue;
      }

      const filePath = path.join(migrationsDir, fileName);
      const sqlContent = fs.readFileSync(filePath, 'utf-8');
      await applyMigration(sql, fileName, sqlContent);
    }
  });

  console.log('\n✅ Все новые миграции успешно применены!');
  await sql.end();
}

main().catch(e => {
  console.error('❌ Произошла критическая ошибка во время процесса миграции:', e.message);
  process.exit(1);
});
