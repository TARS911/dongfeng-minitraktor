"use client";

import React, { Component, ReactNode } from "react";
import { logError } from "../lib/sentry";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary компонент для React
 * Ловит ошибки в дочерних компонентах и отправляет в Sentry
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Отправляем ошибку в Sentry
    logError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });
  }

  render() {
    if (this.state.hasError) {
      // Если передан кастомный fallback, используем его
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Дефолтный fallback UI
      return (
        <div style={styles.container}>
          <div style={styles.content}>
            <h1 style={styles.title}>Что-то пошло не так</h1>
            <p style={styles.description}>
              Произошла ошибка при загрузке страницы. Попробуйте обновить
              страницу или вернуться на главную.
            </p>
            <div style={styles.buttons}>
              <button
                style={styles.primaryButton}
                onClick={() => window.location.reload()}
              >
                Обновить страницу
              </button>
              <button
                style={styles.secondaryButton}
                onClick={() => (window.location.href = "/")}
              >
                На главную
              </button>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details style={styles.details}>
                <summary style={styles.summary}>Детали ошибки (dev only)</summary>
                <pre style={styles.error}>
                  {this.state.error.toString()}
                  {"\n"}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Inline стили для fallback UI
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    padding: "20px",
    background: "#f5f5f5",
  },
  content: {
    maxWidth: "600px",
    padding: "40px",
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    textAlign: "center" as const,
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#333",
    marginBottom: "16px",
  },
  description: {
    fontSize: "16px",
    color: "#666",
    marginBottom: "32px",
    lineHeight: "1.6",
  },
  buttons: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap" as const,
  },
  primaryButton: {
    padding: "12px 24px",
    background: "#0066cc",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  secondaryButton: {
    padding: "12px 24px",
    background: "transparent",
    color: "#0066cc",
    border: "2px solid #0066cc",
    borderRadius: "4px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  details: {
    marginTop: "32px",
    textAlign: "left" as const,
    background: "#f8f8f8",
    padding: "16px",
    borderRadius: "4px",
  },
  summary: {
    cursor: "pointer",
    fontWeight: "600",
    color: "#666",
    marginBottom: "12px",
  },
  error: {
    fontSize: "12px",
    color: "#d32f2f",
    overflow: "auto",
    maxHeight: "300px",
  },
};

export default ErrorBoundary;
