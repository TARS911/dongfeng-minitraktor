import { test, expect } from '@playwright/test';

test.describe('Admin Panel - Authentication', () => {
  test('should require authentication for admin pages', async ({ page }) => {
    // Пытаемся зайти на админ панель без авторизации
    await page.goto('/admin/categories');

    // Должны быть перенаправлены на страницу входа или показана ошибка 401
    // (в зависимости от реализации middleware)
    const url = page.url();
    expect(url).toMatch(/\/auth|401|403/);
  });
});

test.describe('Admin Panel - Categories', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock аутентификации (добавляем токен admin)
    await context.addCookies([
      {
        name: 'auth-token',
        value: 'mock-admin-token',
        domain: 'localhost',
        path: '/'
      }
    ]);

    // Mock API ответа для категорий
    await context.route('/api/categories', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            categories: [
              {
                id: 1,
                name: 'Минитракторы',
                slug: 'mini-tractors',
                description: 'Категория минитракторов',
                created_at: '2025-01-01T00:00:00Z',
                updated_at: '2025-01-01T00:00:00Z'
              }
            ]
          })
        });
      }
    });
  });

  test('should display categories list', async ({ page }) => {
    await page.goto('/admin/categories');

    await expect(page.getByRole('heading', { name: /Управление категориями/i })).toBeVisible();
    await expect(page.getByText('Минитракторы')).toBeVisible();
  });

  test('should show add category form', async ({ page }) => {
    await page.goto('/admin/categories');

    // Кликаем на кнопку "Добавить категорию"
    await page.getByRole('button', { name: /Добавить категорию/i }).click();

    // Проверяем что форма появилась
    await expect(page.getByText(/Новая категория/i)).toBeVisible();
    await expect(page.getByLabel(/Название/i)).toBeVisible();
    await expect(page.getByLabel(/Slug/i)).toBeVisible();
  });

  test('should validate category form', async ({ page }) => {
    await page.goto('/admin/categories');

    // Открываем форму
    await page.getByRole('button', { name: /Добавить категорию/i }).click();

    // Пытаемся отправить пустую форму
    await page.getByRole('button', { name: /Создать/i }).click();

    // HTML5 валидация должна сработать (поле required)
    const nameInput = page.getByLabel(/Название.*\*/i);
    const isInvalid = await nameInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBeTruthy();
  });

  test('should create new category', async ({ page, context }) => {
    let categoryCreated = false;

    await context.route('/api/categories', async route => {
      if (route.request().method() === 'POST') {
        categoryCreated = true;
        const body = route.request().postDataJSON();

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            category: {
              id: 2,
              name: body.name,
              slug: body.slug,
              description: body.description,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          })
        });
      } else if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            categories: [
              {
                id: 1,
                name: 'Минитракторы',
                slug: 'mini-tractors',
                created_at: '2025-01-01T00:00:00Z',
                updated_at: '2025-01-01T00:00:00Z'
              }
            ]
          })
        });
      }
    });

    await page.goto('/admin/categories');

    // Открываем форму
    await page.getByRole('button', { name: /Добавить категорию/i }).click();

    // Заполняем форму
    await page.getByLabel(/Название.*\*/i).fill('Запчасти');
    await page.getByLabel(/Slug.*\*/i).fill('parts');
    await page.getByLabel(/Описание/i).fill('Запасные части для техники');

    // Отправляем форму
    await page.getByRole('button', { name: /Создать/i }).click();

    // Ждем alert
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('создана');
      await dialog.accept();
    });

    // Проверяем что API был вызван
    await page.waitForTimeout(500);
    expect(categoryCreated).toBeTruthy();
  });

  test('should edit category', async ({ page, context }) => {
    await context.route('/api/categories/1', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            category: {
              id: 1,
              name: 'Минитракторы обновленные',
              slug: 'mini-tractors',
              created_at: '2025-01-01T00:00:00Z',
              updated_at: new Date().toISOString()
            }
          })
        });
      }
    });

    await page.goto('/admin/categories');

    // Кликаем на кнопку "Редактировать"
    await page.getByRole('button', { name: /Редактировать/i }).click();

    // Изменяем название
    const nameInput = page.getByLabel(/Название/i);
    await nameInput.clear();
    await nameInput.fill('Минитракторы обновленные');

    // Сохраняем
    await page.getByRole('button', { name: /Сохранить/i }).click();

    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('обновлена');
      await dialog.accept();
    });
  });

  test('should delete category with confirmation', async ({ page, context }) => {
    let deleteConfirmed = false;

    await context.route('/api/categories/1', async route => {
      if (route.request().method() === 'DELETE') {
        deleteConfirmed = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      }
    });

    await page.goto('/admin/categories');

    // Обработка confirm диалога
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('Удалить');
      await dialog.accept();
    });

    // Кликаем на кнопку "Удалить"
    await page.getByRole('button', { name: /Удалить/i }).click();

    await page.waitForTimeout(500);
    expect(deleteConfirmed).toBeTruthy();
  });
});

