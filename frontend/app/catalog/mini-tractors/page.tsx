import { supabase } from "../../lib/supabase";
import ProductCard from "../../components/ProductCard";
import Link from "next/link";
import type { Metadata } from "next";
import "../catalog.css";

export const metadata: Metadata = {
  title: "Мини-тракторы | БелТехФермЪ",
  description:
    "Купите мини-тракторы DONGFENG. Большой выбор, низкие цены, доставка по России.",
};

import { Product } from "../../../types";

async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  // Для категории "mini-tractors" загружаем товары из всех брендовых подкатегорий
  if (categorySlug === "mini-tractors") {
    // Получаем ID брендовых категорий
    const { data: brandCategories } = await supabase
      .from("categories")
      .select("id")
      .in("slug", ["dongfeng", "lovol-foton", "xingtai", "rustrak"]);

    if (!brandCategories || brandCategories.length === 0) return [];

    const categoryIds = brandCategories.map((cat) => cat.id);

    // Получаем товары из всех брендовых категорий
    const { data: products } = await supabase
      .from("products")
      .select("*")
      .in("category_id", categoryIds)
      .eq("in_stock", true)
      .order("created_at", { ascending: false });

    return products || [];
  }

  // Для других категорий - стандартная логика
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .single();

  if (!category) return [];

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", category.id)
    .eq("in_stock", true)
    .order("created_at", { ascending: false });

  return products || [];
}

export default async function MiniTractorsPage() {
  // Загружаем брендовые подкатегории
  const { data: brandCategories } = await supabase
    .from("categories")
    .select("*")
    .in("slug", ["dongfeng", "lovol-foton", "xingtai", "rustrak"])
    .order("name");

  return (
    <div className="catalog-page">
      <div className="container">
        <div className="catalog-header">
          <div className="breadcrumb">
            <Link href="/">Главная</Link>
            <span>/</span>
            <Link href="/catalog">Каталог</Link>
            <span>/</span>
            <span>Мини-тракторы</span>
          </div>
          <h1>Мини-тракторы</h1>
          <p className="category-description">
            Выберите бренд мини-трактора для просмотра доступных моделей
          </p>
        </div>

        {/* Показываем бренды как подкатегории */}
        {brandCategories && brandCategories.length > 0 ? (
          <div className="categories-grid">
            {brandCategories.map((brand) => (
              <Link
                key={brand.id}
                href={`/catalog/${brand.slug}`}
                className="category-card"
              >
                <div className="category-icon">
                  <svg
                    className="icon"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                </div>
                <h3>{brand.name}</h3>
                {brand.description && <p>{brand.description}</p>}
                <span className="category-link">
                  Смотреть товары{" "}
                  <svg
                    className="inline-icon"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7"></path>
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-category">
            <h2>Подкатегории пока не добавлены</h2>
            <p>Мы работаем над пополнением каталога</p>
            <Link href="/catalog" className="btn-back">
              ← Вернуться в каталог
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
