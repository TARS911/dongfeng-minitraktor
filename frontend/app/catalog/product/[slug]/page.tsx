"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import ProductCard from "../../../../components/ProductCard";
import { useCart } from "../../../../hooks/useCart";
import { useModal } from "../../../../hooks/useModal";
import CallbackModal from "../../../../components/modals/CallbackModal";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./product.css";

import { Product, Category } from "../../../../types";

export default function ProductPage() {
  const { slug } = useParams();
  const decodedSlug = decodeURIComponent(slug as string);

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const { addToCart, cart } = useCart();
  const { openModal } = useModal();
  const [isInCart, setIsInCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data: productData } = await supabase
        .from("products")
        .select("*")
        .eq("slug", decodedSlug)
        .single();

      if (productData) {
        setProduct(productData);
        fetchCategory(productData.category_id);
        fetchSimilarProducts(productData.category_id, productData.id);
      } else {
        notFound();
      }
    };

    const fetchCategory = async (categoryId: number) => {
      const { data: categoryData } = await supabase
        .from("categories")
        .select("*")
        .eq("id", categoryId)
        .single();
      setCategory(categoryData);
    };

    const fetchSimilarProducts = async (categoryId: number, productId: number) => {
      const { data: similarProductsData } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", categoryId)
        .eq("in_stock", true)
        .neq("id", productId)
        .limit(4);
      setSimilarProducts(similarProductsData || []);
    };

    fetchProduct();
  }, [decodedSlug]);

  useEffect(() => {
    if (product) {
      setIsInCart(cart.some((item) => item.id === product.id));
    }
  }, [cart, product]);
  
  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast.success(`${product.name} добавлен в корзину!`);
    }
  };

  if (!product) {
    return <div>Загрузка...</div>;
  }

  return (
    <>
      <div className="product-page">
        <div className="container">
          {/* Breadcrumbs */}
          <div className="breadcrumbs">
            <Link href="/">Главная</Link>
            <i className="fas fa-chevron-right"></i>
            <Link href="/catalog">Каталог</Link>
            {category && (
              <>
                <i className="fas fa-chevron-right"></i>
                <Link href={`/catalog/${category.slug}`}>{category.name}</Link>
              </>
            )}
            <i className="fas fa-chevron-right"></i>
            <span>{product.name}</span>
          </div>

          {/* Основная информация о товаре */}
          <div className="product-main">
            <div className="product-gallery">
              <div className="product-main-image">
                {product.is_featured && (
                  <div className="product-badge">Хит продаж</div>
                )}
                {product.old_price && (
                  <div className="product-discount">
                    -{Math.round((1 - product.price / product.old_price) * 100)}%
                  </div>
                )}
                <img
                  src={product.image_url || "/images/placeholder.jpg"}
                  alt={product.name}
                />
              </div>
            </div>

            <div className="product-details">
              <h1 className="product-title">{product.name}</h1>

              {product.manufacturer && (
                <div className="product-meta">
                  <i className="fas fa-industry"></i>
                  <span>
                    Производитель: <strong>{product.manufacturer}</strong>
                  </span>
                </div>
              )}

              {product.power && (
                <div className="product-meta">
                  <i className="fas fa-bolt"></i>
                  <span>
                    Мощность: <strong>{product.power}</strong>
                  </span>
                </div>
              )}

              <div className="product-meta">
                <i
                  className={`fas fa-${product.in_stock ? "check-circle" : "times-circle"}`}
                ></i>
                <span className={product.in_stock ? "in-stock" : "out-of-stock"}>
                  {product.in_stock ? "В наличии" : "Нет в наличии"}
                </span>
              </div>

              <div className="product-price-block">
                {product.old_price && (
                  <div className="old-price">
                    {product.old_price ? product.old_price.toLocaleString() : "0"}{" "}
                    ₽
                  </div>
                )}
                <div className="current-price">
                  {product.price ? product.price.toLocaleString() : "0"} ₽
                </div>
              </div>

              <div className="product-actions">
              <button 
                className="btn btn-primary btn-large" 
                onClick={handleAddToCart}
                disabled={isInCart}
              >
                <i className="fas fa-shopping-cart"></i>
                {isInCart ? "Добавлено" : "Добавить в корзину"}
              </button>
                <button
                  className="btn btn-secondary btn-large"
                  onClick={() => openModal()}
                >
                  <i className="fas fa-phone"></i>
                  Заказать звонок
                </button>
              </div>

              <div className="product-features">
                <div className="feature">
                  <i className="fas fa-shield-alt"></i>
                  <span>Гарантия производителя</span>
                </div>
                <div className="feature">
                  <i className="fas fa-truck"></i>
                  <span>Доставка по России</span>
                </div>
                <div className="feature">
                  <i className="fas fa-tools"></i>
                  <span>Сервисное обслуживание</span>
                </div>
              </div>
            </div>
          </div>

          {/* Описание и характеристики */}
          <div className="product-tabs">
            <div className="tabs-header">
              <button className="tab-btn active">Описание</button>
              <button className="tab-btn">Характеристики</button>
              <button className="tab-btn">Доставка</button>
            </div>

            <div className="tabs-content">
              <div className="tab-panel active">
                {product.description ? (
                  <div className="product-description">{product.description}</div>
                ) : (
                  <p>Описание товара будет добавлено позже.</p>
                )}
              </div>
            </div>
          </div>

          {/* Похожие товары */}
          {similarProducts && similarProducts.length > 0 && (
            <div className="similar-products">
              <h2 className="section-title">Похожие товары</h2>
              <div className="products-grid">
                {similarProducts.map((item: Product) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <CallbackModal />
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
}
