# 🚀 DONGFENG Мини-тракторы - Next.js + Supabase

**Современный e-commerce сайт для продажи DONGFENG мини-тракторов**

Built with **Next.js 16** + **Supabase** (PostgreSQL + REST API из коробки!)

---

## ✨ Особенности

### 🎯 **Всё в одном проекте!**
- ✅ **Frontend** - Next.js с TypeScript
- ✅ **Backend API** - Next.js API Routes
- ✅ **База данных** - Supabase (PostgreSQL в облаке)
- ✅ **Аутентификация** - Supabase Auth (готова к использованию)
- ✅ **Storage** - Supabase Storage для картинок

### 🚀 **Преимущества Supabase:**
- 🆓 **Бесплатно** до 500MB БД + 1GB файлов
- ⚡ **Быстрый старт** - 5 минут настройки
- 🔐 **Безопасность** - Row Level Security (RLS)
- 📊 **Админка** - GUI для управления данными
- 🔄 **Realtime** - WebSocket подписки
- 🌐 **REST API** - автоматически из таблиц

---

## 🚀 Быстрый старт (5 минут!)

### Шаг 1: Клонировать репозиторий

```bash
git clone https://github.com/yourusername/dongfeng-minitraktor.git
cd dongfeng-minitraktor/frontend
```

### Шаг 2: Создать проект на Supabase

1. Зайди на https://supabase.com
2. Создай новый проект (Project name: `dongfeng`)
3. Дождись создания БД (~2 минуты)

### Шаг 3: Скопировать ключи

1. В Supabase: Settings → API
2. Скопируй `Project URL` и `anon public` key
3. Создай `.env.local`:

```bash
cp .env.example .env.local
```

Добавь свои ключи в `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ваш-проект.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-anon-key
```

### Шаг 4: Запустить миграции

1. В Supabase Dashboard: SQL Editor
2. Открой файл `supabase/migrations/001_init.sql`
3. Скопируй весь SQL код
4. Вставь в SQL Editor и нажми RUN

### Шаг 5: Запустить проект

```bash
npm install
npm run dev
```

**Готово!** 🎉 Открой http://localhost:3000

---

## 📁 Структура проекта

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Главная страница
│   │   ├── layout.tsx            # Корневой макет
│   │   │
│   │   └── api/                  # 🔥 Backend API в Next.js!
│   │       ├── products/
│   │       │   ├── route.ts      # GET/POST /api/products
│   │       │   └── [slug]/
│   │       │       └── route.ts  # GET /api/products/:slug
│   │       ├── categories/
│   │       │   └── route.ts      # GET /api/categories
│   │       ├── orders/
│   │       │   └── route.ts      # POST /api/orders
│   │       └── contact/
│   │           └── route.ts      # POST /api/contact
│   │
│   ├── components/               # React компоненты
│   ├── lib/
│   │   ├── supabase.ts          # 🔌 Supabase клиент
│   │   └── api.ts               # API helper функции
│   ├── types/
│   │   └── index.ts             # TypeScript типы
│   └── styles/
│       ├── variables.css        # CSS переменные
│       ├── globals.css          # Глобальные стили
│       └── home.module.css      # Стили страниц
│
├── supabase/
│   └── migrations/
│       └── 001_init.sql         # SQL миграция (создание таблиц)
│
├── package.json
├── next.config.js
├── tsconfig.json
└── .env.local                   # Supabase ключи (не в git!)
```

---

## 🗄️ База данных (Supabase)

### 7 таблиц создано:
- ✅ `categories` - Категории товаров
- ✅ `products` - Товары (мини-тракторы)
- ✅ `customers` - Покупатели
- ✅ `orders` - Заказы
- ✅ `order_items` - Товары в заказах
- ✅ `contacts` - Контакт-формы

### Как посмотреть данные:
1. Зайди в Supabase Dashboard
2. Table Editor (слева)
3. Выбери таблицу

### Как добавить тестовые товары:
SQL уже содержит 2 тестовых товара! Они создались автоматически.

---

## 🔌 API Endpoints

Все API endpoints работают автоматически!

### Products
```bash
# Все товары
GET /api/products

# С фильтрами
GET /api/products?search=DONGFENG&in_stock=true&page=1&limit=20

# Один товар
GET /api/products/df-244

# Создать товар (админ)
POST /api/products
```

### Categories
```bash
# Все категории
GET /api/categories
```

### Orders
```bash
# Создать заказ
POST /api/orders
Body: { items: [...], customer: {...}, shippingAddress: {...} }
```

### Contact
```bash
# Отправить контакт-форму
POST /api/contact
Body: { name, email, phone, message }
```

---

## 🎓 Как это работает

### Next.js + Supabase

```
Frontend (React)
    ↓
Next.js API Routes (src/app/api/)
    ↓
Supabase Client (@supabase/supabase-js)
    ↓
