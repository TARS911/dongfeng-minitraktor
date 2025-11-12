// ========================================
// СКРИПТ ДЛЯ КОНСОЛИ БРАУЗЕРА
// ========================================
// Откройте dongfeng-traktor.com
// Нажмите F12 → Console
// Скопируйте и вставьте этот код

// ========================================
// ШАГ 1: Найти все изображения
// ========================================
console.log('🔍 Поиск изображений тракторов...');

const images = Array.from(document.querySelectorAll('img'))
  .filter(img => {
    // Фильтруем: большие изображения, не логотипы
    return img.src &&
           img.src.includes('http') &&
           img.width > 200 &&
           img.height > 200 &&
           !img.src.toLowerCase().includes('logo') &&
           !img.src.toLowerCase().includes('icon');
  })
  .map((img, i) => {
    return {
      num: i + 1,
      src: img.src,
      alt: img.alt || 'Без названия',
      title: img.title || '',
      size: `${img.width}x${img.height}`
    };
  });

console.log(`✅ Найдено изображений: ${images.length}`);
console.table(images);

// ========================================
// ШАГ 2: Скопировать URL в буфер обмена
// ========================================
if (images.length > 0) {
  const urls = images.map(img => img.src).join('\n');
  copy(urls);
  console.log('📋 URL скопированы в буфер обмена!');
  console.log('Вставьте их в текстовый файл');
} else {
  console.log('⚠️ Изображения не найдены. Подождите загрузки страницы.');
}

// ========================================
// ШАГ 3 (ОПЦИОНАЛЬНО): Скачать изображения
// ========================================
// Функция для скачивания одного изображения
async function downloadImage(index, filename) {
  if (index < 0 || index >= images.length) {
    console.error('❌ Неверный индекс!');
    return;
  }

  try {
    const img = images[index];
    console.log(`📥 Скачивание: ${filename}`);
    console.log(`   URL: ${img.src}`);

    const response = await fetch(img.src);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(`✅ Скачано: ${filename}`);
  } catch (error) {
    console.error(`❌ Ошибка скачивания: ${error.message}`);
  }
}

// Функция для скачивания всех изображений
async function downloadAll() {
  console.log('📥 Скачивание всех изображений...');

  for (let i = 0; i < Math.min(images.length, 16); i++) {
    const filename = `dongfeng-image-${i + 1}.jpg`;
    await downloadImage(i, filename);
    // Небольшая пауза между скачиваниями
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('✅ Все изображения скачаны!');
}

// ========================================
// ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ
// ========================================
console.log('\n📖 ИНСТРУКЦИЯ:');
console.log('');
console.log('1. URL уже скопированы в буфер обмена');
console.log('   Вставьте их в текстовый файл');
console.log('');
console.log('2. Чтобы скачать одно изображение:');
console.log('   downloadImage(0, "dongfeng-244.jpg")');
console.log('');
console.log('3. Чтобы скачать все:');
console.log('   downloadAll()');
console.log('');
console.log('4. Посмотреть список снова:');
console.log('   console.table(images)');
console.log('');
console.log('========================================');
