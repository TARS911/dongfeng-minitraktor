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
import { Product } from "../../types";

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
    <div className="product-card">
      <Link href={`/catalog/product/${product.slug}`} className="product-image-container">
        <Image
          src={product.image_url || '/placeholder.jpg'}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="product-image"
          priority={product.is_featured}
          quality={75}
        />
        {product.old_price && product.old_price > product.price && (
          <span className="discount-badge">-{discount}%</span>
        )}
      </Link>
      
      <div className="product-info">
        <div className="product-stock-status">
          <span className={product.in_stock ? 'in-stock' : 'out-of-stock'}>
            {product.in_stock ? 'В наличии' : 'Нет в наличии'}
          </span>
        </div>

        <Link href={`/catalog/product/${product.slug}`} className="product-name">
          {product.name}
        </Link>
        
        <div className="product-footer">
          <div className="product-price">
            {product.old_price && product.old_price > product.price && (
              <span className="old-price">{product.old_price.toLocaleString('ru-RU')} ₽</span>
            )}
            <span className="current-price">{product.price.toLocaleString('ru-RU')} ₽</span>
          </div>
          <div className="product-actions">
            <button 
              className={`action-button ${isFav ? 'active' : ''}`}
              onClick={handleToggleFavorite}
              title={isFav ? 'Удалить из избранного' : 'Добавить в избранное'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </button>
            <button 
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={!product.in_stock}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
