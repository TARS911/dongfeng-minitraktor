# 🚀 Разделенный деплой: Railway (Backend) + Vercel (Frontend)

## Архитектура решения

```
Frontend (Vercel)              Backend (Railway)           Database (Supabase)
dongfeng.vercel.app       →    dongfeng.railway.app   →    PostgreSQL 500MB
      ↓                              ↓                           ↓
HTML/CSS/JS                    Node.js + Fastify          Products, Orders
Статический сайт               API endpoints              Categories, Forms
```

**💰 Стоимость:**
- Vercel (Frontend): **БЕСПЛАТНО навсегда**
- Railway (Backend): **$5/месяц кредитов** (достаточно для старта)
- Supabase (Database): **БЕСПЛАТНО** (500MB)

---

## Часть 1: Деплой Backend на Railway 🚂

### Шаг 1.1: Регистрация на Railway

1. Перейдите: **https://railway.app**
2. Нажмите **"Start a New Project"**
3. Войдите через **GitHub**
4. Подтвердите email

### Шаг 1.2: Создание проекта

1. **В Dashboard Railway нажмите "New Project"**
2. **Выберите "Deploy from GitHub repo"**
3. **Выберите репозиторий:** `dongfeng-minitraktor`
4. Railway начнет деплой автоматически

### Шаг 1.3: Настройка переменных окружения

В Railway Dashboard → **Variables** добавьте:

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
SUPABASE_URL=https://wbfhvcmvkyjsjvqkbxpz.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZmh2Y212a3lqc2p2cWtieHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNzg1MzksImV4cCI6MjA3Njg1NDUzOX0.5yHwVSIkbhDnnUKrPSe6uTCW-ImZYrczI-8nRQB0fHY
```

**Важно:** `FRONTEND_URL` добавим позже, когда получим URL Vercel

### Шаг 1.4: Настройка Build & Start команд

Railway должен автоматически прочитать `nixpacks.toml`, но можно настроить вручную:

**Settings → Build:**
```bash
cd backend && npm install
```

**Settings → Deploy:**
```bash
cd backend && npm start
```

### Шаг 1.5: Генерация публичного домена

1. В Railway Dashboard → **Settings → Networking**
2. Нажмите **"Generate Domain"**
3. Получите URL вида: `https://dongfeng-minitraktor-production.up.railway.app`
4. **Сохраните этот URL!** Он понадобится для frontend

### Шаг 1.6: Тестирование Backend

```bash
# Замените URL на ваш Railway URL
curl https://your-app.up.railway.app/api/health
curl https://your-app.up.railway.app/api/products
curl https://your-app.up.railway.app/api/categories
```

Если всё работает - **Backend готов!** ✅

---

## Часть 2: Деплой Frontend на Vercel ▲

### Шаг 2.1: Установка Vercel CLI

```bash
npm install -g vercel
```

### Шаг 2.2: Авторизация в Vercel

```bash
vercel login
# Войдите через GitHub или email
```

Или используйте токен:
```bash
export VERCEL_TOKEN="z6j8U1k0EueWnw5shh5gEMnJ"
```

### Шаг 2.3: Обновление API URL в frontend

**ВАЖНО!** Перед деплоем обновите файл:

`frontend/js/config.js`:
```javascript
// Замените на ваш Railway URL
const API_BASE_URL = 'https://your-app.up.railway.app/api';
```

Сохраните и закоммитьте:
```bash
git add frontend/js/config.js
git commit -m "Update API URL to Railway"
git push origin main
```

### Шаг 2.4: Деплой через Vercel CLI

```bash
cd /home/ibm/dongfeng-minitraktor
vercel --prod
```

**Ответьте на вопросы:**
```
? Set up and deploy "~/dongfeng-minitraktor"? [Y/n] Y
? Which scope? Your Name
? Link to existing project? [y/N] N
? What's your project's name? dongfeng-minitraktor
? In which directory is your code located? ./frontend
? Want to override the settings? [y/N] N
```

### Шаг 2.5: Получение Vercel URL

После деплоя Vercel выдаст URL:
```
✅ Production: https://dongfeng-minitraktor.vercel.app
```

**Сохраните этот URL!**

### Шаг 2.6: Обновление CORS в Railway

Теперь вернитесь в **Railway Dashboard → Variables** и добавьте:

```env
FRONTEND_URL=https://dongfeng-minitraktor.vercel.app
```

Railway автоматически перезапустит backend с новыми настройками.

---

## Часть 3: Альтернатива - Деплой через GitHub

### Вариант A: Railway через GitHub

Railway уже подключен к GitHub - при `git push` backend обновляется автоматически! ✅

### Вариант B: Vercel через GitHub

1. **Перейдите:** https://vercel.com/dashboard
2. **New Project → Import Git Repository**
3. **Выберите:** `dongfeng-minitraktor`
4. **Settings:**
   - Framework Preset: **Other**
   - Root Directory: **frontend**
   - Build Command: (пусто)
   - Output Directory: (пусто)
5. **Deploy!**

Теперь при `git push` оба проекта обновляются автоматически!

---

## Часть 4: Настройка автодеплоя

### Обновление кода:

```bash
# 1. Внесите изменения
cd /home/ibm/dongfeng-minitraktor

# 2. Backend изменения
nano backend/routes/products.js
git add backend/
git commit -m "Update backend"

# 3. Frontend изменения  
nano frontend/js/app.js
git add frontend/
git commit -m "Update frontend"

# 4. Push
git push origin main

# 5. Автоматически обновятся:
#    - Railway (backend) через nixpacks
#    - Vercel (frontend) через vercel.json
```

