# Структура Figma файла "DONGFENG Design System"

## Рекомендуемая организация

### 📄 Страницы (Pages)

#### 1. 🎨 Design Tokens
Все дизайн-токены в виде Variables или Styles

**Variables Collections:**
- **Colors** - цвета
  - Brand (Primary, Accent, Secondary)
  - Neutral (Grays, Black, White)
  - Semantic (Success, Warning, Error, Info)
- **Typography** - типографика
  - Font Families
  - Font Sizes (xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, hero)
  - Font Weights (light, regular, medium, semibold, bold)
  - Line Heights (tight, snug, normal, relaxed, loose)
- **Spacing** - отступы
  - xs: 4px
  - sm: 8px
  - md: 16px
  - lg: 24px
  - xl: 32px
  - 2xl: 48px
  - 3xl: 64px
  - 4xl: 96px
  - 5xl: 128px
- **Effects** - эффекты
  - Shadows (xs, sm, md, lg, xl, 2xl, 3xl)
  - Border Radius (sm, md, lg, xl, 2xl, 3xl, full)

**Как создать Variables в Figma:**
1. Откройте панель Variables (справа)
2. Нажмите "Create collection"
3. Назовите коллекцию (например, "Colors")
4. Добавьте переменные с соответствующими значениями

#### 2. 🧩 Components
Библиотека компонентов

**Организация:**
```
Components/
├── Buttons/
│   ├── Primary
│   ├── Secondary
│   ├── Accent
│   └── Sizes (Small, Medium, Large)
├── Cards/
│   ├── Product Card
│   ├── Feature Card
│   └── Promo Card
├── Forms/
│   ├── Input
│   ├── Textarea
│   ├── Select
│   ├── Checkbox
│   └── Radio
├── Navigation/
│   ├── Header Desktop
│   ├── Header Mobile
│   ├── Sidebar
│   └── Footer
└── Modals/
    ├── Standard Modal
    ├── Confirmation
    └── Image Lightbox
```

#### 3. 📐 Layouts
Структура страниц

- Grid System (Container, Columns)
- Section Templates
- Responsive Breakpoints Examples

#### 4. 🚜 Product Specific
Специфичные для тракторов компоненты

- Product Card Variants
- Specifications Display
- Filter Panel
- Comparison Table

#### 5. 📱 Mobile Screens
Адаптивные версии

- Key Mobile Layouts
- Mobile Components
- Touch-friendly UI

---

## Импорт существующих токенов

### Из variables.css в Figma

Используйте эти значения для создания Variables:

#### Colors - Brand
```
--brand-primary: #2a9d4e
--brand-primary-dark: #1f7a3c
--brand-primary-light: #4ade80
--brand-accent: #ff6600
--brand-accent-dark: #e65500
--brand-accent-light: #ff8533
--brand-secondary: #1890d7
--brand-secondary-dark: #0b79c0
--brand-gold: #ffb800
--brand-purple: #8b5cf6
```

#### Colors - Neutral
```
--color-white: #ffffff
--color-black: #0a0a0a
--color-gray-50: #fafafa
--color-gray-100: #f5f5f5
--color-gray-200: #e8e8e8
--color-gray-300: #d4d4d4
--color-gray-400: #a3a3a3
--color-gray-500: #737373
--color-gray-600: #525252
--color-gray-700: #404040
--color-gray-800: #262626
--color-gray-900: #171717
```

#### Colors - Semantic
```
--color-success: #22c55e
--color-warning: #f59e0b
--color-error: #ef4444
--color-info: #3b82f6
```

#### Typography - Font Sizes (в px)
```
xs: 13px
sm: 14px
base: 16px
lg: 18px
xl: 20px
2xl: 24px
3xl: 30px
4xl: 36px
5xl: 44px
6xl: 56px
hero: 64px
```

#### Typography - Font Families
```
Primary: "Open Sans"
Heading: "Montserrat"
Mono: "SF Mono"
```

#### Typography - Font Weights
```
light: 300
regular: 400
medium: 500
semibold: 600
bold: 700
extrabold: 800
black: 900
```

#### Spacing (в px)
```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
3xl: 64px
4xl: 96px
5xl: 128px
```

#### Border Radius (в px)
```
sm: 6px
md: 8px
lg: 12px
xl: 16px
2xl: 24px
3xl: 32px
full: 9999px
```

---

## Быстрый старт: Минимальный набор

Если хотите начать быстро, создайте минимум:

### Must Have:
1. **Colors Collection** с 10-15 основными цветами
2. **Spacing Collection** с 9 значениями
3. **Typography - Font Sizes** с основными размерами
4. **1-2 базовых компонента** (Button, Card)

Этого достаточно для тестирования синхронизации!

---

## Полезные плагины Figma

Для ускорения работы с токенами:

1. **Figma Tokens** - импорт/экспорт токенов из JSON
2. **Design Lint** - проверка консистентности
3. **Contrast** - проверка контрастности (WCAG)
4. **Auto Layout** - быстрая настройка компонентов

---

## Пример создания Variables в Figma

### Шаги:

1. **Откройте Variables panel** (справа в интерфейсе)
2. **Создайте Collection**: "Brand Colors"
3. **Добавьте Variables**:
   - Имя: `primary` → Значение: `#2a9d4e`
   - Имя: `accent` → Значение: `#ff6600`
   - Имя: `secondary` → Значение: `#1890d7`
4. **Создайте Collection**: "Spacing"
5. **Добавьте Variables** (тип: Number):
   - Имя: `sm` → Значение: `8`
   - Имя: `md` → Значение: `16`
   - Имя: `lg` → Значение: `24`

---

## После создания файла

1. Скопируйте File ID из URL
2. Запустите: `npm run figma:setup`
3. Введите File ID
4. Проверьте подключение: `npm run figma:test`
5. Извлеките токены: `npm run figma:pull`

---

## Troubleshooting

### Не можете создать Variables?

- Variables доступны только в Figma Professional
- **Альтернатива**: Используйте Color Styles и Text Styles
- Наша интеграция поддерживает оба варианта

### Нет времени создавать всё вручную?

1. Создайте минимум (5-10 цветов, 3-4 spacing)
2. Протестируйте синхронизацию
3. Постепенно добавляйте остальное

---

## Готово!

После создания файла и настройки File ID:
```bash
npm run figma:setup
npm run figma:test
npm run figma:pull
```

И всё заработает! 🎨✨
