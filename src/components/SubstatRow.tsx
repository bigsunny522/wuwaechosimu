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
  if (tier >= 7) return '#e6b800';
  if (tier >= 5) return '#f97316';
  if (tier >= 3) return '#a855f7';
  return '#9ca3af';
}

function tierBg(tier: number): string {
  if (tier >= 7) return 'rgba(230,184,0,0.06)';
  if (tier >= 5) return 'rgba(249,115,22,0.05)';
  if (tier >= 3) return 'rgba(168,85,247,0.04)';
  return 'transparent';
}

function resolveColor(tier: number, category: SubstatCategory | undefined): string {
  if (!category) return tierColor(tier);
  if (category === 'unnecessary') return '#d1d5db';
  return CATEGORY_COLORS[category];
}

function resolveBg(tier: number, category: SubstatCategory | undefined): string {
  if (!category) return tierBg(tier);
  if (category === 'unnecessary') return 'transparent';
  return tierBg(tier);
}

export default function SubstatRow({ substat, index, animated = true, category }: Props) {
  const { locale } = useLocale();
  const label    = locale === 'en' ? (SUBSTAT_LABEL_EN[substat.key] ?? substat.label) : substat.label;
  const pct      = Math.round((substat.value / substat.maxValue) * 100);
  const color    = resolveColor(substat.tier, category);
  const catColor = category ? CATEGORY_COLORS[category] : undefined;

  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${animated ? 'animate-fadeSlideIn' : ''}`}
      style={{
        background: resolveBg(substat.tier, category),
        animationDelay: `${index * 80}ms`,
        borderLeft: catColor && category !== 'unnecessary'
          ? `3px solid ${catColor}` : '3px solid transparent',
      }}
    >
      {/* Index */}
      <span className="text-[10px] text-[#9ca3af] w-3 shrink-0 select-none text-center">
        {index + 1}
      </span>

      {/* Label */}
      <span className="text-xs font-medium text-[#222222] w-28 shrink-0 truncate leading-none">
        {label}
      </span>

      {/* Bar */}
      <div className="flex-1 h-1 bg-[#e5e7eb] rounded-full overflow-hidden min-w-0">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>

      {/* Value */}
      <span
        className="text-xs font-semibold tabular-nums w-12 text-right shrink-0 leading-none"
        style={{ color }}
      >
        {substat.value}{substat.unit}
      </span>
    </div>
  );
}
