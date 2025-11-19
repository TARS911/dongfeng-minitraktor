/**
 * Robots.txt для поисковых систем
 * Указывает какие страницы можно индексировать
 */

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://beltehferm.netlify.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/catalog",
          "/catalog/*",
          "/about",
          "/delivery",
          "/payment",
          "/contacts",
          "/services",
          "/service-center",
          "/promotions",
        ],
        disallow: [
          "/admin/*",
          "/api/*",
          "/cart",
          "/favorites",
          "/compare",
          "/auth",
          "/_next/*",
          "/static/*",
        ],
        crawlDelay: 10,
      },
      // Правила для Яндекса
      {
        userAgent: "Yandex",
        allow: ["/"],
        disallow: ["/admin/*", "/api/*", "/cart", "/auth"],
        crawlDelay: 5,
      },
      // Правила для Google
      {
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: ["/admin/*", "/api/*", "/cart", "/auth"],
      },
      // Блокируем плохих ботов
      {
        userAgent: [
          "AhrefsBot",
          "SemrushBot",
          "DotBot",
          "MJ12bot",
          "BLEXBot",
        ],
        disallow: ["/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
