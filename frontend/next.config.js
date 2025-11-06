/** @type {import('next').NextConfig} */
const nextConfig = {
  // Оптимизация для production
  poweredByHeader: false,
  compress: true,

  // Оптимизация изображений
  images: {
    domains: ["wbfhvcmvkyjsjvqkbxpz.supabase.co"],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
  },

  // Отключаем строгий режим для production
  reactStrictMode: true,

  // Экспериментальные функции для скорости
  experimental: {
    optimizePackageImports: ["@supabase/supabase-js"],
  },

  // Настройки для Netlify
  output: "standalone",

  // Headers для кэширования
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
    ];
  },
};

module.exports = nextConfig;
