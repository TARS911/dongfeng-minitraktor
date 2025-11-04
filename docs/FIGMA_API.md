# Figma Integration API Reference

Полная документация по API интеграции Figma с проектом DONGFENG.

## Установка

```bash
npm install
```

Все зависимости уже включены в `package.json`.

## Конфигурация

### Переменные окружения

Создайте `.env` в корне проекта:

```env
FIGMA_ACCESS_TOKEN=figd_your_token_here
FIGMA_FILE_ID=your_file_id_here
```

### figma.config.js

Основной конфигурационный файл в корне проекта. См. комментарии в файле для деталей.

## CLI Commands

### npm run figma:setup

Интерактивный мастер настройки. Проводит через все шаги:
1. Ввод Figma токена
2. Ввод File ID
3. Проверка подключения
4. Сохранение конфигурации

```bash
npm run figma:setup
```

### npm run figma:test

Проверяет подключение к Figma API и валидность токена.

```bash
npm run figma:test
```

**Выход:**
- ✓ Токен валиден
- ✓ Файл найден
- ✓ Variables доступны (если есть)

### npm run figma:pull

Извлекает дизайн-токены из Figma Variables/Styles и конвертирует в CSS.

```bash
npm run figma:pull
```

**Что делает:**
1. Подключается к Figma API
2. Получает Variables и Styles из файла
3. Конвертирует в CSS custom properties
4. Сохраняет в `design-tokens/tokens.json`

**Примечание:** Полная автоматическая запись в `variables.css` в разработке.

### npm run figma:push

Загружает CSS переменные в Figma Variables (через Plugin API).

```bash
npm run figma:push
```

**Статус:** MVP version. Экспортирует токены в JSON для ручного импорта.

**Что делает:**
1. Парсит `frontend/css/variables.css`
2. Группирует токены по категориям
3. Сохраняет в `design-tokens/tokens.json`

### npm run figma:sync

Умная двусторонняя синхронизация с разрешением конфликтов.

```bash
npm run figma:sync
```

**Интерактивный режим:**
- Сравнивает Figma и CSS
- Предлагает выбрать источник при конфликтах
- Применяет изменения

### npm run figma:components:list

Получает список всех компонентов из Figma файла.

```bash
npm run figma:components:list
```

**Выход:**
```
📦 Список компонентов Figma...

Buttons:
  • Button/Primary
    ID: 123:456
  • Button/Secondary
    ID: 123:457

Cards:
  • Card/Product
    ID: 124:458
```

### npm run figma:components:generate

Генерирует HTML/CSS код из Figma компонента.

```bash
npm run figma:components:generate
```

**Статус:** Planned feature

## JavaScript API

### FigmaClient

Класс для работы с Figma REST API.

```javascript
import { FigmaClient } from './scripts/figma/utils.js';

const client = new FigmaClient(token);

// Получить файл
const fileData = await client.getFile(fileId);

// Получить Variables
const variables = await client.getFileVariables(fileId);

// Получить компоненты
const components = await client.getFileComponents(fileId);

// Экспорт изображений
const imageUrls = await client.getImageUrls(fileId, nodeIds, {
  format: 'png',
  scale: 2
});
```

### Утилиты

```javascript
import {
  parseCssVariables,
  groupVariablesByMapping,
  hexToRgb,
  rgbToHex,
  figmaColorToCss,
  cssColorToFigma,
  calculateContrast
} from './scripts/figma/utils.js';

// Парсинг CSS
const variables = await parseCssVariables('./frontend/css/variables.css');
// Map<string, string>

// Группировка
const grouped = groupVariablesByMapping(variables);
// { colors: [...], spacing: [...], ... }

// Конвертация цветов
const rgb = hexToRgb('#2a9d4e');
// { r: 0.164, g: 0.616, b: 0.306, a: 1 }

const hex = rgbToHex(0.164, 0.616, 0.306);
// "#2a9d4e"

// Figma <-> CSS
const cssColor = figmaColorToCss({ r: 0.164, g: 0.616, b: 0.306, a: 1 });
// "#2a9d4e"

const figmaColor = cssColorToFigma("#2a9d4e");
// { r: 0.164, g: 0.616, b: 0.306, a: 1 }

// WCAG контраст
const contrast = calculateContrast('#2a9d4e', '#ffffff');
// 4.52 (проходит AA для обычного текста)
```

## Figma REST API Endpoints

Используемые эндпоинты:

### GET /v1/files/:file_id

Получает полную информацию о файле.

**Параметры:**
- `version` - конкретная версия
- `ids` - конкретные node IDs
- `depth` - глубина дерева (default: infinity)

### GET /v1/files/:file_id/variables/local

Получает Variables (дизайн-токены) из файла.

**Требования:**
- Figma Professional plan
- Variables API доступен с 2024 года

### GET /v1/files/:file_id/components

Получает метаданные всех компонентов.

### GET /v1/images/:file_id

Экспортирует nodes как изображения.

**Параметры:**
- `ids` - comma-separated node IDs
- `format` - png, jpg, svg, pdf
- `scale` - 1, 2, 4

## Структура данных

### Figma Variable (из Variables API)

