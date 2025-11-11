#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://dpsykseeqloturowdyzf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwc3lrc2VlcWxvdHVyb3dkeXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUwMjg1MywiZXhwIjoyMDc4MDc4ODUzfQ.wY2VoghxdIhgwEws_kUIUgZX1P3TTw-1PXh84GVbdJ4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('🚀 Применяю SQL миграции в Supabase...\n');

  // Миграция 1: Обновление категории equipment
  console.log('📝 Миграция 1: Обновление категории equipment...');

  const { data: category, error: updateError } = await supabase
    .from('categories')
    .update({
      name: 'Коммунальная техника',
      description: 'Снегоуборщики, газонокосилки, подметальные машины, техника для уборки территорий',
      updated_at: new Date().toISOString()
    })
    .eq('slug', 'equipment')
    .select();

  if (updateError) {
    console.error('❌ Ошибка обновления категории:', updateError.message);
  } else {
    console.log('✅ Категория обновлена:', category);
  }

  // Проверка
  const { data: check } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', 'equipment')
    .single();

  console.log('\n📊 Проверка категории equipment:');
  console.log('  ID:', check?.id);
  console.log('  Название:', check?.name);
  console.log('  Описание:', check?.description);
  console.log('');

  // Миграция 2: RLS Политики
  console.log('📝 Миграция 2: Настройка RLS политик...');
  console.log('⚠️  RLS политики нужно применить вручную через Supabase Dashboard');
  console.log('   SQL код находится в docs/migrations/apply-migrations.md');
  console.log('');

  console.log('✅ Миграции применены!');
  console.log('');
  console.log('📋 Что осталось сделать вручную:');
  console.log('  1. Откройте Supabase Dashboard → SQL Editor');
  console.log('  2. Выполните скрипт из docs/migrations/audit-trail.sql');
  console.log('  3. Выполните RLS политики из docs/migrations/apply-migrations.md');
  console.log('');
}

main().catch(console.error);
