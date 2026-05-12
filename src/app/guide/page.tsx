import type { Metadata } from 'next';
import GuideClient from './GuideClient';

const SITE_URL = 'https://wuwa-echo-sim.pages.dev'; // ★ 実際のURLに変更

export const metadata: Metadata = {
  title: '使い方ガイド | 音骸シミュレーター',
  description:
    '鳴潮（Wuthering Waves）音骸シミュレーターの使い方を全機能解説。コスト選択・強化手順・スコア基準・ボーナスタイム・100連シミュレーションの使い方をわかりやすく説明します。',
  alternates: {
    canonical: `${SITE_URL}/guide`,
    languages: {
      ja: `${SITE_URL}/guide`,
      en: `${SITE_URL}/guide?lang=en`,
    },
  },
  openGraph: {
    title: '使い方ガイド | 音骸シミュレーター',
    description: '鳴潮の音骸厳選シミュレーターの全機能を解説するガイドページ。',
    url: `${SITE_URL}/guide`,
  },
};

export default function GuidePage() {
  return <GuideClient />;
}
