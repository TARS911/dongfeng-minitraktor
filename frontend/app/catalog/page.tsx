import { supabase } from "../lib/supabase";
import Link from "next/link";
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
            <GridIcon className="inline-icon" /> Все товары
          </Link>
          {categories?.map((category: Category) => (
            <Link
              key={category.id}
              href={`/catalog/${category.slug}`}
              className="category-btn"
            >
              {getCategoryIcon(category.slug)} {category.name}
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
    minitractory: <TractorIcon className="inline-icon" />,
    "communal-equipment": <TruckIcon className="inline-icon" />,
    parts: <CogsIcon className="inline-icon" />,
  };
  return icons[slug] || <BoxIcon className="inline-icon" />;
}

function addToCart(product: Product) {
  // Client-side функция для добавления в корзину
  console.log("Add to cart:", product);
}
