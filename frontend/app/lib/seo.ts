/**
 * SEO Утилиты для генерации metadata
 * Централизованное управление SEO на всём сайте
 */

import type { Metadata } from "next";

// Базовая конфигурация сайта
export const SITE_CONFIG = {
  name: "БелТехФермЪ",
  title: "БелТехФермЪ - Мини-тракторы и запчасти | Продажа в России",
  description:
    "Купите мини-тракторы и сельхозтехнику в БелТехФермЪ. Доставка по России: Белгород, Курск, Орёл, Воронеж, Брянск, Тула. Официальная гарантия, техническое обслуживание, низкие цены.",
  url: "https://beltehferm.netlify.app",
  ogImage: "https://beltehferm.netlify.app/images/og-image.jpg",
  phone: "+7 (800) 123-45-67",
  email: "info@beltehferm.ru",
  address: "Россия, Белгородская область",
  keywords: [
    "мини-трактор купить",
    "сельхозтехника",
    "трактор",
    "коммунальная техника",
    "запчасти для тракторов",
    "DongFeng",
    "Xingtai",
    "Foton Lovol",
    "доставка",
    "гарантия",
  ],
};

interface GenerateMetadataParams {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  canonical?: string;
  noIndex?: boolean;
  type?: "website" | "article" | "product";
}

/**
 * Генерация metadata для страницы
 */
export function generateMetadata({
  title,
  description,
  keywords = [],
  image,
  canonical,
  noIndex = false,
  type = "website",
}: GenerateMetadataParams): Metadata {
  const pageTitle = title
    ? `${title} | ${SITE_CONFIG.name}`
    : SITE_CONFIG.title;
  const pageDescription = description || SITE_CONFIG.description;
  const pageImage = image || SITE_CONFIG.ogImage;
  const pageUrl = canonical || SITE_CONFIG.url;
  const allKeywords = [...SITE_CONFIG.keywords, ...keywords].join(", ");

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: allKeywords,
    authors: [{ name: SITE_CONFIG.name }],
    creator: SITE_CONFIG.name,
    publisher: SITE_CONFIG.name,
    formatDetection: {
      email: false,
      telephone: false,
      address: false,
    },
    openGraph: {
      type,
      locale: "ru_RU",
      url: pageUrl,
      siteName: SITE_CONFIG.name,
      title: pageTitle,
      description: pageDescription,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [pageImage],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
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
      canonical: pageUrl,
    },
  };
}

/**
 * Metadata для страницы каталога
 */
export function generateCatalogMetadata(
  categoryName?: string,
  categoryDescription?: string,
): Metadata {
  if (categoryName) {
    return generateMetadata({
      title: `${categoryName} - Каталог`,
      description:
        categoryDescription ||
        `Купите ${categoryName.toLowerCase()} в БелТехФермЪ. Широкий выбор, низкие цены, доставка по России. Гарантия качества.`,
      keywords: [categoryName.toLowerCase(), "каталог", "купить"],
    });
  }

  return generateMetadata({
    title: "Каталог товаров",
    description:
      "Полный каталог мини-тракторов, коммунальной техники и запчастей. Выгодные цены, гарантия, доставка по России.",
    keywords: ["каталог", "товары", "прайс"],
  });
}

/**
 * Metadata для страницы товара
 */
export function generateProductMetadata(
  productName: string,
  productDescription: string,
  price: number,
  imageUrl?: string,
): Metadata {
  const priceFormatted = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(price);

  return generateMetadata({
    title: productName,
    description: `${productDescription} Цена: ${priceFormatted}. Купить с доставкой по России в БелТехФермЪ.`,
    keywords: [productName.toLowerCase(), "купить", "цена", "характеристики"],
    image: imageUrl,
    type: "product",
  });
}

/**
 * Metadata для страницы корзины
 */
export function generateCartMetadata(): Metadata {
  return generateMetadata({
    title: "Корзина",
    description: "Ваша корзина покупок в БелТехФермЪ",
    noIndex: true, // Корзина не индексируется
  });
}

/**
 * Metadata для страницы избранного
 */
export function generateFavoritesMetadata(): Metadata {
  return generateMetadata({
    title: "Избранное",
    description: "Ваши избранные товары в БелТехФермЪ",
    noIndex: true,
  });
}

/**
 * Metadata для страницы сравнения
 */
export function generateCompareMetadata(): Metadata {
  return generateMetadata({
    title: "Сравнение товаров",
    description: "Сравните характеристики выбранных товаров",
    noIndex: true,
  });
}

/**
 * Metadata для страницы авторизации
 */
export function generateAuthMetadata(): Metadata {
  return generateMetadata({
    title: "Вход и регистрация",
    description: "Войдите в личный кабинет или зарегистрируйтесь",
    noIndex: true,
  });
}

/**
 * Metadata для админ-панели
 */
export function generateAdminMetadata(pageName: string): Metadata {
  return generateMetadata({
    title: `Админ-панель: ${pageName}`,
    description: "Административная панель управления",
    noIndex: true, // Админка не индексируется
  });
}

/**
 * Metadata для информационных страниц
 */
export function generateInfoPageMetadata(
  pageName: string,
  pageDescription: string,
): Metadata {
  return generateMetadata({
    title: pageName,
    description: pageDescription,
    keywords: [pageName.toLowerCase()],
  });
}
