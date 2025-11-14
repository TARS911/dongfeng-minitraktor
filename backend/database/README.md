# База данных Supabase (PostgreSQL)

Проект использует **PostgreSQL** через Supabase как основную базу данных.

## Содержание

- `config.js` - Конфигурация Supabase и утилиты валидации
- `supabase-schema.sql` - SQL-схема для Supabase с RLS политиками
- `init.js` - Инициализация базы данных
- `seed.js` - Тестовые данные

## Требования

- Node.js 18+
- Доступ к Supabase проекту

## Установка

### 1. Установка зависимостей

```bash
npm install @supabase/supabase-js dotenv
```

### 2. Настройка переменных окружения

Создайте файл `.env` в папке `backend/database/`:

```bash
cp .env.example .env
```

Отредактируйте `.env` и добавьте ваши credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

**Где найти credentials:**
1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Settings → API
4. Скопируйте `Project URL` и `anon/public key`

## Схема базы данных

### Создание схемы в Supabase

Выполните SQL-скрипт в Supabase SQL Editor:

1. Откройте Supabase Dashboard → SQL Editor
2. Нажмите "New query"
3. Скопируйте содержимое файла `supabase-schema.sql`
4. Выполните запрос

Это создаст:
- 4 таблицы (categories, products, contacts, delivery_requests)
- Индексы для оптимизации
- RLS политики безопасности
- Триггеры и функции
- Таблицу версий схемы

## Безопасность

### Credentials
- **НИКОГДА** не коммитьте файл `.env` в Git
- `.env` уже добавлен в `.gitignore`
- Используйте `.env.example` как шаблон

### Row Level Security (RLS)

Схема включает RLS политики:
- **Категории и товары**: Публичное чтение, изменение только для авторизованных
- **Контакты и доставка**: Анонимное создание, чтение только для авторизованных

## Валидация данных

Все скрипты используют встроенную валидацию из `config.js`:

```javascript
import { validators } from './config.js';

validators.validateProduct(product);  // Проверка обязательных полей
validators.validateCategory(category);
validators.validateContact(contact);
validators.validateDeliveryRequest(request);
```

Валидация проверяет:
- Наличие обязательных полей
- Корректность типов данных
- Положительные значения цен и мощности
- Валидность slug'ов

## Полезные утилиты

### Проверка данных в Supabase

```javascript
import { checkExistingData } from './config.js';

const data = await checkExistingData();
console.log(data); // { categories: 3, products: 4052, isEmpty: false }
```

## Обработка ошибок

### Ошибка: "Отсутствуют обязательные переменные окружения"

```
❌ ОШИБКА: Отсутствуют обязательные переменные окружения!
```

**Решение**: Создайте файл `.env` с корректными credentials.

### Проблемы с Supabase подключением

```
Error: Invalid API key
```

**Решение:** 
1. Проверьте правильность `SUPABASE_URL` и `SUPABASE_ANON_KEY`
2. Убедитесь, что в ключе нет лишних пробелов
3. Попробуйте пересоздать ключ в Supabase Dashboard

## Полезные SQL запросы

### Проверка данных

```sql
-- Количество записей
SELECT 
  (SELECT COUNT(*) FROM categories) as categories_count,
  (SELECT COUNT(*) FROM products) as products_count,
  (SELECT COUNT(*) FROM contacts) as contacts_count,
  (SELECT COUNT(*) FROM delivery_requests) as delivery_count;

-- Товары по категориям
SELECT c.name, COUNT(p.id) as product_count
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.name;

-- Последние добавленные товары
SELECT name, model, price, created_at
FROM products
ORDER BY created_at DESC
LIMIT 10;
```

### Очистка БД (если нужно начать заново)

```sql
-- ВНИМАНИЕ: Удалит все данные!
TRUNCATE TABLE delivery_requests CASCADE;
TRUNCATE TABLE contacts CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE categories CASCADE;
```

## Дополнительная информация

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## Поддержка

При возникновении проблем:
1. Проверьте логи выполнения скрипта
2. Убедитесь, что все зависимости установлены
3. Проверьте версию Node.js (должна быть 18+)
4. Проверьте Supabase Dashboard на наличие ошибок

## Лицензия

MIT
