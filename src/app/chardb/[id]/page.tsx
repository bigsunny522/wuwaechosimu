import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CharacterDetailClient from './CharacterDetailClient';
import { LocaleProvider } from '@/lib/locale';
import { resolveLocale, resolveExplicitLocale } from '@/lib/locale-utils';
import { buildMetadata } from '@/lib/seo';
import {
  isCharacterPageId,
  getCharacterPageData,
  getCharacterPageMetaCopy,
  buildCharacterBreadcrumbJsonLd,
} from '@/lib/characterPages';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id } = await params;
  // CHARACTER_PAGE_IDS に含まれない id は 404（lucy 等）
  if (!isCharacterPageId(id)) notFound();
  const locale = resolveLocale(await searchParams);
  const copy = getCharacterPageMetaCopy(id);
  return buildMetadata({
    path: `/chardb/${id}`,
    locale,
    ja: copy.ja,
    en: copy.en,
  });
}

export default async function CharacterPage({ params, searchParams }: Props) {
  const { id } = await params;
  const data = getCharacterPageData(id);
  if (!data || !isCharacterPageId(id)) notFound();

  const sp = await searchParams;
  const locale = resolveLocale(sp);
  const initialLocale = resolveExplicitLocale(sp);
  const breadcrumb = buildCharacterBreadcrumbJsonLd(id, locale);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <LocaleProvider initialLocale={initialLocale}>
        <CharacterDetailClient data={data} />
      </LocaleProvider>
    </>
  );
}
