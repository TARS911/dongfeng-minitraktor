/**
 * Sentry Error Tracking конфигурация
 * Автоматический мониторинг ошибок в production
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NODE_ENV || "development";

/**
 * Инициализация Sentry (только в production)
 */
export function initSentry() {
  if (SENTRY_DSN && SENTRY_ENVIRONMENT === "production") {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: SENTRY_ENVIRONMENT,

      // Настройки трейсинга для мониторинга производительности
      tracesSampleRate: 0.1, // 10% транзакций для экономии квоты

      // Не отправлять сессии в dev режиме
      debug: false,

      // Игнорируем некритичные ошибки
      ignoreErrors: [
        // Браузерные расширения
        "top.GLOBALS",
        "chrome-extension://",
        "moz-extension://",
        // Сетевые ошибки (часто не наши проблемы)
        "Network request failed",
        "NetworkError",
        // Отмененные пользователем запросы
        "cancelled",
        "AbortError",
      ],

      // Фильтруем breadcrumbs для конфиденциальности
      beforeBreadcrumb(breadcrumb) {
        // Скрываем данные из форм
        if (breadcrumb.category === "ui.input") {
          delete breadcrumb.message;
        }
        return breadcrumb;
      },

      // Обогащаем события дополнительной информацией
      beforeSend(event, hint) {
        // Добавляем информацию о браузере
        if (typeof window !== "undefined") {
          event.contexts = {
            ...event.contexts,
            browser: {
              name: navigator.userAgent,
              version: navigator.appVersion,
            },
          };
        }

        return event;
      },
    });
  }
}

/**
 * Ручное логирование ошибок
 */
export function logError(error: Error, context?: Record<string, any>) {
  if (SENTRY_ENVIRONMENT === "production" && SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    // В dev режиме просто console.error
    console.error("Error:", error, context);
  }
}

/**
 * Логирование кастомных событий
 */
export function logEvent(message: string, level: Sentry.SeverityLevel = "info", data?: Record<string, any>) {
  if (SENTRY_ENVIRONMENT === "production" && SENTRY_DSN) {
    Sentry.captureMessage(message, {
      level,
      extra: data,
    });
  } else {
    console.log(`[${level}] ${message}`, data);
  }
}

/**
 * Установка пользовательского контекста
 */
export function setUserContext(user: { id: string; email?: string; name?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
  });
}

/**
 * Очистка пользовательского контекста (при logout)
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Добавление тегов для группировки ошибок
 */
export function addTag(key: string, value: string) {
  Sentry.setTag(key, value);
}

/**
 * Установка контекста для конкретной части приложения
 */
export function setContext(name: string, context: Record<string, any>) {
  Sentry.setContext(name, context);
}

/**
 * Обертка для асинхронных функций с автоматическим error tracking
 */
export function withErrorTracking<T extends (...args: any[]) => any>(
  fn: T,
  errorMessage?: string
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);

      // Если функция возвращает Promise
      if (result instanceof Promise) {
        return result.catch((error) => {
          logError(error, {
            function: fn.name,
            message: errorMessage,
            arguments: args
          });
          throw error;
        });
      }

      return result;
    } catch (error) {
      logError(error as Error, {
        function: fn.name,
        message: errorMessage,
        arguments: args
      });
      throw error;
    }
  }) as T;
}
