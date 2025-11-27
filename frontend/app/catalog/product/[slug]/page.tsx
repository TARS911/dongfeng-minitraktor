import { supabase } from "../../../lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "../../../components/ProductCard"; // <-- Import the component
import "./product.css";

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
  description?: string;
  specifications?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug: productSlug } = await params;
  const decodedSlug = decodeURIComponent(productSlug);

  // Загружаем товар
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", decodedSlug)
    .single();

  if (!product) {
    notFound();
  }

  // Загружаем категорию
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", product.category_id)
    .single();

  // Загружаем похожие товары
  const { data: similarProducts } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", product.category_id)
    .eq("in_stock", true)
    .neq("id", product.id)
    .limit(4);

  return (
    <div className="product-page">
      <div className="container">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <Link href="/">Главная</Link>
          <i className="fas fa-chevron-right"></i>
          <Link href="/catalog">Каталог</Link>
          {category && (
            <>
              <i className="fas fa-chevron-right"></i>
              <Link href={`/catalog/${category.slug}`}>{category.name}</Link>
            </>
          )}
          <i className="fas fa-chevron-right"></i>
          <span>{product.name}</span>
        </div>

        {/* Основная информация о товаре */}
        <div className="product-main">
          <div className="product-gallery">
            <div className="product-main-image">
              {product.is_featured && (
                <div className="product-badge">Хит продаж</div>
              )}
              {product.old_price && (
                <div className="product-discount">
                  -{Math.round((1 - product.price / product.old_price) * 100)}%
                </div>
              )}
              <img
                src={product.image_url || "/images/placeholder.jpg"}
                alt={product.name}
              />
            </div>
          </div>

          <div className="product-details">
            <h1 className="product-title">{product.name}</h1>

            {product.manufacturer && (
              <div className="product-meta">
                <i className="fas fa-industry"></i>
                <span>
                  Производитель: <strong>{product.manufacturer}</strong>
                </span>
              </div>
            )}

            {product.power && (
              <div className="product-meta">
                <i className="fas fa-bolt"></i>
                <span>
                  Мощность: <strong>{product.power}</strong>
                </span>
              </div>
            )}

            <div className="product-meta">
              <i
                className={`fas fa-${product.in_stock ? "check-circle" : "times-circle"}`}
              ></i>
              <span className={product.in_stock ? "in-stock" : "out-of-stock"}>
                {product.in_stock ? "В наличии" : "Нет в наличии"}
              </span>
            </div>

            <div className="product-price-block">
              {product.old_price && (
                <div className="old-price">
                  {product.old_price ? product.old_price.toLocaleString() : "0"}{" "}
                  ₽
                </div>
              )}
              <div className="current-price">
                {product.price ? product.price.toLocaleString() : "0"} ₽
              </div>
            </div>

            <div className="product-actions">
              <button className="btn btn-primary btn-large">
                <i className="fas fa-shopping-cart"></i>
                Добавить в корзину
              </button>
              <button className="btn btn-secondary btn-large">
                <i className="fas fa-phone"></i>
                Заказать звонок
              </button>
            </div>

            <div className="product-features">
              <div className="feature">
                <i className="fas fa-shield-alt"></i>
                <span>Гарантия производителя</span>
              </div>
              <div className="feature">
                <i className="fas fa-truck"></i>
                <span>Доставка по России</span>
              </div>
              <div className="feature">
                <i className="fas fa-tools"></i>
                <span>Сервисное обслуживание</span>
              </div>
            </div>
          </div>
        </div>

        {/* Описание и характеристики */}
        <div className="product-tabs">
          <div className="tabs-header">
            <button className="tab-btn active">Описание</button>
            <button className="tab-btn">Характеристики</button>
            <button className="tab-btn">Доставка</button>
          </div>

          <div className="tabs-content">
            <div className="tab-panel active">
              {product.description ? (
                <div className="product-description">{product.description}</div>
              ) : (
                <p>Описание товара будет добавлено позже.</p>
              )}
            </div>
          </div>
        </div>

        {/* Похожие товары */}
        {similarProducts && similarProducts.length > 0 && (
          <div className="similar-products">
            <h2 className="section-title">Похожие товары</h2>
            <div className="products-grid">
              {similarProducts.map((item: Product) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
