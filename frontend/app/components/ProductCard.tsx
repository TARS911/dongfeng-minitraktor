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
      
      <div className="product-content">
        {product.manufacturer && (
          <div className="product-manufacturer">
            <IndustryIcon className="manufacturer-icon" /> {product.manufacturer}
          </div>
        )}
        
        <Link href={`/product/${product.slug}`} className="product-title">
          {product.name}
        </Link>
        
        <div className="product-price-container">
          <div className="product-price">
            {product.price.toLocaleString('ru-RU')} ₽
            {product.old_price && product.old_price > product.price && (
              <span className="old-price">{product.old_price.toLocaleString('ru-RU')} ₽</span>
            )}
          </div>
        </div>
        
        <div className="product-actions">
          <button 
            className={`action-button ${isFav ? 'active' : ''}`}
            onClick={handleToggleFavorite}
            aria-label={isFav ? 'Удалить из избранного' : 'Добавить в избранное'}
            title={isFav ? 'Удалить из избранного' : 'Добавить в избранное'}
          >
            {isFav ? '❤️' : '🤍'}
          </button>
          
          <button 
            className={`action-button ${isComp ? 'active' : ''}`}
            onClick={handleToggleCompare}
            aria-label={isComp ? 'Удалить из сравнения' : 'Добавить к сравнению'}
            title={isComp ? 'Удалить из сравнения' : 'Добавить к сравнению'}
          >
            {isComp ? '📊' : '📈'}
          </button>
          
          <button 
            className="action-button"
            onClick={handleAddToCart}
            aria-label="Добавить в корзину"
            title="Добавить в корзину"
          >
            🛒
          </button>
        </div>
      </div>
    </div>
  );
}
