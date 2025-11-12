# Руководство по добавлению изображений тракторов DongFeng

## Проблема
Сайт dongfeng-traktor.com использует динамическую загрузку изображений через JavaScript, что затрудняет автоматический парсинг.

## Решения

### Вариант 1: Ручное скачивание с сайта dongfeng-traktor.com

1. Откройте https://dongfeng-traktor.com/ в браузере
2. Для каждой модели:
   - Найдите изображение трактора
   - Правый клик → "Сохранить изображение как..."
   - Сохраните с именем: `dongfeng-{модель}.jpg`
     - Например: `dongfeng-244.jpg`, `dongfeng-504-g3.jpg`

3. Поместите все изображения в папку:
   ```
   parsed_data/dongfeng_images/
   ```

### Вариант 2: Использование браузера для парсинга

1. Откройте dongfeng-traktor.com
2. Откройте DevTools (F12)
3. В консоли выполните:

```javascript
// Получить все изображения тракторов
Array.from(document.querySelectorAll('img'))
  .filter(img => img.src && img.width > 200)
  .map(img => ({
    src: img.src,
    alt: img.alt,
    title: img.title
  }))
  .forEach((img, i) => console.log(`${i+1}. ${img.src}`))
```

4. Скопируйте URL изображений
5. Используйте скрипт для скачивания (см. ниже)

### Вариант 3: Временные placeholder изображения

Используйте placeholder изображения до получения реальных фото:

```
https://via.placeholder.com/800x600/0066cc/ffffff?text=DongFeng+244
https://via.placeholder.com/800x600/0066cc/ffffff?text=DongFeng+504
```

## Структура имен файлов

```
dongfeng-244.jpg         # DongFeng 244
dongfeng-244-g2.jpg      # DongFeng 244 G2
dongfeng-304.jpg         # DongFeng 304
dongfeng-404.jpg         # DongFeng 404
dongfeng-504.jpg         # DongFeng 504
dongfeng-504-g3.jpg      # DongFeng 504 G3
dongfeng-704.jpg         # DongFeng 704
dongfeng-804.jpg         # DongFeng 804
dongfeng-904.jpg         # DongFeng 904
dongfeng-1004.jpg        # DongFeng 1004
dongfeng-1204.jpg        # DongFeng 1204
dongfeng-1304.jpg        # DongFeng 1304
dongfeng-1304e.jpg       # DongFeng 1304E
dongfeng-1404.jpg        # DongFeng 1404
dongfeng-1604.jpg        # DongFeng 1604
dongfeng-2004.jpg        # DongFeng 2004
```

## Загрузка изображений в Supabase Storage

После получения изображений:

1. Поместите их в `parsed_data/dongfeng_images/`
2. Запустите скрипт загрузки:

```bash
python scripts/upload-dongfeng-images.py
```

Скрипт:
- Загрузит изображения в Supabase Storage
- Обновит записи товаров в БД с URL изображений
- Сгенерирует отчет

## Альтернативные источники изображений

1. **Официальные каталоги** - PDF каталоги от производителя
2. **Изображения от поставщиков** - запросить у дилеров
3. **Stock фото** - использовать общие изображения минитракторов

## Чеклист

- [ ] Скачать/найти изображения для всех 16 моделей
- [ ] Переименовать в правильный формат
- [ ] Разместить в `parsed_data/dongfeng_images/`
- [ ] Запустить скрипт загрузки
- [ ] Проверить на сайте

## Контакты

Если нужна помощь с изображениями, свяжитесь с менеджерами dongfeng-traktor.com:
- Телефон: указан на сайте
- Email: указан на сайте
