'use client';

import type { EchoState, ScoreResult } from '@/types/echo';
import { RANK_COLORS } from '@/lib/scorer';
import { useLocale } from '@/lib/locale';
import { TRANSLATIONS, SUBSTAT_LABEL_EN, MAINSTAT_LABEL_EN } from '@/data/translations';
import { HARMONY_SETS_EN } from '@/data/echoes';

interface Props {
  echo: EchoState;
  score: ScoreResult;
  cardRef?: React.RefObject<HTMLDivElement | null>;
  maxedAt?: number;
}

const COST_COLOR: Record<number, string> = { 4: '#e6b800', 3: '#a855f7', 1: '#0d9488' };

const CAT_COLOR: Record<string, string> = {
  recommended: '#10b981',
  preferred:   '#3b82f6',
  acceptable:  '#f59e0b',
  unnecessary: '#d1d5db',
};

function tierColor(tier: number): string {
  if (tier >= 7) return '#e6b800';
  if (tier >= 5) return '#f97316';
  if (tier >= 3) return '#a855f7';
  return '#9ca3af';
}

function substatColor(tier: number, category?: string): string {
  if (category) return CAT_COLOR[category] ?? tierColor(tier);
  return tierColor(tier);
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// ── 全てインラインスタイルで記述（Tailwind クラス一切なし）
// → html-to-image が CSS ファイルをフェッチせずとも正確にキャプチャできる
export default function ResultCardVisual({ echo, score, cardRef, maxedAt }: Props) {
  const { locale } = useLocale();
  const T         = TRANSLATIONS[locale];
  const rankColor = RANK_COLORS[score.rank];
  const costColor = COST_COLOR[echo.cost] ?? '#9ca3af';

  const echoName = locale === 'en' ? (echo.echoNameEn ?? echo.echoName) : echo.echoName;
  const mainLabel = locale === 'en'
    ? (MAINSTAT_LABEL_EN[echo.mainstat.key] ?? echo.mainstat.label)
    : echo.mainstat.label;
  const harmonyDisplay = echo.activeHarmonySet
    ? (locale === 'en' ? (HARMONY_SETS_EN[echo.activeHarmonySet] ?? echo.activeHarmonySet) : echo.activeHarmonySet)
    : '';

  const sans = 'Inter, "Noto Sans JP", -apple-system, BlinkMacSystemFont, sans-serif';
  const mono = '"IBM Plex Mono", ui-monospace, "Courier New", monospace';

  return (
    <div
      ref={cardRef}
      style={{
        width: '320px',
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#ffffff',
        border: `1px solid ${rankColor}55`,
        boxShadow: `0 4px 24px ${rankColor}18, 0 2px 8px rgba(0,0,0,0.08)`,
        fontFamily: sans,
      }}
    >
      {/* Rank stripe */}
      <div style={{ height: '3px', background: rankColor, width: '100%' }} />

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* ── Echo header ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', fontFamily: mono, color: costColor, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              COST {echo.cost}
            </span>
            <span style={{ fontSize: '10px', color: '#9ca3af', fontFamily: mono }}>· {T.echoType}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '3px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827', lineHeight: '1.3' }}>
              {echoName}
            </span>
            {harmonyDisplay && (
              <span style={{
                fontSize: '11px', fontWeight: 600, color: '#0275fd',
                background: '#eef9ff', padding: '2px 8px', borderRadius: '100px', lineHeight: '1.6',
              }}>
                {harmonyDisplay}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#6b7280' }}>{mainLabel}</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: costColor }}>
              {echo.mainstat.value}{echo.mainstat.unit}
            </span>
            <span style={{ fontSize: '10px', color: '#9ca3af', fontFamily: mono, marginLeft: 'auto' }}>+25</span>
          </div>
        </div>

        {/* ── Score block ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          padding: '10px 14px', borderRadius: '12px',
          background: `${rankColor}0e`, border: `1px solid ${rankColor}33`,
        }}>
          <span style={{ fontSize: '44px', fontWeight: 700, color: rankColor, fontFamily: sans, lineHeight: 1, width: '52px', textAlign: 'center' }}>
            {score.rank}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
              {locale === 'ja' ? `スコア ${score.score} / 100` : `Score ${score.score} / 100`}
            </div>
            <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '100px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${score.score}%`, background: rankColor, borderRadius: '100px' }} />
            </div>
            {score.isCharacterScore && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                {score.mainstatBonus !== undefined && score.mainstatBonus !== 0 && (
                  <span style={{ fontSize: '10px', color: '#ef4444' }}>
                    {locale === 'ja' ? 'メイン' : 'Main'} {score.mainstatBonus > 0 ? '+' : ''}{score.mainstatBonus}
                  </span>
                )}
                {score.setBonus !== undefined && score.setBonus !== 0 && (
                  <span style={{ fontSize: '10px', color: '#f97316' }}>
                    {locale === 'ja' ? 'セット' : 'Set'} {score.setBonus > 0 ? '+' : ''}{score.setBonus}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Substats ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {echo.substats.map((sub, i) => {
            const label   = locale === 'en' ? (SUBSTAT_LABEL_EN[sub.key] ?? sub.label) : sub.label;
            const cat     = score.breakdown.find(b => b.key === sub.key)?.category;
            const sColor  = substatColor(sub.tier, cat);
            const pct     = Math.round((sub.value / sub.maxValue) * 100);
            const hasBg   = cat !== 'unnecessary' && cat !== undefined;

            return (
              <div key={sub.key} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '5px 8px', borderRadius: '8px',
                background: hasBg ? `${sColor}0a` : 'transparent',
                borderLeft: `2px solid ${sColor}`,
              }}>
                <span style={{ fontSize: '10px', color: '#9ca3af', width: '12px', textAlign: 'center', fontFamily: mono, lineHeight: 1 }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#1f2937', flex: 1, minWidth: 0 }}>
                  {label}
                </span>
                <div style={{ width: '44px', height: '4px', background: '#e5e7eb', borderRadius: '100px', overflow: 'hidden', flexShrink: 0 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: sColor, borderRadius: '100px' }} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: sColor, width: '44px', textAlign: 'right', fontFamily: mono, lineHeight: 1 }}>
                  {sub.value}{sub.unit}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {maxedAt ? (
            <span style={{ fontSize: '10px', color: '#9ca3af', fontFamily: mono }}>
              +25: {formatDate(maxedAt)}
            </span>
          ) : <span />}
          <span style={{ fontSize: '10px', color: '#d1d5db', fontFamily: mono }}>
            wuwaechosimu.xyzack271.com
          </span>
        </div>
      </div>
    </div>
  );
}
