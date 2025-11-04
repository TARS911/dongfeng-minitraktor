#!/usr/bin/env node
/**
 * Figma Components List
 * Извлекает список всех компонентов из Figma файла
 */

import { FigmaClient, log } from './utils.js';
import config from '../../figma.config.js';

async function listComponents() {
  console.log('\n📦 Список компонентов Figma...\n');

  if (!config.figmaFileId) {
    log.error('FIGMA_FILE_ID не настроен');
    process.exit(1);
  }

  const client = new FigmaClient();

  try {
    const componentsData = await client.getFileComponents(config.figmaFileId);

    if (!componentsData.meta || !componentsData.meta.components) {
      log.warn('Компоненты не найдены в файле');
      return;
    }

    const components = componentsData.meta.components;
    log.success(`Найдено компонентов: ${components.length}\n`);

    // Группируем по категориям (первая часть имени до /)
    const grouped = {};
    for (const comp of components) {
      const category = comp.name.split('/')[0] || 'Other';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(comp);
    }

    // Выводим список
    for (const [category, comps] of Object.entries(grouped)) {
      console.log(`\n${category}:`);
      for (const comp of comps) {
        console.log(`  • ${comp.name}`);
        console.log(`    ID: ${comp.node_id}`);
        if (comp.description) {
          console.log(`    ${comp.description}`);
        }
      }
    }

    console.log('\n✨ Для генерации кода используйте: npm run figma:components:generate\n');

  } catch (error) {
    log.error(`Ошибка: ${error.message}`);
    process.exit(1);
  }
}

listComponents().catch(console.error);
