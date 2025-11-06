import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'БелТехФермЪ - Мини-тракторы и сельхозтехника',
  description: 'Продажа мини-тракторов, навесного оборудования и запчастей для фермеров и сельхозпроизводителей. Белгород, Курск, Орёл, Воронеж, Брянск, Тула.',
  keywords: 'мини-трактор, сельхозтехника, трактор купить, навесное оборудование, запчасти для трактора, фермерская техника',
  authors: [{ name: 'БелТехФермЪ' }],
  openGraph: {
    title: 'БелТехФермЪ - Мини-тракторы и сельхозтехника',
    description: 'Продажа мини-тракторов для фермеров',
    url: 'https://beltehferm.ru',
    siteName: 'БелТехФермЪ',
    locale: 'ru_RU',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    yandex: 'yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
