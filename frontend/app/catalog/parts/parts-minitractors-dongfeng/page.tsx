import Link from "next/link";
import Breadcrumbs from "../../../components/Breadcrumbs";
import type { Metadata } from "next";
import { supabase } from "../../../lib/supabase";
import ProductCard from "../../../components/ProductCard";
import "../../catalog.css";

export const metadata: Metadata = {
  title: "Запчасти DongFeng (ДонгФенг) - 1000 товаров | БелТехФермЪ",
  description:
    "Полный каталог запчастей для минитракторов DongFeng. Все модели: 240, 244, 354, 404, 504, 904, 1304E и другие.",
};

const dongfengModels = [
  {
    id: "240-244",
    title: "DongFeng 240-244",
    description: "Запчасти для моделей DongFeng 240, 244",
    icon: "🚜",
  },
  {
    id: "354-404",
    title: "DongFeng 354-404",
    description: "Запчасти для моделей DongFeng 354, 404",
    icon: "🚜",
  },
];

export default async function DongFengPartsPage() {
  // Загружаем ВСЕ товары DongFeng
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("manufacturer", "DongFeng")
    .eq("in_stock", true)
    .order("price", { ascending: true })
    .limit(100); // Первые 100 товаров
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    { label: "Запчасти", href: "/catalog/parts" },
    { label: "DongFeng" },
  ];

  return (
    <div className="catalog-page">
      <div className="container">
        <div className="catalog-header">
          <Breadcrumbs items={breadcrumbItems} />
          <h1>Запчасти DongFeng</h1>
          <p style={{ marginTop: "1rem", color: "#666" }}>
            Выберите модель минитрактора
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
            margin: "2rem 0",
          }}
        >
          {dongfengModels.map((model) => (
            <Link
              key={model.id}
              href={`/catalog/parts/parts-minitractors-dongfeng/${model.id}`}
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "2rem",
                textDecoration: "none",
                color: "inherit",
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ fontSize: "3rem", textAlign: "center" }}>
                {model.icon}
              </div>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "#1f2937",
                  margin: 0,
                }}
              >
                {model.title}
              </h3>
              <p style={{ color: "#6b7280", fontSize: "0.95rem", margin: 0 }}>
                {model.description}
              </p>
              <span style={{ color: "#2a9d4e", fontWeight: 500 }}>
                Перейти к запчастям →
              </span>
            </Link>
          ))}
        </div>

        <Link href="/catalog/parts" className="btn btn-secondary">
          ← Назад
        </Link>
      </div>
    </div>
  );
}
