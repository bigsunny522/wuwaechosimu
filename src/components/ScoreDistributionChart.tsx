'use client';

import { useMemo, useRef, useState } from 'react';
import type { ScoreResult, ScoreRank } from '@/types/echo';
import { RANK_COLORS } from '@/lib/scorer';
import { useLocale } from '@/lib/locale';
import { TRANSLATIONS } from '@/data/translations';

interface Props {
  result: ScoreResult;
}

const PCT_MIN = 0.01;
const PCT_MAX = 100;

const W = 320;
const H = 168;
const PAD = { top: 10, right: 10, bottom: 22, left: 30 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

function xForScore(score: number): number {
  return PAD.left + (Math.max(0, Math.min(100, score)) / 100) * PLOT_W;
}

function yForPct(pct: number): number {
  const clamped = Math.max(PCT_MIN, Math.min(PCT_MAX, pct));
  const frac = (Math.log10(clamped) - Math.log10(PCT_MIN)) / (Math.log10(PCT_MAX) - Math.log10(PCT_MIN));
  return PAD.top + frac * PLOT_H;
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

export default function ScoreDistributionChart({ result }: Props) {
  const { locale } = useLocale();
  const T = TRANSLATIONS[locale];
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverScore, setHoverScore] = useState<number | null>(null);

  const curve = result.distributionCurve;
  const thresholds = result.rankThresholds;

  const linePath = useMemo(() => {
    if (!curve || curve.length === 0) return '';
    const sorted = [...curve].sort((a, b) => a[1] - b[1]); // スコア昇順
    return sorted
      .map(([pct, score], i) => `${i === 0 ? 'M' : 'L'} ${xForScore(score).toFixed(1)} ${yForPct(pct).toFixed(1)}`)
      .join(' ');
  }, [curve]);

  const areaPath = useMemo(() => {
    if (!curve || curve.length === 0) return '';
    const sorted = [...curve].sort((a, b) => a[1] - b[1]);
    const top = sorted.map(([pct, score]) => `${xForScore(score).toFixed(1)} ${yForPct(pct).toFixed(1)}`).join(' L ');
    const baseY = PAD.top + PLOT_H;
    return `M ${xForScore(sorted[0][1]).toFixed(1)} ${baseY} L ${top} L ${xForScore(sorted[sorted.length - 1][1]).toFixed(1)} ${baseY} Z`;
  }, [curve]);

  if (!curve || curve.length === 0 || !thresholds) return null;

  // スコア昇順の帯境界（D→C→B→A→S→S+→GOD）
  const bands: { rank: ScoreRank; from: number; to: number }[] = [
    { rank: 'D',   from: 0,               to: thresholds.c },
    { rank: 'C',   from: thresholds.c,    to: thresholds.b },
    { rank: 'B',   from: thresholds.b,    to: thresholds.a },
    { rank: 'A',   from: thresholds.a,    to: thresholds.s },
    { rank: 'S',   from: thresholds.s,    to: thresholds.sPlus },
    { rank: 'S+',  from: thresholds.sPlus, to: thresholds.god },
    { rank: 'GOD', from: thresholds.god,  to: 100 },
  ];

  const gridPcts = [0.01, 0.1, 1, 5, 15, 35, 65, 100];

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const svgX = xRatio * W;
    const score = Math.max(0, Math.min(100, ((svgX - PAD.left) / PLOT_W) * 100));
    setHoverScore(score);
  };

  const activeScore = hoverScore ?? result.score;
  const activePct = hoverScore !== null ? pctAtScore(curve, hoverScore) : (result.topPercentile ?? pctAtScore(curve, result.score));

  return (
    <div className="w-full">
      <div className="text-[11px] font-medium text-[#6b7280] mb-1">{T.distTitle}</div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        style={{ background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: 8 }}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverScore(null)}
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
              opacity={0.1}
            />
          );
        })}

        {/* 上位%グリッド線 */}
        {gridPcts.map((pct) => (
          <g key={pct}>
            <line
              x1={PAD.left} x2={PAD.left + PLOT_W}
              y1={yForPct(pct)} y2={yForPct(pct)}
              stroke="#e5e7eb" strokeWidth={1}
            />
            <text x={PAD.left - 4} y={yForPct(pct) + 3} textAnchor="end" fontSize={7} fill="#9ca3af">
              {pct >= 1 ? pct : pct.toFixed(2)}%
            </text>
          </g>
        ))}

        {/* 分布曲線 */}
        <path d={areaPath} fill="#0275fd" opacity={0.08} />
        <path d={linePath} fill="none" stroke="#0275fd" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

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

        {/* 現在のスコア（またはホバー位置）のマーカー */}
        <line
          x1={xForScore(activeScore)} x2={xForScore(activeScore)}
          y1={PAD.top} y2={PAD.top + PLOT_H}
          stroke="#111827" strokeWidth={1} strokeDasharray="3,2" opacity={0.6}
        />
        <circle cx={xForScore(activeScore)} cy={yForPct(activePct)} r={3.5} fill="#111827" stroke="#fff" strokeWidth={1.5} />

        {/* x軸ラベル */}
        <text x={PAD.left} y={H - 4} fontSize={7} fill="#9ca3af">0</text>
        <text x={PAD.left + PLOT_W} y={H - 4} textAnchor="end" fontSize={7} fill="#9ca3af">100</text>
        <text x={PAD.left + PLOT_W / 2} y={H - 4} textAnchor="middle" fontSize={7} fill="#9ca3af">{T.distAxisLabel}</text>
      </svg>

      {/* ツールチップ相当（下部に常時表示、ホバーで更新） */}
      <div className="mt-1 text-[11px] text-[#374151] flex items-center gap-1.5">
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ background: hoverScore !== null ? '#111827' : RANK_COLORS[result.rank] }}
        />
        <span className="tabular-nums font-medium">
          {hoverScore === null ? T.distYourScore : `${Math.round(activeScore)} ${T.distAxisLabel}`}
        </span>
        <span className="text-[#9ca3af]">→</span>
        <span className="tabular-nums font-semibold" style={{ color: '#0275fd' }}>
          {locale === 'ja' ? `上位 ${formatPct(activePct)}%` : `Top ${formatPct(activePct)}%`}
        </span>
      </div>
    </div>
  );
}
