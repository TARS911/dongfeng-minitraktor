"use client";

import { useFavorites } from "../context/FavoritesContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import "./favorites.css";

interface FavoriteProduct {
  id: number;
  name: string;
  price: number;
  image_url: string;
  slug: string;
  description?: string;
}

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites();
  const [isLoaded, setIsLoaded] = useState(false);
  const [products, setProducts] = useState<FavoriteProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Загружаем полные данные продуктов по ID из избранного
  useEffect(() => {
    if (favorites.length === 0) {
      setProducts([]);
      return;
    }

    setIsLoading(true);
    // Получаем данные всех продуктов из API
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        // Фильтруем только избранные продукты
        const favoriteProducts = data.filter((product: FavoriteProduct) =>
          favorites.includes(product.id)
        );
        setProducts(favoriteProducts);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Ошибка при загрузке избранного:", error);
        setIsLoading(false);
      });
  }, [favorites]);

  if (!isLoaded) {
    return (
      <div className="favorites-container">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="favorites-container">
        <h1>Избранное</h1>
        <div className="empty-favorites">
          <p>В избранном нет товаров</p>
          <p className="empty-hint">
            Добавьте товары в избранное используя кнопку ❤️
          </p>
          <Link href="/catalog" className="btn-primary">
            Перейти в каталог
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <h1>Избранное ({favorites.length})</h1>

      <div className="favorites-toolbar">
        <p className="favorites-count">
          Всего товаров: {favorites.length}
        </p>
        <Link href="/catalog" className="btn-continue">
          Продолжить покупки
        </Link>
      </div>

      {isLoading ? (
        <div className="loading">Загрузка товаров...</div>
      ) : (
        <div className="favorites-grid">
          {products.map((product) => (
            <div key={product.id} className="favorite-card">
              <button
                className="btn-remove-favorite"
                onClick={() => removeFavorite(product.id)}
                title="Удалить из избранного"
              >
                ✕
              </button>

              {product.image_url && (
                <Link href={`/products/${product.slug}`}>
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    width={250}
                    height={250}
                    className="favorite-image"
                  />
                </Link>
              )}

              <div className="favorite-info">
                <Link
                  href={`/products/${product.slug}`}
                  className="favorite-name"
                >
                  {product.name}
                </Link>

                {product.description && (
                  <p className="favorite-description">
                    {product.description.substring(0, 100)}
                    {product.description.length > 100 ? "..." : ""}
                  </p>
                )}

                <div className="favorite-footer">
                  <span className="favorite-price">
                    {product.price.toLocaleString("ru-RU")} ₽
                  </span>
                  <Link
                    href={`/products/${product.slug}`}
                    className="btn-view"
                  >
                    Подробнее →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
