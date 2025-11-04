#!/usr/bin/env node
/**
 * Figma Setup Wizard
 * Интерактивный мастер первоначальной настройки Figma интеграции
 */

import prompts from 'prompts';
import { FigmaClient, log, writeFile, readFile } from './utils.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

async function setupWizard() {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║   🎨 DONGFENG Figma Design System Setup Wizard           ║
║   Мастер настройки интеграции с Figma                    ║
╚══════════════════════════════════════════════════════════╝
`);

  // Шаг 1: Проверка токена
  log.info('Шаг 1/4: Проверка Figma Access Token');

  const envPath = path.join(PROJECT_ROOT, '.env');
  let currentToken = process.env.FIGMA_ACCESS_TOKEN || '';

  const tokenResponse = await prompts({
    type: 'text',
    name: 'token',
    message: 'Введите Figma Personal Access Token:',
    initial: currentToken,
    validate: value => value.length > 20 ? true : 'Токен слишком короткий'
  });

  if (!tokenResponse.token) {
    log.error('Настройка отменена');
    process.exit(0);
  }

  // Проверяем токен
  const client = new FigmaClient(tokenResponse.token);
  try {
    await client.get('/me');
    log.success('Токен валиден!');
  } catch (error) {
    log.error('Токен невалиден. Создайте новый в Figma Settings');
    process.exit(1);
  }

  // Шаг 2: File ID
  console.log('');
  log.info('Шаг 2/4: Настройка Figma File');

  const fileResponse = await prompts({
    type: 'text',
    name: 'fileId',
    message: 'Введите Figma File ID (из URL):',
    validate: value => value.length > 10 ? true : 'File ID некорректный'
  });

  if (!fileResponse.fileId) {
    log.error('Настройка отменена');
    process.exit(0);
  }

  // Проверяем доступ к файлу
  try {
    const fileData = await client.getFile(fileResponse.fileId);
    log.success(`Файл найден: "${fileData.name}"`);
  } catch (error) {
    log.error('Не удаётся получить доступ к файлу. Проверьте File ID и права доступа');
    process.exit(1);
  }

  // Шаг 3: Сохранение конфигурации
  console.log('');
  log.info('Шаг 3/4: Сохранение конфигурации');

  try {
    let envContent = '';
    try {
      envContent = await fs.readFile(envPath, 'utf-8');
    } catch {}

    const updateEnv = (content, key, value) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(content)) {
        return content.replace(regex, `${key}=${value}`);
      }
      return content + `\n${key}=${value}`;
    };

    envContent = updateEnv(envContent, 'FIGMA_ACCESS_TOKEN', tokenResponse.token);
    envContent = updateEnv(envContent, 'FIGMA_FILE_ID', fileResponse.fileId);

    await fs.writeFile(envPath, envContent.trim() + '\n');
    log.success('Конфигурация сохранена в .env');
  } catch (error) {
    log.error(`Ошибка сохранения: ${error.message}`);
    process.exit(1);
  }

  // Шаг 4: Первоначальная синхронизация
  console.log('');
  log.info('Шаг 4/4: Первоначальная синхронизация');

  const syncResponse = await prompts({
    type: 'select',
    name: 'action',
    message: 'Что сделать с токенами?',
    choices: [
      { title: 'Загрузить CSS токены в Figma (CSS → Figma)', value: 'push' },
      { title: 'Извлечь токены из Figma в CSS (Figma → CSS)', value: 'pull' },
      { title: 'Пропустить (настрою вручную)', value: 'skip' }
    ]
  });

  if (syncResponse.action === 'push') {
    log.info('Загрузка токенов в Figma...');
    log.warn('Эта функция требует отдельной реализации через Figma Plugin API');
    log.info('Используйте: npm run figma:push (после полной реализации)');
  } else if (syncResponse.action === 'pull') {
    log.info('Извлечение токенов из Figma...');
    log.warn('Убедитесь, что в Figma файле настроены Variables');
    log.info('Используйте: npm run figma:pull');
  }

  // Завершение
  console.log(`
╔══════════════════════════════════════════════════════════╗
║   ✅ Настройка завершена успешно!                        ║
╚══════════════════════════════════════════════════════════╝

Доступные команды:
  npm run figma:test              - Проверить подключение
  npm run figma:pull              - Извлечь токены из Figma
  npm run figma:push              - Загрузить токены в Figma
  npm run figma:sync              - Двусторонняя синхронизация
  npm run figma:components:list   - Список компонентов

Документация: ./docs/FIGMA_WORKFLOW.md
`);
}

setupWizard().catch(console.error);
