/**
 * Schema.org Structured Data для SEO
 * JSON-LD разметка для различных типов контента
 */

import React from "react";
import { SITE_CONFIG } from "./seo";

/**
 * Схема Organization для всего сайта
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/images/logo.png`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE_CONFIG.phone,
      contactType: "customer service",
      areaServed: "RU",
      availableLanguage: ["Russian"],
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "RU",
      addressLocality: SITE_CONFIG.address,
    },
    sameAs: [
      // Добавьте ссылки на соцсети, если есть
      // "https://vk.com/beltehferm",
      // "https://t.me/beltehferm",
    ],
  };
}

/**
 * Схема LocalBusiness для местного бизнеса
 */
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_CONFIG.name,
    image: `${SITE_CONFIG.url}/images/logo.png`,
    "@id": SITE_CONFIG.url,
    url: SITE_CONFIG.url,
    telephone: SITE_CONFIG.phone,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressCountry: "RU",
      addressRegion: "Белгородская область",
      addressLocality: SITE_CONFIG.address,
    },
    geo: {
      "@type": "GeoCoordinates",
      // Добавьте реальные координаты
      latitude: 50.595414,
      longitude: 36.587277,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
  };
}

interface ProductSchemaParams {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  condition?: "NewCondition" | "UsedCondition" | "RefurbishedCondition";
  brand?: string;
  sku?: string;
  gtin?: string;
}

/**
 * Схема Product для страницы товара
 */
export function generateProductSchema({
  name,
  description,
  image,
  price,
  currency = "RUB",
  availability = "InStock",
  condition = "NewCondition",
  brand,
  sku,
  gtin,
}: ProductSchemaParams) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image,
    offers: {
      "@type": "Offer",
      url: SITE_CONFIG.url,
      priceCurrency: currency,
      price: price.toString(),
      priceValidUntil: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000,
      ).toISOString(), // +1 год
      availability: `https://schema.org/${availability}`,
      itemCondition: `https://schema.org/${condition}`,
      seller: {
        "@type": "Organization",
        name: SITE_CONFIG.name,
      },
    },
  };

  if (brand) {
    schema.brand = {
      "@type": "Brand",
      name: brand,
    };
  }

  if (sku) {
    schema.sku = sku;
  }

  if (gtin) {
    schema.gtin = gtin;
  }

  // Добавляем рейтинг если есть (можно добавить позже)
  // schema.aggregateRating = {
  //   "@type": "AggregateRating",
  //   ratingValue: "4.8",
  //   reviewCount: "24"
  // };

  return schema;
}

/**
 * Схема BreadcrumbList для хлебных крошек
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.url}`,
    })),
  };
}

/**
 * Схема ItemList для каталога товаров
 */
export function generateItemListSchema(
  products: Array<{
    name: string;
    image: string;
    price: number;
    url: string;
  }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        image: product.image,
        offers: {
          "@type": "Offer",
          priceCurrency: "RUB",
          price: product.price.toString(),
          url: `${SITE_CONFIG.url}${product.url}`,
        },
      },
    })),
  };
}

/**
 * Схема WebSite для поиска по сайту
 */
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_CONFIG.url}/catalog?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Схема FAQ для страницы с вопросами
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Компонент для вставки JSON-LD разметки
 */
export function JsonLd({ data }: { data: Record<string, any> }) {
  return React.createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  });
}
