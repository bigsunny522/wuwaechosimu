// ランク閾値（ドロップ分布パーセンタイル基準）を再計算し、
// src/data/rankThresholds.ts を上書き生成するスクリプト。
//
// 実行: npm run gen:thresholds
//
// variants を持つキャラ全員を対象に、キャラ・運用バリアントごとに
// 「推奨メインステ・推奨ハーモニーセット固定 + サブステ5枠を完全ランダム抽選」
// をN回試行し、スコア分布の上位パーセンタイル閾値を算出する。
// 重み付け（weaponScoring.ts）やキャラの damageProfile を変更した場合は
// このスクリプトを再実行して閾値を更新すること。

import { writeFileSync } from 'fs';
import { CHARACTERS } from '../src/data/characters';
import { scoreEcho } from '../src/lib/scorer';
import { pickSubstat } from '../src/lib/simulator';
import type { EchoState, Substat } from '../src/types/echo';
import type { CharacterBuild, RoleVariant } from '../src/types/character';

const N = 500_000;

// 上位X%（累積確率）→ 出力キー名
const PERCENTILES: [keyof RankThresholdsShape, number][] = [
  ['god', 0.01],
  ['sPlus', 0.1],
  ['s', 1],
  ['a', 15],
  ['b', 35],
  ['c', 65],
];

interface RankThresholdsShape {
  god: number;
  sPlus: number;
  s: number;
  a: number;
  b: number;
  c: number;
}

function simulateVariant(build: CharacterBuild, variant: RoleVariant): RankThresholdsShape {
  const mainstatKey = variant.mainstat.cost4.recommended[0] ?? variant.mainstat.cost4.acceptable[0];
  const echoTemplate: EchoState = {
    cost: 4,
    echoId: 'sim',
    echoName: 'sim',
    activeHarmonySet: variant.harmonySets.recommended[0] ?? '',
    level: 25,
    substats: [],
    mainstat: { key: mainstatKey, label: mainstatKey, value: 0, unit: '%' },
    totalCost: { shellCoins: 0, tunerBasic: 0, tunerAdvanced: 0, expMaterial: 0 },
  };

  const scores = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    const excluded = new Set<string>();
    const substats: Substat[] = [];
    for (let j = 0; j < 5; j++) {
      const s = pickSubstat(excluded);
      excluded.add(s.key);
      substats.push(s);
    }
    scores[i] = scoreEcho({ ...echoTemplate, substats }, build).score;
  }

  const sorted = Array.from(scores).sort((a, b) => b - a);
  const result = {} as RankThresholdsShape;
  for (const [name, pct] of PERCENTILES) {
    const idx = Math.max(0, Math.floor((N * pct) / 100) - 1);
    result[name] = sorted[idx];
  }
  return result;
}

const output: Record<string, RankThresholdsShape> = {};

for (const build of CHARACTERS) {
  if (!build.variants || build.variants.length === 0) continue;
  for (const variant of build.variants) {
    const key = `${build.id}:${variant.id}`;
    process.stdout.write(`simulating ${key}...\n`);
    output[key] = simulateVariant(build, variant);
  }
}

const entries = Object.entries(output)
  .map(([key, th]) => `  ${JSON.stringify(key)}: { "god": ${th.god}, "sPlus": ${th.sPlus}, "s": ${th.s}, "a": ${th.a}, "b": ${th.b}, "c": ${th.c} },`)
  .join('\n');

const fileContent = `// ═══════════════════════════════════════════════════════════════════════════
//  ランク閾値（ドロップ分布パーセンタイル基準）
//
//  `+ '`npm run gen:thresholds`' + ` で自動生成される。手動編集しないこと。
//  生成元: scripts/computeRankThresholds.ts
//
//  各キャラ・運用バリアントごとに「サブステ抽選のみをランダムにした場合の
//  スコア分布」を大量シミュレーションし、上位X%に対応するスコアを閾値として
//  記録している（メインステ・セットは推奨のものに固定 = 純粋なサブステ運の評価）。
//
//  帯の意味（累積確率）:
//    god:   上位 0.01%
//    sPlus: 上位 0.1%
//    s:     上位 1%
//    a:     上位 15%
//    b:     上位 35%
//    c:     上位 65%
//    （それ未満は D）
//
//  「推奨ステの排出確率自体が低い」ことを踏まえ、性能の絶対値ではなく
//  ドロップの中での相対位置でランクを決める。詳細な設計意図は
//  scorer.ts の toRankFromThresholds 付近のコメントを参照。
// ═══════════════════════════════════════════════════════════════════════════

export interface RankThresholds {
  god: number;
  sPlus: number;
  s: number;
  a: number;
  b: number;
  c: number;
}

// キー形式: \`\${characterId}:\${variantId}\`
export const RANK_THRESHOLDS: Record<string, RankThresholds> = {
${entries}
};

export function getRankThresholds(charId: string, variantId: string): RankThresholds | undefined {
  return RANK_THRESHOLDS[\`\${charId}:\${variantId}\`];
}
`;

writeFileSync(new URL('../src/data/rankThresholds.ts', import.meta.url), fileContent, 'utf8');
console.log(`\nWrote ${Object.keys(output).length} threshold entries to src/data/rankThresholds.ts`);
