/**
 * DONGFENG MINITRAKTOR - BACKEND SERVER
 *
 * Fastify-based API server для интернет-магазина минитракторов.
 *
 * Основные возможности:
 * - RESTful API для товаров, заказов, форм
 * - Интеграция с Supabase (PostgreSQL)
 * - CORS для фронтенда
 * - Раздача статических файлов frontend
 * - SPA routing (все non-API 404 → index.html)
 * - Graceful shutdown
 *
 * @author DONGFENG Team
 * @version 2.0.0
 * @requires fastify ^4.25.0
 * @requires @supabase/supabase-js ^2.39.0
 */

// ============================================
// ИМПОРТЫ ЗАВИСИМОСТЕЙ
// ============================================
import Fastify from "fastify";
import cors from "@fastify/cors";
import staticFiles from "@fastify/static";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

// ============================================
// ИМПОРТЫ МАРШРУТОВ API
// ============================================
import productRoutes from "./routes/products.js"; // Товары и категории
import formRoutes from "./routes/forms.js"; // Формы обратной связи
import orderRoutes from "./routes/orders.js"; // Заказы и корзина
import adminRoutes from "./routes/admin.js"; // Админ-панель

// Загружаем переменные окружения из .env файла
dotenv.config();

// ============================================
// НАСТРОЙКА ПУТЕЙ (ES MODULES)
// ============================================
// В ES modules нет __dirname, поэтому создаем его вручную
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================
// СОЗДАНИЕ FASTIFY INSTANCE
// ============================================
/**
 * Создаем Fastify сервер с логированием.
 *
 * Production: JSON логи для парсинга (ELK, Datadog и т.д.)
 * Development: Красивые цветные логи через pino-pretty
 */
const fastify = Fastify({
  logger:
    process.env.NODE_ENV === "production"
      ? true // В production - простой JSON логгер
      : {
          // В development - красивый pino-pretty
          level: process.env.LOG_LEVEL || "info",
          transport: {
            target: "pino-pretty",
            options: {
              translateTime: "HH:MM:ss Z",
              ignore: "pid,hostname",
            },
          },
        },
});

// ============================================
// MIDDLEWARE: CORS
// ============================================
/**
 * Настройка CORS (Cross-Origin Resource Sharing)
 *
 * Разрешает запросы с фронтенда, который может быть задеплоен на:
 * - localhost (локальная разработка)
 * - Vercel, Netlify, Railway (деплой платформы)
 * - Кастомный домен из .env
 *
 * credentials: true - разрешает отправку cookies/auth headers
 */
await fastify.register(cors, {
  origin: (origin, cb) => {
    // Список разрешенных источников
    const allowedOrigins = [
      "http://localhost:3000", // Backend локально
      "http://localhost:8000", // Frontend локально
      "https://dongfeng-minitraktor.onrender.com", // Production
      /\.vercel\.app$/, // Vercel deployments
      /\.netlify\.app$/, // Netlify deployments
      /\.railway\.app$/, // Railway deployments
      process.env.FRONTEND_URL, // Кастомный домен из .env
    ].filter(Boolean); // Убираем undefined значения

    // Разрешаем запросы без origin (например, curl или Postman)
    if (!origin) {
      cb(null, true);
      return;
    }

    // Проверяем origin в списке разрешенных
    const isAllowed = allowedOrigins.some((allowed) => {
      if (typeof allowed === "string") {
        return origin === allowed;
      }
      // Для регулярных выражений
      return allowed.test(origin);
    });

    cb(null, isAllowed);
  },
  credentials: true, // Разрешаем cookies и auth headers
});

// ============================================
// MIDDLEWARE: СТАТИЧЕСКИЕ ФАЙЛЫ
// ============================================
/**
 * Раздача статических файлов фронтенда.
 *
 * Все файлы из папки ../frontend доступны по корневому URL.
 * Например: /index.html, /css/main.css, /js/app.js
 *
 * Это позволяет запускать весь сайт на одном порту.
 */
await fastify.register(staticFiles, {
  root: join(__dirname, "../frontend"),
  prefix: "/", // Доступны по корневому URL
});

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
/**
 * GET /api/health
 *
 * Проверка работоспособности сервера.
 * Используется для:
 * - Мониторинга (Render, Railway, Vercel)
 * - Load balancers
 * - Healthcheck scripts
 *
 * @returns {Object} - Статус, время, uptime
 */
fastify.get("/api/health", async (request, reply) => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
});

// ============================================
// РЕГИСТРАЦИЯ API МАРШРУТОВ
// ============================================
/**
 * Подключаем все API маршруты с префиксом /api
 *
 * Маршруты:
 * - /api/products, /api/categories - Товары (productRoutes)
 * - /api/contact, /api/delivery-calculator - Формы (formRoutes)
 * - /api/orders - Заказы (orderRoutes)
 * - /api/admin/* - Админка (adminRoutes)
 */
