/**
 * CATALOG PAGE - Страница каталога
 *
 * Содержит:
 * - Фильтры по категориям, цене, мощности
 * - Поиск
 * - Сортировка
 * - Карточки товаров
 * - Пагинация
 */

import { API_URL } from '../config.js';

export const CatalogPage = {
  /**
   * Текущее состояние фильтров
   */
  filters: {
    search: '',
    category: '',
    in_stock: null,
    min_price: null,
    max_price: null,
    sort_by: 'newest'
  },

  /**
   * Рендерит HTML страницы каталога
   */
  async render() {
    try {
      // Загружаем категории
      const categoriesResponse = await fetch(`${API_URL}/api/categories`);
      const categoriesData = await categoriesResponse.json();
      const categories = categoriesData.success ? categoriesData.data : [];

      // Загружаем товары с фильтрами
      const products = await this.loadProducts();

      return `
        <section class="catalog-page">
          <div class="container">
            <!-- Header -->
            <div class="catalog-header">
              <h1 class="catalog-title">Каталог минитракторов</h1>
              <p class="catalog-subtitle">
                Выберите подходящий минитрактор из нашего ассортимента
              </p>
            </div>

            <!-- Filters -->
            <div class="catalog-filters" id="catalog-filters">
              <!-- Search -->
              <div class="filter-group">
                <input
                  type="text"
                  id="search-input"
                  class="filter-input"
                  placeholder="Поиск по названию или модели..."
                  value="${this.filters.search}"
                >
              </div>

              <!-- Category Filter -->
              <div class="filter-group">
                <select id="category-filter" class="filter-select">
                  <option value="">Все категории</option>
                  ${categories.map(cat => `
                    <option value="${cat.slug}" ${this.filters.category === cat.slug ? 'selected' : ''}>
                      ${cat.name} (${cat.products_count})
                    </option>
                  `).join('')}
                </select>
              </div>

              <!-- Stock Filter -->
              <div class="filter-group">
                <label class="filter-checkbox">
                  <input
                    type="checkbox"
                    id="in-stock-filter"
                    ${this.filters.in_stock ? 'checked' : ''}
                  >
                  <span>Только в наличии</span>
                </label>
              </div>

              <!-- Sort -->
              <div class="filter-group">
                <select id="sort-filter" class="filter-select">
                  <option value="newest">Новые сначала</option>
                  <option value="price_asc">Цена: дешевле</option>
                  <option value="price_desc">Цена: дороже</option>
                  <option value="power_asc">Мощность: меньше</option>
                  <option value="power_desc">Мощность: больше</option>
                </select>
              </div>

              <!-- Reset Button -->
              <button id="reset-filters" class="btn btn-secondary">
                Сбросить фильтры
              </button>
            </div>

            <!-- Products Grid -->
            <div id="products-container">
              ${this.renderProducts(products)}
            </div>
          </div>
        </section>
      `;
    } catch (error) {
      console.error('Error loading catalog:', error);
      return '<div class="container">Ошибка загрузки каталога</div>';
    }
  },

  /**
   * Рендерит список товаров
   */
  renderProducts(products) {
    if (!products || products.length === 0) {
      return `
        <div class="no-products">
          <h3>Товары не найдены</h3>
          <p>Попробуйте изменить параметры фильтрации</p>
        </div>
      `;
    }

    return `
      <div class="products-grid">
        ${products.map(product => `
          <div class="product-card">
            <!-- Badges -->
            ${product.is_hit || product.is_new ? `
              <div class="product-card__badges">
                ${product.is_hit ? '<span class="badge badge--hit">Хит продаж</span>' : ''}
                ${product.is_new ? '<span class="badge badge--new">Новинка</span>' : ''}
              </div>
            ` : ''}

            <!-- Image -->
            <a href="/product/${product.slug}" data-link class="product-card__image">
              <img src="${product.image_url}" alt="${product.name}" loading="lazy">
            </a>

            <!-- Content -->
            <div class="product-card__content">
              <div class="product-card__category">${product.category_name || 'Минитрактор'}</div>
              <h3 class="product-card__name">
                <a href="/product/${product.slug}" data-link>${product.name}</a>
              </h3>

              <!-- Specs -->
              <div class="product-card__specs">
                <div class="spec-item">
                  <span class="spec-label">Мощность:</span>
                  <span class="spec-value">${product.power || '-'} л.с.</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Привод:</span>
                  <span class="spec-value">${product.drive || '4WD'}</span>
                </div>
              </div>

              <!-- Price -->
              <div class="product-card__price">
                ${product.price ? `${product.price.toLocaleString()} ₽` : 'Цена по запросу'}
              </div>

              <!-- Stock -->
              <div class="product-card__stock ${product.in_stock ? 'in-stock' : 'out-of-stock'}">
                ${product.in_stock ? '✓ В наличии' : '✗ Под заказ'}
              </div>

              <!-- Actions -->
              <div class="product-card__actions">
                <a href="/product/${product.slug}" data-link class="btn btn-primary">
                  Подробнее
                </a>
                <button
                  onclick="window.addToCart(${product.id})"
                  class="btn btn-secondary"
                  ${!product.in_stock ? 'disabled' : ''}
                >
                  В корзину
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  /**
   * Загружает товары с сервера с учетом фильтров
   */
  async loadProducts() {
    try {
      // Строим query параметры
      const params = new URLSearchParams();

      if (this.filters.search) params.append('search', this.filters.search);
      if (this.filters.category) params.append('category', this.filters.category);
      if (this.filters.in_stock) params.append('in_stock', 'true');
      if (this.filters.sort_by) params.append('sort_by', this.filters.sort_by);

      const response = await fetch(`${API_URL}/api/products?${params}`);
      const data = await response.json();

      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    }
  },

  /**
   * Инициализация после рендера
   */
  async afterRender() {
    console.log('Catalog page rendered');

    // Обработчик поиска
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.filters.search = e.target.value;
          this.reloadProducts();
        }, 500); // Debounce 500ms
      });
    }

    // Обработчик фильтра категорий
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.filters.category = e.target.value;
        this.reloadProducts();
      });
    }

    // Обработчик фильтра "В наличии"
    const inStockFilter = document.getElementById('in-stock-filter');
    if (inStockFilter) {
      inStockFilter.addEventListener('change', (e) => {
        this.filters.in_stock = e.target.checked;
        this.reloadProducts();
      });
    }

    // Обработчик сортировки
    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) {
      sortFilter.addEventListener('change', (e) => {
        this.filters.sort_by = e.target.value;
        this.reloadProducts();
      });
    }

    // Обработчик сброса фильтров
    const resetBtn = document.getElementById('reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.filters = {
          search: '',
          category: '',
          in_stock: null,
          min_price: null,
          max_price: null,
          sort_by: 'newest'
        };
        this.reloadProducts();
      });
    }
  },

  /**
   * Перезагружает список товаров без перезагрузки страницы
   */
  async reloadProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;

    // Показываем loader
    container.innerHTML = '<div class="loading">Загрузка...</div>';

    // Загружаем товары
    const products = await this.loadProducts();

    // Обновляем контент
    container.innerHTML = this.renderProducts(products);
  }
};
