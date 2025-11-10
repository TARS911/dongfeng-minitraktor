import type { Metadata } from "next";
import "./globals.css";
import "./styles/animations.css";
import "./components/icons.css";
import Header from "./components/Header";
import { OrganizationJsonLd, LocalBusinessJsonLd } from "./components/JsonLd";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { CompareProvider } from "./context/CompareContext";
import { AuthProvider } from "./context/AuthContext";
import ServiceWorkerRegister from "./components/ServiceWorkerRegister";
import GoogleAnalytics from "./components/GoogleAnalytics";
import SkipLinks from "./components/SkipLinks";
// TODO: Вернуть позже - темная/светлая тема
// import { ThemeProvider } from "./context/ThemeContext";

export const metadata: Metadata = {
  title: "БелТехФермЪ - Мини-тракторы и запчасти | Продажа в России",
  description:
    "Купите мини-тракторы и сельхозтехнику в БелТехФермЪ. Доставка по России: Белгород, Курск, Орёл, Воронеж, Брянск, Тула. Официальная гарантия, техническое обслуживание, низкие цены.",
  keywords:
    "мини-трактор купить, сельхозтехника, трактор, коммунальная техника, запчасти, доставка",
  authors: [{ name: "БелТехФермЪ" }],
  creator: "БелТехФермЪ",
  publisher: "БелТехФермЪ",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://beltehferm.netlify.app",
    siteName: "БелТехФермЪ",
    title: "БелТехФермЪ - Мини-тракторы и запчасти",
    description:
      "Продажа мини-тракторов и сельхозтехники с доставкой по России",
    images: [
      {
        url: "https://beltehferm.netlify.app/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "БелТехФермЪ - Мини-тракторы",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "БелТехФермЪ - Мини-тракторы и запчасти",
    description: "Купите мини-тракторы и сельхозтехнику с доставкой по России",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://beltehferm.netlify.app",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        {/* Preconnect для ускорения загрузки внешних ресурсов */}
        <link
          rel="preconnect"
          href="https://dpsykseeqloturowdyzf.supabase.co"
        />
        <link
          rel="dns-prefetch"
          href="https://dpsykseeqloturowdyzf.supabase.co"
        />

        {/* Viewport для PWA */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes"
        />
        <meta name="theme-color" content="#0066cc" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="БелТехФермЪ" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/images/logo.jpg" />

        {/* Structured Data */}
        <OrganizationJsonLd />
        <LocalBusinessJsonLd />
      </head>
      <body>
        {/* Skip Links для accessibility */}
        <SkipLinks />

        {/* Google Analytics 4 */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_ID} />
        )}

        {/* Service Worker регистрация */}
        <ServiceWorkerRegister />

        {/* TODO: Вернуть позже - ThemeProvider */}
        {/* <ThemeProvider> */}
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <CompareProvider>
                <Header />
                <main id="main-content">{children}</main>
                <footer id="footer" className="footer">
                  <div className="container">
                    <div className="footer-content">
                      <div className="footer-section">
                        <h3>БелТехФермЪ</h3>
                        <p>Надежная сельхозтехника для вашего успеха</p>
                        <div className="social-links">
                          <a href="#" aria-label="VK">
                            <i className="fab fa-vk"></i>
                          </a>
                          <a href="#" aria-label="Telegram">
                            <i className="fab fa-telegram"></i>
                          </a>
                          <a href="#" aria-label="WhatsApp">
                            <i className="fab fa-whatsapp"></i>
                          </a>
                        </div>
                      </div>

                      <div className="footer-section">
                        <h4>Каталог</h4>
                        <ul>
                          <li>
                            <a href="/catalog/minitractory">Минитракторы</a>
                          </li>
                          <li>
                            <a href="/catalog/communal-equipment">
                              Коммунальная техника
                            </a>
                          </li>
                          <li>
                            <a href="/catalog/parts">Запасные части</a>
                          </li>
                        </ul>
                      </div>

                      <div className="footer-section">
                        <h4>Информация</h4>
                        <ul>
                          <li>
                            <a href="/about">О компании</a>
                          </li>
                          <li>
                            <a href="/delivery">Доставка</a>
                          </li>
                          <li>
                            <a href="/payment">Оплата</a>
                          </li>
                          <li>
                            <a href="/warranty">Гарантия</a>
                          </li>
                        </ul>
                      </div>

                      <div className="footer-section">
                        <h4>Контакты</h4>
                        <ul>
                          <li>
                            <i className="fas fa-phone"></i> +7 (999) 999-99-99
                          </li>
                          <li>
                            <i className="fas fa-envelope"></i>{" "}
                            info@beltehferm.ru
                          </li>
                          <li>
                            <i className="fas fa-map-marker-alt"></i> Белгород
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="footer-bottom">
                      <p>&copy; 2024 БелТехФермЪ. Все права защищены.</p>
                    </div>
                  </div>
                </footer>
              </CompareProvider>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
