'use client';

import type { CharacterBuild } from '@/types/character';
import type { EchoState, ScoreRank, ScoreResult, Substat } from '@/types/echo';
import type { Locale } from '@/lib/locale-utils';
import { formatPct } from '@/lib/distribution';
import { getSubstatCategory, RANK_COLORS } from '@/lib/scorer';
import { MAINSTAT_LABEL_EN, SUBSTAT_LABEL_EN } from '@/data/translations';

export interface ResultCardImageOptions {
  source: 'supporter' | 'gacha';
  maxedAt?: number;
  charName?: string;
  build?: CharacterBuild;
}

/* ── 画面の 3D カード(src/components/home/ResultCard.tsx の表面)と揃える定数 ── */

const RARITY_DOTS: Record<ScoreRank, number> = {
  GOD: 6,
  'S+': 5,
  S: 4,
  A: 3,
  B: 2,
  C: 1,
  D: 0,
};

// ResultCard の FOIL_BG の色。虹色の斜めグラデーションとして薄く重ねる
const FOIL_STOPS: [number, string][] = [
  [0.22, 'rgba(255,255,255,0)'],
  [0.36, 'rgba(255,120,180,0.12)'],
  [0.44, 'rgba(255,230,120,0.15)'],
  [0.52, 'rgba(120,255,200,0.13)'],
  [0.60, 'rgba(120,170,255,0.15)'],
  [0.68, 'rgba(200,130,255,0.11)'],
  [0.80, 'rgba(255,255,255,0)'],
];

/* ── 固定色(ライト/ダークや data-element に関係なく使う) ── */

const BG          = '#101318';
const CARD_BG     = '#1A1F28';
const INK         = '#ECEFF3';
const SUB_INK     = '#A3ADBA';
const DIM_INK     = '#7D8794';
const DIVIDER     = '#262C37';
const PIP_DIM     = '#5A6372';
const PIP_OFF     = '#2C333F';
const HASHTAG_INK = '#5A6372';
const SITE_NAME   = 'wuwaechotools.com';
const SIM_BG      = '#F59E0B';
const SIM_INK     = '#11141A';

/* ── 寸法(論理 540 × 675 を scale 2 で書き出す) ── */

const CANVAS_W = 540;
const CANVAS_H = 675;
const SCALE    = 2;

const BAND_H      = 64;
const BAND_PAD_X  = 32;
const CARD_X      = 32;
const CARD_Y      = 64;
const CARD_W      = 476;
const CARD_H      = 560;
const CARD_R      = 18;
const CARD_PAD_X  = 22;
const STRIPE      = 3;
const ROW_H       = 44;
const ROW_COUNT   = 5;
const ROWS_H      = ROW_H * ROW_COUNT;
const CARD_BAND_H = 48;

// カード内の縦の並び(先頭からの論理 px)
const HEAD_PAD_T   = 24;
const NAME_ROW_H   = 26;
const NAME_MAIN_GAP = 3;
const MAIN_ROW_H   = 20;
const SCORE_PAD_T  = 28;
const SCORE_H      = 104;
const SCORE_PAD_B  = 28;

// サブステ 1 行(ResultCard の .rc-row を 1.4 倍した目安)
const ROW_LABEL_W = 42;
const ROW_PIP_W   = 90;
const ROW_GAP     = 11;
const PIP_H       = 11;
const PIP_GAP     = 3;

const SANS_FALLBACK = '"Noto Sans JP", "Hiragino Sans", sans-serif';
const NUM_FALLBACK  = '"Chakra Petch", monospace';

/* ── 小さな描画ヘルパー ── */

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

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 0 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1);
  return `${t}…`;
}

/** 収まらないときは文字を小さくし、それでもダメなら末尾を「…」で切る */
function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  baseSize: number,
  makeFont: (size: number) => string,
): { size: number; text: string } {
  const minSize = Math.max(9, Math.round(baseSize * 0.72));
  for (let size = baseSize; size > minSize; size -= 1) {
    ctx.font = makeFont(size);
    if (ctx.measureText(text).width <= maxWidth) return { size, text };
  }
  ctx.font = makeFont(minSize);
  return { size: minSize, text: fitText(ctx, text, maxWidth) };
}

function drawTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
  align: 'left' | 'center' | 'right',
): number {
  const chars = Array.from(text);
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * Math.max(0, chars.length - 1);
  let cx = align === 'left' ? x : align === 'center' ? x - total / 2 : x - total;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], cx, y);
    cx += widths[i] + tracking;
  }
  return total;
}

function mainValueText(mainstat: EchoState['mainstat']): string {
  return mainstat.unit === '%'
    ? `${mainstat.value.toFixed(1)}${mainstat.unit}`
    : `${mainstat.value}${mainstat.unit}`;
}

