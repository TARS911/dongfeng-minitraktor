"use client";

import { useEffect } from "react";

/**
 * Компонент для регистрации Service Worker
 * Автоматически регистрирует SW при загрузке приложения
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Проверяем поддержку Service Worker
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      // Регистрируем SW после загрузки страницы
      window.addEventListener("load", () => {
        registerServiceWorker();
      });
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      console.log("✅ Service Worker registered successfully:", registration);

      // Обновляем SW при обновлении
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;

        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              console.log("🔄 New Service Worker available. Please refresh.");

              // Можно показать уведомление пользователю об обновлении
              if (
                confirm(
                  "Доступна новая версия сайта. Обновить страницу?"
                )
              ) {
                newWorker.postMessage("SKIP_WAITING");
                window.location.reload();
              }
            }
          });
        }
      });

      // Автоматическое обновление SW каждый час
      setInterval(
        () => {
          registration.update();
        },
        60 * 60 * 1000
      ); // Каждый час
    } catch (error) {
      console.error("❌ Service Worker registration failed:", error);
    }
  };

  // Этот компонент не рендерит ничего
  return null;
}
