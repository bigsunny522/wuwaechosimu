import type { Metadata } from 'next';
import type { Locale } from './locale-utils';

export const SITE_URL = 'https://wuwaechotools.com';

const SITE_NAME: Record<Locale, string> = {
  ja: '音骸シミュレーター',
  en: 'Echo Simulator',
};

interface PageCopy {
  /** ページの <title> にそのまま使う完成形の文字列 */
  title: string;
  description: string;
  /** OGP用に別文言にしたい場合のみ指定（未指定ならdescriptionを流用） */
  ogDescription?: string;
}

interface BuildMetadataArgs {
  /** 例: '/guide'。トップページは '' */
  path: string;
  locale: Locale;
  ja: PageCopy;
  en: PageCopy;
  robotsIndex?: boolean;
}

/**
 * ロケールに応じて title/description/canonical/hreflang/OGP/Twitterカードを
 * 一貫した形で生成する。generateMetadata から呼び出す想定。
 */
export function buildMetadata({ path, locale, ja, en, robotsIndex = true }: BuildMetadataArgs): Metadata {
  const copy = locale === 'en' ? en : ja;
  const jaUrl = `${SITE_URL}${path}`;
  const enUrl = `${SITE_URL}${path}${path.includes('?') ? '&' : '?'}lang=en`;
  const canonical = locale === 'en' ? enUrl : jaUrl;
  const ogImage = locale === 'en' ? `${SITE_URL}/og-image-en.png` : `${SITE_URL}/og-image.png`;
  const ogDescription = copy.ogDescription ?? copy.description;

  return {
    // title.absolute で親レイアウトの title.template（"%s | 音骸シミュレーター"）による
    // サフィックス二重付与を防ぐ（copy.titleは既に完成形の文字列のため）
    title: { absolute: copy.title },
    description: copy.description,
    alternates: {
      canonical,
      languages: {
        ja: jaUrl,
        en: enUrl,
        'x-default': jaUrl,
      },
    },
    openGraph: {
      title: copy.title,
      description: ogDescription,
      url: canonical,
      siteName: SITE_NAME[locale],
      locale: locale === 'en' ? 'en_US' : 'ja_JP',
      alternateLocale: locale === 'en' ? 'ja_JP' : 'en_US',
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: SITE_NAME[locale] }],
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.title,
      description: ogDescription,
      images: [ogImage],
    },
    robots: robotsIndex
      ? { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1 } }
      : { index: false, follow: false },
  };
}

const HOME_NAME: Record<Locale, string> = {
  ja: '音骸シミュレーター',
  en: 'Echo Simulator',
};

/** パンくずリストのJSON-LD（トップ > このページ）を生成する */
export function buildBreadcrumbJsonLd(path: string, locale: Locale, pageName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: HOME_NAME[locale],
        item: locale === 'en' ? `${SITE_URL}?lang=en` : SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: pageName,
        item: locale === 'en' ? `${SITE_URL}${path}?lang=en` : `${SITE_URL}${path}`,
      },
    ],
  };
}
