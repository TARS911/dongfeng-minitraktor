"use client";

import styles from "./SkipLinks.module.css";

/**
 * Skip Links для accessibility (A11y)
 * Позволяют пользователям клавиатуры быстро перейти к основному контенту
 */
export default function SkipLinks() {
  return (
    <div className={styles.skipLinks}>
      <a href="#main-content" className={styles.skipLink}>
        Перейти к основному содержанию
      </a>
      <a href="#catalog-menu" className={styles.skipLink}>
        Перейти к каталогу
      </a>
      <a href="#search" className={styles.skipLink}>
        Перейти к поиску
      </a>
      <a href="#footer" className={styles.skipLink}>
        Перейти к подвалу сайта
      </a>
    </div>
  );
}
