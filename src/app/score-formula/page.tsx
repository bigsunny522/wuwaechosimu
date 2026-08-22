import type { Metadata } from 'next';
import ScoreFormulaClient from './ScoreFormulaClient';
import { LocaleProvider } from '@/lib/locale';
import { resolveLocale, resolveExplicitLocale } from '@/lib/locale-utils';
import { buildMetadata, buildBreadcrumbJsonLd } from '@/lib/seo';

type Props = { searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = resolveLocale(await searchParams);
  return buildMetadata({
    path: '/score-formula',
    locale,
    ja: {
      title: '音骸スコアの計算方法 | 音骸シミュレーター',
      description:
        '当ツールが音骸スコアとランクをどのような考え方で算出しているかを紹介します。キャラクターごとの重み付け、メインステータス・セットとの相性、ランク判定の考え方を解説します。',
      ogDescription: '音骸スコアの算出方法の考え方を紹介するページ。',
    },
    en: {
      title: 'How Echo Scores Are Calculated | Echo Simulator',
      description:
        'An overview of how this tool calculates echo scores and ranks: per-character weighting, main stat and set matching, and how ranks are determined.',
      ogDescription: 'An overview of how this tool arrives at echo scores and ranks.',
    },
  });
}

export default async function ScoreFormulaPage({ searchParams }: Props) {
  const sp = await searchParams;
  const locale = resolveLocale(sp);
  const initialLocale = resolveExplicitLocale(sp);
  const breadcrumb = buildBreadcrumbJsonLd(
    '/score-formula',
    locale,
    locale === 'en' ? 'How Echo Scores Are Calculated' : '音骸スコアの計算方法',
  );
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <LocaleProvider initialLocale={initialLocale}>
        <ScoreFormulaClient />
      </LocaleProvider>
    </>
  );
}
