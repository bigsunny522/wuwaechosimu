import type { SubstatEntry, SubstatKey } from '@/types/echo';

// 5-star echo substat values — confirmed from in-game data provided by user
// Step values: critRate +0.6%, critDmg +1.2%, atk/hp/buff% ~+0.7-0.8%,
//              def% ~+0.9-1.0%, energyRegen +0.8%, flat atk/def step ~4-5, hp flat step ~37
// elementDmg and healingBonus are MAIN STATS ONLY, NOT substats

export const SUBSTAT_DATA: SubstatEntry[] = [
  {
    key: 'critRate',
    label: 'クリティカル率',
    unit: '%',
    values: [6.3, 6.9, 7.5, 8.1, 8.7, 9.3, 9.9, 10.5],
    weight: 8,
  },
  {
    key: 'critDmg',
    label: 'クリティカルダメージ',
    unit: '%',
    values: [12.6, 13.8, 15.0, 16.2, 17.4, 18.6, 19.8, 21.0],
    weight: 8,
  },
  {
    key: 'atkPercent',
    label: '攻撃力%',
    unit: '%',
    values: [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6],
    weight: 8,
  },
  {
    key: 'hpPercent',
    label: 'HP%',
    unit: '%',
    values: [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6],
    weight: 8,
  },
  {
    key: 'defPercent',
    label: '防御力%',
    unit: '%',
    // 8 tiers: 8.0 → 14.7, step ~0.9-1.0%
    values: [8.0, 9.0, 10.0, 10.9, 11.8, 12.8, 13.8, 14.7],
    weight: 8,
  },
  {
    key: 'atkFlat',
    label: '攻撃力（固定値）',
    unit: '',
    // 4 tiers: 30 → 60, step 10
    values: [30, 40, 50, 60],
    weight: 10,
  },
  {
    key: 'hpFlat',
    label: 'HP（固定値）',
    unit: '',
    values: [320, 360, 390, 430, 470, 510, 540, 580],
    weight: 10,
  },
  {
    key: 'defFlat',
    label: '防御力（固定値）',
    unit: '',
    // 4 tiers: 40 → 70, step 10
    values: [40, 50, 60, 70],
    weight: 10,
  },
  {
    key: 'energyRegen',
    label: '共鳴効率',
    unit: '%',
    values: [6.8, 7.6, 8.4, 9.2, 10.0, 10.8, 11.6, 12.4],
    weight: 8,
  },
  {
    key: 'basicAttackDmg',
    label: '通常攻撃ダメージ%',
    unit: '%',
    values: [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6],
    weight: 5,
  },
  {
    key: 'heavyAttackDmg',
    label: '重撃ダメージ%',
    unit: '%',
    values: [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6],
    weight: 5,
  },
  {
    key: 'resonanceSkillDmg',
    label: '共鳴スキルダメージ%',
    unit: '%',
    values: [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6],
    weight: 5,
  },
  {
    key: 'resonanceLibDmg',
    label: '共鳴解放ダメージ%',
    unit: '%',
    values: [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6],
    weight: 5,
  },
];

export const SUBSTAT_MAP: Record<SubstatKey, SubstatEntry> = Object.fromEntries(
  SUBSTAT_DATA.map((s) => [s.key, s])
) as Record<SubstatKey, SubstatEntry>;

export const TOTAL_WEIGHT = SUBSTAT_DATA.reduce((sum, s) => sum + s.weight, 0);
