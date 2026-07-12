import type { Metadata } from 'next';
import HomeClient from './HomeClient';
import { LocaleProvider } from '@/lib/locale';
import { resolveLocale, resolveExplicitLocale } from '@/lib/locale-utils';
import { buildMetadata } from '@/lib/seo';

type Props = { searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = resolveLocale(await searchParams);
  return buildMetadata({
    path: '',
    locale,
    ja: {
      title: '音骸シミュレーター | 鳴潮 (Wuthering Waves) 厳選・スコア計算ツール',
      description:
        '鳴潮（Wuthering Waves）の音骸強化・厳選を無料でシミュレート。音骸スコア自動計算・キャラクター別サブステ評価・メインステ固定・再抽選・100連一括シミュレーション対応。PCもスマホも対応。',
      ogDescription: '鳴潮の音骸厳選を無料でシミュレート。スコア自動計算・キャラ別評価・サブステ再抽選・100連シミュ対応。',
    },
    en: {
      title: 'Echo Simulator | Wuthering Waves Echo Farming & Score Calculator',
      description:
        'Free Wuthering Waves echo farming simulator. Automatic score calculation, per-character substat evaluation, main stat locking, substat reroll, and 100-pull batch simulation. Works on PC and mobile.',
      ogDescription:
        'Free echo farming simulator for Wuthering Waves. Auto score calculation, per-character evaluation, substat reroll, and 100-pull batch simulation.',
    },
  });
}

export default async function HomePage({ searchParams }: Props) {
  const initialLocale = resolveExplicitLocale(await searchParams);
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <HomeClient />
    </LocaleProvider>
  );
}
