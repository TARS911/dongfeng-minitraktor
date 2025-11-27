import { supabase } from "../../../../lib/supabase";
import ProductCard from "../../../../components/ProductCard";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import Link from "next/link";
import type { Metadata } from "next";
import "../../../catalog.css";

// Полностью динамическая генерация - не pre-render при билде
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Product } from "../../../../types";

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

// Маппинг типов запчастей
const partTypeNames: { [key: string]: string } = {
  filters: "Фильтра",
  "diesel-engines": "Двигателя дизельные",
  "starters-generators": "Стартеры, Генераторы",
  "universal-parts": "Универсальные комплектующие",
  seats: "Сиденья (кресла)",
  "spare-parts-kit": "ЗИП",
  "equipment-parts": "Запчасти для навесного оборудования",
  "tractor-parts": "Запчасти для тракторов",
  "wheels-tires": "Колёса, шины, груза",
  "standard-parts": "Стандартные изделия",
  hydraulics: "Гидравлика",
  driveshafts: "Карданные валы",
  "other-parts": "Прочие запчасти",
};

interface PageProps {
  params: Promise<{
    brand: string;
    type: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { brand, type } = await params;
  const brandName = brandNames[brand] || brand;
  const typeName = partTypeNames[type] || type;

  const title = `${typeName} для ${brandName} | БелТехФермЪ`;
  const description = `Купить ${typeName.toLowerCase()} для ${brandName} в Белгороде. Большой выбор запчастей, низкие цены, быстрая доставка по России. Гарантия качества.`;

  return {
    title,
    description,
    keywords: `${typeName}, ${brandName}, запчасти ${brandName}, купить ${typeName.toLowerCase()}, запчасти для тракторов, мини-трактор`,
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
      canonical: `/catalog/parts/${brand}/${type}`,
    },
  };
}

async function getProducts(brand: string, type: string): Promise<Product[]> {
  // Формируем slug категории: brand-type
  const categorySlug = `${brand}-${type}`;

  // Получаем ID категории
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .single();

  if (!category) return [];

  // Получаем товары из этой категории
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", category.id)
    .eq("in_stock", true)
    .order("created_at", { ascending: false });

  return products || [];
}

export default async function PartTypePage({ params }: PageProps) {
  const { brand, type } = await params;
  const brandName = brandNames[brand] || brand;
  const typeName = partTypeNames[type] || type;

  const products = await getProducts(brand, type);

  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    { label: "Запчасти", href: "/catalog/parts" },
    { label: brandName, href: `/catalog/parts/${brand}` },
    { label: typeName },
  ];

  return (
    <div className="catalog-page">
      <div className="container">
        <div className="catalog-header">
          <Breadcrumbs items={breadcrumbItems} />
          <h1>
            {typeName} для {brandName}
          </h1>
        </div>

        {products.length === 0 ? (
          <div className="empty-category">
            <h2>В этой категории пока нет товаров</h2>
            <p>Мы работаем над пополнением ассортимента</p>
            <Link href={`/catalog/parts/${brand}`} className="btn-back">
              ← Назад к типам запчастей
            </Link>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div style={{ marginTop: "2rem" }}>
              <Link
                href={`/catalog/parts/${brand}`}
                className="btn btn-secondary"
              >
                ← Назад к типам запчастей
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
