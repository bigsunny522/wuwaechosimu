import type { SubstatKey } from '@/types/echo';
import type { CharacterBuild, RoleVariant, DamageProfile } from '@/types/character';
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
function erWeight(erRequirement: number): number {
  if (erRequirement <= 1.05) return 0.02;
  if (erRequirement <= 1.30) return 0.05;
  if (erRequirement <= 1.60) return 0.08;
  return 0.11;
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

// crit・攻撃タイプ別ダメージ%の重み（DPS運用、およびハイブリッド運用の
// damageContributionShare分に使う）
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

  if (dp && totalMainStat != null) {
    const existingPctSum = ASSUMED_EXISTING_SCALING_PCT + dp.selfAtkBuffPercent + weaponScalingPct(scalingStat, weapon);
    const { pctKey, pctWeight, flatKey, flatWeight } = scalingPctFlatWeights(scalingStat, totalMainStat, existingPctSum);
    weights[pctKey] = pctWeight;
    weights[flatKey] = flatWeight;
    Object.assign(weights, damageWeights(dp));
  }

  if (hp && totalMainStat != null) {
    const existingPctSum = hp.assumedExistingScalingPercent + weaponScalingPct(scalingStat, weapon);
    const { pctKey, pctWeight, flatKey, flatWeight } = scalingPctFlatWeights(scalingStat, totalMainStat, existingPctSum);
    weights[pctKey] = pctWeight;
    weights[flatKey] = flatWeight;

    if (hp.damageContributionShare > 0 && hp.damageProfile) {
      const dw = damageWeights(hp.damageProfile);
      const share = hp.damageContributionShare;
      weights.critRate          += dw.critRate * share;
      weights.critDmg           += dw.critDmg * share;
      weights.basicAttackDmg    += dw.basicAttackDmg * share;
      weights.heavyAttackDmg    += dw.heavyAttackDmg * share;
      weights.resonanceSkillDmg += dw.resonanceSkillDmg * share;
      weights.resonanceLibDmg   += dw.resonanceLibDmg * share;
    }
  }

  weights.energyRegen = erWeight(variant.erRequirement);

  // 無関係サブステ（重み0）にも小さな床値を与える。v1のMULT.unnecessary(0.1)が
  // MULT.recommended(2.0)の5%だったのと同じ発想で、完全な死に枠を無くし、
  // 「無関係サブステだらけ」なドロップがスコア0に張り付いてしまう分布の
  // 左端スパイクを緩和する（分布の山を中央寄りに寄せる調整の一部）。
  //
  // 回復系運用（healProfile）はモデル自体が推定パラメータ主体で検証途上のため、
  // この調整の対象外とする（dpによるダメージ系運用のみ床値を与える）。
  if (dp) {
    const maxWeight = Math.max(...Object.values(weights));
    if (maxWeight > 0) {
      for (const key of ALL_SUBSTAT_KEYS) {
        if (weights[key] === 0) weights[key] = maxWeight * FLOOR_WEIGHT_RATIO;
      }
    }
  }

  return { weights, totalMainStat };
}
