import { supabase } from "../lib/supabase";
import Link from "next/link";
import "./catalog.css";

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
  // Загружаем категории
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // Загружаем все товары
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("in_stock", true)
    .order("created_at", { ascending: false });

  return (
    <div className="catalog-page">
      <div className="container">
        <h1 className="catalog-title">Каталог товаров</h1>

        {/* Фильтры категорий */}
        <div className="category-filters">
          <Link href="/catalog" className="category-btn active">
            <i className="fas fa-th"></i> Все товары
          </Link>
          {categories?.map((category: Category) => (
            <Link
              key={category.id}
              href={`/catalog/${category.slug}`}
              className="category-btn"
            >
              <i className={getCategoryIcon(category.slug)}></i> {category.name}
            </Link>
          ))}
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
                  <img
                    src={product.image_url || "/images/placeholder.jpg"}
                    alt={product.name}
                  />
                </div>
              </Link>

              <div className="product-info">
                <Link href={`/catalog/product/${product.slug}`}>
                  <h3 className="product-name">{product.name}</h3>
                </Link>

                {product.manufacturer && (
                  <p className="product-manufacturer">
                    <i className="fas fa-industry"></i> {product.manufacturer}
                  </p>
                )}

                {product.power && (
                  <p className="product-specs">
                    <i className="fas fa-bolt"></i> {product.power}
                  </p>
                )}

                <div className="product-footer">
                  <div className="product-price">
                    {product.old_price && (
                      <span className="old-price">
                        {product.old_price.toLocaleString()} ₽
                      </span>
                    )}
                    <span className="current-price">
                      {product.price.toLocaleString()} ₽
                    </span>
                  </div>

                  <Link
                    href={`/catalog/product/${product.slug}`}
                    className="add-to-cart-btn"
                  >
                    <i className="fas fa-shopping-cart"></i>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!products ||
          (products.length === 0 && (
            <div className="empty-catalog">
              <i className="fas fa-box-open"></i>
              <p>Товары скоро появятся</p>
            </div>
          ))}
      </div>
    </div>
  );
}

function getCategoryIcon(slug: string): string {
  const icons: { [key: string]: string } = {
    minitractory: "fas fa-tractor",
    "communal-equipment": "fas fa-snowplow",
    parts: "fas fa-cogs",
  };
  return icons[slug] || "fas fa-box";
}

function addToCart(product: Product) {
  // Client-side функция для добавления в корзину
  console.log("Add to cart:", product);
}
