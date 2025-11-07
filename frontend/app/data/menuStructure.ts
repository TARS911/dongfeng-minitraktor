/**
 * Структура многоуровневого меню каталога
 * Организация: Категория → Подкатегории → Бренды/Модели
 */

export interface MenuItem {
  id: string;
  title: string;
  slug: string;
  icon?: string;
  children?: MenuItem[];
}

/**
 * Главное меню каталога - упрощенная структура только с существующими страницами
 */
export const catalogMenu: MenuItem[] = [
  {
    id: "mini-tractors",
    title: "Мини-тракторы",
    slug: "/catalog/mini-tractors",
    icon: "🚜",
  },
  {
    id: "equipment",
    title: "Коммунальная техника",
    slug: "/catalog/equipment",
    icon: "❄️",
  },
  {
    id: "parts",
    title: "Запасные части",
    slug: "/catalog/parts",
    icon: "⚙️",
  },
  {
    id: "all",
    title: "Весь каталог",
    slug: "/catalog",
    icon: "📦",
  },
];

/**
 * Дополнительные пункты меню (не каталог)
 */
export const additionalMenu: MenuItem[] = [
  {
    id: "delivery",
    title: "Доставка и оплата",
    slug: "/delivery",
    icon: "🚚",
  },
  {
    id: "warranty",
    title: "Гарантия",
    slug: "/warranty",
    icon: "✓",
  },
  {
    id: "contacts",
    title: "Контакты",
    slug: "/contacts",
    icon: "📞",
  },
];
