import type { SubstatEntry, SubstatKey } from '@/types/echo';

// 5-star echo substat values & type-selection weights — aligned to the official
// Korean probability disclosure (주파수 조정기와 튜너의 확률 공시) published at
// https://wutheringwaves.kurogames.com/p/language_ko/product_info.html
// All 13 substat types have an EQUAL selection probability (7.6923% = 1/13 each),
// so `weight` is uniform across every entry — do not diverge these per-key again.
// elementDmg and healingBonus are MAIN STATS ONLY, NOT substats

export const SUBSTAT_DATA: SubstatEntry[] = [
  {
    key: 'critRate',
    label: 'クリティカル率',
    unit: '%',
    values: [6.3, 6.9, 7.5, 8.1, 8.7, 9.3, 9.9, 10.5],
    weight: 1,
  },
  {
    key: 'critDmg',
    label: 'クリティカルダメージ',
    unit: '%',
    values: [12.6, 13.8, 15.0, 16.2, 17.4, 18.6, 19.8, 21.0],
    weight: 1,
  },
  {
    key: 'atkPercent',
    label: '攻撃力%',
    unit: '%',
    values: [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6],
    weight: 1,
  },
  {
    key: 'hpPercent',
    label: 'HP%',
    unit: '%',
    values: [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6],
    weight: 1,
  },
  {
    key: 'defPercent',
    label: '防御力%',
    unit: '%',
    // 8 tiers: 8.1 → 14.7（韓国公式確率公示に準拠、最小値 8.0→8.1 に修正）
    values: [8.1, 9.0, 10.0, 10.9, 11.8, 12.8, 13.8, 14.7],
    weight: 1,
  },
  {
    key: 'atkFlat',
    label: '攻撃力（固定値）',
    unit: '',
    // 4 tiers: 30 → 60, step 10
    values: [30, 40, 50, 60],
    weight: 1,
  },
  {
    key: 'hpFlat',
    label: 'HP（固定値）',
    unit: '',
    values: [320, 360, 390, 430, 470, 510, 540, 580],
    weight: 1,
  },
  {
    key: 'defFlat',
    label: '防御力（固定値）',
    unit: '',
    // 4 tiers: 40 → 70, step 10
    values: [40, 50, 60, 70],
    weight: 1,
  },
  {
    key: 'energyRegen',
    label: '共鳴効率',
    unit: '%',
    values: [6.8, 7.6, 8.4, 9.2, 10.0, 10.8, 11.6, 12.4],
    weight: 1,
  },
  {
    key: 'basicAttackDmg',
    label: '通常攻撃ダメージ%',
    unit: '%',
    values: [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6],
    weight: 1,
  },
  {
    key: 'heavyAttackDmg',
    label: '重撃ダメージ%',
    unit: '%',
    values: [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6],
    weight: 1,
  },
  {
    key: 'resonanceSkillDmg',
    label: '共鳴スキルダメージ%',
    unit: '%',
    values: [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6],
    weight: 1,
  },
  {
    key: 'resonanceLibDmg',
    label: '共鳴解放ダメージ%',
    unit: '%',
    values: [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6],
    weight: 1,
  },
];

// 属性内の数値(Tier)出現確率 — 韓国公式確率公示に準拠。
// クリティカル系(crit)と、それ以外の8段階系("standard")、固定攻撃力/固定防御力(各専用の4段階)で分布が異なる。
export const TIER_WEIGHTS_BY_KEY: Record<SubstatKey, number[]> = {
  critRate:           [23.3333, 23.3333, 23.3333, 8, 8, 8, 3, 3],
  critDmg:            [23.3333, 23.3333, 23.3333, 8, 8, 8, 3, 3],
  atkPercent:         [6.7961, 7.7670, 20.3883, 24.2718, 17.4757, 14.5631, 5.8252, 2.9126],
  hpPercent:          [6.7961, 7.7670, 20.3883, 24.2718, 17.4757, 14.5631, 5.8252, 2.9126],
  defPercent:         [6.7961, 7.7670, 20.3883, 24.2718, 17.4757, 14.5631, 5.8252, 2.9126],
  energyRegen:        [6.7961, 7.7670, 20.3883, 24.2718, 17.4757, 14.5631, 5.8252, 2.9126],
  basicAttackDmg:     [6.7961, 7.7670, 20.3883, 24.2718, 17.4757, 14.5631, 5.8252, 2.9126],
  heavyAttackDmg:     [6.7961, 7.7670, 20.3883, 24.2718, 17.4757, 14.5631, 5.8252, 2.9126],
  resonanceSkillDmg:  [6.7961, 7.7670, 20.3883, 24.2718, 17.4757, 14.5631, 5.8252, 2.9126],
  resonanceLibDmg:    [6.7961, 7.7670, 20.3883, 24.2718, 17.4757, 14.5631, 5.8252, 2.9126],
  hpFlat:             [6.7961, 7.7670, 20.3883, 24.2718, 17.4757, 14.5631, 5.8252, 2.9126],
  atkFlat:            [6.7961, 52.4272, 37.8641, 2.9126],
  defFlat:            [14.5631, 44.6602, 32.0388, 8.7379],
};

export const SUBSTAT_MAP: Record<SubstatKey, SubstatEntry> = Object.fromEntries(
  SUBSTAT_DATA.map((s) => [s.key, s])
) as Record<SubstatKey, SubstatEntry>;

export const TOTAL_WEIGHT = SUBSTAT_DATA.reduce((sum, s) => sum + s.weight, 0);
