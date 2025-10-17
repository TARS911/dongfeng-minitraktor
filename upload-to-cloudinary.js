#!/usr/bin/env node
/**
 * Скрипт для загрузки изображений на Cloudinary
 *
 * Использование:
 * CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME node upload-to-cloudinary.js
 *
 * Или задайте переменные отдельно:
 * CLOUDINARY_CLOUD_NAME=xxx CLOUDINARY_API_KEY=xxx CLOUDINARY_API_SECRET=xxx node upload-to-cloudinary.js
 */

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Конфигурация Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Ошибка: Не указаны credentials для Cloudinary!');
  console.error('\n📝 Использование:');
  console.error('CLOUDINARY_CLOUD_NAME=xxx CLOUDINARY_API_KEY=xxx CLOUDINARY_API_SECRET=xxx node upload-to-cloudinary.js');
  console.error('\nИли через CLOUDINARY_URL:');
  console.error('CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME node upload-to-cloudinary.js');
  console.error('\n🔑 Получите credentials на: https://console.cloudinary.com/console');
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

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

console.log('🚀 Начинаю загрузку изображений на Cloudinary...\n');

async function uploadImage(filename) {
  const filePath = path.join(imagesDir, filename);

  if (!fs.existsSync(filePath)) {
    console.error(`⚠️  Файл не найден: ${filename}`);
    return null;
  }

  try {
    console.log(`📤 Загружаю: ${filename}...`);

    // Загружаем на Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'dongfeng-minitraktor', // Папка на Cloudinary
      public_id: filename.replace(/\.[^/.]+$/, ''), // Имя без расширения
      overwrite: true,
      resource_type: 'auto'
    });

    console.log(`✅ Загружено: ${filename}`);
    console.log(`   URL: ${result.secure_url}\n`);

    return {
      filename,
      url: result.secure_url,
      publicId: result.public_id
    };

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
  }

  // Сохраняем результаты в JSON файл
  const outputFile = path.join(__dirname, 'cloudinary-urls.json');
  fs.writeFileSync(outputFile, JSON.stringify(uploadResults, null, 2));

  console.log('\n✅ Все изображения загружены!');
  console.log(`📁 URLs сохранены в: ${outputFile}\n`);

  // Выводим конфиг для копирования
  console.log('📋 Конфигурация для использования в коде:\n');
  console.log('```javascript');
  console.log('const CDN_IMAGES = {');
  for (const [filename, url] of Object.entries(uploadResults)) {
    console.log(`  '${filename}': '${url}',`);
  }
  console.log('};');
  console.log('```\n');

  console.log('🎉 Готово! Теперь можно обновить код для использования CDN.');
}

uploadAll().catch(error => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});
