/**
 * AuthContext.tsx
 *
 * Контекст управления аутентификацией пользователей через Supabase Auth.
 * Предоставляет функции регистрации, входа, выхода и сброса пароля.
 *
 * Константы:
 * - RESET_PASSWORD_REDIRECT_URL (line 14): URL для перенаправления после сброса пароля
 *
 * Интерфейсы:
 * - User (line 18): Модель данных пользователя
 * - AuthContextType (line 25): Тип контекста с методами аутентификации
 *
 * Функции:
 * - AuthProvider (line 49): Provider компонент для оборачивания приложения
 * - checkSession (line 55): Проверка существующей сессии при загрузке
 * - signUp (line 94): Регистрация нового пользователя
 * - signIn (line 115): Вход существующего пользователя
 * - signOut (line 132): Выход из системы
 * - resetPassword (line 141): Отправка письма для сброса пароля
 * - useAuth (line 155): Hook для доступа к контексту аутентификации
 */

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Константы
const RESET_PASSWORD_REDIRECT_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const RESET_PASSWORD_PATH = "/reset-password";

// Интерфейсы
interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Инициализация Supabase клиента
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Проверка наличия обязательных переменных окружения
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required",
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * AuthProvider - Provider компонент для управления состоянием аутентификации
 * Оборачивает приложение и предоставляет контекст аутентификации всем дочерним компонентам
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Проверяем активную сессию при монтировании компонента
  useEffect(() => {
    const checkSession = async () => {
      // Получаем текущую сессию из Supabase
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Ошибка при проверке сессии:", error);
        setIsLoading(false);
        return;
      }

      // Если сессия существует, устанавливаем данные пользователя
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.name,
          avatar_url: session.user.user_metadata?.avatar_url,
        });
      }

      setIsLoading(false);
    };

    checkSession();

    // Подписываемся на изменения состояния аутентификации
    // Это позволяет автоматически обновлять UI при входе/выходе
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.name,
          avatar_url: session.user.user_metadata?.avatar_url,
        });
      } else {
        setUser(null);
      }
    });

    // Отписываемся при размонтировании компонента
    return () => subscription?.unsubscribe();
  }, []);

  /**
   * signUp - Регистрация нового пользователя
   * @param email - Email пользователя
   * @param password - Пароль (минимум 6 символов)
   * @param name - Имя пользователя для отображения
   * @throws Error если регистрация не удалась
   */
  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name, // Сохраняем имя в метаданных пользователя
        },
      },
    });

    if (error) throw error;

    // Обновляем локальное состояние после успешной регистрации
    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email || "",
        name: data.user.user_metadata?.name,
        avatar_url: data.user.user_metadata?.avatar_url,
      });
    }
  };

  /**
   * signIn - Вход существующего пользователя
   * @param email - Email пользователя
   * @param password - Пароль
   * @throws Error если вход не удался (неверные данные)
   */
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Обновляем локальное состояние после успешного входа
    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email || "",
        name: data.user.user_metadata?.name,
        avatar_url: data.user.user_metadata?.avatar_url,
      });
    }
  };

  /**
   * signOut - Выход из системы
   * Очищает сессию в Supabase и локальное состояние
   * @throws Error если выход не удался
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  /**
   * resetPassword - Отправка email для сброса пароля
   * @param email - Email пользователя для сброса пароля
   * @throws Error если отправка не удалась
   */
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${RESET_PASSWORD_REDIRECT_URL}${RESET_PASSWORD_PATH}`,
    });

    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth - Hook для доступа к контексту аутентификации
 * @returns AuthContextType с методами и состоянием аутентификации
 * @throws Error если используется вне AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth должен использоваться внутри AuthProvider");
  }
  return context;
}
