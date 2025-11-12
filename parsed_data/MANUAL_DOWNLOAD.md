# Ручное скачивание изображений тракторов DongFeng

## Проблема
Сайт dongfeng-traktor.com защищен и требует ручного скачивания изображений.

## Решение: Пошаговая инструкция

### Шаг 1: Откройте сайт в браузере

```
https://dongfeng-traktor.com/
```

### Шаг 2: Для каждой модели трактора

1. **Найдите изображение трактора** на странице
2. **Правый клик на изображении** → "Открыть изображение в новой вкладке"
3. **Скопируйте URL изображения** из адресной строки
4. **Скачайте** используя одну из команд ниже

### Шаг 3: Команды для скачивания

После получения URL, используйте эти команды (замените `<URL>` на реальный URL):

```bash
# Переходим в папку для изображений
cd /home/ibm/dongfeng-minitraktor/parsed_data/dongfeng_images

# DongFeng 244
wget -O dongfeng-244.jpg "<URL_ИЗОБРАЖЕНИЯ>"

# DongFeng 244 G2
wget -O dongfeng-244-g2.jpg "<URL_ИЗОБРАЖЕНИЯ>"

# DongFeng 304
wget -O dongfeng-304.jpg "<URL_ИЗОБРАЖЕНИЯ>"

# DongFeng 404
wget -O dongfeng-404.jpg "<URL_ИЗОБРАЖЕНИЯ>"

# DongFeng 504
wget -O dongfeng-504.jpg "<URL_ИЗОБРАЖЕНИЯ>"

# DongFeng 504 G3
wget -O dongfeng-504-g3.jpg "<URL_ИЗОБРАЖЕНИЯ>"

# DongFeng 704
wget -O dongfeng-704.jpg "<URL_ИЗОБРАЖЕНИЯ>"

# DongFeng 804
wget -O dongfeng-804.jpg "<URL_ИЗОБРАЖЕНИЯ>"

# DongFeng 904
wget -O dongfeng-904.jpg "<URL_ИЗОБРАЖЕНИЯ>"

# DongFeng 1004
wget -O dongfeng-1004.jpg "<URL_ИЗОБРАЖЕНИЯ>"

# DongFeng 1204
wget -O dongfeng-1204.jpg "<URL_ИЗОБРАЖЕНИЯ>"

# DongFeng 1304
wget -O dongfeng-1304.jpg "<URL_ИЗОБРАЖЕНИЯ>"

# DongFeng 1304E
wget -O dongfeng-1304e.jpg "<URL_ИЗОБРАЖЕНИЯ>"

# DongFeng 1404
wget -O dongfeng-1404.jpg "<URL_ИЗОБРАЖЕНИЯ>"

# DongFeng 1604
wget -O dongfeng-1604.jpg "<URL_ИЗОБРАЖЕНИЯ>"

# DongFeng 2004
wget -O dongfeng-2004.jpg "<URL_ИЗОБРАЖЕНИЯ>"
```

### Шаг 4: Проверка скачанных изображений

```bash
ls -lh /home/ibm/dongfeng-minitraktor/parsed_data/dongfeng_images/
```

### Шаг 5: Загрузка в Supabase

После скачивания всех (или части) изображений:

```bash
cd /home/ibm/dongfeng-minitraktor
export SUPABASE_SERVICE_ROLE_KEY="<ключ из .env.local>"
python3 scripts/upload-dongfeng-images.py
```

---

## Альтернатива: Использование браузерной консоли

### Метод 1: Получить все URL изображений

1. Откройте dongfeng-traktor.com
2. Откройте DevTools (F12)
3. Перейдите в Console
4. Вставьте и выполните:

```javascript
// Получить все большие изображения
const images = Array.from(document.querySelectorAll('img'))
  .filter(img => img.width > 200 && img.height > 200)
  .filter(img => !img.src.includes('logo') && !img.src.includes('icon'))
  .map((img, i) => ({
    num: i + 1,
    src: img.src,
    alt: img.alt,
    size: `${img.width}x${img.height}`
  }));

console.table(images);

// Скопировать все URL в буфер обмена
copy(images.map(img => img.src).join('\n'));
```

5. URL будут скопированы - вставьте их в текстовый файл

### Метод 2: Скачать через консоль браузера

```javascript
// Скачать изображение по индексу
async function downloadImage(index, filename) {
  const img = images[index];
  const response = await fetch(img.src);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

// Пример: скачать первое изображение
downloadImage(0, 'dongfeng-244.jpg');
```

---

## Альтернатива: Placeholder изображения

Если получить реальные изображения сложно, можно временно использовать placeholder:

```bash
cd /home/ibm/dongfeng-minitraktor/parsed_data/dongfeng_images

# Создаем placeholder изображения
for model in 244 244-g2 304 404 504 504-g3 704 804 904 1004 1204 1304 1304e 1404 1604 2004; do
  wget -O "dongfeng-${model}.jpg" \
    "https://via.placeholder.com/800x600/0066cc/ffffff?text=DongFeng+${model}"
done
```

Потом можно заменить на реальные фото.

---

## Чеклист

- [ ] Открыть dongfeng-traktor.com
- [ ] Найти изображения тракторов
- [ ] Скачать каждое изображение с правильным именем
- [ ] Проверить что все файлы скачаны
- [ ] Запустить upload-dongfeng-images.py
- [ ] Проверить на сайте beltehferm.netlify.app

---

## Нужна помощь?

Если у вас есть URL одного изображения, дайте мне знать - я помогу создать команду для его скачивания!
