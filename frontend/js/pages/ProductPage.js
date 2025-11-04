/**
 * PRODUCT PAGE - Страница товара
 *
 * Динамический маршрут: /product/:slug
 *
 * Содержит:
 * - Галерею изображений
 * - Детальное описание
 * - Характеристики
 * - Кнопки действий
 * - Похожие товары
 */

import { API_URL } from '../config.js';

export const ProductPage = {
  /**
   * Рендерит HTML страницы товара
   *
   * @param {Object} params - Параметры маршрута
   * @param {string} params.slug - Slug товара
   */
  async render(params) {
    try {
      const { slug } = params;

      // Загружаем товар с API
      const response = await fetch(`${API_URL}/api/products/${slug}`);
      const data = await response.json();

      if (!data.success) {
        return this.renderNotFound();
      }

      const product = data.data;

      // Парсим спецификации (если они в JSON)
      let specs = {};
      if (product.specifications) {
        try {
          specs = typeof product.specifications === 'string'
            ? JSON.parse(product.specifications)
            : product.specifications;
        } catch (e) {
          console.error('Error parsing specifications:', e);
        }
      }

      return `
        <section class="product-page">
          <div class="container">
            <!-- Breadcrumbs -->
            <nav class="breadcrumbs">
              <a href="/" data-link>Главная</a>
              <span>/</span>
              <a href="/catalog" data-link>Каталог</a>
              <span>/</span>
              <span>${product.name}</span>
            </nav>

            <!-- Product Main -->
            <div class="product-main">
              <!-- Gallery -->
              <div class="product-gallery">
                <div class="product-gallery__main">
                  <img
                    src="${product.image_url}"
                    alt="${product.name}"
                    id="main-image"
                  >
                  ${product.is_hit || product.is_new ? `
                    <div class="product-gallery__badges">
                      ${product.is_hit ? '<span class="badge badge--hit">Хит продаж</span>' : ''}
                      ${product.is_new ? '<span class="badge badge--new">Новинка</span>' : ''}
                    </div>
                  ` : ''}
                </div>
              </div>

              <!-- Info -->
              <div class="product-info">
                <div class="product-info__category">${product.category_name || 'Минитрактор'}</div>
                <h1 class="product-info__title">${product.name}</h1>

                ${product.model ? `
                  <div class="product-info__model">Модель: ${product.model}</div>
                ` : ''}

                <!-- Price -->
                <div class="product-info__price-block">
                  <div class="product-info__price">
                    ${product.price ? `${product.price.toLocaleString()} ₽` : 'Цена по запросу'}
                  </div>
                  <div class="product-info__stock ${product.in_stock ? 'in-stock' : 'out-of-stock'}">
                    ${product.in_stock ? '✓ В наличии' : '✗ Под заказ'}
                  </div>
                </div>

                <!-- Key Specs -->
                <div class="product-info__key-specs">
                  ${product.power ? `
                    <div class="key-spec">
                      <div class="key-spec__label">Мощность</div>
                      <div class="key-spec__value">${product.power} л.с.</div>
                    </div>
                  ` : ''}
                  ${product.drive ? `
                    <div class="key-spec">
                      <div class="key-spec__label">Привод</div>
                      <div class="key-spec__value">${product.drive}</div>
                    </div>
                  ` : ''}
                  ${product.transmission ? `
                    <div class="key-spec">
                      <div class="key-spec__label">КПП</div>
                      <div class="key-spec__value">${product.transmission}</div>
                    </div>
                  ` : ''}
                </div>

                <!-- Actions -->
                <div class="product-info__actions">
                  <button
                    onclick="window.addToCart(${product.id})"
                    class="btn btn-primary btn-large"
                    ${!product.in_stock ? 'disabled' : ''}
                  >
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                    Добавить в корзину
                  </button>
                  <button
                    onclick="window.addToFavorites(${product.id})"
                    class="btn btn-secondary"
                  >
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    В избранное
                  </button>
                </div>

                <!-- Delivery Info -->
                <div class="product-info__delivery">
                  <div class="delivery-item">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z"/>
                    </svg>
                    <div>
                      <strong>Бесплатная доставка</strong>
                      <p>По Москве и МО при заказе от 500 000 ₽</p>
                    </div>
                  </div>
                  <div class="delivery-item">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <div>
                      <strong>Гарантия 2 года</strong>
                      <p>Официальная гарантия от производителя</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tabs -->
            <div class="product-tabs">
              <div class="product-tabs__nav">
                <button class="product-tabs__btn active" data-tab="description">
                  Описание
                </button>
                <button class="product-tabs__btn" data-tab="specs">
                  Характеристики
                </button>
              </div>

              <div class="product-tabs__content">
                <!-- Description Tab -->
                <div class="product-tabs__panel active" data-panel="description">
                  <div class="product-description">
                    ${product.description || '<p>Описание товара отсутствует</p>'}
                  </div>
                </div>

                <!-- Specs Tab -->
                <div class="product-tabs__panel" data-panel="specs">
                  <div class="product-specs">
                    ${this.renderSpecifications(specs, product)}
                  </div>
                </div>
              </div>
            </div>

            <!-- Contact CTA -->
            <div class="product-cta">
              <h3>Нужна консультация?</h3>
              <p>Наши специалисты помогут подобрать оптимальную комплектацию</p>
              <a href="/contacts" data-link class="btn btn-primary">
                Получить консультацию
              </a>
            </div>
          </div>
        </section>
      `;
    } catch (error) {
      console.error('Error loading product:', error);
      return this.renderNotFound();
    }
  },

  /**
   * Рендерит характеристики товара
   */
  renderSpecifications(specs, product) {
    if (!specs || Object.keys(specs).length === 0) {
      return `
        <div class="specs-table">
          <div class="spec-row">
            <div class="spec-label">Мощность</div>
            <div class="spec-value">${product.power || '-'} л.с.</div>
          </div>
          <div class="spec-row">
            <div class="spec-label">Привод</div>
            <div class="spec-value">${product.drive || '-'}</div>
          </div>
          <div class="spec-row">
            <div class="spec-label">Трансмиссия</div>
            <div class="spec-value">${product.transmission || '-'}</div>
          </div>
        </div>
      `;
    }

    let html = '<div class="specs-table">';

    // Двигатель
    if (specs.engine) {
      html += '<h4>Двигатель</h4>';
      if (specs.engine.type) {
        html += `<div class="spec-row">
          <div class="spec-label">Тип</div>
          <div class="spec-value">${specs.engine.type}</div>
        </div>`;
      }
      if (specs.engine.cylinders) {
        html += `<div class="spec-row">
          <div class="spec-label">Количество цилиндров</div>
          <div class="spec-value">${specs.engine.cylinders}</div>
        </div>`;
      }
      if (specs.engine.displacement) {
        html += `<div class="spec-row">
          <div class="spec-label">Объем</div>
          <div class="spec-value">${specs.engine.displacement}</div>
        </div>`;
      }
    }

    // Трансмиссия
    if (specs.transmission) {
      html += '<h4>Трансмиссия</h4>';
      Object.entries(specs.transmission).forEach(([key, value]) => {
        const labels = {
          type: 'Тип',
          gears: 'Количество передач',
          clutch: 'Сцепление'
        };
        html += `<div class="spec-row">
          <div class="spec-label">${labels[key] || key}</div>
          <div class="spec-value">${value}</div>
        </div>`;
      });
    }

    // Габариты
    if (specs.dimensions) {
      html += '<h4>Габариты</h4>';
      Object.entries(specs.dimensions).forEach(([key, value]) => {
        const labels = {
          length: 'Длина',
          width: 'Ширина',
          height: 'Высота',
          clearance: 'Клиренс'
        };
        html += `<div class="spec-row">
          <div class="spec-label">${labels[key] || key}</div>
          <div class="spec-value">${value}</div>
        </div>`;
      });
    }

    html += '</div>';
    return html;
  },

  /**
   * Рендерит страницу "Товар не найден"
   */
  renderNotFound() {
    return `
      <div class="container" style="padding: 100px 24px; text-align: center;">
        <h1>Товар не найден</h1>
        <p>К сожалению, запрашиваемый товар не существует или был удален.</p>
        <a href="/catalog" data-link class="btn btn-primary">
          Вернуться в каталог
        </a>
      </div>
    `;
  },

  /**
   * Инициализация после рендера
   */
  afterRender() {
    console.log('Product page rendered');

    // Обработчик переключения табов
    const tabBtns = document.querySelectorAll('.product-tabs__btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');

        // Убираем active у всех
        document.querySelectorAll('.product-tabs__btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.product-tabs__panel').forEach(p => p.classList.remove('active'));

        // Добавляем active к выбранным
        btn.classList.add('active');
        document.querySelector(`[data-panel="${tab}"]`).classList.add('active');
      });
    });
  }
};
