'use client';

import type { ScoreResult } from '@/types/echo';
import { RANK_COLORS, RANK_GLOW } from '@/lib/scorer';

interface Props {
  result: ScoreResult;
}

export default function ScoreBadge({ result }: Props) {
  const color = RANK_COLORS[result.rank];
  const glow  = RANK_GLOW[result.rank];

  const showBreakdown =
    result.isCharacterScore &&
    (result.mainstatBonus !== undefined || result.setBonus !== undefined);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="text-6xl font-black tracking-tight animate-popIn"
        style={{ color, textShadow: glow }}
      >
        {result.rank}
      </div>
      <div className="text-slate-300 text-sm">
        スコア <span className="font-bold tabular-nums" style={{ color }}>{result.score}</span> / 100
      </div>
      <div className="w-40 h-2 bg-slate-700 rounded-full overflow-hidden mt-1">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${result.score}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: glow,
          }}
        />
      </div>

      {/* キャラ別補正内訳 */}
      {showBreakdown && (
        <div className="flex gap-3 mt-1">
          {result.mainstatBonus !== undefined && result.mainstatBonus !== 0 && (
            <span className="text-[11px] text-red-400 tabular-nums">
              メイン {result.mainstatBonus}
            </span>
          )}
          {result.setBonus !== undefined && result.setBonus !== 0 && (
            <span className="text-[11px] text-orange-400 tabular-nums">
              セット {result.setBonus}
            </span>
          )}
          {result.mainstatBonus === 0 && result.setBonus === 0 && (
            <span className="text-[11px] text-emerald-500">補正なし ✓</span>
          )}
        </div>
      )}
    </div>
  );
}
