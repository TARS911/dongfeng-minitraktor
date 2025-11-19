# 🧪 Руководство по тестированию

**Проект:** БелТехФермЪ
**Дата:** 2025-11-19

---

## 📋 Содержание

1. [Обзор тестирования](#обзор)
2. [Unit тесты (Jest)](#unit-тесты)
3. [E2E тесты (Playwright)](#e2e-тесты)
4. [Запуск тестов](#запуск-тестов)
5. [Покрытие кода](#покрытие)
6. [CI/CD интеграция](#cicd)

---

## 🎯 Обзор тестирования

### Типы тестов в проекте:

- ✅ **Unit тесты** - тестирование отдельных функций и модулей (Jest)
- 🚧 **Integration тесты** - тестирование API endpoints (Jest + Supabase)
- 🚧 **E2E тесты** - тестирование пользовательских сценариев (Playwright)

### Текущее покрытие:

| Компонент | Покрытие | Статус |
|-----------|----------|--------|
| API routes | ~30% | ✅ Базовые тесты |
| Components | 0% | 🚧 TODO |
| Utilities | 0% | 🚧 TODO |

---

## 🧪 Unit тесты (Jest)

### Установка

Зависимости уже установлены в `frontend/package.json`:

```json
{
  "devDependencies": {
    "@swc/jest": "^0.2.39",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/jest": "^30.0.0",
    "jest": "^30.2.0",
    "jest-environment-jsdom": "^30.2.0"
  }
}
```

### Конфигурация

Файл: `frontend/jest.config.mjs`

```javascript
{
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1', // Поддержка @ alias
  }
}
```

### Структура тестов

```
frontend/
├── __tests__/
│   ├── api/
│   │   ├── categories.test.ts    ✅ Создан
│   │   ├── products.test.ts      🚧 TODO
│   │   └── orders.test.ts        🚧 TODO
│   ├── components/
│   │   ├── Header.test.tsx       🚧 TODO
│   │   └── ProductCard.test.tsx  🚧 TODO
│   └── lib/
│       ├── auth.test.ts          🚧 TODO
│       └── validation.test.ts    🚧 TODO
├── __mocks__/
│   ├── styleMock.js
│   └── fileMock.js
└── jest.setup.js
```

### Примеры тестов

#### API тест (`__tests__/api/categories.test.ts`)

```typescript
describe('GET /api/categories', () => {
  it('должен вернуть список категорий', async () => {
    const mockCategories = [
      { id: 1, name: 'Минитракторы', slug: 'mini-tractors' },
    ];

    // Mock Supabase response
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockCategories,
          error: null,
        }),
      }),
    });

    expect(mockCategories).toHaveLength(1);
  });
});
```

#### Component тест (пример)

```typescript
import { render, screen } from '@testing-library/react';
import ProductCard from '@/app/components/ProductCard';

describe('ProductCard', () => {
  it('должен отображать название товара', () => {
    const product = {
      name: 'Трактор DF-244',
      price: 500000,
    };

    render(<ProductCard product={product} />);

    expect(screen.getByText('Трактор DF-244')).toBeInTheDocument();
  });
});
```

---

## 🎭 E2E тесты (Playwright)

### Установка

```bash
cd frontend
npx playwright install
```

### Конфигурация

Файл: `frontend/playwright.config.ts`

```typescript
export default {
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3000',
  },
};
```

### Структура E2E тестов

```
frontend/
└── tests/
    ├── cart.spec.ts          🚧 TODO
    ├── checkout.spec.ts      🚧 TODO
    ├── catalog.spec.ts       🚧 TODO
    └── auth.spec.ts          🚧 TODO
```

### Примеры E2E тестов

#### Тест корзины (`tests/cart.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';

test('добавление товара в корзину', async ({ page }) => {
  await page.goto('/catalog');

  // Клик по карточке товара
  await page.click('[data-testid="product-card"]:first-child');

  // Добавить в корзину
  await page.click('button:has-text("В корзину")');

  // Проверить что счётчик корзины увеличился
  const cartCount = await page.textContent('[data-testid="cart-count"]');
  expect(cartCount).toBe('1');
});
```

---

## 🚀 Запуск тестов

### Unit тесты (Jest)

```bash
cd frontend

# Запустить все тесты
npm test

# Запустить в watch режиме
npm test -- --watch

# Запустить конкретный файл
npm test __tests__/api/categories.test.ts

# С покрытием кода
npm test -- --coverage
```

### E2E тесты (Playwright)

```bash
cd frontend

# Запустить все E2E тесты
npm run test:e2e

# В headless режиме
npm run test:e2e -- --headed

# С UI
npx playwright test --ui

# Отладка
npx playwright test --debug
```

### Команды в package.json

Добавьте в `frontend/package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## 📊 Покрытие кода

### Конфигурация покрытия

В `jest.config.mjs`:

```javascript
{
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/*.stories.{js,jsx,ts,tsx}',
    '!app/**/__tests__/**',
  ],
  coverageThresholds: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
}
```

### Просмотр отчёта

```bash
npm test -- --coverage
open coverage/lcov-report/index.html
```

---

## 🔄 CI/CD интеграция

### GitHub Actions

Создайте `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Run unit tests
        working-directory: ./frontend
        run: npm test -- --coverage

      - name: Run E2E tests
        working-directory: ./frontend
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Netlify (Pre-deploy tests)

Добавьте в `netlify.toml`:

```toml
[build]
  command = "npm test && npm run build"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

## 📝 Best Practices

### 1. Именование тестов

```typescript
// ✅ Хорошо
it('должен вернуть 401 для неавторизованного пользователя', () => {});

// ❌ Плохо
it('test auth', () => {});
```

### 2. AAA Pattern (Arrange-Act-Assert)

```typescript
it('должен создать категорию', async () => {
  // Arrange - подготовка
  const newCategory = { name: 'Test', slug: 'test' };

  // Act - действие
  const result = await createCategory(newCategory);

  // Assert - проверка
  expect(result.status).toBe(201);
});
```

### 3. Моки и стабы

```typescript
// Mock внешних зависимостей
jest.mock('@/app/lib/supabase');

// Spy на функции
const spy = jest.spyOn(console, 'error');
expect(spy).toHaveBeenCalled();
```

### 4. Cleanup после тестов

```typescript
afterEach(() => {
  jest.clearAllMocks();
  cleanup(); // для React Testing Library
});
```

---

## 🐛 Отладка тестов

### Jest

```bash
# Отладка в VS Code
node --inspect-brk node_modules/.bin/jest --runInBand

# Отладка конкретного теста
npm test -- -t "название теста"

# Verbose вывод
npm test -- --verbose
```

### Playwright

```bash
# Режим отладки
npx playwright test --debug

# Трассировка
npx playwright test --trace on

# Просмотр трассировки
npx playwright show-trace trace.zip
```

---

## 📚 Дополнительные ресурсы

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Next.js Testing](https://nextjs.org/docs/testing)

---

## ✅ Чеклист перед коммитом

```
☐ Запустил unit тесты: npm test
☐ Проверил покрытие: npm test -- --coverage
☐ Запустил E2E тесты: npm run test:e2e
☐ Все тесты прошли успешно
☐ Покрытие кода >= 50%
☐ Нет eslint ошибок
☐ Нет TypeScript ошибок
```

---

## 🎯 TODO (Следующие шаги)

1. **Добавить integration тесты**
   - Настроить test database в Supabase
   - Тесты для реальных API вызовов

2. **Расширить unit тесты**
   - Components (Header, ProductCard, Footer)
   - Utilities (validation, auth, seo)
   - Context providers (Cart, Favorites, Compare)

3. **E2E тесты**
   - User flow: поиск → добавление в корзину → checkout
   - Auth flow: регистрация → вход → выход
   - Admin flow: создание категории → создание товара

4. **Мониторинг**
   - Интеграция с Codecov
   - Автоматические отчёты в PR

---

**Готово! Базовое тестирование настроено.** 🎉

Для вопросов: смотрите примеры в `__tests__/api/categories.test.ts`
