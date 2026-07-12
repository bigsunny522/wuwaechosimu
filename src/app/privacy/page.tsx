import type { Metadata } from 'next';
import PrivacyClient from './PrivacyClient';

const SITE_URL = 'https://wuwaechotools.com';

export const metadata: Metadata = {
  title: 'プライバシーポリシー | 音骸シミュレーター',
  description:
    '音骸シミュレーターのプライバシーポリシー。広告配信・アクセス解析・Cookieの利用について説明します。',
  alternates: {
    canonical: `${SITE_URL}/privacy`,
    languages: {
      ja: `${SITE_URL}/privacy`,
      en: `${SITE_URL}/privacy?lang=en`,
    },
  },
  openGraph: {
    title: 'プライバシーポリシー | 音骸シミュレーター',
    description: '音骸シミュレーターのプライバシーポリシー。',
    url: `${SITE_URL}/privacy`,
  },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
