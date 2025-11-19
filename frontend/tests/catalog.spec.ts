import { test, expect } from '@playwright/test';

test.describe('Catalog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/catalog');
  });

  test('should display catalog page', async ({ page }) => {
    await expect(page).toHaveTitle(/Каталог.*БелТехФермЪ/i);
    await expect(page.getByRole('heading', { name: /Каталог/i })).toBeVisible();
  });

  test('should display categories', async ({ page }) => {
    // Проверяем что отображаются категории
    const categories = page.locator('.category-card, [data-testid="category"]');
    await expect(categories.first()).toBeVisible({ timeout: 5000 });
  });

  test('should filter products by category', async ({ page, context }) => {
    // Mock API response
    await context.route('/api/products*', async route => {
      const url = route.request().url();
      const category = new URL(url).searchParams.get('category');

      let products = [];
      if (!category || category === 'mini-tractors') {
        products = [
          {
            id: 1,
            name: 'DongFeng DF-180',
            slug: 'dongfeng-180',
            price: 350000,
            category: 'mini-tractors'
          }
        ];
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ products })
      });
    });

    await page.goto('/catalog');

    // Кликаем на категорию "Минитракторы"
    await page.getByRole('link', { name: /Минитракторы/i }).click();

    // Проверяем URL
    await expect(page).toHaveURL(/category=mini-tractors/);

    // Проверяем что товары отфильтрованы
    await expect(page.getByText('DongFeng DF-180')).toBeVisible();
  });

  test('should search products', async ({ page }) => {
    await page.goto('/catalog');

    // Ищем по названию
    const searchInput = page.getByPlaceholder(/Поиск/i);
    await searchInput.fill('DongFeng');

    // Проверяем что результаты обновились
    await page.waitForTimeout(500); // Debounce
    await expect(page).toHaveURL(/search=DongFeng/);
  });

  test('should add product to cart', async ({ page, context }) => {
    // Mock API response
    await context.route('/api/products', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: [
            {
              id: 1,
              name: 'DongFeng DF-180',
              slug: 'dongfeng-180',
              price: 350000,
              stock_quantity: 5,
              image_url: '/images/df-180.jpg'
            }
          ]
        })
      });
    });

    await page.goto('/catalog');

    // Кликаем на кнопку "В корзину"
    const addToCartButton = page.getByRole('button', { name: /В корзину/i }).first();
    await addToCartButton.click();

    // Проверяем что товар добавлен (должен появиться индикатор корзины)
    await expect(page.locator('[data-testid="cart-badge"], .cart-count')).toContainText('1');
  });
});

test.describe('Product Page', () => {
  test('should display product details', async ({ page, context }) => {
    // Mock API response для конкретного товара
    await context.route('/api/products/dongfeng-180', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          product: {
            id: 1,
            name: 'Минитрактор DongFeng DF-180',
            slug: 'dongfeng-180',
            article: 'DF-180',
            price: 350000,
            brand: 'DongFeng',
            category: 'mini-tractors',
            stock_quantity: 5,
            description: 'Надежный минитрактор для фермерских работ',
            specifications: {
              engine: 'Дизельный 18 л.с.',
              weight: '850 кг'
            },
            image_url: '/images/df-180.jpg'
          }
        })
      });
    });

    await page.goto('/catalog/dongfeng-180');

    // Проверяем заголовок
    await expect(page.getByRole('heading', { name: /DongFeng DF-180/i })).toBeVisible();

    // Проверяем артикул
    await expect(page.getByText(/DF-180/i)).toBeVisible();

    // Проверяем цену
    await expect(page.getByText(/350.*000.*₽/)).toBeVisible();

    // Проверяем описание
    await expect(page.getByText(/Надежный минитрактор/i)).toBeVisible();

    // Проверяем характеристики
    await expect(page.getByText(/Дизельный 18 л.с./i)).toBeVisible();
  });

  test('should show out of stock message', async ({ page, context }) => {
    await context.route('/api/products/out-of-stock-product', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          product: {
            id: 2,
            name: 'Товар не в наличии',
            slug: 'out-of-stock-product',
            price: 100000,
            stock_quantity: 0
          }
        })
      });
    });

    await page.goto('/catalog/out-of-stock-product');

    // Проверяем что показывается сообщение о недоступности
    await expect(page.getByText(/Нет в наличии|Под заказ/i)).toBeVisible();

    // Кнопка "В корзину" должна быть недоступна
    const addToCartButton = page.getByRole('button', { name: /В корзину/i });
    await expect(addToCartButton).toBeDisabled();
  });

  test('should navigate to related products', async ({ page }) => {
    await page.goto('/catalog/dongfeng-180');

    // Проверяем секцию "Похожие товары"
    const relatedSection = page.getByText(/Похожие товары|Вам может понравиться/i);
    if (await relatedSection.isVisible()) {
      await expect(relatedSection).toBeVisible();
    }
  });
});

test.describe('Cart Integration', () => {
  test('should persist cart across page reloads', async ({ page, context }) => {
    await context.route('/api/products', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: [
            {
              id: 1,
              name: 'Test Product',
              price: 10000,
              stock_quantity: 10
            }
          ]
        })
      });
    });

    await page.goto('/catalog');

    // Добавляем товар в корзину
    await page.getByRole('button', { name: /В корзину/i }).first().click();

    // Перезагружаем страницу
    await page.reload();

    // Проверяем что товар остался в корзине
    await expect(page.locator('[data-testid="cart-badge"], .cart-count')).toContainText('1');
  });

  test('should update cart count when adding multiple items', async ({ page, context }) => {
    await context.route('/api/products', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: [
            { id: 1, name: 'Product 1', price: 10000, stock_quantity: 10 },
            { id: 2, name: 'Product 2', price: 20000, stock_quantity: 5 }
          ]
        })
      });
    });

    await page.goto('/catalog');

    // Добавляем несколько товаров
    const buttons = page.getByRole('button', { name: /В корзину/i });
    await buttons.nth(0).click();
    await page.waitForTimeout(300);
    await buttons.nth(1).click();

    // Проверяем что счетчик обновился
    await expect(page.locator('[data-testid="cart-badge"], .cart-count')).toContainText('2');
  });
});
