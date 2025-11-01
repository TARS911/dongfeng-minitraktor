import Fastify from "fastify";
import cors from "@fastify/cors";
import staticFiles from "@fastify/static";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

// Routes
import productRoutes from "./routes/products.js";
import formRoutes from "./routes/forms.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Создаем Fastify instance
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

// Регистрируем CORS
await fastify.register(cors, {
  origin: (origin, cb) => {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:8000",
      "https://dongfeng-minitraktor.onrender.com",
      /\.vercel\.app$/, // Разрешаем все поддомены vercel.app
      /\.netlify\.app$/, // Разрешаем все поддомены netlify.app
      /\.railway\.app$/, // Разрешаем Railway
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
  credentials: true,
});

// Статические файлы (frontend)
await fastify.register(staticFiles, {
  root: join(__dirname, "../frontend"),
  prefix: "/",
});

// Health check endpoint
fastify.get("/api/health", async (request, reply) => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
});

// Регистрируем API routes
await fastify.register(productRoutes, { prefix: "/api" });
await fastify.register(formRoutes, { prefix: "/api" });
await fastify.register(orderRoutes, { prefix: "/api" });
await fastify.register(adminRoutes, { prefix: "/api/admin" });

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);

  // Validation errors
  if (error.validation) {
    return reply.code(400).send({
      success: false,
      error: "Ошибка валидации данных",
      details: error.validation,
    });
  }

  // Database errors
  if (error.code === "SQLITE_ERROR") {
    return reply.code(500).send({
      success: false,
      error: "Ошибка базы данных",
    });
  }

  // Default error
  return reply.code(error.statusCode || 500).send({
    success: false,
    error: error.message || "Внутренняя ошибка сервера",
  });
});

// Not found handler
fastify.setNotFoundHandler((request, reply) => {
  // Если запрос к API, возвращаем JSON
  if (request.url.startsWith("/api")) {
    return reply.code(404).send({
      success: false,
      error: "Endpoint не найден",
    });
  }

  // Для остальныха помнишь последнее запросов отдаем index.html (для SPA роутинга)
  return reply.sendFile("index.html");
});

// Graceful shutdown
const closeGracefully = async (signal) => {
  fastify.log.info(`Received ${signal}, closing server...`);
  await fastify.close();
  process.exit(0);
};

process.on("SIGINT", () => closeGracefully("SIGINT"));
process.on("SIGTERM", () => closeGracefully("SIGTERM"));

// Запуск сервера
const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    const host = process.env.HOST || "0.0.0.0";

    await fastify.listen({ port, host });

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

start();
