/**
 * Vercel Serverless Function - Catch-all для всех API запросов
 * Путь: /api/*
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://wbfhvcmvkyjsjvqkbxpz.supabase.co',
  process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZmh2Y212a3lqc2p2cWtieHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNzg1MzksImV4cCI6MjA3Njg1NDUzOX0.5yHwVSIkbhDnnUKrPSe6uTCW-ImZYrczI-8nRQB0fHY'
);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.query.path ? req.query.path.join('/') : '';

  try {
    // Health check
    if (path === 'health') {
      return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        platform: 'vercel-serverless'
      });
    }

    // GET /api/products
    if (path === 'products' && req.method === 'GET') {
      const { category, in_stock, search, sort_by = 'newest', limit = 100, offset = 0 } = req.query;

      let query = supabase.from('products').select(`
        *,
        categories!inner(name, slug)
      `, { count: 'exact' });

      if (category) query = query.eq('categories.slug', category);
      if (in_stock !== undefined) query = query.eq('in_stock', in_stock === 'true');
      if (search) query = query.or(`name.ilike.%${search}%,model.ilike.%${search}%`);

      // Сортировка
      switch (sort_by) {
        case 'price_asc': query = query.order('price', { ascending: true }); break;
        case 'price_desc': query = query.order('price', { ascending: false }); break;
        case 'power_asc': query = query.order('power', { ascending: true }); break;
        case 'power_desc': query = query.order('power', { ascending: false }); break;
        default: query = query.order('created_at', { ascending: false });
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      const products = data.map(p => ({
        ...p,
        category_name: p.categories?.name || null,
        category_slug: p.categories?.slug || null,
        categories: undefined
      }));

      return res.status(200).json({
        success: true,
        data: products,
        pagination: { total: count || 0, limit, offset }
      });
    }

    // GET /api/categories
    if (path === 'categories' && req.method === 'GET') {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('id');

      if (error) throw error;

      const categoriesWithCount = await Promise.all(
        categories.map(async (cat) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', cat.id)
            .eq('in_stock', true);
          return { ...cat, products_count: count || 0 };
        })
      );

      return res.status(200).json({
        success: true,
        data: categoriesWithCount
      });
    }

    // POST /api/contact
    if (path === 'contact' && req.method === 'POST') {
      const { name, phone, email, message, product_model } = req.body;

      const { data, error } = await supabase
        .from('contacts')
        .insert({
          name,
          phone,
          email: email || null,
          message: message || null,
          product_model: product_model || null,
          status: 'new'
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Ваша заявка принята!',
        data: { id: data.id }
      });
    }

    // 404 - endpoint not found
    return res.status(404).json({
      success: false,
      error: `Endpoint not found: /api/${path}`
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error'
    });
  }
}
