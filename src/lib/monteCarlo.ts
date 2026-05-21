import type { EchoState, ScoreRank } from '@/types/echo';
import type { CharacterBuild } from '@/types/character';
import { pickSubstat } from '@/lib/simulator';
import { scoreEcho } from '@/lib/scorer';

const ITERATIONS = 50_000;

// ── ランク閾値（scorer.ts の toRank と一致させること） ──────────────────────
const RANK_THRESHOLD: Record<'A' | 'S' | 'S+', number> = {
  'A':  58,
  'S':  75,
  'S+': 90,
};

export interface AdvisorResult {
  expectedScore:     number;
  /** A以上 / S以上 / S+以上 の達成確率（0.0〜1.0） */
  probAPlus:         number;
  probSPlus:         number;
  probSStarPlus:     number;
  /** ベースライン（まっさらな音骸の平均） */
  baselineScore:     number;
  baselineProbAPlus: number;
  baselineProbSPlus: number;
  baselineProbSStarPlus: number;
  /** 期待スコア / ベースライン */
  ratio:             number;
  recommendation:    'great' | 'good' | 'borderline' | 'scrap';
}

// ベースラインキャッシュ: `${cost}-${charId}` → AdvisorResult の一部
const baselineCache = new Map<string, Pick<AdvisorResult,
  'baselineScore' | 'baselineProbAPlus' | 'baselineProbSPlus' | 'baselineProbSStarPlus'
>>();

function runSimulation(
  fixedSubstats: EchoState['substats'],
  remainingSlots: number,
  echoTemplate: EchoState,
  build: CharacterBuild | undefined,
  iterations: number,
) {
  let totalScore = 0;
  let countA = 0, countS = 0, countSStar = 0;

  for (let i = 0; i < iterations; i++) {
    const excluded = new Set(fixedSubstats.map((s) => s.key));
    const substats = [...fixedSubstats];

    for (let j = 0; j < remainingSlots; j++) {
      const sub = pickSubstat(excluded);
      excluded.add(sub.key);
      substats.push(sub);
    }

    const fakeEcho: EchoState = { ...echoTemplate, level: 25, substats };
    const { score } = scoreEcho(fakeEcho, build);

    totalScore += score;
    if (score >= RANK_THRESHOLD['A'])  countA++;
    if (score >= RANK_THRESHOLD['S'])  countS++;
    if (score >= RANK_THRESHOLD['S+']) countSStar++;
  }

  return {
    expectedScore: totalScore / iterations,
    probAPlus:     countA     / iterations,
    probSPlus:     countS     / iterations,
    probSStarPlus: countSStar / iterations,
  };
}

export function simulateCompletion(
  echo: EchoState,
  build: CharacterBuild | undefined,
  iterations = ITERATIONS,
): AdvisorResult {
  const maxSubs = 5;
  const remaining = maxSubs - echo.substats.length;

  // ── 現在の音骸のシミュレーション ─────────────────────────────────────────
  const current = runSimulation(echo.substats, remaining, echo, build, iterations);

  // ── ベースライン（まっさらな音骸） ────────────────────────────────────────
  const cacheKey = `${echo.cost}-${build?.id ?? 'generic'}`;
  let baseline = baselineCache.get(cacheKey);
  if (!baseline) {
    const b = runSimulation([], maxSubs, echo, build, iterations);
    baseline = {
      baselineScore:        b.expectedScore,
      baselineProbAPlus:    b.probAPlus,
      baselineProbSPlus:    b.probSPlus,
      baselineProbSStarPlus: b.probSStarPlus,
    };
    baselineCache.set(cacheKey, baseline);
  }

  const ratio = baseline.baselineScore > 0
    ? current.expectedScore / baseline.baselineScore
    : 1;

  const recommendation =
    ratio >= 1.20 ? 'great' :
    ratio >= 1.08 ? 'good'  :
    ratio >= 0.95 ? 'borderline' : 'scrap';

  return {
    ...current,
    ...baseline,
    ratio,
    recommendation,
  };
}

/** キャラ変更時にベースラインキャッシュを破棄 */
export function clearBaselineCache() {
  baselineCache.clear();
}
