// ランク閾値（ドロップ分布パーセンタイル基準）を再計算し、
// src/data/rankThresholds.ts を上書き生成するスクリプト。
//
// 実行: npm run gen:thresholds
//
// variants を持つキャラ全員を対象に、キャラ・運用バリアントごとに
// 「推奨メインステ・推奨ハーモニーセット固定 + サブステ5枠を完全ランダム抽選」
// をN回試行し、スコア分布の上位パーセンタイル閾値・分布曲線を算出する。
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
  ['sPlus', 1],
  ['s', 5],
  ['a', 15],
  ['b', 35],
  ['c', 65],
];

// 分布曲線（UIの「上位X%表示」・任意スコア→パーセンタイル逆引き用）のサンプル点。
// 累積確率(上位%)が小さいほど珍しい＝スコアが高い側。
const CURVE_PERCENTILES = [
  0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 3, 5, 7, 10,
  15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100,
];

// ヒストグラム（分布図の描画用）のビン幅。スコアは0〜100の整数なのでビン数は51個。
const HIST_BIN_WIDTH = 2;
const HIST_BIN_COUNT = Math.floor(100 / HIST_BIN_WIDTH) + 1;

interface RankThresholdsShape {
  god: number;
  sPlus: number;
  s: number;
  a: number;
  b: number;
  c: number;
}

interface SimResult {
  thresholds: RankThresholdsShape;
  curve: [pct: number, score: number][];
  /** ビン幅 HIST_BIN_WIDTH 点ごとの出現確率（合計 ≈ 1）。分布図のヒストグラム描画に使う */
  histogram: number[];
}

function simulateVariant(build: CharacterBuild, variant: RoleVariant): SimResult {
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
  const scoreAtPct = (pct: number) => sorted[Math.max(0, Math.floor((N * pct) / 100) - 1)];

  const thresholds = {} as RankThresholdsShape;
  for (const [name, pct] of PERCENTILES) {
    thresholds[name] = scoreAtPct(pct);
  }

  const curve: [number, number][] = CURVE_PERCENTILES.map((pct) => [pct, scoreAtPct(pct)]);

  const histCounts = new Array(HIST_BIN_COUNT).fill(0);
  for (let i = 0; i < N; i++) {
    const bin = Math.min(HIST_BIN_COUNT - 1, Math.max(0, Math.floor(scores[i] / HIST_BIN_WIDTH)));
    histCounts[bin]++;
  }
  const histogram = histCounts.map((c) => Math.round((c / N) * 100000) / 100000);

  return { thresholds, curve, histogram };
}

const output: Record<string, SimResult> = {};

for (const build of CHARACTERS) {
  if (!build.variants || build.variants.length === 0) continue;
  for (const variant of build.variants) {
    const key = `${build.id}:${variant.id}`;
    process.stdout.write(`simulating ${key}...\n`);
    output[key] = simulateVariant(build, variant);
  }
}

const entries = Object.entries(output)
  .map(([key, { thresholds: th, curve, histogram }]) => {
    const curveStr = curve.map(([pct, score]) => `[${pct}, ${score}]`).join(', ');
    const histStr = histogram.join(', ');
    return `  ${JSON.stringify(key)}: { "god": ${th.god}, "sPlus": ${th.sPlus}, "s": ${th.s}, "a": ${th.a}, "b": ${th.b}, "c": ${th.c}, "curve": [${curveStr}], "histogram": [${histStr}] },`;
  })
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
//    sPlus: 上位 1%
//    s:     上位 5%
//    a:     上位 15%
//    b:     上位 35%
//    c:     上位 65%
//    （それ未満は D）
//
//  curve: [上位%, その%に対応するスコア] のサンプル列（降順スコア想定）。
//  UIの「上位X%」表示・任意スコア→パーセンタイル逆引きに使う（getPercentileForScore を参照）。
//
//  histogram: スコア0〜100を幅2のビンに区切った出現確率（合計≈1、51要素）。
//  分布図（ヒストグラム）の描画に使う。
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
  /** [上位%, スコア] のサンプル列。上位%昇順・スコア降順。 */
  curve: [number, number][];
  /** スコア0〜100を幅2のビンに区切った出現確率（合計≈1、51要素、ビンi = スコア[2i, 2i+2)）。 */
  histogram: number[];
}

// キー形式: \`\${characterId}:\${variantId}\`
export const RANK_THRESHOLDS: Record<string, RankThresholds> = {
${entries}
};

export function getRankThresholds(charId: string, variantId: string): RankThresholds | undefined {
  return RANK_THRESHOLDS[\`\${charId}:\${variantId}\`];
}

// 任意のスコアから、そのスコアが分布上「上位何%」に相当するかを曲線から
// 線形補間して求める（対数スケールで補間し、極端な裾での粗さを緩和する）。
// 曲線範囲外は最も近い端点にクランプする。
export function getPercentileForScore(charId: string, variantId: string, score: number): number | undefined {
  const th = getRankThresholds(charId, variantId);
  if (!th || th.curve.length === 0) return undefined;

  // curve はスコア降順（=上位%昇順）。スコア昇順に並べ替えて探索する。
  const bySco = [...th.curve].sort((a, b) => a[1] - b[1]);

  if (score >= bySco[bySco.length - 1][1]) return bySco[bySco.length - 1][0];
  if (score <= bySco[0][1]) return bySco[0][0];

  for (let i = 0; i < bySco.length - 1; i++) {
    const [pctLo, scoreLo] = bySco[i];
    const [pctHi, scoreHi] = bySco[i + 1];
    if (score >= scoreLo && score <= scoreHi) {
      if (scoreHi === scoreLo) return pctLo;
      const t = (score - scoreLo) / (scoreHi - scoreLo);
      // 上位%は対数的に変化するため log 空間で線形補間する
      const logLo = Math.log10(Math.max(pctLo, 0.001));
      const logHi = Math.log10(Math.max(pctHi, 0.001));
      return Math.pow(10, logLo + (logHi - logLo) * t);
    }
  }
  return bySco[0][0];
}
`;

writeFileSync(new URL('../src/data/rankThresholds.ts', import.meta.url), fileContent, 'utf8');
console.log(`\nWrote ${Object.keys(output).length} threshold entries to src/data/rankThresholds.ts`);
