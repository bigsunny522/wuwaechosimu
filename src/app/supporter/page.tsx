import type { Metadata } from 'next';
import SupporterClient from './SupporterClient';

const SITE_URL = 'https://wuwaechotools.com';

export const metadata: Metadata = {
  title: '厳選サポーター | 音骸シミュレーター',
  description:
    '鳴潮（Wuthering Waves）で実際に入手した音骸のサブステータスを記録し、理論確率とベイズ推定で今後の厳選予測（期待周回数・目標達成確率）を算出する厳選サポーター。',
  alternates: {
    canonical: `${SITE_URL}/supporter`,
    languages: {
      ja: `${SITE_URL}/supporter`,
      en: `${SITE_URL}/supporter?lang=en`,
    },
  },
  openGraph: {
    title: '厳選サポーター | 音骸シミュレーター',
    description: '実際に出た音骸のデータを記録して、今後の厳選予測を確率的に算出します。',
    url: `${SITE_URL}/supporter`,
  },
};

export default function SupporterPage() {
  return <SupporterClient />;
}
