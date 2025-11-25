import { supabase } from "../../lib/supabase";
import Breadcrumbs from "../../components/Breadcrumbs";
import Link from "next/link";
import type { Metadata } from "next";
import "../catalog.css";

export const metadata: Metadata = {
  title: "Запчасти для мини-тракторов и сельхозтехники | БелТехФермЪ",
  description:
    "Купить запчасти для мини-тракторов и сельхозтехники в Белгороде. Более 2800 наименований: фильтры, двигатели, стартеры, генераторы. Доставка по России. Гарантия качества.",
  keywords:
    "запчасти для тракторов, купить запчасти, мини-трактор, фильтры, двигатели, стартеры, генераторы, запчасти для сельхозтехники",
  openGraph: {
    title: "Запчасти для мини-тракторов | БелТехФермЪ",
    description:
      "Более 2800 наименований запчастей для мини-тракторов. Большой выбор по брендам, низкие цены, доставка по России.",
    type: "website",
    locale: "ru_RU",
    siteName: "БелТехФермЪ",
  },
  twitter: {
    card: "summary_large_image",
    title: "Запчасти для мини-тракторов | БелТехФермЪ",
    description:
      "Более 2800 наименований запчастей. Большой выбор, низкие цены, доставка по России.",
  },
  alternates: {
    canonical: "/catalog/parts",
  },
};

// Полностью динамическая генерация
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Список подкатегорий запчастей
const partsCategories: { name: string; slug: string; description: string }[] = [
  {
    name: "Запчасти на ДВС",
    slug: "parts-engines",
    description: "Поршни, кольца, прокладки, клапаны",
  },
  {
    name: "Запчасти на Минитракторы",
    slug: "parts-minitractors",
    description: "DongFeng, Foton, Jinma, Xingtai",
  },
  {
    name: "Запчасти на Мототракторы",
    slug: "parts-mototractors",
    description: "Зубр, Crosser с колесом 16\"",
  },
  {
    name: "Запчасти на Навесное оборудование и садовую технику",
    slug: "parts-attachments",
    description: "Плуги, культиваторы, косилки, газонокосилки, триммеры",
  },
  {
    name: "Топливная система",
    slug: "parts-fuel-system",
    description: "Баки, насосы, краны, карбюраторы",
  },
  {
    name: "Фильтры",
    slug: "parts-filters",
    description: "Воздушные, топливные, масляные",
  },
  {
    name: "Гидравлика",
    slug: "parts-hydraulics",
    description: "Насосы, распределители, цилиндры",
  },
];

export default async function PartsPage() {
  // Получаем количество товаров для каждой категории из БД
  const categoriesWithCounts = await Promise.all(
    partsCategories.map(async (category) => {
      // Получаем категорию по slug
      const { data: categoryData } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", category.slug)
        .maybeSingle();

      if (!categoryData) {
        return { ...category, count: 0 };
      }

      // Считаем товары в этой категории
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("category_id", categoryData.id)
        .eq("in_stock", true);

      return { ...category, count: count || 0 };
    }),
  );

  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    { label: "Запчасти" },
  ];

  return (
    <div className="catalog-page">
      <div className="container">
        <div className="catalog-header">
          <Breadcrumbs items={breadcrumbItems} />
          <h1>Запчасти</h1>
          <p style={{ marginTop: "1rem", color: "#666" }}>
            Выберите категорию запчастей
          </p>
        </div>

        <div
          className="categories-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
            marginTop: "2rem",
          }}
        >
          {categoriesWithCounts.map((category) => (
            <Link
              key={category.slug}
              href={`/catalog/parts/${category.slug}`}
              className="category-card"
              style={{
                padding: "1.5rem",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                textAlign: "left",
                transition: "all 0.3s ease",
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <h3
                style={{
                  fontSize: "1.1rem",
                  marginBottom: "0.25rem",
                  color: "#333",
                  fontWeight: "600",
                }}
              >
                {category.name}
              </h3>
              <p style={{ color: "#666", fontSize: "0.85rem", margin: 0 }}>
                {category.description}
              </p>
              <p
                style={{
                  color: "#2a9d4e",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  marginTop: "auto",
                }}
              >
                {category.count} позиций
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
