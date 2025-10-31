#!/bin/bash

# FTP Deploy Script для Qwins Hosting
# Использует lftp для загрузки файлов на хостинг

FTP_HOST="94.181.229.248"
FTP_USER="user80563"
FTP_PASS="CnHmHMYf8BUc"
REMOTE_DIR="/www"

echo "🚀 Начинаем деплой на qwins.co..."

# Проверяем наличие lftp
if ! command -v lftp &> /dev/null; then
    echo "❌ lftp не установлен. Установите его:"
    echo "   Ubuntu/Debian: sudo apt-get install lftp"
    echo "   macOS: brew install lftp"
    exit 1
fi

# Загружаем frontend файлы
echo "📤 Загружаем frontend файлы..."

lftp -u "$FTP_USER","$FTP_PASS" "$FTP_HOST" <<EOF
set ssl:verify-certificate no
set ftp:ssl-allow no

# Создаем директории если их нет
mkdir -p $REMOTE_DIR/css
mkdir -p $REMOTE_DIR/js
mkdir -p $REMOTE_DIR/images

# Загружаем HTML файлы
cd $REMOTE_DIR
lcd frontend
put index.html
put catalog.html
put cart.html
put compare.html
put favorites.html
put privacy.html
put terms.html

# Загружаем CSS
cd css
lcd css
mput *.css

# Загружаем JS
cd ../js
lcd ../js
mput *.js

# Загружаем изображения
cd ../images
lcd ../images
mput *

bye
EOF

if [ $? -eq 0 ]; then
    echo "✅ Деплой успешно завершен!"
    echo "🌐 Сайт доступен по адресу: http://web80563.hosted-by.qwins.co"
else
    echo "❌ Ошибка при деплое"
    exit 1
fi
