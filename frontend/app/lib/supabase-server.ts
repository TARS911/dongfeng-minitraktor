import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Кэшированные запросы для ускорения
export const getCachedCategories = unstable_cache(
  async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    return data;
  },
  ['categories'],
  {
    revalidate: 3600, // Кэш на 1 час
    tags: ['categories']
  }
);

export const getCachedProducts = unstable_cache(
  async (categoryId?: number) => {
    let query = supabase
      .from('products')
      .select('*')
      .eq('in_stock', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data } = await query;
    return data;
  },
  ['products'],
  {
    revalidate: 600, // Кэш на 10 минут
    tags: ['products']
  }
);
