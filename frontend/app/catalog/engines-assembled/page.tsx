import { supabase } from "../../lib/supabase";
import Breadcrumbs from "../../components/Breadcrumbs";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import "../catalog.css";

export const metadata: Metadata = {
  title: "ДВС в Сборе - Двигатели для мини-тракторов | БелТехФермЪ",
  description:
    "Купить двигатели внутреннего сгорания в сборе для мини-тракторов в Белгороде. Дизельные двигатели для DongFeng, Foton, Jinma, Xingtai. Доставка по России. Гарантия качества.",
  keywords:
    "двигатели для тракторов, ДВС в сборе, купить двигатель, дизельный двигатель, мини-трактор, двигатель DongFeng",
  openGraph: {
    title: "ДВС в Сборе - Двигатели для мини-тракторов | БелТехФермЪ",
    description:
      "Дизельные двигатели в сборе для мини-тракторов. Большой выбор, низкие цены, доставка по России.",
    type: "website",
    locale: "ru_RU",
    siteName: "БелТехФермЪ",
  },
  twitter: {
    card: "summary_large_image",
    title: "ДВС в Сборе | БелТехФермЪ",
    description:
      "Дизельные двигатели в сборе для мини-тракторов. Большой выбор, доставка по России.",
  },
  alternates: {
    canonical: "/catalog/engines-assembled",
  },
};

// Полностью динамическая генерация
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  old_price?: number;
  image_url: string;
  manufacturer?: string;
  in_stock: boolean;
  specifications?: {
    power?: string;
    cylinders?: string;
    displacement?: string;
  };
}

export default async function EnginesAssembledPage() {
  // Получаем категорию "engines-assembled"
  const { data: category } = await supabase
    .from("categories")
    .select("id, name")
    .eq("slug", "engines-assembled")
    .maybeSingle();

  if (!category) {
    return (
      <div className="catalog-page">
        <div className="container">
          <h1>Категория не найдена</h1>
          <p>Категория "ДВС в Сборе" не найдена в базе данных.</p>
          <Link href="/catalog">Вернуться в каталог</Link>
        </div>
      </div>
    );
  }

  // Получаем все двигатели из этой категории
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", category.id)
    .eq("in_stock", true)
    .order("price", { ascending: true });

  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    { label: "ДВС в Сборе" },
  ];

  return (
    <div className="catalog-page">
      <div className="container">
        <div className="catalog-header">
          <Breadcrumbs items={breadcrumbItems} />
          <h1>ДВС в Сборе</h1>
          <p style={{ marginTop: "1rem", color: "#666" }}>
            Двигатели внутреннего сгорания в сборе для мини-тракторов
          </p>
          {products && products.length > 0 && (
            <p style={{ color: "#2a9d4e", fontWeight: "500" }}>
              Найдено товаров: {products.length}
            </p>
          )}
        </div>

        {products && products.length > 0 ? (
          <div className="products-grid" style={{ marginTop: "2rem" }}>
            {products.map((product: Product) => (
              <div key={product.id} className="product-card">
                {product.old_price && (
                  <div className="product-discount">
                    -{Math.round((1 - product.price / product.old_price) * 100)}
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
                      loading="lazy"
                    />
                  </div>
                </Link>

                <div className="product-info">
                  <Link href={`/catalog/product/${product.slug}`}>
                    <h3 className="product-name">{product.name}</h3>
                  </Link>

                  {product.manufacturer && (
                    <p style={{ color: "#666", fontSize: "0.85rem" }}>
                      Производитель: {product.manufacturer}
                    </p>
                  )}

                  {product.specifications?.power && (
                    <p style={{ color: "#666", fontSize: "0.85rem" }}>
                      Мощность: {product.specifications.power}
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
                      Подробнее
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "3rem 1rem",
              color: "#666",
            }}
          >
            <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
              Товары в этой категории скоро появятся
            </p>
            <Link
              href="/catalog/parts"
              style={{
                color: "#2a9d4e",
                textDecoration: "underline",
              }}
            >
              Посмотреть запчасти на двигатели
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
