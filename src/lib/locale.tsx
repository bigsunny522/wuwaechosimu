'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Locale } from './locale-utils';

export type { Locale };
export { withLang } from './locale-utils';

interface LocaleCtx {
  locale: Locale;
  toggleLocale: () => void;
}

const LocaleContext = createContext<LocaleCtx>({ locale: 'ja', toggleLocale: () => {} });

interface LocaleProviderProps {
  children: ReactNode;
  /**
   * サーバー側で ?lang= から判定した初期ロケール。指定されている場合は
   * それを信頼し、ブラウザ言語からの自動判定は行わない
   * （URL・メタデータ・SSR本文の言語を一致させ、hreflangを正しく機能させるため）。
   */
  initialLocale?: Locale;
}

export function LocaleProvider({ children, initialLocale }: LocaleProviderProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale ?? 'ja');

  useEffect(() => {
    if (initialLocale) {
      localStorage.setItem('wuwa-locale', initialLocale);
      return;
    }
    const saved = localStorage.getItem('wuwa-locale') as Locale | null;
    if (saved === 'ja' || saved === 'en') {
      setLocale(saved);
      return;
    }
    // 保存済みの選択がない場合はブラウザの言語設定から自動判定
    const browserLangs = navigator.languages ?? [navigator.language];
    const isJapanese = browserLangs.some((l) => l.toLowerCase().startsWith('ja'));
    setLocale(isJapanese ? 'ja' : 'en');
  }, [initialLocale]);

  // SSRは常に lang="ja" を返すため、確定したロケールでDOM側の言語属性も揃えておく
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const toggleLocale = () => {
    setLocale((prev) => {
      const next: Locale = prev === 'ja' ? 'en' : 'ja';
      localStorage.setItem('wuwa-locale', next);
      // アドレスバーのURLもロケールに合わせておく（再読み込み・共有時に一致させるため）
      const url = new URL(window.location.href);
      if (next === 'en') {
        url.searchParams.set('lang', 'en');
      } else {
        url.searchParams.delete('lang');
      }
      window.history.replaceState(null, '', url.pathname + url.search);
      return next;
    });
  };

  return (
    <LocaleContext.Provider value={{ locale, toggleLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleCtx {
  return useContext(LocaleContext);
}
