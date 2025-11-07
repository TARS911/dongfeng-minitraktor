"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useCompare } from "../context/CompareContext";
import {
  ShoppingCartIcon,
  IndustryIcon,
  ArrowRightIcon,
} from "./Icons";

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

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toggleCompare, isInCompare } = useCompare();

  const [isLoaded, setIsLoaded] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [isComp, setIsComp] = useState(false);

  // Инициализируем состояние после гидратации
  useEffect(() => {
    setIsFav(isFavorite(product.id));
    setIsComp(isInCompare(product.id));
    setIsLoaded(true);
  }, [product.id, isFavorite, isInCompare]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      slug: product.slug,
    });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(product.id);
    setIsFav(!isFav);
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleCompare(product);
    setIsComp(!isComp);
  };

  const discount = product.old_price
    ? Math.round((1 - product.price / product.old_price) * 100)
    : 0;

  return (
    <div className="product-card">
      {product.is_featured && <div className="product-badge">Хит</div>}
      {discount > 0 && <div className="product-discount">-{discount}%</div>}

      <Link href={`/catalog/product/${product.slug}`}>
        <div className="product-image">
          <Image
            src={product.image_url || "/images/placeholder.jpg"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            style={{ objectFit: "cover" }}
            loading="lazy"
          />
        </div>
      </Link>

      <div className="product-info">
        <Link href={`/catalog/product/${product.slug}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>

        {product.manufacturer && (
          <p className="product-manufacturer">
            <IndustryIcon className="inline-icon" />
            {product.manufacturer}
          </p>
        )}

        <div className="product-footer">
          <div className="product-price">
            {product.old_price && (
              <span className="old-price">
                {product.old_price.toLocaleString()} ₽
              </span>
            )}
            <span className="current-price">
              {product.price.toLocaleString()} ₽
            </span>
          </div>

          <div className="product-actions">
            {isLoaded && (
              <>
                <button
                  className={`favorite-btn ${isFav ? "active" : ""}`}
                  onClick={handleToggleFavorite}
                  title={isFav ? "Удалить из избранного" : "Добавить в избранное"}
                  aria-label="Избранное"
                >
                  ❤️
                </button>
                <button
                  className={`compare-btn ${isComp ? "active" : ""}`}
                  onClick={handleToggleCompare}
                  title={isComp ? "Удалить из сравнения" : "Добавить в сравнение"}
                  aria-label="Сравнение"
                >
                  ⚖️
                </button>
              </>
            )}
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              title="Добавить в корзину"
              aria-label="Добавить в корзину"
            >
              <ShoppingCartIcon className="inline-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
