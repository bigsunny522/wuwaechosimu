import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { LocaleProvider } from '@/lib/locale';
import './globals.css';

// ★ 公開URLを実際のドメインに変更してください
const SITE_URL = 'https://wuwaechosimu.xyzack271.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '音骸シミュレーター | 鳴潮 (Wuthering Waves) 厳選・スコア計算ツール',
    template: '%s | 音骸シミュレーター',
  },
  description:
    '鳴潮（Wuthering Waves）の音骸強化・厳選を無料でシミュレート。音骸スコア自動計算・キャラクター別サブステ評価・メインステ固定・再抽選・100連一括シミュレーション対応。PCもスマホも対応。',
  keywords: [
    '鳴潮', '音骸', 'シミュレーター', '厳選', 'スコア計算',
    '音骸厳選', '音骸スコア', 'Wuthering Waves', 'Echo simulator',
    'echo farming', 'echo score', 'WuWa', 'サブステ', '再抽選',
  ],
  authors: [{ name: '音骸シミュレーター' }],
  creator: '音骸シミュレーター',
  alternates: {
    canonical: SITE_URL,
    languages: {
      'ja': SITE_URL,
      'en': `${SITE_URL}?lang=en`,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: 'en_US',
    url: SITE_URL,
    siteName: '音骸シミュレーター',
    title: '音骸シミュレーター | 鳴潮 厳選・スコア計算ツール',
    description:
      '鳴潮の音骸厳選を無料でシミュレート。スコア自動計算・キャラ別評価・サブステ再抽選・100連シミュ対応。',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: '音骸シミュレーター — 鳴潮 (Wuthering Waves)',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '音骸シミュレーター | 鳴潮',
    description: '鳴潮の音骸厳選を無料でシミュレート。スコア計算・再抽選・100連対応。',
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1 },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0275fd',
};

/** JSON-LD 構造化データ */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '音骸シミュレーター',
  alternateName: 'Wuthering Waves Echo Simulator',
  description: '鳴潮（Wuthering Waves）の音骸強化・厳選をシミュレートできる無料Webツール。スコア自動計算・キャラクター別評価・100連一括シミュレーション対応。',
  url: SITE_URL,
  applicationCategory: 'GameApplication',
  operatingSystem: 'Web',
  inLanguage: ['ja', 'en'],
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
  about: {
    '@type': 'VideoGame',
    name: '鳴潮 (Wuthering Waves)',
    url: 'https://wutheringwaves.kurogames.com',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <head>
        {/* JSON-LD 構造化データ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google Fonts — Inter / Noto Sans JP / IBM Plex Mono */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=Inter:wght@400;500;600&family=Noto+Sans+JP:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Google Publisher Tags — リワード広告 */}
        <Script
          src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"
          strategy="afterInteractive"
        />
        {/* AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6628382645135412"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-[#222222]">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
