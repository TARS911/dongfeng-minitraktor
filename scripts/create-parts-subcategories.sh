#!/bin/bash
#
# Скрипт для создания 11 подкатегорий в разделе "Запчасти" через Supabase REST API
#

SUPABASE_URL="https://dpsykseeqloturowdyzf.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwc3lrc2VlcWxvdHVyb3dkeXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUwMjg1MywiZXhwIjoyMDc4MDc4ODUzfQ.wY2VoghxdIhgwEws_kUIUgZX1P3TTw-1PXh84GVbdJ4"

echo ""
echo "🚀 СОЗДАНИЕ ПОДКАТЕГОРИЙ В SUPABASE"
echo "======================================================================"

# Массив категорий (таблица не имеет parent_id и display_order)
categories=(
  '{"name":"ДВС в Сборе","slug":"engines-assembled","description":"Двигатели внутреннего сгорания в сборе для минитракторов и мотоблоков"}'
  '{"name":"Запчасти на ДВС","slug":"parts-engines","description":"Запчасти для двигателей: поршни, кольца, прокладки, клапаны"}'
  '{"name":"Запчасти на Минитракторы","slug":"parts-minitractors","description":"Запчасти для минитракторов DongFeng, Foton, Jinma, Xingtai, Уралец"}'
  '{"name":"Запчасти на Мототракторы","slug":"parts-mototractors","description":"Запчасти для мототракторов с колесом 16 дюймов: Зубр, Crosser"}'
  '{"name":"Запчасти на Мотоблоки","slug":"parts-motoblocks","description":"Запчасти для мотоблоков: Garden, Скаут, Прораб, Булат, Зубр, Crosser"}'
  '{"name":"Запчасти на Навесное оборудование","slug":"parts-attachments","description":"Запчасти для навесного оборудования: плуги, культиваторы, косилки, картофелекопалки"}'
  '{"name":"Запчасти на Садовую технику","slug":"parts-garden-equipment","description":"Запчасти для садовой техники: газонокосилки, триммеры, кусторезы, мотопомпы"}'
  '{"name":"Запчасти на Электрогенераторы","slug":"parts-generators","description":"Запчасти для электрогенераторов: AVR, щетки, статоры, роторы, конденсаторы"}'
  '{"name":"Топливная система","slug":"parts-fuel-system","description":"Топливные баки, насосы, краны, шланги, фитинги, карбюраторы"}'
  '{"name":"Фильтры","slug":"parts-filters","description":"Фильтры: воздушные, топливные, масляные, гидравлические"}'
  '{"name":"Гидравлика","slug":"parts-hydraulics","description":"Гидравлические системы: насосы, распределители, цилиндры, шланги, муфты"}'
)

echo ""
echo "📝 Создание подкатегорий..."
echo ""

# Создаем каждую категорию
for i in "${!categories[@]}"; do
  cat_data="${categories[$i]}"
  cat_name=$(echo "$cat_data" | jq -r '.name')

  response=$(curl -s -X POST \
    "${SUPABASE_URL}/rest/v1/categories" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d "$cat_data")

  # Проверяем результат
  if echo "$response" | jq -e '.[0].id' > /dev/null 2>&1; then
    echo "   ✅ $((i+1)). $cat_name"
  else
    error=$(echo "$response" | jq -r '.message // .error // "Unknown error"')
    if [[ "$error" == *"duplicate"* ]] || [[ "$error" == *"already exists"* ]]; then
      echo "   ⚠️  $((i+1)). $cat_name (уже существует)"
    else
      echo "   ❌ $((i+1)). $cat_name - Ошибка: $error"
    fi
  fi
done

echo ""
echo "======================================================================"
echo "📊 Проверка результата..."
echo ""

# Получаем созданные категории по slug
slugs="engines-assembled,parts-engines,parts-minitractors,parts-mototractors,parts-motoblocks,parts-attachments,parts-garden-equipment,parts-generators,parts-fuel-system,parts-filters,parts-hydraulics"
result=$(curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/categories?slug=in.(${slugs})&order=name.asc&select=id,name,slug" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}")

count=$(echo "$result" | jq '. | length')
echo "✅ Всего созданных категорий запчастей: $count из 11"
echo ""

echo "$result" | jq -r '.[] | "   • \(.name)\n      Slug: \(.slug) | ID: \(.id)\n"'

echo "Готово!"
echo ""
