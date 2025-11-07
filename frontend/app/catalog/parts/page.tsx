import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "../../components/ProductCard";
import "../catalog.css";

export const metadata: Metadata = {
  title: "Запасные части - БелТехФермЪ",
  description:
    "Запасные части и комплектующие для тракторов с доставкой по России.",
};

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  slug: string;
  category: string;
  category_id: number;
}

async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/products`,
    );

    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }

    const products = await res.json();
    return products.filter((p: Product) => p.category === category);
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function PartsPage() {
  const products = await getProductsByCategory("parts");

  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <h1>Запасные части</h1>
        <p>Оригинальные запасные части и комплектующие</p>
        <div className="breadcrumb">
          <Link href="/">Главная</Link>
          <span>/</span>
          <Link href="/catalog">Каталог</Link>
          <span>/</span>
          <span>Запасные части</span>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="empty-category">
          <p>Товары этой категории временно недоступны</p>
          <Link href="/catalog" className="btn-back">
            ← Вернуться в каталог
          </Link>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
