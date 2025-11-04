/**
 * Figma API Utilities
 *
 * Набор утилит для работы с Figma REST API и обработки дизайн-токенов
 */

import fetch from 'node-fetch';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import config from '../../figma.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// ============================================================================
// API CLIENT
// ============================================================================

/**
 * Создаёт HTTP клиент для Figma API
 */
export class FigmaClient {
  constructor(token = config.token) {
    this.token = token;
    this.baseUrl = config.api.baseUrl;
    this.timeout = config.api.timeout;
    this.retries = config.api.retries;
  }

  /**
   * Выполняет GET запрос к Figma API с повторными попытками
   */
  async get(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    let lastError;

    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'X-Figma-Token': this.token,
            'Content-Type': 'application/json',
            ...options.headers
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(
            `Figma API error: ${response.status} ${response.statusText}. ${error.err || error.message || ''}`
          );
        }

        return await response.json();
      } catch (error) {
        lastError = error;
        if (attempt < this.retries) {
          log.warn(`Попытка ${attempt} не удалась, повтор через 2 сек...`);
          await sleep(2000);
        }
      }
    }

    throw lastError;
  }

  /**
   * Получает информацию о файле
   */
  async getFile(fileId, options = {}) {
    const params = new URLSearchParams();
    if (options.version) params.append('version', options.version);
    if (options.ids) params.append('ids', options.ids);
    if (options.depth) params.append('depth', options.depth);
    if (options.geometry) params.append('geometry', options.geometry);
    if (options.plugin_data) params.append('plugin_data', options.plugin_data);
    if (options.branch_data) params.append('branch_data', options.branch_data);

    const query = params.toString();
    return this.get(`/files/${fileId}${query ? '?' + query : ''}`);
  }

  /**
   * Получает Figma Variables (новый API для дизайн-токенов)
   */
  async getFileVariables(fileId) {
    return this.get(`/files/${fileId}/variables/local`);
  }

  /**
   * Получает стили файла (colors, text, effects, etc.)
   */
  async getFileStyles(fileId) {
    const fileData = await this.getFile(fileId);
    return fileData.styles || {};
  }

  /**
   * Получает информацию о компонентах файла
   */
  async getFileComponents(fileId) {
    return this.get(`/files/${fileId}/components`);
  }

  /**
   * Получает ссылки на изображения для экспорта
   */
  async getImageUrls(fileId, nodeIds, options = {}) {
    const params = new URLSearchParams({
      ids: nodeIds.join(','),
      format: options.format || 'png',
      scale: options.scale || '2'
    });

    if (options.svg_include_id) params.append('svg_include_id', 'true');
    if (options.svg_simplify_stroke) params.append('svg_simplify_stroke', 'true');

    return this.get(`/images/${fileId}?${params.toString()}`);
  }
}

// ============================================================================
// LOGGING
// ============================================================================

