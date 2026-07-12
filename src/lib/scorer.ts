import type { EchoState, EchoCost, ScoreResult, ScoreRank, SubstatKey, SubstatCategory } from '@/types/echo';
import type { CharacterBuild, RoleVariant } from '@/types/character';
import { SUBSTAT_COUNT } from '@/data/mainstats';
import { SUBSTAT_DATA, SUBSTAT_MAP } from '@/data/substats';
import { ROLE_TEMPLATE_CATEGORIES } from '@/data/roleTemplates';
import type { RoleTemplate } from '@/data/roleTemplates';
import { getMotifWeapon } from '@/data/weapons';
import { deriveSubstatWeights } from '@/lib/weaponScoring';

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
//  ロールテンプレート対応ヘルパー
// ═══════════════════════════════════════════════════════════════════════════

// サブステのカテゴリを解決する：explicit list → roleTemplate → unnecessary の順
function resolveCategory(
  subKey: SubstatKey,
  recKeys: Set<SubstatKey>,
  prefKeys: Set<SubstatKey>,
  accKeys: Set<SubstatKey>,
  roleTemplate?: RoleTemplate,
): SubstatCategory {
  if (recKeys.has(subKey)) return 'recommended';
  if (prefKeys.has(subKey)) return 'preferred';
  if (accKeys.has(subKey)) return 'acceptable';
  if (roleTemplate) return ROLE_TEMPLATE_CATEGORIES[roleTemplate][subKey];
  return 'unnecessary';
}

// ロールテンプレートを持つキャラ用の動的 IDEAL_MULT
// 全13サブステの有効カテゴリを求め、上位 count 枠の加重平均を返す
function calcTemplateIdealMult(
  recKeys: Set<SubstatKey>,
  prefKeys: Set<SubstatKey>,
  accKeys: Set<SubstatKey>,
  roleTemplate: RoleTemplate,
  count: number,
): number {
  const weights = SUBSTAT_DATA.map(s =>
    MULT[resolveCategory(s.key, recKeys, prefKeys, accKeys, roleTemplate)]
  );
  weights.sort((a, b) => b - a);
  return weights.slice(0, count).reduce((sum, w) => sum + w, 0) / count;
}

// ═══════════════════════════════════════════════════════════════════════════
//  推奨重複ボーナス：推奨サブステが3枚以上重なると加算される
//  3→+3, 4→+7, 5→+12
// ═══════════════════════════════════════════════════════════════════════════
export const COMBO_BONUS: Record<number, number> = { 3: 3, 4: 7, 5: 12 };

function calcComboBonus(breakdown: { category: SubstatCategory }[]): number {
  const recCount = breakdown.filter((b) => b.category === 'recommended').length;
  return COMBO_BONUS[recCount] ?? 0;
}

// ═══════════════════════════════════════════════════════════════════════════
//  汎用モード：サブステのデフォルトカテゴリ分類
// ═══════════════════════════════════════════════════════════════════════════
const GENERIC_RECOMMENDED = new Set<SubstatKey>(['critRate', 'critDmg']);
const GENERIC_PREFERRED   = new Set<SubstatKey>(['atkPercent', 'resonanceSkillDmg', 'heavyAttackDmg', 'basicAttackDmg', 'resonanceLibDmg']);
const GENERIC_ACCEPTABLE  = new Set<SubstatKey>(['energyRegen', 'hpPercent', 'defPercent']);

// ═══════════════════════════════════════════════════════════════════════════
//  単一サブステのカテゴリ判定（UI側での「推奨を上に表示」等のソート・バッジ表示用）
//  scoreEcho の内部ロジックと同じ優先順位（explicit list → roleTemplate/汎用 → unnecessary）
// ═══════════════════════════════════════════════════════════════════════════
export function getSubstatCategory(key: SubstatKey, build?: CharacterBuild): SubstatCategory {
  if (!build) {
    if (GENERIC_RECOMMENDED.has(key)) return 'recommended';
    if (GENERIC_PREFERRED.has(key))   return 'preferred';
    if (GENERIC_ACCEPTABLE.has(key))  return 'acceptable';
    return 'unnecessary';
  }
  const recKeys  = new Set(build.substats.recommended.map((s) => s.key));
  const prefKeys = new Set(build.substats.preferred.map((s) => s.key));
  const accKeys  = new Set((build.substats.acceptable ?? []).map((s) => s.key));
  return resolveCategory(key, recKeys, prefKeys, accKeys, build.roleTemplate);
}

