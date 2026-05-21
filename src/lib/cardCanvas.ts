'use client';

import type { EchoState, ScoreResult } from '@/types/echo';
import { RANK_COLORS } from '@/lib/scorer';
import { SUBSTAT_LABEL_EN, MAINSTAT_LABEL_EN } from '@/data/translations';
import { HARMONY_SETS_EN, getHarmonyBadgeColor } from '@/data/echoes';

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

// Rounded rectangle path helper
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

// Layout constants
const CARD_W  = 320;
const PAD     = 16;
const GAP     = 12;
const MARGIN  = 20;   // outer margin around card for shadow
const STRIPE  = 3;
const RADIUS  = 16;
const SANS    = 'Inter, "Noto Sans JP", -apple-system, BlinkMacSystemFont, sans-serif';
const MONO    = '"IBM Plex Mono", ui-monospace, "Courier New", monospace';
const SUB_ROW_H = 42;   // two-line layout: label line + bar+value line

export function renderCardToCanvas(
  echo: EchoState,
  score: ScoreResult,
  locale: 'ja' | 'en',
  maxedAt?: number,
): HTMLCanvasElement {
  const rankColor = RANK_COLORS[score.rank];
  const costColor = COST_COLOR[echo.cost] ?? '#9ca3af';
  const echoName  = locale === 'en' ? (echo.echoNameEn ?? echo.echoName) : echo.echoName;
  const mainLabel = locale === 'en'
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

  // Card content height
  const HEADER_H  = 14 + 4 + 22 + 4 + 16;   // cost + name + mainstat rows
  const SCORE_H   = hasBonusLine ? 74 : 62;
  const SUB_GAP   = 4;
  const SUBS_H    = echo.substats.length * (SUB_ROW_H + SUB_GAP) - SUB_GAP;
  const FOOTER_H  = 1 + 8 + 14;
  const CARD_H    = STRIPE + PAD + HEADER_H + GAP + SCORE_H + GAP + SUBS_H + GAP + FOOTER_H + PAD;

  const CANVAS_W = CARD_W + MARGIN * 2;
  const CANVAS_H = CARD_H + MARGIN * 2;
  const SCALE    = 2;

  const canvas = document.createElement('canvas');
  canvas.width  = CANVAS_W * SCALE;
  canvas.height = CANVAS_H * SCALE;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(SCALE, SCALE);

  // Card origin within canvas
  const OX = MARGIN;
  const OY = MARGIN;

  // ── Outer background (gradient, like the website) ──────────────────────
  const bg = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
  bg.addColorStop(0, '#f0f7ff');
  bg.addColorStop(1, '#fafbff');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // ── Card shadow ─────────────────────────────────────────────────────────
  ctx.save();
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;
  ctx.shadowBlur    = 24;
  ctx.shadowColor   = `${rankColor}20`;
  ctx.fillStyle     = '#ffffff';
  rrect(ctx, OX, OY, CARD_W, CARD_H, RADIUS);
  ctx.fill();

  // Second shadow pass for depth
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur    = 8;
  ctx.shadowColor   = 'rgba(0,0,0,0.07)';
  ctx.fill();
  ctx.restore();

  // ── Card border ─────────────────────────────────────────────────────────
  ctx.strokeStyle = `${rankColor}55`;
  ctx.lineWidth   = 1;
  rrect(ctx, OX + 0.5, OY + 0.5, CARD_W - 1, CARD_H - 1, RADIUS - 0.5);
  ctx.stroke();

  // ── Clip all card content to rounded rect ───────────────────────────────
  ctx.save();
  rrect(ctx, OX, OY, CARD_W, CARD_H, RADIUS);
  ctx.clip();

  // ── Top stripe (clipped to card) ────────────────────────────────────────
  ctx.fillStyle = rankColor;
  ctx.fillRect(OX, OY, CARD_W, STRIPE);

  // ── Content starts below stripe ─────────────────────────────────────────
  let y = OY + STRIPE + PAD;

  // ── Echo header ─────────────────────────────────────────────────────────

  // Row 1: "COST X · 音骸"
  ctx.font         = `bold 10px ${MONO}`;
  ctx.fillStyle    = costColor;
  ctx.textBaseline = 'middle';
  ctx.textAlign    = 'left';
  ctx.fillText(`COST ${echo.cost}`, OX + PAD, y + 7);
  const costLabelW = ctx.measureText(`COST ${echo.cost}`).width;
  ctx.font      = `10px ${MONO}`;
  ctx.fillStyle = '#9ca3af';
  ctx.fillText(` · ${echoTypeLabel}`, OX + PAD + costLabelW, y + 7);
  y += 14 + 4;

  // Row 2: echo name + optional harmony chip
  ctx.font         = `bold 14px ${SANS}`;
  ctx.fillStyle    = '#111827';
  ctx.textBaseline = 'middle';
  ctx.fillText(echoName, OX + PAD, y + 11);

  if (harmonyDisplay && echo.activeHarmonySet) {
    const { bg: chipBg, text: chipText } = getHarmonyBadgeColor(echo.activeHarmonySet);
    const nameW     = ctx.measureText(echoName).width;
    ctx.font        = `600 11px ${SANS}`;
    const chipTextW = ctx.measureText(harmonyDisplay).width;
    const chipPadX  = 8;
    const chipW     = chipTextW + chipPadX * 2;
    const chipH     = 18;
    const chipX     = OX + PAD + nameW + 6;
    const chipY     = y + 2;
    ctx.fillStyle   = chipBg;
    rrect(ctx, chipX, chipY, chipW, chipH, 9);
    ctx.fill();
    ctx.fillStyle    = chipText;
    ctx.textBaseline = 'middle';
    ctx.fillText(harmonyDisplay, chipX + chipPadX, chipY + chipH / 2);
  }
  y += 22 + 4;

  // Row 3: mainstat label + value + "+25" right
  ctx.font         = `11px ${SANS}`;
  ctx.fillStyle    = '#6b7280';
  ctx.textBaseline = 'middle';
  ctx.textAlign    = 'left';
  ctx.fillText(mainLabel, OX + PAD, y + 8);
  const mlW = ctx.measureText(mainLabel).width;

  ctx.font      = `bold 11px ${SANS}`;
  ctx.fillStyle = costColor;
  ctx.fillText(`${echo.mainstat.value}${echo.mainstat.unit}`, OX + PAD + mlW + 4, y + 8);

  ctx.font      = `10px ${MONO}`;
  ctx.fillStyle = '#9ca3af';
  ctx.textAlign = 'right';
  ctx.fillText('+25', OX + CARD_W - PAD, y + 8);
  ctx.textAlign = 'left';
  y += 16;

  y += GAP;

  // ── Score block ─────────────────────────────────────────────────────────
  const sbX = OX + PAD;
  const sbW = CARD_W - PAD * 2;

  ctx.fillStyle = `${rankColor}0e`;
  rrect(ctx, sbX, y, sbW, SCORE_H, 12);
  ctx.fill();
  ctx.strokeStyle = `${rankColor}33`;
  ctx.lineWidth   = 1;
  rrect(ctx, sbX + 0.5, y + 0.5, sbW - 1, SCORE_H - 1, 11.5);
  ctx.stroke();

  // Rank letter
  const rankFontSize = score.rank.length <= 2 ? 44 : 28;
  ctx.font         = `bold ${rankFontSize}px ${SANS}`;
  ctx.fillStyle    = rankColor;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(score.rank, sbX + 33, y + SCORE_H / 2);
  ctx.textAlign = 'left';

  // Score text + bar
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

  ctx.fillStyle = '#e5e7eb';
  rrect(ctx, scX, sy, scMaxW, 6, 3);
  ctx.fill();
  ctx.fillStyle = rankColor;
  rrect(ctx, scX, sy, scMaxW * Math.min(score.score / 100, 1), 6, 3);
  ctx.fill();
  sy += 6;

  // Bonus texts
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

  // ── Substats (two-line: label / bar + value) ────────────────────────────
  for (let i = 0; i < echo.substats.length; i++) {
    const sub    = echo.substats[i];
    const label  = locale === 'en' ? (SUBSTAT_LABEL_EN[sub.key] ?? sub.label) : sub.label;
    const cat    = score.breakdown.find(b => b.key === sub.key)?.category;
    const sColor = substatColor(sub.tier, cat);
    const pct    = Math.round((sub.value / sub.maxValue) * 100);
    const hasBg  = cat !== 'unnecessary' && cat !== undefined;
    const rowY   = y + i * (SUB_ROW_H + SUB_GAP);

    // Background tint
    if (hasBg) {
      ctx.fillStyle = `${sColor}0a`;
      rrect(ctx, OX + PAD, rowY, CARD_W - PAD * 2, SUB_ROW_H, 8);
      ctx.fill();
    }

    // Left border accent (3px, full row height)
    ctx.fillStyle = sColor;
    ctx.fillRect(OX + PAD, rowY, 3, SUB_ROW_H);

    // Index number (vertically centered)
    ctx.font         = `10px ${MONO}`;
    ctx.fillStyle    = '#9ca3af';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(i + 1), OX + PAD + 14, rowY + SUB_ROW_H / 2);
    ctx.textAlign = 'left';

    const contentX = OX + PAD + 28;  // content area starts after index

    // ── Line 1: label ───────────────────────────────────────────────────────
    ctx.font         = `500 13px ${SANS}`;
    ctx.fillStyle    = '#222222';
    ctx.textBaseline = 'top';
    ctx.fillText(label, contentX, rowY + 7);

    // ── Line 2: full-width bar (flex-1) + value right-aligned ───────────────
    const barY      = rowY + 27;   // top of bar  (7 label-top + 13 text + 7 gap)
    const barH      = 4;
    const valReserve = 52;         // px reserved for value text + gap
    const barTrackW = (OX + CARD_W - PAD - valReserve) - contentX;

    // Bar track
    ctx.fillStyle = '#e5e7eb';
    rrect(ctx, contentX, barY, barTrackW, barH, 2);
    ctx.fill();

    // Bar fill
    ctx.fillStyle = sColor;
    rrect(ctx, contentX, barY, barTrackW * Math.min(pct / 100, 1), barH, 2);
    ctx.fill();

    // Value (right edge, vertically centred on bar)
    ctx.font         = `bold 13px ${MONO}`;
    ctx.fillStyle    = sColor;
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${sub.value}${sub.unit}`, OX + CARD_W - PAD, barY + barH / 2);
    ctx.textAlign = 'left';
  }

  y += SUBS_H + GAP;

  // ── Footer ──────────────────────────────────────────────────────────────
  ctx.strokeStyle = '#f3f4f6';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(OX + PAD,          y);
  ctx.lineTo(OX + CARD_W - PAD, y);
  ctx.stroke();
  y += 9;

  if (maxedAt) {
    ctx.font         = `10px ${MONO}`;
    ctx.fillStyle    = '#9ca3af';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(`+25: ${formatDate(maxedAt)}`, OX + PAD, y + 11);
  }

  ctx.font      = `10px ${MONO}`;
  ctx.fillStyle = '#d1d5db';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('wuwaechosimu.xyzack271.com', OX + CARD_W - PAD, y + 11);
  ctx.textAlign = 'left';

  ctx.restore(); // end card clip

  return canvas;
}
