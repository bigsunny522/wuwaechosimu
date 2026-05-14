'use client';

import type { EchoState, ScoreResult } from '@/types/echo';
import { SUBSTAT_COUNT } from '@/data/mainstats';
import { HARMONY_SETS_EN } from '@/data/echoes';
import SubstatRow from './SubstatRow';
import ScoreBadge from './ScoreBadge';
import { RANK_COLORS } from '@/lib/scorer';
import { useLocale } from '@/lib/locale';
import { TRANSLATIONS, MAINSTAT_LABEL_EN } from '@/data/translations';

interface Props {
  echo: EchoState;
  score: ScoreResult | null;
  cardRef?: React.RefObject<HTMLDivElement | null>;
  maxedAt?: number | null;
}

function formatMaxedDate(ts: number): string {
  const d   = new Date(ts);
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  const hh   = String(d.getHours()).padStart(2, '0');
  const min  = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
}

const COST_COLOR: Record<number, string> = {
  4: '#e6b800',
  3: '#a855f7',
  1: '#0d9488',
};

export default function EchoCard({ echo, score, cardRef, maxedAt }: Props) {
  const { locale } = useLocale();
  const T = TRANSLATIONS[locale];

  const isMax      = echo.level === 25;
  const rankColor  = (score && isMax) ? RANK_COLORS[score.rank] : '#e5e7eb';
  const maxSubs    = SUBSTAT_COUNT[echo.cost];
  const emptyCount = Math.max(0, maxSubs - echo.substats.length);

  const echoDisplayName = locale === 'en' ? (echo.echoNameEn ?? echo.echoName) : echo.echoName;
  const mainstatLabel   = locale === 'en'
    ? (MAINSTAT_LABEL_EN[echo.mainstat.key] ?? echo.mainstat.label)
    : echo.mainstat.label;
  const harmonyDisplay  = echo.activeHarmonySet
    ? (locale === 'en' ? (HARMONY_SETS_EN[echo.activeHarmonySet] ?? echo.activeHarmonySet) : echo.activeHarmonySet)
    : '';

  return (
    <div
      ref={cardRef}
      className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-white"
      style={{
        border: `1px solid ${score && isMax ? `${rankColor}88` : '#e5e7eb'}`,
        boxShadow: score && isMax
          ? `0 4px 24px ${rankColor}1a, 0 2px 8px rgba(0,0,0,0.06)`
          : '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* Rank stripe — top */}
      {score && isMax && (
        <div className="h-0.5 w-full" style={{ background: rankColor }} />
      )}

      {/* Header */}
      <div className="px-4 pt-3 pb-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-[10px] font-semibold tracking-widest uppercase"
                style={{ color: COST_COLOR[echo.cost], fontFamily: '"IBM Plex Mono", monospace' }}
              >
                COST {echo.cost}
              </span>
              <span className="text-[10px] text-[#9ca3af]">{T.echoType}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-sm font-semibold text-[#222222] leading-snug">
                {echoDisplayName}
              </span>
              {harmonyDisplay && (
                <span
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: '#eef9ff', color: '#0275fd' }}
                >
                  {harmonyDisplay}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-[#707070]">{mainstatLabel}</span>
              <span className="text-xs font-semibold" style={{ color: COST_COLOR[echo.cost] }}>
                {echo.mainstat.value}{echo.mainstat.unit}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div
              className="text-[10px] uppercase tracking-wider mb-0.5 text-[#9ca3af]"
              style={{ fontFamily: '"IBM Plex Mono", monospace' }}
            >
              {T.levelLabel}
            </div>
            <div className="text-xl font-semibold text-[#222222]">+{echo.level}</div>
          </div>
        </div>

        {/* Level bar */}
        <div className="mt-2 w-full h-1 bg-[#e5e7eb] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(echo.level / 25) * 100}%`,
              background: '#0275fd',
            }}
          />
        </div>
      </div>

      {/* Score section */}
      {score && isMax && (
        <div className="px-4 py-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <ScoreBadge result={score} />
          {maxedAt && (
            <div
              className="mt-1.5 text-center text-[10px] text-[#9ca3af] tracking-wide"
              style={{ fontFamily: '"IBM Plex Mono", monospace' }}
            >
              {T.maxedAt}: {formatMaxedDate(maxedAt)}
            </div>
          )}
        </div>
      )}

      {/* Substats */}
      <div className="px-3 py-3 flex flex-col gap-0.5">
        {echo.substats.length === 0 ? (
          <div className="text-center text-[#9ca3af] text-sm py-4">
            {T.levelHint}
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
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[#e5e7eb]"
          >
            <span className="text-xs text-[#d1d5db] w-4">{echo.substats.length + i + 1}</span>
            <span className="flex-1 text-sm text-[#d1d5db] italic">{T.unlockedSlot}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
