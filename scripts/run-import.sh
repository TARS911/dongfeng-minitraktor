#!/bin/bash
# Wrapper script для запуска импорта тракторов в Supabase

cd "$(dirname "$0")/.."

# Загружаем переменные окружения из .env.local
if [ -f "frontend/.env.local" ]; then
    export $(cat frontend/.env.local | grep -v '^#' | xargs)
else
    echo "❌ Файл frontend/.env.local не найден!"
    exit 1
fi

# Запускаем скрипт импорта
echo "🚜 Запуск импорта мини-тракторов..."
python3 scripts/import-tractors.py

echo ""
echo "✅ Готово!"