await fastify.register(productRoutes, { prefix: "/api" });
await fastify.register(formRoutes, { prefix: "/api" });
await fastify.register(orderRoutes, { prefix: "/api" });
await fastify.register(adminRoutes, { prefix: "/api/admin" });

// ============================================
// ERROR HANDLER - ОБРАБОТЧИК ОШИБОК
// ============================================
/**
 * Глобальный обработчик ошибок.
 *
 * Перехватывает все ошибки и возвращает понятные JSON ответы.
 * Типы ошибок:
 * - Validation (400) - Неверные данные в запросе
 * - Database (500) - Ошибки БД (Supabase)
 * - Default (500) - Все остальные ошибки
 *
 * Все ошибки логируются через fastify.log
 */
fastify.setErrorHandler((error, request, reply) => {
  // Логируем ошибку в консоль/файл
  fastify.log.error(error);

  // Validation errors (Fastify schema validation)
  if (error.validation) {
    return reply.code(400).send({
      success: false,
      error: "Ошибка валидации данных",
      details: error.validation,
    });
  }

  // Database errors (Supabase/PostgreSQL)
  // Примечание: Раньше использовался SQLite (SQLITE_ERROR)
  // Теперь Supabase, но код оставлен для совместимости
  if (error.code === "SQLITE_ERROR" || error.code?.startsWith("PG")) {
    return reply.code(500).send({
      success: false,
      error: "Ошибка базы данных",
    });
  }

  // Default error - все остальные ошибки
  return reply.code(error.statusCode || 500).send({
    success: false,
    error: error.message || "Внутренняя ошибка сервера",
  });
});

// ============================================
// NOT FOUND HANDLER - ОБРАБОТЧИК 404
// ============================================
/**
 * Обработчик несуществующих маршрутов.
 *
 * Важно для SPA (Single Page Application):
 * - Запросы к /api/* → JSON 404
 * - Все остальные запросы → index.html (для client-side routing)
 *
 * Это позволяет фронтенду обрабатывать маршруты вроде:
 * /catalog, /cart, /product/df-244 и т.д.
 */
fastify.setNotFoundHandler((request, reply) => {
  // Если запрос к API, возвращаем JSON
  if (request.url.startsWith("/api")) {
    return reply.code(404).send({
      success: false,
      error: "Endpoint не найден",
    });
  }

  // Для остальных запросов отдаем index.html (для SPA роутинга)
  // Frontend сам разберется с маршрутизацией
  return reply.sendFile("index.html");
});

// ============================================
// GRACEFUL SHUTDOWN - КОРРЕКТНОЕ ЗАВЕРШЕНИЕ
// ============================================
/**
 * Обработчик корректного завершения сервера.
 *
 * При получении сигнала SIGINT (Ctrl+C) или SIGTERM (kill):
 * 1. Завершаем обработку текущих запросов
 * 2. Закрываем соединения с БД
 * 3. Освобождаем ресурсы
 * 4. Выходим с кодом 0
 *
 * Это важно для:
 * - Избежания потери данных
 * - Корректного деплоя (zero-downtime)
 * - Правильной работы в контейнерах (Docker/K8s)
 */
const closeGracefully = async (signal) => {
  fastify.log.info(`Received ${signal}, closing server...`);
  await fastify.close();
  process.exit(0);
};

// Подписываемся на сигналы завершения
process.on("SIGINT", () => closeGracefully("SIGINT")); // Ctrl+C
process.on("SIGTERM", () => closeGracefully("SIGTERM")); // kill command

// ============================================
// ЗАПУСК СЕРВЕРА
// ============================================
/**
 * Главная функция запуска сервера.
 *
 * Читает порт и хост из переменных окружения:
 * - PORT (default: 3000)
 * - HOST (default: 0.0.0.0)
 *
 * 0.0.0.0 означает "слушать на всех сетевых интерфейсах",
 * что необходимо для работы в контейнерах и облачных платформах.
 */
const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    const host = process.env.HOST || "0.0.0.0"; // Важно для Docker/Render

    await fastify.listen({ port, host });

    // Красивый вывод информации о запущенном сервере
    console.log("\n🚀 ========================================");
    console.log("   DONGFENG Backend Server запущен!");
    console.log("========================================");
    console.log(`\n📡 API:       http://localhost:${port}/api`);
    console.log(`🌐 Frontend: http://localhost:${port}`);
    console.log(`\n📊 Endpoints:`);
    console.log(`   GET  /api/products          - Список товаров`);
    console.log(`   GET  /api/products/:slug    - Один товар`);
    console.log(`   GET  /api/categories        - Категории`);
    console.log(`   POST /api/contact           - Форма обратной связи`);
    console.log(`   POST /api/delivery-calculator - Расчет доставки`);
    console.log(`   POST /api/orders            - Создать заказ 🛒`);
    console.log(`   GET  /api/orders/:id        - Получить заказ`);
    console.log(`   GET  /api/health            - Health check`);
    console.log("\n========================================\n");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Запускаем сервер
start();
