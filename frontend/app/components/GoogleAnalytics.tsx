"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

/**
 * Google Analytics 4 компонент
 * Автоматически отслеживает просмотры страниц и события
 */

interface GoogleAnalyticsProps {
  GA_MEASUREMENT_ID: string;
}

function GoogleAnalyticsInner({ GA_MEASUREMENT_ID }: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Отслеживание просмотров страниц при навигации
  useEffect(() => {
    if (pathname && typeof window !== "undefined" && window.gtag) {
      const url =
        pathname +
        (searchParams?.toString() ? `?${searchParams.toString()}` : "");

      window.gtag("config", GA_MEASUREMENT_ID, {
        page_path: url,
      });
    }
  }, [pathname, searchParams, GA_MEASUREMENT_ID]);

  // Не загружаем GA в development
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <>
      {/* Google Analytics gtag.js */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `,
        }}
      />
    </>
  );
}

export default function GoogleAnalytics({
  GA_MEASUREMENT_ID,
}: GoogleAnalyticsProps) {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsInner GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />
    </Suspense>
  );
}

/**
 * Типизация для window.gtag
 */
declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string,
      config?: Record<string, any>,
    ) => void;
    dataLayer: any[];
  }
}

/**
 * Helper функции для отслеживания событий
 */

// Отслеживание клика по товару
export const trackProductClick = (productId: number, productName: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "select_item", {
      items: [
        {
          item_id: productId,
          item_name: productName,
        },
      ],
    });
  }
};

// Отслеживание добавления в корзину
export const trackAddToCart = (
  productId: number,
  productName: string,
  price: number,
  quantity: number,
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "add_to_cart", {
      currency: "RUB",
      value: price * quantity,
      items: [
        {
          item_id: productId,
          item_name: productName,
          price: price,
          quantity: quantity,
        },
      ],
    });
  }
};

// Отслеживание удаления из корзины
export const trackRemoveFromCart = (
  productId: number,
  productName: string,
  price: number,
  quantity: number,
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "remove_from_cart", {
      currency: "RUB",
      value: price * quantity,
      items: [
        {
          item_id: productId,
          item_name: productName,
          price: price,
          quantity: quantity,
        },
      ],
    });
  }
};

// Отслеживание начала оформления заказа
export const trackBeginCheckout = (cartTotal: number, items: any[]) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "begin_checkout", {
      currency: "RUB",
      value: cartTotal,
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }
};

// Отслеживание покупки
export const trackPurchase = (orderId: string, total: number, items: any[]) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: orderId,
      currency: "RUB",
      value: total,
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }
};

// Отслеживание поиска
export const trackSearch = (searchQuery: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "search", {
      search_term: searchQuery,
    });
  }
};

// Отслеживание просмотра товара
export const trackViewItem = (
  productId: number,
  productName: string,
  price: number,
  category: string,
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "view_item", {
      currency: "RUB",
      value: price,
      items: [
        {
          item_id: productId,
          item_name: productName,
          price: price,
          item_category: category,
        },
      ],
    });
  }
};
