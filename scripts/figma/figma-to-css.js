#!/usr/bin/env node
/**
 * Figma to CSS Sync
 * Извлекает Variables и Styles из Figma и обновляет CSS
 */

import { FigmaClient, log, figmaColorToCss, createBackup, resolvePath } from './utils.js';
import config from '../../figma.config.js';

async function figmaToCss() {
  console.log('\n📥 Извлечение токенов из Figma...\n');

  if (!config.figmaFileId) {
    log.error('FIGMA_FILE_ID не настроен. Запустите: npm run figma:setup');
    process.exit(1);
  }

  const client = new FigmaClient();

  try {
    log.info(`Подключение к файлу: ${config.figmaFileId}`);

    // Получаем файл
    const fileData = await client.getFile(config.figmaFileId);
    log.success(`Файл: "${fileData.name}"`);

    // Пытаемся получить Variables (Figma Variables API)
    let variables = null;
    try {
      const varsData = await client.getFileVariables(config.figmaFileId);
      if (varsData && varsData.meta && varsData.meta.variables) {
        variables = varsData.meta.variables;
        log.success(`Найдено Variables: ${Object.keys(variables).length}`);
      }
    } catch (err) {
      log.warn('Variables API недоступен (файл может не содержать Variables)');
    }

    // Получаем Styles
    const styles = fileData.styles || {};
    log.info(`Найдено Styles: ${Object.keys(styles).length}`);

    // Конвертируем Figma данные в CSS
    const cssTokens = [];

    // Обработка Variables
    if (variables) {
      for (const [id, variable] of Object.entries(variables)) {
        const cssName = convertFigmaNameToCss(variable.name);
        const cssValue = convertFigmaValueToCss(variable);

        if (cssValue) {
          cssTokens.push({
            name: cssName,
            value: cssValue,
            type: variable.resolvedType,
            collection: variable.variableCollectionId
          });
        }
      }
    }

    // Обработка Color Styles
    if (fileData.styles) {
      for (const [id, style] of Object.entries(fileData.styles)) {
        if (style.styleType === 'FILL') {
          // Получаем детали стиля из nodes
          // (требует дополнительной логики для извлечения fill colors)
        }
      }
    }

    console.log(`\nИзвлечено токенов: ${cssTokens.length}`);

    if (cssTokens.length === 0) {
      log.warn('Токены не найдены. Убедитесь, что:');
      log.info('  1. В Figma файле настроены Variables или Styles');
      log.info('  2. У токена есть права на чтение файла');
      log.info('  3. Используется Figma Professional (для Variables API)');
      return;
    }

    // Создаём бэкап
    const cssPath = resolvePath(config.paths.cssVariables);
    await createBackup(cssPath);

    // TODO: Обновление CSS файла с сохранением структуры и комментариев
    log.warn('\n⚠️  Автоматическое обновление CSS в разработке');
    log.info('Токены сохранены в design-tokens/tokens.json');
    log.info('Используйте их для ручного обновления variables.css');

    // Сохраняем в JSON
    const fs = await import('fs/promises');
    const tokensPath = resolvePath(config.paths.designTokens);
    await fs.writeFile(tokensPath, JSON.stringify(cssTokens, null, 2));
    log.success(`Сохранено: ${tokensPath}`);

  } catch (error) {
    log.error(`Ошибка: ${error.message}`);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

function convertFigmaNameToCss(figmaName) {
  // Конвертирует "Brand/Primary" → "--brand-primary"
  return '--' + figmaName
    .toLowerCase()
    .replace(/[\/\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function convertFigmaValueToCss(variable) {
  // Конвертирует Figma Variable value в CSS значение
  if (variable.resolvedType === 'COLOR') {
    return figmaColorToCss(variable.valuesByMode[Object.keys(variable.valuesByMode)[0]]);
  }

  if (variable.resolvedType === 'FLOAT') {
    return variable.valuesByMode[Object.keys(variable.valuesByMode)[0]] + 'px';
  }

  return null;
}

figmaToCss().catch(console.error);
