'use client';

import type { AdvisorResult } from '@/lib/monteCarlo';
import { useLocale } from '@/lib/locale';

interface Props {
  result: AdvisorResult;
  /** スマホ固定バー用コンパクト表示 */
  compact?: boolean;
}

const RECOMMENDATION_STYLE = {
  great:      { label: { ja: '強く継続推奨', en: 'Strong Continue' }, color: '#10b981', bg: '#f0fdf4', border: '#10b98133' },
  good:       { label: { ja: '継続推奨',     en: 'Continue'        }, color: '#0275fd', bg: '#eef9ff', border: '#0275fd33' },
  borderline: { label: { ja: '様子見',       en: 'Borderline'      }, color: '#f59e0b', bg: '#fffbeb', border: '#f59e0b33' },
  scrap:      { label: { ja: '破棄推奨',     en: 'Consider Scrap'  }, color: '#ef4444', bg: '#fef2f2', border: '#ef444433' },
} as const;

const PROB_ROWS = [
  { jaLabel: 'A以上',  enLabel: 'A+',   probKey: 'probAPlus',     baseKey: 'baselineProbAPlus',     color: '#a78bfa' },
  { jaLabel: 'S以上',  enLabel: 'S+',   probKey: 'probSPlus',     baseKey: 'baselineProbSPlus',     color: '#e8c44a' },
  { jaLabel: 'S+以上', enLabel: 'S+★',  probKey: 'probSStarPlus', baseKey: 'baselineProbSStarPlus', color: '#f97316' },
] as const;

function ProbCard({
  label,
  prob,
  baselineProb,
  color,
}: {
  label: string;
  prob: number;
  baselineProb: number;
  color: string;
}) {
  const pct  = Math.round(prob * 100);
  const base = Math.round(baselineProb * 100);
  const diff = pct - base;

  return (
    <div
      className="flex-1 flex flex-col items-center gap-1.5 rounded-xl py-3 px-2"
      style={{ background: '#f7f7f7', border: '1px solid #e5e7eb' }}
    >
      <span className="text-[10px] font-medium text-[#9ca3af] tracking-wide uppercase">
        {label}
      </span>
      <span
        className="text-2xl font-bold leading-none"
        style={{ color, fontFamily: '"IBM Plex Mono", monospace' }}
      >
        {pct}%
      </span>
      <span className="text-[10px] text-[#9ca3af]">
        {diff > 0 ? `+${diff}` : diff === 0 ? '±0' : `${diff}`}
        <span className="opacity-60"> vs avg</span>
      </span>
    </div>
  );
}

export default function EchoAdvisor({ result, compact = false }: Props) {
  const { locale } = useLocale();
  const rec      = RECOMMENDATION_STYLE[result.recommendation];
  const label    = rec.label[locale];
  const ratioPct = Math.round((result.ratio - 1) * 100);
  const ratioStr = ratioPct >= 0 ? `+${ratioPct}%` : `${ratioPct}%`;

  /* ── コンパクト版（スマホ固定バー用） ────────────────────────────────── */
  if (compact) {
    return (
      <div
        className="w-full rounded-xl px-3 py-2.5 flex flex-col gap-2"
        style={{ background: rec.bg, border: `1px solid ${rec.border}` }}
      >
        {/* Row 1: バッジ + 期待スコア + 平均比 */}
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
            style={{ background: rec.color, color: '#fff' }}
          >
            {label}
          </span>
          <span
            className="text-[12px] font-semibold shrink-0"
            style={{ color: rec.color, fontFamily: '"IBM Plex Mono", monospace' }}
          >
            {Math.round(result.expectedScore)} pts
          </span>
          <span className="text-[10px] text-[#9ca3af] ml-auto shrink-0">
            {ratioStr}
            <span className="opacity-60 ml-0.5">{locale === 'ja' ? '平均比' : 'vs avg'}</span>
          </span>
        </div>

        {/* Row 2: A / S / S+ 確率（区切り線あり） */}
        <div className="flex divide-x divide-[#e5e7eb]">
          {PROB_ROWS.map(({ jaLabel, enLabel, probKey, baseKey, color }) => {
            const pct  = Math.round(result[probKey] * 100);
            const diff = pct - Math.round(result[baseKey] * 100);
            return (
              <div key={probKey} className="flex-1 flex flex-col items-center gap-0.5 px-1">
                <span className="text-[9px] font-medium text-[#9ca3af] uppercase tracking-wide">
                  {locale === 'ja' ? jaLabel : enLabel}
                </span>
                <span
                  className="text-[15px] font-bold leading-none"
                  style={{ color, fontFamily: '"IBM Plex Mono", monospace' }}
                >
                  {pct}%
                </span>
                <span className="text-[9px] text-[#9ca3af]">
                  {diff > 0 ? `+${diff}` : diff === 0 ? '±0' : `${diff}`}
                  <span className="opacity-60"> vs</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── フル版（PC / デスクトップ用） ──────────────────────────────────── */
  return (
    <div
      className="w-full max-w-sm rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: rec.bg, border: `1px solid ${rec.border}` }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: rec.color, color: '#fff' }}
        >
          {label}
        </span>
        <div className="text-right">
          <span
            className="text-xs font-medium"
            style={{ color: rec.color, fontFamily: '"IBM Plex Mono", monospace' }}
          >
            {ratioStr}
          </span>
          <span className="text-[10px] text-[#9ca3af] ml-1">
            {locale === 'ja' ? '平均比' : 'vs avg'}
          </span>
        </div>
      </div>

      {/* Expected score row */}
      <div className="flex items-center justify-between px-0.5">
        <span className="text-xs text-[#707070]">
          {locale === 'ja' ? '期待最終スコア' : 'Expected Score'}
        </span>
        <span
          className="text-sm font-semibold"
          style={{ color: rec.color, fontFamily: '"IBM Plex Mono", monospace' }}
        >
          {Math.round(result.expectedScore)} pts
          <span className="text-[10px] font-normal text-[#9ca3af] ml-1.5">
            ({locale === 'ja' ? '平均' : 'avg'} {Math.round(result.baselineScore)})
          </span>
        </span>
      </div>

      {/* Probability cards */}
      <div className="flex gap-2">
        <ProbCard
          label={locale === 'ja' ? 'A 以上' : 'A or +'}
          prob={result.probAPlus}
          baselineProb={result.baselineProbAPlus}
          color="#a78bfa"
        />
        <ProbCard
          label={locale === 'ja' ? 'S 以上' : 'S or +'}
          prob={result.probSPlus}
          baselineProb={result.baselineProbSPlus}
          color="#e8c44a"
        />
        <ProbCard
          label={locale === 'ja' ? 'S+ 以上' : 'S+ or +'}
          prob={result.probSStarPlus}
          baselineProb={result.baselineProbSStarPlus}
          color="#f97316"
        />
      </div>
    </div>
  );
}
