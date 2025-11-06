# 🔐 GitHub Secrets для деплоя

## Перейдите на:
https://github.com/TARS911/dongfeng-minitraktor/settings/secrets/actions

## Добавьте следующие secrets:

### 1. NETLIFY_SITE_ID
```
c4d60067-5286-434d-af09-9f6306468925
```

### 2. NETLIFY_AUTH_TOKEN
```
<Получите на https://app.netlify.com/user/applications#personal-access-tokens>
User Settings → Applications → Personal access tokens → New access token
```

### 3. NEXT_PUBLIC_SUPABASE_URL
```
https://wbfhvcmvkyjsjvqkbxpz.supabase.co
```

### 4. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZmh2Y212a3lqc2p2cWtieHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4NDI1MTksImV4cCI6MjA0NjQxODUxOX0.uKlzP7lzRr-mHCqQHlw99M3TQRP8jpPuS8MeWGTfWcE
```

### 5. SUPABASE_SERVICE_ROLE_KEY
```
<Ваш service role key из Supabase>
Получите на: https://supabase.com/dashboard/project/wbfhvcmvkyjsjvqkbxpz/settings/api
```

## Как добавить:

1. Откройте https://github.com/TARS911/dongfeng-minitraktor/settings/secrets/actions
2. Нажмите "New repository secret"
3. Name: введите имя секрета (например: NETLIFY_SITE_ID)
4. Secret: вставьте значение
5. Нажмите "Add secret"
6. Повторите для всех 5 секретов

## После добавления всех секретов:

Запустите деплой:
```bash
cd /home/ibm/dongfeng-minitraktor
git commit --allow-empty -m "🚀 Trigger Netlify deploy"
git push
```

Или перейдите на:
https://github.com/TARS911/dongfeng-minitraktor/actions
И нажмите "Run workflow"

## Проверка деплоя:

После запуска workflow проверьте:
1. GitHub Actions: https://github.com/TARS911/dongfeng-minitraktor/actions
2. Netlify Dashboard: https://app.netlify.com/sites/c4d60067-5286-434d-af09-9f6306468925

Сайт будет доступен по адресу который покажет Netlify (например: https://ваш-сайт.netlify.app)
