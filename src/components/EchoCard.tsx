'use client';

import type { EchoState, ScoreResult } from '@/types/echo';
import { SUBSTAT_COUNT } from '@/data/mainstats';
import { HARMONY_SETS_EN, getHarmonyBadgeColor } from '@/data/echoes';
import SubstatRow from './SubstatRow';
import ScoreBadge from './ScoreBadge';
import ScoreDistributionChart from './ScoreDistributionChart';
import { RANK_COLORS } from '@/lib/scorer';
import { useLocale } from '@/lib/locale';
import { TRANSLATIONS, MAINSTAT_LABEL_EN } from '@/data/translations';

interface Props {
  echo: EchoState;
  score: ScoreResult | null;
  cardRef?: React.RefObject<HTMLDivElement | null>;
  maxedAt?: number | null;
  /** コンパクトモード: モーダル内表示用。単行サブスタ、レベルバー・日時なし */
  compact?: boolean;
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

export default function EchoCard({ echo, score, cardRef, maxedAt, compact = false }: Props) {
  const { locale } = useLocale();
  const T = TRANSLATIONS[locale];

  const isMax      = echo.level === 25;
  const rankColor  = (score && isMax) ? RANK_COLORS[score.rank] : 'var(--hd-line)';
  const maxSubs    = SUBSTAT_COUNT[echo.cost];
  const emptyCount = Math.max(0, maxSubs - echo.substats.length);

  const echoDisplayName = locale === 'en' ? (echo.echoNameEn ?? echo.echoName) : echo.echoName;
  const mainstatLabel   = locale === 'en'
    ? (MAINSTAT_LABEL_EN[echo.mainstat.key] ?? echo.mainstat.label)
    : echo.mainstat.label;
  const harmonyDisplay  = echo.activeHarmonySet
    ? (locale === 'en' ? (HARMONY_SETS_EN[echo.activeHarmonySet] ?? echo.activeHarmonySet) : echo.activeHarmonySet)
    : '';

  /* ── padding tokens by mode ── */
  const hPad   = compact ? 'px-4'   : 'px-4';
  const hPy    = compact ? 'pt-2.5 pb-2' : 'pt-3 pb-3';
  const sPy    = compact ? 'py-2'   : 'py-3';
  const subPad = compact ? 'px-2 py-1.5' : 'px-3 py-3';

  return (
    <div
      ref={cardRef}
      className="relative w-full max-w-sm rounded-2xl overflow-hidden"
      style={{
        background: 'var(--hd-plate)',
        border: `1px solid ${score && isMax ? `${rankColor}88` : 'var(--hd-line)'}`,
      }}
    >
      {/* Rank stripe */}
      {score && isMax && (
        <div className="h-0.5 w-full" style={{ background: rankColor }} />
      )}

      {/* Header */}
      <div className={`${hPad} ${hPy}`} style={{ borderBottom: '1px solid var(--hd-line)' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="hd-num text-[10px] font-semibold tracking-widest uppercase"
                style={{ color: 'var(--hd-sub)' }}
              >
                COST {echo.cost}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--hd-sub)' }}>{T.echoType}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-sm font-semibold leading-snug" style={{ color: 'var(--hd-fg)' }}>
                {echoDisplayName}
              </span>
              {harmonyDisplay && echo.activeHarmonySet && (() => {
                const { bg, text } = getHarmonyBadgeColor(echo.activeHarmonySet);
                return (
                  <span
                    className="text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: bg, color: text }}
                  >
                    {harmonyDisplay}
                  </span>
                );
              })()}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs" style={{ color: 'var(--hd-sub)' }}>{mainstatLabel}</span>
              <span className="text-xs font-semibold" style={{ color: 'var(--hd-fg)' }}>
                {echo.mainstat.value}{echo.mainstat.unit}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div
              className="hd-num text-[10px] uppercase tracking-wider mb-0.5"
              style={{ color: 'var(--hd-sub)' }}
            >
              {T.levelLabel}
            </div>
            <div className="text-xl font-semibold" style={{ color: 'var(--hd-fg)' }}>+{echo.level}</div>
          </div>
        </div>

        {/* Level bar — hidden in compact mode */}
        {!compact && (
          <div className="mt-2 w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--hd-line)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(echo.level / 25) * 100}%`, background: 'var(--hd-accent)' }}
            />
          </div>
        )}
      </div>

      {/* Score section */}
      {score && isMax && (
        <div className={`${hPad} ${sPy}`} style={{ borderBottom: '1px solid var(--hd-line)' }}>
          <ScoreBadge result={score} />
          {/* maxedAt date — hidden in compact mode */}
          {!compact && maxedAt && (
            <div
              className="hd-num mt-1.5 text-center text-[10px] text-[var(--hd-sub)] tracking-wide"
            >
              {T.maxedAt}: {formatMaxedDate(maxedAt)}
            </div>
          )}
        </div>
      )}

      {/* Substats */}
      <div className={`${subPad} flex flex-col gap-0.5`}>
        {echo.substats.length === 0 ? (
          <div className={`text-center text-[var(--hd-sub)] ${compact ? 'text-xs py-3' : 'text-sm py-4'}`}>
            {T.levelHint}
          </div>
        ) : (
          echo.substats.map((sub, i) => {
            const cat = score?.breakdown.find((b) => b.key === sub.key)?.category;
            return <SubstatRow key={sub.key} substat={sub} index={i} category={cat} compact={compact} />;
          })
        )}
        {Array.from({ length: emptyCount }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className={`flex items-center gap-2 rounded-lg border border-dashed border-[var(--hd-line)] ${compact ? 'px-2 py-1.5' : 'px-3 py-2'}`}
          >
            <span className={`text-[var(--hd-sub)] ${compact ? 'text-[10px] w-3 text-center' : 'text-xs w-4'}`}>
              {echo.substats.length + i + 1}
            </span>
            <span className={`flex-1 text-[var(--hd-sub)] italic ${compact ? 'text-xs' : 'text-sm'}`}>
              {T.unlockedSlot}
            </span>
          </div>
        ))}
      </div>

      {/* Score distribution chart — below the 5 substat rows (shown in compact mode too) */}
      {score && isMax && score.distributionCurve && (
        <div className={subPad}>
          <ScoreDistributionChart result={score} compact={compact} />
        </div>
      )}
    </div>
  );
}
