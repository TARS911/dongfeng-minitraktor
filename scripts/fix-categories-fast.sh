#!/bin/bash
#
# БЫСТРОЕ ИСПРАВЛЕНИЕ КАТЕГОРИЙ В SUPABASE
# Переносит ДВС из "Запчасти на ДВС" в "ДВС в сборе"
#

SUPABASE_URL="https://dpsykseeqloturowdyzf.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwc3lrc2VlcWxvdHVyb3dkeXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUwMjg1MywiZXhwIjoyMDc4MDc4ODUzfQ.wY2VoghxdIhgwEws_kUIUgZX1P3TTw-1PXh84GVbdJ4"

echo "================================================================================"
echo "🚀 БЫСТРОЕ ИСПРАВЛЕНИЕ КАТЕГОРИЙ БД"
echo "================================================================================"
echo ""

# 1. Найти все товары с категорией "Запчасти на ДВС" и словом "Двигатель" в названии
echo "🔍 ШАГ 1: Ищу неправильно категоризированные ДВС..."

# Список ID товаров для исправления (из вашего файла universal-products-categorized.csv)
# ID двигателей, которые в категории "Запчасти на ДВС", а должны быть в "ДВС в сборе"
ENGINES_TO_FIX=(
    12047  # Двигатель дизельный S1100 М (15 л.с)
    12048  # Двигатель дизельный SF 138-2 (24 л.с)
    12050  # Двигатель дизельный YD385T
    12051  # Двигатель дизельный ZS1100 М (15 л.с)
    12058  # Дизельный двигатель SF1115-T
    12060  # Дизельный двигатель TY2100
    12062  # Дизельный двигатель XT-15
)

echo "   Найдено товаров для исправления: ${#ENGINES_TO_FIX[@]}"
echo ""

# 2. Показать что будет исправлено
echo "📋 СПИСОК ТОВАРОВ ДЛЯ ИСПРАВЛЕНИЯ:"
for id in "${ENGINES_TO_FIX[@]}"; do
    # Получаем информацию о товаре
    product=$(curl -s "${SUPABASE_URL}/rest/v1/products?select=id,title,category&id=eq.${id}" \
        -H "apikey: ${SUPABASE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_KEY}")

    if [ -n "$product" ] && [ "$product" != "[]" ]; then
        echo "$product" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data and len(data) > 0:
        p = data[0]
        print(f'   ✓ ID {p[\"id\"]}: {p.get(\"title\", \"N/A\")[:60]}')
        print(f'     Категория: {p.get(\"category\", \"NULL\")} → ДВС в сборе')
except:
    pass
"
    fi
done

echo ""
echo "❓ Исправить эти категории? (yes/no)"
read -r answer

if [[ "$answer" == "yes" ]] || [[ "$answer" == "y" ]]; then
    echo ""
    echo "🔧 ИСПРАВЛЯЮ КАТЕГОРИИ..."
    echo ""

    fixed=0
    failed=0

    for id in "${ENGINES_TO_FIX[@]}"; do
        # Обновляем категорию
        response=$(curl -s -w "%{http_code}" -o /tmp/response.txt \
            -X PATCH "${SUPABASE_URL}/rest/v1/products?id=eq.${id}" \
            -H "apikey: ${SUPABASE_KEY}" \
            -H "Authorization: Bearer ${SUPABASE_KEY}" \
            -H "Content-Type: application/json" \
            -H "Prefer: return=minimal" \
            -d '{"category":"ДВС в сборе"}')

        if [[ "$response" == "200" ]] || [[ "$response" == "204" ]]; then
            echo "   ✅ ID $id → категория обновлена"
            ((fixed++))
        else
            echo "   ❌ ID $id → ошибка (HTTP $response)"
            ((failed++))
        fi
    done

    echo ""
    echo "================================================================================"
    echo "✅ РЕЗУЛЬТАТЫ:"
    echo "   Исправлено: $fixed"
    [ $failed -gt 0 ] && echo "   Ошибок: $failed"
    echo "================================================================================"
else
    echo ""
    echo "⏭️  Пропускаю исправление"
fi

echo ""
echo "✅ ГОТОВО!"
