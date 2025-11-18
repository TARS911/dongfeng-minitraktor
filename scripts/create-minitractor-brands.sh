#!/bin/bash
#
# Создание подкатегорий брендов для "Запчасти на Минитракторы"
#

SUPABASE_URL="https://dpsykseeqloturowdyzf.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwc3lrc2VlcWxvdHVyb3dkeXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUwMjg1MywiZXhwIjoyMDc4MDc4ODUzfQ.wY2VoghxdIhgwEws_kUIUgZX1P3TTw-1PXh84GVbdJ4"

echo ""
echo "🚀 СОЗДАНИЕ ПОДКАТЕГОРИЙ БРЕНДОВ ДЛЯ МИНИТРАКТОРОВ"
echo "======================================================================"

# Сначала получаем ID категории "Запчасти на Минитракторы"
parent_category=$(curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/categories?slug=eq.parts-minitractors&select=id,name" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}")

parent_id=$(echo "$parent_category" | jq -r '.[0].id // empty')
parent_name=$(echo "$parent_category" | jq -r '.[0].name // empty')

if [ -z "$parent_id" ]; then
  echo "❌ Ошибка: Категория 'parts-minitractors' не найдена!"
  exit 1
fi

echo "✅ Родительская категория: $parent_name (ID: $parent_id)"
echo ""

# Массив брендов для минитракторов
brands=(
  '{"name":"МиниТрактора Dongfeng","slug":"parts-minitractors-dongfeng","description":"Запчасти для минитракторов DongFeng всех моделей"}'
  '{"name":"МиниТрактора Foton/Lovol","slug":"parts-minitractors-foton","description":"Запчасти для минитракторов Foton и Lovol"}'
  '{"name":"МиниТрактора Jinma","slug":"parts-minitractors-jinma","description":"Запчасти для минитракторов Jinma всех моделей"}'
  '{"name":"МиниТрактора Xingtai/Уралец","slug":"parts-minitractors-xingtai","description":"Запчасти для минитракторов Xingtai и Уралец"}'
  '{"name":"Shifeng","slug":"parts-minitractors-shifeng","description":"Запчасти для минитракторов Shifeng"}'
)

echo "📝 Создание подкатегорий брендов..."
echo ""

created_count=0
exists_count=0

for brand_data in "${brands[@]}"; do
  brand_name=$(echo "$brand_data" | jq -r '.name')

  response=$(curl -s -X POST \
    "${SUPABASE_URL}/rest/v1/categories" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d "$brand_data")

  # Проверяем результат
  if echo "$response" | jq -e '.[0].id' > /dev/null 2>&1; then
    brand_id=$(echo "$response" | jq -r '.[0].id')
    echo "   ✅ $brand_name (ID: $brand_id)"
    ((created_count++))
  else
    error=$(echo "$response" | jq -r '.message // .error // "Unknown error"')
    if [[ "$error" == *"duplicate"* ]] || [[ "$error" == *"already exists"* ]]; then
      echo "   ⚠️  $brand_name (уже существует)"
      ((exists_count++))
    else
      echo "   ❌ $brand_name - Ошибка: $error"
    fi
  fi
done

echo ""
echo "======================================================================"
echo "📊 Результат:"
echo "   ✅ Создано: $created_count категорий"
echo "   ⚠️  Уже существовало: $exists_count категорий"
echo ""

# Проверяем все созданные категории
echo "📋 Все подкатегории брендов минитракторов:"
echo ""

result=$(curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/categories?slug=like.parts-minitractors-%&order=name.asc&select=id,name,slug" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}")

echo "$result" | jq -r '.[] | "   • \(.name)\n      Slug: \(.slug) | ID: \(.id)\n"'

echo "Готово!"
echo ""
