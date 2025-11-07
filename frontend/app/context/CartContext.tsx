/**
 * CartContext.tsx
 *
 * Контекст управления корзиной покупок с автоматическим сохранением в localStorage.
 * Предоставляет функции добавления, удаления, изменения количества товаров и расчета общей суммы.
 *
 * Константы:
 * - CART_STORAGE_KEY (line 20): Ключ для хранения корзины в localStorage
 * - DEFAULT_QUANTITY (line 21): Количество товара по умолчанию при добавлении
 *
 * Интерфейсы:
 * - CartItem (line 24): Модель товара в корзине
 * - CartContextType (line 33): Тип контекста с методами управления корзиной
 *
 * Функции:
 * - CartProvider (line 45): Provider компонент для оборачивания приложения
 * - loadCartFromStorage (line 50): Загрузка корзины из localStorage при инициализации
 * - saveCartToStorage (line 63): Автоматическое сохранение корзины при изменениях
 * - addToCart (line 70): Добавление товара или увеличение количества существующего
 * - removeFromCart (line 88): Удаление товара из корзины
 * - updateQuantity (line 95): Изменение количества товара (автоудаление при quantity <= 0)
 * - clearCart (line 108): Очистка всей корзины
 * - useCart (line 130): Hook для доступа к контексту корзины
 */

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Константы
const CART_STORAGE_KEY = "cart";
const DEFAULT_QUANTITY = 1;

// Интерфейсы
export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  slug: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * CartProvider - Provider компонент для управления состоянием корзины
 * Автоматически синхронизирует состояние с localStorage для персистентности данных
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  /**
   * Загрузка корзины из localStorage при монтировании компонента
   * Используется для восстановления состояния корзины после перезагрузки страницы
   */
  useEffect(() => {
    // Проверка доступности localStorage (только на клиенте, не на сервере)
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      }
    }
    setIsLoaded(true);
  }, []);

  /**
   * Автоматическое сохранение корзины в localStorage при любом изменении
   * Срабатывает только после первой загрузки, чтобы избежать перезаписи при инициализации
   */
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  /**
   * addToCart - Добавление товара в корзину
   * Если товар уже в корзине, увеличивает его количество на 1
   * Если товара нет, добавляет с количеством DEFAULT_QUANTITY (1)
   *
   * @param product - Данные товара без поля quantity
   */
  const addToCart = (product: Omit<CartItem, "quantity">) => {
    setItems((prevItems) => {
      // Проверяем, есть ли товар уже в корзине
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        // Если есть - увеличиваем количество на 1
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      // Если нет - добавляем новый товар с quantity = 1
      return [...prevItems, { ...product, quantity: DEFAULT_QUANTITY }];
    });
  };

  /**
   * removeFromCart - Удаление товара из корзины
   * @param id - ID товара для удаления
   */
  const removeFromCart = (id: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  /**
   * updateQuantity - Изменение количества товара в корзине
   * Если quantity <= 0, товар автоматически удаляется из корзины
   *
   * @param id - ID товара
   * @param quantity - Новое количество (должно быть >= 1 для сохранения товара)
   */
  const updateQuantity = (id: number, quantity: number) => {
    // Автоматическое удаление при попытке установить количество <= 0
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  /**
   * clearCart - Полная очистка корзины
   * Удаляет все товары из корзины и localStorage
   */
  const clearCart = () => {
    setItems([]);
  };

  /**
   * Расчет общей стоимости всех товаров в корзине
   * Вычисляется динамически при каждом рендере на основе текущего состояния items
   */
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/**
 * useCart - Hook для доступа к контексту корзины
 * @returns CartContextType с методами и состоянием корзины
 * @throws Error если используется вне CartProvider
 */
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart должен использоваться внутри CartProvider");
  }
  return context;
}
