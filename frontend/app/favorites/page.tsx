/**
 * favorites/page.tsx
 *
 * Страница избранных товаров с полной информацией о каждом товаре.
 * Загружает данные продуктов из API на основе ID из FavoritesContext.
 *
 * Интерфейсы:
 * - FavoriteProduct (line 19): Модель данных товара для избранного
 *
 * Функции:
 * - FavoritesPage (line 28): Основной компонент страницы избранного
 * - useEffect (line 33): Инициализация isLoaded для предотвращения hydration mismatch
 * - useEffect (line 38): Загрузка полных данных продуктов из API
 *
 * Состояния:
 * - Empty state (line 70): Пустое избранное с призывом к действию
 * - Loading state (line 62): Индикатор загрузки
 * - Content state (line 87): Отображение сетки избранных товаров
 */

"use client";

import { useFavorites } from "../context/FavoritesContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SkeletonCard from "../components/SkeletonCard";
import "./favorites.css";

/**
 * FavoriteProduct - Интерфейс данных товара в избранном
 *
 * @property {number} id - Уникальный идентификатор товара
 * @property {string} name - Название товара
 * @property {number} price - Цена в рублях
 * @property {string} image_url - URL изображения товара
 * @property {string} slug - URL-friendly идентификатор для роутинга
 * @property {string} [description] - Опциональное описание товара
 */
interface FavoriteProduct {
  id: number;
  name: string;
  price: number;
  image_url: string;
  slug: string;
  description?: string;
}

/**
 * FavoritesPage - Компонент страницы избранного
 *
 * Отображает все товары, добавленные в избранное:
 * - Загружает полные данные из API по ID из FavoritesContext
 * - Показывает карточки товаров с изображением, ценой и описанием
 * - Позволяет удалить товар из избранного
 * - Отображает empty state если избранное пустое
 *
 * @returns {JSX.Element} Страница со списком избранных товаров
 */
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
        // API возвращает { products: [] }, извлекаем массив
        const productsArray = data.products || [];
        // Фильтруем только избранные продукты
        const favoriteProducts = productsArray.filter(
          (product: FavoriteProduct) => favorites.includes(product.id),
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
        <p className="favorites-count">Всего товаров: {favorites.length}</p>
        <Link href="/catalog" className="btn-continue">
          Продолжить покупки
        </Link>
      </div>

      {isLoading ? (
        <div className="favorites-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="favorites-grid">
          {products.map((product) => (
            <div key={product.id} className="favorite-card fade-in hover-lift">
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
                    {product.price
                      ? product.price.toLocaleString("ru-RU")
                      : "0"}{" "}
                    ₽
                  </span>
                  <Link href={`/products/${product.slug}`} className="btn-view">
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
