#!/usr/bin/env node
/**
 * Скрипт для загрузки изображений на ImgBB
 *
 * Использование:
 * IMGBB_API_KEY=your_key node upload-to-imgbb.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API ключ ImgBB
const apiKey = process.env.IMGBB_API_KEY;

if (!apiKey) {
  console.error('❌ Ошибка: Не указан IMGBB_API_KEY!');
  console.error('\n📝 Использование:');
  console.error('IMGBB_API_KEY=your_key node upload-to-imgbb.js');
  process.exit(1);
}

// Папка с изображениями
const imagesDir = path.join(__dirname, 'frontend', 'images');

// Список изображений для загрузки
const imagesToUpload = [
  'df-244-main.jpg',
  'df-304-main.jpg',
  'df-354-main.jpg',
  'df-404-main.jpg',
  'favicon.png',
  'logo.png',
  'og-image.jpg',
  'tractor-1.jpg',
  'tractor-2.jpg',
  'tractor-3.jpg'
];

// Результаты загрузки
const uploadResults = {};

console.log('🚀 Начинаю загрузку изображений на ImgBB...\n');

async function uploadImage(filename) {
  const filePath = path.join(imagesDir, filename);

  if (!fs.existsSync(filePath)) {
    console.error(`⚠️  Файл не найден: ${filename}`);
    return null;
  }

  try {
    console.log(`📤 Загружаю: ${filename}...`);

    // Читаем файл как base64
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString('base64');

    // Создаем FormData
    const formData = new FormData();
    formData.append('key', apiKey);
    formData.append('image', base64Image);
    formData.append('name', filename);

    // Отправляем на ImgBB
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      console.log(`✅ Загружено: ${filename}`);
      console.log(`   URL: ${result.data.display_url}\n`);

      return {
        filename,
        url: result.data.display_url,
        id: result.data.id,
        viewer_url: result.data.url_viewer,
        delete_url: result.data.delete_url
      };
    } else {
      console.error(`❌ Ошибка загрузки ${filename}:`, result.error?.message || 'Unknown error');
      return null;
    }

  } catch (error) {
    console.error(`❌ Ошибка загрузки ${filename}:`, error.message);
    return null;
  }
}

// Загружаем все изображения
async function uploadAll() {
  for (const filename of imagesToUpload) {
    const result = await uploadImage(filename);
    if (result) {
      uploadResults[filename] = result.url;
    }

    // Небольшая задержка между запросами
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Сохраняем результаты в JSON файл
  const outputFile = path.join(__dirname, 'imgbb-urls.json');
  fs.writeFileSync(outputFile, JSON.stringify(uploadResults, null, 2));

  console.log('\n✅ Все изображения загружены!');
  console.log(`📁 URLs сохранены в: ${outputFile}\n`);

  // Выводим конфиг для копирования
  console.log('📋 Конфигурация для использования в коде:\n');
  console.log('```javascript');
  console.log('const IMGBB_IMAGES = {');
  for (const [filename, url] of Object.entries(uploadResults)) {
    console.log(`  '${filename}': '${url}',`);
  }
  console.log('};');
  console.log('```\n');

  // Сравнение с Cloudinary
  console.log('📊 Сравнение с Cloudinary:\n');
  console.log('| Критерий | ImgBB | Cloudinary |');
  console.log('|----------|-------|------------|');
  console.log('| Скорость загрузки | Хорошо | Отлично (CDN) |');
  console.log('| Бесплатный план | Безлимит | 25GB |');
  console.log('| Надежность | Хорошо | 99.9% SLA |');
  console.log('| Оптимизация | Нет | WebP/AVIF |');
  console.log('\n💡 Рекомендация: Cloudinary для продакшена, ImgBB для тестов');
}

uploadAll().catch(error => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});
