#!/bin/bash
# Скрипт для деплоя на Coolify через API

COOLIFY_URL="http://localhost:8000"
PROJECT_NAME="dongfeng-minitraktor"
GIT_REPO="https://github.com/TARS911/dongfeng-minitraktor"
GIT_BRANCH="main"

echo "🚀 Деплой проекта DongFeng на Coolify..."
echo "Repository: $GIT_REPO"
echo "Branch: $GIT_BRANCH"
echo ""

# Проверка что Coolify запущен
if ! curl -f -s "$COOLIFY_URL" > /dev/null; then
    echo "❌ Coolify не доступен на $COOLIFY_URL"
    echo "Проверьте что Coolify запущен: docker ps | grep coolify"
    exit 1
fi

echo "✅ Coolify доступен"
echo ""
echo "📝 Следующие шаги:"
echo "1. Откройте в браузере: $COOLIFY_URL"
echo "2. Создайте новый проект через UI"
echo "3. Выберите 'Public Repository'"
echo "4. Укажите:"
echo "   - Repository: $GIT_REPO"
echo "   - Branch: $GIT_BRANCH"
echo "   - Dockerfile: frontend/Dockerfile"
echo "   - Context: frontend/"
echo "5. Добавьте environment variables из .env.example"
echo "6. Нажмите Deploy!"
echo ""
echo "🔗 Откройте Coolify UI сейчас? [y/n]"
