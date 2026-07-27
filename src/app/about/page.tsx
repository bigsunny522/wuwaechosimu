import type { Metadata } from 'next';
import AboutClient from './AboutClient';
import { LocaleProvider } from '@/lib/locale';
import { resolveLocale, resolveExplicitLocale } from '@/lib/locale-utils';
import { buildMetadata, buildBreadcrumbJsonLd } from '@/lib/seo';

type Props = { searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = resolveLocale(await searchParams);
  return buildMetadata({
    path: '/about',
    locale,
    ja: {
      title: 'このサイトについて | 音骸シミュレーター',
      description:
        '音骸シミュレーターの運営方針・データの出典・免責事項について説明しています。鳴潮（Wuthering Waves）の非公式ファンツールとして、個人が制作・運営しています。',
      ogDescription: '音骸シミュレーターの運営方針・データ出典・免責事項について。',
    },
    en: {
      title: 'About This Site | Echo Simulator',
      description:
        'How the Echo Simulator is run, where its data comes from, and its disclaimers. This is an unofficial Wuthering Waves fan tool built and maintained by an individual.',
      ogDescription: 'How the Echo Simulator is run, where its data comes from, and its disclaimers.',
    },
  });
}

export default async function AboutPage({ searchParams }: Props) {
  const sp = await searchParams;
  const locale = resolveLocale(sp);
  const initialLocale = resolveExplicitLocale(sp);
  const breadcrumb = buildBreadcrumbJsonLd(
    '/about',
    locale,
    locale === 'en' ? 'About This Site' : 'このサイトについて',
  );
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <LocaleProvider initialLocale={initialLocale}>
        <AboutClient />
      </LocaleProvider>
    </>
  );
}
