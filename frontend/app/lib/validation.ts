/**
 * Утилиты для валидации и санитизации пользовательского ввода
 * Защита от XSS, SQL injection и других атак
 */

/**
 * Санитизация строки - удаление опасных символов
 * @param input - Пользовательский ввод
 * @returns Очищенная строка
 */
export function sanitizeString(input: string): string {
  if (!input) return "";

  return input
    .trim()
    .replace(/[<>]/g, "") // Удаляем < и >
    .replace(/javascript:/gi, "") // Удаляем javascript:
    .replace(/on\w+\s*=/gi, "") // Удаляем onclick=, onload= и т.д.
    .substring(0, 1000); // Ограничиваем длину
}

/**
 * Валидация email адреса
 * @param email - Email для проверки
 * @returns true если email валидный
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Валидация номера телефона (российский формат)
 * @param phone - Номер телефона
 * @returns true если номер валидный
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+7|8)?[\s-]?\(?[489]\d{2}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;
  return phoneRegex.test(phone);
}

/**
 * Валидация поискового запроса
 * @param query - Поисковый запрос
 * @returns Очищенный запрос или null если невалидный
 */
export function validateSearchQuery(query: string): string | null {
  if (!query || typeof query !== "string") return null;

  const sanitized = sanitizeString(query);

  // Минимум 1 символ, максимум 100
  if (sanitized.length < 1 || sanitized.length > 100) return null;

  return sanitized;
}

/**
 * Валидация числового ID
 * @param id - ID для проверки
 * @returns true если ID валидный
 */
export function validateId(id: any): boolean {
  const numId = Number(id);
  return Number.isInteger(numId) && numId > 0 && numId < 2147483647;
}

/**
 * Валидация количества товара
 * @param quantity - Количество
 * @returns true если количество валидное
 */
export function validateQuantity(quantity: any): boolean {
  const num = Number(quantity);
  return Number.isInteger(num) && num >= 1 && num <= 9999;
}

/**
 * Валидация цены
 * @param price - Цена для проверки
 * @returns true если цена валидная
 */
export function validatePrice(price: any): boolean {
  const num = Number(price);
  return !isNaN(num) && num >= 0 && num <= 999999999;
}

/**
 * Экранирование HTML для безопасного отображения
 * @param str - Строка с потенциально опасным HTML
 * @returns Экранированная строка
 */
export function escapeHtml(str: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return str.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Валидация slug (для URL)
 * @param slug - Slug для проверки
 * @returns true если slug валидный
 */
export function validateSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length >= 1 && slug.length <= 200;
}

/**
 * Rate limiting helper - проверка частоты запросов
 * Использует localStorage для отслеживания последнего запроса
 * @param key - Ключ для отслеживания (например, 'search' или 'api')
 * @param limitMs - Минимальное время между запросами в миллисекундах
 * @returns true если запрос разрешён
 */
export function checkRateLimit(key: string, limitMs: number = 1000): boolean {
  if (typeof window === "undefined") return true; // На сервере всегда разрешаем

  const storageKey = `rateLimit_${key}`;
  const lastRequest = localStorage.getItem(storageKey);

  if (lastRequest) {
    const timeSinceLastRequest = Date.now() - parseInt(lastRequest, 10);
    if (timeSinceLastRequest < limitMs) {
      return false; // Слишком частые запросы
    }
  }

  localStorage.setItem(storageKey, Date.now().toString());
  return true;
}

/**
 * Очистка rate limit (для тестов)
 * @param key - Ключ для очистки
 */
export function clearRateLimit(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`rateLimit_${key}`);
}
