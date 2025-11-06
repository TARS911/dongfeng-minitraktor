import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "БелТехФермЪ - Мини-тракторы и запчасти",
  description:
    "Продажа мини-тракторов, навесного оборудования и запчастей для фермеров. Белгород, Курск, Орёл, Воронеж, Брянск, Тула. Гарантия, сервис, доставка.",
  keywords:
    "мини-трактор, сельхозтехника, трактор купить, навесное оборудование, запчасти",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <footer className="footer">
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
                    <i className="fas fa-envelope"></i> info@beltehferm.ru
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
      </body>
    </html>
  );
}
