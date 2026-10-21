'use client';

import type { AdvisorResult } from '@/lib/monteCarlo';
import type { ScoreRank } from '@/types/echo';
import { rankTextColor } from '@/components/home/elementTheme';
import { useSiteAppearance } from '@/contexts/SiteAppearanceContext';
import { useLocale } from '@/lib/locale';

interface Props {
  result: AdvisorResult;
  /** スマホ固定バー用コンパクト表示 */
  compact?: boolean;
}

/** 判定の色。文字はモード対応の判定色(ホームの ForecastStrip と同じ)、
 *  塗り(バッジ)と枠には意味のある色をそのまま残す */
const RECOMMENDATION_STYLE = {
  great: {
    label: { ja: '強く継続推奨', en: 'Strong Continue' },
    color: 'var(--hd-great)', badgeBg: '#10b981', badgeFg: '#ffffff',
    bg: '#10b9811f', border: '#10b98133',
  },
  good: {
    label: { ja: '継続推奨', en: 'Continue' },
    color: 'var(--hd-accent-text)', badgeBg: 'var(--hd-accent)', badgeFg: 'var(--hd-accent-ink)',
    bg: 'var(--hd-accent-soft)', border: 'var(--hd-accent)',
  },
  borderline: {
    label: { ja: '様子見', en: 'Borderline' },
    color: 'var(--hd-borderline)', badgeBg: '#f59e0b', badgeFg: '#ffffff',
    bg: '#f59e0b1f', border: '#f59e0b33',
  },
  scrap: {
    label: { ja: '破棄推奨', en: 'Consider Scrap' },
    color: 'var(--hd-scrap)', badgeBg: '#ef4444', badgeFg: '#ffffff',
    bg: '#ef44441f', border: '#ef444433',
  },
} as const;

const PROB_ROWS: { jaLabel: string; enLabel: string; probKey: 'probAPlus' | 'probSPlus' | 'probSStarPlus'; baseKey: 'baselineProbAPlus' | 'baselineProbSPlus' | 'baselineProbSStarPlus'; rank: ScoreRank }[] = [
  { jaLabel: 'A以上',  enLabel: 'A+',   probKey: 'probAPlus',     baseKey: 'baselineProbAPlus',     rank: 'A' },
  { jaLabel: 'S以上',  enLabel: 'S+',   probKey: 'probSPlus',     baseKey: 'baselineProbSPlus',     rank: 'S' },
  { jaLabel: 'S+以上', enLabel: 'S+★',  probKey: 'probSStarPlus', baseKey: 'baselineProbSStarPlus', rank: 'GOD' },
];

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
      style={{ background: 'var(--hd-raise)', border: '1px solid var(--hd-line)' }}
    >
      <span className="text-[10px] font-medium text-[var(--hd-sub)] tracking-wide uppercase">
        {label}
      </span>
      <span
        className="hd-num text-2xl font-bold leading-none"
        style={{ color }}
      >
        {pct}%
      </span>
      <span className="text-[10px] text-[var(--hd-sub)]">
        {diff > 0 ? `+${diff}` : diff === 0 ? '±0' : `${diff}`}
        <span className="opacity-60"> vs avg</span>
      </span>
    </div>
  );
}

export default function EchoAdvisor({ result, compact = false }: Props) {
  const { locale } = useLocale();
  const { mode } = useSiteAppearance();
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
            className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
            style={{ background: rec.badgeBg, color: rec.badgeFg }}
          >
            {label}
          </span>
          <span
            className="hd-num text-[13px] font-semibold shrink-0"
            style={{ color: rec.color }}
          >
            {Math.round(result.expectedScore)} pts
          </span>
          <span className="text-[10px] text-[var(--hd-sub)] ml-auto shrink-0">
            {ratioStr}
            <span className="opacity-60 ml-0.5">{locale === 'ja' ? '平均比' : 'vs avg'}</span>
          </span>
        </div>

        {/* Row 2: A / S / S+ 確率（区切り線あり）
            % と差分を同じ行に並べることで縦スペースを節約 → % を大きくできる */}
        <div className="flex divide-x divide-[var(--hd-line)]">
          {PROB_ROWS.map(({ jaLabel, enLabel, probKey, baseKey, rank }) => {
            const pct  = Math.round(result[probKey] * 100);
            const diff = pct - Math.round(result[baseKey] * 100);
            return (
              <div key={probKey} className="flex-1 flex flex-col items-center gap-0.5 px-1">
                <span className="text-[9px] font-medium text-[var(--hd-sub)] uppercase tracking-wide">
                  {locale === 'ja' ? jaLabel : enLabel}
                </span>
                {/* % + 差分を横並びにして % を大きく表示 */}
                <div className="flex items-baseline gap-1">
                  <span
                    className="hd-num text-lg font-bold leading-none"
                    style={{ color: rankTextColor(rank, mode) }}
                  >
                    {pct}%
                  </span>
                  <span className="text-[9px] text-[var(--hd-sub)] leading-none">
                    {diff > 0 ? `+${diff}` : diff === 0 ? '±0' : `${diff}`}
                  </span>
                </div>
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
      className="w-full max-w-sm mx-auto rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: rec.bg, border: `1px solid ${rec.border}` }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: rec.badgeBg, color: rec.badgeFg }}
        >
          {label}
        </span>
        <div className="text-right">
          <span
            className="hd-num text-xs font-medium"
            style={{ color: rec.color }}
          >
            {ratioStr}
          </span>
          <span className="text-[10px] text-[var(--hd-sub)] ml-1">
            {locale === 'ja' ? '平均比' : 'vs avg'}
          </span>
        </div>
      </div>

      {/* Expected score row */}
      <div className="flex items-center justify-between px-0.5">
        <span className="text-xs text-[var(--hd-sub)]">
          {locale === 'ja' ? '期待最終スコア' : 'Expected Score'}
        </span>
        <span
          className="hd-num text-sm font-semibold"
          style={{ color: rec.color }}
        >
          {Math.round(result.expectedScore)} pts
          <span className="text-[10px] font-normal text-[var(--hd-sub)] ml-1.5">
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
          color={rankTextColor('A', mode)}
        />
        <ProbCard
          label={locale === 'ja' ? 'S 以上' : 'S or +'}
          prob={result.probSPlus}
          baselineProb={result.baselineProbSPlus}
          color={rankTextColor('S', mode)}
        />
        <ProbCard
          label={locale === 'ja' ? 'S+ 以上' : 'S+ or +'}
          prob={result.probSStarPlus}
          baselineProb={result.baselineProbSStarPlus}
          color={rankTextColor('GOD', mode)}
        />
      </div>
    </div>
  );
}
