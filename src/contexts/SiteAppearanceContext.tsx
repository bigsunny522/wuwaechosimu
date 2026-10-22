'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { ELEMENT_THEME, type ElementKey } from '@/components/home/elementTheme';

export type SiteMode = 'dark' | 'light';

interface SiteAppearance {
  mode: SiteMode;
  setMode: (m: SiteMode) => void;
  element: ElementKey;
  /** キャラを選んだときに呼ぶ。element と キャラ id を保存し、<html data-element> を書き換える。
   *  element は呼ぶ側が elementKeyOf(char?.element) で渡す(Provider にキャラのデータを持ち込まないため) */
  setCharacter: (charId: string, element: ElementKey) => void;
  /** 保存されているキャラ id。無ければ null。マウント後に読むので最初は null */
  savedCharId: string | null;
  /** JS で hex が要る所(CustomSelect・EchoIcon・SVG)向け */
  accentHex: string;      // ELEMENT_THEME[element].accent
  accentTextHex: string;  // mode が light なら ELEMENT_THEME[element].textLight、dark なら accent
}

const SiteAppearanceContext = createContext<SiteAppearance | null>(null);

const MODE_KEY = 'wuwa-site-mode';
const ELEMENT_KEY = 'wuwa-accent-element';
const CHAR_KEY = 'wuwa-last-char';

const MODES: SiteMode[] = ['dark', 'light'];
const ELEMENTS: ElementKey[] = ['fusion', 'glacio', 'electro', 'aero', 'spectro', 'havoc', 'none'];

export function SiteAppearanceProvider({ children }: { children: ReactNode }) {
  // サーバーの出力は常に dark / none。マウント後にスクリプトの入れた値へ合わせる
  const [mode, setModeState] = useState<SiteMode>('dark');
  const [element, setElementState] = useState<ElementKey>('none');
  const [savedCharId, setSavedCharId] = useState<string | null>(null);

  useEffect(() => {
    const m = document.documentElement.dataset.mode;
    if (m && MODES.includes(m as SiteMode)) setModeState(m as SiteMode);
    const e = document.documentElement.dataset.element;
    if (e && ELEMENTS.includes(e as ElementKey)) setElementState(e as ElementKey);
    try {
      const c = localStorage.getItem(CHAR_KEY);
      if (c) setSavedCharId(c);
    } catch {
      // private browsing etc. — 保存済みキャラの復元だけ行えない
    }
  }, []);

  const setMode = useCallback((m: SiteMode) => {
    setModeState(m);
    document.documentElement.dataset.mode = m;
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {
      // private browsing etc. — mode just won't persist across reloads
    }
  }, []);

  const setCharacter = useCallback((charId: string, element: ElementKey) => {
    setElementState(element);
    setSavedCharId(charId);
    document.documentElement.dataset.element = element;
    try {
      localStorage.setItem(ELEMENT_KEY, element);
      localStorage.setItem(CHAR_KEY, charId);
    } catch {
      // private browsing etc. — character just won't persist across reloads
    }
  }, []);

  const theme = ELEMENT_THEME[element];

  return (
    <SiteAppearanceContext.Provider
      value={{
        mode,
        setMode,
        element,
        setCharacter,
        savedCharId,
        accentHex: theme.accent,
        accentTextHex: mode === 'light' ? theme.textLight : theme.accent,
      }}
    >
      {children}
    </SiteAppearanceContext.Provider>
  );
}

export function useSiteAppearance(): SiteAppearance {
  const ctx = useContext(SiteAppearanceContext);
  if (!ctx) throw new Error('useSiteAppearance must be used within SiteAppearanceProvider');
  return ctx;
}
