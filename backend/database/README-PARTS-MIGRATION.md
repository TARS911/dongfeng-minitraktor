# Миграция запчастей в Supabase PostgreSQL

## Обзор

Готовая миграция для импорта **2836 запчастей** из каталога Agrodom в Supabase PostgreSQL.

## Файлы миграции

### 1. `supabase-migration-parts.sql` (9 KB)
**Схема базы данных** - создаёт таблицы и индексы:
- Таблица `parts_categories` - категории запчастей (иерархическая)
- Таблица `parts` - каталог запчастей (2836+ товаров)
- Индексы для поиска и фильтрации
- Row Level Security (RLS) политики
- Полнотекстовый поиск (русский язык)
- Функции для работы с данными

### 2. `supabase-parts-data.sql` (2.8 MB)
**Данные** - 2836 INSERT statements с товарами:
- Название, slug, артикул (SKU)
- Цена, наличие, производитель
- Изображения, ссылки на источник
- Категоризация

## Инструкция по применению миграции

### Шаг 1: Открыть Supabase Dashboard

1. Перейдите на https://supabase.com/dashboard
2. Выберите ваш проект: **dongfeng-minitraktor**
3. Откройте **SQL Editor** (левая панель)

### Шаг 2: Создать схему (таблицы)

1. Нажмите **New Query**
2. Скопируйте содержимое файла `supabase-migration-parts.sql`
3. Вставьте в SQL Editor
4. Нажмите **Run** (или Ctrl+Enter)

**Ожидаемый результат:**
```
✅ Миграция запчастей выполнена успешно!
Категорий запчастей: 9
Запчастей в базе: 0
```

### Шаг 3: Импортировать данные

**⚠️ ВАЖНО:** Файл `supabase-parts-data.sql` большой (2.8 MB), поэтому импортируйте его **частями**:

#### Вариант A: Импорт через SQL Editor (рекомендуется)

Разбейте файл на части:

```bash
# Разбить файл на части по 500 товаров
cd backend/database
split -l 500 supabase-parts-data.sql parts-chunk-

# Получите 6 файлов: parts-chunk-aa, parts-chunk-ab, ...
```

Затем импортируйте каждую часть через SQL Editor.

#### Вариант B: Импорт через PostgreSQL клиент

```bash
# Используйте строку подключения из Supabase Settings > Database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -f backend/database/supabase-parts-data.sql
```

#### Вариант C: Использовать Python скрипт (для будущей автоматизации)

Создайте скрипт прямого подключения к Supabase через psycopg2.

### Шаг 4: Проверка импорта

Выполните проверочные запросы:

```sql
-- Общее количество запчастей
SELECT COUNT(*) as total_parts FROM parts;
-- Ожидается: 2836

-- Распределение по производителям
SELECT manufacturer, COUNT(*) as count
FROM parts
WHERE manufacturer IS NOT NULL
GROUP BY manufacturer
ORDER BY count DESC;

-- Запчасти с ценами
SELECT COUNT(*) as parts_with_price
FROM parts
WHERE price IS NOT NULL;
-- Ожидается: ~2800+

-- Запчасти с изображениями
SELECT COUNT(*) as parts_with_images
FROM parts
WHERE image_url IS NOT NULL;
-- Ожидается: ~2500+

-- Примеры запчастей
SELECT id, name, price, manufacturer
FROM parts
LIMIT 10;
```

## Структура таблицы `parts`

```sql
CREATE TABLE parts (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    sku TEXT,
    category_id BIGINT,
    subcategory TEXT,

    -- Цена и наличие
    price DECIMAL(10, 2),
    old_price DECIMAL(10, 2),
    in_stock BOOLEAN DEFAULT TRUE,
    stock_status TEXT,

    -- Производитель и совместимость
    manufacturer TEXT,
    compatible_models TEXT[],
    part_number TEXT,

    -- Описание
    description TEXT,
    specifications JSONB,

    -- Медиа
    image_url TEXT,
    images_gallery TEXT[],
    product_url TEXT,

    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Полезные SQL функции

### Полнотекстовый поиск

```sql
-- Поиск запчастей по названию
SELECT * FROM search_parts('гидравлика');

-- Поиск с сортировкой по релевантности
SELECT name, price, rank
FROM search_parts('двигатель')
ORDER BY rank DESC
LIMIT 20;
```

### Фильтрация по производителю

```sql
-- Все запчасти DongFeng
SELECT name, price FROM parts
WHERE manufacturer = 'Dongfeng'
ORDER BY price;

-- Все запчасти Уралец
SELECT name, price FROM parts
WHERE manufacturer = 'Uralets';
```

### Фильтрация по цене

```sql
-- Запчасти от 1000 до 5000 руб
SELECT name, price, manufacturer
FROM parts
WHERE price BETWEEN 1000 AND 5000
ORDER BY price;

-- Самые дорогие запчасти
SELECT name, price, manufacturer
FROM parts
WHERE price IS NOT NULL
ORDER BY price DESC
LIMIT 20;
```

## API Endpoints (для Next.js)

После миграции создайте API endpoints:

```typescript
// app/api/parts/route.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')
  const manufacturer = searchParams.get('manufacturer')

  let query = supabase.from('parts').select('*')

  if (search) {
    // Полнотекстовый поиск
    const { data } = await supabase.rpc('search_parts', {
      search_query: search
    })
    return Response.json({ parts: data })
  }

  if (manufacturer) {
    query = query.eq('manufacturer', manufacturer)
  }

  const { data, error } = await query
  return Response.json({ parts: data })
}
```

## Дальнейшие шаги

1. ✅ **Миграция выполнена** - таблицы и данные импортированы
2. 🔄 **Создать API endpoints** - для фронтенда
3. 🎨 **Создать UI** - каталог запчастей на сайте
4. 🔍 **Настроить поиск** - полнотекстовый поиск по названию
5. 📊 **Добавить фильтры** - по производителю, цене, категории

## Контакты и поддержка

Для вопросов о миграции создайте issue в репозитории.

---

**Создано:** 2025-11-18
**Версия:** 1.0.0
**Источник данных:** Agrodom (xn----7sbabpgpk4bsbesjp1f.xn--p1ai)
