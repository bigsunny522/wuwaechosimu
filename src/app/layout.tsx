import type { Metadata, Viewport } from 'next';
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
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0a0c14] text-slate-200">
        {children}
      </body>
    </html>
  );
}
