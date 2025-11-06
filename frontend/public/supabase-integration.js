// Supabase Integration
const SUPABASE_URL = 'https://wbfhvcmvkyjsjvqkbxpz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZmh2Y212a3lqc2p2cWtieHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNzg1MzksImV4cCI6MjA3Njg1NDUzOX0.5yHwVSIkbhDnnUKrPSe6uTCW-ImZYrczI-8nRQB0fHY';

// Load Supabase from CDN
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
script.onload = initSupabase;
document.head.appendChild(script);

async function initSupabase() {
  const { createClient } = supabase;
  const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Загружаем товары
  const { data: products, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .eq('in_stock', true)
    .limit(4);
  
  if (error) {
    console.error('Error loading products:', error);
    return;
  }
  
  if (products && products.length > 0) {
    renderProducts(products);
  }
}

function renderProducts(products) {
  const grid = document.querySelector('.products-grid');
  if (!grid) return;
  
  grid.innerHTML = products.map(product => `
    <div class="product-card">
      <div class="product-image">
        🚜
        ${product.is_new ? '<div class="product-badge">НОВИНКА</div>' : ''}
      </div>
      <div class="product-info">
        <div class="product-title">${product.name}</div>
        <div class="product-specs">
          ${product.power ? `<div><span>Мощность</span><span>${product.power} л.с.</span></div>` : ''}
          ${product.drive ? `<div><span>Привод</span><span>${product.drive}</span></div>` : ''}
          ${product.transmission ? `<div><span>Коробка</span><span>${product.transmission}</span></div>` : ''}
        </div>
        <div class="product-price">${product.price.toLocaleString('ru-RU')} ₽</div>
        <div class="product-actions">
          <button class="btn-buy">В корзину</button>
          <button class="btn-details">→</button>
        </div>
      </div>
    </div>
  `).join('');
}
