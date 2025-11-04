/**
 * Figma Design System Integration Configuration
 *
 * Конфигурация для синхронизации дизайн-токенов между Figma и CSS
 */

import { config } from 'dotenv';
config();

export default {
  // Figma File Configuration
  figmaFileId: process.env.FIGMA_FILE_ID || '',
  token: process.env.FIGMA_ACCESS_TOKEN || '',

  // API Settings
  api: {
    baseUrl: 'https://api.figma.com/v1',
    timeout: 30000,
    retries: 3
  },

  // Маппинг между Figma Variables и CSS переменными
  tokenMapping: {
    colors: {
      prefix: '--color-',
      figmaCollection: 'Colors',
      description: 'Основные цвета дизайн-системы'
    },
    brand: {
      prefix: '--brand-',
      figmaCollection: 'Brand Colors',
      description: 'Брендовые цвета DONGFENG'
    },
    spacing: {
      prefix: '--space-',
      figmaCollection: 'Spacing',
      description: 'Отступы и размеры'
    },
    typography: {
      prefix: '--font-',
      figmaCollection: 'Typography',
      description: 'Типографика (шрифты, размеры, веса)'
    },
    shadows: {
      prefix: '--shadow-',
      figmaCollection: 'Shadows',
      description: 'Тени и эффекты глубины'
    },
    radius: {
      prefix: '--radius-',
      figmaCollection: 'Border Radius',
      description: 'Радиусы скругления'
    },
    gradients: {
      prefix: '--gradient-',
      figmaCollection: 'Gradients',
      description: 'Градиенты'
    }
  },

  // Правила разрешения конфликтов при синхронизации
  conflictResolution: {
    // 'figma' - приоритет у Figma
    // 'css' - приоритет у CSS файла
    // 'ask' - запрашивать у пользователя
    defaultSource: 'ask',

    // Автоматически разрешать конфликты без запроса
    autoResolve: false,

    // Создавать бэкапы перед синхронизацией
    createBackups: true
  },

  // Пути к файлам
  paths: {
    cssVariables: './frontend/css/variables.css',
    designTokens: './design-tokens/tokens.json',
    backupDir: './design-tokens/backups',
    historyDir: './design-tokens/history',
    componentsDir: './frontend/components',
    iconsDir: './frontend/icons'
  },

  // Настройки генерации компонентов
  components: {
    // Naming convention для CSS классов
    namingConvention: 'BEM', // 'BEM', 'camelCase', 'kebab-case'

    // Использовать существующие CSS переменные
    useExistingVariables: true,

    // Генерировать документацию для компонентов
    generateDocs: true,

    // Форматировать код через Prettier
    formatCode: true,

    // Шаблоны для генерации
    templates: {
      html: './scripts/figma/templates/component.html.ejs',
      css: './scripts/figma/templates/component.css.ejs',
      docs: './scripts/figma/templates/component.md.ejs'
    }
  },

  // Настройки экспорта изображений и иконок
  export: {
    // Формат экспорта иконок
    iconFormat: 'svg',

    // Оптимизировать SVG
    optimizeSvg: true,

    // Масштаб экспорта для растровых изображений
    scale: 2,

    // Формат для изображений компонентов (preview)
    imageFormat: 'png'
  },

  // Валидация токенов
  validation: {
    // Проверять контрастность цветов (WCAG)
    checkContrast: true,

    // Минимальный контраст для текста
    minContrastText: 4.5,

    // Минимальный контраст для UI элементов
    minContrastUI: 3,

    // Предупреждать о дубликатах значений
    warnDuplicates: true,

    // Проверять naming convention
    validateNaming: true
  },

  // Логирование и отчёты
  logging: {
    // Уровень логирования: 'silent', 'error', 'warn', 'info', 'verbose'
    level: 'info',

    // Сохранять логи в файл
    saveToFile: true,

    // Путь к файлу логов
    logFile: './design-tokens/history/sync.log',

    // Генерировать детальные отчёты о синхронизации
    generateReports: true
  },

  // Исключения - токены, которые не нужно синхронизировать
  exclude: {
    patterns: [
      '--z-*', // z-index значения могут отличаться
      '--transition-*', // transitions могут настраиваться отдельно
    ],
    exact: [
      '--header-height',
      '--header-scrolled-shadow'
    ]
  },

  // Experimental features
  experimental: {
    // Использовать Figma Variables API (новый API)
    useFigmaVariables: true,

    // Синхронизировать Component Properties
    syncComponentProperties: true,

    // AI-enhanced code generation через Claude
    aiCodeEnhancement: true
  }
};
