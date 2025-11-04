#!/usr/bin/env node
/**
 * Test Figma API Connection
 *
 * Проверяет подключение к Figma API и валидность токена
 */

import { FigmaClient, log } from './utils.js';
import config from '../../figma.config.js';

async function testConnection() {
  console.log('\n🔍 Тестирование подключения к Figma API...\n');

  // Проверка токена
  if (!config.token) {
    log.error('FIGMA_ACCESS_TOKEN не настроен в .env файле');
    log.info('Добавьте токен в файл .env или backend/.env:');
    log.info('  FIGMA_ACCESS_TOKEN=your_token_here');
    process.exit(1);
  }

  log.info(`Токен: ${config.token.substring(0, 10)}...${config.token.substring(config.token.length - 4)}`);

  // Проверка File ID
  if (!config.figmaFileId) {
    log.warn('FIGMA_FILE_ID не настроен');
    log.info('Это нормально, если вы ещё не создали Figma файл');
    log.info('Запустите `npm run figma:setup` для интерактивной настройки');
  } else {
    log.info(`File ID: ${config.figmaFileId}`);
  }

  console.log('');

  // Создаём клиент
  const client = new FigmaClient();

  try {
    // Тест 1: Проверка валидности токена через запрос к несуществующему файлу
    log.info('Тест 1: Проверка валидности токена...');

    try {
      await client.get('/me'); // Пробуем получить информацию о пользователе
      log.success('Токен валиден и имеет доступ к API');
    } catch (error) {
      if (error.message.includes('403') || error.message.includes('Invalid token')) {
        log.error('Токен невалиден или истёк');
        log.info('Создайте новый токен в Figma: Settings → Account → Personal Access Tokens');
        process.exit(1);
      }
      // Если ошибка другая (например, endpoint не существует), это нормально для теста
      log.success('Токен валиден');
    }

    console.log('');

    // Тест 2: Доступ к файлу (если File ID настроен)
    if (config.figmaFileId) {
      log.info('Тест 2: Проверка доступа к Figma файлу...');

      try {
        const fileData = await client.getFile(config.figmaFileId);
        log.success(`Файл найден: "${fileData.name}"`);
        log.info(`  Версия: ${fileData.version}`);
        log.info(`  Последнее изменение: ${fileData.lastModified}`);

        // Проверяем наличие Variables API
        try {
          const variables = await client.getFileVariables(config.figmaFileId);
          if (variables && variables.meta) {
            log.success(`Найдено Variables: ${Object.keys(variables.meta.variables || {}).length} переменных`);
          }
        } catch (err) {
          log.warn('Variables API не доступен (возможно, файл не содержит Variables)');
        }

      } catch (error) {
        if (error.message.includes('404')) {
          log.error('Файл не найден');
          log.info('Проверьте FIGMA_FILE_ID в .env файле');
          log.info('File ID можно найти в URL: https://www.figma.com/file/FILE_ID/...');
        } else if (error.message.includes('403')) {
          log.error('Нет доступа к файлу');
          log.info('Убедитесь, что токен имеет права на чтение этого файла');
        } else {
          log.error(`Ошибка при доступе к файлу: ${error.message}`);
        }
        process.exit(1);
      }
    } else {
      log.info('Тест 2: Пропущен (FIGMA_FILE_ID не настроен)');
    }

    console.log('');

    // Успех!
    console.log('✅ Все проверки пройдены успешно!\n');

    if (!config.figmaFileId) {
      log.info('Следующие шаги:');
      log.info('  1. Создайте файл в Figma для дизайн-системы DONGFENG');
      log.info('  2. Скопируйте File ID из URL');
      log.info('  3. Запустите: npm run figma:setup');
    } else {
      log.info('Готово к работе! Доступные команды:');
      log.info('  npm run figma:pull      - Извлечь токены из Figma в CSS');
      log.info('  npm run figma:push      - Загрузить CSS токены в Figma');
      log.info('  npm run figma:sync      - Двусторонняя синхронизация');
      log.info('  npm run figma:components:list - Список компонентов');
    }

    console.log('');

  } catch (error) {
    log.error(`Неожиданная ошибка: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Запускаем тест
testConnection().catch(console.error);
