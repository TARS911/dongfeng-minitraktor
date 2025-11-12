import { supabase } from "../../../../lib/supabase";
import ProductCard from "../../../../components/ProductCard";
import Link from "next/link";
import type { Metadata } from "next";
import "../../../catalog.css";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  old_price?: number;
  image_url: string;
  category_id: number;
  manufacturer?: string;
  is_featured?: boolean;
}

// Маппинг брендов
const brandNames: { [key: string]: string } = {
  "uralets": "Уралец",
  "jinma": "Jinma (Джинма)",
  "xingtai": "Xingtai (Синтай)",
  "dongfeng-parts": "DongFeng (ДонгФенг)",
  "scout": "Скаут",
  "foton": "Foton (Фотон, Lovol)",
  "rusich": "Русич",
  "mtz": "МТЗ (Беларус)",
  "kentavr": "Кентавр",
  "fayter": "Файтер",
  "bulat": "Булат",
  "shifeng": "Shifeng (Шифенг)",
  "yto": "YTO",
  "wirax": "WIRAX (Виракс)",
  "neva": "Нева",
  "catmann": "Catmann",
  "chuvashpiller": "Чувашпиллер",
  "km-engines": "КМ (двигатели)",
  "dlh": "DLH",
  "perkins": "Perkins",
  "universal": "Универсальные",
};

// Маппинг типов запчастей
const partTypeNames: { [key: string]: string } = {
  "filters": "Фильтра",
  "diesel-engines": "Двигателя дизельные",
  "starters-generators": "Стартеры, Генераторы",
  "universal-parts": "Универсальные комплектующие",
  "seats": "Сиденья (кресла)",
  "spare-parts-kit": "ЗИП",
  "equipment-parts": "Запчасти для навесного оборудования",
  "tractor-parts": "Запчасти для тракторов",
  "wheels-tires": "Колёса, шины, груза",
  "standard-parts": "Стандартные изделия",
  "hydraulics": "Гидравлика",
  "driveshafts": "Карданные валы",
  "other-parts": "Прочие запчасти",
};

interface PageProps {
  params: Promise<{
    brand: string;
    type: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand, type } = await params;
  const brandName = brandNames[brand] || brand;
  const typeName = partTypeNames[type] || type;

  return {
    title: `${typeName} для ${brandName} | БелТехФермЪ`,
    description: `${typeName} для ${brandName}. Большой выбор, низкие цены, доставка по России.`,
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

  return (
    <div className="catalog-page">
      <div className="container">
        <div className="catalog-header">
          <div className="breadcrumb">
            <Link href="/">Главная</Link>
            <span>/</span>
            <Link href="/catalog">Каталог</Link>
            <span>/</span>
            <Link href="/catalog/parts">Запчасти</Link>
            <span>/</span>
            <Link href={`/catalog/parts/${brand}`}>{brandName}</Link>
            <span>/</span>
            <span>{typeName}</span>
          </div>
          <h1>{typeName} для {brandName}</h1>
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
              <Link href={`/catalog/parts/${brand}`} className="btn btn-secondary">
                ← Назад к типам запчастей
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
