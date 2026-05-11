'use client';

import type { EchoState, ScoreResult } from '@/types/echo';
import { RANK_COLORS } from '@/lib/scorer';

interface Props {
  echo: EchoState;
  score: ScoreResult;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ResultCardVisual({ echo, score, cardRef }: Props) {
  const color = RANK_COLORS[score.rank];
  const isCursed = score.score < 20;

  return (
    <div
      ref={cardRef}
      className="w-72 rounded-2xl p-5 border"
      style={{
        background: 'linear-gradient(145deg, #0f1117, #161b27)',
        borderColor: `${color}44`,
        boxShadow: `0 0 32px ${color}33`,
        fontFamily: 'sans-serif',
      }}
    >
      <div className="text-center mb-4">
        <div className="text-xs text-slate-500 tracking-widest uppercase mb-1">鳴潮 音骸シミュレーター</div>
        <div className="text-5xl font-black" style={{ color }}>{score.rank}</div>
        <div className="text-slate-400 text-sm">スコア {score.score} / 100</div>
      </div>
      <div className="border-t border-slate-700/50 pt-3 space-y-1.5">
        {echo.substats.map((s) => (
          <div key={s.key} className="flex items-start justify-between gap-2 text-sm">
            <span className="text-slate-400 leading-snug">{s.label}</span>
            <span className="text-white font-semibold shrink-0 tabular-nums">{s.value}{s.unit}</span>
          </div>
        ))}
      </div>
      {isCursed && (
        <div className="mt-3 text-center text-red-400 text-xs font-bold">
          ⚠️ 呪いの音骸 ⚠️
        </div>
      )}
    </div>
  );
}
