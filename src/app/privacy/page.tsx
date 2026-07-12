import type { Metadata } from 'next';
import PrivacyClient from './PrivacyClient';
import { LocaleProvider } from '@/lib/locale';
import { resolveLocale, resolveExplicitLocale } from '@/lib/locale-utils';
import { buildMetadata, buildBreadcrumbJsonLd } from '@/lib/seo';

type Props = { searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = resolveLocale(await searchParams);
  return buildMetadata({
    path: '/privacy',
    locale,
    ja: {
      title: 'プライバシーポリシー | 音骸シミュレーター',
      description:
        '音骸シミュレーターのプライバシーポリシー。広告配信・アクセス解析・Cookieの利用について説明します。',
      ogDescription: '音骸シミュレーターのプライバシーポリシー。',
    },
    en: {
      title: 'Privacy Policy | Echo Simulator',
      description:
        'Privacy policy for the Echo Simulator, covering ad serving, analytics, and cookie usage.',
    },
  });
}

export default async function PrivacyPage({ searchParams }: Props) {
  const sp = await searchParams;
  const locale = resolveLocale(sp);
  const initialLocale = resolveExplicitLocale(sp);
  const breadcrumb = buildBreadcrumbJsonLd('/privacy', locale, locale === 'en' ? 'Privacy Policy' : 'プライバシーポリシー');
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <LocaleProvider initialLocale={initialLocale}>
        <PrivacyClient />
      </LocaleProvider>
    </>
  );
}
