'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type SiteTheme = 'blue' | 'gold';

const STORAGE_KEY = 'wuwa-site-theme';
const THEMES: SiteTheme[] = ['blue', 'gold'];

interface SiteThemeContextValue {
  theme: SiteTheme;
  setTheme: (t: SiteTheme) => void;
}

const SiteThemeContext = createContext<SiteThemeContextValue | null>(null);

export function SiteThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<SiteTheme>('blue');

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    if (current && THEMES.includes(current as SiteTheme)) {
      setThemeState(current as SiteTheme);
    }
  }, []);

  const setTheme = (t: SiteTheme) => {
    setThemeState(t);
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // private browsing etc. — theme just won't persist across reloads
    }
  };

  return (
    <SiteThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </SiteThemeContext.Provider>
  );
}

export function useSiteTheme() {
  const ctx = useContext(SiteThemeContext);
  if (!ctx) throw new Error('useSiteTheme must be used within SiteThemeProvider');
  return ctx;
}
