"use client";

import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Генерируем JSON-LD для структурированных данных (SEO)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href && { item: `https://belтехферм.рф${item.href}` }),
    })),
  };

  return (
    <>
      {/* Структурированные данные для поисковиков */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Визуальные breadcrumbs */}
      <nav className="breadcrumb" aria-label="Навигационная цепочка">
        {items.map((item, index) => (
          <span key={index}>
            {item.href ? (
              <Link href={item.href} className="breadcrumb-link">
                {item.label}
              </Link>
            ) : (
              <span className="breadcrumb-current">{item.label}</span>
            )}
            {index < items.length - 1 && (
              <span className="breadcrumb-separator" aria-hidden="true">
                /
              </span>
            )}
          </span>
        ))}
      </nav>

      <style jsx>{`
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          color: #666;
        }

        .breadcrumb-link {
          color: #4a90e2;
          text-decoration: none;
          transition: color 0.2s;
        }

        .breadcrumb-link:hover {
          color: #357abd;
          text-decoration: underline;
        }

        .breadcrumb-current {
          color: #333;
          font-weight: 500;
        }

        .breadcrumb-separator {
          color: #999;
          user-select: none;
        }

        @media (max-width: 768px) {
          .breadcrumb {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </>
  );
}
