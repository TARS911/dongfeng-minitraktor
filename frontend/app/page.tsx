import { supabase } from "./lib/supabase";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  TractorIcon,
  PhoneIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  TruckIcon,
  ToolsIcon,
  RubleIcon,
  CogsIcon,
  BoxIcon,
} from "./components/Icons";
import "./home.css";
import "./page-fix.css";

// Lazy loading для ProductCard - загружается только когда нужен
const ProductCard = dynamic(() => import("./components/ProductCard"), {
  loading: () => <div className="skeleton-card">Загрузка...</div>,
  ssr: true, // Включаем SSR для SEO
});

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
  // Загружаем только основные категории (первые 3)
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .in("slug", ["mini-tractors", "parts", "equipment"])
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
              Мини-тракторы, коммунальная техника и запчасти с гарантией и
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
                <ProductCard key={product.id} product={product} />
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

          {/* Основные преимущества */}
          <div className="advantages-grid">
            <div className="advantage-card">
              <div className="advantage-icon">
                <ShieldCheckIcon />
              </div>
              <h3>Гарантия качества</h3>
              <p>Официальная гарантия на всю технику от 12 до 24 месяцев</p>
            </div>

            <div className="advantage-card">
              <div className="advantage-icon">
                <TruckIcon />
              </div>
              <h3>Бесплатная доставка</h3>
              <p>
                Доставка по России от 3 дней. Бесплатно при заказе от 50 000 ₽
              </p>
            </div>

            <div className="advantage-card">
              <div className="advantage-icon">
                <ToolsIcon />
              </div>
              <h3>Сервисное обслуживание</h3>
              <p>15+ сервисных центров по всей стране</p>
            </div>

            <div className="advantage-card">
              <div className="advantage-icon">
                <RubleIcon />
              </div>
              <h3>Рассрочка 0%</h3>
              <p>Рассрочка без переплат до 12 месяцев. Быстрое оформление</p>
            </div>
          </div>

          {/* Статистика - доверительные цифры */}
          <div className="trust-stats">
            <div className="trust-stat">
              <div className="trust-stat-number">5+</div>
              <div className="trust-stat-label">лет на рынке</div>
            </div>
            <div className="trust-stat">
              <div className="trust-stat-number">3000+</div>
              <div className="trust-stat-label">довольных клиентов</div>
            </div>
            <div className="trust-stat">
              <div className="trust-stat-number">15+</div>
              <div className="trust-stat-label">сервисных центров</div>
            </div>
            <div className="trust-stat">
              <div className="trust-stat-number">100%</div>
              <div className="trust-stat-label">гарантия возврата</div>
            </div>
          </div>

          {/* Гарантии */}
          <div className="guarantees-section">
            <div className="guarantee-item">
              <span className="guarantee-icon">✓</span>
              <span className="guarantee-text">
                Официальный дилер ведущих производителей
              </span>
            </div>
            <div className="guarantee-item">
              <span className="guarantee-icon">✓</span>
              <span className="guarantee-text">Все товары сертифицированы</span>
            </div>
            <div className="guarantee-item">
              <span className="guarantee-icon">✓</span>
              <span className="guarantee-text">
                Гарантия лучшей цены - вернем разницу
              </span>
            </div>
            <div className="guarantee-item">
              <span className="guarantee-icon">✓</span>
              <span className="guarantee-text">
                Бесплатная консультация специалиста
              </span>
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
