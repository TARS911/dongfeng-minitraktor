import { MetadataRoute } from "next";
import { supabase } from "./lib/supabase";

/**
 * Динамический sitemap.xml для Next.js 15
 * Автоматически генерирует sitemap на основе данных из БД
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://beltehferm.netlify.app";

  // Статические страницы
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contacts`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/delivery`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/payment`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/service-center`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/promotions`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Эти страницы НЕ добавляем в sitemap (noindex):
  // - /cart (корзина)
  // - /favorites (избранное)
  // - /compare (сравнение)
  // - /auth (авторизация)
  // - /admin/* (админка)

  // Динамические страницы категорий
  const { data: categories } = await supabase
    .from("categories")
    .select("slug, updated_at")
    .order("name");

  const categoryPages: MetadataRoute.Sitemap =
    categories?.map((category) => ({
      url: `${baseUrl}/catalog/${category.slug}`,
      lastModified: category.updated_at
        ? new Date(category.updated_at)
        : new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })) || [];

  // Динамические страницы товаров
  const { data: products } = await supabase
    .from("products")
    .select("slug, updated_at")
    .eq("in_stock", true)
    .order("updated_at", { ascending: false })
    .limit(1000); // Ограничение для sitemap

  const productPages: MetadataRoute.Sitemap =
    products?.map((product) => ({
      url: `${baseUrl}/catalog/product/${product.slug}`,
      lastModified: product.updated_at
        ? new Date(product.updated_at)
        : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })) || [];

  // Объединяем все страницы
  return [...staticPages, ...categoryPages, ...productPages];
}
