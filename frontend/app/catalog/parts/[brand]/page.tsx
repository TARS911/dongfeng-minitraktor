import { supabase } from "../../../lib/supabase";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Link from "next/link";
import type { Metadata } from "next";
import "../../catalog.css";

// Полностью динамическая генерация - не pre-render при билде
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Типы запчастей
const partTypes = [
  { name: "Фильтра", slug: "filters" },
  { name: "Двигателя дизельные", slug: "diesel-engines" },
  { name: "Стартеры, Генераторы", slug: "starters-generators" },
  { name: "Универсальные комплектующие", slug: "universal-parts" },
  { name: "Сиденья (кресла)", slug: "seats" },
  { name: "ЗИП", slug: "spare-parts-kit" },
  { name: "Запчасти для навесного оборудования", slug: "equipment-parts" },
  { name: "Запчасти для тракторов", slug: "tractor-parts" },
  { name: "Колёса, шины, груза", slug: "wheels-tires" },
  { name: "Стандартные изделия", slug: "standard-parts" },
  { name: "Гидравлика", slug: "hydraulics" },
  { name: "Карданные валы", slug: "driveshafts" },
  { name: "Прочие запчасти", slug: "other-parts" },
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
  const brandName = brandNames[brand] || brand;

  const title = `Запчасти для ${brandName} | БелТехФермЪ`;
  const description = `Купить запчасти для мини-тракторов ${brandName} в Белгороде. Широкий ассортимент: фильтры, двигатели, стартеры, генераторы. Доставка по России.`;

  return {
    title,
    description,
    keywords: `запчасти ${brandName}, ${brandName}, купить запчасти, мини-трактор ${brandName}, фильтры, двигатели, запчасти для тракторов`,
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
  const brandName = brandNames[brand] || brand;

  // Получаем количество товаров для каждого типа запчастей
  const partTypesWithCounts = await Promise.all(
    partTypes.map(async (type) => {
      const categorySlug = `${brand}-${type.slug}`;

      // Получаем ID категории
      const { data: category } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .single();

      if (!category) {
        return { ...type, count: 0 };
      }

      // Считаем товары в этой категории
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("category_id", category.id)
        .eq("in_stock", true);

      return { ...type, count: count || 0 };
    }),
  );

  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    { label: "Запчасти", href: "/catalog/parts" },
    { label: brandName },
  ];

  return (
    <div className="catalog-page">
      <div className="container">
        <div className="catalog-header">
          <Breadcrumbs items={breadcrumbItems} />
          <h1>Запчасти {brandName}</h1>
          <p style={{ marginTop: "1rem", color: "#666" }}>
            Выберите тип запчастей
          </p>
        </div>

        <div
          className="part-types-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
            marginTop: "2rem",
          }}
        >
          {partTypesWithCounts.map((type) => (
            <Link
              key={type.slug}
              href={`/catalog/parts/${brand}/${type.slug}`}
              className="part-type-card"
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
                }}
              >
                {type.name}
              </h3>
              <p style={{ color: "#666", fontSize: "0.9rem", margin: "0" }}>
                {type.count}{" "}
                {type.count === 1
                  ? "товар"
                  : type.count < 5
                    ? "товара"
                    : "товаров"}
              </p>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: "2rem" }}>
          <Link href="/catalog/parts" className="btn btn-secondary">
            ← Назад к брендам
          </Link>
        </div>
      </div>
    </div>
  );
}
