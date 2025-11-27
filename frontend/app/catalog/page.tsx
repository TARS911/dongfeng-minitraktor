import { supabase } from "../lib/supabase";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  TractorIcon,
  ShoppingCartIcon,
  IndustryIcon,
  BoltIcon,
  BoxIcon,
  CogsIcon,
  TruckIcon,
  GridIcon,
  BoxOpenIcon,
} from "../components/Icons";
import "./catalog.css";

export const metadata: Metadata = {
  title: "Каталог товаров | БелТехФермЪ - Мини-тракторы и запчасти",
  description:
    "Полный каталог мини-тракторов, навесного оборудования и запчастей. Низкие цены, большой выбор, доставка по России.",
  keywords:
    "каталог мини-тракторов, сельхозтехника, запчасти, оборудование, цены",
  openGraph: {
    title: "Каталог товаров | БелТехФермЪ",
    description: "Полный каталог мини-тракторов и сельхозтехники",
    url: "https://beltehferm.netlify.app/catalog",
    type: "website",
  },
};

import { Product } from "../../types";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default async function CatalogPage() {
  return (
    <div className="catalog-page">
      <div className="container">
        <h1 className="catalog-title">Каталог товаров</h1>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "2rem" }}>
          Выберите категорию для просмотра товаров
        </p>

        {/* Фильтры категорий */}
        <div className="category-filters">
          <Link href="/catalog/parts" className="catalog-main-category-btn">
            <CogsIcon className="inline-icon" /> Запчасти
          </Link>
          <Link href="/catalog/mini-tractors" className="catalog-main-category-btn">
            <TractorIcon className="inline-icon" /> Мини-тракторы
          </Link>
          <Link href="/catalog/equipment" className="catalog-main-category-btn">
            <TruckIcon className="inline-icon" /> Оборудование
          </Link>
        </div>
      </div>
    </div>
  );
}
