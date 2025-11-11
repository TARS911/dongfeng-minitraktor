# Parsed Data - Тракторы DongFeng

## Файлы

### dongfeng_tractors.json
Содержит данные о 16 моделях тракторов DongFeng с характеристиками и ценами.

**Структура данных:**
```json
{
  "name": "Название модели",
  "brand": "DongFeng",
  "slug": "url-friendly-название",
  "model": "Номер модели",
  "power_hp": "Мощность в л.с.",
  "power_kw": "Мощность в кВт",
  "engine": "Описание двигателя",
  "drive": "Привод (4x4)",
  "price_from": "Цена от (руб)",
  "price_to": "Цена до (руб)",
  "category": "Категория",
  "brand_category": "dongfeng",
  "in_stock": true/false,
  "featured": true/false
}
```

## Изображения

### Структура папки images/
```
images/
  ├── dongfeng-244.jpg
  ├── dongfeng-244-g2.jpg
  ├── dongfeng-304.jpg
  ├── dongfeng-404.jpg
  ├── dongfeng-504.jpg
  ├── dongfeng-504-g3.jpg
  ├── dongfeng-704.jpg
  ├── dongfeng-804.jpg
  ├── dongfeng-904.jpg
  ├── dongfeng-1004.jpg
  ├── dongfeng-1204.jpg
  ├── dongfeng-1304.jpg
  ├── dongfeng-1304e.jpg
  ├── dongfeng-1404.jpg
  ├── dongfeng-1604.jpg
  └── dongfeng-2004.jpg
```

### Как добавить изображения:

**Вариант 1: Автоматическая загрузка**
```bash
# Запустить парсер с браузером (требует Playwright)
cd scripts
./venv/bin/python parse-dongfeng-site.py
```

**Вариант 2: Ручная загрузка**
1. Скачать изображения с dongfeng-traktor.com
2. Переименовать в формат: `dongfeng-{модель}.jpg`
3. Разместить в папке `images/`

**Вариант 3: Placeholder**
Использовать временные изображения до получения реальных фото.

## Импорт в базу данных

Для импорта данных в Supabase используйте скрипт:
```bash
python scripts/import-dongfeng-to-db.py
```

## Статистика

- **Всего моделей:** 16
- **Диапазон мощности:** 24-200 л.с.
- **Ценовой диапазон:** 350,000 - 2,200,000 руб.
- **Категория:** Мини-тракторы
- **Бренд:** DongFeng (Китай)
