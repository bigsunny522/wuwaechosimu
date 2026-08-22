import type { Metadata } from 'next';
import HomeClient from './HomeClient';
import { LocaleProvider } from '@/lib/locale';
import { resolveLocale, resolveExplicitLocale } from '@/lib/locale-utils';
import { buildMetadata, SITE_URL } from '@/lib/seo';

type Props = { searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = resolveLocale(await searchParams);
  return buildMetadata({
    path: '',
    locale,
    ja: {
      title: '音骸スコアの厳選サポーター | 鳴潮 (Wuthering Waves)',
      description:
        '鳴潮（Wuthering Waves）で実際に入手した音骸のスコアを計算しながら記録し、理論確率とベイズ推定で今後の厳選予測（期待周回数・目標達成確率）を算出する厳選サポーター。',
      ogDescription: '実際に出た音骸のスコアを記録して、今後の厳選予測を確率的に算出します。',
    },
    en: {
      title: 'Echo Score Farming Supporter | Wuthering Waves',
      description:
        'Log the echoes you actually pulled in Wuthering Waves, score them, and get statistical predictions — expected runs and target-rank probability — using theoretical odds combined with Bayesian updating from your real results.',
      ogDescription: 'Log your real echo pulls, score them, and get probability-based predictions for future farming.',
    },
  });
}

export default async function RootPage({ searchParams }: Props) {
  const sp = await searchParams;
  const locale = resolveLocale(sp);
  const initialLocale = resolveExplicitLocale(sp);
  const appJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: locale === 'en' ? 'Echo Score Farming Supporter' : '音骸スコア厳選サポーター',
    description: locale === 'en'
      ? 'Log real Wuthering Waves echo pulls, score them, and get Bayesian-updated probability predictions for future farming.'
      : '鳴潮の音骸厳選結果を記録してスコアを計算し、理論確率とベイズ推定で今後の厳選を予測するツール。',
    url: locale === 'en' ? `${SITE_URL}?lang=en` : SITE_URL,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }} />
      <LocaleProvider initialLocale={initialLocale}>
        <HomeClient />
      </LocaleProvider>
    </>
  );
}
