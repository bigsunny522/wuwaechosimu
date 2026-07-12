import type { Metadata } from 'next';
import ContactClient from './ContactClient';
import { LocaleProvider } from '@/lib/locale';
import { resolveLocale, resolveExplicitLocale } from '@/lib/locale-utils';
import { buildMetadata, buildBreadcrumbJsonLd } from '@/lib/seo';

type Props = { searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = resolveLocale(await searchParams);
  return buildMetadata({
    path: '/contact',
    locale,
    ja: {
      title: 'お問い合わせ | 音骸シミュレーター',
      description: '音骸シミュレーターへのお問い合わせ・不具合報告・ご要望はこちらから。',
      ogDescription: '音骸シミュレーターへのお問い合わせはこちらから。',
    },
    en: {
      title: 'Contact Us | Echo Simulator',
      description: 'Contact the Echo Simulator team with bug reports, feedback, or questions.',
    },
  });
}

export default async function ContactPage({ searchParams }: Props) {
  const sp = await searchParams;
  const locale = resolveLocale(sp);
  const initialLocale = resolveExplicitLocale(sp);
  const breadcrumb = buildBreadcrumbJsonLd('/contact', locale, locale === 'en' ? 'Contact Us' : 'お問い合わせ');
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <LocaleProvider initialLocale={initialLocale}>
        <ContactClient />
      </LocaleProvider>
    </>
  );
}
