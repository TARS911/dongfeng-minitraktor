/**
 * APP SPA - Главный файл Single Page Application
 *
 * Инициализирует SPA роутер и регистрирует все маршруты.
 *
 * @author DONGFENG Team
 * @version 1.0.0
 */

// ============================================
// ИМПОРТЫ
// ============================================

import Router from './router.js';
import { HomePage } from './pages/HomePage.js';
import { CatalogPage } from './pages/CatalogPage.js';
import { ProductPage } from './pages/ProductPage.js';
import { CartPage } from './pages/CartPage.js';
import { ContactsPage } from './pages/ContactsPage.js';

// ============================================
// РЕГИСТРАЦИЯ МАРШРУТОВ
// ============================================

/**
 * Регистрируем все маршруты приложения
 */
function registerRoutes() {
  // Главная страница
  Router.addRoute('/', {
    title: 'Главная - DONGFENG Минитрактора',
    render: HomePage.render.bind(HomePage),
    afterRender: HomePage.afterRender?.bind(HomePage)
  });

  // Каталог
  Router.addRoute('/catalog', {
    title: 'Каталог - DONGFENG Минитрактора',
    render: CatalogPage.render.bind(CatalogPage),
    afterRender: CatalogPage.afterRender.bind(CatalogPage)
  });

  // Страница товара (динамический маршрут)
  Router.addRoute('/product/:slug', {
    title: 'Товар - DONGFENG Минитрактора',
    render: ProductPage.render.bind(ProductPage),
    afterRender: ProductPage.afterRender.bind(ProductPage)
  });

  // Корзина
  Router.addRoute('/cart', {
    title: 'Корзина - DONGFENG Минитрактора',
    render: CartPage.render.bind(CartPage),
    afterRender: CartPage.afterRender?.bind(CartPage)
  });

  // Контакты
  Router.addRoute('/contacts', {
    title: 'Контакты - DONGFENG Минитрактора',
    render: ContactsPage.render.bind(ContactsPage),
    afterRender: ContactsPage.afterRender.bind(ContactsPage)
  });

  console.log('✅ Registered', Object.keys(Router.routes || {}).length, 'routes');
}

// ============================================
// ГЛОБАЛЬНЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С КОРЗИНОЙ
// ============================================

/**
 * Добавить товар в корзину
 */
window.addToCart = function(productId) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');

  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    // В реальном приложении загружали бы данные товара с API
    cart.push({
      id: productId,
      name: 'Товар ' + productId,
      price: 500000,
      quantity: 1,
      image: '/images/placeholder.jpg'
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();

  // Показываем уведомление
  showNotification('Товар добавлен в корзину');
};

/**
 * Обновить количество товара
 */
window.updateCartQuantity = function(productId, delta) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const item = cart.find(item => item.id === productId);

  if (item) {
    item.quantity += delta;

    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== productId);
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    // Перезагружаем страницу корзины
    if (window.location.pathname === '/cart') {
      Router.navigateTo('/cart', false);
    }

    updateCartBadge();
  }
};

/**
 * Удалить товар из корзины
 */
window.removeFromCart = function(productId) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart = cart.filter(item => item.id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));

  // Перезагружаем страницу корзины
  if (window.location.pathname === '/cart') {
    Router.navigateTo('/cart', false);
  }

  updateCartBadge();
};

/**
 * Добавить в избранное
 */
window.addToFavorites = function(productId) {
  let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

  if (!favorites.includes(productId)) {
    favorites.push(productId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    showNotification('Добавлено в избранное');
  } else {
    showNotification('Уже в избранном');
  }
};

/**
 * Обновить бейдж корзины в header
 */
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const badge = document.querySelector('.cart-badge');
  if (badge) {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'block' : 'none';
  }
}

/**
 * Показать уведомление
 */
function showNotification(message) {
  // Создаем уведомление
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #2a9d4e;
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(notification);

  // Убираем через 3 секунды
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ============================================

/**
 * Инициализируем SPA при загрузке DOM
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing DONGFENG SPA...');

  // Регистрируем маршруты
  registerRoutes();

  // Инициализируем роутер
  Router.init();

  // Обновляем бейдж корзины
  updateCartBadge();

  console.log('✅ DONGFENG SPA initialized successfully!');
});

// Добавляем CSS анимации
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
  #app {
    transition: opacity 0.2s ease;
  }
`;
document.head.appendChild(style);
