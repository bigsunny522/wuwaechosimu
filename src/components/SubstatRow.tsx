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
  compact?: boolean;
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

export default function SubstatRow({ substat, index, animated = true, category, compact = false }: Props) {
  const { locale } = useLocale();
  const label    = locale === 'en' ? (SUBSTAT_LABEL_EN[substat.key] ?? substat.label) : substat.label;
  const pct      = Math.round((substat.value / substat.maxValue) * 100);
  const color    = resolveColor(substat.tier, category);
  const catColor = category ? CATEGORY_COLORS[category] : undefined;

  const borderLeft = catColor && category !== 'unnecessary'
    ? `3px solid ${catColor}` : '3px solid transparent';

  /* ── Compact (single-line) ── */
  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${animated ? 'animate-fadeSlideIn' : ''}`}
        style={{
          background: resolveBg(substat.tier, category),
          animationDelay: `${index * 80}ms`,
          borderLeft,
        }}
      >
        <span className="text-[10px] text-[#9ca3af] w-3 shrink-0 select-none text-center">
          {index + 1}
        </span>
        <span className="text-xs font-medium text-[#222222] w-28 shrink-0 truncate leading-none">
          {label}
        </span>
        <div className="flex-1 h-1 bg-[#e5e7eb] rounded-full overflow-hidden min-w-0">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <span
          className="text-xs font-semibold tabular-nums w-12 text-right shrink-0 leading-none"
          style={{ color }}
        >
          {substat.value}{substat.unit}
        </span>
      </div>
    );
  }

  /* ── Default (two-line) ── */
  return (
    <div
      className={`flex gap-2 px-3 py-2 rounded-lg transition-all ${animated ? 'animate-fadeSlideIn' : ''}`}
      style={{
        background: resolveBg(substat.tier, category),
        animationDelay: `${index * 80}ms`,
        borderLeft,
      }}
    >
      {/* Index */}
      <div className="flex items-center w-4 shrink-0">
        <span className="text-xs text-[#9ca3af] select-none">{index + 1}</span>
      </div>

      {/* Label + bar + value */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[#222222] leading-snug mb-1">{label}</div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-[#e5e7eb] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: color }}
            />
          </div>
          <span
            className="text-sm font-semibold tabular-nums shrink-0 min-w-[3.5rem] text-right"
            style={{ color }}
          >
            {substat.value}{substat.unit}
          </span>
        </div>
      </div>
    </div>
  );
}
