import { supabase } from "../../../lib/supabase";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Link from "next/link";
import type { Metadata } from "next";
import "../../catalog.css";

export const metadata: Metadata = {
  title: "Запчасти на ДВС - Дизельные двигатели | БелТехФермЪ",
  description:
    "Купить запчасти для дизельных двигателей мини-тракторов. R195, ZS1115, TY290, JD295 и другие модели. Поршни, кольца, прокладки, клапаны. Доставка по России.",
  keywords:
    "запчасти двс, дизельные двигатели, запчасти R195, запчасти ZS1115, запчасти TY290",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Подкатегории дизельных двигателей (строго по mindmap!)
const dieselEngineCategories = [
  { name: "R195", slug: "r195", description: "Запчасти для двигателя R195" },
  { name: "R180", slug: "r180", description: "Запчасти для двигателя R180" },
  { name: "R190", slug: "r190", description: "Запчасти для двигателя R190" },
  { name: "ZS1115", slug: "zs1115", description: "Запчасти для двигателя ZS1115" },
  { name: "ZS1100", slug: "zs1100", description: "Запчасти для двигателя ZS1100" },
  { name: "4L22BT", slug: "4l22bt", description: "Запчасти для двигателя 4L22BT" },
  { name: "TY290", slug: "ty290", description: "Запчасти для двигателя TY290" },
  { name: "TY295", slug: "ty295", description: "Запчасти для двигателя TY295" },
  { name: "JD295", slug: "jd295", description: "Запчасти для двигателя JD295" },
  { name: "TY295IT", slug: "ty295it", description: "Запчасти для двигателя TY295IT" },
  { name: "TY2100", slug: "ty2100", description: "Запчасти для двигателя TY2100" },
  { name: "J285 BT", slug: "j285bt", description: "Запчасти для двигателя J285 BT" },
  { name: "KM385BT", slug: "km385bt", description: "Запчасти для двигателя KM385BT" },
  { name: "LL380", slug: "ll380", description: "Запчасти для двигателя LL380" },
  { name: "ZN390", slug: "zn390", description: "Запчасти для двигателя ZN390" },
  { name: "ZN490", slug: "zn490", description: "Запчасти для двигателя ZN490" },
  { name: "YD385T", slug: "yd385t", description: "Запчасти для двигателя YD385T" },
];

export default async function PartsEnginesPage() {
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    { label: "Запчасти", href: "/catalog/parts" },
    { label: "Запчасти на ДВС" },
  ];

  return (
    <div className="catalog-page">
      <div className="container">
        <div className="catalog-header">
          <Breadcrumbs items={breadcrumbItems} />
          <h1>Запчасти на ДВС</h1>
          <p style={{ marginTop: "1rem", color: "#666" }}>
            Выберите модель дизельного двигателя
          </p>
        </div>

        <div
          className="categories-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "1.5rem",
            marginTop: "2rem",
          }}
        >
          {dieselEngineCategories.map((engine) => (
            <Link
              key={engine.slug}
              href={`/catalog/parts/parts-engines/${engine.slug}`}
              className="category-card"
              style={{
                padding: "1.5rem",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                textAlign: "center",
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
                  fontSize: "1.2rem",
                  marginBottom: "0.5rem",
                  color: "#333",
                  fontWeight: "600",
                }}
              >
                {engine.name}
              </h3>
              <p style={{ color: "#666", fontSize: "0.9rem" }}>
                {engine.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