```javascript
{
  id: "VariableID:123",
  name: "Brand/Primary",
  resolvedType: "COLOR", // or "FLOAT", "STRING", "BOOLEAN"
  valuesByMode: {
    "modeId": {
      r: 0.164,
      g: 0.616,
      b: 0.306,
      a: 1
    }
  },
  variableCollectionId: "VariableCollectionID:456"
}
```

### CSS Token (наш формат)

```javascript
{
  name: "--brand-primary",
  value: "#2a9d4e",
  type: "color",
  collection: "Brand Colors"
}
```

## Конфигурация

### tokenMapping

Определяет соответствие между префиксами CSS и Figma коллекциями:

```javascript
tokenMapping: {
  colors: {
    prefix: '--color-',
    figmaCollection: 'Colors'
  },
  brand: {
    prefix: '--brand-',
    figmaCollection: 'Brand Colors'
  },
  // ...
}
```

### conflictResolution

Правила разрешения конфликтов:

```javascript
conflictResolution: {
  defaultSource: 'ask',  // 'figma', 'css', 'ask'
  autoResolve: false,
  createBackups: true
}
```

### validation

Настройки валидации токенов:

```javascript
validation: {
  checkContrast: true,
  minContrastText: 4.5,    // WCAG AA
  minContrastUI: 3.0,      // WCAG AA
  warnDuplicates: true,
  validateNaming: true
}
```

## GitHub Actions

### Secrets

Добавьте в Settings → Secrets:

- `FIGMA_ACCESS_TOKEN` - ваш Figma token
- `FIGMA_FILE_ID` - ID файла дизайн-системы

### Workflows

**figma-sync-check.yml** - проверка PR с изменениями CSS:
- Запускается при PR с изменениями в `variables.css`
- Проверяет синхронизацию с Figma
- Добавляет комментарий в PR

**figma-auto-sync.yml** - автоматическая синхронизация:
- Запускается ежедневно в 2:00 UTC
- Извлекает токены из Figma
- Создаёт PR при наличии изменений

## Примеры использования

### Пример 1: Получить все цвета из Figma

```javascript
import { FigmaClient, figmaColorToCss } from './scripts/figma/utils.js';
import config from './figma.config.js';

const client = new FigmaClient();
const variables = await client.getFileVariables(config.figmaFileId);

const colors = Object.values(variables.meta.variables)
  .filter(v => v.resolvedType === 'COLOR')
  .map(v => ({
    name: v.name,
    css: figmaColorToCss(v.valuesByMode[Object.keys(v.valuesByMode)[0]])
  }));

console.log(colors);
// [{ name: "Brand/Primary", css: "#2a9d4e" }, ...]
```

### Пример 2: Валидация контрастности

```javascript
import { parseCssVariables, calculateContrast } from './scripts/figma/utils.js';

const variables = await parseCssVariables('./frontend/css/variables.css');

const primaryColor = variables.get('--brand-primary');
const backgroundColor = variables.get('--color-white');

const contrast = calculateContrast(primaryColor, backgroundColor);

if (contrast < 4.5) {
  console.error(`Low contrast: ${contrast.toFixed(2)} (minimum: 4.5)`);
} else {
  console.log(`✓ Contrast OK: ${contrast.toFixed(2)}`);
}
```

### Пример 3: Экспорт всех компонентов

```javascript
const client = new FigmaClient();
const { meta } = await client.getFileComponents(config.figmaFileId);

// Получить превью изображения каждого компонента
const nodeIds = meta.components.map(c => c.node_id);
const imageData = await client.getImageUrls(config.figmaFileId, nodeIds, {
  format: 'png',
  scale: 2
});

for (const [nodeId, url] of Object.entries(imageData.images)) {
  console.log(`${nodeId}: ${url}`);
}
```

## Ограничения и TODO

### Текущие ограничения:

1. **CSS → Figma** требует Figma Plugin API (REST API read-only для Variables)
2. **Автоматическая запись в variables.css** требует сохранения структуры и комментариев
3. **Генерация компонентов** - базовая реализация, требует доработки
4. **Gradients** - сложная конвертация Figma → CSS

### Roadmap:

- [ ] Figma Plugin для импорта CSS токенов
- [ ] Полная автоматическая запись в variables.css
- [ ] AI-enhanced генерация компонентов через Claude MCP
- [ ] Поддержка градиентов
- [ ] Экспорт/импорт иконок
- [ ] Storybook интеграция
- [ ] Webhooks для real-time синхронизации

## Troubleshooting

### 403 Forbidden

- Проверьте токен в .env
- Убедитесь, что токен имеет нужные scopes
- Проверьте доступ к файлу (public/private/team)

### Variables API недоступен

- Требуется Figma Professional plan
- Используйте Styles вместо Variables
- Обновите Figma до последней версии

### Медленная синхронизация

- Большие файлы требуют времени
- Используйте `depth` параметр для ограничения
- Кэшируйте результаты локально

## Полезные ссылки

- [Figma REST API](https://www.figma.com/developers/api)
- [Figma Variables](https://help.figma.com/hc/en-us/articles/15339657135383)
- [Design Tokens Community](https://designtokens.org/)
- [WCAG Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
