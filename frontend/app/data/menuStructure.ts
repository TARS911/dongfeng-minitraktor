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
 * Главное меню каталога с иерархической структурой
 */
export const catalogMenu: MenuItem[] = [
  {
    id: "minitractory",
    title: "Мини-тракторы",
    slug: "/catalog/minitractory",
    icon: "🚜",
    children: [
      {
        id: "garden-tractors",
        title: "Садовые мини-тракторы",
        slug: "/catalog/minitractory/garden",
        children: [
          {
            id: "dongfeng",
            title: "DongFeng",
            slug: "/catalog/minitractory/garden/dongfeng",
          },
          {
            id: "kubota",
            title: "Kubota",
            slug: "/catalog/minitractory/garden/kubota",
          },
          {
            id: "shifeng",
            title: "Shifeng",
            slug: "/catalog/minitractory/garden/shifeng",
          },
        ],
      },
      {
        id: "farm-tractors",
        title: "Фермерские мини-тракторы",
        slug: "/catalog/minitractory/farm",
        children: [
          {
            id: "farm-dongfeng",
            title: "DongFeng",
            slug: "/catalog/minitractory/farm/dongfeng",
          },
          {
            id: "farm-jinma",
            title: "Jinma",
            slug: "/catalog/minitractory/farm/jinma",
          },
        ],
      },
      {
        id: "budget-tractors",
        title: "Бюджетные модели",
        slug: "/catalog/minitractory/budget",
      },
    ],
  },
  {
    id: "communal-equipment",
    title: "Коммунальная техника",
    slug: "/catalog/communal-equipment",
    icon: "❄️",
    children: [
      {
        id: "snow-equipment",
        title: "Снегоуборочная техника",
        slug: "/catalog/communal-equipment/snow",
        children: [
          {
            id: "snow-blowers",
            title: "Снегоуборщики",
            slug: "/catalog/communal-equipment/snow/blowers",
          },
          {
            id: "snow-plows",
            title: "Снегоотвалы",
            slug: "/catalog/communal-equipment/snow/plows",
          },
        ],
      },
      {
        id: "attachments",
        title: "Навесное оборудование",
        slug: "/catalog/communal-equipment/attachments",
        children: [
          {
            id: "brushes",
            title: "Щетки",
            slug: "/catalog/communal-equipment/attachments/brushes",
          },
          {
            id: "loaders",
            title: "Погрузчики",
            slug: "/catalog/communal-equipment/attachments/loaders",
          },
        ],
      },
      {
        id: "lawn-equipment",
        title: "Техника для газонов",
        slug: "/catalog/communal-equipment/lawn",
      },
    ],
  },
  {
    id: "parts",
    title: "Запасные части",
    slug: "/catalog/parts",
    icon: "⚙️",
    children: [
      {
        id: "engine-parts",
        title: "Запчасти для двигателя",
        slug: "/catalog/parts/engine",
        children: [
          {
            id: "filters",
            title: "Фильтры",
            slug: "/catalog/parts/engine/filters",
          },
          {
            id: "pistons",
            title: "Поршневая группа",
            slug: "/catalog/parts/engine/pistons",
          },
        ],
      },
      {
        id: "transmission-parts",
        title: "Запчасти трансмиссии",
        slug: "/catalog/parts/transmission",
      },
      {
        id: "hydraulics",
        title: "Гидравлика",
        slug: "/catalog/parts/hydraulics",
      },
      {
        id: "electrics",
        title: "Электрика",
        slug: "/catalog/parts/electrics",
      },
    ],
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
