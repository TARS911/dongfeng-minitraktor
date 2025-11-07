/**
 * cart/page.tsx
 *
 * Страница корзины покупок с управлением количеством товаров и оформлением заказа.
 * Отображает список товаров, итоговую стоимость и действия с корзиной.
 *
 * Функции:
 * - CartPage (line 18): Основной компонент страницы корзины
 * - useEffect (line 24): Инициализация isLoaded для предотвращения hydration mismatch
 *
 * Особенности:
 * - Управление количеством товаров (increment/decrement/direct input)
 * - Удаление отдельных товаров из корзины
 * - Очистка всей корзины
 * - Подсчет итоговой суммы заказа
 * - Empty state для пустой корзины
 * - Переход к оформлению заказа
 *
 * Состояния:
 * - Empty state (line 36): Пустая корзина с призывом к действию
 * - Loading state (line 28): Индикатор загрузки
 * - Content state (line 48): Таблица товаров и блок итогов
 */

"use client";

import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import "./cart.css";

/**
 * CartPage - Компонент страницы корзины
 *
 * Отображает корзину покупок с функциями:
 * - Просмотр всех товаров в корзине
 * - Изменение количества каждого товара
 * - Удаление товаров из корзины
 * - Очистка всей корзины
 * - Просмотр итоговой суммы
 * - Переход к оформлению заказа
 *
 * @returns {JSX.Element} Страница корзины с товарами и блоком оформления
 */
export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="cart-container">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart-container">
        <h1>Корзина пуста</h1>
        <p>Добавьте товары в корзину для оформления заказа</p>
        <Link href="/catalog" className="btn-primary">
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Моя корзина</h1>

      <div className="cart-content">
        <div className="cart-items">
          <table className="cart-table">
            <thead>
              <tr>
                <th>Товар</th>
                <th>Цена</th>
                <th>Количество</th>
                <th>Сумма</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="cart-item">
                  <td className="product-info">
                    {item.image_url && (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="product-thumb"
                      />
                    )}
                    <Link
                      href={`/products/${item.slug}`}
                      className="product-name"
                    >
                      {item.name}
                    </Link>
                  </td>
                  <td className="price">
                    {item.price.toLocaleString("ru-RU")} ₽
                  </td>
                  <td className="quantity">
                    <div className="quantity-controls">
                      <button
                        className="qty-btn"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.id,
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        className="qty-input"
                      />
                      <button
                        className="qty-btn"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="subtotal">
                    {(item.price * item.quantity).toLocaleString("ru-RU")} ₽
                  </td>
                  <td className="action">
                    <button
                      className="btn-remove"
                      onClick={() => removeFromCart(item.id)}
                      title="Удалить товар"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="cart-summary">
          <div className="summary-box">
            <h2>Итого</h2>
            <div className="summary-line">
              <span>Товаров ({items.length}):</span>
              <span className="amount">{total.toLocaleString("ru-RU")} ₽</span>
            </div>
            <div className="summary-line">
              <span>Доставка:</span>
              <span className="amount">По расценкам</span>
            </div>
            <div className="summary-total">
              <span>Сумма:</span>
              <span className="amount-large">
                {total.toLocaleString("ru-RU")} ₽
              </span>
            </div>

            <button className="btn-checkout">
              Перейти к оформлению заказа
            </button>

            <button
              className="btn-continue"
              onClick={() => router.push("/catalog")}
            >
              Продолжить покупки
            </button>

            <button className="btn-clear" onClick={clearCart}>
              Очистить корзину
            </button>

            <Link href="/compare" className="btn-compare">
              Перейти к сравнению →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