export const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✓'), msg),
  warn: (msg) => console.log(chalk.yellow('⚠'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  debug: (msg) => {
    if (config.logging.level === 'verbose') {
      console.log(chalk.gray('→'), msg);
    }
  }
};

// ============================================================================
// FILE OPERATIONS
// ============================================================================

/**
 * Читает файл с автоматическим парсингом JSON
 */
export async function readFile(filePath, parseJson = false) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return parseJson ? JSON.parse(content) : content;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Файл не найден: ${filePath}`);
    }
    throw error;
  }
}

/**
 * Записывает файл с автоматическим stringify для JSON
 */
export async function writeFile(filePath, content, options = {}) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });

  const data = typeof content === 'object' && !Buffer.isBuffer(content)
    ? JSON.stringify(content, null, 2)
    : content;

  await fs.writeFile(filePath, data, 'utf-8');

  if (options.log !== false) {
    log.success(`Файл сохранён: ${filePath}`);
  }
}

/**
 * Создаёт резервную копию файла
 */
export async function createBackup(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = path.basename(filePath);
  const backupDir = path.resolve(PROJECT_ROOT, config.paths.backupDir);
  const backupPath = path.join(backupDir, `${fileName}.${timestamp}.backup`);

  await fs.mkdir(backupDir, { recursive: true });
  await fs.copyFile(filePath, backupPath);

  log.info(`Создан бэкап: ${backupPath}`);
  return backupPath;
}

// ============================================================================
// CSS PARSING
// ============================================================================

/**
 * Парсит CSS переменные из файла
 * Возвращает Map с именами переменных и их значениями
 */
export async function parseCssVariables(cssFilePath) {
  const cssContent = await readFile(cssFilePath);
  const variables = new Map();

  // Regex для поиска CSS custom properties
  const varRegex = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let match;

  while ((match = varRegex.exec(cssContent)) !== null) {
    const [, name, value] = match;
    variables.set(name.trim(), value.trim());
  }

  log.debug(`Найдено ${variables.size} CSS переменных`);
  return variables;
}

/**
 * Определяет тип CSS переменной по её значению
 */
export function detectVariableType(value) {
  // Color
  if (/^#[0-9a-f]{3,8}$/i.test(value)) return 'color';
  if (/^rgb(a)?\(/i.test(value)) return 'color';
  if (/^hsl(a)?\(/i.test(value)) return 'color';

  // Gradient
  if (/gradient\(/i.test(value)) return 'gradient';

  // Shadow
  if (/^\d+px\s+\d+px/.test(value)) return 'shadow';

  // Number with unit
  if (/^[\d.]+(?:px|rem|em|%|vh|vw|vmin|vmax)$/.test(value)) return 'dimension';

  // Pure number
  if (/^\d+(?:\.\d+)?$/.test(value)) return 'number';

  // Font family
  if (/['"]/. test(value) && /,/.test(value)) return 'fontFamily';

  // Default
  return 'string';
}

/**
 * Группирует CSS переменные по префиксам согласно конфигурации
 */
export function groupVariablesByMapping(variables) {
  const groups = {};

  for (const [name, value] of variables) {
    let grouped = false;

    for (const [groupName, mappingConfig] of Object.entries(config.tokenMapping)) {
      if (name.startsWith(mappingConfig.prefix)) {
        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        groups[groupName].push({
          name,
          value,
          type: detectVariableType(value),
          collection: mappingConfig.figmaCollection
        });
        grouped = true;
        break;
      }
    }

    if (!grouped) {
      if (!groups['other']) {
        groups['other'] = [];
      }
      groups['other'].push({
        name,
        value,
        type: detectVariableType(value)
      });
    }
  }

  return groups;
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Конвертирует HEX цвет в RGB объект
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
  if (!result) return null;

  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
    a: result[4] ? parseInt(result[4], 16) / 255 : 1
  };
}

/**
 * Конвертирует RGB объект в HEX строку
 */
export function rgbToHex(r, g, b, a) {
  const toHex = (n) => {
    const val = Math.round(n * 255);
    const hex = val.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  return a !== undefined && a < 1 ? hex + toHex(a) : hex;
}

/**
 * Вычисляет контрастность между двумя цветами (WCAG)
 */
export function calculateContrast(color1Hex, color2Hex) {
  const getLuminance = (hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(color1Hex);
  const lum2 = getLuminance(color2Hex);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

// ============================================================================
// FIGMA DATA TRANSFORMATION
// ============================================================================

/**
 * Конвертирует Figma Color в CSS цвет
 */
export function figmaColorToCss(figmaColor) {
  const { r, g, b, a = 1 } = figmaColor;

  if (a === 1) {
    return rgbToHex(r, g, b);
  }

  // RGBA for transparency
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
}

/**
 * Конвертирует CSS цвет в Figma Color объект
 */
export function cssColorToFigma(cssColor) {
  // HEX
  if (cssColor.startsWith('#')) {
    return hexToRgb(cssColor);
  }

  // RGB/RGBA
  const rgbaMatch = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]) / 255,
      g: parseInt(rgbaMatch[2]) / 255,
      b: parseInt(rgbaMatch[3]) / 255,
      a: rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1
    };
  }

  return null;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Sleep utility
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Получает абсолютный путь от корня проекта
 */
export function resolvePath(relativePath) {
  return path.resolve(PROJECT_ROOT, relativePath);
}

/**
 * Проверяет, существует ли файл или директория
 */
export async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Форматирует JSON с красивым выводом
 */
export function prettyJson(obj) {
  return JSON.stringify(obj, null, 2);
}

/**
 * Создаёт timestamp для логов
 */
export function timestamp() {
  return new Date().toISOString();
}

/**
 * Безопасно получает вложенное свойство объекта
 */
export function getNestedProperty(obj, path) {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

export default {
  FigmaClient,
  log,
  readFile,
  writeFile,
  createBackup,
  parseCssVariables,
  detectVariableType,
  groupVariablesByMapping,
  hexToRgb,
  rgbToHex,
  calculateContrast,
  figmaColorToCss,
  cssColorToFigma,
  sleep,
  resolvePath,
  pathExists,
  prettyJson,
  timestamp,
  getNestedProperty
};