---

## Часть 5: Проверка работы

### Тестирование Backend (Railway):

```bash
curl https://your-railway-app.up.railway.app/api/health
```

Ожидаемый результат:
```json
{
  "success": true,
  "message": "API работает нормально",
  "timestamp": "2025-10-31T12:00:00.000Z"
}
```

### Тестирование Frontend (Vercel):

1. Откройте: `https://dongfeng-minitraktor.vercel.app`
2. Проверьте:
   - ✅ Главная страница загружается
   - ✅ Современный хедер с иконками
   - ✅ Бургер-меню работает
   - ✅ Анимации иконок
   - ✅ Блоки преимуществ

### Тестирование интеграции:

1. Откройте консоль браузера (F12)
2. Перейдите на страницу каталога
3. Проверьте Network → XHR запросы
4. Должны быть успешные запросы к Railway API

---

## Часть 6: Настройка кастомного домена

### Для Frontend (Vercel):

1. **Vercel Dashboard → Settings → Domains**
2. Добавьте домен: `dongfeng-minitraktor.ru`
3. Настройте DNS записи:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

### Для Backend (Railway):

1. **Railway Dashboard → Settings → Networking**
2. **Custom Domain:** `api.dongfeng-minitraktor.ru`
3. Настройте DNS:
   ```
   Type: CNAME
   Name: api
   Value: your-app.up.railway.app
   ```

---

## 🎯 Финальная архитектура

```
┌─────────────────────────────────────────────┐
│            ПОЛЬЗОВАТЕЛЬ                      │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│      Frontend (Vercel)                       │
│      https://dongfeng-minitraktor.vercel.app │
│                                              │
│  ✅ HTML, CSS, JavaScript                    │
│  ✅ Статический хостинг                      │
│  ✅ CDN по всему миру                        │
│  ✅ Автоматический SSL                       │
│  ✅ БЕСПЛАТНО навсегда                       │
└─────────────────────────────────────────────┘
                    │
                    │ HTTPS API запросы
                    ▼
┌─────────────────────────────────────────────┐
│      Backend (Railway)                       │
│      https://dongfeng.railway.app           │
│                                              │
│  ✅ Node.js + Fastify                        │
│  ✅ API endpoints                            │
│  ✅ $5/месяц кредитов                        │
└─────────────────────────────────────────────┘
                    │
                    │ SQL запросы
                    ▼
┌─────────────────────────────────────────────┐
│      Database (Supabase)                     │
│      https://wbfhvcmvkyjsjvqkbxpz...        │
│                                              │
│  ✅ PostgreSQL                               │
│  ✅ 500MB бесплатно                          │
│  ✅ Автоматические бэкапы                    │
└─────────────────────────────────────────────┘
```

---

## 💰 Итоговая стоимость

| Сервис | План | Стоимость |
|--------|------|-----------|
| **Vercel** (Frontend) | Free Forever | **0₽** |
| **Railway** (Backend) | $5 credits/month | **~0₽** (для малого трафика) |
| **Supabase** (Database) | Free 500MB | **0₽** |
| **ИТОГО** | | **0₽ - 5$/месяц** |

---

## 📊 Мониторинг

### Railway:
- Dashboard: https://railway.app/dashboard
- Логи в реальном времени
- Метрики CPU/RAM/Network

### Vercel:
- Dashboard: https://vercel.com/dashboard
- Аналитика посещений
- Логи деплоев

### Supabase:
- Dashboard: https://app.supabase.com
- SQL Editor
- Table Editor
- Database monitoring

---

## 🐛 Решение проблем

### Проблема: CORS ошибки

**Решение:**
1. Проверьте `FRONTEND_URL` в Railway Variables
2. Убедитесь, что URL указан без trailing slash
3. Перезапустите Railway service

### Проблема: Frontend не может подключиться к API

**Решение:**
1. Проверьте `frontend/js/config.js` - правильный ли Railway URL
2. Откройте консоль браузера (F12) → Network
3. Проверьте, что запросы идут на Railway, а не localhost

### Проблема: Railway build failed

**Решение:**
1. Проверьте логи в Railway Dashboard
2. Убедитесь, что `package.json` содержит все зависимости
3. Проверьте, что `nixpacks.toml` правильный

---

## ✅ Чеклист успешного деплоя

- [ ] Backend на Railway развернут
- [ ] Railway публичный домен получен
- [ ] Supabase переменные добавлены в Railway
- [ ] Backend API тестирован и работает
- [ ] `frontend/js/config.js` обновлен с Railway URL
- [ ] Frontend на Vercel развернут
- [ ] Vercel URL получен
- [ ] `FRONTEND_URL` добавлен в Railway Variables
- [ ] CORS настроен и работает
- [ ] Каталог товаров загружается с Supabase
- [ ] Все формы работают
- [ ] Автодеплой настроен для обеих платформ

---

## 🎉 Готово!

После выполнения всех шагов у вас будет:

✅ **Production-ready приложение**
✅ **Разделенная архитектура** (frontend/backend)
✅ **Автоматический деплой** из GitHub
✅ **Минимальная стоимость** (практически бесплатно)
✅ **Высокая производительность** (CDN + Edge)
✅ **Легкое масштабирование**

---

**Следующий шаг:** Начните с Railway (Backend), затем Vercel (Frontend)!
