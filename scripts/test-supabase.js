require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Ошибка: Не заданы переменные окружения SUPABASE_URL и SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSupabase() {
  console.log('Testing Supabase connection...');
  const { data, error } = await supabase.from('categories').select('id').limit(1);
  if (error) {
    console.error('Error fetching categories:', error);
    return;
  }
  console.log('Categories fetched successfully:', data);

  console.log('Testing Supabase.sql...');
  const { error: sqlError } = await supabase.sql`SELECT 1`;
  if (sqlError) {
    console.error('Error with supabase.sql:', sqlError);
    return;
  }
  console.log('supabase.sql works!');
}

testSupabase();
