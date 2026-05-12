'use client';

import type { ScoreResult } from '@/types/echo';
import { RANK_COLORS } from '@/lib/scorer';
import { useLocale } from '@/lib/locale';
import { TRANSLATIONS, interpolate } from '@/data/translations';

interface Props {
  result: ScoreResult;
}

export default function ScoreBadge({ result }: Props) {
  const { locale } = useLocale();
  const T     = TRANSLATIONS[locale];
  const color = RANK_COLORS[result.rank];

  const showBreakdown =
    result.isCharacterScore &&
    (result.mainstatBonus !== undefined || result.setBonus !== undefined);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="text-6xl font-semibold tracking-tight animate-popIn"
        style={{ color, fontFamily: 'Inter, sans-serif' }}
      >
        {result.rank}
      </div>
      <div className="text-sm text-[#707070]">
        {interpolate(T.scoreOf, [result.score]).split(String(result.score)).map((part, i, arr) =>
          i < arr.length - 1
            ? [part, <span key={i} className="font-bold tabular-nums" style={{ color }}>{result.score}</span>]
            : part
        )}
      </div>
      <div className="w-40 h-1.5 bg-[#e5e7eb] rounded-full overflow-hidden mt-0.5">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${result.score}%`, background: color }}
        />
      </div>

      {showBreakdown && (
        <div className="flex gap-3 mt-1">
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
  );
}
