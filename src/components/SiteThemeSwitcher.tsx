'use client';

import { Palette } from 'lucide-react';
import { useSiteTheme, type SiteTheme } from '@/contexts/SiteThemeContext';
import { useLocale } from '@/lib/locale';

const OPTIONS: { id: SiteTheme; ja: string; en: string; swatch: string }[] = [
  { id: 'blue', ja: 'ブルー',   en: 'Blue', swatch: '#0275fd' },
  { id: 'gold', ja: 'ゴールド', en: 'Gold', swatch: '#c9a961' },
];

interface Props {
  /** 'menu' はヘッダーのオーバーフローメニュー内に置く行レイアウト */
  variant?: 'inline' | 'menu';
}

export default function SiteThemeSwitcher({ variant = 'inline' }: Props) {
  const { theme, setTheme } = useSiteTheme();
  const { locale } = useLocale();
  const label = locale === 'ja' ? 'サイトテーマ' : 'Site theme';

  if (variant === 'menu') {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2.5"
        role="radiogroup"
        aria-label={label}
      >
        <Palette size={14} className="shrink-0 text-[#707070]" />
        <div className="flex items-center gap-1">
          {OPTIONS.map((opt) => {
            const active = theme === opt.id;
            return (
              <button
                key={opt.id}
                role="radio"
                aria-checked={active}
                onClick={() => setTheme(opt.id)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-colors border"
                style={{
                  background:  active ? '#eef9ff' : 'transparent',
                  color:       active ? '#0275fd' : '#707070',
                  borderColor: active ? '#0275fd44' : '#e5e7eb',
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-[#e5e7eb]"
                  style={{ background: opt.swatch }}
                />
                {locale === 'ja' ? opt.ja : opt.en}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1 p-1 rounded-lg border"
      style={{ borderColor: 'var(--home-border)', background: 'var(--home-surface)' }}
      role="radiogroup"
      aria-label={label}
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
