import { supabase } from "../lib/supabase";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  TractorIcon,
  ShoppingCartIcon,
  IndustryIcon,
  BoltIcon,
  BoxIcon,
  CogsIcon,
  TruckIcon,
  GridIcon,
  BoxOpenIcon,
} from "../components/Icons";
import "./catalog.css";

export const metadata: Metadata = {
  title: "Каталог товаров | БелТехФермЪ - Мини-тракторы и запчасти",
  description:
    "Полный каталог мини-тракторов, навесного оборудования и запчастей. Низкие цены, большой выбор, доставка по России.",
  keywords:
    "каталог мини-тракторов, сельхозтехника, запчасти, оборудование, цены",
  openGraph: {
    title: "Каталог товаров | БелТехФермЪ",
    description: "Полный каталог мини-тракторов и сельхозтехники",
    url: "https://beltehferm.netlify.app/catalog",
    type: "website",
  },
};

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  old_price?: number;
  image_url: string;
  category_id: number;
  in_stock: boolean;
  is_featured: boolean;
  power?: string;
  manufacturer?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default async function CatalogPage() {
  // Загружаем все категории
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // Загружаем ВСЕ товары в наличии (не фильтруем по категориям на главной странице каталога)
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("in_stock", true)
    .order("created_at", { ascending: false })
    .limit(100); // Показываем первые 100 товаров

  return (
    <div className="catalog-page">
      <div className="container">
        <h1 className="catalog-title">Каталог товаров</h1>

        {/* Фильтры категорий */}
        <div className="category-filters">
          <Link href="/catalog" className="category-btn active">
            <GridIcon className="inline-icon" /> Все товары
          </Link>
          <Link href="/catalog/parts" className="category-btn">
            <CogsIcon className="inline-icon" /> Запчасти
          </Link>
          <Link href="/catalog/mini-tractors" className="category-btn">
            <TractorIcon className="inline-icon" /> Мини-тракторы
          </Link>
          <Link href="/catalog/equipment" className="category-btn">
            <TruckIcon className="inline-icon" /> Оборудование
          </Link>
          <Link href="/catalog/engines-assembled" className="category-btn">
            <BoltIcon className="inline-icon" /> ДВС в Сборе
          </Link>
        </div>

        {/* Сетка товаров */}
        <div className="products-grid">
          {products?.map((product: Product) => (
            <div key={product.id} className="product-card">
              {product.is_featured && <div className="product-badge">Хит</div>}
              {product.old_price && (
                <div className="product-discount">
                  -{Math.round((1 - product.price / product.old_price) * 100)}%
                </div>
              )}

              <Link href={`/catalog/product/${product.slug}`}>
                <div className="product-image">
                  <Image
                    src={product.image_url || "/images/placeholder.jpg"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    style={{ objectFit: "cover" }}
                    loading="lazy"
                  />
                </div>
              </Link>

              <div className="product-info">
                <Link href={`/catalog/product/${product.slug}`}>
                  <h3 className="product-name">{product.name}</h3>
                </Link>

                {product.manufacturer && (
                  <p className="product-manufacturer">
                    <IndustryIcon className="inline-icon" />{" "}
                    {product.manufacturer}
                  </p>
                )}

                {product.power && (
                  <p className="product-specs">
                    <BoltIcon className="inline-icon" /> {product.power}
                  </p>
                )}

                <div className="product-footer">
                  <div className="product-price">
                    {product.old_price && (
                      <span className="old-price">
                        {product.old_price
                          ? product.old_price.toLocaleString()
                          : "0"}{" "}
                        ₽
                      </span>
                    )}
                    <span className="current-price">
                      {product.price ? product.price.toLocaleString() : "0"} ₽
                    </span>
                  </div>

                  <Link
                    href={`/catalog/product/${product.slug}`}
                    className="add-to-cart-btn"
                  >
                    <ShoppingCartIcon className="inline-icon" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!products ||
          (products.length === 0 && (
            <div className="empty-catalog">
              <BoxOpenIcon />
              <p>Товары скоро появятся</p>
            </div>
          ))}
      </div>
    </div>
  );
}

function getCategoryIcon(slug: string): React.ReactElement {
  const icons: { [key: string]: React.ReactElement } = {
    "mini-tractors": <TractorIcon className="inline-icon" />,
    equipment: <TruckIcon className="inline-icon" />,
    "engines-assembled": <BoltIcon className="inline-icon" />,
    parts: <CogsIcon className="inline-icon" />,
  };
  return icons[slug] || <BoxIcon className="inline-icon" />;
}

function addToCart(product: Product) {
  // Client-side функция для добавления в корзину
  console.log("Add to cart:", product);
}
