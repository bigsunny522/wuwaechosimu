'use client';

import Link from 'next/link';
import { useLocale, withLang } from '@/lib/locale';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import ResultCardVisual from '@/components/ResultCardVisual';
import type { EchoState, ScoreResult } from '@/types/echo';

export interface ShareView {
  echo: EchoState;
  score: ScoreResult;
  charName?: string;
  charNameEn?: string;
}

interface Props {
  result: ShareView | null;
}

const COPY = {
  ja: {
    charFor: (name: string) => `${name}用`,
    primary: '自分も厳選する',
    secondary: 'ガチャで遊ぶ',
    failed: '結果を読み込めませんでした',
  },
  en: {
    charFor: (name: string) => `for ${name}`,
    primary: 'Try it yourself',
    secondary: 'Try the gacha',
    failed: "Couldn't load this result.",
  },
} as const;

export default function ShareClient({ result }: Props) {
  const { locale } = useLocale();
  const C = COPY[locale];
  const charName = result
    ? (locale === 'en' ? (result.charNameEn ?? result.charName) : result.charName)
    : undefined;
  const charLabel = charName ? C.charFor(charName) : '';

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-10 flex flex-col items-center gap-6">
        {result ? (
          <>
            {charLabel && (
              <p className="text-sm font-semibold" style={{ color: 'var(--hd-sub)' }}>
                {charLabel}
              </p>
            )}
            <ResultCardVisual echo={result.echo} score={result.score} />
          </>
        ) : (
          <p className="text-sm" style={{ color: 'var(--hd-sub)' }}>
            {C.failed}
          </p>
        )}

        <Link
          href={withLang('/', locale)}
          className="inline-flex items-center justify-center w-full max-w-xs py-3 rounded-[500px] text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ background: 'var(--hd-accent)', color: 'var(--hd-accent-ink)' }}
        >
          {C.primary}
        </Link>

        {result && (
          <Link
            href={withLang('/gacha', locale)}
            className="text-sm font-medium"
            style={{ color: 'var(--hd-accent-text)' }}
          >
            {C.secondary} →
          </Link>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
