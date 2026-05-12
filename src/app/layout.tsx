import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { LocaleProvider } from '@/lib/locale';
import './globals.css';

export const metadata: Metadata = {
  title: '音骸シミュレーター | 鳴潮 WutheringWaves',
  description: '鳴潮の音骸強化・厳選をシミュレートできるツール',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <head>
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
