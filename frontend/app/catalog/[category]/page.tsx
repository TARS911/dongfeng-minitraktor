import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import "../catalog.css";

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
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: categorySlug } = await params;

  // Загружаем категорию
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", categorySlug)
    .single();

  if (!category) {
    notFound();
  }

  // Загружаем товары категории
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", category.id)
    .eq("in_stock", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  // Загружаем все категории для фильтров
  const { data: allCategories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div className="catalog-page">
      <div className="container">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <Link href="/">Главная</Link>
          <i className="fas fa-chevron-right"></i>
          <Link href="/catalog">Каталог</Link>
          <i className="fas fa-chevron-right"></i>
          <span>{category.name}</span>
        </div>

        <h1 className="catalog-title">{category.name}</h1>

        {category.description && (
          <p className="category-description">{category.description}</p>
        )}

        {/* Фильтры категорий */}
        <div className="category-filters">
          <Link href="/catalog" className="category-btn">
            <i className="fas fa-th"></i> Все товары
          </Link>
          {allCategories?.map((cat: Category) => (
            <Link
              key={cat.id}
              href={`/catalog/${cat.slug}`}
              className={`category-btn ${cat.slug === categorySlug ? "active" : ""}`}
            >
              <i className={getCategoryIcon(cat.slug)}></i> {cat.name}
            </Link>
          ))}
        </div>

        {/* Сетка товаров */}
        {products && products.length > 0 ? (
          <>
            <div className="products-count">
              Найдено товаров: {products.length}
            </div>

            <div className="products-grid">
              {products.map((product: Product) => (
                <div key={product.id} className="product-card">
                  {product.is_featured && (
                    <div className="product-badge">Хит</div>
                  )}
                  {product.old_price && (
                    <div className="product-discount">
                      -
                      {Math.round(
                        (1 - product.price / product.old_price) * 100,
                      )}
                      %
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
                        <i className="fas fa-industry"></i>{" "}
                        {product.manufacturer}
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

                      <button className="add-to-cart-btn">
                        <i className="fas fa-shopping-cart"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-catalog">
            <i className="fas fa-box-open"></i>
            <p>В этой категории пока нет товаров</p>
            <Link href="/catalog" className="btn btn-outline">
              Вернуться в каталог
            </Link>
          </div>
        )}
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
