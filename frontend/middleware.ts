import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Rate Limiting Middleware для Next.js (Edge Runtime Compatible)
 * Ограничивает количество запросов от одного IP
 *
 * ПРИМЕЧАНИЕ: В production рекомендуется использовать Redis/Upstash
 * для распределённого rate limiting
 */

// Настройки rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 минута
const MAX_REQUESTS_PER_WINDOW = 100; // 100 запросов в минуту
const API_MAX_REQUESTS = 30; // 30 запросов в минуту для API

// Простое in-memory хранилище (работает только на одном инстансе)
// Для production: используйте Upstash Redis или Cloudflare KV
let requestCounts = new Map<string, { count: number; resetTime: number }>()

/**
 * Получить IP адрес клиента
 */
function getClientIp(request: NextRequest): string {
  // Проверяем заголовки от прокси (Netlify, Vercel, Cloudflare)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  if (cfConnectingIp) return cfConnectingIp;
  if (forwarded) return forwarded.split(",")[0].trim();
  if (realIp) return realIp;

  return "unknown";
}

/**
 * Проверить rate limit для IP
 */
function checkRateLimit(ip: string, maxRequests: number): boolean {
  const now = Date.now();
  const requestData = requestCounts.get(ip);

  // Если первый запрос или окно истекло
  if (!requestData || now > requestData.resetTime) {
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  // Увеличиваем счетчик
  requestData.count++;

  // Проверяем лимит
  if (requestData.count > maxRequests) {
    return false;
  }

  return true;
}

/**
 * Очистка устаревших записей (запускается периодически)
 */
function cleanupOldEntries() {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(ip);
    }
  }
}

// Очистка устаревших записей при каждом запросе (для Edge Runtime)
// setInterval недоступен в Edge Runtime, поэтому очищаем вручную

/**
 * Middleware функция
 */
export function middleware(request: NextRequest) {
  // Очищаем устаревшие записи перед проверкой
  cleanupOldEntries();

  const ip = getClientIp(request);
  const { pathname } = request.nextUrl;

  // Определяем лимит в зависимости от пути
  const isApiRoute = pathname.startsWith("/api");
  const maxRequests = isApiRoute ? API_MAX_REQUESTS : MAX_REQUESTS_PER_WINDOW;

  // Проверяем rate limit
  const allowed = checkRateLimit(ip, maxRequests);

  if (!allowed) {
    console.warn(`[Rate Limit] Blocked ${ip} - too many requests to ${pathname}`);

    // Возвращаем 429 Too Many Requests
    return NextResponse.json(
      {
        error: "Too Many Requests",
        message:
          "Вы отправили слишком много запросов. Пожалуйста, попробуйте позже.",
        retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(RATE_LIMIT_WINDOW / 1000)),
          "X-RateLimit-Limit": String(maxRequests),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(
            Math.ceil((Date.now() + RATE_LIMIT_WINDOW) / 1000)
          ),
        },
      }
    );
  }

  // Добавляем rate limit headers в ответ
  const requestData = requestCounts.get(ip)!;
  const response = NextResponse.next();

  response.headers.set("X-RateLimit-Limit", String(maxRequests));
  response.headers.set(
    "X-RateLimit-Remaining",
    String(Math.max(0, maxRequests - requestData.count))
  );
  response.headers.set(
    "X-RateLimit-Reset",
    String(Math.ceil(requestData.resetTime / 1000))
  );

  return response;
}

/**
 * Конфигурация middleware - применяется только к определенным путям
 */
export const config = {
  matcher: [
    // API routes (высокий приоритет для защиты)
    "/api/:path*",
    // Страницы с формами
    "/auth/:path*",
    "/cart/:path*",
    "/contacts/:path*",
    // Исключаем статические файлы и внутренние Next.js пути
    "/((?!_next/static|_next/image|favicon.ico|images|icons|sw.js|manifest.json).*)",
  ],
};
