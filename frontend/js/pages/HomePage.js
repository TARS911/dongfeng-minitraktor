/**
 * HOME PAGE - Главная страница
 *
 * Содержит:
 * - Hero секция
 * - Преимущества
 * - Популярные модели
 * - CTA блок
 */

import { API_URL } from '../config.js';

export const HomePage = {
  /**
   * Рендерит HTML главной страницы
   */
  async render() {
    try {
      // Загружаем популярные товары с API
      const response = await fetch(`${API_URL}/api/products?is_hit=true&limit=3`);
      const data = await response.json();
      const products = data.success ? data.data : [];

      return `
        <!-- Hero Section -->
        <section class="hero-premium">
          <div class="hero-premium__overlay"></div>
          <div class="hero-premium__content">
            <div class="container">
              <div class="hero-premium__text">
                <span class="hero-premium__badge">🚜 №1 в России</span>
                <h1 class="hero-premium__title">
                  Минитрактора DONGFENG
                </h1>
                <p class="hero-premium__subtitle">
                  Надежная техника для вашего хозяйства.
                  Официальный дилер с гарантией и сервисом.
                </p>
                <div class="hero-premium__actions">
                  <a href="/catalog" data-link class="btn btn-primary">
                    Смотреть каталог
                  </a>
                  <a href="/contacts" data-link class="btn btn-secondary">
                    Получить консультацию
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Stats Section -->
        <section class="stats-section">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-card__number">15+</div>
              <div class="stat-card__label">Лет на рынке</div>
            </div>
            <div class="stat-card">
              <div class="stat-card__number">5000+</div>
              <div class="stat-card__label">Довольных клиентов</div>
            </div>
            <div class="stat-card">
              <div class="stat-card__number">50+</div>
              <div class="stat-card__label">Моделей в наличии</div>
            </div>
            <div class="stat-card">
              <div class="stat-card__number">24/7</div>
              <div class="stat-card__label">Поддержка клиентов</div>
            </div>
          </div>
        </section>

        <!-- Featured Models -->
        <section class="featured-models">
          <div class="featured-models__header">
            <h2 class="featured-models__title">Популярные модели</h2>
            <p class="featured-models__subtitle">
              Самые востребованные минитрактора в нашем каталоге
            </p>
          </div>
          <div class="featured-models__grid">
            ${products.map(product => `
              <div class="model-card">
                <div class="model-card__header">
                  <div class="model-card__badges">
                    ${product.is_hit ? '<span class="model-card__badge model-card__badge--bestseller">Хит продаж</span>' : ''}
                    ${product.is_new ? '<span class="model-card__badge model-card__badge--new">Новинка</span>' : ''}
                  </div>
                  <div class="model-card__category">${product.category_name || 'Минитракт ор'}</div>
                  <h3 class="model-card__name">${product.name}</h3>
                </div>
                <div class="model-card__image">
                  <img src="${product.image_url}" alt="${product.name}" loading="lazy">
                </div>
                <div class="model-card__specs">
                  <div class="model-card__spec">
                    <div class="model-card__spec-value">${product.power || '-'}</div>
                    <div class="model-card__spec-label">л.с.</div>
                  </div>
                  <div class="model-card__spec">
                    <div class="model-card__spec-value">${product.drive || '4WD'}</div>
                    <div class="model-card__spec-label">привод</div>
                  </div>
                  <div class="model-card__spec">
                    <div class="model-card__spec-value">${(product.price / 1000).toFixed(0)}</div>
                    <div class="model-card__spec-label">тыс. ₽</div>
                  </div>
                </div>
                <div class="model-card__actions">
                  <a href="/product/${product.slug}" data-link class="model-card__btn model-card__btn--primary">
                    Подробнее
                  </a>
                  <button onclick="addToCart(${product.id})" class="model-card__btn model-card__btn--secondary">
                    В корзину
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
          <div style="text-align: center; margin-top: 40px;">
            <a href="/catalog" data-link class="btn btn-primary">
              Смотреть все модели
            </a>
          </div>
        </section>

        <!-- Advantages -->
        <section class="service-support">
          <div class="service-support__header">
            <h2 class="service-support__title">Почему выбирают нас</h2>
            <p class="service-support__subtitle">
              Мы предлагаем полный спектр услуг для вашего удобства
            </p>
          </div>
          <div class="service-support__grid">
            <div class="service-card">
              <div class="service-card__icon">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3 class="service-card__title">Официальная гарантия</h3>
              <p class="service-card__description">
                2 года гарантии от производителя на всю технику
              </p>
            </div>
            <div class="service-card">
              <div class="service-card__icon">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 class="service-card__title">Сервисное обслуживание</h3>
              <p class="service-card__description">
                Собственный сервисный центр и оригинальные запчасти
              </p>
            </div>
            <div class="service-card">
              <div class="service-card__icon">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z"/>
                </svg>
              </div>
              <h3 class="service-card__title">Быстрая доставка</h3>
              <p class="service-card__description">
                Доставка по всей России за 3-7 дней
              </p>
            </div>
            <div class="service-card">
              <div class="service-card__icon">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
              </div>
              <h3 class="service-card__title">Консультация</h3>
              <p class="service-card__description">
                Бесплатная консультация по выбору техники от экспертов
              </p>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="smart-tech">
          <div class="smart-tech__container">
            <div class="smart-tech__content">
              <span class="smart-tech__badge">Свяжитесь с нами</span>
              <h2 class="smart-tech__title">
                Нужна помощь в выборе?
              </h2>
              <p class="smart-tech__description">
                Наши специалисты помогут подобрать оптимальную модель
                минитрактора для ваших задач и бюджета.
              </p>
              <div style="display: flex; gap: 16px;">
                <a href="/contacts" data-link class="btn btn-primary">
                  Получить консультацию
                </a>
                <a href="tel:+78001234567" class="btn btn-secondary">
                  Позвонить сейчас
                </a>
              </div>
            </div>
            <div class="smart-tech__image">
              <img src="/images/hero-tractor-premium.jpg" alt="DONGFENG Минитрактор" loading="lazy">
            </div>
          </div>
        </section>
      `;
    } catch (error) {
      console.error('Error loading home page:', error);
      return '<div>Ошибка загрузки данных</div>';
    }
  },

  /**
   * Инициализация после рендера
   */
  afterRender() {
    console.log('Home page rendered');
  }
};
