#!/usr/bin/env node
/**
 * CSS to Figma Sync
 * Загружает CSS переменные в Figma Variables
 *
 * TODO: Полная реализация требует Figma Variables API (POST endpoints)
 * Текущая версия - заглушка для MVP
 */

import { log, parseCssVariables, groupVariablesByMapping, resolvePath } from './utils.js';
import config from '../../figma.config.js';

async function cssToFigma() {
  console.log('\n📤 Загрузка CSS токенов в Figma...\n');

  try {
    // Парсим CSS переменные
    const cssPath = resolvePath(config.paths.cssVariables);
    log.info(`Чтение: ${cssPath}`);

    const variables = await parseCssVariables(cssPath);
    log.success(`Найдено ${variables.size} CSS переменных`);

    // Группируем по категориям
    const grouped = groupVariablesByMapping(variables);

    console.log('\nТокены по категориям:');
    for (const [category, tokens] of Object.entries(grouped)) {
      console.log(`  ${category}: ${tokens.length} токенов`);
    }

    console.log('\n⚠️  ВНИМАНИЕ: Полная синхронизация CSS → Figma требует:');
    console.log('  1. Figma Variables POST API (доступен через Plugin API)');
    console.log('  2. Или использование Figma Plugin для импорта');
    console.log('\nВарианты реализации:');
    console.log('  A) Создать Figma Plugin для импорта токенов');
    console.log('  B) Вручную создать Variables в Figma по этому списку');
    console.log('  C) Использовать Style Dictionary + Figma Tokens Plugin\n');

    // Сохраняем токены в JSON для импорта
    const tokensPath = resolvePath(config.paths.designTokens);
    const tokensData = {
      timestamp: new Date().toISOString(),
      source: 'css',
      groups: grouped,
      totalTokens: variables.size
    };

    const fs = await import('fs/promises');
    await fs.writeFile(tokensPath, JSON.stringify(tokensData, null, 2));
    log.success(`Токены экспортированы в: ${tokensPath}`);
    log.info('Используйте этот файл для ручного импорта в Figma');

  } catch (error) {
    log.error(`Ошибка: ${error.message}`);
    process.exit(1);
  }
}

cssToFigma().catch(console.error);