function formatDate(ts: number, ja: boolean): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  const sep = ja ? '/' : '-';
  return `${d.getFullYear()}${sep}${p(d.getMonth() + 1)}${sep}${p(d.getDate())}`;
}

/**
 * canvas の ctx.font には CSS 変数が使えないため、next/font が付けた実名を
 * computed style から読む。読めない環境ではフォールバックのまま扱う。
 */
export function resolveCanvasFonts(): { sans: string; num: string } {
  let sans = SANS_FALLBACK;
  let num  = NUM_FALLBACK;
  try {
    const styles = getComputedStyle(document.documentElement);
    const body = styles.getPropertyValue('--font-home-body').trim();
    const numFont = styles.getPropertyValue('--font-home-num').trim();
    if (body) sans = body;
    if (numFont) num = numFont;
  } catch {
    // document が無い環境ではフォールバックのまま
  }
  return { sans, num };
}

export function renderCardToCanvas(
  echo: EchoState,
  score: ScoreResult,
  locale: Locale,
  opts: ResultCardImageOptions,
): HTMLCanvasElement {
  const ja = locale === 'ja';
  const { source, maxedAt, charName, build } = opts;
  const { sans, num } = resolveCanvasFonts();

  const rankColor = RANK_COLORS[score.rank];
  const echoName  = ja ? echo.echoName : (echo.echoNameEn ?? echo.echoName);
  const mainLabel = ja
    ? echo.mainstat.label
    : (MAINSTAT_LABEL_EN[echo.mainstat.key] ?? echo.mainstat.label);
  const toolName = source === 'gacha'
    ? (ja ? 'ガチャシミュレーター' : 'Gacha Simulator')
    : (ja ? '厳選サポーター' : 'Selection Supporter');

  const canvas = document.createElement('canvas');
  canvas.width  = CANVAS_W * SCALE;
  canvas.height = CANVAS_H * SCALE;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(SCALE, SCALE);
  ctx.textBaseline = 'middle';

  /* ── 背景 ── */
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const cardCX = CARD_X + CARD_W / 2;
  const cardCY = CARD_Y + CARD_H / 2;
  const glow = ctx.createRadialGradient(cardCX, cardCY, 0, cardCX, cardCY, 360);
  glow.addColorStop(0, hexToRgba(rankColor, 0x26 / 255));
  glow.addColorStop(1, hexToRgba(rankColor, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  /* ── 上の帯 ── */
  const bandMidY = BAND_H / 2;
  ctx.fillStyle = rankColor;
  ctx.fillRect(BAND_PAD_X, bandMidY - 9, 4, 18);

  let bandX = BAND_PAD_X + 4 + 10;
  ctx.textAlign = 'left';
  ctx.fillStyle = INK;
  const tool = fitFont(ctx, toolName, 220, 17, (s) => `700 ${s}px ${sans}`);
  ctx.fillText(tool.text, bandX, bandMidY);
  bandX += ctx.measureText(tool.text).width;

  if (source === 'gacha') {
    bandX += 10;
    ctx.font = `700 11px ${num}`;
    const tracking = 2.2; // letter-spacing 0.2em
    const labelW = Array.from('SIMULATION').reduce((w, ch) => w + ctx.measureText(ch).width, 0)
      + tracking * 'SIMULATION'.length;
    const simW = labelW + 20;
    const simH = 22;
    const simX = bandX;
    const simY = bandMidY - simH / 2;
    const shear = simH * Math.tan((14 * Math.PI) / 180);
    ctx.fillStyle = SIM_BG;
    ctx.beginPath();
    ctx.moveTo(simX, simY);
    ctx.lineTo(simX + simW, simY);
    ctx.lineTo(simX + simW - shear, simY + simH);
    ctx.lineTo(simX - shear, simY + simH);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = SIM_INK;
    drawTracked(ctx, 'SIMULATION', simX + 10, bandMidY, tracking, 'left');
    bandX += simW;
  }

  ctx.font = `600 13px ${num}`;
  ctx.fillStyle = SUB_INK;
  ctx.textAlign = 'right';
  ctx.fillText(SITE_NAME, CANVAS_W - BAND_PAD_X, bandMidY);
  ctx.textAlign = 'left';

  /* ── カード ── */
  ctx.save();
  rrect(ctx, CARD_X, CARD_Y, CARD_W, CARD_H, CARD_R);
  ctx.clip();

  ctx.fillStyle = CARD_BG;
  ctx.fillRect(CARD_X, CARD_Y, CARD_W, CARD_H);

  // 上辺のランク色の帯
  ctx.fillStyle = rankColor;
  ctx.fillRect(CARD_X, CARD_Y, CARD_W, STRIPE);

  // 斜めのグラデーション(GOD / S+ / S は虹色、それ以外はランク色)
  const foil = score.rank === 'GOD' || score.rank === 'S+' || score.rank === 'S';
  const ang  = (115 * Math.PI) / 180;
  const gx   = Math.sin(ang);
  const gy   = -Math.cos(ang);
  const corners = [
    [CARD_X, CARD_Y],
    [CARD_X + CARD_W, CARD_Y],
    [CARD_X, CARD_Y + CARD_H],
    [CARD_X + CARD_W, CARD_Y + CARD_H],
  ];
  const projs = corners.map(([px, py]) => px * gx + py * gy);
  const pMin  = Math.min(...projs);
  const pMax  = Math.max(...projs);
  const sheen = ctx.createLinearGradient(
    pMin * gx, pMin * gy,
    pMax * gx, pMax * gy,
  );
  if (foil) {
    for (const [stop, color] of FOIL_STOPS) sheen.addColorStop(stop, color);
  } else {
    sheen.addColorStop(0.32, 'rgba(255,255,255,0)');
    sheen.addColorStop(0.44, 'rgba(255,255,255,0.10)');
    sheen.addColorStop(0.50, hexToRgba(rankColor, 0.25));
    sheen.addColorStop(0.56, 'rgba(255,255,255,0.08)');
    sheen.addColorStop(0.68, 'rgba(255,255,255,0)');
  }
  ctx.fillStyle = sheen;
  ctx.fillRect(CARD_X, CARD_Y, CARD_W, CARD_H);

  /* ヘッダー */
  let cy = CARD_Y + STRIPE + HEAD_PAD_T;
  const nameRowMid = cy + NAME_ROW_H / 2;
  const nameMax = charName ? CARD_W - CARD_PAD_X * 2 - 120 : CARD_W - CARD_PAD_X * 2;
  const nameFit = fitFont(ctx, echoName, nameMax, 21, (s) => `700 ${s}px ${sans}`);
  ctx.fillStyle = INK;
  ctx.fillText(nameFit.text, CARD_X + CARD_PAD_X, nameRowMid);

  if (charName) {
    const charFit = fitFont(ctx, charName, 110, 15, (s) => `700 ${s}px ${sans}`);
    ctx.fillStyle = INK;
    ctx.textAlign = 'right';
    ctx.fillText(charFit.text, CARD_X + CARD_W - CARD_PAD_X, nameRowMid);
    ctx.textAlign = 'left';
  }
  cy += NAME_ROW_H + NAME_MAIN_GAP;

  const mainRowMid = cy + MAIN_ROW_H / 2;
  ctx.font = `14px ${sans}`;
  ctx.fillStyle = SUB_INK;
  const mainPrefix = ja
    ? `COST ${echo.cost} ・ メイン ${mainLabel} `
    : `COST ${echo.cost} · Main ${mainLabel} `;
  ctx.fillText(mainPrefix, CARD_X + CARD_PAD_X, mainRowMid);
  const prefixW = ctx.measureText(mainPrefix).width;
  const valueText = mainValueText(echo.mainstat);
  ctx.font = `14px ${num}`;
  ctx.fillStyle = INK;
  ctx.fillText(valueText, CARD_X + CARD_PAD_X + prefixW, mainRowMid);
  cy += MAIN_ROW_H + SCORE_PAD_T;

  /* スコア */
  const scoreTop = cy;
  ctx.font = `700 104px ${num}`;
  const rankW = ctx.measureText(score.rank).width;
  ctx.save();
  ctx.shadowColor  = hexToRgba(rankColor, 0.5);
  ctx.shadowBlur   = 36 * SCALE;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = rankColor;
  ctx.fillText(score.rank, CARD_X + CARD_PAD_X, scoreTop + SCORE_H / 2);
  ctx.restore();
  ctx.font = `700 104px ${num}`;
  const colX  = CARD_X + CARD_PAD_X + rankW + 22;

  const topPct = score.topPercentile;
  const pctLabel = topPct !== undefined ? formatPct(topPct) : '';
  const pillText = topPct === undefined
    ? ''
    : charName
      ? (ja ? `${charName} の中で上位 ${pctLabel}%` : `Top ${pctLabel}% for ${charName}`)
      : (ja ? `上位 ${pctLabel}%` : `Top ${pctLabel}%`);

  const pillH = 26;
  const colH  = pillText ? 48 + 8 + pillH : 48;
  const colTop = scoreTop + (SCORE_H - colH) / 2;

  const scoreY = colTop + 40;
  ctx.font = `700 48px ${num}`;
  ctx.fillStyle = INK;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(String(score.score), colX, scoreY);
  const scoreW = ctx.measureText(String(score.score)).width;
  ctx.font = `20px ${num}`;
  ctx.fillStyle = SUB_INK;
  ctx.fillText(' / 100', colX + scoreW, scoreY);
  ctx.textBaseline = 'middle';

  if (pillText) {
    const pillY = colTop + 48 + 8;
    ctx.font = `700 15px ${sans}`;
    const pillFit = fitText(ctx, pillText, CARD_W - CARD_PAD_X - colX - 8);
    const pillW = ctx.measureText(pillFit).width + 24;
    ctx.fillStyle = hexToRgba(rankColor, 0x22 / 255);
    rrect(ctx, colX, pillY, pillW, pillH, 14);
    ctx.fill();
    ctx.fillStyle = rankColor;
    ctx.fillText(pillFit, colX + 12, pillY + pillH / 2);
  }
  cy = scoreTop + SCORE_H + SCORE_PAD_B;

  /* サブステ */
  const bandTop = CARD_Y + CARD_H - CARD_BAND_H;
  const rowsTop = cy + Math.floor((bandTop - cy - ROWS_H) / 2);
  const rowRight = CARD_X + CARD_W - CARD_PAD_X;
  const pipsX = rowRight - ROW_PIP_W;
  const valueRight = pipsX - ROW_GAP;
  const nameX = CARD_X + CARD_PAD_X + ROW_LABEL_W + ROW_GAP;

  for (let i = 0; i < ROW_COUNT; i++) {
    const sub: Substat | undefined = echo.substats[i];
    const rowY = rowsTop + i * ROW_H;
    const rowMid = rowY + ROW_H / 2;

    if (i > 0) {
      ctx.strokeStyle = DIVIDER;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(CARD_X + CARD_PAD_X, rowY + 0.5);
      ctx.lineTo(rowRight, rowY + 0.5);
      ctx.stroke();
    }
    if (!sub) continue;

    const cat = getSubstatCategory(sub.key, build);
    const hot = cat === 'recommended' || cat === 'preferred';
    const ink = hot ? INK : DIM_INK;
    const pipOn = hot ? rankColor : PIP_DIM;

    ctx.font = `15px ${num}`;
    ctx.fillStyle = SUB_INK;
    ctx.fillText(`+${(i + 1) * 5}`, CARD_X + CARD_PAD_X, rowMid);

    ctx.font = `700 21px ${num}`;
    const valueStr = `${sub.value}${sub.unit}`;
    ctx.fillStyle = ink;
    ctx.textAlign = 'right';
    ctx.fillText(valueStr, valueRight, rowMid);
    ctx.textAlign = 'left';

    const label = ja ? sub.label : (SUBSTAT_LABEL_EN[sub.key] ?? sub.label);
    const nameFit = fitFont(ctx, label, valueRight - ROW_GAP - nameX, 18, (s) => `${s}px ${sans}`);
    ctx.fillStyle = ink;
    ctx.fillText(nameFit.text, nameX, rowMid);

    const pipW = (ROW_PIP_W - PIP_GAP * 7) / 8;
    for (let k = 0; k < 8; k++) {
      ctx.fillStyle = k <= sub.tier ? pipOn : PIP_OFF;
      rrect(ctx, pipsX + k * (pipW + PIP_GAP), rowMid - PIP_H / 2, pipW, PIP_H, 3);
      ctx.fill();
    }
  }

  /* カード下の帯 */
  ctx.strokeStyle = DIVIDER;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(CARD_X + CARD_PAD_X, bandTop + 0.5);
  ctx.lineTo(rowRight, bandTop + 0.5);
  ctx.stroke();

  const bandContentMid = bandTop + CARD_BAND_H / 2;
  ctx.font = `16px ${num}`;
  ctx.fillStyle = rankColor;
  drawTracked(ctx, '◆'.repeat(RARITY_DOTS[score.rank]), CARD_X + CARD_PAD_X, bandContentMid, 3, 'left');

  if (maxedAt) {
    ctx.font = `13px ${num}`;
    ctx.fillStyle = SUB_INK;
    ctx.textAlign = 'right';
    ctx.fillText(`+25: ${formatDate(maxedAt, ja)}`, rowRight, bandContentMid);
    ctx.textAlign = 'left';
  }

  ctx.restore(); // カードのクリップ終わり

  // 外周 1px
  ctx.strokeStyle = hexToRgba(rankColor, 0x55 / 255);
  ctx.lineWidth = 1;
  rrect(ctx, CARD_X + 0.5, CARD_Y + 0.5, CARD_W - 1, CARD_H - 1, CARD_R - 0.5);
  ctx.stroke();

  /* ── 下の余白 ── */
  ctx.font = `12px ${num}`;
  ctx.fillStyle = HASHTAG_INK;
  ctx.textAlign = 'center';
  ctx.fillText('#WuWaEchoTools', CANVAS_W / 2, CARD_Y + CARD_H + (CANVAS_H - CARD_Y - CARD_H) / 2);
  ctx.textAlign = 'left';

  return canvas;
}
