import { supabase } from "../../../../lib/supabase";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import "../../../catalog.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Маппинг названий двигателей
const engineNames: { [key: string]: string } = {
  r195: "R195",
  r180: "R180",
  r190: "R190",
  zs1115: "ZS1115",
  zs1100: "ZS1100",
  "4l22bt": "4L22BT",
  ty290: "TY290",
  ty295: "TY295",
  jd295: "JD295",
  ty295it: "TY295IT",
  ty2100: "TY2100",
  j285bt: "J285 BT",
  km385bt: "KM385BT",
  ll380: "LL380",
  zn390: "ZN390",
  zn490: "ZN490",
  yd385t: "YD385T",
};

interface PageProps {
  params: Promise<{
    engine: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const engineName = engineNames[resolvedParams.engine] || resolvedParams.engine.toUpperCase();

  return {
    title: `Запчасти для двигателя ${engineName} | БелТехФермЪ`,
    description: `Купить запчасти для дизельного двигателя ${engineName}. Поршни, кольца, прокладки, клапаны, головки блока. Доставка по России.`,
  };
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  old_price?: number;
  image_url: string;
  manufacturer?: string;
  in_stock: boolean;
}

export default async function EnginePartsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const engineSlug = resolvedParams.engine;
  const engineName = engineNames[engineSlug] || engineSlug.toUpperCase();

  // Ищем товары по названию двигателя в specifications или в имени
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .or(`name.ilike.%${engineName}%,specifications->>engine_model.ilike.%${engineName}%`)
    .eq("in_stock", true)
    .order("price", { ascending: true })
    .limit(100);

  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    { label: "Запчасти", href: "/catalog/parts" },
    { label: "Запчасти на ДВС", href: "/catalog/parts/parts-engines" },
    { label: engineName },
  ];

  return (
    <div className="catalog-page">
      <div className="container">
        <div className="catalog-header">
          <Breadcrumbs items={breadcrumbItems} />
          <h1>Запчасти для двигателя {engineName}</h1>
          <p style={{ marginTop: "1rem", color: "#666" }}>
            Поршни, кольца, прокладки, клапаны и другие запчасти
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
                    <p style={{ color: "#666", fontSize: "0.85rem" }}>
                      Производитель: {product.manufacturer}
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
              Товары для этого двигателя скоро появятся
            </p>
            <Link
              href="/catalog/parts/parts-engines"
              style={{
                color: "#2a9d4e",
                textDecoration: "underline",
              }}
            >
              Вернуться к списку двигателей
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
