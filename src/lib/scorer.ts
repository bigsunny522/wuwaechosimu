import type { EchoState, EchoCost, ScoreResult, ScoreRank, SubstatKey, SubstatCategory } from '@/types/echo';
import type { CharacterBuild } from '@/types/character';
import { SUBSTAT_COUNT } from '@/data/mainstats';

// ═══════════════════════════════════════════════════════════════════════════
//  カテゴリ固定倍率
// ═══════════════════════════════════════════════════════════════════════════
export const MULT: Record<SubstatCategory, number> = {
  recommended: 2.0,
  preferred:   1.6,
  acceptable:  0.8,  // 妥協は少しだけ評価する
  unnecessary: 0.1,  // 不要はほぼ評価しない
};

// ═══════════════════════════════════════════════════════════════════════════
//  汎用モード：サブステのデフォルトカテゴリ分類
// ═══════════════════════════════════════════════════════════════════════════
const GENERIC_RECOMMENDED = new Set<SubstatKey>(['critRate', 'critDmg']);
const GENERIC_PREFERRED   = new Set<SubstatKey>(['atkPercent', 'resonanceSkillDmg', 'heavyAttackDmg', 'basicAttackDmg', 'resonanceLibDmg']);
const GENERIC_ACCEPTABLE  = new Set<SubstatKey>(['energyRegen', 'hpPercent', 'defPercent']);

// ═══════════════════════════════════════════════════════════════════════════
//  正規化：(Tier + 5) / 12
//  Tier0 → 0.417、Tier7（最高） → 1.000
// ═══════════════════════════════════════════════════════════════════════════
export function normalizedTier(tier: number): number {
  return (tier + 6) / 12;
}

// ═══════════════════════════════════════════════════════════════════════════
//  理論最大値
//  「推奨3枠＋優先2枠 を Tier5 で埋めた = 100点（上限）」を基準とする。
//  サブステ数はコストによらず常に 5 枠。
//  加重平均倍率 IDEAL_MULT = (3×rec + 2×pref) / 5
//
//  IDEAL_MULT = (3×2.0 + 2×1.6) / 5 = 9.2/5 = 1.84
//  全コスト共通: 5 × normTier(5) × 1.84 ≈ 8.43
// ═══════════════════════════════════════════════════════════════════════════
export const REFERENCE_TIER = 5;

// 理想構成（推奨3・優先2）の加重平均倍率
export const IDEAL_MULT = (3 * MULT.recommended + 2 * MULT.preferred) / 5;

function calcTheoreticalMax(cost: EchoCost): number {
  return SUBSTAT_COUNT[cost] * normalizedTier(REFERENCE_TIER) * IDEAL_MULT;
}

// ═══════════════════════════════════════════════════════════════════════════
//  ランク変換
// ═══════════════════════════════════════════════════════════════════════════
function toRank(score: number): ScoreRank {
  if (score >= 90) return 'S+';
  if (score >= 75) return 'S';
  if (score >= 58) return 'A';
  if (score >= 42) return 'B';
  if (score >= 25) return 'C';
  return 'D';
}

// ═══════════════════════════════════════════════════════════════════════════
//  汎用スコア（キャラ未選択時）
// ═══════════════════════════════════════════════════════════════════════════
function scoreGeneric(echo: EchoState): ScoreResult {
  const breakdown = echo.substats.map((sub) => {
    let category: SubstatCategory;
    if (GENERIC_RECOMMENDED.has(sub.key))     category = 'recommended';
    else if (GENERIC_PREFERRED.has(sub.key))  category = 'preferred';
    else if (GENERIC_ACCEPTABLE.has(sub.key)) category = 'acceptable';
    else                                       category = 'unnecessary';

    const points = normalizedTier(sub.tier) * MULT[category];
    return { key: sub.key, label: sub.label, points, category };
  });

  const theoreticalMax = calcTheoreticalMax(echo.cost);
  const raw = breakdown.reduce((s, b) => s + b.points, 0);
  const rawScore = Math.round((raw / theoreticalMax) * 100);
  const score: number = Math.min(100, rawScore);
  const rank: ScoreRank = rawScore >= 100 ? 'GOD' : toRank(score);

  return { score, rank, breakdown };
}

