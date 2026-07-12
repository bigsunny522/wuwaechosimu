import type { Metadata } from 'next';
import ContactClient from './ContactClient';

const SITE_URL = 'https://wuwaechotools.com';

export const metadata: Metadata = {
  title: 'お問い合わせ | 音骸シミュレーター',
  description: '音骸シミュレーターへのお問い合わせ・不具合報告・ご要望はこちらから。',
  alternates: {
    canonical: `${SITE_URL}/contact`,
    languages: {
      ja: `${SITE_URL}/contact`,
      en: `${SITE_URL}/contact?lang=en`,
    },
  },
  openGraph: {
    title: 'お問い合わせ | 音骸シミュレーター',
    description: '音骸シミュレーターへのお問い合わせはこちらから。',
    url: `${SITE_URL}/contact`,
  },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return <ContactClient />;
}
