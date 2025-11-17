#!/bin/bash
# Парсинг подкатегорий через curl и grep

URL="https://xn----7sbabpgpk4bsbesjp1f.xn--p1ai/product-category/%D0%B7%D0%B0%D0%BF%D1%87%D0%B0%D1%81%D1%82%D0%B8-%D0%B4%D0%BB%D1%8F-%D1%82%D1%80%D0%B0%D0%BA%D1%82%D0%BE%D1%80%D0%BE%D0%B2/"

echo "========================================="
echo "  ПАРСИНГ ПОДКАТЕГОРИЙ"
echo "  Запчасти для тракторов"
echo "========================================="
echo ""
echo "📍 URL: $URL"
echo ""

# Получаем HTML страницы
echo "🔍 Загрузка страницы..."
HTML=$(curl -s -L "$URL" -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")

if [ -z "$HTML" ]; then
    echo "❌ Ошибка: не удалось загрузить страницу"
    exit 1
fi

echo "✅ Страница загружена ($(echo "$HTML" | wc -c) байт)"
echo ""

# Ищем ссылки на подкатегории
echo "🔍 Поиск подкатегорий..."
echo ""

# Сохраняем HTML во временный файл
TEMP_FILE="/tmp/agrodom_page.html"
echo "$HTML" > "$TEMP_FILE"

# Ищем все ссылки на product-category
echo "📋 НАЙДЕННЫЕ ПОДКАТЕГОРИИ:"
echo "========================================="

grep -o 'href="[^"]*product-category/[^"]*"' "$TEMP_FILE" | \
    sed 's/href="//g' | sed 's/"//g' | \
    grep "запчасти-для-тракторов" | \
    sort -u | \
    nl -w2 -s'. '

echo ""
echo "========================================="

# Подсчет
COUNT=$(grep -o 'href="[^"]*product-category/[^"]*"' "$TEMP_FILE" | \
    sed 's/href="//g' | sed 's/"//g' | \
    grep "запчасти-для-тракторов" | \
    sort -u | wc -l)

echo "✅ Найдено подкатегорий: $COUNT"

# Сохраняем в файл
OUTPUT_FILE="parsed_data/agrodom/tractor-parts-subcategories.txt"
mkdir -p parsed_data/agrodom

grep -o 'href="[^"]*product-category/[^"]*"' "$TEMP_FILE" | \
    sed 's/href="//g' | sed 's/"//g' | \
    grep "запчасти-для-тракторов" | \
    sort -u > "$OUTPUT_FILE"

echo "💾 Сохранено в: $OUTPUT_FILE"

# Очистка
rm "$TEMP_FILE"
