import { supabase } from "../../../lib/supabase";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Link from "next/link";
import type { Metadata } from "next";
import "../../catalog.css";

// Полностью динамическая генерация - не pre-render при билде
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Подкатегории для "Запчасти на Минитракторы"
const minitractorBrands = [
  { name: "МиниТрактора Dongfeng", slug: "parts-minitractors-dongfeng" },
  { name: "МиниТрактора Foton/Lovol", slug: "parts-minitractors-foton" },
  { name: "МиниТрактора Jinma", slug: "parts-minitractors-jinma" },
  { name: "МиниТрактора Xingtai/Уралец", slug: "parts-minitractors-xingtai" },
  { name: "Shifeng", slug: "parts-minitractors-shifeng" },
];

// Маппинг брендов
const brandNames: { [key: string]: string } = {
  uralets: "Уралец",
  jinma: "Jinma (Джинма)",
  xingtai: "Xingtai (Синтай)",
  "dongfeng-parts": "DongFeng (ДонгФенг)",
  scout: "Скаут",
  foton: "Foton (Фотон, Lovol)",
  rusich: "Русич",
  mtz: "МТЗ (Беларус)",
  kentavr: "Кентавр",
  fayter: "Файтер",
  bulat: "Булат",
  shifeng: "Shifeng (Шифенг)",
  yto: "YTO",
  wirax: "WIRAX (Виракс)",
  neva: "Нева",
  catmann: "Catmann",
  chuvashpiller: "Чувашпиллер",
  "km-engines": "КМ (двигатели)",
  dlh: "DLH",
  perkins: "Perkins",
  universal: "Универсальные",
};

interface PageProps {
  params: Promise<{
    brand: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { brand } = await params;

  // Получаем название категории из БД
  const { data: categoryData } = await supabase
    .from("categories")
    .select("name, description")
    .eq("slug", brand)
    .maybeSingle();

  const categoryName = categoryData?.name || brand;
  const categoryDescription =
    categoryData?.description ||
    "Широкий ассортимент запчастей для тракторов и сельхозтехники";

  const title = `${categoryName} | БелТехФермЪ`;
  const description = `${categoryDescription}. Доставка по России. Гарантия качества.`;

  return {
    title,
    description,
    keywords: `${categoryName}, запчасти, купить запчасти, мини-трактор, фильтры, двигатели, запчасти для тракторов`,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "ru_RU",
      siteName: "БелТехФермЪ",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `/catalog/parts/${brand}`,
    },
  };
}

export default async function BrandPartsPage({ params }: PageProps) {
  const { brand } = await params;

  // Получаем название категории из БД
  const { data: categoryData } = await supabase
    .from("categories")
    .select("id, name, description")
    .eq("slug", brand)
    .maybeSingle();

  const categoryName = categoryData?.name || brand;
  const categoryDescription = categoryData?.description || "";

  // Проверяем, есть ли подкатегории для этой категории
  let subcategories: { name: string; slug: string; count: number }[] = [];

  // Если это "Запчасти на Минитракторы" - показываем бренды
  if (brand === "parts-minitractors") {
    subcategories = await Promise.all(
      minitractorBrands.map(async (subcat) => {
        const { data: subcatData } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", subcat.slug)
          .maybeSingle();

        if (!subcatData) {
          return { ...subcat, count: 0 };
        }

        const { count } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("category_id", subcatData.id)
          .eq("in_stock", true);

        return { ...subcat, count: count || 0 };
      }),
    );
  }

  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    { label: "Запчасти", href: "/catalog/parts" },
    { label: categoryName },
  ];

  // Если подкатегорий нет - получаем товары
  let products = null;
  let totalCount = 0;

  if (subcategories.length === 0 && categoryData?.id) {
    const result = await supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("category_id", categoryData.id)
      .eq("in_stock", true)
      .order("created_at", { ascending: false });

    products = result.data;
    totalCount = result.count || 0;
  }

  return (
    <div className="catalog-page">
      <div className="container">
        <div className="catalog-header">
          <Breadcrumbs items={breadcrumbItems} />
          <h1>{categoryName}</h1>
          {categoryDescription && (
            <p style={{ marginTop: "1rem", color: "#666" }}>
              {categoryDescription}
            </p>
          )}
          {subcategories.length === 0 && (
            <p
              style={{ marginTop: "0.5rem", color: "#999", fontSize: "0.9rem" }}
            >
              {totalCount} позиций
            </p>
          )}
        </div>

        {/* Если есть подкатегории - показываем их */}
        {subcategories.length > 0 ? (
          <div
            className="subcategories-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.5rem",
              marginTop: "2rem",
            }}
          >
            {subcategories.map((subcat) => (
              <Link
                key={subcat.slug}
                href={`/catalog/parts/${subcat.slug}`}
                className="subcategory-card"
                style={{
                  padding: "1.5rem",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  textDecoration: "none",
                  color: "inherit",
                  backgroundColor: "#fff",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.1rem",
                    color: "#333",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                  }}
                >
                  {subcat.name}
                </h3>
                <p
                  style={{
                    color: "#2a9d4e",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    margin: "0",
                  }}
                >
                  {subcat.count} позиций
                </p>
              </Link>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          /* Если подкатегорий нет - показываем товары */
          <div
            className="products-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.5rem",
              marginTop: "2rem",
            }}
          >
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/catalog/product/${product.slug}`}
                className="product-card"
                style={{
                  padding: "1.5rem",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  textDecoration: "none",
                  color: "inherit",
                  backgroundColor: "#fff",
                }}
              >
                <h3
                  style={{
                    fontSize: "1rem",
                    color: "#333",
                    marginBottom: "0.5rem",
                  }}
                >
                  {product.name}
                </h3>
                {product.price && (
                  <p
                    style={{
                      color: "#2a9d4e",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      margin: "0.5rem 0",
                    }}
                  >
                    {product.price.toLocaleString("ru-RU")} ₽
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div
            style={{ marginTop: "2rem", textAlign: "center", padding: "3rem" }}
          >
            <p style={{ color: "#999", fontSize: "1.1rem" }}>
              Товары в этой категории скоро появятся
            </p>
          </div>
        )}

        <div style={{ marginTop: "2rem" }}>
          <Link href="/catalog/parts" className="btn btn-secondary">
            ← Назад к категориям
          </Link>
        </div>
      </div>
    </div>
  );
}
