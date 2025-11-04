/**
 * SIMPLE SPA ROUTER - Простой роутер для Single Page Application
 *
 * Управляет навигацией без перезагрузки страницы.
 *
 * Возможности:
 * - Навигация через History API (без перезагрузки)
 * - Поддержка динамических параметров (:id, :slug)
 * - Поддержка кнопок "Назад/Вперед" браузера
 * - Плавные переходы между страницами
 * - Middleware для проверки авторизации
 *
 * @author DONGFENG Team
 * @version 1.0.0
 */

// ============================================
// ХРАНИЛИЩЕ МАРШРУТОВ
// ============================================

/**
 * Объект с маршрутами и их обработчиками
 *
 * Формат:
 * '/path': {
 *   title: 'Заголовок страницы',
 *   render: функция рендеринга
 * }
 */
const routes = {};

// ============================================
// РЕГИСТРАЦИЯ МАРШРУТА
// ============================================

/**
 * Регистрирует новый маршрут
 *
 * @param {string} path - Путь (например: '/', '/catalog', '/product/:slug')
 * @param {Object} config - Конфигурация маршрута
 * @param {string} config.title - Заголовок страницы
 * @param {Function} config.render - Функция рендеринга (async)
 * @param {Function} config.beforeEnter - Middleware перед входом (optional)
 *
 * @example
 * Router.addRoute('/catalog', {
 *   title: 'Каталог тракторов',
 *   render: async () => { ... }
 * });
 */
export function addRoute(path, config) {
  routes[path] = config;
}

// ============================================
// НАВИГАЦИЯ
// ============================================

/**
 * Навигация на новую страницу без перезагрузки
 *
 * @param {string} url - URL для перехода
 * @param {boolean} pushState - Добавить в историю (default: true)
 *
 * @example
 * Router.navigateTo('/catalog');
 * Router.navigateTo('/product/df-244');
 */
export async function navigateTo(url, pushState = true) {
  // Обновляем URL в адресной строке (без перезагрузки)
  if (pushState) {
    window.history.pushState(null, null, url);
  }

  // Рендерим новую страницу
  await renderPage();
}

// ============================================
// РЕНДЕР СТРАНИЦЫ
// ============================================

/**
 * Рендерит страницу по текущему URL
 *
 * Алгоритм:
 * 1. Получаем текущий путь из window.location.pathname
 * 2. Ищем подходящий маршрут (с учетом динамических параметров)
 * 3. Вызываем beforeEnter middleware (если есть)
 * 4. Рендерим контент через render()
 * 5. Обновляем title
 * 6. Добавляем анимацию перехода
 */
async function renderPage() {
  const path = window.location.pathname;

  // Ищем подходящий маршрут
  const { route, params } = matchRoute(path);

  if (!route) {
    // Маршрут не найден → 404
    render404();
    return;
  }

  try {
    // Вызываем middleware (если есть)
    if (route.beforeEnter) {
      const canEnter = await route.beforeEnter(params);
      if (!canEnter) {
        // Middleware заблокировал переход
        return;
      }
    }

    // Показываем loader
    showLoader();

    // Рендерим контент страницы
    const html = await route.render(params);

    // Получаем контейнер для контента
    const app = document.getElementById('app');

    if (!app) {
      console.error('Container #app not found!');
      return;
    }

    // Добавляем fade-out анимацию
    app.style.opacity = '0';

    // Через 150ms обновляем контент
    setTimeout(() => {
      app.innerHTML = html;

      // Обновляем title
      document.title = route.title || 'DONGFENG Минитрактора';

      // Скроллим наверх
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Добавляем fade-in анимацию
      setTimeout(() => {
        app.style.opacity = '1';
        hideLoader();

        // Вызываем afterRender callback (если есть)
        if (route.afterRender) {
          route.afterRender(params);
        }
      }, 50);
    }, 150);

  } catch (error) {
    console.error('Error rendering page:', error);
    renderError(error);
  }
}

// ============================================
// СОПОСТАВЛЕНИЕ МАРШРУТОВ
// ============================================

/**
 * Находит подходящий маршрут для текущего пути
 *
 * Поддерживает динамические параметры:
 * - /product/:slug → /product/df-244 (params.slug = 'df-244')
 * - /category/:id → /category/123 (params.id = '123')
 *
 * @param {string} path - Путь для проверки
 * @returns {Object} - { route, params }
 */
function matchRoute(path) {
  // Убираем trailing slash
  path = path.replace(/\/$/, '') || '/';

  // Сначала ищем точное совпадение
  if (routes[path]) {
    return { route: routes[path], params: {} };
  }

  // Ищем с динамическими параметрами
  for (const [routePath, route] of Object.entries(routes)) {
    const params = matchDynamicRoute(routePath, path);
    if (params) {
      return { route, params };
    }
  }

  // Маршрут не найден
  return { route: null, params: {} };
}