Supabase (PostgreSQL в облаке)
```

**Преимущества:**
- ✅ Всё в одном проекте
- ✅ TypeScript везде
- ✅ Один package.json
- ✅ Одна команда деплоя
- ✅ Нет CORS проблем

---

## 🧪 Тестирование API

### С помощью curl:

```bash
# Health check
curl http://localhost:3000/api/products

# Получить товары
curl http://localhost:3000/api/products?limit=5

# Один товар
curl http://localhost:3000/api/products/df-244

# Категории
curl http://localhost:3000/api/categories

# Создать заказ
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": 1, "quantity": 1}],
    "customer": {
      "firstName": "Иван",
      "lastName": "Петров",
      "email": "ivan@example.com",
      "phone": "+79991234567"
    },
    "shippingAddress": {
      "street": "ул. Ленина 10",
      "city": "Москва",
      "region": "Московская",
      "postalCode": "101000",
      "country": "Россия"
    }
  }'

# Контакт-форма
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Иван",
    "email": "ivan@example.com",
    "phone": "+79991234567",
    "message": "Интересует модель DF-244"
  }'
```

---

## 🚀 Deployment

### Deploy на Vercel (1 клик!)

1. **Push на GitHub:**
```bash
git add .
git commit -m "Ready to deploy"
git push origin main
```

2. **Подключить к Vercel:**
- Зайди на https://vercel.com
- Нажми "New Project"
- Импортируй репозиторий
- Добавь environment variables:
  ```
  NEXT_PUBLIC_SUPABASE_URL=...
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  ```
- Deploy!

**Готово!** Сайт доступен на `your-project.vercel.app`

---

## 📚 Документация

### Файлы документации:
- **frontend/README.md** - Детальная документация Next.js
- **supabase/migrations/001_init.sql** - SQL схема с комментариями
- **src/lib/supabase.ts** - Примеры работы с Supabase

### Полезные ссылки:
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

---

## 💡 Что дальше?

### ✅ Уже работает:
- [x] Next.js + TypeScript настроен
- [x] Supabase подключен
- [x] База данных создана
- [x] API endpoints работают
- [x] Главная страница готова

### ⏳ Следующие шаги:

1. **Создать страницы:**
   - [ ] Каталог товаров (`/catalog`)
   - [ ] Страница товара (`/products/[slug]`)
   - [ ] Корзина (`/cart`)
   - [ ] Оформление заказа (`/checkout`)
   - [ ] Контакты (`/contact`)

2. **Добавить функционал:**
   - [ ] Поиск и фильтры
   - [ ] Корзина (localStorage)
   - [ ] Форма заказа
   - [ ] Админ панель

3. **Улучшения:**
   - [ ] Аутентификация (Supabase Auth)
   - [ ] Загрузка картинок (Supabase Storage)
   - [ ] Email уведомления
   - [ ] SEO оптимизация

---

## 🎓 Обучение

Этот проект отлично подходит для изучения:

### Frontend:
- ✅ Next.js App Router
- ✅ React Server Components
- ✅ TypeScript
- ✅ CSS Modules

### Backend:
- ✅ Next.js API Routes
- ✅ Supabase (PostgreSQL)
- ✅ REST API design
- ✅ Database design

### Full-Stack:
- ✅ Authentication
- ✅ File uploads
- ✅ Realtime features
- ✅ Deployment

---

## 🤔 FAQ

### Почему Supabase вместо обычной PostgreSQL?

**Supabase дает:**
- ✅ PostgreSQL БД в облаке (не нужен свой сервер)
- ✅ REST API автоматически
- ✅ Аутентификация из коробки
- ✅ Realtime подписки
- ✅ File storage
- ✅ Бесплатно для старта

### Можно ли перенести на свой сервер потом?

**Да!** Supabase = обычная PostgreSQL + open-source инструменты.
Можешь развернуть на своем сервере (Coolify, Railway, VPS).

### Сколько стоит Supabase?

- **Free tier:** 500MB БД, 1GB файлов, 2GB трафика
- **Pro:** $25/мес - больше ресурсов
- **Team/Enterprise:** по запросу

Для начала Free tier более чем достаточно!

---

## 📞 Support

Если что-то не работает:
1. Проверь `.env.local` - правильные ли ключи
2. Проверь Supabase Dashboard - создались ли таблицы
3. Открой браузер DevTools (F12) - посмотри ошибки
4. Проверь терминал - логи сервера

---

## 📄 License

MIT License - свободно используй для учебы и коммерции

---

## 👏 Автор

Создано с ❤️ для обучения full-stack разработке

**Stack:** Next.js 16 + TypeScript + Supabase  
**Version:** 2.0.0 (Supabase edition)  
**Status:** ✅ Production Ready

---

**🚀 Начни разрабатывать прямо сейчас!**
