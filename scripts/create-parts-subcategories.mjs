#!/usr/bin/env node
/**
 * Скрипт для создания 11 подкатегорий в разделе "Запчасти" в Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase credentials
const SUPABASE_URL = 'https://dpsykseeqloturowdyzf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwc3lrc2VlcWxvdHVyb3dkeXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MTU4MDUsImV4cCI6MjA1MzQ5MTgwNX0.Xq1MXe2LhP9oJrjXZC34rhMrfgxqIaNRUxh9LpvW3ZE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 11 подкатегорий для раздела "Запчасти"
const partsCategories = [
  {
    name: 'ДВС в Сборе',
    slug: 'engines-assembled',
    description: 'Двигатели внутреннего сгорания в сборе для минитракторов и мотоблоков',
    parent_id: 2,
    display_order: 1
  },
  {
    name: 'Запчасти на ДВС',
    slug: 'parts-engines',
    description: 'Запчасти для двигателей: поршни, кольца, прокладки, клапаны',
    parent_id: 2,
    display_order: 2
  },
  {
    name: 'Запчасти на Минитракторы',
    slug: 'parts-minitractors',
    description: 'Запчасти для минитракторов DongFeng, Foton, Jinma, Xingtai, Уралец',
    parent_id: 2,
    display_order: 3
  },
  {
    name: 'Запчасти на Мототракторы',
    slug: 'parts-mototractors',
    description: 'Запчасти для мототракторов с колесом 16 дюймов: Зубр, Crosser',
    parent_id: 2,
    display_order: 4
  },
  {
    name: 'Запчасти на Мотоблоки',
    slug: 'parts-motoblocks',
    description: 'Запчасти для мотоблоков: Garden, Скаут, Прораб, Булат, Зубр, Crosser',
    parent_id: 2,
    display_order: 5
  },
  {
    name: 'Запчасти на Навесное оборудование',
    slug: 'parts-attachments',
    description: 'Запчасти для навесного оборудования: плуги, культиваторы, косилки, картофелекопалки',
    parent_id: 2,
    display_order: 6
  },
  {
    name: 'Запчасти на Садовую технику',
    slug: 'parts-garden-equipment',
    description: 'Запчасти для садовой техники: газонокосилки, триммеры, кусторезы, мотопомпы',
    parent_id: 2,
    display_order: 7
  },
  {
    name: 'Запчасти на Электрогенераторы',
    slug: 'parts-generators',
    description: 'Запчасти для электрогенераторов: AVR, щетки, статоры, роторы, конденсаторы',
    parent_id: 2,
    display_order: 8
  },
  {
    name: 'Топливная система',
    slug: 'parts-fuel-system',
    description: 'Топливные баки, насосы, краны, шланги, фитинги, карбюраторы',
    parent_id: 2,
    display_order: 9
  },
  {
    name: 'Фильтры',
    slug: 'parts-filters',
    description: 'Фильтры: воздушные, топливные, масляные, гидравлические',
    parent_id: 2,
    display_order: 10
  },
  {
    name: 'Гидравлика',
    slug: 'parts-hydraulics',
    description: 'Гидравлические системы: насосы, распределители, цилиндры, шланги, муфты',
    parent_id: 2,
    display_order: 11
  }
];

async function createSubcategories() {
  console.log('\n🚀 СОЗДАНИЕ ПОДКАТЕГОРИЙ В SUPABASE\n');
  console.log('=' .repeat(70));

  try {
    // Проверяем существующие категории
    console.log('\n📊 Проверка существующих категорий...');
    const { data: existing, error: checkError } = await supabase
      .from('categories')
      .select('slug')
      .eq('parent_id', 2);

    if (checkError) {
      console.error('❌ Ошибка при проверке:', checkError.message);
      return;
    }

    const existingSlugs = new Set(existing?.map(c => c.slug) || []);
    console.log(`   Найдено существующих подкатегорий: ${existingSlugs.size}`);

    // Создаем только новые категории
    const newCategories = partsCategories.filter(cat => !existingSlugs.has(cat.slug));

    if (newCategories.length === 0) {
      console.log('\n✅ Все подкатегории уже существуют!');
      return;
    }

    console.log(`\n📝 Создание ${newCategories.length} новых подкатегорий...\n`);

    for (const category of newCategories) {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: category.name,
          slug: category.slug,
          description: category.description,
          parent_id: category.parent_id,
          display_order: category.display_order,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error(`   ❌ Ошибка при создании "${category.name}":`, error.message);
      } else {
        console.log(`   ✅ ${category.display_order}. ${category.name} (${category.slug})`);
      }
    }

    // Показываем итоговый список
    console.log('\n📊 Проверка результата...\n');
    const { data: allCategories, error: finalError } = await supabase
      .from('categories')
      .select('id, name, slug, display_order, parent_id')
      .eq('parent_id', 2)
      .order('display_order');

    if (finalError) {
      console.error('❌ Ошибка при получении списка:', finalError.message);
      return;
    }

    console.log('=' .repeat(70));
    console.log(`\n✅ Всего подкатегорий в разделе "Запчасти": ${allCategories.length}\n`);
    allCategories.forEach(cat => {
      console.log(`   ${cat.display_order}. ${cat.name}`);
      console.log(`      Slug: ${cat.slug} | ID: ${cat.id}\n`);
    });

  } catch (error) {
    console.error('❌ Непредвиденная ошибка:', error);
  }
}

createSubcategories();
