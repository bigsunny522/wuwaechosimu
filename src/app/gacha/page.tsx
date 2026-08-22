import type { Metadata } from 'next';
import GachaClient from './GachaClient';
import { LocaleProvider } from '@/lib/locale';
import { SiteThemeProvider } from '@/contexts/SiteThemeContext';
import { resolveLocale, resolveExplicitLocale } from '@/lib/locale-utils';
import { buildMetadata, buildBreadcrumbJsonLd } from '@/lib/seo';
import { buildFaqJsonLd } from '@/data/homeExplainer';

type Props = { searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = resolveLocale(await searchParams);
  return buildMetadata({
    path: '/gacha',
    locale,
    ja: {
      title: '音骸ガチャシミュレーター | 鳴潮 (Wuthering Waves) 厳選練習ツール',
      description:
        '鳴潮（Wuthering Waves）の音骸強化・厳選を無料でシミュレート。音骸スコア自動計算・キャラクター別サブステ評価・メインステ固定・再抽選・100連一括シミュレーション対応。PCもスマホも対応。',
      ogDescription: '鳴潮の音骸厳選を無料でシミュレート。スコア自動計算・キャラ別評価・サブステ再抽選・100連シミュ対応。',
    },
    en: {
      title: 'Echo Gacha Simulator | Wuthering Waves Echo Farming Practice Tool',
      description:
        'Free Wuthering Waves echo farming simulator. Automatic score calculation, per-character substat evaluation, main stat locking, substat reroll, and 100-pull batch simulation. Works on PC and mobile.',
      ogDescription:
        'Free echo farming simulator for Wuthering Waves. Auto score calculation, per-character evaluation, substat reroll, and 100-pull batch simulation.',
    },
  });
}

export default async function GachaPage({ searchParams }: Props) {
  const sp = await searchParams;
  const locale = resolveLocale(sp);
  const initialLocale = resolveExplicitLocale(sp);
  const faqJsonLd = buildFaqJsonLd(locale);
  const breadcrumb = buildBreadcrumbJsonLd('/gacha', locale, locale === 'en' ? 'Gacha Simulator' : 'ガチャシミュレーター');
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <LocaleProvider initialLocale={initialLocale}>
        <SiteThemeProvider>
          <GachaClient />
        </SiteThemeProvider>
      </LocaleProvider>
    </>
  );
}
