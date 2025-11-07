// Компонент для структурированных данных (JSON-LD) для SEO

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "БелТехФермЪ",
    description: "Продажа мини-тракторов и сельхозтехники",
    url: "https://beltehferm.netlify.app",
    logo: "https://beltehferm.netlify.app/images/logo.jpg",
    sameAs: [
      "https://vk.com/beltehferm",
      "https://t.me/beltehferm",
      "https://wa.me/79999999999",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      telephone: "+7-999-999-99-99",
      email: "info@beltehferm.ru",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "RU",
      addressRegion: "Белгородская область",
      addressLocality: "Белгород",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function LocalBusinessJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "БелТехФермЪ",
    description: "Магазин сельхозтехники и мини-тракторов",
    image: "https://beltehferm.netlify.app/images/logo.jpg",
    url: "https://beltehferm.netlify.app",
    telephone: "+7-999-999-99-99",
    email: "info@beltehferm.ru",
    areaServed: ["RU"],
    priceRange: "₽₽",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Белгород",
      addressCountry: "RU",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ProductJsonLd(product: {
  name: string;
  price: number;
  image_url: string;
  manufacturer?: string;
  description?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image_url,
    description: product.description || product.name,
    brand: {
      "@type": "Brand",
      name: product.manufacturer || "БелТехФермЪ",
    },
    offers: {
      "@type": "Offer",
      url: "https://beltehferm.netlify.app/catalog",
      priceCurrency: "RUB",
      price: product.price.toString(),
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
