import { supabase } from "./lib/supabase";
import Link from "next/link";
import Image from "next/image";
import {
  TractorIcon,
  PhoneIcon,
  ArrowRightIcon,
  ShoppingCartIcon,
  IndustryIcon,
  ShieldCheckIcon,
  TruckIcon,
  ToolsIcon,
  RubleIcon,
  CogsIcon,
  BoxIcon,
} from "./components/Icons";
import "./home.css";
import "./page-fix.css";

// Добавляем кеширование для ускорения загрузки
export const revalidate = 3600; // кеш на 1 час

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  old_price?: number;
  image_url: string;
  category_id: number;
  manufacturer?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export default async function HomePage() {
  // Загружаем категории
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // Загружаем хиты продаж
  const { data: featuredProducts } = await supabase
    .from("products")
    .select("*")
    .eq("is_featured", true)
    .eq("in_stock", true)
    .limit(8);

  return (
    <div className="home-page">
      {/* Hero секция */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              БелТехФермЪ
              <span className="hero-subtitle">
                Надежная техника для вашего хозяйства
              </span>
            </h1>
            <p className="hero-description">
              Мини-тракторы, навесное оборудование и запчасти с гарантией и
              доставкой
            </p>
            <div className="hero-buttons">
              <Link href="/catalog" className="btn btn-primary">
                <TractorIcon className="inline-icon" /> Перейти в каталог
              </Link>
              <Link href="/contacts" className="btn btn-secondary">
                <PhoneIcon className="inline-icon" /> Связаться с нами
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Категории */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Категории товаров</h2>
          <div className="categories-grid">
            {categories?.map((category: Category) => (
              <Link
                key={category.id}
                href={`/catalog/${category.slug}`}
                className="category-card"
              >
                <div className="category-icon">
                  {getCategoryIcon(category.slug)}
                </div>
                <h3>{category.name}</h3>
                {category.description && <p>{category.description}</p>}
                <span className="category-link">
                  Смотреть товары <ArrowRightIcon className="inline-icon" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Хиты продаж */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="featured-section">
          <div className="container">
            <h2 className="section-title">Популярные товары</h2>
            <div className="products-grid">
              {featuredProducts.map((product: Product) => (
                <div key={product.id} className="product-card">
                  <div className="product-badge">Хит</div>
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
                      <Image
                        src={product.image_url || "/images/placeholder.jpg"}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        style={{ objectFit: "cover" }}
                        priority={false}
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
                        <ShoppingCartIcon className="inline-icon" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="section-footer">
              <Link href="/catalog" className="btn btn-outline">
                Смотреть весь каталог <ArrowRightIcon className="inline-icon" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Преимущества */}
      <section className="advantages-section">
        <div className="container">
          <h2 className="section-title">Почему выбирают нас</h2>
          <div className="advantages-grid">
            <div className="advantage-card">
              <div className="advantage-icon">
                <ShieldCheckIcon />
              </div>
              <h3>Гарантия качества</h3>
              <p>Официальная гарантия на всю технику и запчасти</p>
            </div>

            <div className="advantage-card">
              <div className="advantage-icon">
                <TruckIcon />
              </div>
              <h3>Доставка</h3>
              <p>Быстрая доставка по всей России</p>
            </div>

            <div className="advantage-card">
              <div className="advantage-icon">
                <ToolsIcon />
              </div>
              <h3>Сервисное обслуживание</h3>
              <p>Профессиональный ремонт и техподдержка</p>
            </div>

            <div className="advantage-card">
              <div className="advantage-icon">
                <RubleIcon />
              </div>
              <h3>Выгодные цены</h3>
              <p>Конкурентные цены и акции для постоянных клиентов</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function getCategoryIcon(slug: string): React.ReactElement {
  const icons: { [key: string]: React.ReactElement } = {
    minitractory: <TractorIcon />,
    "communal-equipment": <TruckIcon />,
    parts: <CogsIcon />,
  };
  return icons[slug] || <BoxIcon />;
}
