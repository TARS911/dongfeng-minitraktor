import Link from "next/link";
import type { Metadata } from "next";
import "../catalog.css";

export const metadata: Metadata = {
  title: "Запчасти | БелТехФермЪ",
  description:
    "Запасные части для мини-тракторов и сельхозтехники. Большой выбор по брендам, низкие цены, доставка по России.",
};

// Список всех брендов запчастей
const brands = [
  { name: "Уралец", slug: "uralets", count: 110 },
  { name: "Jinma (Джинма)", slug: "jinma", count: 78 },
  { name: "Xingtai (Синтай)", slug: "xingtai", count: 52 },
  { name: "DongFeng (ДонгФенг)", slug: "dongfeng-parts", count: 41 },
  { name: "Скаут", slug: "scout", count: 40 },
  { name: "Foton (Фотон, Lovol)", slug: "foton", count: 26 },
  { name: "Русич", slug: "rusich", count: 16 },
  { name: "МТЗ (Беларус)", slug: "mtz", count: 10 },
  { name: "Кентавр", slug: "kentavr", count: 8 },
  { name: "Файтер", slug: "fayter", count: 8 },
  { name: "Булат", slug: "bulat", count: 6 },
  { name: "Shifeng (Шифенг)", slug: "shifeng", count: 4 },
  { name: "YTO", slug: "yto", count: 2 },
  { name: "WIRAX (Виракс)", slug: "wirax", count: 2 },
  { name: "Нева", slug: "neva", count: 2 },
  { name: "Catmann", slug: "catmann", count: 2 },
  { name: "Чувашпиллер", slug: "chuvashpiller", count: 2 },
  { name: "КМ (двигатели)", slug: "km-engines", count: 46 },
  { name: "DLH", slug: "dlh", count: 14 },
  { name: "Perkins", slug: "perkins", count: 2 },
  { name: "Универсальные", slug: "universal", count: 550 },
];

export default async function PartsPage() {
  return (
    <div className="catalog-page">
      <div className="container">
        <div className="catalog-header">
          <div className="breadcrumb">
            <Link href="/">Главная</Link>
            <span>/</span>
            <Link href="/catalog">Каталог</Link>
            <span>/</span>
            <span>Запчасти</span>
          </div>
          <h1>Запчасти по брендам</h1>
          <p style={{ marginTop: "1rem", color: "#666" }}>
            Выберите бренд для просмотра запчастей
          </p>
        </div>

        <div className="brands-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginTop: "2rem"
        }}>
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/catalog/parts/${brand.slug}`}
              className="brand-card"
              style={{
                padding: "1.5rem",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                textAlign: "center",
                transition: "all 0.3s ease",
                textDecoration: "none",
                color: "inherit"
              }}
            >
              <h3 style={{
                fontSize: "1.2rem",
                marginBottom: "0.5rem",
                color: "#333"
              }}>
                {brand.name}
              </h3>
              <p style={{ color: "#666", fontSize: "0.9rem" }}>
                {brand.count} позиций
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
