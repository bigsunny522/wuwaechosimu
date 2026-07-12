import type { EchoCost, MainstatInfo, ScoreRank, Substat } from '@/types/echo';
import type { CharacterBuild } from '@/types/character';
import { bulkSimulate } from '@/lib/simulator';
import { scoreEcho } from '@/lib/scorer';

// ═══════════════════════════════════════════════════════════════════════════
//  厳選サポーター：実際にゲーム内で入手した音骸を記録し、理論値（シミュレーション
//  による期待確率）とベイズ更新することで「今後の予測」を算出する。
// ═══════════════════════════════════════════════════════════════════════════

export interface TrackedEntry {
  id: number;
  cost: EchoCost;
  charId: string;        // 'generic' if no character selected
  echoId?: string;       // cost4 のみ設定
  harmonySet: string;
  mainstat: MainstatInfo;
  substats: Substat[];
  score: number;
  rank: ScoreRank;
  createdAt: number;
}

const STORAGE_KEY = 'wuwa-tracker-entries-v1';

export function loadEntries(): TrackedEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEntries(entries: TrackedEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// ── ランク順序（良い→悪い） ─────────────────────────────────────────────────
export const RANK_ORDER: ScoreRank[] = ['GOD', 'S+', 'S', 'A', 'B', 'C', 'D'];

export function rankAtLeast(rank: ScoreRank, threshold: ScoreRank): boolean {
  return RANK_ORDER.indexOf(rank) <= RANK_ORDER.indexOf(threshold);
}

export type Threshold = 'S+' | 'S' | 'A';

// ═══════════════════════════════════════════════════════════════════════════
//  理論値（ベースライン）計算：完全ランダムな音骸を大量に生成してランク分布を求める
// ═══════════════════════════════════════════════════════════════════════════
export interface BaselineStats {
  avgScore: number;
  probByThreshold: Record<Threshold, number>;
}

export function computeBaseline(
  cost: EchoCost,
  echoId: string | undefined,
  build: CharacterBuild | undefined,
  iterations = 6000,
): BaselineStats {
  const samples = bulkSimulate(cost, iterations, echoId);
  let sum = 0;
  let cSPlus = 0, cS = 0, cA = 0;
  for (const e of samples) {
    const { score, rank } = scoreEcho(e, build);
    sum += score;
    if (rankAtLeast(rank, 'S+')) cSPlus++;
    if (rankAtLeast(rank, 'S'))  cS++;
    if (rankAtLeast(rank, 'A'))  cA++;
  }
  return {
    avgScore: sum / iterations,
    probByThreshold: { 'S+': cSPlus / iterations, 'S': cS / iterations, 'A': cA / iterations },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
//  ベイズ更新による予測
//  理論値 P0 を「疑似 n = PRIOR_STRENGTH 回」相当の事前分布（Beta分布）とみなし、
//  実測データ（記録済みの音骸）で事後分布を更新する。
//  PRIOR_STRENGTH が大きいほど理論値を強く信頼し、実測データが増えるほど
//  実測寄りの確率に収束していく。
// ═══════════════════════════════════════════════════════════════════════════
const PRIOR_STRENGTH = 20;

export type LuckRating = 'hot' | 'warm' | 'neutral' | 'cool' | 'cold' | 'insufficient';

export interface PredictionResult {
  observedN: number;
  observedHits: number;
  observedRate: number | null;
  theoreticalRate: number;
  posteriorRate: number;
  expectedRuns: number; // 次の1個が当たるまでの期待回数 (1 / posteriorRate)
  luck: LuckRating;
}

export function predict(
  entries: TrackedEntry[],
  threshold: Threshold,
  theoreticalRate: number,
): PredictionResult {
  const n = entries.length;
  const hits = entries.filter((e) => rankAtLeast(e.rank, threshold)).length;

  const a0 = theoreticalRate * PRIOR_STRENGTH;
  const b0 = (1 - theoreticalRate) * PRIOR_STRENGTH;
  const posteriorRate = (a0 + hits) / (a0 + b0 + n);
  const observedRate = n > 0 ? hits / n : null;

  let luck: LuckRating = 'insufficient';
  if (n >= 5 && observedRate !== null) {
    const diff = observedRate - theoreticalRate;
    if (diff >= theoreticalRate * 0.4) luck = 'hot';
    else if (diff >= theoreticalRate * 0.1) luck = 'warm';
    else if (diff <= -theoreticalRate * 0.4) luck = 'cold';
    else if (diff <= -theoreticalRate * 0.1) luck = 'cool';
    else luck = 'neutral';
  }

  return {
    observedN: n,
    observedHits: hits,
    observedRate,
    theoreticalRate,
    posteriorRate,
    expectedRuns: posteriorRate > 0 ? 1 / posteriorRate : Infinity,
    luck,
  };
}

/** 今後 runs 回のうちに、目標ランク以上が少なくとも1回出る確率 */
export function probAtLeastOneWithin(posteriorRate: number, runs: number): number {
  return 1 - Math.pow(1 - posteriorRate, runs);
}
