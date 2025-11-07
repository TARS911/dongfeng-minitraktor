"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./auth.css";

type AuthMode = "login" | "signup" | "reset";

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