/**
 * Сопоставляет динамический маршрут
 *
 * @param {string} routePath - Путь маршрута с параметрами (/product/:slug)
 * @param {string} actualPath - Фактический путь (/product/df-244)
 * @returns {Object|null} - Параметры или null
 */
function matchDynamicRoute(routePath, actualPath) {
  // Разбиваем на части
  const routeParts = routePath.split('/').filter(Boolean);
  const actualParts = actualPath.split('/').filter(Boolean);

  // Разная длина → не совпадает
  if (routeParts.length !== actualParts.length) {
    return null;
  }

  const params = {};

  // Проверяем каждую часть
  for (let i = 0; i < routeParts.length; i++) {
    const routePart = routeParts[i];
    const actualPart = actualParts[i];

    if (routePart.startsWith(':')) {
      // Динамический параметр
      const paramName = routePart.slice(1);
      params[paramName] = actualPart;
    } else if (routePart !== actualPart) {
      // Не совпадает → это не наш маршрут
      return null;
    }
  }

  return params;
}

// ============================================
// 404 PAGE
// ============================================

/**
 * Рендерит страницу 404
 */
function render404() {
  const app = document.getElementById('app');
  document.title = '404 - Страница не найдена | DONGFENG';

  app.innerHTML = `
    <div style="
      min-height: 60vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 60px 24px;
    ">
      <h1 style="
        font-size: clamp(4rem, 10vw, 8rem);
        font-weight: 900;
        background: linear-gradient(135deg, #2a9d4e 0%, #4CAF50 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 24px;
      ">404</h1>
      <h2 style="font-size: 1.5rem; color: #424242; margin-bottom: 16px;">
        Страница не найдена
      </h2>
      <p style="font-size: 1.125rem; color: #757575; max-width: 500px; margin-bottom: 32px;">
        К сожалению, запрашиваемая страница не существует или была удалена.
      </p>
      <a href="/" data-link style="
        padding: 16px 40px;
        background: linear-gradient(135deg, #2a9d4e 0%, #4CAF50 100%);
        color: white;
        text-decoration: none;
        border-radius: 12px;
        font-weight: 700;
        transition: transform 0.3s ease;
      ">
        Вернуться на главную
      </a>
    </div>
  `;

  hideLoader();
}

// ============================================
// ERROR PAGE
// ============================================

/**
 * Рендерит страницу ошибки
 */
function renderError(error) {
  const app = document.getElementById('app');
  document.title = 'Ошибка | DONGFENG';

  app.innerHTML = `
    <div style="
      min-height: 60vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 60px 24px;
    ">
      <div style="
        width: 80px;
        height: 80px;
        background: #ffebee;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 24px;
      ">
        <span style="font-size: 40px;">⚠️</span>
      </div>
      <h2 style="font-size: 1.5rem; color: #424242; margin-bottom: 16px;">
        Произошла ошибка
      </h2>
      <p style="font-size: 1rem; color: #757575; max-width: 600px; margin-bottom: 32px;">
        ${error.message || 'Не удалось загрузить страницу. Попробуйте обновить страницу.'}
      </p>
      <button onclick="location.reload()" style="
        padding: 16px 40px;
        background: #2a9d4e;
        color: white;
        border: none;
        border-radius: 12px;
        font-weight: 700;
        cursor: pointer;
      ">
        Обновить страницу
      </button>
    </div>
  `;

  hideLoader();
}

// ============================================
// LOADER
// ============================================

/**
 * Показывает loader при переходе между страницами
 */
function showLoader() {
  let loader = document.getElementById('page-loader');

  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.innerHTML = '<div class="spinner"></div>';
    loader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: linear-gradient(90deg, #2a9d4e, #4CAF50);
      z-index: 9999;
      animation: progress 1s ease-in-out infinite;
    `;
    document.body.appendChild(loader);
  }

  loader.style.display = 'block';
}

/**
 * Скрывает loader
 */
function hideLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) {
    setTimeout(() => {
      loader.style.display = 'none';
    }, 200);
  }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ РОУТЕРА
// ============================================

/**
 * Инициализирует SPA Router
 *
 * Вызывается один раз при загрузке приложения
 */
export function init() {
  // Перехватываем клики по ссылкам с data-link
  document.addEventListener('click', (e) => {
    // Проверяем, это ссылка с data-link?
    if (e.target.matches('[data-link]')) {
      e.preventDefault();
      const url = e.target.getAttribute('href');
      navigateTo(url);
    }

    // Проверяем родительский элемент
    const link = e.target.closest('[data-link]');
    if (link) {
      e.preventDefault();
      const url = link.getAttribute('href');
      navigateTo(url);
    }
  });

  // Обрабатываем кнопки "Назад/Вперед" браузера
  window.addEventListener('popstate', () => {
    renderPage();
  });

  // Рендерим первую страницу при загрузке
  renderPage();

  console.log('✅ SPA Router initialized');
}

// ============================================
// ЭКСПОРТ API
// ============================================

export default {
  addRoute,
  navigateTo,
  init
};
