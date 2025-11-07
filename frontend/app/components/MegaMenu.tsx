"use client";

import { useState } from "react";
import Link from "next/link";
import type { MenuItem } from "../data/menuStructure";
import styles from "./MegaMenu.module.css";

interface MegaMenuProps {
  items: MenuItem[];
  isMobile?: boolean;
}

/**
 * Многоуровневое выпадающее меню
 * Desktop: hover dropdown
 * Mobile: accordion/collapse
 */
export default function MegaMenu({ items, isMobile = false }: MegaMenuProps) {
  return (
    <nav className={isMobile ? styles.mobileNav : styles.desktopNav}>
      {items.map((item) => (
        <MenuItemComponent key={item.id} item={item} isMobile={isMobile} />
      ))}
    </nav>
  );
}

/**
 * Элемент меню с поддержкой вложенности
 */
function MenuItemComponent({
  item,
  isMobile,
  level = 0,
}: {
  item: MenuItem;
  isMobile: boolean;
  level?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const toggleOpen = () => {
    if (isMobile && hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div
      className={`${styles.menuItem} ${styles[`level${level}`]} ${isOpen ? styles.open : ""}`}
    >
      <div className={styles.menuItemHeader}>
        <Link
          href={item.slug}
          className={styles.menuLink}
          onClick={(e) => {
            // Для мобильных с детьми - открываем аккордеон вместо перехода
            if (isMobile && hasChildren) {
              e.preventDefault();
              toggleOpen();
            }
          }}
        >
          {item.icon && <span className={styles.menuIcon}>{item.icon}</span>}
          <span className={styles.menuTitle}>{item.title}</span>
        </Link>

        {/* Стрелка для раскрытия (только мобильная версия с детьми) */}
        {isMobile && hasChildren && (
          <button
            className={styles.toggleBtn}
            onClick={toggleOpen}
            aria-label={isOpen ? "Свернуть" : "Развернуть"}
          >
            {isOpen ? "▲" : "▼"}
          </button>
        )}
      </div>

      {/* Вложенное меню */}
      {hasChildren && (
        <div
          className={`${styles.submenu} ${isMobile && isOpen ? styles.submenuOpen : ""}`}
        >
          {item.children!.map((child) => (
            <MenuItemComponent
              key={child.id}
              item={child}
              isMobile={isMobile}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
