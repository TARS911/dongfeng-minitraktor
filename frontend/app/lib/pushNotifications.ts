/**
 * Push Notifications для веб-приложения
 * Используется для уведомлений об акциях и новых товарах
 */

/**
 * Проверка поддержки Push Notifications браузером
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * Получить текущий статус разрешения уведомлений
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isPushSupported()) {
    return "denied";
  }
  return Notification.permission;
}

/**
 * Запросить разрешение на отправку уведомлений
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    console.warn("Push notifications are not supported in this browser");
    return "denied";
  }

  try {
    const permission = await Notification.requestPermission();
    console.log("Notification permission:", permission);
    return permission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return "denied";
  }
}

/**
 * Подписаться на Push уведомления
 * Возвращает subscription object для отправки на сервер
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    console.warn("Push notifications are not supported");
    return null;
  }

  try {
    // Запрашиваем разрешение если еще не получено
    const permission = await requestNotificationPermission();
    if (permission !== "granted") {
      console.warn("Notification permission not granted");
      return null;
    }

    // Получаем Service Worker registration
    const registration = await navigator.serviceWorker.ready;

    // Проверяем существующую подписку
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      console.log("Already subscribed to push notifications");
      return subscription;
    }

    // Создаем новую подписку
    // ВАЖНО: Замените на ваш VAPID public key
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
      console.error("VAPID public key not found");
      return null;
    }

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        vapidPublicKey,
      ) as BufferSource,
    });

    console.log("Successfully subscribed to push notifications");

    // Отправляем subscription на сервер для сохранения
    await saveSubscriptionToServer(subscription);

    return subscription;
  } catch (error) {
    console.error("Error subscribing to push notifications:", error);
    return null;
  }
}

/**
 * Отписаться от Push уведомлений
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      console.log("No active subscription to unsubscribe from");
      return true;
    }

    // Удаляем подписку
    const successful = await subscription.unsubscribe();

    if (successful) {
      console.log("Successfully unsubscribed from push notifications");
      // Удаляем subscription с сервера
      await removeSubscriptionFromServer(subscription);
    }

    return successful;
  } catch (error) {
    console.error("Error unsubscribing from push notifications:", error);
    return false;
  }
}

/**
 * Отправить локальное уведомление (для тестирования)
 */
export async function showLocalNotification(
  title: string,
  options?: NotificationOptions,
): Promise<void> {
  if (!isPushSupported()) {
    console.warn("Notifications are not supported");
    return;
  }

  const permission = await requestNotificationPermission();
  if (permission !== "granted") {
    console.warn("Notification permission not granted");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      icon: "/images/logo.jpg",
      badge: "/images/logo.jpg",
      ...options,
    });
  } catch (error) {
    console.error("Error showing notification:", error);
  }
}

/**
 * Сохранить subscription на сервере
 */
async function saveSubscriptionToServer(
  subscription: PushSubscription,
): Promise<void> {
  try {
    const response = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      throw new Error("Failed to save subscription to server");
    }

    console.log("Subscription saved to server");
  } catch (error) {
    console.error("Error saving subscription:", error);
  }
}

/**
 * Удалить subscription с сервера
 */
async function removeSubscriptionFromServer(
  subscription: PushSubscription,
): Promise<void> {
  try {
    const response = await fetch("/api/push/unsubscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      throw new Error("Failed to remove subscription from server");
    }

    console.log("Subscription removed from server");
  } catch (error) {
    console.error("Error removing subscription:", error);
  }
}

/**
 * Конвертация VAPID ключа из base64 в Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Получить статус подписки
 */
export async function getSubscriptionStatus(): Promise<{
  isSubscribed: boolean;
  subscription: PushSubscription | null;
}> {
  if (!isPushSupported()) {
    return { isSubscribed: false, subscription: null };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    return {
      isSubscribed: subscription !== null,
      subscription,
    };
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return { isSubscribed: false, subscription: null };
  }
}
