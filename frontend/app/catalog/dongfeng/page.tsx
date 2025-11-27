import { supabase } from "../../lib/supabase";
import ProductCard from "../../components/ProductCard";
import Breadcrumbs from "../../components/Breadcrumbs";
import { Product } from "../../../types";
import Link from "next/link"; // Добавляем пропущенный импорт Link
import "../catalog.css";

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

export default async function DongFengPage() {
  const products = await getProductsByCategory("dongfeng");

  return (
    <div className="catalog-page">
      <div className="container">
        <div className="catalog-header">
          <div className="breadcrumb">
            <Link href="/">Главная</Link>
            <span>/</span>
            <Link href="/catalog">Каталог</Link>
            <span>/</span>
            <Link href="/catalog/mini-tractors">Мини-тракторы</Link>
            <span>/</span>
            <span>DongFeng</span>
          </div>
          <h1>Мини-тракторы DongFeng</h1>
        </div>

        {products.length === 0 ? (
          <div className="empty-category">
            <h2>В этой категории пока нет товаров</h2>
            <p>Мы работаем над пополнением ассортимента</p>
            <Link href="/catalog/mini-tractors" className="btn-back">
              ← Вернуться в каталог мини-тракторов
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
