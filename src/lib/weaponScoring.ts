import type { SubstatKey } from '@/types/echo';
import type { CharacterBuild, RoleVariant } from '@/types/character';
import type { WeaponData } from '@/types/weapon';
import { SUBSTAT_MAP } from '@/data/substats';

// ═══════════════════════════════════════════════════════════════════════════
//  ダメージ式の偏微分に基づくサブステ連続重み導出
//
//  DMG ∝ MainStat_total × (1 + %DMG_typeX) × CritMult
//  CritMult = 1 + critRate × critDmg
//
//  各サブステ最大ロールを1つ追加した際の ΔDMG/DMG（相対ダメージ増加率）を、
//  そのまま「重み」として使う。カテゴリスコア(MULT)と違い、絶対値のスケールは
//  意味を持たない（正規化時に理論最大値との比で割るため）。重要なのは
//  サブステ間の相対比のみ。
// ═══════════════════════════════════════════════════════════════════════════

// 評価対象のサブステ以外に、典型的な終盤ビルドで既に積まれているであろう
// メインスケールステ%量の概算（メインステ枠・他音骸のロール等を想定）。
// 要チューニング：パイロット検証で実キャラのスコアが直感と乖離する場合はここを調整する。
const ASSUMED_EXISTING_SCALING_PCT = 0.45;

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

/**
 * キャラの基礎データ + モチーフ武器 + 運用バリアントから、13種サブステの
 * 連続重みを導出する。baseStats90 / weapon / damageProfile のいずれかが
 * 欠けている場合は totalMainStat が null になり、呼び出し側は
 * 旧カテゴリベース採点へフォールバックすべきことを示す。
 */
export function deriveSubstatWeights(
  character: Pick<CharacterBuild, 'scalingStat' | 'baseStats90'>,
  variant: RoleVariant,
  weapon: WeaponData | undefined,
): DerivedWeights {
  const weights = Object.fromEntries(ALL_SUBSTAT_KEYS.map((k) => [k, 0])) as Record<SubstatKey, number>;

  const scalingStat = character.scalingStat ?? 'atk';
  const baseMain = character.baseStats90?.[scalingStat];
  const weaponAtk = weapon?.baseAtk90;

  const totalMainStat =
    baseMain != null
      ? (scalingStat === 'atk' && weaponAtk != null ? baseMain + weaponAtk : baseMain)
      : null;

  const dp = variant.damageProfile;

  if (dp && totalMainStat != null) {
    const cr = dp.baselineCritRate;
    // baselineCritDmg は表示値（2.30 = 230%）。クリット時の「非クリ超過分」は cd−1。
    // 期待倍率 = (1−cr)×1 + cr×cd = 1 + cr×(cd−1)
    const cdBonus = dp.baselineCritDmg - 1;
    const critMult = 1 + cr * cdBonus;

    weights.critRate = (cdBonus * maxRollFraction('critRate')) / critMult;
    weights.critDmg  = (cr * maxRollFraction('critDmg'))  / critMult;

    const weaponGivesScalingPct = weapon?.substatKey === `${scalingStat}Percent` ? weapon.substatValue90 / 100 : 0;
    const existingPctSum = ASSUMED_EXISTING_SCALING_PCT + dp.selfAtkBuffPercent + weaponGivesScalingPct;

    const pctKey = `${scalingStat}Percent` as SubstatKey;
    weights[pctKey] = maxRollFraction(pctKey) / (1 + existingPctSum);

    const flatKey = `${scalingStat}Flat` as SubstatKey;
    weights[flatKey] = maxRollFraction(flatKey) / (totalMainStat * (1 + existingPctSum));

    weights.basicAttackDmg    = maxRollFraction('basicAttackDmg')    * dp.typeShares.basic;
    weights.heavyAttackDmg    = maxRollFraction('heavyAttackDmg')    * dp.typeShares.heavy;
    weights.resonanceSkillDmg = maxRollFraction('resonanceSkillDmg') * dp.typeShares.skill;
    weights.resonanceLibDmg   = maxRollFraction('resonanceLibDmg')   * dp.typeShares.lib;
  }

  weights.energyRegen = erWeight(variant.erRequirement);

  return { weights, totalMainStat };
}
