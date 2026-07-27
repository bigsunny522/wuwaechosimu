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
        '当ツールが音骸スコアを算出する仕組みを公開しています。ダメージ式の偏微分から導くサブステータスの重み付け、キャラクターごとの運用バリアント、Tier評価、理論最大値との比によるスコア正規化までを解説します。',
      ogDescription: '音骸スコアの重み付けと算出ロジックを全て公開している解説ページ。',
    },
    en: {
      title: 'How Echo Scores Are Calculated | Echo Simulator',
      description:
        'A full breakdown of how this tool scores echoes: substat weights derived from the partial derivatives of the damage formula, per-character build variants, tier evaluation, and normalization against the theoretical maximum.',
      ogDescription: 'A complete, open explanation of the echo scoring weights and formula.',
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
