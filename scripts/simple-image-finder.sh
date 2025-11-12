#!/bin/bash
# Простой скрипт для поиска изображений на сайте

echo "=================================="
echo "ПОИСК ИЗОБРАЖЕНИЙ DONGFENG"
echo "=================================="
echo ""
echo "Запрос страницы..."

curl -s "https://dongfeng-traktor.com/" | \
grep -oE '<img[^>]+src="[^"]+"[^>]*>' | \
grep -oE 'src="[^"]+"' | \
sed 's/src="//g' | \
sed 's/"//g' | \
grep -v 'data:image' | \
grep -v 'logo' | \
grep -v 'icon' | \
head -30 | \
nl

echo ""
echo "=================================="
echo "✅ Изображения найдены выше"
echo "=================================="
