'use client';

import type { ScoreResult } from '@/types/echo';
import { RANK_COLORS } from '@/lib/scorer';
import { useLocale } from '@/lib/locale';
import { TRANSLATIONS, interpolate } from '@/data/translations';

interface Props {
  result: ScoreResult;
}

// 上位%を桁数に応じて読みやすく整形する（0.01 → "0.01"、6.4 → "6.4"、63 → "63"）
function formatPercentile(pct: number): string {
  if (pct < 1) return pct.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  if (pct < 10) return pct.toFixed(1).replace(/\.0$/, '');
  return Math.round(pct).toString();
}

export default function ScoreBadge({ result }: Props) {
  const { locale } = useLocale();
  const T     = TRANSLATIONS[locale];
  const color = RANK_COLORS[result.rank];

  const showBreakdown =
    result.isCharacterScore &&
    (result.mainstatBonus !== undefined || result.setBonus !== undefined);

  return (
    <div className="flex items-center gap-4">
      {/* Rank letter */}
      <div
        className={`${result.rank === 'GOD' ? 'text-3xl' : 'text-5xl'} font-semibold tracking-tight animate-popIn shrink-0 w-14 text-center`}
        style={{ color, fontFamily: 'Inter, sans-serif' }}
      >
        {result.rank}
      </div>

      {/* Score + bar + bonuses */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-sm text-[#707070]">
            {interpolate(T.scoreOf, [result.score]).split(String(result.score)).map((part, i, arr) =>
              i < arr.length - 1
                ? [part, <span key={i} className="font-bold tabular-nums" style={{ color }}>{result.score}</span>]
                : part
            )}
          </div>
          {result.topPercentile !== undefined && (
            <span
              className="text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-full"
              style={{ color, background: `${color}1a`, border: `1px solid ${color}40` }}
            >
              {interpolate(T.topPercentile, [formatPercentile(result.topPercentile)])}
            </span>
          )}
        </div>
        <div className="w-full h-1.5 bg-[#e5e7eb] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${result.score}%`, background: color }}
          />
        </div>

        {showBreakdown && (
          <div className="flex gap-3">
            {result.mainstatBonus !== undefined && result.mainstatBonus !== 0 && (
              <span className="text-[11px] text-[#ef4444] tabular-nums">
                {interpolate(T.mainBonus, [result.mainstatBonus > 0 ? `+${result.mainstatBonus}` : result.mainstatBonus])}
              </span>
            )}
            {result.setBonus !== undefined && result.setBonus !== 0 && (
              <span className="text-[11px] text-[#f97316] tabular-nums">
                {interpolate(T.setBonus, [result.setBonus > 0 ? `+${result.setBonus}` : result.setBonus])}
              </span>
            )}
            {result.mainstatBonus === 0 && result.setBonus === 0 && (
              <span className="text-[11px] text-[#10b981]">{T.noBonus}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
