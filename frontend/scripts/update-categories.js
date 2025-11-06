const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateCategories() {
  // Обновляем описание категории "Запасные части"
  const { data, error } = await supabase
    .from('categories')
    .update({
      description: 'Оригинальные запасные части для минитракторов и сельхозтехники'
    })
    .eq('slug', 'parts')
    .select();

  if (error) {
    console.error('Ошибка:', error);
  } else {
    console.log('✅ Категория обновлена:', data);
  }
}

updateCategories();
