'use client';

import type { EchoState, ScoreResult } from '@/types/echo';
import { RANK_COLORS } from '@/lib/scorer';
import { SUBSTAT_LABEL_EN, MAINSTAT_LABEL_EN } from '@/data/translations';
import { HARMONY_SETS_EN } from '@/data/echoes';

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

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y,     x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x,     y + h, rr);
  ctx.arcTo(x,     y + h, x,     y,     rr);
  ctx.arcTo(x,     y,     x + w, y,     rr);
  ctx.closePath();
}

const W   = 320;
const PAD = 16;
const GAP = 12;
const SANS = 'Inter, "Noto Sans JP", -apple-system, BlinkMacSystemFont, sans-serif';
const MONO = '"IBM Plex Mono", ui-monospace, "Courier New", monospace';

export function renderCardToCanvas(
  echo: EchoState,
  score: ScoreResult,
  locale: 'ja' | 'en',
  maxedAt?: number,
): HTMLCanvasElement {
  const rankColor  = RANK_COLORS[score.rank];
  const costColor  = COST_COLOR[echo.cost] ?? '#9ca3af';
  const echoName   = locale === 'en' ? (echo.echoNameEn ?? echo.echoName) : echo.echoName;
  const mainLabel  = locale === 'en'
    ? (MAINSTAT_LABEL_EN[echo.mainstat.key] ?? echo.mainstat.label)
    : echo.mainstat.label;
  const harmonyDisplay = echo.activeHarmonySet
    ? (locale === 'en' ? (HARMONY_SETS_EN[echo.activeHarmonySet] ?? echo.activeHarmonySet) : echo.activeHarmonySet)
    : '';
  const echoTypeLabel = locale === 'ja' ? '音骸' : 'Echo';

  const hasBonusLine = !!(score.isCharacterScore && (
    (score.mainstatBonus !== undefined && score.mainstatBonus !== 0) ||
    (score.setBonus      !== undefined && score.setBonus      !== 0)
  ));

  // Layout constants
  const STRIPE    = 3;
  const HEADER_H  = 14 + 4 + 22 + 4 + 16; // cost row + gap + name row + gap + mainstat row
  const SCORE_H   = hasBonusLine ? 74 : 62;
  const SUB_ROW_H = 28;
  const SUB_GAP   = 2;
  const SUBS_H    = echo.substats.length * (SUB_ROW_H + SUB_GAP) - SUB_GAP;
  const FOOTER_H  = 1 + 8 + 14;
  const totalH    = STRIPE + PAD + HEADER_H + GAP + SCORE_H + GAP + SUBS_H + GAP + FOOTER_H + PAD;

  const SCALE = 2;
  const canvas = document.createElement('canvas');
  canvas.width  = W * SCALE;
  canvas.height = totalH * SCALE;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(SCALE, SCALE);

  // ── Background ──────────────────────────────────────────────────────────
  ctx.fillStyle = '#ffffff';
  rrect(ctx, 0, 0, W, totalH, 16);
  ctx.fill();

  // ── Top stripe ──────────────────────────────────────────────────────────
  ctx.fillStyle = rankColor;
  ctx.fillRect(0, 0, W, STRIPE);

  let y = STRIPE + PAD;

  // ── Echo header ─────────────────────────────────────────────────────────

  // Row 1: "COST X · Echo"
  ctx.font         = `bold 10px ${MONO}`;
  ctx.fillStyle    = costColor;
  ctx.textBaseline = 'middle';
  ctx.textAlign    = 'left';
  ctx.fillText(`COST ${echo.cost}`, PAD, y + 7);
  const costLabelW = ctx.measureText(`COST ${echo.cost}`).width;
  ctx.font      = `10px ${MONO}`;
  ctx.fillStyle = '#9ca3af';
  ctx.fillText(` · ${echoTypeLabel}`, PAD + costLabelW, y + 7);
  y += 14 + 4;

  // Row 2: echo name + optional harmony chip
  ctx.font         = `bold 14px ${SANS}`;
  ctx.fillStyle    = '#111827';
  ctx.textBaseline = 'middle';
  ctx.fillText(echoName, PAD, y + 11);

  if (harmonyDisplay) {
    const nameW = ctx.measureText(echoName).width;
    ctx.font    = `600 11px ${SANS}`;
    const chipTextW = ctx.measureText(harmonyDisplay).width;
    const chipPadX  = 8;
    const chipW     = chipTextW + chipPadX * 2;
    const chipH     = 18;
    const chipX     = PAD + nameW + 6;
    const chipY     = y + 2;
    ctx.fillStyle   = '#eef9ff';
    rrect(ctx, chipX, chipY, chipW, chipH, 9);
    ctx.fill();
    ctx.fillStyle    = '#0275fd';
    ctx.textBaseline = 'middle';
    ctx.fillText(harmonyDisplay, chipX + chipPadX, chipY + chipH / 2);
  }
  y += 22 + 4;

  // Row 3: mainstat label + value + "+25" right
  ctx.font         = `11px ${SANS}`;
  ctx.fillStyle    = '#6b7280';
  ctx.textBaseline = 'middle';
  ctx.textAlign    = 'left';
  ctx.fillText(mainLabel, PAD, y + 8);
  const mlW = ctx.measureText(mainLabel).width;

  ctx.font      = `bold 11px ${SANS}`;
  ctx.fillStyle = costColor;
  ctx.fillText(`${echo.mainstat.value}${echo.mainstat.unit}`, PAD + mlW + 4, y + 8);

  ctx.font      = `10px ${MONO}`;
  ctx.fillStyle = '#9ca3af';
  ctx.textAlign = 'right';
  ctx.fillText('+25', W - PAD, y + 8);
  ctx.textAlign = 'left';
  y += 16;

  y += GAP;

  // ── Score block ─────────────────────────────────────────────────────────
  const sbX = PAD;
  const sbW = W - PAD * 2;

  ctx.fillStyle   = `${rankColor}0e`;
  rrect(ctx, sbX, y, sbW, SCORE_H, 12);
  ctx.fill();
  ctx.strokeStyle = `${rankColor}33`;
  ctx.lineWidth   = 1;
  rrect(ctx, sbX, y, sbW, SCORE_H, 12);
  ctx.stroke();

  // Rank letter (centered vertically in score block)
  const rankFontSize = score.rank.length <= 2 ? 44 : 28;
  ctx.font         = `bold ${rankFontSize}px ${SANS}`;
  ctx.fillStyle    = rankColor;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(score.rank, sbX + 33, y + SCORE_H / 2);
  ctx.textAlign    = 'left';

  // Score text + bar + bonuses (right column)
  const scX    = sbX + 60;
  const scMaxW = sbW - 60 - 14;
  let sy = y + 12;

  ctx.font         = `12px ${SANS}`;
  ctx.fillStyle    = '#6b7280';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(
    locale === 'ja' ? `スコア ${score.score} / 100` : `Score ${score.score} / 100`,
    scX, sy + 12,
  );
  sy += 12 + 6;

  // Bar
  ctx.fillStyle = '#e5e7eb';
  rrect(ctx, scX, sy, scMaxW, 6, 3);
  ctx.fill();
  ctx.fillStyle = rankColor;
  rrect(ctx, scX, sy, scMaxW * Math.min(score.score / 100, 1), 6, 3);
  ctx.fill();
  sy += 6;

  // Bonus text
  if (hasBonusLine) {
    sy += 5;
    let bx = scX;
    if (score.mainstatBonus !== undefined && score.mainstatBonus !== 0) {
      const txt = `${locale === 'ja' ? 'メイン' : 'Main'} ${score.mainstatBonus > 0 ? '+' : ''}${score.mainstatBonus}`;
      ctx.font         = `10px ${SANS}`;
      ctx.fillStyle    = '#ef4444';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(txt, bx, sy + 10);
      bx += ctx.measureText(txt).width + 10;
    }
    if (score.setBonus !== undefined && score.setBonus !== 0) {
      const txt = `${locale === 'ja' ? 'セット' : 'Set'} ${score.setBonus > 0 ? '+' : ''}${score.setBonus}`;
      ctx.font         = `10px ${SANS}`;
      ctx.fillStyle    = '#f97316';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(txt, bx, sy + 10);
    }
  }

  y += SCORE_H + GAP;

  // ── Substats ────────────────────────────────────────────────────────────
  for (let i = 0; i < echo.substats.length; i++) {
    const sub    = echo.substats[i];
    const label  = locale === 'en' ? (SUBSTAT_LABEL_EN[sub.key] ?? sub.label) : sub.label;
    const cat    = score.breakdown.find(b => b.key === sub.key)?.category;
    const sColor = substatColor(sub.tier, cat);
    const pct    = Math.round((sub.value / sub.maxValue) * 100);
    const hasBg  = cat !== 'unnecessary' && cat !== undefined;
    const rowY   = y + i * (SUB_ROW_H + SUB_GAP);

    if (hasBg) {
      ctx.fillStyle = `${sColor}0a`;
      rrect(ctx, PAD, rowY, W - PAD * 2, SUB_ROW_H, 8);
      ctx.fill();
    }

    // Left border
    ctx.fillStyle = sColor;
    ctx.fillRect(PAD, rowY, 2, SUB_ROW_H);

    // Index
    ctx.font         = `10px ${MONO}`;
    ctx.fillStyle    = '#9ca3af';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(i + 1), PAD + 13, rowY + SUB_ROW_H / 2);
    ctx.textAlign = 'left';

    // Value + bar widths
    const valW   = 44;
    const barW   = 44;
    const labelX = PAD + 26;
    const barX2  = W - PAD - valW - 8 - barW;
    const maxLabelW = barX2 - labelX - 6;

    // Label (clip with ellipsis if too long)
    ctx.font      = `500 11px ${SANS}`;
    ctx.fillStyle = '#1f2937';
    ctx.textBaseline = 'middle';
    let lbl = label;
    while (ctx.measureText(lbl).width > maxLabelW && lbl.length > 1) {
      lbl = lbl.slice(0, -1);
    }
    if (lbl !== label) lbl = lbl.slice(0, -1) + '…';
    ctx.fillText(lbl, labelX, rowY + SUB_ROW_H / 2);

    // Bar
    const barY2 = rowY + SUB_ROW_H / 2 - 2;
    ctx.fillStyle = '#e5e7eb';
    rrect(ctx, barX2, barY2, barW, 4, 2);
    ctx.fill();
    ctx.fillStyle = sColor;
    rrect(ctx, barX2, barY2, barW * pct / 100, 4, 2);
    ctx.fill();

    // Value
    ctx.font         = `bold 11px ${MONO}`;
    ctx.fillStyle    = sColor;
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${sub.value}${sub.unit}`, W - PAD, rowY + SUB_ROW_H / 2);
    ctx.textAlign = 'left';
  }

  y += SUBS_H + GAP;

  // ── Footer ──────────────────────────────────────────────────────────────
  ctx.strokeStyle = '#f3f4f6';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(PAD,     y);
  ctx.lineTo(W - PAD, y);
  ctx.stroke();
  y += 9;

  if (maxedAt) {
    ctx.font         = `10px ${MONO}`;
    ctx.fillStyle    = '#9ca3af';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(`+25: ${formatDate(maxedAt)}`, PAD, y + 11);
  }

  ctx.font      = `10px ${MONO}`;
  ctx.fillStyle = '#d1d5db';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('wuwaechosimu.xyzack271.com', W - PAD, y + 11);
  ctx.textAlign = 'left';

  return canvas;
}
