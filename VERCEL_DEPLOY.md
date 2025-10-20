# Деплой фронтенда на Vercel

Этот проект разделен на две части:
- **Frontend** на Vercel (быстрый CDN)
- **Backend** на Render (с SQLite базой данных)

## Быстрый старт

### 1. Установка Vercel CLI (опционально)

```bash
npm install -g vercel
```

### 2. Деплой через веб-интерфейс Vercel

1. Зайдите на https://vercel.com
2. Войдите через GitHub
3. Нажмите "Add New Project"
4. Выберите репозиторий `dongfeng-minitraktor`
5. **Важные настройки:**
   - Root Directory: `./` (оставьте как есть)
   - Framework Preset: Other
   - Build Command: `echo "Static site"`
   - Output Directory: `frontend`
   - Install Command: `echo "No install needed"`

6. Нажмите "Deploy"

### 3. Деплой через CLI

```bash
# В корне проекта
vercel

# Следуйте инструкциям:
# - Set up and deploy? Yes
# - Which scope? Ваш аккаунт
# - Link to existing project? No
# - Project name: dongfeng-minitraktor
# - Directory: ./
# - Auto-detected: no
# - Build command: echo "Static site"
# - Output directory: frontend
# - Want to override? No

# Для production деплоя:
vercel --prod
```

## Как это работает

### Frontend (Vercel)
- Vercel раздает статические файлы из `/frontend`
- JavaScript автоматически определяет окружение:
  - Локально: `http://localhost:3000` (для разработки)
  - На Vercel: `https://dongfeng-minitraktor.onrender.com` (Render API)

### Backend (Render)
- Backend остается на Render: https://dongfeng-minitraktor.onrender.com
- CORS настроен для приема запросов с Vercel (*.vercel.app)
- SQLite база данных с persistent disk

## Проверка после деплоя

1. Откройте ваш Vercel URL (например, `dongfeng-minitraktor.vercel.app`)
2. Откройте DevTools (F12) → Network
3. Проверьте что API запросы идут на `dongfeng-minitraktor.onrender.com`
4. Проверьте что нет CORS ошибок

## Локальная разработка

Frontend автоматически переключается на localhost API:

```bash
# Терминал 1: Запуск backend
cd backend
npm start

# Терминал 2: Откройте frontend
# Просто откройте frontend/index.html в браузере
# Или используйте Live Server в VS Code
```

## Обновление

При push в GitHub:
- **Vercel** автоматически деплоит frontend
- **Render** автоматически деплоит backend (через GitHub Actions)

## Настройка кастомного домена (опционально)

1. В Vercel Dashboard → Settings → Domains
2. Добавьте ваш домен (например, `dongfeng-tractors.ru`)
3. Настройте DNS согласно инструкциям Vercel
4. Добавьте домен в `backend/server.js` в allowedOrigins

## Переменные окружения (если нужны)

В Vercel Dashboard → Settings → Environment Variables

Добавьте:
```
API_URL=https://dongfeng-minitraktor.onrender.com
```

Затем обновите `frontend/js/config.js` чтобы использовать эту переменную.

## Производительность

### Vercel (Frontend)
- ✅ Глобальный CDN
- ✅ Мгновенная загрузка
- ✅ HTTPS из коробки
- ✅ Автоматическая оптимизация

### Render (Backend)
- ✅ Persistent SQLite database
- ⚠️ Free tier засыпает после 15 минут (холодный старт ~30 сек)
- 💡 Для production рекомендуется платный план ($7/месяц)

## Troubleshooting

### CORS ошибки
Проверьте что ваш Vercel домен добавлен в `backend/server.js`:
```javascript
const allowedOrigins = [
  'https://your-project.vercel.app',  // Добавьте ваш домен
  /\.vercel\.app$/
];
```

### Backend не отвечает
Render free tier засыпает. Первый запрос может занять 30-60 секунд.

### Старая версия сайта
Очистите кеш браузера (Ctrl+Shift+Delete) или откройте в приватном режиме.
