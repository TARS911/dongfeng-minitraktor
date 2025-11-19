#!/bin/bash
#
# Удаление старых подкатегорий из Supabase
#

SUPABASE_URL="https://dpsykseeqloturowdyzf.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwc3lrc2VlcWxvdHVyb3dkeXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUwMjg1MywiZXhwIjoyMDc4MDc4ODUzfQ.wY2VoghxdIhgwEws_kUIUgZX1P3TTw-1PXh84GVbdJ4"

echo ""
echo "🗑️  УДАЛЕНИЕ СТАРЫХ ПОДКАТЕГОРИЙ ИЗ SUPABASE"
echo "======================================================================"

# Список старых категорий для удаления (по именам)
old_categories=(
  "Фильтра"
  "Двигателя дизельные"
  "Стартеры, Генераторы"
  "Универсальные комплектующие"
  "Сиденья (кресла)"
  "ЗИП"
  "Запчасти для навесного оборудования"
  "Запчасти для тракторов"
  "Колёса, шины, груза"
  "Стандартные изделия"
  "Гидравлика"
  "Карданные валы"
  "Прочие запчасти"
)

echo ""
echo "📋 Поиск и удаление старых категорий..."
echo ""

deleted_count=0
not_found_count=0

for cat_name in "${old_categories[@]}"; do
  # Ищем категорию по имени
  category=$(curl -s -X GET \
    "${SUPABASE_URL}/rest/v1/categories?name=eq.${cat_name}&select=id,name,slug" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}")

  cat_id=$(echo "$category" | jq -r '.[0].id // empty')

  if [ -z "$cat_id" ]; then
    echo "   ⚠️  \"$cat_name\" - не найдена"
    ((not_found_count++))
  else
    # Удаляем категорию
    response=$(curl -s -X DELETE \
      "${SUPABASE_URL}/rest/v1/categories?id=eq.${cat_id}" \
      -H "apikey: ${SUPABASE_KEY}" \
      -H "Authorization: Bearer ${SUPABASE_KEY}")

    echo "   ✅ \"$cat_name\" - удалена (ID: $cat_id)"
    ((deleted_count++))
  fi
done

echo ""
echo "======================================================================"
echo "📊 Итого:"
echo "   ✅ Удалено: $deleted_count категорий"
echo "   ⚠️  Не найдено: $not_found_count категорий"
echo ""
echo "Готово!"
echo ""
