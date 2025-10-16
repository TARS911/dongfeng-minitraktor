#!/bin/bash
# Скрипт для пуша на GitHub

cd /home/ibm/dongfeng-minitraktor

echo "🚀 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Успешно залито на GitHub!"
    echo "📦 Репозиторий: https://github.com/TARS911/dongfeng-minitraktor"
    echo ""
else
    echo ""
    echo "❌ Ошибка при пуше"
    echo "Убедитесь, что репозиторий создан на GitHub:"
    echo "https://github.com/new"
    echo ""
fi
