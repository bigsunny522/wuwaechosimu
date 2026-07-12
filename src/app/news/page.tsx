import type { Metadata } from 'next';
import NewsClient from './NewsClient';
import { LocaleProvider } from '@/lib/locale';
import { resolveLocale, resolveExplicitLocale } from '@/lib/locale-utils';
import { buildMetadata, buildBreadcrumbJsonLd } from '@/lib/seo';

type Props = { searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = resolveLocale(await searchParams);
  return buildMetadata({
    path: '/news',
    locale,
    ja: {
      title: 'お知らせ | 音骸シミュレーター',
      description: '鳴潮（Wuthering Waves）音骸シミュレーターの更新情報・キャラクター追加履歴。',
      ogDescription: '鳴潮の音骸厳選シミュレーターの更新情報ページ。',
    },
    en: {
      title: "What's New | Echo Simulator",
      description: 'Update log and character addition history for the Wuthering Waves Echo Simulator.',
    },
  });
}

export default async function NewsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const locale = resolveLocale(sp);
  const initialLocale = resolveExplicitLocale(sp);
  const breadcrumb = buildBreadcrumbJsonLd('/news', locale, locale === 'en' ? "What's New" : 'お知らせ');
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <LocaleProvider initialLocale={initialLocale}>
        <NewsClient />
      </LocaleProvider>
    </>
  );
}
