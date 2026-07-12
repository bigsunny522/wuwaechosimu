// ═══════════════════════════════════════════════════════════════════════════
//  ランク閾値（ドロップ分布パーセンタイル基準）
//
//  `npm run gen:thresholds` で自動生成される。手動編集しないこと。
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

// キー形式: `${characterId}:${variantId}`
export const RANK_THRESHOLDS: Record<string, RankThresholds> = {
  "yangyang_xuanling:main": { "god": 92, "sPlus": 84, "s": 73, "a": 53, "b": 42, "c": 29 },
  "lucilare:sub": { "god": 91, "sPlus": 83, "s": 73, "a": 53, "b": 43, "c": 32 },
  "lucy:main": { "god": 92, "sPlus": 84, "s": 73, "a": 53, "b": 42, "c": 30 },
  "rebecca:sub": { "god": 92, "sPlus": 83, "s": 73, "a": 53, "b": 42, "c": 30 },
  "denia:main": { "god": 92, "sPlus": 84, "s": 74, "a": 53, "b": 42, "c": 30 },
  "hiyuki:main": { "god": 92, "sPlus": 84, "s": 73, "a": 53, "b": 42, "c": 30 },
  "hiyuki:sub": { "god": 91, "sPlus": 83, "s": 72, "a": 52, "b": 42, "c": 30 },
  "sigrid:main": { "god": 92, "sPlus": 84, "s": 73, "a": 53, "b": 42, "c": 29 },
  "ryuk:main": { "god": 93, "sPlus": 84, "s": 74, "a": 53, "b": 41, "c": 28 },
  "aimes:main": { "god": 92, "sPlus": 84, "s": 73, "a": 53, "b": 42, "c": 30 },
  "linne:sub": { "god": 100, "sPlus": 91, "s": 80, "a": 57, "b": 45, "c": 33 },
  "chixia_sanhua:sub": { "god": 91, "sPlus": 83, "s": 73, "a": 53, "b": 42, "c": 31 },
  "quyuan:sub": { "god": 91, "sPlus": 83, "s": 73, "a": 52, "b": 41, "c": 29 },
  "galbrena:main": { "god": 93, "sPlus": 84, "s": 73, "a": 53, "b": 41, "c": 28 },
  "yuanwu:sub": { "god": 92, "sPlus": 83, "s": 73, "a": 53, "b": 42, "c": 30 },
  "augusta:main": { "god": 91, "sPlus": 84, "s": 73, "a": 53, "b": 43, "c": 31 },
  "flova:main": { "god": 92, "sPlus": 84, "s": 73, "a": 53, "b": 43, "c": 30 },
  "lupa:sub": { "god": 94, "sPlus": 85, "s": 74, "a": 54, "b": 43, "c": 32 },
  "cartethia:main": { "god": 95, "sPlus": 87, "s": 75, "a": 55, "b": 44, "c": 33 },
  "shaconne:sub": { "god": 100, "sPlus": 92, "s": 80, "a": 58, "b": 48, "c": 37 },
  "zanni:main": { "god": 99, "sPlus": 90, "s": 78, "a": 56, "b": 45, "c": 34 },
  "cantarella:main": { "god": 93, "sPlus": 85, "s": 74, "a": 54, "b": 43, "c": 31 },
  "brant:sub": { "god": 92, "sPlus": 84, "s": 73, "a": 54, "b": 44, "c": 32 },
  "phoebe:main": { "god": 100, "sPlus": 91, "s": 79, "a": 57, "b": 47, "c": 35 },
  "rococo:sub": { "god": 91, "sPlus": 83, "s": 72, "a": 53, "b": 42, "c": 30 },
  "carlotta:main": { "god": 93, "sPlus": 85, "s": 74, "a": 53, "b": 42, "c": 29 },
  "camellya:main": { "god": 92, "sPlus": 84, "s": 73, "a": 54, "b": 43, "c": 31 },
  "xiangli_yao:main": { "god": 92, "sPlus": 84, "s": 73, "a": 54, "b": 44, "c": 32 },
  "zhezhi:sub": { "god": 92, "sPlus": 84, "s": 73, "a": 53, "b": 43, "c": 31 },
  "changli:main": { "god": 99, "sPlus": 90, "s": 78, "a": 56, "b": 45, "c": 33 },
  "jinhsi:main": { "god": 92, "sPlus": 84, "s": 73, "a": 53, "b": 43, "c": 30 },
  "yinlin:sub": { "god": 95, "sPlus": 86, "s": 74, "a": 54, "b": 44, "c": 33 },
  "jiyan:main": { "god": 92, "sPlus": 84, "s": 73, "a": 53, "b": 42, "c": 30 },
  "lingyang:main": { "god": 95, "sPlus": 88, "s": 78, "a": 59, "b": 49, "c": 37 },
  "encore:main": { "god": 93, "sPlus": 86, "s": 75, "a": 56, "b": 47, "c": 35 },
  "calcharo:main": { "god": 95, "sPlus": 87, "s": 76, "a": 56, "b": 46, "c": 34 },
  "jianxin:sub": { "god": 93, "sPlus": 86, "s": 76, "a": 57, "b": 47, "c": 36 },
};

export function getRankThresholds(charId: string, variantId: string): RankThresholds | undefined {
  return RANK_THRESHOLDS[`${charId}:${variantId}`];
}
