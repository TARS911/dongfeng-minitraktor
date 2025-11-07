"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useCompare } from "../context/CompareContext";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { items: cartItems } = useCart();
  const { favorites } = useFavorites();
  const { compareItems } = useCompare();
  const { user, isAuthenticated, signOut } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    if (!sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  };

  return (
    <>
      {/* MOBILE HEADER */}
      <header className={styles.mobileHeader}>
        <div className={styles.mobileTop}>
          <div className={styles.burgerMenu} onClick={toggleSidebar}>
            ☰
          </div>
          <a href="/" className={styles.logo}>
            <img src="/images/logo.jpg" alt="БелТехФермЪ" />
          </a>
          <div className={styles.mobileIcons}>
            <Link href="/favorites" className={styles.iconLink}>
              ❤️
              {isLoaded && favorites.length > 0 && (
                <span className={styles.badge}>{favorites.length}</span>
              )}
            </Link>
            <Link href="/compare" className={styles.iconLink}>
              ⚖️
              {isLoaded && compareItems.length > 0 && (
                <span className={styles.badge}>{compareItems.length}</span>
              )}
            </Link>
            <Link href="/cart" className={styles.iconLink}>
              🛒
              {isLoaded && cartItems.length > 0 && (
                <span className={styles.badge}>{cartItems.length}</span>
              )}
            </Link>
          </div>
        </div>
        <div className={styles.mobileSearch}>
          <input type="text" placeholder="Поиск техники..." />
        </div>
        <div className={styles.mobilePhone}>
          <a href="tel:88005559999">8 (800) 555-99-99</a>
        </div>
      </header>

      {/* DESKTOP HEADER */}
      <header className={styles.desktopHeader}>
        <div className={styles.headerContent}>
          <a href="/" className={styles.logo}>
            <img src="/images/logo.jpg" alt="БелТехФермЪ" />
          </a>
          <div className={styles.searchBox}>
            <input type="text" placeholder="Поиск техники и запчастей..." />
          </div>
          <div className={styles.phoneBlock}>
            <a href="tel:88005559999" className={styles.phone}>
              8 (800) 555-99-99
            </a>
            <div className={styles.workTime}>Ежедневно: 8:00 - 20:00</div>
          </div>
          <div className={styles.headerIcons}>
            {isLoaded && isAuthenticated ? (
              <div className={styles.userMenu}>
                <span className={styles.userName}>
                  {user?.name || user?.email}
                </span>
                <button
                  className={styles.logoutBtn}
                  onClick={() => signOut().then(() => router.push("/"))}
                >
                  Выход
                </button>
              </div>
            ) : (
              <Link href="/auth" className={styles.authLink}>
                Вход / Регистрация
              </Link>
            )}
            <Link href="/favorites" className={styles.iconLink}>
              ❤️
              {isLoaded && favorites.length > 0 && (
                <span className={styles.badge}>{favorites.length}</span>
              )}
            </Link>
            <Link href="/compare" className={styles.iconLink}>
              ⚖️
              {isLoaded && compareItems.length > 0 && (
                <span className={styles.badge}>{compareItems.length}</span>
              )}
            </Link>
            <Link href="/cart" className={styles.iconLink}>
              🛒
              {isLoaded && cartItems.length > 0 && (
                <span className={styles.badge}>{cartItems.length}</span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* SIDEBAR OVERLAY */}
      <div
        className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.active : ""}`}
        onClick={toggleSidebar}
      />

      {/* SIDEBAR MENU */}
      <aside
        className={`${styles.sidebar} ${sidebarOpen ? styles.active : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <span>Каталог</span>
          <span className={styles.sidebarClose} onClick={toggleSidebar}>
            ✕
          </span>
        </div>
        <ul className={styles.sidebarMenu}>
          <li>
            <a href="/catalog/minitractory">
              <span className={styles.menuIcon}>
                <img src="/icons/tractor.svg" alt="" width="24" height="24" />
              </span>
              Мини-тракторы
            </a>
          </li>
          <li>
            <a href="/catalog/communal-equipment">
              <span className={styles.menuIcon}>
                <img src="/icons/snowplow.svg" alt="" width="24" height="24" />
              </span>
              Коммунальная техника
            </a>
          </li>
          <li>
            <a href="/catalog/parts">
              <span className={styles.menuIcon}>
                <img src="/icons/cog.svg" alt="" width="24" height="24" />
              </span>
              Запасные части
            </a>
          </li>
        </ul>
      </aside>
    </>
  );
}
