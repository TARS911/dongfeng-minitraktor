// Скрипт автоматической миграции базы данных Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Загружаем переменные окружения
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔄 Миграция базы данных Supabase\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? '✅ Установлен' : '❌ Отсутствует');
console.log('---\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Ошибка: Не установлены переменные окружения');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('1️⃣ Проверка текущей структуры таблицы products...\n');

    // Проверяем наличие колонок
    const { data: columns, error: colError } = await supabase
      .rpc('get_table_columns', { table_name: 'products' })
      .catch(() => ({ data: null, error: null }));

    // Если RPC не работает, используем прямой SQL через REST API
    const migrations = [
      {
        name: 'is_featured',
        sql: `
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'products' AND column_name = 'is_featured'
            ) THEN
              ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT false;
              CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
              RAISE NOTICE 'Колонка is_featured добавлена';
            ELSE
              RAISE NOTICE 'Колонка is_featured уже существует';
            END IF;
          END $$;
        `
      },
      {
        name: 'is_new',
        sql: `
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'products' AND column_name = 'is_new'
            ) THEN
              ALTER TABLE products ADD COLUMN is_new BOOLEAN DEFAULT false;
              CREATE INDEX IF NOT EXISTS idx_products_is_new ON products(is_new);
              RAISE NOTICE 'Колонка is_new добавлена';
            ELSE
              RAISE NOTICE 'Колонка is_new уже существует';
            END IF;
          END $$;
        `
      },
      {
        name: 'power',
        sql: `
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'products' AND column_name = 'power'
            ) THEN
              ALTER TABLE products ADD COLUMN power INTEGER;
              RAISE NOTICE 'Колонка power добавлена';
            ELSE
              RAISE NOTICE 'Колонка power уже существует';
            END IF;
          END $$;
        `
      },
      {
        name: 'drive',
        sql: `
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'products' AND column_name = 'drive'
            ) THEN
              ALTER TABLE products ADD COLUMN drive TEXT;
              RAISE NOTICE 'Колонка drive добавлена';
            ELSE
              RAISE NOTICE 'Колонка drive уже существует';
            END IF;
          END $$;
        `
      },
      {
        name: 'transmission',
        sql: `
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'products' AND column_name = 'transmission'
            ) THEN
              ALTER TABLE products ADD COLUMN transmission TEXT;
              RAISE NOTICE 'Колонка transmission добавлена';
            ELSE
              RAISE NOTICE 'Колонка transmission уже существует';
            END IF;
          END $$;
        `
      },
      {
        name: 'updated_at',
        sql: `
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'products' AND column_name = 'updated_at'
            ) THEN
              ALTER TABLE products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;
              RAISE NOTICE 'Колонка updated_at добавлена';
            ELSE
              RAISE NOTICE 'Колонка updated_at уже существует';
            END IF;
          END $$;
        `
      },
      {
        name: 'trigger',
        sql: `
          CREATE OR REPLACE FUNCTION update_updated_at_column()
          RETURNS TRIGGER AS $$
          BEGIN
            NEW.updated_at = TIMEZONE('utc'::text, NOW());
            RETURN NEW;
          END;
          $$ language 'plpgsql';

          DROP TRIGGER IF EXISTS update_products_updated_at ON products;
          CREATE TRIGGER update_products_updated_at
            BEFORE UPDATE ON products
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        `
      }
    ];

    console.log('2️⃣ Применение миграций...\n');

    console.log('⚠️  ВНИМАНИЕ: Автоматическое применение SQL миграций через JS невозможно.');
    console.log('📋 Вам нужно выполнить SQL вручную в Supabase SQL Editor:\n');
    console.log('👉 https://supabase.com/dashboard/project/' + supabaseUrl.split('.')[0].split('//')[1] + '/sql\n');
    console.log('📄 Скопируйте содержимое файла: supabase-migration.sql\n');

    // Проверяем текущее состояние
    console.log('3️⃣ Проверка текущего состояния...\n');

    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name')
      .limit(1);

    if (prodError) {
      console.error('❌ Ошибка при проверке таблицы products:', prodError.message);

      if (prodError.message.includes('is_featured')) {
        console.log('\n⚠️  Колонка is_featured отсутствует - требуется миграция!');
      }
    } else {
      console.log('✅ Таблица products доступна');
      console.log(`✅ Найдено товаров: ${products?.length || 0}\n`);
    }

    console.log('📊 Итог:');
    console.log('   1. Откройте Supabase SQL Editor');
    console.log('   2. Выполните скрипт из supabase-migration.sql');
    console.log('   3. Запустите этот скрипт снова для проверки\n');

  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    process.exit(1);
  }
}

runMigration();
