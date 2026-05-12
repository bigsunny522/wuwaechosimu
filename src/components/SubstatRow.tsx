'use client';

import type { Substat, SubstatCategory } from '@/types/echo';
import { CATEGORY_COLORS } from '@/lib/scorer';
import { useLocale } from '@/lib/locale';
import { SUBSTAT_LABEL_EN } from '@/data/translations';

interface Props {
  substat: Substat;
  index: number;
  animated?: boolean;
  category?: SubstatCategory;
}

function tierColor(tier: number): string {
  if (tier >= 7) return '#FFD700';
  if (tier >= 5) return '#E8C44A';
  if (tier >= 3) return '#A78BFA';
  return '#94A3B8';
}

function tierBg(tier: number): string {
  if (tier >= 7) return 'rgba(255,215,0,0.08)';
  if (tier >= 5) return 'rgba(232,196,74,0.06)';
  if (tier >= 3) return 'rgba(167,139,250,0.05)';
  return 'transparent';
}

function resolveColor(tier: number, category: SubstatCategory | undefined): string {
  if (!category) return tierColor(tier);
  if (category === 'unnecessary') return '#475569';
  return CATEGORY_COLORS[category];
}

function resolveBg(tier: number, category: SubstatCategory | undefined): string {
  if (!category) return tierBg(tier);
  if (category === 'unnecessary') return 'transparent';
  return tierBg(tier);
}

function resolveGoldBorder(tier: number, category: SubstatCategory | undefined): boolean {
  if (category === 'unnecessary') return false;
  return tier >= 7;
}

export default function SubstatRow({ substat, index, animated = true, category }: Props) {
  const { locale } = useLocale();
  const label = locale === 'en' ? (SUBSTAT_LABEL_EN[substat.key] ?? substat.label) : substat.label;
  const pct = Math.round((substat.value / substat.maxValue) * 100);
  const color  = resolveColor(substat.tier, category);
  const catColor = category ? CATEGORY_COLORS[category] : undefined;

  return (
    <div
      className={`flex gap-2 px-3 py-2 rounded-lg transition-all ${animated ? 'animate-fadeSlideIn' : ''}`}
      style={{
        background: resolveBg(substat.tier, category),
        animationDelay: `${index * 80}ms`,
        border: resolveGoldBorder(substat.tier, category) ? '1px solid rgba(255,215,0,0.25)' : '1px solid transparent',
      }}
    >
      {/* Index number + category dot */}
      <div className="flex flex-col items-center gap-0.5 w-4 pt-0.5 shrink-0">
        <span className="text-xs text-slate-500 select-none">{index + 1}</span>
        {catColor && (
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: catColor }} />
        )}
      </div>

      {/* Label + bar + value */}
      <div className="flex-1 min-w-0">
        <div className="text-sm text-slate-200 leading-snug mb-1">{label}</div>

        {/* Bar + value row */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-700/80 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: color }}
            />
          </div>
          <span
            className="text-sm font-bold tabular-nums shrink-0 min-w-[3.5rem] text-right"
            style={{ color }}
          >
            {substat.value}{substat.unit}
          </span>
        </div>
      </div>
    </div>
  );
}
