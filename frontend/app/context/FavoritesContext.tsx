/**
 * FavoritesContext.tsx
 *
 * Контекст управления избранными товарами с автоматическим сохранением в localStorage.
 * Хранит только ID товаров для оптимизации памяти.
 *
 * Константы:
 * - FAVORITES_STORAGE_KEY (line 17): Ключ для хранения избранного в localStorage
 *
 * Интерфейсы:
 * - FavoritesContextType (line 20): Тип контекста с методами управления избранным
 *
 * Функции:
 * - FavoritesProvider (line 32): Provider компонент для оборачивания приложения
 * - loadFavoritesFromStorage (line 37): Загрузка избранного из localStorage при инициализации
 * - saveFavoritesToStorage (line 48): Автоматическое сохранение избранного при изменениях
 * - addFavorite (line 55): Добавление товара в избранное (проверка на дубликаты)
 * - removeFavorite (line 66): Удаление товара из избранного
 * - isFavorite (line 73): Проверка, находится ли товар в избранном
 * - toggleFavorite (line 80): Переключение состояния избранного (добавить/удалить)
 * - useFavorites (line 105): Hook для доступа к контексту избранного
 */

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Константы
const FAVORITES_STORAGE_KEY = "favorites";

// Интерфейсы
interface FavoritesContextType {
  favorites: number[];
  addFavorite: (productId: number) => void;
  removeFavorite: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (productId: number) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined,
);

/**
 * FavoritesProvider - Provider компонент для управления состоянием избранного
 * Хранит только ID товаров для минимизации использования памяти localStorage
 */
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  /**
   * Загрузка избранного из localStorage при монтировании компонента
   * Используется для восстановления списка избранного после перезагрузки страницы
   */
  useEffect(() => {
    const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (savedFavorites) {
      const parsedFavorites = JSON.parse(savedFavorites);
      setFavorites(parsedFavorites);
    }
    setIsLoaded(true);
  }, []);

  /**
   * Автоматическое сохранение избранного в localStorage при любом изменении
   * Срабатывает только после первой загрузки
   */
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    }
  }, [favorites, isLoaded]);

  /**
   * addFavorite - Добавление товара в избранное
   * Проверяет на дубликаты перед добавлением
   *
   * @param productId - ID товара для добавления в избранное
   */
  const addFavorite = (productId: number) => {
    setFavorites((prev) => {
      // Не добавляем дубликаты
      if (!prev.includes(productId)) {
        return [...prev, productId];
      }
      return prev;
    });
  };

  /**
   * removeFavorite - Удаление товара из избранного
   * @param productId - ID товара для удаления
   */
  const removeFavorite = (productId: number) => {
    setFavorites((prev) => prev.filter((id) => id !== productId));
  };

  /**
   * isFavorite - Проверка наличия товара в избранном
   * @param productId - ID товара для проверки
   * @returns true если товар в избранном, иначе false
   */
  const isFavorite = (productId: number) => {
    return favorites.includes(productId);
  };

  /**
   * toggleFavorite - Переключение состояния избранного
   * Если товар в избранном - удаляет, если нет - добавляет
   *
   * @param productId - ID товара для переключения
   */
  const toggleFavorite = (productId: number) => {
    if (isFavorite(productId)) {
      removeFavorite(productId);
    } else {
      addFavorite(productId);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

/**
 * useFavorites - Hook для доступа к контексту избранного
 * @returns FavoritesContextType с методами и состоянием избранного
 * @throws Error если используется вне FavoritesProvider
 */
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error(
      "useFavorites должен использоваться внутри FavoritesProvider",
    );
  }
  return context;
}
