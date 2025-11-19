"use client";

import { supabase } from "../../../lib/supabase";
import ProductCard from "../../../components/ProductCard";
import Breadcrumbs from "../../../components/Breadcrumbs";
import { useState, useEffect } from "react";
import "../../catalog.css";

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
  is_featured?: boolean;
  specifications?: {
    article?: string;
    source_url?: string;
  };
}

export default function DongFengPartsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Загружаем товары
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);

      // Фильтруем напрямую по manufacturer - без category_id!
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("manufacturer", "DONGFENG")
        .eq("in_stock", true)
        .order("created_at", { ascending: false });

      if (data) {
        setProducts(data);
        setFilteredProducts(data);
      }

      setLoading(false);
    }

    loadProducts();
  }, []);

  // Фильтрация по модели
  useEffect(() => {
    if (selectedModel === "all") {
      setFilteredProducts(products);
    } else {
      // Фильтруем по названию (в названии есть номер модели)
      const filtered = products.filter((product) => {
        const name = product.name.toLowerCase();
        const model = product.model?.toLowerCase() || "";

        if (selectedModel === "240-244") {
          return (
            name.includes("240") ||
            name.includes("244") ||
            model.includes("240") ||
            model.includes("244")
          );
        } else if (selectedModel === "354-404") {
          return (
            name.includes("354") ||
            name.includes("404") ||
            model.includes("354") ||
            model.includes("404")
          );
        }
        return false;
      });
      setFilteredProducts(filtered);
    }
  }, [selectedModel, products]);

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
          <p className="catalog-description">
            Оригинальные запчасти для минитракторов DongFeng
          </p>
        </div>

        {/* Фильтры по моделям */}
        <div className="model-filters" style={{ marginBottom: "2rem" }}>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <strong>Модель:</strong>
            <button
              className={`filter-btn ${selectedModel === "all" ? "active" : ""}`}
              onClick={() => setSelectedModel("all")}
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                background:
                  selectedModel === "all" ? "#2a9d4e" : "transparent",
                color: selectedModel === "all" ? "white" : "#333",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            >
              Все модели ({products.length})
            </button>
            <button
              className={`filter-btn ${selectedModel === "240-244" ? "active" : ""}`}
              onClick={() => setSelectedModel("240-244")}
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                background:
                  selectedModel === "240-244" ? "#2a9d4e" : "transparent",
                color: selectedModel === "240-244" ? "white" : "#333",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            >
              DongFeng 240-244
            </button>
            <button
              className={`filter-btn ${selectedModel === "354-404" ? "active" : ""}`}
              onClick={() => setSelectedModel("354-404")}
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                background:
                  selectedModel === "354-404" ? "#2a9d4e" : "transparent",
                color: selectedModel === "354-404" ? "white" : "#333",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            >
              DongFeng 354-404
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <p>Загрузка товаров...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-category">
            <h2>Товары не найдены</h2>
            <p>Попробуйте выбрать другую модель</p>
          </div>
        ) : (
          <>
            <div
              style={{
                marginBottom: "1rem",
                color: "#666",
                fontSize: "0.95rem",
              }}
            >
              Найдено товаров: {filteredProducts.length}
            </div>
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}

        <style jsx>{`
          .filter-btn:hover {
            border-color: #2a9d4e !important;
          }

          .catalog-description {
            color: #6b7280;
            font-size: 1.1rem;
            margin-top: 0.5rem;
          }

          @media (max-width: 768px) {
            .model-filters {
              font-size: 0.9rem;
            }

            .filter-btn {
              font-size: 0.85rem;
              padding: 0.4rem 0.8rem !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
