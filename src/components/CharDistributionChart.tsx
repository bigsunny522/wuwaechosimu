import type { RankThresholds } from '@/data/rankThresholds';

// data/rankThresholds.ts の histogram と一致させる（幅2のビンが51個、スコア0〜100）
const BIN_WIDTH = 2;

// ScoreDistributionChart.tsx と同じ色
const BAR_COLOR = '#93c5fd';
const THRESHOLD_COLOR = '#0275fd';

interface Props {
  thresholds: Pick<RankThresholds, 'histogram' | 's' | 'sPlus'>;
  /** 縦線のラベル。例: ja「S: 69点」 / en "S: 69 pts" */
  sLabel: string;
  sPlusLabel: string;
  /** x軸の説明。例: ja「スコア」 / en "Score" */
  axisLabel: string;
}

/**
 * キャラ別ページ用のスコア分布ヒストグラム（静的SVG）。
 * マウス操作は不要なので 'use client' を付けず、サーバー・クライアント両方から使える形にする。
 */
export default function CharDistributionChart({ thresholds, sLabel, sPlusLabel, axisLabel }: Props) {
  const { histogram, s, sPlus } = thresholds;
  if (!histogram || histogram.length === 0) return null;

  const W = 560;
  const H = 200;
  const PAD = { top: 22, right: 10, bottom: 24, left: 12 };
  const PLOT_W = W - PAD.left - PAD.right;
  const PLOT_H = H - PAD.top - PAD.bottom;

  const xForScore = (score: number) => PAD.left + (Math.max(0, Math.min(100, score)) / 100) * PLOT_W;
  const maxFreq = Math.max(...histogram, 0.0001);
  const yForFreq = (freq: number) => PAD.top + PLOT_H - (freq / (maxFreq * 1.1)) * PLOT_H;

  const barGap = 1;
  const barWidth = Math.max(0.5, PLOT_W / histogram.length - barGap);

  const sX = xForScore(s);
  const sPlusX = xForScore(sPlus);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        background: '#fafafa',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
      }}
      role="img"
      aria-label={`${sLabel} / ${sPlusLabel}`}
    >
      {/* y軸グリッド線（頻度） */}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={PAD.left}
          x2={PAD.left + PLOT_W}
          y1={yForFreq(maxFreq * f)}
          y2={yForFreq(maxFreq * f)}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      ))}

      {/* ヒストグラム本体 */}
      {histogram.map((freq, i) => {
        const binScore = i * BIN_WIDTH;
        const x = xForScore(binScore) + barGap / 2;
        const y = yForFreq(freq);
        const barH = Math.max(0, PAD.top + PLOT_H - y);
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={barH}
            rx={1.5}
            fill={BAR_COLOR}
            opacity={0.75}
          />
        );
      })}

      {/* S / S+ 閾値の縦線 */}
      <line x1={sX} x2={sX} y1={PAD.top - 4} y2={PAD.top + PLOT_H} stroke={THRESHOLD_COLOR} strokeWidth={1.5} strokeDasharray="4 3" />
      <line x1={sPlusX} x2={sPlusX} y1={PAD.top - 4} y2={PAD.top + PLOT_H} stroke={THRESHOLD_COLOR} strokeWidth={1.5} />
      <text x={sX - 4} y={12} textAnchor="end" fontSize={10} fontWeight={700} fill={THRESHOLD_COLOR}>
        {sLabel}
      </text>
      <text x={sPlusX + 4} y={12} textAnchor="start" fontSize={10} fontWeight={700} fill={THRESHOLD_COLOR}>
        {sPlusLabel}
      </text>

      {/* x軸ラベル */}
      <text x={PAD.left} y={H - 6} fontSize={9} fill="#9ca3af">0</text>
      <text x={PAD.left + PLOT_W} y={H - 6} textAnchor="end" fontSize={9} fill="#9ca3af">100</text>
      <text x={PAD.left + PLOT_W / 2} y={H - 6} textAnchor="middle" fontSize={9} fill="#9ca3af">
        {axisLabel}
      </text>
    </svg>
  );
}