test.describe('Admin Panel - Products', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock аутентификации
    await context.addCookies([
      {
        name: 'auth-token',
        value: 'mock-admin-token',
        domain: 'localhost',
        path: '/'
      }
    ]);

    // Mock API для категорий и товаров
    await context.route('/api/categories', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          categories: [
            { id: 1, name: 'Минитракторы', slug: 'mini-tractors' },
            { id: 2, name: 'Запчасти', slug: 'parts' }
          ]
        })
      });
    });

    await context.route('/api/products', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            products: [
              {
                id: 1,
                name: 'DongFeng DF-180',
                slug: 'dongfeng-180',
                article: 'DF-180',
                price: 350000,
                brand: 'DongFeng',
                category: 'mini-tractors',
                stock_quantity: 5,
                created_at: '2025-01-01T00:00:00Z',
                updated_at: '2025-01-01T00:00:00Z'
              }
            ]
          })
        });
      }
    });
  });

  test('should display products list', async ({ page }) => {
    await page.goto('/admin/products');

    await expect(page.getByRole('heading', { name: /Управление товарами/i })).toBeVisible();
    await expect(page.getByText('DongFeng DF-180')).toBeVisible();
    await expect(page.getByText(/350.*000.*₽/)).toBeVisible();
  });

  test('should filter products by category', async ({ page }) => {
    await page.goto('/admin/products');

    // Выбираем категорию в фильтре
    await page.getByLabel(/Фильтр по категории/i).selectOption('mini-tractors');

    // Проверяем что URL обновился или товары отфильтровались
    await expect(page.getByText('DongFeng DF-180')).toBeVisible();
  });

  test('should search products', async ({ page }) => {
    await page.goto('/admin/products');

    // Ищем по названию
    await page.getByPlaceholder(/Поиск/i).fill('DongFeng');

    // Проверяем что результаты обновились
    await expect(page.getByText('DongFeng DF-180')).toBeVisible();
  });

  test('should show add product form with all fields', async ({ page }) => {
    await page.goto('/admin/products');

    // Открываем форму
    await page.getByRole('button', { name: /Добавить товар/i }).click();

    // Проверяем все поля
    await expect(page.getByLabel(/Название.*\*/i)).toBeVisible();
    await expect(page.getByLabel(/Артикул/i)).toBeVisible();
    await expect(page.getByLabel(/Slug.*\*/i)).toBeVisible();
    await expect(page.getByLabel(/Бренд/i)).toBeVisible();
    await expect(page.getByLabel(/Цена.*\*/i)).toBeVisible();
    await expect(page.getByLabel(/Количество на складе/i)).toBeVisible();
    await expect(page.getByLabel(/Категория.*\*/i)).toBeVisible();
    await expect(page.getByLabel(/Описание/i)).toBeVisible();
  });

  test('should create new product', async ({ page, context }) => {
    let productCreated = false;

    await context.route('/api/products', async route => {
      if (route.request().method() === 'POST') {
        productCreated = true;
        const body = route.request().postDataJSON();

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            product: {
              id: 2,
              ...body,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          })
        });
      }
    });

    await page.goto('/admin/products');

    // Открываем форму
    await page.getByRole('button', { name: /Добавить товар/i }).click();

    // Заполняем форму
    await page.getByLabel(/Название.*\*/i).fill('Новый минитрактор');
    await page.getByLabel(/Slug.*\*/i).fill('new-tractor');
    await page.getByLabel(/Артикул/i).fill('NT-001');
    await page.getByLabel(/Цена.*\*/i).fill('400000');
    await page.getByLabel(/Количество на складе/i).fill('3');
    await page.getByLabel(/Бренд/i).fill('TestBrand');
    await page.getByLabel(/Категория.*\*/i).selectOption('mini-tractors');
    await page.getByLabel(/Описание/i).fill('Описание нового минитрактора');

    // Отправляем форму
    await page.getByRole('button', { name: /Создать товар/i }).click();

    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('создан');
      await dialog.accept();
    });

    await page.waitForTimeout(500);
    expect(productCreated).toBeTruthy();
  });

  test('should show stock status correctly', async ({ page }) => {
    await page.goto('/admin/products');

    // Товар в наличии
    const inStock = page.locator('.product-stock.in-stock').first();
    await expect(inStock).toBeVisible();
    await expect(inStock).toContainText(/В наличии.*5/i);
  });
});
