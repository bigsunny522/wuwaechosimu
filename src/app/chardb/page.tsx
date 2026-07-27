import type { Metadata } from 'next';
import ChardbClient from './ChardbClient';
import { LocaleProvider } from '@/lib/locale';
import { resolveLocale, resolveExplicitLocale } from '@/lib/locale-utils';
import { buildMetadata, buildBreadcrumbJsonLd } from '@/lib/seo';

type Props = { searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = resolveLocale(await searchParams);
  return buildMetadata({
    path: '/chardb',
    locale,
    ja: {
      title: 'キャラクター別 音骸ビルドデータ一覧 | 音骸シミュレーター',
      description:
        '鳴潮（Wuthering Waves）の全キャラクターについて、推奨ハーモニーセット・コスト別メインステータス・優先サブステータスを一覧で確認できます。当ツールのスコア計算に使用している評価データをそのまま公開しています。',
      ogDescription: '鳴潮の全キャラクターの推奨ハーモニーセット・メインステ・サブステ優先度の一覧。',
    },
    en: {
      title: 'Echo Build Data by Character | Echo Simulator',
      description:
        'Recommended harmony sets, main stats by cost, and substat priorities for every Wuthering Waves character. This is the same evaluation data the score calculator uses, published in full.',
      ogDescription: 'Recommended harmony sets, main stats, and substat priorities for every Wuthering Waves character.',
    },
  });
}

export default async function ChardbPage({ searchParams }: Props) {
  const sp = await searchParams;
  const locale = resolveLocale(sp);
  const initialLocale = resolveExplicitLocale(sp);
  const breadcrumb = buildBreadcrumbJsonLd(
    '/chardb',
    locale,
    locale === 'en' ? 'Echo Build Data by Character' : 'キャラクター別 音骸ビルドデータ一覧',
  );
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <LocaleProvider initialLocale={initialLocale}>
        <ChardbClient />
      </LocaleProvider>
    </>
  );
}
