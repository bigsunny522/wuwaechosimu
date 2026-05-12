'use client';

import type { EchoState, ScoreResult } from '@/types/echo';
import { RANK_COLORS } from '@/lib/scorer';
import { useLocale } from '@/lib/locale';
import { TRANSLATIONS, SUBSTAT_LABEL_EN } from '@/data/translations';

interface Props {
  echo: EchoState;
  score: ScoreResult;
  cardRef?: React.RefObject<HTMLDivElement | null>;
  maxedAt?: number;
}

function formatMaxedDate(ts: number): string {
  const d    = new Date(ts);
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  const hh   = String(d.getHours()).padStart(2, '0');
  const min  = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
}

export default function ResultCardVisual({ echo, score, cardRef, maxedAt }: Props) {
  const { locale } = useLocale();
  const T          = TRANSLATIONS[locale];
  const color      = RANK_COLORS[score.rank];
  const isCursed   = score.score < 20;

  return (
    <div
      ref={cardRef}
      className="w-72 rounded-2xl overflow-hidden bg-white"
      style={{
        border: `1px solid ${color}44`,
        boxShadow: `0 4px 24px ${color}1a, 0 2px 8px rgba(0,0,0,0.06)`,
        fontFamily: 'Inter, "Noto Sans JP", sans-serif',
      }}
    >
      {/* Rank stripe */}
      <div className="h-0.5 w-full" style={{ background: color }} />

      <div className="p-5">
        <div className="text-center mb-4">
          <div
            className="text-[10px] text-[#9ca3af] tracking-widest uppercase mb-1"
            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
          >
            {T.resultCardGame}
          </div>
          <div
            className="text-5xl font-semibold animate-popIn"
            style={{ color, fontFamily: 'Inter, sans-serif' }}
          >
            {score.rank}
          </div>
          <div className="text-sm text-[#707070] mt-0.5">{score.score} / 100</div>
          {/* Score bar */}
          <div className="w-32 h-1 bg-[#e5e7eb] rounded-full overflow-hidden mx-auto mt-2">
            <div
              className="h-full rounded-full"
              style={{ width: `${score.score}%`, background: color }}
            />
          </div>
        </div>

        <div className="border-t border-[#f3f4f6] pt-3 space-y-2">
          {echo.substats.map((s) => {
            const label = locale === 'en' ? (SUBSTAT_LABEL_EN[s.key] ?? s.label) : s.label;
            return (
              <div key={s.key} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-[#707070] leading-snug">{label}</span>
                <span className="font-semibold shrink-0 tabular-nums text-[#222222]">
                  {s.value}{s.unit}
                </span>
              </div>
            );
          })}
        </div>

        {isCursed && (
          <div className="mt-3 text-center text-[#ef4444] text-xs font-semibold">
            ⚠️ {locale === 'en' ? 'Cursed Echo' : '呪いの音骸'} ⚠️
          </div>
        )}

        {maxedAt && (
          <div
            className="mt-3 text-center text-[10px] text-[#9ca3af] tracking-wide"
            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
          >
            {T.resultMaxedAt}: {formatMaxedDate(maxedAt)}
          </div>
        )}
      </div>
    </div>
  );
}
