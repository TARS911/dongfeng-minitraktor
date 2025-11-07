/**
 * ProductCard.tsx
 *
 * Карточка товара с интерактивными кнопками (корзина, избранное, сравнение).
 * Отображает информацию о товаре: изображение, название, цену, скидки, производителя.
 *
 * Интерфейсы:
 * - Product (line 18): Модель данных товара
 * - ProductCardProps (line 30): Props компонента карточки
 *
 * Функции:
 * - ProductCard (line 34): Основной компонент карточки товара
 * - useEffect (line 44): Инициализация состояния избранного и сравнения после гидратации
 * - handleAddToCart (line 50): Обработчик добавления товара в корзину
 * - handleToggleFavorite (line 61): Обработчик переключения избранного
 * - handleToggleCompare (line 67): Обработчик переключения сравнения
 * - discount calculation (line 73): Расчет процента скидки
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useCompare } from "../context/CompareContext";
import { ShoppingCartIcon, IndustryIcon, ArrowRightIcon } from "./Icons";

// Интерфейсы
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

/**
 * ProductCard - Компонент карточки товара
 *
 * Отображает товар с возможностью:
 * - Просмотра деталей (клик на карточку)
 * - Добавления в корзину
 * - Добавления в избранное
 * - Добавления в сравнение
 *
 * @param {ProductCardProps} props - Props с данными товара
 * @returns {JSX.Element} Карточка товара
 */
export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toggleCompare, isInCompare } = useCompare();

  // Локальное состояние для предотвращения hydration mismatch
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [isComp, setIsComp] = useState(false);

  /**
   * Инициализация состояния после монтирования (client-side)
   * Предотвращает ошибки hydration mismatch между SSR и клиентом
   */
  useEffect(() => {
    setIsFav(isFavorite(product.id));
    setIsComp(isInCompare(product.id));
    setIsLoaded(true);
  }, [product.id, isFavorite, isInCompare]);

  /**
   * handleAddToCart - Добавление товара в корзину
   * Предотвращает переход по ссылке и вызывает addToCart из Context
   *
   * @param {React.MouseEvent} e - Событие клика мыши
   */
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

  /**
   * handleToggleFavorite - Переключение состояния избранного
   * Обновляет локальное состояние и вызывает toggleFavorite из Context
   *
   * @param {React.MouseEvent} e - Событие клика мыши
   */
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(product.id);
    setIsFav(!isFav);
  };

  /**
   * handleToggleCompare - Переключение состояния сравнения
   * Обновляет локальное состояние и вызывает toggleCompare из Context
   *
   * @param {React.MouseEvent} e - Событие клика мыши
   */
  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleCompare(product);
    setIsComp(!isComp);
  };

  /**
   * Расчет процента скидки если есть старая цена
   * Формула: (1 - текущая_цена / старая_цена) * 100
   */
  const discount = product.old_price
    ? Math.round((1 - product.price / product.old_price) * 100)
    : 0;

  return (
    <div className="product-card fade-in hover-lift">
      {/* Бейдж "Хит" для популярных товаров */}
      {product.is_featured && <div className="product-badge">Хит</div>}

      {/* Бейдж скидки */}
      {discount > 0 && <div className="product-discount">-{discount}%</div>}

      {/* Изображение товара с оптимизацией Next.js Image */}
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
        {/* Название товара */}
        <Link href={`/catalog/product/${product.slug}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>

        {/* Производитель (если указан) */}
        {product.manufacturer && (
          <p className="product-manufacturer">
            <IndustryIcon className="inline-icon" />
            {product.manufacturer}
          </p>
        )}

        <div className="product-footer">
          {/* Блок цен (старая и текущая) */}
          <div className="product-price">
            {product.old_price && (
              <span className="old-price">
                {product.old_price ? product.old_price.toLocaleString() : "0"} ₽
              </span>
            )}
            <span className="current-price">
              {product.price ? product.price.toLocaleString() : "0"} ₽
            </span>
          </div>

          {/* Блок действий (избранное, сравнение, корзина) */}
          <div className="product-actions">
            {/* Кнопки избранного и сравнения показываются только после загрузки */}
            {isLoaded && (
              <>
                <button
                  className={`favorite-btn ${isFav ? "active" : ""}`}
                  onClick={handleToggleFavorite}
                  title={
                    isFav ? "Удалить из избранного" : "Добавить в избранное"
                  }
                  aria-label="Избранное"
                >
                  ❤️
                </button>
                <button
                  className={`compare-btn ${isComp ? "active" : ""}`}
                  onClick={handleToggleCompare}
                  title={
                    isComp ? "Удалить из сравнения" : "Добавить в сравнение"
                  }
                  aria-label="Сравнение"
                >
                  ⚖️
                </button>
              </>
            )}
            {/* Кнопка корзины доступна всегда */}
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