// ═══════════════════════════════════════════════════════════════════════════
//  正規化：(Tier + 5) / 12
//  Tier0 → 0.417、Tier7（最高） → 1.000
// ═══════════════════════════════════════════════════════════════════════════
export function normalizedTier(tier: number): number {
  return (tier + 5) / 12;
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
  const comboBonus = calcComboBonus(breakdown);
  const rawScore = Math.round((raw / theoreticalMax) * 100) + comboBonus;
  const score: number = Math.min(100, rawScore);
  const rank: ScoreRank = rawScore >= 100 ? 'GOD' : toRank(score);

  return { score, rank, breakdown, theoreticalMax, idealMult: IDEAL_MULT, comboBonus };
}

// ═══════════════════════════════════════════════════════════════════════════
//  キャラ別スコア
// ═══════════════════════════════════════════════════════════════════════════
function scoreWithBuild(echo: EchoState, build: CharacterBuild): ScoreResult {
  const recKeys  = new Set(build.substats.recommended.map((s) => s.key));
  const prefKeys = new Set(build.substats.preferred.map((s) => s.key));
  const accKeys  = new Set((build.substats.acceptable ?? []).map((s) => s.key));
  const { roleTemplate } = build;

  // ── サブステ貢献 ──────────────────────────────────────────────────────
  // roleTemplate がある場合は resolveCategory でテンプレートフォールバックを使用
  const breakdown = echo.substats.map((sub) => {
    const category = resolveCategory(sub.key, recKeys, prefKeys, accKeys, roleTemplate);
    const points = normalizedTier(sub.tier) * MULT[category];
    return { key: sub.key, label: sub.label, points, category };
  });

  // ── 理論最大値 ────────────────────────────────────────────────────────
  // roleTemplate あり: 全13サブステの有効カテゴリから動的計算
  // roleTemplate なし: 従来の固定 IDEAL_MULT を使用
  const substatCount = SUBSTAT_COUNT[echo.cost];
  const usedIdealMult = roleTemplate
    ? calcTemplateIdealMult(recKeys, prefKeys, accKeys, roleTemplate, substatCount)
    : IDEAL_MULT;
  const theoreticalMax = substatCount * normalizedTier(REFERENCE_TIER) * usedIdealMult;
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

  const comboBonus = calcComboBonus(breakdown);
  const rawScore = Math.round(substatScore + mainstatBonus + setBonus) + comboBonus;
  const score: number = Math.max(0, Math.min(100, rawScore));
  const rank: ScoreRank = rawScore >= 100 ? 'GOD' : toRank(score);

  return {
    score,
    rank,
    breakdown,
    theoreticalMax,
    idealMult: usedIdealMult,
    comboBonus,
    mainstatBonus,
    setBonus,
    isCharacterScore: true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
//  v2: 運用バリアント方式（連続重み）
//  build.variants が定義済みのキャラのみ使用。武器/基礎ステータス等
//  必要データが揃っていない場合は null を返し、呼び出し側で
//  従来のカテゴリベース採点（scoreWithBuild）へフォールバックする。
// ═══════════════════════════════════════════════════════════════════════════

// 装着中のハーモニーセットから運用バリアントを推定。一致しなければ先頭を既定とする
export function pickVariant(echo: EchoState, build: CharacterBuild): RoleVariant | undefined {
  const variants = build.variants;
  if (!variants || variants.length === 0) return undefined;
  if (variants.length === 1) return variants[0];
  const activeSet = echo.activeHarmonySet;
  const matched = variants.find((v) => v.harmonySets.recommended.includes(activeSet))
    ?? variants.find((v) => v.harmonySets.acceptable.includes(activeSet));
  return matched ?? variants[0];
}

// 重み導出時に使った基準ロール位置（旧 REFERENCE_TIER=5/7段階 と同じ基準点）
// 8段階ステは values[5]（旧実装と同一インデックス）、4段階ステ(atkFlat/defFlat)は
// 同じ「全体の 5/7 地点」に相当するインデックスへ換算する
const REFERENCE_ROLL_FRACTION = 5 / 7;

function referenceRatio(key: SubstatKey): number {
  const entry = SUBSTAT_MAP[key];
  const idx = Math.round(REFERENCE_ROLL_FRACTION * (entry.values.length - 1));
  return entry.values[idx] / entry.values[entry.values.length - 1];
}

function weightToCategory(weight: number, maxWeight: number): SubstatCategory {
  if (maxWeight <= 0) return 'unnecessary';
  const rel = weight / maxWeight;
  if (rel >= 0.85) return 'recommended';
  if (rel >= 0.5)  return 'preferred';
  if (rel >= 0.15) return 'acceptable';
  return 'unnecessary';
}

function scoreWithVariant(echo: EchoState, build: CharacterBuild, variant: RoleVariant): ScoreResult | null {
  const weapon = build.motifWeaponId ? getMotifWeapon(build.motifWeaponId) : undefined;
  const { weights, totalMainStat } = deriveSubstatWeights(build, variant, weapon);
  if (totalMainStat == null) return null; // データ不足 → フォールバック

  const maxWeight = Math.max(...Object.values(weights));

  // ── サブステ貢献（実値ベース正規化 × 連続重み） ──────────────────────────
  const breakdown = echo.substats.map((sub) => {
    const weight = weights[sub.key] ?? 0;
    const valueRatio = sub.value / sub.maxValue;
    const points = valueRatio * weight;
    const category = weightToCategory(weight, maxWeight);
    return { key: sub.key, label: sub.label, points, category };
  });

  // ── 理論最大値：重み上位 substatCount 個を基準ロールで埋めた場合 ──────────
  const substatCount = SUBSTAT_COUNT[echo.cost];
  const sortedKeys = (Object.keys(weights) as SubstatKey[]).sort((a, b) => weights[b] - weights[a]);
  const topKeys = sortedKeys.slice(0, substatCount);
  const theoreticalMax = topKeys.reduce((sum, k) => sum + referenceRatio(k) * weights[k], 0);
  const idealMult = topKeys.reduce((sum, k) => sum + weights[k], 0) / substatCount;

  const raw = breakdown.reduce((s, b) => s + b.points, 0);
  const substatScore = theoreticalMax > 0 ? (raw / theoreticalMax) * 100 : 0;

  // ── メインステ補正 ─────────────────────────────────────────────────────
  const costKey = `cost${echo.cost}` as 'cost4' | 'cost3' | 'cost1';
  const ms = variant.mainstat[costKey];
  const mk = echo.mainstat.key;
  let mainstatBonus = 0;
  if (!ms.recommended.includes(mk)) {
    mainstatBonus = ms.acceptable.includes(mk) ? -10 : -25;
  }

  // ── ハーモニーセット補正 ──────────────────────────────────────────────
  const activeSet = echo.activeHarmonySet;
  let setBonus = 0;
  if (activeSet && !variant.harmonySets.recommended.includes(activeSet)) {
    setBonus = variant.harmonySets.acceptable.includes(activeSet) ? -5 : -10;
  }

  const comboBonus = calcComboBonus(breakdown);
  const rawScore = Math.round(substatScore + mainstatBonus + setBonus) + comboBonus;
  const score: number = Math.max(0, Math.min(100, rawScore));
  const rank: ScoreRank = rawScore >= 100 ? 'GOD' : toRank(score);

  return {
    score,
    rank,
    breakdown,
    theoreticalMax,
    idealMult,
    comboBonus,
    mainstatBonus,
    setBonus,
    isCharacterScore: true,
    variantId: variant.id,
    variantLabel: variant.label,
    isVariantScore: true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
//  公開インターフェース
// ═══════════════════════════════════════════════════════════════════════════
export function scoreEcho(echo: EchoState, build?: CharacterBuild): ScoreResult {
  if (!build) return scoreGeneric(echo);

  if (build.variants && build.variants.length > 0) {
    const variant = pickVariant(echo, build);
    if (variant) {
      const variantResult = scoreWithVariant(echo, build, variant);
      if (variantResult) return variantResult;
    }
  }

  return scoreWithBuild(echo, build);
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