// ═══════════════════════════════════════════════════════════════════════════
//  キャラ別スコア
// ═══════════════════════════════════════════════════════════════════════════
function scoreWithBuild(echo: EchoState, build: CharacterBuild): ScoreResult {
  const recKeys  = new Set(build.substats.recommended.map((s) => s.key));
  const prefKeys = new Set(build.substats.preferred.map((s) => s.key));
  const accKeys  = new Set((build.substats.acceptable ?? []).map((s) => s.key));

  // ── サブステ貢献 ──────────────────────────────────────────────────────
  const breakdown = echo.substats.map((sub) => {
    let category: SubstatCategory;
    if (recKeys.has(sub.key))       category = 'recommended';
    else if (prefKeys.has(sub.key)) category = 'preferred';
    else if (accKeys.has(sub.key))  category = 'acceptable';
    else                            category = 'unnecessary';

    const points = normalizedTier(sub.tier) * MULT[category];
    return { key: sub.key, label: sub.label, points, category };
  });

  // ── 理論最大値（cost に応じてスケール） ─────────────────────────────────
  const theoreticalMax = calcTheoreticalMax(echo.cost);
  const raw = breakdown.reduce((s, b) => s + b.points, 0);
  const substatScore = (raw / theoreticalMax) * 100;

  // ── メインステ補正 ─────────────────────────────────────────────────────
  const costKey = `cost${echo.cost}` as 'cost4' | 'cost3' | 'cost1';
  const ms = build.mainstat[costKey];
  const mk = echo.mainstat.key;
  let mainstatBonus = 0;
  if (!ms.recommended.includes(mk)) {
    mainstatBonus = ms.acceptable.includes(mk) ? -10 : -25;
  }

  // ── ハーモニーセット補正 ──────────────────────────────────────────────
  const activeSet = echo.activeHarmonySet;
  let setBonus = 0;
  if (activeSet && !build.harmonySets.recommended.includes(activeSet)) {
    setBonus = build.harmonySets.acceptable.includes(activeSet) ? -5 : -10;
  }

  const rawScore = Math.round(substatScore + mainstatBonus + setBonus);
  const score: number = Math.max(0, Math.min(100, rawScore));
  const rank: ScoreRank = rawScore >= 100 ? 'GOD' : toRank(score);

  return {
    score,
    rank,
    breakdown,
    mainstatBonus,
    setBonus,
    isCharacterScore: true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
//  公開インターフェース
// ═══════════════════════════════════════════════════════════════════════════
export function scoreEcho(echo: EchoState, build?: CharacterBuild): ScoreResult {
  if (build) return scoreWithBuild(echo, build);
  return scoreGeneric(echo);
}

// ── ランク別カラー / グロー ────────────────────────────────────────────────

export const RANK_COLORS: Record<ScoreRank, string> = {
  GOD: '#FF9800',  // オレンジ（理論値超え）
  'S+': '#FFD700',
  S:   '#E8C44A',
  A:   '#A78BFA',
  B:   '#60A5FA',
  C:   '#4ADE80',
  D:   '#94A3B8',
};

export const RANK_GLOW: Record<ScoreRank, string> = {
  GOD: '0 0 32px #FF9800, 0 0 64px #FF980080, 0 0 96px #FF980040',
  'S+': '0 0 24px #FFD700, 0 0 48px #FFD70080',
  S:   '0 0 20px #E8C44A88',
  A:   '0 0 16px #A78BFA88',
  B:   '0 0 12px #60A5FA66',
  C:   '0 0 8px #4ADE8044',
  D:   'none',
};

// サブステカテゴリ色
export const CATEGORY_COLORS: Record<SubstatCategory, string> = {
  recommended: '#A78BFA',  // 紫
  preferred:   '#34D399',  // 緑
  acceptable:  '#60A5FA',  // 青
  unnecessary: '#475569',  // グレー
};
