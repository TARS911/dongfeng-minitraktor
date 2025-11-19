import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Переходим на главную страницу
    await page.goto('/');
  });

  test('should redirect to cart if cart is empty', async ({ page }) => {
    await page.goto('/checkout');

    // Должны быть перенаправлены на страницу корзины
    await expect(page).toHaveURL('/cart');
  });

  test('should display checkout form with items in cart', async ({ page }) => {
    // Добавляем товар в корзину (симуляция через localStorage)
    await page.evaluate(() => {
      const mockCartItem = {
        id: 1,
        name: 'Тестовый минитрактор',
        price: 350000,
        quantity: 1,
        image_url: '/images/test.jpg'
      };
      localStorage.setItem('cart', JSON.stringify([mockCartItem]));
    });

    // Переходим на страницу checkout
    await page.goto('/checkout');

    // Проверяем что форма отображается
    await expect(page.getByRole('heading', { name: /Оформление заказа/i })).toBeVisible();
    await expect(page.getByLabel(/Имя/i)).toBeVisible();
    await expect(page.getByLabel(/Фамилия/i)).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Телефон/i)).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Добавляем товар в корзину
    await page.evaluate(() => {
      const mockCartItem = {
        id: 1,
        name: 'Тестовый минитрактор',
        price: 350000,
        quantity: 1
      };
      localStorage.setItem('cart', JSON.stringify([mockCartItem]));
    });

    await page.goto('/checkout');

    // Пытаемся отправить пустую форму
    await page.getByRole('button', { name: /Оформить заказ/i }).click();

    // Должны появиться ошибки валидации
    await expect(page.getByText(/Введите имя/i)).toBeVisible();
    await expect(page.getByText(/Введите фамилию/i)).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.evaluate(() => {
      const mockCartItem = {
        id: 1,
        name: 'Тестовый минитрактор',
        price: 350000,
        quantity: 1
      };
      localStorage.setItem('cart', JSON.stringify([mockCartItem]));
    });

    await page.goto('/checkout');

    // Заполняем форму с неверным email
    await page.getByLabel(/Имя/i).fill('Иван');
    await page.getByLabel(/Фамилия/i).fill('Петров');
    await page.getByLabel(/Email/i).fill('invalid-email');
    await page.getByLabel(/Телефон/i).fill('+79001234567');
    await page.getByLabel(/Город/i).fill('Белгород');

    await page.getByRole('button', { name: /Оформить заказ/i }).click();

    // Должна появиться ошибка email
    await expect(page.getByText(/Введите корректный email/i)).toBeVisible();
  });

  test('should validate phone format', async ({ page }) => {
    await page.evaluate(() => {
      const mockCartItem = {
        id: 1,
        name: 'Тестовый минитрактор',
        price: 350000,
        quantity: 1
      };
      localStorage.setItem('cart', JSON.stringify([mockCartItem]));
    });

    await page.goto('/checkout');

    // Заполняем форму с неверным телефоном
    await page.getByLabel(/Имя/i).fill('Иван');
    await page.getByLabel(/Фамилия/i).fill('Петров');
    await page.getByLabel(/Email/i).fill('ivan@example.com');
    await page.getByLabel(/Телефон/i).fill('123'); // Неправильный формат
    await page.getByLabel(/Город/i).fill('Белгород');

    await page.getByRole('button', { name: /Оформить заказ/i }).click();

    // Должна появиться ошибка телефона
    await expect(page.getByText(/Формат.*XXX.*XXX.*XX.*XX/i)).toBeVisible();
  });

  test('should show/hide delivery address based on delivery method', async ({ page }) => {
    await page.evaluate(() => {
      const mockCartItem = {
        id: 1,
        name: 'Тестовый минитрактор',
        price: 350000,
        quantity: 1
      };
      localStorage.setItem('cart', JSON.stringify([mockCartItem]));
    });

    await page.goto('/checkout');

    // По умолчанию должен быть выбран "Доставка"
    const streetField = page.getByLabel(/Улица, дом, квартира/i);
    await expect(streetField).toBeVisible();

    // Переключаем на "Самовывоз"
    await page.getByLabel(/Способ получения/i).selectOption('pickup');

    // Поле адреса должно скрыться
    await expect(streetField).not.toBeVisible();

    // Возвращаем "Доставка"
    await page.getByLabel(/Способ получения/i).selectOption('delivery');
    await expect(streetField).toBeVisible();
  });

  test('should display order summary', async ({ page }) => {
    await page.evaluate(() => {
      const mockCartItems = [
        {
          id: 1,
          name: 'Минитрактор DongFeng DF-180',
          price: 350000,
          quantity: 1
        },
        {
          id: 2,
          name: 'Запчасть - Фильтр',
          price: 1500,
          quantity: 2
        }
      ];
      localStorage.setItem('cart', JSON.stringify(mockCartItems));
    });

    await page.goto('/checkout');

    // Проверяем что отображается сводка заказа
    await expect(page.getByText(/Ваш заказ/i)).toBeVisible();
    await expect(page.getByText(/Минитрактор DongFeng DF-180/i)).toBeVisible();
    await expect(page.getByText(/Запчасть - Фильтр/i)).toBeVisible();

    // Проверяем итоговую сумму (350000 + 1500 * 2 = 353000)
    await expect(page.getByText(/353.*000/)).toBeVisible();
  });
});

test.describe('Checkout Success', () => {
  test('should show success message after order creation', async ({ page, context }) => {
    // Mock успешного ответа от API
    await context.route('/api/orders', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          order: {
            id: 123,
            orderNumber: 'ORD-000123',
            totalAmount: 350000,
            status: 'pending'
          }
        })
      });
    });

    // Добавляем товар в корзину
    await page.evaluate(() => {
      const mockCartItem = {
        id: 1,
        name: 'Тестовый минитрактор',
        price: 350000,
        quantity: 1
      };
      localStorage.setItem('cart', JSON.stringify([mockCartItem]));
    });

    await page.goto('/checkout');

    // Заполняем форму корректными данными
    await page.getByLabel(/Имя/i).fill('Иван');
    await page.getByLabel(/Фамилия/i).fill('Петров');
    await page.getByLabel(/Email/i).fill('ivan@example.com');
    await page.getByLabel(/Телефон/i).fill('+79001234567');
    await page.getByLabel(/Город/i).fill('Белгород');
    await page.getByLabel(/Регион/i).fill('Белгородская область');
    await page.getByLabel(/Улица, дом, квартира/i).fill('ул. Ленина, 10');

    // Отправляем форму
    await page.getByRole('button', { name: /Оформить заказ/i }).click();

    // Ждем сообщения об успехе
    await expect(page.getByText(/Заказ успешно оформлен/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/ORD-000123/i)).toBeVisible();

    // Проверяем что корзина очищена
    const cartEmpty = await page.evaluate(() => {
      const cart = localStorage.getItem('cart');
      return !cart || JSON.parse(cart).length === 0;
    });
    expect(cartEmpty).toBeTruthy();
  });
});
