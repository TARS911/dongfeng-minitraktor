/**
 * ThemeContext.tsx
 *
 * Контекст управления темой оформления (светлая/темная) с автоматическим сохранением в localStorage.
 */

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const THEME_STORAGE_KEY = "theme";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [isLoaded, setIsLoaded] = useState(false);

  // Загрузка темы из localStorage при монтировании
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
      if (savedTheme === "light" || savedTheme === "dark") {
        setThemeState(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
      } else {
        // Проверяем системные настройки
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const defaultTheme = prefersDark ? "dark" : "light";
        setThemeState(defaultTheme);
        document.documentElement.setAttribute("data-theme", defaultTheme);
      }
    }
    setIsLoaded(true);
  }, []);

  // Автоматическое сохранение темы в localStorage
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme, isLoaded]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme должен использоваться внутри ThemeProvider");
  }
  return context;
}
