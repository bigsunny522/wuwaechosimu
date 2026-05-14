import type { EchoCost, MainstatInfo } from '@/types/echo';

// Main stat values at +25 for 5-star echoes — confirmed from user-provided data
// Full progression: 0Lv / 5Lv / 10Lv / 15Lv / 20Lv / 25Lv

export const MAINSTAT_POOLS: Record<EchoCost, MainstatInfo[]> = {
  // 4-Cost (Overlord / Calamity class) — 5 possible primary main stats
  // critRate:    4.4 / 7.9 / 11.4 / 14.9 / 18.5 / 22.0
  // critDmg:     8.8 / 15.8 / 22.9 / 29.9 / 37.0 / 44.0
  // atk/hp%:     6.6 / 11.9 / 17.2 / 22.4 / 27.7 / 33.0
  // def%:        7.6 / 13.7 / 19.8 / 25.8 / 31.9 / 38.0
  // healing%:    5.2 / 9.4 / 13.5 / 17.7 / 21.8 / 26.0
  4: [
    { key: 'critRate',    label: 'クリティカル率',        value: 22.0,  unit: '%' },
    { key: 'critDmg',     label: 'クリティカルダメージ',  value: 44.0,  unit: '%' },
    { key: 'healingBonus',label: 'HP回復効果アップ',  value: 26.4,  unit: '%' },
    { key: 'atkPercent',  label: '攻撃力%',               value: 33.0,  unit: '%' },
    { key: 'hpPercent',   label: 'HP%',                   value: 33.0,  unit: '%' },
    { key: 'defPercent',  label: '防御力%',               value: 41.5,  unit: '%' },
  ],
  // 3-Cost (Elite class) — 4 possible primary main stats
  // atk/hp%:    6.0 / 10.8 / 15.6 / 20.4 / 25.2 / 30.0
  // def%:       7.6 / 13.7 / 19.8 / 25.8 / 31.9 / 38.0
  // elementDmg: 6.0 / 10.8 / 15.6 / 20.4 / 25.2 / 30.0
  // energyRegen:6.4 / 11.5 / 16.6 / 21.8 / 26.9 / 32.0
  3: [
    { key: 'atkPercent',  label: '攻撃力%',               value: 30.0,  unit: '%' },
    { key: 'hpPercent',   label: 'HP%',                   value: 30.0,  unit: '%' },
    { key: 'defPercent',  label: '防御力%',               value: 38.0,  unit: '%' },
    { key: 'GlacioDmg',  label: '凝縮ダメージアップ',         value: 30.0,  unit: '%' },
    { key: 'FusionDmg',  label: '焦熱ダメージアップ',         value: 30.0,  unit: '%' },
    { key: 'ElectroDmg',  label: '電導ダメージアップ',         value: 30.0,  unit: '%' },
    { key: 'AeroDmg',  label: '気道ダメージアップ',         value: 30.0,  unit: '%' },
    { key: 'SpectroDmg',  label: '回折ダメージアップ',         value: 30.0,  unit: '%' },
    { key: 'HavocDmg',  label: '消滅ダメージアップ',         value: 30.0,  unit: '%' },
    { key: 'Resonanceeff', label: '共鳴効率',               value: 32.0,  unit: '%' },
  ],
  // 1-Cost (Common class) — 3 possible primary main stats
  // atk%:  3.6 / 6.5 / 9.4 / 12.2 / 15.1 / 18.0
  // hp%:   4.5 / 8.2 / 11.8 / 15.5 / 19.1 / 22.8
  // def%:  3.6 / 6.5 / 9.4 / 12.2 / 15.1 / 18.0
  1: [
    { key: 'hpPercent',   label: 'HP%',                   value: 22.8,  unit: '%' },
    { key: 'atkPercent',  label: '攻撃力%',               value: 18.0,  unit: '%' },
    { key: 'defPercent',  label: '防御力%',               value: 18.0,  unit: '%' },
  ],
};

// ── Main stat draw weights (index matches MAINSTAT_POOLS order) ──────────────
// 合計が total になる整数で指定。値が大きいほど出やすい。
export const MAINSTAT_WEIGHTS: Record<EchoCost, number[]> = {
  // COST 4: critRate・critDmg を 3 倍に
  // critRate(3) / critDmg(3) / healingBonus(1) / atkPercent(1) / hpPercent(1) / defPercent(1)
  4: [3, 3, 1, 1, 1, 1],
  // COST 3: すべて均等
  3: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  // COST 1: atkPercent を 3 倍に
  // hpPercent(1) / atkPercent(3) / defPercent(1)
  1: [1, 3, 1],
};

// Max number of substats revealed at +25 per cost
export const SUBSTAT_COUNT: Record<EchoCost, number> = {
  4: 5,
  3: 5,
  1: 5,
};

// Resource cost per +5 step (index 0 = +0→+5, ..., 4 = +20→+25)
export const UPGRADE_COST: {
  shellCoins: number;
  tunerBasic: number;
  tunerAdvanced: number;
  expMaterial: number;
}[] = [
  { shellCoins: 8000,  tunerBasic: 0, tunerAdvanced: 10, expMaterial: 4 },
  { shellCoins: 12000, tunerBasic: 0, tunerAdvanced: 10, expMaterial: 6 },
  { shellCoins: 16000, tunerBasic: 0, tunerAdvanced: 10, expMaterial: 8 },
  { shellCoins: 20000, tunerBasic: 0, tunerAdvanced: 10, expMaterial: 10 },
  { shellCoins: 24000, tunerBasic: 0, tunerAdvanced: 10, expMaterial: 12 },
];
