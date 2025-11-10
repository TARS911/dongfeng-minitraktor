import { supabase } from "../../lib/supabase";
import ProductCard from "../../components/ProductCard";
import Link from "next/link";
import type { Metadata } from "next";
import "../catalog.css";

export const metadata: Metadata = {
  title: "Коммунальная техника | БелТехФермЪ",
  description:
    "Коммунальная техника для уборки снега и территорий. Большой выбор, низкие цены, доставка по России.",
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
  // Получаем ID категории по slug
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .single();

  if (!category) return [];

  // Получаем товары этой категории
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", category.id)
    .eq("in_stock", true)
    .order("created_at", { ascending: false });

  return products || [];
}

export default async function EquipmentPage() {
  const products = await getProductsByCategory("equipment");

  return (
    <div className="catalog-page">
      <div className="container">
        <div className="catalog-header">
          <div className="breadcrumb">
            <Link href="/">Главная</Link>
            <span>/</span>
            <Link href="/catalog">Каталог</Link>
            <span>/</span>
            <span>Коммунальная техника</span>
          </div>
          <h1>Коммунальная техника</h1>
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
