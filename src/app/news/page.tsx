import type { Metadata } from 'next';
import NewsClient from './NewsClient';

const SITE_URL = 'https://wuwaechosimu.xyzack271.com';

export const metadata: Metadata = {
  title: 'お知らせ | 音骸シミュレーター',
  description: '鳴潮（Wuthering Waves）音骸シミュレーターの更新情報・キャラクター追加履歴。',
  alternates: {
    canonical: `${SITE_URL}/news`,
    languages: {
      ja: `${SITE_URL}/news`,
      en: `${SITE_URL}/news?lang=en`,
    },
  },
  openGraph: {
    title: 'お知らせ | 音骸シミュレーター',
    description: '鳴潮の音骸厳選シミュレーターの更新情報ページ。',
    url: `${SITE_URL}/news`,
  },
};

export default function NewsPage() {
  return <NewsClient />;
}
