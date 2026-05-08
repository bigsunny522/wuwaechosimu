'use client';

import { useState } from 'react';
import type { EchoState, ScoreResult, SubstatCategory } from '@/types/echo';
import { SUBSTAT_COUNT } from '@/data/mainstats';
import { MULT, IDEAL_MULT, REFERENCE_TIER, normalizedTier, CATEGORY_COLORS } from '@/lib/scorer';

interface Props {
  echo: EchoState;
  score: ScoreResult;
}

const CATEGORY_LABEL: Record<SubstatCategory, string> = {
  recommended: '推奨',
  preferred:   '優先',
  acceptable:  '妥協',
  unnecessary: '不要',
};

export default function ScoreDebugPanel({ echo, score }: Props) {
  const [open, setOpen] = useState(false);

  const theoreticalMax = SUBSTAT_COUNT[echo.cost] * normalizedTier(REFERENCE_TIER) * IDEAL_MULT;
  const rawTotal       = score.breakdown.reduce((s, b) => s + b.points, 0);
  const substatScore   = (rawTotal / theoreticalMax) * 100;

  return (
    <div className="w-full max-w-sm">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs border transition-colors"
        style={{
          background: 'rgba(15,17,23,0.6)',
          borderColor: open ? 'rgba(148,163,184,0.3)' : 'rgba(148,163,184,0.15)',
          color: open ? '#94a3b8' : '#475569',
        }}
      >
        <span className="flex items-center gap-1.5">
          <span>🔍</span>
          <span>スコア計算の詳細</span>
        </span>
        <span className="text-[10px]">{open ? '▲ 閉じる' : '▼ 開く'}</span>
      </button>

      {open && (
        <div
          className="mt-1.5 rounded-xl overflow-hidden text-[11px] font-mono"
          style={{
            background: 'rgba(10,12,20,0.85)',
            border: '1px solid rgba(148,163,184,0.15)',
          }}
        >
          {/* ── サブステ内訳 ───────────────────────────────── */}
          <div
            className="grid gap-x-2 px-3 py-1.5 text-[10px] uppercase tracking-wider"
            style={{
              gridTemplateColumns: '1fr 5rem 3.5rem 4rem',
              borderBottom: '1px solid rgba(148,163,184,0.1)',
              color: '#475569',
            }}
          >
            <span>サブステ</span>
            <span className="text-right">Tier (正規化)</span>
            <span className="text-right">倍率</span>
            <span className="text-right">ポイント</span>
          </div>

          {score.breakdown.map((b) => {
            const sub  = echo.substats.find((s) => s.key === b.key);
            if (!sub) return null;
            const nt   = normalizedTier(sub.tier);
            const mult = MULT[b.category];
            const color = CATEGORY_COLORS[b.category];
            return (
              <div
                key={b.key}
                className="grid gap-x-2 px-3 py-1 items-center"
                style={{
                  gridTemplateColumns: '1fr 5rem 3.5rem 4rem',
                  borderBottom: '1px solid rgba(148,163,184,0.05)',
                }}
              >
                {/* ステ名 + カテゴリバッジ */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="shrink-0 px-1 rounded text-[9px] font-bold"
                    style={{ background: `${color}22`, color }}
                  >
                    {CATEGORY_LABEL[b.category]}
                  </span>
                  <span className="text-slate-300 truncate">{b.label}</span>
                </div>

                {/* Tier + normalizedTier */}
                <div className="text-right">
                  <span className="text-slate-300">T{sub.tier}</span>
                  <span className="text-slate-600 ml-1">({nt.toFixed(3)})</span>
                </div>

                {/* MULT */}
                <div className="text-right" style={{ color }}>
                  ×{mult.toFixed(1)}
                </div>

                {/* Points */}
                <div className="text-right text-slate-200 tabular-nums">
                  {b.points.toFixed(4)}
                </div>
              </div>
            );
          })}

          {/* ── 計算式まとめ ──────────────────────────────── */}
          <div
            className="px-3 py-2.5 flex flex-col gap-1.5"
            style={{ borderTop: '1px solid rgba(148,163,184,0.12)' }}
          >
            {/* 理論最大値の内訳 */}
            <div className="flex justify-between text-slate-600">
              <span>
                理論最大値
                <span className="ml-1 text-[10px]">
                  ({SUBSTAT_COUNT[echo.cost]}枠 × {normalizedTier(REFERENCE_TIER).toFixed(3)} × {IDEAL_MULT.toFixed(3)})
                </span>
              </span>
              <span className="tabular-nums text-slate-500">{theoreticalMax.toFixed(4)}</span>
            </div>

            <div className="flex justify-between text-slate-500">
              <span>合計ポイント</span>
              <span className="tabular-nums text-slate-300">{rawTotal.toFixed(4)}</span>
            </div>

            {/* サブステスコア */}
            <div
              className="flex justify-between font-bold"
              style={{ borderTop: '1px solid rgba(148,163,184,0.1)', paddingTop: '0.375rem' }}
            >
              <span className="text-slate-400">
                サブステスコア
                <span className="ml-1 text-[10px] font-normal text-slate-600">
                  ({rawTotal.toFixed(3)} ÷ {theoreticalMax.toFixed(3)} × 100)
                </span>
              </span>
              <span className="tabular-nums text-slate-200">{substatScore.toFixed(2)}</span>
            </div>

            {/* キャラ別補正 */}
            {score.isCharacterScore && (
              <>
                {score.mainstatBonus !== undefined && score.mainstatBonus !== 0 && (
                  <div className="flex justify-between text-red-400/80">
                    <span>メインステ補正</span>
                    <span className="tabular-nums">{score.mainstatBonus > 0 ? '+' : ''}{score.mainstatBonus}</span>
                  </div>
                )}
                {score.setBonus !== undefined && score.setBonus !== 0 && (
                  <div className="flex justify-between text-orange-400/80">
                    <span>ハーモニーセット補正</span>
                    <span className="tabular-nums">{score.setBonus > 0 ? '+' : ''}{score.setBonus}</span>
                  </div>
                )}
                {score.mainstatBonus === 0 && score.setBonus === 0 && (
                  <div className="flex justify-between text-emerald-500/80">
                    <span>メイン／セット補正</span>
                    <span>なし ✓</span>
                  </div>
                )}
              </>
            )}

            {/* 最終スコア */}
            <div
              className="flex justify-between text-sm font-black"
              style={{ borderTop: '1px solid rgba(148,163,184,0.15)', paddingTop: '0.375rem', color: '#e2e8f0' }}
            >
              <span>最終スコア</span>
              <span className="tabular-nums">{score.score} / 100</span>
            </div>
          </div>

          {/* ── 計算式の凡例 ─────────────────────────────── */}
          <div
            className="px-3 py-2 flex flex-wrap gap-x-3 gap-y-1"
            style={{ borderTop: '1px solid rgba(148,163,184,0.08)', background: 'rgba(0,0,0,0.2)' }}
          >
            <span className="text-[10px] text-slate-600 w-full mb-0.5">倍率（MULT）</span>
            {(Object.entries(MULT) as [SubstatCategory, number][]).map(([cat, val]) => (
              <span
                key={cat}
                className="text-[10px]"
                style={{ color: CATEGORY_COLORS[cat] }}
              >
                {CATEGORY_LABEL[cat]} ×{val.toFixed(1)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
