/** @type {import('next').NextConfig} */
const nextConfig = {
  // Оптимизация для production
  poweredByHeader: false,
  compress: true,

  // Для Docker нужен standalone output
  output: "standalone",

  // Для IPFS нужен статичный экспорт (закомментировано)
  // output: "export",
  // basePath: "",
  // trailingSlash: true,

  // Исправляем workspace root warning (закомментировано для Docker)
  // outputFileTracingRoot: require("path").join(__dirname, "../"),

  // Оптимизация изображений
  images: {
    domains: [
      "dpsykseeqloturowdyzf.supabase.co",
      "xn----7sbabpgpk4bsbesjp1f.xn--p1ai",
      "zip-agro.ru",
      "tata-agro-moto.com",
    ],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zip-agro.ru",
        pathname: "/image/**",
      },
      {
        protocol: "https",
        hostname: "tata-agro-moto.com",
        pathname: "/image/**",
      },
    ],
  },

  // Отключаем строгий режим для production
  reactStrictMode: true,

  // Экспериментальные функции для скорости
  experimental: {
    optimizePackageImports: ["@supabase/supabase-js"],
  },

  // Увеличиваем таймаут для статической генерации
  staticPageGenerationTimeout: 180,

  // Убираем export - используем SSR для Netlify
  // output: "export",

  // Headers для кэширования и безопасности
  async headers() {
    return [
      {
        source: "/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          // Content Security Policy - защита от XSS
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://dpsykseeqloturowdyzf.supabase.co; " +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
              "img-src 'self' data: blob: https: http:; " +
              "font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
              "connect-src 'self' https://dpsykseeqloturowdyzf.supabase.co wss://dpsykseeqloturowdyzf.supabase.co; " +
              "frame-ancestors 'none'; " +
              "base-uri 'self'; " +
              "form-action 'self';",
          },
          // X-Frame-Options - защита от clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // X-Content-Type-Options - защита от MIME sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Referrer-Policy - контроль передачи referrer
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions-Policy - ограничение browser features
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // X-XSS-Protection - дополнительная защита от XSS (legacy)
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Strict-Transport-Security - принудительный HTTPS
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
