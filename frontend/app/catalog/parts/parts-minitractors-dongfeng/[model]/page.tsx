"use client";

import { supabase } from "../../../../lib/supabase";
import ProductCard from "../../../../components/ProductCard";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
  model?: string;
  in_stock?: boolean;
  is_featured?: boolean;
}

export default function DongFengModelPage() {
  const params = useParams();
  const model = params.model as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const modelName =
    model === "240-244" ? "DongFeng 240-244" : "DongFeng 354-404";

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);

      // Загружаем все товары DongFeng
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("manufacturer", "DONGFENG")
        .eq("in_stock", true)
        .order("created_at", { ascending: false });

      if (data) {
        // Фильтруем по модели
        const filtered = data.filter((product: Product) => {
          const name = product.name.toLowerCase();
          const productModel = product.model?.toLowerCase() || "";

          if (model === "240-244") {
            return (
              name.includes("240") ||
              name.includes("244") ||
              productModel.includes("240") ||
              productModel.includes("244")
            );
          } else if (model === "354-404") {
            return (
              name.includes("354") ||
              name.includes("404") ||
              productModel.includes("354") ||
              productModel.includes("404")
            );
          }
          return false;
        });

        setProducts(filtered);
      }

      setLoading(false);
    }

    loadProducts();
  }, [model]);

  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    { label: "Запчасти", href: "/catalog/parts" },
    {
      label: "DongFeng",
      href: "/catalog/parts/parts-minitractors-dongfeng",
    },
    { label: modelName },
  ];

  return (
    <div className="catalog-page">
      <div className="container">
        <div className="catalog-header">
          <Breadcrumbs items={breadcrumbItems} />
          <h1>Запчасти {modelName}</h1>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <p>Загрузка товаров...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-category">
            <h2>Товары не найдены</h2>
            <p>В данной категории пока нет товаров</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "1rem", color: "#666" }}>
              Найдено товаров: {products.length}
            </div>
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
