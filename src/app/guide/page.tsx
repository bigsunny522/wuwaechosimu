import type { Metadata } from 'next';
import GuideClient from './GuideClient';
import { LocaleProvider } from '@/lib/locale';
import { resolveLocale, resolveExplicitLocale } from '@/lib/locale-utils';
import { buildMetadata, buildBreadcrumbJsonLd } from '@/lib/seo';

type Props = { searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = resolveLocale(await searchParams);
  return buildMetadata({
    path: '/guide',
    locale,
    ja: {
      title: '使い方ガイド | 音骸シミュレーター',
      description:
        '鳴潮（Wuthering Waves）音骸シミュレーターの使い方を全機能解説。コスト選択・強化手順・スコア基準・ボーナスタイム・100連シミュレーションの使い方をわかりやすく説明します。',
      ogDescription: '鳴潮の音骸厳選シミュレーターの全機能を解説するガイドページ。',
    },
    en: {
      title: 'How to Use | Echo Simulator',
      description:
        'A complete guide to the Wuthering Waves Echo Simulator: cost selection, upgrading, scoring criteria, bonus time, and the 100-pull batch simulation, explained step by step.',
      ogDescription: 'A full walkthrough of every feature in the Wuthering Waves Echo Simulator.',
    },
  });
}

export default async function GuidePage({ searchParams }: Props) {
  const sp = await searchParams;
  const locale = resolveLocale(sp);
  const initialLocale = resolveExplicitLocale(sp);
  const breadcrumb = buildBreadcrumbJsonLd('/guide', locale, locale === 'en' ? 'How to Use' : '使い方ガイド');
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <LocaleProvider initialLocale={initialLocale}>
        <GuideClient />
      </LocaleProvider>
    </>
  );
}
