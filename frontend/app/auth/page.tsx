/**
 * auth/page.tsx
 *
 * Страница аутентификации с тремя режимами: вход, регистрация, сброс пароля.
 * Использует Supabase Auth для управления пользователями.
 *
 * Типы:
 * - AuthMode (line 27): Тип режима аутентификации ("login" | "signup" | "reset")
 *
 * Функции:
 * - AuthPage (line 29): Основной компонент страницы аутентификации
 * - handleLogin (line 41): Обработчик формы входа
 * - handleSignup (line 58): Обработчик формы регистрации
 * - handleReset (line 77): Обработчик формы сброса пароля
 *
 * Состояния формы:
 * - mode: "login" | "signup" | "reset" - текущий режим формы
 * - email, password, name - поля ввода
 * - error, success - сообщения обратной связи
 * - isLoading - индикатор загрузки
 *
 * Режимы:
 * - Login (line 99): Форма входа с email и паролем
 * - Signup (line 181): Форма регистрации с именем, email и паролем
 * - Reset (line 259): Форма сброса пароля с email
 */

"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./auth.css";

/**
 * AuthMode - Тип режима аутентификации
 */
type AuthMode = "login" | "signup" | "reset";

/**
 * AuthPage - Компонент страницы аутентификации
 *
 * Мультирежимная страница аутентификации:
 * - Вход в существующий аккаунт
 * - Регистрация нового пользователя
 * - Сброс забытого пароля
 * - Возможность продолжить как гость
 *
 * Использует AuthContext для работы с Supabase Auth.
 * После успешного входа перенаправляет на главную страницу.
 *
 * @returns {JSX.Element} Страница аутентификации с формами
 */
export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp, resetPassword } = useAuth();
  const router = useRouter();

  /**
   * handleLogin - Обработчик формы входа
   *
   * Вызывает signIn из AuthContext для входа через Supabase.
   * При успешном входе перенаправляет на главную страницу через 1.5 сек.
   * При ошибке отображает сообщение об ошибке.
   *
   * @param {React.FormEvent} e - Событие submit формы
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await signIn(email, password);
      setSuccess("Успешный вход! Перенаправляем...");
      setTimeout(() => router.push("/"), 1500);
    } catch (err: any) {
      setError(err.message || "Ошибка при входе. Проверьте данные.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * handleSignup - Обработчик формы регистрации
   *
   * Вызывает signUp из AuthContext для создания нового пользователя в Supabase.
   * Отправляет письмо с подтверждением на указанный email.
   * При успешной регистрации переключает на режим входа через 2 сек.
   *
   * @param {React.FormEvent} e - Событие submit формы
   */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await signUp(email, password, name);
      setSuccess(
        "Регистрация успешна! Проверьте вашу почту для подтверждения."
      );
      setTimeout(() => setMode("login"), 2000);
    } catch (err: any) {
      setError(err.message || "Ошибка при регистрации.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * handleReset - Обработчик формы сброса пароля
   *
   * Вызывает resetPassword из AuthContext для отправки ссылки сброса пароля.
   * Supabase отправляет email со ссылкой для создания нового пароля.
   * При успешной отправке переключает на режим входа через 2 сек.
   *
   * @param {React.FormEvent} e - Событие submit формы
   */
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await resetPassword(email);
      setSuccess("Ссылка для сброса пароля отправлена на почту!");
      setTimeout(() => setMode("login"), 2000);
    } catch (err: any) {
      setError(err.message || "Ошибка при сбросе пароля.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          {/* Login Form */}
          {mode === "login" && (
            <>
              <h1>Вход в аккаунт</h1>
              <p className="auth-subtitle">
                Войдите в ваш аккаунт для доступа к корзине и истории заказов
              </p>

              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Пароль</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <button
                  type="submit"
                  className="btn-auth"
                  disabled={isLoading}
                >
                  {isLoading ? "Загрузка..." : "Войти"}
                </button>
              </form>

              <div className="auth-divider">или</div>

              <div className="auth-links">
                <button
                  className="link-btn"
                  onClick={() => {
                    setMode("reset");
                    setError("");
                    setSuccess("");
                  }}
                >
                  Забыли пароль?
                </button>
                <span className="divider">•</span>
                <button
                  className="link-btn"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                    setSuccess("");
                  }}
                >
                  Создать аккаунт
                </button>
              </div>

              <div className="guest-login">
                <p>Или продолжить как гость:</p>
                <Link href="/catalog" className="btn-guest">
                  Перейти в каталог →
                </Link>
              </div>
            </>
          )}

          {/* Signup Form */}
          {mode === "signup" && (
            <>
              <h1>Создать аккаунт</h1>
              <p className="auth-subtitle">
                Зарегистрируйтесь для быстрого оформления заказов
              </p>

              <form onSubmit={handleSignup}>
                <div className="form-group">
                  <label htmlFor="name">Имя</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ваше имя"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Пароль</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Минимум 6 символов"
                    minLength={6}
                    required
                    disabled={isLoading}
                  />
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <button
                  type="submit"
                  className="btn-auth"
                  disabled={isLoading}
                >
                  {isLoading ? "Загрузка..." : "Зарегистрироваться"}
                </button>
              </form>

              <div className="auth-divider">или</div>

              <div className="auth-links">
                <button
                  className="link-btn"
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setSuccess("");
                  }}
                >
                  Уже есть аккаунт? Войти
                </button>
              </div>
            </>
          )}

          {/* Password Reset Form */}
          {mode === "reset" && (
            <>
              <h1>Сброс пароля</h1>
              <p className="auth-subtitle">
                Введите ваш email для получения ссылки сброса пароля
              </p>

              <form onSubmit={handleReset}>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <button
                  type="submit"
                  className="btn-auth"
                  disabled={isLoading}
                >
                  {isLoading ? "Загрузка..." : "Отправить ссылку"}
                </button>
              </form>

              <div className="auth-divider">или</div>

              <div className="auth-links">
                <button
                  className="link-btn"
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setSuccess("");
                  }}
                >
                  Вернуться к входу
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
