"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useCompare } from "../context/CompareContext";
import { useAuth } from "../context/AuthContext";
import { useSwipe } from "../hooks/useSwipe";
// TODO: Вернуть позже - темная/светлая тема
// import { useTheme } from "../context/ThemeContext";
import Link from "next/link";
import MegaMenu from "./MegaMenu";
import {
  catalogMenu,
  catalogMenuMobile,
  additionalMenu,
} from "../data/menuStructure";
import styles from "./Header.module.css";

export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { items: cartItems } = useCart();
  const { favorites } = useFavorites();
  const { compareItems } = useCompare();
  const { user, isAuthenticated, signOut } = useAuth();
  // TODO: Вернуть позже - темная/светлая тема
  // const { theme, toggleTheme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Подсчет общего количества товаров в корзине с учетом quantity
  const totalCartItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    if (!sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    document.body.style.overflow = "";
  };

  // Swipe-жесты для sidebar (свайп влево закрывает)
  const swipeHandlers = useSwipe({
    onSwipeLeft: closeSidebar,
    minSwipeDistance: 50,
  });

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
              {isLoaded && totalCartItems > 0 && (
                <span className={styles.badge}>{totalCartItems}</span>
              )}
            </Link>
            {/* TODO: Вернуть позже - кнопка темы */}
            {/* <button
              onClick={toggleTheme}
              className={styles.themeToggle}
              title={theme === "light" ? "Темная тема" : "Светлая тема"}
              aria-label="Переключить тему"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button> */}
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
              {isLoaded && totalCartItems > 0 && (
                <span className={styles.badge}>{totalCartItems}</span>
              )}
            </Link>
            {/* TODO: Вернуть позже - кнопка темы */}
            {/* <button
              onClick={toggleTheme}
              className={styles.themeToggle}
              title={theme === "light" ? "Темная тема" : "Светлая тема"}
              aria-label="Переключить тему"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button> */}
          </div>
        </div>

        {/* DESKTOP NAVIGATION */}
        <div className={styles.desktopNavigation}>
          <div className={styles.navContent}>
            <MegaMenu items={catalogMenu} isMobile={false} />
            <div className={styles.additionalNav}>
              {additionalMenu.map((item) => (
                <Link
                  key={item.id}
                  href={item.slug}
                  className={styles.additionalNavLink}
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* SIDEBAR OVERLAY */}
      <div
        className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.active : ""}`}
        onClick={closeSidebar}
      />

      {/* SIDEBAR MENU */}
      <aside
        className={`${styles.sidebar} ${sidebarOpen ? styles.active : ""}`}
        {...swipeHandlers}
      >
        <div className={styles.sidebarHeader}>
          <span>Меню</span>
          <span className={styles.sidebarClose} onClick={toggleSidebar}>
            ✕
          </span>
        </div>
        <div className={styles.sidebarContent}>
          <MegaMenu items={catalogMenuMobile} isMobile={true} />
          <div className={styles.sidebarAdditional}>
            {additionalMenu.map((item) => (
              <Link
                key={item.id}
                href={item.slug}
                className={styles.sidebarLink}
                onClick={closeSidebar}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
