"use client";

import { useState, useEffect } from "react";
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  getSubscriptionStatus,
} from "../lib/pushNotifications";
import styles from "./PushNotificationPrompt.module.css";

/**
 * Компонент для запроса разрешения на Push уведомления
 * Показывается только если браузер поддерживает и пользователь еще не подписан
 */
export default function PushNotificationPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkIfShouldShow();
  }, []);

  async function checkIfShouldShow() {
    // Не показываем в dev режиме
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    // Проверяем поддержку
    if (!isPushSupported()) {
      return;
    }

    // Проверяем текущий статус
    const permission = getNotificationPermission();
    if (permission !== "default") {
      // Уже есть решение (granted или denied)
      return;
    }

    // Проверяем, был ли промпт закрыт ранее
    const dismissedAt = localStorage.getItem("push-prompt-dismissed");
    if (dismissedAt) {
      const daysSinceDismissed =
        (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);

      // Показываем снова через 7 дней
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Показываем промпт через 10 секунд после загрузки
    setTimeout(() => {
      setIsVisible(true);
    }, 10000);
  }

  async function handleSubscribe() {
    setIsLoading(true);

    try {
      const subscription = await subscribeToPush();

      if (subscription) {
        console.log("Successfully subscribed to push notifications");
        setIsVisible(false);
      } else {
        console.error("Failed to subscribe to push notifications");
        alert("Не удалось включить уведомления. Попробуйте позже.");
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      alert("Произошла ошибка при включении уведомлений.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleDismiss() {
    localStorage.setItem("push-prompt-dismissed", Date.now().toString());
    setIsVisible(false);
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.prompt}>
        <button
          className={styles.closeButton}
          onClick={handleDismiss}
          aria-label="Закрыть"
        >
          ✕
        </button>

        <div className={styles.icon}>🔔</div>

        <h3 className={styles.title}>
          Получайте уведомления о новых акциях!
        </h3>

        <p className={styles.description}>
          Мы будем присылать вам уведомления о скидках, новых товарах и
          специальных предложениях. Вы сможете отключить их в любой момент.
        </p>

        <div className={styles.buttons}>
          <button
            className={styles.primaryButton}
            onClick={handleSubscribe}
            disabled={isLoading}
          >
            {isLoading ? "Подключение..." : "Включить уведомления"}
          </button>

          <button
            className={styles.secondaryButton}
            onClick={handleDismiss}
            disabled={isLoading}
          >
            Не сейчас
          </button>
        </div>

        <p className={styles.privacy}>
          Мы уважаем вашу конфиденциальность. Вы можете отписаться в любой
          момент.
        </p>
      </div>
    </div>
  );
}
