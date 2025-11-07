/**
 * CompareContext.tsx
 *
 * Контекст управления сравнением товаров с автоматическим сохранением в localStorage.
 * Поддерживает сравнение до 4 товаров одновременно с автоматическим удалением старых.
 *
 * Константы:
 * - COMPARE_STORAGE_KEY (line 21): Ключ для хранения сравнения в localStorage
 * - MAX_COMPARE_ITEMS (line 22): Максимальное количество товаров для сравнения
 *
 * Интерфейсы:
 * - CompareProduct (line 25): Модель товара для сравнения с расширенными данными
 * - CompareContextType (line 37): Тип контекста с методами управления сравнением
 *
 * Функции:
 * - CompareProvider (line 51): Provider компонент для оборачивания приложения
 * - loadCompareFromStorage (line 57): Загрузка сравнения из localStorage при инициализации
 * - saveCompareToStorage (line 68): Автоматическое сохранение сравнения при изменениях
 * - addToCompare (line 75): Добавление товара с автоудалением при превышении лимита
 * - removeFromCompare (line 93): Удаление товара из сравнения
 * - clearCompare (line 100): Очистка всего списка сравнения
 * - isInCompare (line 107): Проверка наличия товара в сравнении
 * - toggleCompare (line 114): Переключение состояния сравнения (добавить/удалить)
 * - useCompare (line 139): Hook для доступа к контексту сравнения
 */

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Константы
const COMPARE_STORAGE_KEY = "compare";
const MAX_COMPARE_ITEMS = 4;

// Интерфейсы
export interface CompareProduct {
  id: number;
  name: string;
  price: number;
  image_url: string;
  slug: string;
  manufacturer?: string;
  power?: string;
  type?: string;
  description?: string;
}

interface CompareContextType {
  compareItems: CompareProduct[];
  addToCompare: (product: CompareProduct) => void;
  removeFromCompare: (id: number) => void;
  clearCompare: () => void;
  isInCompare: (id: number) => boolean;
  toggleCompare: (product: CompareProduct) => void;
  maxCompare: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

/**
 * CompareProvider - Provider компонент для управления состоянием сравнения товаров
 * Ограничивает количество товаров для сравнения (максимум MAX_COMPARE_ITEMS)
 * При добавлении 5-го товара автоматически удаляет самый старый
 */
export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareItems, setCompareItems] = useState<CompareProduct[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  /**
   * Загрузка сравнения из localStorage при монтировании компонента
   * Используется для восстановления списка сравнения после перезагрузки страницы
   */
  useEffect(() => {
    const savedCompare = localStorage.getItem(COMPARE_STORAGE_KEY);
    if (savedCompare) {
      const parsedCompare = JSON.parse(savedCompare);
      setCompareItems(parsedCompare);
    }
    setIsLoaded(true);
  }, []);

  /**
   * Автоматическое сохранение сравнения в localStorage при любом изменении
   * Срабатывает только после первой загрузки
   */
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(compareItems));
    }
  }, [compareItems, isLoaded]);

  /**
   * addToCompare - Добавление товара в список сравнения
   * Логика работы:
   * 1. Проверяет, нет ли товара уже в списке (предотвращает дубликаты)
   * 2. Если список заполнен (4 товара), удаляет самый старый (первый в массиве)
   * 3. Добавляет новый товар в конец списка
   *
   * @param product - Полные данные товара для сравнения
   */
  const addToCompare = (product: CompareProduct) => {
    setCompareItems((prev) => {
      // Проверка на дубликаты - если товар уже в сравнении, не добавляем
      if (prev.some((item) => item.id === product.id)) {
        return prev;
      }

      // Если достигли максимума (4 товара), удаляем первый и добавляем новый
      // Это создает эффект "очереди" FIFO (First In, First Out)
      if (prev.length >= MAX_COMPARE_ITEMS) {
        return [...prev.slice(1), product];
      }

      // Обычное добавление если места есть
      return [...prev, product];
    });
  };

  /**
   * removeFromCompare - Удаление товара из списка сравнения
   * @param id - ID товара для удаления
   */
  const removeFromCompare = (id: number) => {
    setCompareItems((prev) => prev.filter((item) => item.id !== id));
  };

  /**
   * clearCompare - Полная очистка списка сравнения
   * Удаляет все товары из сравнения и localStorage
   */
  const clearCompare = () => {
    setCompareItems([]);
  };

  /**
   * isInCompare - Проверка наличия товара в списке сравнения
   * @param id - ID товара для проверки
   * @returns true если товар в сравнении, иначе false
   */
  const isInCompare = (id: number) => {
    return compareItems.some((item) => item.id === id);
  };

  /**
   * toggleCompare - Переключение состояния сравнения
   * Если товар в списке - удаляет, если нет - добавляет
   *
   * @param product - Данные товара для переключения
   */
  const toggleCompare = (product: CompareProduct) => {
    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        toggleCompare,
        maxCompare: MAX_COMPARE_ITEMS,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

/**
 * useCompare - Hook для доступа к контексту сравнения
 * @returns CompareContextType с методами и состоянием сравнения
 * @throws Error если используется вне CompareProvider
 */
export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error("useCompare должен использоваться внутри CompareProvider");
  }
  return context;
}
