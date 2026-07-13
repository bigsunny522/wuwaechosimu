'use client';

import { useMemo, useRef, useState } from 'react';
import type { ScoreResult, ScoreRank } from '@/types/echo';
import { RANK_COLORS } from '@/lib/scorer';
import { useLocale } from '@/lib/locale';
import { TRANSLATIONS } from '@/data/translations';

interface Props {
  result: ScoreResult;
  /** モバイルのコンパクト表示用: タイトル・凡例テキストを簡略化して縦幅を抑える */
  compact?: boolean;
}

// data/rankThresholds.ts の HIST_BIN_WIDTH / HIST_BIN_COUNT と一致させること
const BIN_WIDTH = 2;

const W = 320;
const H = 168;
const PAD = { top: 10, right: 8, bottom: 22, left: 30 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

const BAR_COLOR = '#93c5fd';
const BAR_COLOR_ACTIVE = '#0275fd';

function xForScore(score: number): number {
  return PAD.left + (Math.max(0, Math.min(100, score)) / 100) * PLOT_W;
}

// result.distributionCurve から任意スコアの上位%を対数補間で求める（getPercentileForScore と同じロジック）
function pctAtScore(curve: [number, number][], score: number): number {
  const bySco = [...curve].sort((a, b) => a[1] - b[1]);
  if (score >= bySco[bySco.length - 1][1]) return bySco[bySco.length - 1][0];
  if (score <= bySco[0][1]) return bySco[0][0];
  for (let i = 0; i < bySco.length - 1; i++) {
    const [pctLo, scoreLo] = bySco[i];
    const [pctHi, scoreHi] = bySco[i + 1];
    if (score >= scoreLo && score <= scoreHi) {
      if (scoreHi === scoreLo) return pctLo;
      const t = (score - scoreLo) / (scoreHi - scoreLo);
      const logLo = Math.log10(Math.max(pctLo, 0.001));
      const logHi = Math.log10(Math.max(pctHi, 0.001));
      return Math.pow(10, logLo + (logHi - logLo) * t);
    }
  }
  return bySco[0][0];
}

function formatPct(pct: number): string {
  if (pct < 1) return pct.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  if (pct < 10) return pct.toFixed(1).replace(/\.0$/, '');
  return Math.round(pct).toString();
}

export default function ScoreDistributionChart({ result, compact = false }: Props) {
  const { locale } = useLocale();
  const T = TRANSLATIONS[locale];
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverBin, setHoverBin] = useState<number | null>(null);

  const curve = result.distributionCurve;
  const histogram = result.distributionHistogram;
  const thresholds = result.rankThresholds;

  const maxFreq = useMemo(() => (histogram ? Math.max(...histogram, 0.0001) : 0.0001), [histogram]);

  const yForFreq = (freq: number) => PAD.top + PLOT_H - (freq / (maxFreq * 1.15)) * PLOT_H;

  const activeBin = useMemo(() => {
    if (hoverBin !== null) return hoverBin;
    return Math.min((histogram?.length ?? 1) - 1, Math.floor(result.score / BIN_WIDTH));
  }, [hoverBin, histogram, result.score]);

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg || !histogram) return;
    const rect = svg.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const svgX = xRatio * W;
    const score = Math.max(0, Math.min(100, ((svgX - PAD.left) / PLOT_W) * 100));
    setHoverBin(Math.min(histogram.length - 1, Math.max(0, Math.floor(score / BIN_WIDTH))));
  };

  if (!curve || curve.length === 0 || !histogram || histogram.length === 0 || !thresholds) return null;

  // スコア昇順の帯境界（D→C→B→A→S→S+→GOD）
  const bands: { rank: ScoreRank; from: number; to: number }[] = [
    { rank: 'D',   from: 0,                to: thresholds.c },
    { rank: 'C',   from: thresholds.c,     to: thresholds.b },
    { rank: 'B',   from: thresholds.b,     to: thresholds.a },
    { rank: 'A',   from: thresholds.a,     to: thresholds.s },
    { rank: 'S',   from: thresholds.s,     to: thresholds.sPlus },
    { rank: 'S+',  from: thresholds.sPlus, to: thresholds.god },
    { rank: 'GOD', from: thresholds.god,   to: 100 },
  ];

  const barGap = 1;
  const barWidth = Math.max(0.5, PLOT_W / histogram.length - barGap);

  const activeBinScore = activeBin * BIN_WIDTH + BIN_WIDTH / 2;
  const activePct = hoverBin !== null ? pctAtScore(curve, activeBinScore) : (result.topPercentile ?? pctAtScore(curve, result.score));

  return (
    <div className="w-full">
      {!compact && <div className="text-[11px] font-medium text-[#6b7280] mb-1">{T.distTitle}</div>}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        style={{ background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: 8 }}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverBin(null)}
      >
        {/* ランク帯（スコア方向の縦帯） */}
        {bands.map((b) => {
          if (b.to <= b.from) return null;
          const x1 = xForScore(b.from);
          const x2 = xForScore(b.to);
          const color = RANK_COLORS[b.rank];
          return (
            <rect
              key={b.rank}
              x={x1}
              y={PAD.top}
              width={Math.max(0, x2 - x1)}
              height={PLOT_H}
              fill={color}
              opacity={0.08}
            />
          );
        })}

        {/* y軸グリッド線（頻度） */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={PAD.left} x2={PAD.left + PLOT_W}
            y1={yForFreq(maxFreq * f)} y2={yForFreq(maxFreq * f)}
            stroke="#e5e7eb" strokeWidth={1}
          />
        ))}

        {/* ヒストグラム本体 */}
        {histogram.map((freq, i) => {
          const binScore = i * BIN_WIDTH;
          const x = xForScore(binScore) + barGap / 2;
          const y = yForFreq(freq);
          const barH = Math.max(0, PAD.top + PLOT_H - y);
          const isActive = i === activeBin;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={1.5}
              fill={isActive ? BAR_COLOR_ACTIVE : BAR_COLOR}
              opacity={isActive ? 1 : 0.65}
            />
          );
        })}

        {/* ランクラベル（帯の上部） */}
        {bands.map((b) => {
          if (b.to <= b.from) return null;
          const x1 = xForScore(b.from);
          const x2 = xForScore(b.to);
          const width = x2 - x1;
          if (width < 14) return null;
          return (
            <text
              key={`label-${b.rank}`}
              x={(x1 + x2) / 2}
              y={PAD.top + 9}
              textAnchor="middle"
              fontSize={8}
              fontWeight={700}
              fill={RANK_COLORS[b.rank]}
            >
              {b.rank}
            </text>
          );
        })}

        {/* x軸ラベル */}
        <text x={PAD.left} y={H - 4} fontSize={7} fill="#9ca3af">0</text>
        <text x={PAD.left + PLOT_W} y={H - 4} textAnchor="end" fontSize={7} fill="#9ca3af">100</text>
        <text x={PAD.left + PLOT_W / 2} y={H - 4} textAnchor="middle" fontSize={7} fill="#9ca3af">{T.distAxisLabel}</text>
      </svg>

      {/* ツールチップ相当（下部に常時表示、ホバーで更新） */}
      <div className="mt-1 text-[11px] text-[#374151] flex items-center gap-1.5 flex-wrap">
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ background: hoverBin !== null ? BAR_COLOR_ACTIVE : RANK_COLORS[result.rank] }}
        />
        {compact ? (
          <span className="tabular-nums font-semibold" style={{ color: '#0275fd' }}>
            {locale === 'ja' ? `ドロップ上位 ${formatPct(activePct)}%` : `Top ${formatPct(activePct)}% of drops`}
          </span>
        ) : (
          <>
            <span className="tabular-nums font-medium">
              {hoverBin === null
                ? T.distYourScore
                : `${activeBin * BIN_WIDTH}–${activeBin * BIN_WIDTH + BIN_WIDTH} ${T.distAxisLabel}`}
            </span>
            <span className="text-[#9ca3af]">→</span>
            <span className="tabular-nums text-[#6b7280]">
              {locale === 'ja'
                ? `出現率 ${(histogram[activeBin] * 100).toFixed(2)}%`
                : `${(histogram[activeBin] * 100).toFixed(2)}% of drops`}
            </span>
            <span className="text-[#9ca3af]">/</span>
            <span className="tabular-nums font-semibold" style={{ color: '#0275fd' }}>
              {locale === 'ja' ? `上位 ${formatPct(activePct)}%` : `Top ${formatPct(activePct)}%`}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
