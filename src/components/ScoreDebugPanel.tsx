'use client';

import { useState } from 'react';
import type { EchoState, ScoreResult, SubstatCategory } from '@/types/echo';
import { SUBSTAT_COUNT } from '@/data/mainstats';
import { MULT, REFERENCE_TIER, normalizedTier, CATEGORY_COLORS } from '@/lib/scorer';
import { useLocale } from '@/lib/locale';
import { TRANSLATIONS, SUBSTAT_LABEL_EN } from '@/data/translations';

interface Props {
  echo: EchoState;
  score: ScoreResult;
}

export default function ScoreDebugPanel({ echo, score }: Props) {
  const [open, setOpen] = useState(false);
  const { locale } = useLocale();
  const T = TRANSLATIONS[locale];

  const CATEGORY_LABEL: Record<SubstatCategory, string> = {
    recommended: T.catRecommended,
    preferred:   T.catPreferred,
    acceptable:  T.catAcceptable,
    unnecessary: T.catUnnecessary,
  };

  const theoreticalMax = score.theoreticalMax;
  const idealMult      = score.idealMult;
  const rawTotal       = score.breakdown.reduce((s, b) => s + b.points, 0);
  const substatScore   = (rawTotal / theoreticalMax) * 100;

  return (
    <div className="w-full max-w-sm">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs border transition-colors"
        style={{
          background: 'var(--hd-raise)',
          borderColor: open ? 'var(--hd-sub)' : 'var(--hd-line)',
          color: open ? 'var(--hd-fg)' : 'var(--hd-sub)',
        }}
      >
        <span className="flex items-center gap-1.5">
          <span>🔍</span>
          <span className="font-medium">{T.debugTitle}</span>
        </span>
        <span className="text-[10px]">{open ? T.debugClose : T.debugOpen}</span>
      </button>

      {open && (
        <div
          className="hd-num mt-1.5 rounded-xl overflow-hidden text-[11px]"
          style={{
            background: 'var(--hd-plate)',
            border: '1px solid var(--hd-line)',
          }}
        >
          {score.isVariantScore && score.variantLabel && (
            <div
              className="px-3 py-1.5 text-[10px]"
              style={{ background: '#4338ca1f', color: 'var(--hd-fg)', borderBottom: '1px solid var(--hd-line)' }}
            >
              運用バリアント: {score.variantLabel}
            </div>
          )}

          {/* サブステ内訳ヘッダー */}
          <div
            className="grid gap-x-2 px-3 py-1.5 text-[10px] uppercase tracking-wider"
            style={{
              gridTemplateColumns: '1fr 5rem 3.5rem 4rem',
              borderBottom: '1px solid var(--hd-line)',
              color: 'var(--hd-sub)',
              background: 'var(--hd-raise)',
            }}
          >
            <span>{T.debugSubstat}</span>
            <span className="text-right">{T.debugTier}</span>
            <span className="text-right">{T.debugMult}</span>
            <span className="text-right">{T.debugPoints}</span>
          </div>

          {score.breakdown.map((b) => {
            const sub  = echo.substats.find((s) => s.key === b.key);
            if (!sub) return null;
            // v2運用バリアント方式は実値ベース正規化＋連続重みのため、
            // 旧Tier正規化とカテゴリ固定倍率ではなく実際の計算値を逆算して表示する
            const nt   = score.isVariantScore ? sub.value / sub.maxValue : normalizedTier(sub.tier);
            const mult = score.isVariantScore ? (nt > 0 ? b.points / nt : 0) : MULT[b.category];
            const color = CATEGORY_COLORS[b.category];
            const subLabel = locale === 'en' ? (SUBSTAT_LABEL_EN[b.key] ?? b.label) : b.label;
            return (
              <div
                key={b.key}
                className="grid gap-x-2 px-3 py-1.5 items-center"
                style={{
                  gridTemplateColumns: '1fr 5rem 3.5rem 4rem',
                  borderBottom: '1px solid var(--hd-line)',
                }}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="shrink-0 px-1 rounded text-[9px] font-semibold"
                    style={{ background: `${color}18`, color }}
                  >
                    {CATEGORY_LABEL[b.category]}
                  </span>
                  <span className="text-[var(--hd-fg)] truncate">{subLabel}</span>
                </div>
                <div className="text-right">
                  <span className="text-[var(--hd-fg)]">T{sub.tier}</span>
                  <span className="text-[var(--hd-sub)] ml-1">({nt.toFixed(3)})</span>
                </div>
                <div className="text-right font-medium" style={{ color: 'var(--hd-fg)' }}>
                  ×{mult.toFixed(1)}
                </div>
                <div className="text-right text-[var(--hd-fg)] tabular-nums">
                  {b.points.toFixed(4)}
                </div>
              </div>
            );
          })}

          {/* 計算式まとめ */}
          <div
            className="px-3 py-2.5 flex flex-col gap-1.5"
            style={{ borderTop: '1px solid var(--hd-line)', background: 'var(--hd-raise)' }}
          >
            <div className="flex justify-between text-[var(--hd-sub)]">
              <span>
                {T.debugMax}
                <span className="ml-1 text-[10px]">
                  {score.isVariantScore
                    ? `(Σ 基準ロール×重み top${SUBSTAT_COUNT[echo.cost]})`
                    : `(${SUBSTAT_COUNT[echo.cost]}× ${normalizedTier(REFERENCE_TIER).toFixed(3)} × ${idealMult.toFixed(3)})`}
                </span>
              </span>
              <span className="tabular-nums text-[var(--hd-sub)]">{theoreticalMax.toFixed(4)}</span>
            </div>
            <div className="flex justify-between text-[var(--hd-sub)]">
              <span>{T.debugTotal}</span>
              <span className="tabular-nums text-[var(--hd-fg)]">{rawTotal.toFixed(4)}</span>
            </div>
            <div
              className="flex justify-between font-semibold"
              style={{ borderTop: '1px solid var(--hd-line)', paddingTop: '0.375rem' }}
            >
              <span className="text-[var(--hd-fg)]">
                {T.debugSubScore}
                <span className="ml-1 text-[10px] font-normal text-[var(--hd-sub)]">
                  ({rawTotal.toFixed(3)} ÷ {theoreticalMax.toFixed(3)} × 100)
                </span>
              </span>
              <span className="tabular-nums text-[var(--hd-accent-text)]">{substatScore.toFixed(2)}</span>
            </div>

            {score.comboBonus !== undefined && score.comboBonus > 0 && (
              <div className="flex justify-between text-[var(--hd-sub)]">
                <span>{T.debugComboBonus} (×{score.breakdown.filter(b => b.category === 'recommended').length})</span>
                <span className="tabular-nums">+{score.comboBonus}</span>
              </div>
            )}

            {score.isCharacterScore && (
              <>
                {score.mainstatBonus !== undefined && score.mainstatBonus !== 0 && (
                  <div className="flex justify-between text-[var(--hd-sub)]">
                    <span>{T.debugMainBonus}</span>
                    <span className="tabular-nums">{score.mainstatBonus > 0 ? '+' : ''}{score.mainstatBonus}</span>
                  </div>
                )}
                {score.setBonus !== undefined && score.setBonus !== 0 && (
                  <div className="flex justify-between text-[var(--hd-sub)]">
                    <span>{T.debugSetBonus}</span>
                    <span className="tabular-nums">{score.setBonus > 0 ? '+' : ''}{score.setBonus}</span>
                  </div>
                )}
                {score.mainstatBonus === 0 && score.setBonus === 0 && (
                  <div className="flex justify-between text-[var(--hd-sub)]">
                    <span>{T.debugNoBonus}</span>
                    <span>{T.debugNone}</span>
                  </div>
                )}
              </>
            )}

            <div
              className="flex justify-between text-sm font-semibold"
              style={{ borderTop: '1px solid var(--hd-line)', paddingTop: '0.375rem', color: 'var(--hd-fg)' }}
            >
              <span>{T.debugFinal}</span>
              <span className="tabular-nums">{score.score} / 100</span>
            </div>
          </div>

          {/* 凡例 */}
          <div className="px-3 py-2 flex flex-wrap gap-x-3 gap-y-1" style={{ borderTop: '1px solid var(--hd-line)' }}>
            <span className="text-[10px] text-[var(--hd-sub)] w-full mb-0.5">{T.debugMultsLabel}</span>
            {(Object.entries(MULT) as [SubstatCategory, number][]).map(([cat, val]) => (
              <span key={cat} className="text-[10px]" style={{ color: 'var(--hd-sub)' }}>
                {CATEGORY_LABEL[cat]} ×{val.toFixed(1)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
