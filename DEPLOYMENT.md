# 🚀 DEPLOYMENT GUIDE

Руководство по деплою проекта DongFeng Minitraktor на различные платформы.

---

## 📋 Содержание

1. [Netlify (текущий)](#netlify)
2. [Coolify (Docker)](#coolify)
3. [Vercel](#vercel)
4. [Ручной деплой через Docker](#docker)

---

## 🌐 Netlify

**Статус:** ✅ Активно используется

### Автоматический деплой

Netlify автоматически деплоит при push в `main` ветку.

### Настройка переменных окружения

В Netlify Dashboard → Site settings → Environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Build команды

```bash
# Build command
npm run build

# Publish directory
.next

# Node version
20.x
```

---

## 🐳 Coolify

**Статус:** 🆕 Рекомендуется для production

### Что такое Coolify?

Coolify - это self-hosted альтернатива Vercel/Netlify с поддержкой Docker.

**Преимущества:**
- ✅ Полный контроль над сервером
- ✅ Нет vendor lock-in
- ✅ Автоматические SSL сертификаты
- ✅ Встроенный мониторинг
- ✅ GitHub/GitLab интеграция
- ✅ Бесплатно (только плата за VPS)

### Установка Coolify на сервер

#### 1. Требования

- Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- Минимум 2 CPU, 2GB RAM
- Docker 20.10+
- Открытые порты: 80, 443, 8000

#### 2. Установка

```bash
# SSH на сервер
ssh root@your-server.com

# Установка Coolify
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# Coolify будет доступен на http://your-server.com:8000
```

#### 3. Первичная настройка

1. Откройте `http://your-server.com:8000`
2. Создайте admin аккаунт
3. Добавьте Git репозиторий:
   - Type: GitHub
   - Repository: `your-username/dongfeng-minitraktor`
   - Branch: `main`

#### 4. Настройка проекта в Coolify

##### Шаг 1: Создать новый проект

- **Name:** DongFeng Minitraktor
- **Type:** Docker Compose
- **Repository:** `https://github.com/your-username/dongfeng-minitraktor`
- **Branch:** `main`

##### Шаг 2: Настроить Build

- **Build Pack:** Dockerfile
- **Dockerfile Path:** `frontend/Dockerfile`
- **Context:** `frontend/`

##### Шаг 3: Переменные окружения

В Coolify UI → Environment Variables:

```bash
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

##### Шаг 4: Настроить домен

- **Domain:** `yourdomain.com`
- **SSL:** Включить (автоматически через Let's Encrypt)
- **Force HTTPS:** Да

##### Шаг 5: Деплой

```bash
# В Coolify UI нажмите "Deploy"
# Coolify автоматически:
# 1. Склонирует репозиторий
# 2. Соберет Docker образ
# 3. Запустит контейнер
# 4. Настроит SSL
# 5. Настроит health checks
```

### Автоматический деплой из GitHub

В Coolify можно настроить webhook для автоматического деплоя:

1. Coolify → Settings → Webhooks
2. Копируйте webhook URL
3. GitHub → Settings → Webhooks → Add webhook
4. Paste URL, выберите события: `push`, `pull_request`

Теперь при каждом push в `main` Coolify автоматически запустит деплой!

### Мониторинг

Coolify предоставляет:
- Логи в реальном времени
- CPU/Memory usage
- Request metrics
- Health check статус

Доступ: Coolify UI → Your Project → Monitoring

---

## ▲ Vercel

**Статус:** ⚠️ Не протестировано (были проблемы с Vercel CLI)

### Установка Vercel CLI

```bash
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod
```

### Настройка переменных окружения

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

---

## 🐋 Docker (ручной деплой)

### Локальный запуск через Docker

```bash
# 1. Создайте .env файл
cd frontend
cp .env.example .env
# Отредактируйте .env с вашими значениями

# 2. Соберите образ
docker build -t beltehferm-frontend \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=your-url \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  .

# 3. Запустите контейнер
docker run -d \
  -p 3000:3000 \
  --name beltehferm \
  --env-file .env \
  beltehferm-frontend

# Приложение доступно на http://localhost:3000
```

### Docker Compose

```bash
# В корне проекта
docker-compose up -d

# Остановить
docker-compose down

# Перезапустить
docker-compose restart

# Логи
docker-compose logs -f frontend
```

### Деплой на VPS через Docker

```bash
# 1. SSH на сервер
ssh root@your-server.com

# 2. Установите Docker
curl -fsSL https://get.docker.com | bash

# 3. Клонируйте репозиторий
git clone https://github.com/your-username/dongfeng-minitraktor.git
cd dongfeng-minitraktor

# 4. Создайте .env
nano .env
# Добавьте переменные окружения

# 5. Запустите через Docker Compose
docker-compose up -d

# 6. Настройте Nginx как reverse proxy
sudo apt install nginx

# Создайте конфиг
sudo nano /etc/nginx/sites-available/beltehferm

# Добавьте:
# server {
#     listen 80;
#     server_name yourdomain.com;
#     location / {
#         proxy_pass http://localhost:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_cache_bypass $http_upgrade;
#     }
# }

# Активируйте конфиг
sudo ln -s /etc/nginx/sites-available/beltehferm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 7. Настройте SSL (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 🔧 Сравнение платформ

| Платформа | Стоимость | Простота | Контроль | Масштабируемость | SSL | CDN |
|-----------|-----------|----------|----------|------------------|-----|-----|
| **Netlify** | Бесплатно (лимиты) | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ✅ | ✅ |
| **Coolify** | VPS ($5-20/мес) | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ | ❌ |
| **Vercel** | Бесплатно (лимиты) | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | ✅ |
| **Docker VPS** | VPS ($5-20/мес) | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⚙️ | ❌ |

### Рекомендации

- **Для быстрого прототипа:** Netlify / Vercel
- **Для production с контролем:** Coolify
- **Для enterprise:** Docker на Kubernetes

---

## 🧪 CI/CD

### GitHub Actions

Проект использует GitHub Actions для автоматического тестирования:

- **Unit тесты (Jest):** Запускаются при каждом push
- **E2E тесты (Playwright):** Запускаются при pull request
- **Lint & Type check:** Проверка кода

Конфигурация: `.github/workflows/test.yml`

### Автоматический деплой

1. **Netlify:** автоматически при push в `main`
2. **Coolify:** через GitHub webhook
3. **Vercel:** через GitHub интеграцию

---

## 📊 Мониторинг и логи

### Netlify

- Logs: Netlify Dashboard → Deploys → Deploy log
- Analytics: Netlify Dashboard → Analytics

### Coolify

- Logs: Coolify UI → Your Project → Logs
- Metrics: Coolify UI → Monitoring

### Docker

```bash
# Логи контейнера
docker logs -f beltehferm

# Stats
docker stats beltehferm

# Inspect
docker inspect beltehferm
```

---

## 🆘 Troubleshooting

### Проблема: Build failed

**Решение:**
1. Проверьте переменные окружения
2. Проверьте логи сборки
3. Локально запустите `npm run build`

### Проблема: 500 Internal Server Error

**Решение:**
1. Проверьте логи приложения
2. Убедитесь что Supabase URL и ключи корректны
3. Проверьте RLS политики в Supabase

### Проблема: Медленная загрузка

**Решение:**
1. Включите CDN (Netlify/Vercel)
2. Оптимизируйте изображения
3. Включите Next.js Image Optimization

---

## 📚 Полезные ссылки

- [Coolify Documentation](https://coolify.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Supabase Self-Hosting](https://supabase.com/docs/guides/self-hosting)

---

**Готово! Проект успешно задеплоен.** 🎉
