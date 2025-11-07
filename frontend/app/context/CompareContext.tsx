"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CompareProduct {
  id: number;
  name: string;
  price: number;
  image_url: string;
  slug: string;
  manufacturer?: string;
  power?: string;
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

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareItems, setCompareItems] = useState<CompareProduct[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const maxCompare = 4; // Максимум товаров для сравнения

  // Загружаем сравнение из localStorage при загрузке
  useEffect(() => {
    const savedCompare = localStorage.getItem("compare");
    if (savedCompare) {
      try {
        setCompareItems(JSON.parse(savedCompare));
      } catch (error) {
        console.error("Ошибка при загрузке сравнения:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Сохраняем сравнение в localStorage при изменении
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("compare", JSON.stringify(compareItems));
    }
  }, [compareItems, isLoaded]);

  const addToCompare = (product: CompareProduct) => {
    setCompareItems((prev) => {
      // Если товар уже в сравнении, не добавляем
      if (prev.some((item) => item.id === product.id)) {
        return prev;
      }

      // Если достигли максимума, удаляем первый товар
      if (prev.length >= maxCompare) {
        return [...prev.slice(1), product];
      }

      return [...prev, product];
    });
  };

  const removeFromCompare = (id: number) => {
    setCompareItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  const isInCompare = (id: number) => {
    return compareItems.some((item) => item.id === id);
  };

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
        maxCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error(
      "useCompare должен использоваться внутри CompareProvider"
    );
  }
  return context;
}
