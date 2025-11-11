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

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  old_price?: number;
  image_url: string;
  category_id: number;
  manufacturer?: string;
  is_featured?: boolean;
}

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
  const products = await getProductsByCategory("mini-tractors");

  // Загружаем брендовые подкатегории для фильтров
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
        </div>

        {/* Фильтры по брендам */}
        {brandCategories && brandCategories.length > 0 && (
          <div className="category-filters">
            <Link href="/catalog/mini-tractors" className="category-btn active">
              Все бренды
            </Link>
            {brandCategories.map((brand) => (
              <Link
                key={brand.id}
                href={`/catalog/${brand.slug}`}
                className="category-btn"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        )}

        {products.length === 0 ? (
          <div className="empty-category">
            <h2>В этой категории пока нет товаров</h2>
            <p>Мы работаем над пополнением ассортимента</p>
            <Link href="/catalog" className="btn-back">
              ← Вернуться в каталог
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
