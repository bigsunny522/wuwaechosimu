import type { SubstatKey } from '@/types/echo';
import type { CharacterBuild, RoleVariant, DamageProfile, HealProfile } from '@/types/character';
import type { WeaponData } from '@/types/weapon';
import { SUBSTAT_MAP } from '@/data/substats';

// ═══════════════════════════════════════════════════════════════════════════
//  ダメージ/回復式の偏微分に基づくサブステ連続重み導出
//
//  DPS運用: DMG ∝ MainStat_total × (1 + %DMG_typeX) × CritMult
//           CritMult = 1 + critRate × critDmg
//  ヒーラー運用: HEAL ∝ MainStat_total × (1 + %scalingStat_total)
//           （回復はクリットしないため CritMult 相当の項が無い）
//
//  各サブステ最大ロールを1つ追加した際の相対増加率（ΔDMG/DMG または
//  ΔHEAL/HEAL）を、そのまま「重み」として使う。カテゴリスコア(MULT)と違い、
//  絶対値のスケールは意味を持たない（正規化時に理論最大値との比で割るため）。
//  重要なのはサブステ間の相対比のみ。
// ═══════════════════════════════════════════════════════════════════════════

// 評価対象のサブステ以外に、典型的な終盤ビルドで既に積まれているであろう
// メインスケールステ%量の概算（メインステ枠・他音骸のロール等を想定）。
// 要チューニング：パイロット検証で実キャラのスコアが直感と乖離する場合はここを調整する。
const ASSUMED_EXISTING_SCALING_PCT = 0.45;

// 無関係サブステ（重み0）に与える床値の比率（そのキャラの最大重みに対する割合）。
// v1のMULT.unnecessary(0.1) / MULT.recommended(2.0) = 5% を参考にした値。
const FLOOR_WEIGHT_RATIO = 0.06;

// 共鳴効率は閾値型ステータス（要求値に届くまでは高価値、届いた後はほぼ無価値）
// のため、ダメージ式からの線形近似ができない。目標ERからの静的重みで代替する。
// 数値のスケールは他の重み（crit/atk 系が概ね 0.02〜0.10 に収まる）に揃えてある。
//
// 回復系キャラは250〜260%ものERを要求されることがあるが（DPSの多くは160%以下）、
// その超過分の価値はerConversionWeight()（実際のゲーム内変換式に基づく加算）で
// 別途表現するため、この閾値テーブル自体はDPS/資源循環という本来の役割のまま
// 据え置く（曖昧な高ER用バケットを追加しない）。
function erWeight(erRequirement: number): number {
  if (erRequirement <= 1.05) return 0.02;
  if (erRequirement <= 1.30) return 0.05;
  if (erRequirement <= 1.60) return 0.08;
  return 0.11;
}

// ERがチーム全体バフに直接変換されるキャラ用の重み加算。
// buffGain%(ER%) = ratePerErPercent × max(0, ER% − baselineErPercent) という
// 実際のゲーム内変換式を、DPSのcrit重みと同じ「基準点での傾き」として扱う。
// erRequirementが変換の起点(baselineErPercent)にまだ届いていない場合は0。
function erConversionWeight(conversions: HealProfile['erConversions'], erRequirement: number): number {
  if (!conversions || conversions.length === 0) return 0;
  const erPercent = erRequirement * 100;
  const totalRate = conversions.reduce((sum, c) => {
    if (erPercent <= c.baselineErPercent) return sum;
    return sum + c.ratePerErPercent;
  }, 0);
  return totalRate * maxRollFraction('energyRegen');
}

// サブステの最大ロール値を比率化（%系は /100、固定値系はそのまま実数）
function maxRollFraction(key: SubstatKey): number {
  const entry = SUBSTAT_MAP[key];
  const max = entry.values[entry.values.length - 1];
  return entry.unit === '%' ? max / 100 : max;
}

const ALL_SUBSTAT_KEYS: SubstatKey[] = [
  'critRate', 'critDmg', 'atkPercent', 'hpPercent', 'defPercent',
  'atkFlat', 'hpFlat', 'defFlat', 'energyRegen',
  'basicAttackDmg', 'heavyAttackDmg', 'resonanceSkillDmg', 'resonanceLibDmg',
];

export interface DerivedWeights {
  weights: Record<SubstatKey, number>;
  /** メインスケールステの合計実数値（キャラ基礎+武器基礎）。データ不足時は null */
  totalMainStat: number | null;
}

type ScalingStat = 'atk' | 'hp' | 'def';

// メインスケールステの%/実数サブステ（例: atkPercent/atkFlat）の重みを、
// 「既にビルドに積まれていると仮定する同スケーリングステ%の合計」で希釈して求める。
function scalingPctFlatWeights(
  scalingStat: ScalingStat,
  totalMainStat: number,
  existingPctSum: number,
): { pctKey: SubstatKey; pctWeight: number; flatKey: SubstatKey; flatWeight: number } {
  const pctKey = `${scalingStat}Percent` as SubstatKey;
  const flatKey = `${scalingStat}Flat` as SubstatKey;
  return {
    pctKey,
    pctWeight: maxRollFraction(pctKey) / (1 + existingPctSum),
    flatKey,
    flatWeight: maxRollFraction(flatKey) / (totalMainStat * (1 + existingPctSum)),
  };
}

// 武器の副ステがメインスケールステ%そのものを供給している場合の量（無ければ0）
function weaponScalingPct(scalingStat: ScalingStat, weapon: WeaponData | undefined): number {
  return weapon?.substatKey === `${scalingStat}Percent` ? weapon.substatValue90 / 100 : 0;
}

