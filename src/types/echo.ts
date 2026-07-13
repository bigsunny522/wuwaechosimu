export type EchoCost = 4 | 3 | 1;

export type SubstatKey =
  | 'critRate'
  | 'critDmg'
  | 'atkPercent'
  | 'hpPercent'
  | 'defPercent'
  | 'atkFlat'
  | 'hpFlat'
  | 'defFlat'
  | 'energyRegen'
  | 'basicAttackDmg'
  | 'heavyAttackDmg'
  | 'resonanceSkillDmg'
  | 'resonanceLibDmg';

export interface SubstatEntry {
  key: SubstatKey;
  label: string;
  unit: '%' | '';
  values: number[]; // 8 tiers
  weight: number;   // draw weight
}

export interface Substat {
  key: SubstatKey;
  label: string;
  unit: '%' | '';
  value: number;
  tier: number; // 0-7
  maxValue: number;
}

export interface MainstatInfo {
  key: string;
  label: string;
  value: number;
  unit: '%' | '';
}

export interface EchoState {
  cost: EchoCost;
  echoId: string;
  echoName: string;
  echoNameEn?: string;
  activeHarmonySet: string; // randomly selected set name at creation
  level: number; // 0-25
  substats: Substat[];
  mainstat: MainstatInfo;
  totalCost: {
    shellCoins: number;
    tunerBasic: number;
    tunerAdvanced: number;
    expMaterial: number;
  };
}

export type ScoreRank = 'GOD' | 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';

export type SubstatCategory = 'recommended' | 'preferred' | 'acceptable' | 'unnecessary';

export interface ScoreResult {
  score: number;
  rank: ScoreRank;
  breakdown: {
    key: SubstatKey;
    label: string;
    points: number;
    category: SubstatCategory;
  }[];
  // デバッグパネル用：スコアリング時に実際に使用した値
  theoreticalMax: number;
  idealMult: number;
  // 推奨サブステ重複ボーナス（3枚以上で加算）
  comboBonus?: number;
  // キャラ別スコアのみ設定される補正値
  mainstatBonus?: number;
  setBonus?: number;
  isCharacterScore?: boolean;
  // v2: 運用バリアント方式（連続重み）で採点された場合のみ設定される
  variantId?: string;
  variantLabel?: string;
  isVariantScore?: boolean;
  // v2: ドロップ分布上「上位X%」に相当するか（パーセンタイル閾値データがある場合のみ）
  topPercentile?: number;
  distributionCurve?: [pct: number, score: number][];
  rankThresholds?: { god: number; sPlus: number; s: number; a: number; b: number; c: number };
  /** スコア0〜100を幅2のビンに区切った出現確率（分布図のヒストグラム用） */
  distributionHistogram?: number[];
}

export type Theme = 'default' | 'azure' | 'crimson' | 'emerald' | 'void';

export interface AppState {
  echo: EchoState | null;
  score: ScoreResult | null;
  theme: Theme;
  bulkUnlocked: boolean;
  premiumThemeUnlocked: boolean;
  history: EchoState[];
}
