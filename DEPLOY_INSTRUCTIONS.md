# 🚀 Инструкция по деплою на Netlify

## ✅ Что уже сделано:

1. ✅ Код запушен на GitHub
2. ✅ GitHub Actions настроен
3. ✅ Next.js проект готов к деплою

## 📋 Что нужно сделать:

### 1. Получить Netlify токены

Перейдите на https://app.netlify.com и:

1. **Создайте новый сайт** (или используйте существующий)
   - Sites → Add new site → Import an existing project
   - Выберите GitHub → dongfeng-minitraktor

2. **Получите NETLIFY_AUTH_TOKEN:**
   - User Settings → Applications → Personal access tokens
   - New access token → Скопируйте токен

3. **Получите NETLIFY_SITE_ID:**
   - Ваш сайт → Site settings → General → Site details
   - API ID - это ваш SITE_ID

### 2. Добавить Secrets в GitHub

Перейдите на https://github.com/TARS911/dongfeng-minitraktor/settings/secrets/actions

Добавьте следующие secrets:

```
NETLIFY_AUTH_TOKEN = <ваш токен из шага 1.2>
NETLIFY_SITE_ID = <ваш site id из шага 1.3>

NEXT_PUBLIC_SUPABASE_URL = https://wbfhvcmvkyjsjvqkbxpz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZmh2Y212a3lqc2p2cWtieHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4NDI1MTksImV4cCI6MjA0NjQxODUxOX0.uKlzP7lzRr-mHCqQHlw99M3TQRP8jpPuS8MeWGTfWcE
SUPABASE_SERVICE_ROLE_KEY = <ваш service role key>
```

### 3. Настроить Netlify сайт

В настройках Netlify сайта:

**Build settings:**
- Build command: `cd frontend && npm install && npm run build`
- Publish directory: `frontend/.next`
- Node version: `20`

**Environment variables** (добавьте те же, что в GitHub):
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

### 4. Установить Netlify Plugin для Next.js

В файле `netlify.toml` уже настроено, но проверьте что в Netlify Dashboard установлен:
- @netlify/plugin-nextjs

### 5. Запустить деплой

После настройки secrets в GitHub:

1. Перейдите на https://github.com/TARS911/dongfeng-minitraktor/actions
2. Найдите workflow "Deploy to Netlify"
3. Нажмите "Run workflow" → "Run workflow"

Или просто сделайте новый коммит:
```bash
git commit --allow-empty -m "🚀 Trigger deploy"
git push
```

## 🎯 Результат:

После успешного деплоя ваш сайт будет доступен по адресу:
- `https://ваш-сайт.netlify.app`

Можно также подключить свой домен в Netlify → Domain settings.

## ⚡ Автоматический деплой:

Теперь при каждом `git push` в ветку `main`:
1. GitHub Actions автоматически запустится
2. Соберет Next.js проект
3. Задеплоит на Netlify
4. Сайт обновится автоматически

## 🐛 Если что-то пошло не так:

1. Проверьте логи в GitHub Actions
2. Проверьте логи в Netlify Deploy logs
3. Убедитесь что все secrets добавлены правильно
4. Проверьте что Node version = 20

## 📞 Контакты Netlify:

- Dashboard: https://app.netlify.com
- Docs: https://docs.netlify.com
- Support: https://www.netlify.com/support/
