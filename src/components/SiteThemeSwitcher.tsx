'use client';

import { useSiteTheme, type SiteTheme } from '@/contexts/SiteThemeContext';
import { useLocale } from '@/lib/locale';

const OPTIONS: { id: SiteTheme; ja: string; en: string; swatch: string }[] = [
  { id: 'blue', ja: 'ブルー',   en: 'Blue', swatch: '#0275fd' },
  { id: 'gold', ja: 'ゴールド', en: 'Gold', swatch: '#c9a961' },
];

export default function SiteThemeSwitcher() {
  const { theme, setTheme } = useSiteTheme();
  const { locale } = useLocale();

  return (
    <div
      className="flex items-center gap-1 p-1 rounded-lg border"
      style={{ borderColor: 'var(--home-border)', background: 'var(--home-surface)' }}
      role="radiogroup"
      aria-label={locale === 'ja' ? 'サイトテーマ' : 'Site theme'}
    >
      {OPTIONS.map((opt) => {
        const active = theme === opt.id;
        return (
          <button
            key={opt.id}
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(opt.id)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-colors"
            style={{
              background: active ? 'var(--home-accent-bg)' : 'transparent',
              color: active ? 'var(--home-accent)' : 'var(--home-text-sub)',
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full border"
              style={{ background: opt.swatch, borderColor: 'var(--home-border)' }}
            />
            {locale === 'ja' ? opt.ja : opt.en}
          </button>
        );
      })}
    </div>
  );
}
