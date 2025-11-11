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
    id: "all",
    title: "Каталог товаров",
    slug: "/catalog",
    icon: "📦",
  },
];

/**
 * Полное меню каталога для мобильной версии
 */
export const catalogMenuMobile: MenuItem[] = [
  {
    id: "all",
    title: "Каталог товаров",
    slug: "/catalog",
    icon: "📦",
  },
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
];

/**
 * Дополнительные пункты меню (не каталог)
 */
export const additionalMenu: MenuItem[] = [
  {
    id: "about",
    title: "О компании",
    slug: "/about",
  },
  {
    id: "delivery",
    title: "Доставка",
    slug: "/delivery",
  },
  {
    id: "payment",
    title: "Оплата",
    slug: "/payment",
  },
  {
    id: "promotions",
    title: "Акции",
    slug: "/promotions",
  },
  {
    id: "services",
    title: "Услуги",
    slug: "/services",
  },
  {
    id: "service-center",
    title: "Сервисный Центр",
    slug: "/service-center",
  },
  {
    id: "contacts",
    title: "Контакты",
    slug: "/contacts",
  },
];
