/**
 * Service Worker для PWA и offline режима
 * Кеширует критические ресурсы для работы без интернета
 */

const CACHE_NAME = "beltehferm-v1";
const RUNTIME_CACHE = "beltehferm-runtime-v1";

// Критические ресурсы для кеширования при установке
const STATIC_ASSETS = [
  "/",
  "/catalog",
  "/icons/cog.svg",
  "/icons/snowplow.svg",
  "/icons/tractor.svg",
  "/images/logo.jpg",
  "/images/logo-optimized.jpg",
];

// Установка Service Worker
self.addEventListener("install", (event) => {
  console.log("[SW] Install event");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("[SW] Skip waiting");
        return self.skipWaiting();
      })
  );
});

// Активация Service Worker
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate event");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Удаляем старые кеши
              return (
                cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE
              );
            })
            .map((cacheName) => {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log("[SW] Claiming clients");
        return self.clients.claim();
      })
  );
});

// Обработка запросов (fetch)
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Игнорируем запросы к внешним API
  if (!url.origin.includes(self.location.origin)) {
    // Для Supabase используем network-first стратегию
    if (url.origin.includes("supabase.co")) {
      event.respondWith(networkFirst(request));
    }
    return;
  }

  // Для статических файлов используем cache-first
  if (
    request.destination === "image" ||
    request.destination === "font" ||
    request.destination === "style" ||
    request.destination === "script"
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Для HTML страниц используем network-first
  if (request.destination === "document") {
    event.respondWith(networkFirst(request));
    return;
  }

  // Для остальных запросов используем network-first
  event.respondWith(networkFirst(request));
});

/**
 * Cache-first стратегия: сначала проверяем кеш, потом сеть
 * Хорошо для статических ресурсов (изображения, шрифты, CSS)
 */
async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    console.log("[SW] Cache hit:", request.url);
    return cached;
  }

  console.log("[SW] Cache miss, fetching:", request.url);

  try {
    const response = await fetch(request);

    // Кешируем успешные ответы
    if (response.status === 200) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error("[SW] Fetch failed:", error);

    // Возвращаем fallback для изображений
    if (request.destination === "image") {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#e0e0e0" width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" fill="#999">Нет изображения</text></svg>',
        { headers: { "Content-Type": "image/svg+xml" } }
      );
    }

    return new Response("Offline", { status: 503 });
  }
}

/**
 * Network-first стратегия: сначала пытаемся загрузить из сети, потом из кеша
 * Хорошо для динамического контента (API, HTML страницы)
 */
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    console.log("[SW] Network first, fetching:", request.url);
    const response = await fetch(request);

    // Кешируем успешные ответы
    if (response.status === 200) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error("[SW] Network failed, trying cache:", error);

    const cached = await cache.match(request);

    if (cached) {
      console.log("[SW] Returning cached response");
      return cached;
    }

    // Возвращаем простой offline ответ
    if (request.destination === "document") {
      const offlineHtml = `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Offline - БелТехФермЪ</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: #f5f5f5;
              color: #333;
            }
            .offline-container {
              text-align: center;
              padding: 40px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { color: #0066cc; }
            button {
              margin-top: 20px;
              padding: 12px 24px;
              background: #0066cc;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 16px;
            }
            button:hover { background: #0052a3; }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <h1>Нет подключения к интернету</h1>
            <p>Пожалуйста, проверьте ваше подключение и попробуйте снова.</p>
            <button onclick="location.reload()">Обновить страницу</button>
          </div>
        </body>
        </html>
      `;

      return new Response(offlineHtml, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return new Response("Offline", { status: 503 });
  }
}

// Обработка сообщений от клиента
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});
