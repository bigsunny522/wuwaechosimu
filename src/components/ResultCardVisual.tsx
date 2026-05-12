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
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
}

export default function ResultCardVisual({ echo, score, cardRef, maxedAt }: Props) {
  const { locale } = useLocale();
  const T = TRANSLATIONS[locale];
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
        <div className="text-xs text-slate-500 tracking-widest uppercase mb-1">{T.resultCardGame}</div>
        <div className="text-5xl font-black" style={{ color }}>{score.rank}</div>
        <div className="text-slate-400 text-sm">{score.score} / 100</div>
      </div>
      <div className="border-t border-slate-700/50 pt-3 space-y-1.5">
        {echo.substats.map((s) => {
          const label = locale === 'en' ? (SUBSTAT_LABEL_EN[s.key] ?? s.label) : s.label;
          return (
            <div key={s.key} className="flex items-start justify-between gap-2 text-sm">
              <span className="text-slate-400 leading-snug">{label}</span>
              <span className="text-white font-semibold shrink-0 tabular-nums">{s.value}{s.unit}</span>
            </div>
          );
        })}
      </div>
      {isCursed && (
        <div className="mt-3 text-center text-red-400 text-xs font-bold">
          ⚠️ {locale === 'en' ? 'Cursed Echo' : '呪いの音骸'} ⚠️
        </div>
      )}
      {maxedAt && (
        <div className="mt-3 text-center text-slate-600 text-[10px] font-mono tracking-wide">
          {T.resultMaxedAt}: {formatMaxedDate(maxedAt)}
        </div>
      )}
    </div>
  );
}
