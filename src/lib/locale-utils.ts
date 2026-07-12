export type Locale = 'ja' | 'en';

type SearchParams = { lang?: string | string[] };

function readLangParam(searchParams?: SearchParams): string | undefined {
  return Array.isArray(searchParams?.lang) ? searchParams?.lang[0] : searchParams?.lang;
}

/**
 * メタデータ生成用: searchParams から確定的な Locale を判定する（未指定時は 'ja'）。
 * canonical・title・description など、必ずどちらかに決めて出力する必要がある値に使う。
 */
export function resolveLocale(searchParams?: SearchParams): Locale {
  return readLangParam(searchParams) === 'en' ? 'en' : 'ja';
}

/**
 * LocaleProvider の initialLocale 用: ?lang= が明示的に指定されている場合のみ
 * 値を返す。未指定（bare URL）の場合は undefined を返し、クライアント側の
 * ブラウザ言語自動判定に委ねる。
 */
export function resolveExplicitLocale(searchParams?: SearchParams): Locale | undefined {
  const lang = readLangParam(searchParams);
  return lang === 'en' ? 'en' : lang === 'ja' ? 'ja' : undefined;
}

/** ロケールに応じてリンク先に ?lang=en を付与する（内部ナビゲーションでも言語を維持するため） */
export function withLang(path: string, locale: Locale): string {
  if (locale !== 'en') return path;
  return path.includes('?') ? `${path}&lang=en` : `${path}?lang=en`;
}
