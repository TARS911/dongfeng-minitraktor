'use client';

import { useState } from 'react';
import styles from './Header.module.css';

export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    if (!sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
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
          <div className={styles.logo}>БелТехФермЪ</div>
          <div className={styles.mobileIcons}>
            <span>❤️</span>
            <span>🛒</span>
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
          <div className={styles.logo}>🚜 БелТехФермЪ</div>
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
            <span>❤️</span>
            <span>🛒</span>
          </div>
        </div>
      </header>

      {/* SIDEBAR OVERLAY */}
      <div
        className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.active : ''}`}
        onClick={toggleSidebar}
      />

      {/* SIDEBAR MENU */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.active : ''}`}>
        <div className={styles.sidebarHeader}>
          <span>Каталог</span>
          <span className={styles.sidebarClose} onClick={toggleSidebar}>
            ✕
          </span>
        </div>
        <ul className={styles.sidebarMenu}>
          <li>
            <a href="#">
              <span className={styles.menuIcon}>🚜</span> Мини-тракторы
            </a>
          </li>
          <li>
            <a href="#">
              <span className={styles.menuIcon}>⚙️</span> Навесное оборудование
            </a>
          </li>
          <li>
            <a href="#">
              <span className={styles.menuIcon}>🔧</span> Запчасти
            </a>
          </li>
          <li>
            <a href="#">
              <span className={styles.menuIcon}>🛠️</span> Инструменты
            </a>
          </li>
          <li>
            <a href="#">
              <span className={styles.menuIcon}>🔩</span> Расходники
            </a>
          </li>
          <li>
            <a href="#">
              <span className={styles.menuIcon}>💡</span> Аксессуары
            </a>
          </li>
          <li>
            <a href="#">
              <span className={styles.menuIcon}>🏷️</span> Акции
            </a>
          </li>
          <li>
            <a href="#">
              <span className={styles.menuIcon}>⭐</span> Хиты продаж
            </a>
          </li>
        </ul>
      </aside>
    </>
  );
}
