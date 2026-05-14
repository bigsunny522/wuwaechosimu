import type { EchoCost, EchoState, Substat, MainstatInfo } from '@/types/echo';
import { SUBSTAT_DATA } from '@/data/substats';
import { MAINSTAT_POOLS, MAINSTAT_WEIGHTS, SUBSTAT_COUNT, UPGRADE_COST } from '@/data/mainstats';
import { ECHOES_BY_COST, DEFAULT_ECHO_ID } from '@/data/echoes';

// Tier出現重み: 2-5が高め、Tier7≈4%
// インデックス = Tier番号、合計100
const TIER_WEIGHTS: Record<number, number[]> = {
  4: [15, 35, 35, 15],               // 固定値系（4段階）
  8: [6, 9, 14, 22, 20, 16, 9, 4],   // 通常系（8段階）
};

function weightedTier(numTiers: number): number {
  const weights = TIER_WEIGHTS[numTiers] ?? TIER_WEIGHTS[8];
  const total = weights.reduce((s, w) => s + w, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return i;
  }
  return weights.length - 1;
}

function pickSubstat(excluded: Set<string>): Substat {
  const pool = SUBSTAT_DATA.filter((s) => !excluded.has(s.key));
  const entry = pool[Math.floor(Math.random() * pool.length)];
  const tier = weightedTier(entry.values.length);
  return {
    key: entry.key,
    label: entry.label,
    unit: entry.unit,
    value: entry.values[tier],
    tier,
    maxValue: entry.values[entry.values.length - 1],
  };
}

function pickMainstat(cost: EchoCost): MainstatInfo {
  const pool    = MAINSTAT_POOLS[cost];
  const weights = MAINSTAT_WEIGHTS[cost];
  const total   = weights.reduce((s, w) => s + w, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

export function createEcho(cost: EchoCost, echoId?: string, fixedMainstat?: MainstatInfo): EchoState {
  const id = echoId ?? DEFAULT_ECHO_ID[cost];
  const echoInfo = ECHOES_BY_COST[cost].find((e) => e.id === id);
  const sets = echoInfo?.sets ?? [];
  const activeHarmonySet =
    sets.length > 0 ? sets[Math.floor(Math.random() * sets.length)] : '';
  return {
    cost,
    echoId: id,
    echoName:   echoInfo?.name   ?? id,
    echoNameEn: echoInfo?.nameEn ?? id,
    activeHarmonySet,
    level: 0,
    substats: [],
    mainstat: fixedMainstat ?? pickMainstat(cost),
    totalCost: { shellCoins: 0, tunerBasic: 0, tunerAdvanced: 0, expMaterial: 0 },
  };
}

export function rerollSubstats(echo: EchoState, indices: number[]): EchoState {
  if (indices.length === 0) return echo;
  const newSubstats = [...echo.substats];
  // Keep non-rerolled keys in the exclusion set so duplicates can't appear
  const excluded = new Set(
    newSubstats.filter((_, i) => !indices.includes(i)).map((s) => s.key)
  );
  for (const idx of [...indices].sort((a, b) => a - b)) {
    const s = pickSubstat(excluded);
    newSubstats[idx] = s;
    excluded.add(s.key);
  }
  return { ...echo, substats: newSubstats };
}

export function upgradeEcho(echo: EchoState): EchoState {
  if (echo.level >= 25) return echo;

  const stepIndex = echo.level / 5;
  const cost = UPGRADE_COST[stepIndex];
  const maxSubstats = SUBSTAT_COUNT[echo.cost];
  const newLevel = echo.level + 5;

  const newSubstats = [...echo.substats];
  if (newSubstats.length < maxSubstats) {
    const excluded = new Set(newSubstats.map((s) => s.key));
    newSubstats.push(pickSubstat(excluded));
  }

  return {
    ...echo,
    level: newLevel,
    substats: newSubstats,
    totalCost: {
      shellCoins: echo.totalCost.shellCoins + cost.shellCoins,
      tunerBasic: echo.totalCost.tunerBasic + cost.tunerBasic,
      tunerAdvanced: echo.totalCost.tunerAdvanced + cost.tunerAdvanced,
      expMaterial: echo.totalCost.expMaterial + cost.expMaterial,
    },
  };
}

export function upgradeToFull(echo: EchoState): EchoState {
  let current = echo;
  while (current.level < 25) {
    current = upgradeEcho(current);
  }
  return current;
}

export function bulkSimulate(cost: EchoCost, count: number, echoId?: string): EchoState[] {
  return Array.from({ length: count }, () => upgradeToFull(createEcho(cost, echoId)));
}