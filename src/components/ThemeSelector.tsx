'use client';

import type { Theme } from '@/types/echo';

interface Props {
  current: Theme;
  unlocked: boolean;
  onSelect: (t: Theme) => void;
  onUnlock: () => void;
}

const THEMES: { id: Theme; label: string; accent: string; preview: string }[] = [
  { id: 'default', label: 'デフォルト', accent: '#7c3aed', preview: 'bg-violet-600' },
  { id: 'azure',   label: 'アズール',  accent: '#0ea5e9', preview: 'bg-sky-500' },
  { id: 'crimson', label: 'クリムゾン', accent: '#ef4444', preview: 'bg-red-500' },
  { id: 'emerald', label: 'エメラルド', accent: '#10b981', preview: 'bg-emerald-500' },
  { id: 'void',    label: 'ヴォイド',  accent: '#6b7280', preview: 'bg-gray-500' },
];

export default function ThemeSelector({ current, unlocked, onSelect, onUnlock }: Props) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {THEMES.map((t) => {
        const isPremium = t.id !== 'default';
        const locked = isPremium && !unlocked;
        return (
          <button
            key={t.id}
            onClick={() => {
              if (locked) onUnlock();
              else onSelect(t.id);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              current === t.id
                ? 'border-white/40 text-white'
                : 'border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
            style={current === t.id ? { background: `${t.accent}22` } : {}}
          >
            <span className={`w-3 h-3 rounded-full ${t.preview}`} />
            {t.label}
            {locked && <span className="text-[10px] text-amber-500">🔒</span>}
          </button>
        );
      })}
    </div>
  );
}

export const THEME_ACCENT: Record<Theme, string> = {
  default: '#7c3aed',
  azure: '#0ea5e9',
  crimson: '#ef4444',
  emerald: '#10b981',
  void: '#6b7280',
};
