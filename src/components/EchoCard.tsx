'use client';

import type { EchoState, ScoreResult } from '@/types/echo';
import { SUBSTAT_COUNT } from '@/data/mainstats';
import SubstatRow from './SubstatRow';
import ScoreBadge from './ScoreBadge';
import { RANK_COLORS } from '@/lib/scorer';

interface Props {
  echo: EchoState;
  score: ScoreResult | null;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

const COST_LABEL: Record<number, string> = { 4: 'COST 4', 3: 'COST 3', 1: 'COST 1' };
const COST_COLOR: Record<number, string> = {
  4: 'text-amber-400',
  3: 'text-violet-400',
  1: 'text-teal-400',
};

export default function EchoCard({ echo, score, cardRef }: Props) {
  // ランク色はMAXレベル到達後のみ適用（中間段階ではニュートラル色）
  const isMax = echo.level === 25;
  const rankColor = (score && isMax) ? RANK_COLORS[score.rank] : '#94A3B8';
  const maxSubs = SUBSTAT_COUNT[echo.cost];
  const emptyCount = Math.max(0, maxSubs - echo.substats.length);

  return (
    <div
      ref={cardRef}
      className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-slate-700/80"
      style={{
        background: 'linear-gradient(145deg, #0f1117 0%, #161b27 60%, #0c1020 100%)',
        boxShadow: score
          ? `0 0 40px ${rankColor}22, 0 8px 32px rgba(0,0,0,0.6)`
          : '0 8px 32px rgba(0,0,0,0.6)',
      }}
    >
      {/* Header */}
      <div
        className="px-5 pt-5 pb-4"
        style={{
          borderBottom: '1px solid rgba(148,163,184,0.1)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-xs font-bold tracking-widest ${COST_COLOR[echo.cost]}`}>
                {COST_LABEL[echo.cost]}
              </span>
              <span className="text-xs text-slate-500">音骸</span>
            </div>
            {/* Echo name */}
            <div className="text-base font-bold text-slate-100 leading-snug mb-1">
              {echo.echoName}
            </div>
            {/* Main stat */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm text-slate-400">{echo.mainstat.label}</span>
              <span className="text-sm font-bold text-amber-300">
                {echo.mainstat.value}{echo.mainstat.unit}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-slate-500 mb-0.5">強化レベル</div>
            <div className="text-2xl font-black text-white">+{echo.level}</div>
          </div>
        </div>

        {/* Level bar */}
        <div className="mt-3 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(echo.level / 25) * 100}%`,
              background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
            }}
          />
        </div>
        <div className="flex justify-between mt-0.5">
          <span className="text-[10px] text-slate-600">+0</span>
          <span className="text-[10px] text-slate-600">+25</span>
        </div>
      </div>

      {/* Harmony Set */}
      {echo.activeHarmonySet && (
        <div
          className="px-5 py-2.5 flex items-center gap-2"
          style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}
        >
          <span className="text-[10px] text-slate-600 uppercase tracking-widest shrink-0">ハーモニー</span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(167,139,250,0.12)',
              border: '1px solid rgba(167,139,250,0.3)',
              color: '#c4b5fd',
            }}
          >
            {echo.activeHarmonySet}
          </span>
        </div>
      )}

      {/* Score section - MAX到達後のみ表示 */}
      {score && isMax && (
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
          <ScoreBadge result={score} />
        </div>
      )}

      {/* Substats */}
      <div className="px-3 py-3 flex flex-col gap-0.5">
        {echo.substats.length === 0 ? (
          <div className="text-center text-slate-600 text-sm py-4">
            「+5強化」でサブステータスが解放されます
          </div>
        ) : (
          echo.substats.map((sub, i) => {
            const cat = score?.breakdown.find((b) => b.key === sub.key)?.category;
            return <SubstatRow key={sub.key} substat={sub} index={i} category={cat} />;
          })
        )}
        {Array.from({ length: emptyCount }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-700/40"
          >
            <span className="text-xs text-slate-700 w-4">{echo.substats.length + i + 1}</span>
            <span className="flex-1 text-sm text-slate-700 italic">未解放</span>
          </div>
        ))}
      </div>

      {/* Decorative corner accent */}
      <div
        className="absolute top-0 right-0 w-16 h-16 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top right, ${rankColor}, transparent 70%)`,
        }}
      />
    </div>
  );
}
