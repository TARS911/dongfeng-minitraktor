import { supabase } from "../../lib/supabase";
import ProductCard from "../../components/ProductCard";
import Link from "next/link";
import type { Metadata } from "next";
import "../catalog.css";

export const metadata: Metadata = {
  title: "Запчасти | БелТехФермЪ",
  description:
    "Запасные части для мини-тракторов и сельхозтехники. Большой выбор, низкие цены, доставка по России.",
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

interface Category {
  id: number;
  name: string;
  slug: string;
}

async function getAllPartsProducts(): Promise<Product[]> {
  // Получаем все категории запчастей (все кроме категорий мини-тракторов)
  const { data: categories } = await supabase
    .from("categories")
    .select("id")
    .not("slug", "like", "mini-traktory%");

  if (!categories || categories.length === 0) return [];

  const categoryIds = categories.map((c) => c.id);

  // Получаем все товары из этих категорий
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .in("category_id", categoryIds)
    .eq("in_stock", true)
    .order("created_at", { ascending: false })
    .limit(100); // Показываем первые 100 товаров

  return products || [];
}

export default async function PartsPage() {
  const products = await getAllPartsProducts();

  return (
    <div className="catalog-page">
      <div className="container">
        <div className="catalog-header">
          <div className="breadcrumb">
            <Link href="/">Главная</Link>
            <span>/</span>
            <Link href="/catalog">Каталог</Link>
            <span>/</span>
            <span>Запчасти</span>
          </div>
          <h1>Запчасти</h1>
        </div>

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