interface DamageWeights {
  critRate: number;
  critDmg: number;
  basicAttackDmg: number;
  heavyAttackDmg: number;
  resonanceSkillDmg: number;
  resonanceLibDmg: number;
}

// crit・攻撃タイプ別ダメージ%の重み（DPS運用、およびdamageProfileを持つ
// ハイブリッド回復運用の実ダメージ成分に使う）
function damageWeights(dp: DamageProfile): DamageWeights {
  const cr = dp.baselineCritRate;
  // baselineCritDmg は表示値（2.30 = 230%）。クリット時の「非クリ超過分」は cd−1。
  // 期待倍率 = (1−cr)×1 + cr×cd = 1 + cr×(cd−1)
  const cdBonus = dp.baselineCritDmg - 1;
  const critMult = 1 + cr * cdBonus;

  return {
    critRate: (cdBonus * maxRollFraction('critRate')) / critMult,
    critDmg:  (cr * maxRollFraction('critDmg')) / critMult,
    basicAttackDmg:    maxRollFraction('basicAttackDmg')    * dp.typeShares.basic,
    heavyAttackDmg:    maxRollFraction('heavyAttackDmg')    * dp.typeShares.heavy,
    resonanceSkillDmg: maxRollFraction('resonanceSkillDmg') * dp.typeShares.skill,
    resonanceLibDmg:   maxRollFraction('resonanceLibDmg')   * dp.typeShares.lib,
  };
}

/**
 * キャラの基礎データ + モチーフ武器 + 運用バリアントから、13種サブステの
 * 連続重みを導出する。baseStats90 / weapon / (damageProfile または
 * healProfile) のいずれかが欠けている場合は totalMainStat が null になり、
 * 呼び出し側は旧カテゴリベース採点へフォールバックすべきことを示す。
 */
export function deriveSubstatWeights(
  character: Pick<CharacterBuild, 'scalingStat' | 'baseStats90'>,
  variant: RoleVariant,
  weapon: WeaponData | undefined,
): DerivedWeights {
  const weights = Object.fromEntries(ALL_SUBSTAT_KEYS.map((k) => [k, 0])) as Record<SubstatKey, number>;

  const scalingStat: ScalingStat = character.scalingStat ?? 'atk';
  const baseMain = character.baseStats90?.[scalingStat];
  const weaponAtk = weapon?.baseAtk90;

  const totalMainStat =
    baseMain != null
      ? (scalingStat === 'atk' && weaponAtk != null ? baseMain + weaponAtk : baseMain)
      : null;

  const dp = variant.damageProfile;
  const hp = variant.healProfile;

  // ── メインスケールステ%/実数の重み ──────────────────────────────────────
  // healProfileがあればそちらが「回復の頭打ち」を織り込んだ希釈率で計算する。
  // 無ければ（純粋なダメージ系運用）従来通りdamageProfileのselfAtkBuffPercent等で計算する。
  if (totalMainStat != null) {
    if (hp) {
      const existingPctSum = hp.assumedExistingScalingPercent + weaponScalingPct(scalingStat, weapon);
      const { pctKey, pctWeight, flatKey, flatWeight } = scalingPctFlatWeights(scalingStat, totalMainStat, existingPctSum);
      weights[pctKey] = pctWeight;
      weights[flatKey] = flatWeight;
    } else if (dp) {
      const existingPctSum = ASSUMED_EXISTING_SCALING_PCT + dp.selfAtkBuffPercent + weaponScalingPct(scalingStat, weapon);
      const { pctKey, pctWeight, flatKey, flatWeight } = scalingPctFlatWeights(scalingStat, totalMainStat, existingPctSum);
      weights[pctKey] = pctWeight;
      weights[flatKey] = flatWeight;
    }
  }

  // ── クリ・攻撃タイプ別ダメージ%の重み ────────────────────────────────────
  // damageProfileが設定されていれば、healProfileの有無に関わらず独立して加算する
  // （回復キャラのハイブリッドダメージ成分も、割引かず「本物のダメージ」として扱う）。
  if (dp && totalMainStat != null) {
    const dw = damageWeights(dp);
    weights.critRate          += dw.critRate;
    weights.critDmg           += dw.critDmg;
    weights.basicAttackDmg    += dw.basicAttackDmg;
    weights.heavyAttackDmg    += dw.heavyAttackDmg;
    weights.resonanceSkillDmg += dw.resonanceSkillDmg;
    weights.resonanceLibDmg   += dw.resonanceLibDmg;
  }

  weights.energyRegen = erWeight(variant.erRequirement) + erConversionWeight(hp?.erConversions, variant.erRequirement);

  // 無関係サブステ（重み0）にも小さな床値を与える。v1のMULT.unnecessary(0.1)が
  // MULT.recommended(2.0)の5%だったのと同じ発想で、完全な死に枠を無くし、
  // 「無関係サブステだらけ」なドロップがスコア0に張り付いてしまう分布の
  // 左端スパイクを緩和する（分布の山を中央寄りに寄せる調整の一部）。
  //
  // 回復系運用（healProfileあり）は依然としてパラメータの検証途上のため、
  // この調整の対象外とする（healProfileが無い運用のみ床値を与える）。
  if (!hp) {
    const maxWeight = Math.max(...Object.values(weights));
    if (maxWeight > 0) {
      for (const key of ALL_SUBSTAT_KEYS) {
        if (weights[key] === 0) weights[key] = maxWeight * FLOOR_WEIGHT_RATIO;
      }
    }
  }

  return { weights, totalMainStat };
}
