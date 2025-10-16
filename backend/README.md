# 🚀 DONGFENG Backend API

Современный **Fastify** backend с **SQLite** базой данных для сайта минитракторов DONGFENG.

## ⚡ Особенности

- **Fastify** - высокопроизводительный web-фреймворк (в 2 раза быстрее Express)
- **SQLite** - легковесная встроенная база данных
- **Валидация** данных из коробки
- **CORS** поддержка
- **RESTful API** архитектура
- **Graceful shutdown**
- **Подробное логирование**

## 📁 Структура проекта

```
backend/
├── server.js           # Главный файл сервера
├── config/
│   └── database.js    # Конфигурация БД
├── database/
│   ├── init.js        # Инициализация таблиц
│   ├── seed.js        # Тестовые данные
│   └── dongfeng.db    # SQLite база (создается автоматически)
├── routes/
│   ├── products.js    # API товаров
│   └── forms.js       # API форм
├── .env               # Переменные окружения
└── package.json
```

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Инициализация базы данных

```bash
npm run init-db
```

### 3. Заполнение тестовыми данными

```bash
npm run seed-db
```

### 4. Запуск сервера

```bash
npm start
```

Сервер запустится на **http://localhost:3000**

### 5. Режим разработки (с hot reload)

```bash
npm run dev
```

## 📡 API Endpoints

### Товары

#### `GET /api/products`
Получить список всех товаров с фильтрацией и сортировкой.

**Query параметры:**
- `category` (string) - Фильтр по категории (slug)
- `in_stock` (boolean) - Только в наличии
- `is_hit` (boolean) - Только хиты продаж
- `is_new` (boolean) - Только новинки
- `min_price` (integer) - Минимальная цена
- `max_price` (integer) - Максимальная цена
- `search` (string) - Поиск по названию/описанию
- `sort_by` (enum) - Сортировка: `price_asc`, `price_desc`, `power_asc`, `power_desc`, `newest`
- `limit` (integer, default: 100) - Количество результатов
- `offset` (integer, default: 0) - Смещение для пагинации

**Пример:**
```bash
GET /api/products?category=minitractory&in_stock=true&limit=10
```

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Минитрактор DONGFENG DF-244",
      "slug": "df-244",
      "model": "DF-244",
      "price": 285000,
      "power": 24,
      "drive": "4x4",
      "transmission": "8+8",
      "in_stock": true,
      "is_hit": true,
      "category_name": "Минитрактора",
      "specifications": { ... }
    }
  ],
  "pagination": {
    "total": 6,
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```

#### `GET /api/products/:slug`
Получить один товар по slug.

**Пример:**
```bash
GET /api/products/df-244
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Минитрактор DONGFENG DF-244",
    "price": 285000,
    "specifications": {
      "engine": {
        "type": "Дизельный",
        "cylinders": 3,
        "displacement": "1.5 л"
      }
    }
  }
}
```

---

### Категории

#### `GET /api/categories`
Получить все категории с количеством товаров.

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Минитрактора",
      "slug": "minitractory",
      "description": "Компактные тракторы...",
      "products_count": 4
    }
  ]
}
```

---

### Формы

#### `POST /api/contact`
Отправить заявку обратной связи.

**Body:**
```json
{
  "name": "Иван Иванов",
  "phone": "+79991234567",
  "email": "ivan@example.com",
  "message": "Хочу купить трактор",
  "product_model": "DF-244"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Ваша заявка принята!",
  "data": {
    "id": 1
  }
}
```

#### `POST /api/delivery-calculator`
Рассчитать стоимость доставки.

**Body:**
```json
{
  "city": "Москва",
  "product_model": "DF-244",
  "phone": "+79991234567"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Расчет доставки выполнен",
  "data": {
    "city": "Москва",
    "product_model": "DF-244",
    "estimated_cost": 3000,
    "estimated_days": "1-2",
    "request_id": 1,
    "note": "Точную стоимость уточнит менеджер"
  }
}
```

---

### Служебные

#### `GET /api/health`
Health check endpoint.

**Ответ:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-16T13:30:00.000Z",
  "uptime": 123.45
}
```

---

## 🗄️ База данных

### Схема таблиц

#### `products`
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  model TEXT,
  category_id INTEGER,
  price INTEGER NOT NULL,
  power INTEGER,
  drive TEXT,
  transmission TEXT,
  in_stock BOOLEAN DEFAULT 1,
  is_hit BOOLEAN DEFAULT 0,
  is_new BOOLEAN DEFAULT 0,
  specifications TEXT (JSON),
  created_at DATETIME
);
```

#### `categories`
```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT
);
```

#### `contacts`
```sql
CREATE TABLE contacts (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT,
  product_model TEXT,
  status TEXT DEFAULT 'new',
  created_at DATETIME
);
```

#### `delivery_requests`
```sql
CREATE TABLE delivery_requests (
  id INTEGER PRIMARY KEY,
  city TEXT NOT NULL,
  product_model TEXT NOT NULL,
  phone TEXT NOT NULL,
  estimated_cost INTEGER,
  estimated_days TEXT,
  status TEXT DEFAULT 'new',
  created_at DATETIME
);
```

---

## ⚙️ Переменные окружения

Создайте файл `.env`:

```env
# Server
PORT=3000
HOST=0.0.0.0

# Database
DB_PATH=./database/dongfeng.db

# CORS
FRONTEND_URL=http://localhost:8000

# Environment
NODE_ENV=development
```

---

## 🧪 Тестирование API

### С помощью curl

```bash
# Health check
curl http://localhost:3000/api/health

# Все товары
curl http://localhost:3000/api/products

# Поиск по товарам
curl "http://localhost:3000/api/products?search=dongfeng&in_stock=true"

# Один товар
curl http://localhost:3000/api/products/df-244

# Категории
curl http://localhost:3000/api/categories

# Отправка формы
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Тест",
    "phone": "+79991234567",
    "message": "Тестовая заявка"
  }'

# Расчет доставки
curl -X POST http://localhost:3000/api/delivery-calculator \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Москва",
    "product_model": "DF-244",
    "phone": "+79991234567"
  }'
```

### С помощью Postman/Insomnia

Импортируйте коллекцию API endpoints из документации выше.

---

## 📊 Производительность

**Fastify** показывает отличную производительность:
- 70,000+ req/sec на простых GET запросах
- В 2 раза быстрее Express
- Низкое потребление памяти

---

## 🔧 Скрипты

```bash
npm start          # Запуск production сервера
npm run dev        # Режим разработки с hot reload
npm run init-db    # Инициализация БД
npm run seed-db    # Заполнение тестовыми данными
npm test           # Запуск тестов (пока не реализовано)
```

---

## 🚢 Деплой

### Railway / Render / Heroku

1. Установите переменные окружения
2. База SQLite создастся автоматически
3. Запустите `npm start`

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📝 TODO

- [ ] Добавить JWT auth для админки
- [ ] Добавить тесты (Jest/Vitest)
- [ ] Миграция на PostgreSQL для production
- [ ] API для загрузки изображений
- [ ] Rate limiting
- [ ] Логирование в файл
- [ ] Мониторинг (Prometheus/Grafana)

---

## 🤝 Вклад

Если нашли баг или хотите предложить улучшение - создайте issue или pull request!

---

## 📄 Лицензия

MIT

---

**Создано с ❤️ на Fastify + SQLite**
