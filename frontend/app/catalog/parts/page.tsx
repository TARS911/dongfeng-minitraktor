import { supabase } from "../../lib/supabase";
import Link from "next/link";
import type { Metadata } from "next";
import "../catalog.css";

export const metadata: Metadata = {
  title: "Запчасти | БелТехФермЪ",
  description:
    "Запасные части для мини-тракторов и сельхозтехники. Большой выбор по брендам, низкие цены, доставка по России.",
};

// Кешируем страницу на 1 час
export const revalidate = 3600;

// Список всех брендов запчастей (без count - будем считать из БД)
const brands = [
  { name: "Уралец", slug: "uralets" },
  { name: "Jinma (Джинма)", slug: "jinma" },
  { name: "Xingtai (Синтай)", slug: "xingtai" },
  { name: "DongFeng (ДонгФенг)", slug: "dongfeng-parts" },
  { name: "Скаут", slug: "scout" },
  { name: "Foton (Фотон, Lovol)", slug: "foton" },
  { name: "Русич", slug: "rusich" },
  { name: "МТЗ (Беларус)", slug: "mtz" },
  { name: "Кентавр", slug: "kentavr" },
  { name: "Файтер", slug: "fayter" },
  { name: "Булат", slug: "bulat" },
  { name: "Shifeng (Шифенг)", slug: "shifeng" },
  { name: "YTO", slug: "yto" },
  { name: "WIRAX (Виракс)", slug: "wirax" },
  { name: "Нева", slug: "neva" },
  { name: "Catmann", slug: "catmann" },
  { name: "Чувашпиллер", slug: "chuvashpiller" },
  { name: "КМ (двигатели)", slug: "km-engines" },
  { name: "DLH", slug: "dlh" },
  { name: "Perkins", slug: "perkins" },
  { name: "Универсальные", slug: "universal" },
];

export default async function PartsPage() {
  // Получаем количество товаров для каждого бренда из БД
  const brandsWithCounts = await Promise.all(
    brands.map(async (brand) => {
      // Получаем все категории этого бренда (brand-*)
      const { data: categories } = await supabase
        .from("categories")
        .select("id")
        .like("slug", `${brand.slug}-%`);

      if (!categories || categories.length === 0) {
        return { ...brand, count: 0 };
      }

      const categoryIds = categories.map((c) => c.id);

      // Считаем все товары во всех категориях этого бренда
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .in("category_id", categoryIds)
        .eq("in_stock", true);

      return { ...brand, count: count || 0 };
    }),
  );
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

        <div
          className="brands-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "1.5rem",
            marginTop: "2rem",
          }}
        >
          {brandsWithCounts.map((brand) => (
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
                color: "inherit",
              }}
            >
              <h3
                style={{
                  fontSize: "1.2rem",
                  marginBottom: "0.5rem",
                  color: "#333",
                }}
              >
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
