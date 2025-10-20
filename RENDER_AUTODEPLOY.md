# Настройка автодеплоя на Render

## Способ 1: Включить Auto-Deploy в Render Dashboard (РЕКОМЕНДУЕТСЯ)

Это самый простой способ - занимает 1 минуту:

### Шаги:
1. Откройте https://dashboard.render.com
2. Войдите в свой аккаунт
3. Найдите сервис **dongfeng-minitraktor** в списке
4. Откройте настройки сервиса (кнопка "Settings" слева)
5. Найдите секцию **"Build & Deploy"** или **"Auto-Deploy"**
6. Переключите **"Auto-Deploy"** на **"Yes"**
7. Убедитесь что выбрана ветка **"main"**
8. Нажмите **"Save Changes"**

✅ **Готово!** Теперь при каждом `git push` на GitHub Render будет автоматически деплоить изменения.

---

## Способ 2: Через GitHub Actions + Deploy Hook

Если хотите больше контроля (например, запускать тесты перед деплоем):

### Шаг 1: Получить Deploy Hook URL от Render

1. Откройте https://dashboard.render.com
2. Выберите сервис **dongfeng-minitraktor**
3. Перейдите в **Settings**
4. Найдите секцию **"Deploy Hook"**
5. Нажмите **"Create Deploy Hook"**
6. Скопируйте URL (выглядит как `https://api.render.com/deploy/srv-xxxxx?key=yyyyy`)

### Шаг 2: Добавить Deploy Hook в GitHub Secrets

1. Откройте https://github.com/TARS911/dongfeng-minitraktor/settings/secrets/actions
2. Нажмите **"New repository secret"**
3. Name: `RENDER_DEPLOY_HOOK`
4. Value: вставьте скопированный URL от Render
5. Нажмите **"Add secret"**

### Шаг 3: Проверить GitHub Actions

В вашем проекте уже есть файл `.github/workflows/deploy.yml` который автоматически задеплоит при push:

```yaml
name: Deploy to Render

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Trigger Render Deploy
      run: |
        if [ -n "${{ secrets.RENDER_DEPLOY_HOOK }}" ]; then
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
          echo "✅ Deploy triggered successfully!"
        else
          echo "⚠️ RENDER_DEPLOY_HOOK secret not configured"
        fi
```

✅ **Готово!** Теперь при push в main GitHub Actions задеплоит на Render через webhook.

---

## Способ 3: Ручной деплой (когда нужен контроль)

Если нужно задеплоить прямо сейчас:

1. Откройте https://dashboard.render.com
2. Выберите сервис **dongfeng-minitraktor**
3. Нажмите большую синюю кнопку **"Manual Deploy"** вверху справа
4. Выберите **"Deploy latest commit"** или **"Clear build cache & deploy"**
5. Подождите 2-3 минуты

Деплой запустится немедленно.

---

## Проверка статуса деплоя

### В Render Dashboard:
- Зеленый индикатор: ✅ Deploy успешен
- Желтый: ⏳ Деплой идет
- Красный: ❌ Ошибка

### В терминале:
```bash
# Проверить что сайт отвечает
curl -I https://dongfeng-minitraktor.onrender.com/

# Проверить последний коммит на GitHub
git log -1 --oneline

# Запустить деплой вручную через API (если настроен webhook)
curl -X POST https://api.render.com/deploy/srv-xxxxx?key=yyyyy
```

---

## Troubleshooting

### Проблема: Деплой не запускается автоматически
**Решение:**
1. Проверьте что Auto-Deploy включен в Render Dashboard → Settings
2. Убедитесь что GitHub репозиторий подключен к Render
3. Проверьте что изменения запушены: `git push origin main`

### Проблема: Деплой падает с ошибкой
**Решение:**
1. Откройте Render Dashboard → Logs
2. Посмотрите ошибки в Build Logs и Deploy Logs
3. Частые причины:
   - Отсутствуют зависимости в package.json
   - Ошибка в render.yaml
   - Проблемы с базой данных

### Проблема: Сайт показывает старую версию
**Решение:**
1. Очистите кэш браузера: `Ctrl + Shift + R`
2. Откройте в приватном режиме: `Ctrl + Shift + N`
3. Проверьте что деплой завершился в Render Dashboard
4. Попробуйте "Clear build cache & deploy" в Render

---

## Что происходит при деплое?

1. **GitHub** получает push → отправляет webhook на Render (или GitHub Actions)
2. **Render** получает сигнал → клонирует последний коммит
3. **Build** запускает команду из render.yaml: `cd backend && npm ci --omit=dev`
4. **Deploy** запускает сервер: `cd backend && npm start`
5. **Health check** проверяет что сервер отвечает на порту 10000
6. **Live** новая версия становится доступна на dongfeng-minitraktor.onrender.com

Весь процесс занимает **2-3 минуты** на Render Free tier.

---

## Рекомендации

✅ **Лучшие практики:**
- Включите Auto-Deploy для автоматизации
- Тестируйте локально перед push
- Проверяйте логи в Render Dashboard после деплоя
- Держите render.yaml актуальным

⚠️ **Избегайте:**
- Частых force push (может сломать синхронизацию)
- Запуска `init-db` при каждом деплое (удалит данные)
- Изменения прямо на Render (перезапишется при деплое)

---

## Текущий статус проекта

- **Репозиторий:** https://github.com/TARS911/dongfeng-minitraktor
- **Live site:** https://dongfeng-minitraktor.onrender.com
- **Последний коммит:** `ae98862` - Создан многостраничный сайт
- **Ветка:** main
- **Auto-Deploy:** ❓ (нужно проверить в Render Dashboard)
