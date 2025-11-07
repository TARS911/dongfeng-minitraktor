import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// GET /api/products - получить все товары
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = searchParams.get('limit') || '20';

    let query = supabase
      .from('products')
      .select('*')
      .eq('in_stock', true);

    if (category) {
      query = query.eq('category_id', category);
    }

    const { data: products, error } = await query.limit(parseInt(limit));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
