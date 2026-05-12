'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Locale = 'ja' | 'en';

interface LocaleCtx {
  locale: Locale;
  toggleLocale: () => void;
}

const LocaleContext = createContext<LocaleCtx>({ locale: 'ja', toggleLocale: () => {} });

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('ja');

  useEffect(() => {
    const saved = localStorage.getItem('wuwa-locale') as Locale | null;
    if (saved === 'ja' || saved === 'en') setLocale(saved);
  }, []);

  const toggleLocale = () => {
    setLocale((prev) => {
      const next: Locale = prev === 'ja' ? 'en' : 'ja';
      localStorage.setItem('wuwa-locale', next);
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
