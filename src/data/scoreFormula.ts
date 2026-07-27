import type { Locale } from '@/lib/locale-utils';

/**
 * /score-formula の本文。実装（src/lib/weaponScoring.ts・src/lib/scorer.ts）を
 * 変更したら、ここの記述と数値も合わせて更新すること。
 *
 * 段落テキスト内の `バッククォート` はインラインコードとして描画される。
 */

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'code'; text: string }
  | { type: 'table'; head: string[]; rows: string[][] };

export interface FormulaSection {
  title: string;
  blocks: Block[];
}

export interface FormulaContent {
  title: string;
  lead: string;
  back: string;
  sections: FormulaSection[];
  footerNote: string;
  footerLink: string;
  footerSuffix: string;
}

const JA: FormulaContent = {
  title: '音骸スコアの計算方法',
  lead: 'このツールが表示するスコアとランクを、どのような式で出しているかを全て公開しています。数値の根拠を確認したい方向けの技術解説です。',
  back: '← シミュレーターへ',
  sections: [
    {
      title: '1. 2つの採点方式',
      blocks: [
        {
          type: 'p',
          text: 'スコアの算出には2つの方式があります。ひとつは、サブステータスを「推奨 / 優先 / 可 / 不要」の4区分に手動で分類し、区分ごとの固定倍率を掛ける方式です（以下、カテゴリ方式）。もうひとつは、キャラクターの基礎ステータス・モチーフ武器・ダメージタイプの内訳から、ダメージ式の偏微分に基づく連続値の重みをサブステータスごとに導き出す方式です（以下、運用バリアント方式）。',
        },
        {
          type: 'p',
          text: '運用バリアント方式では、区分そのものを重みから逆算します。必要なデータが揃っているキャラクターにはこちらが使われ、揃っていないキャラクターは自動的にカテゴリ方式へフォールバックします。',
        },
        {
          type: 'p',
          text: '「運用バリアント」とは、同じキャラクターでもパーティ編成によってメイン運用・サブ運用・サポート運用が変わり、それぞれ理想のセットやステータスが異なることを表したデータです。装備中のハーモニーセットから最も一致度の高い運用が自動で選ばれます。',
        },
      ],
    },
    {
      title: '2. 重みの導出（偏微分ベース）',
      blocks: [
        {
          type: 'p',
          text: '前提とするダメージ式は次の通りです。',
        },
        {
          type: 'code',
          text: `DMG ∝ MainStat_total × (1 + %DMG_typeX) × CritMult
CritMult = 1 + critRate × critDmg`,
        },
        {
          type: 'p',
          text: '各サブステータスの最大ロール1本を追加したときの相対ダメージ増加率 ΔDMG/DMG を、そのサブステータスの重みとして採用します。倍率の絶対値そのものには意味がなく、後段で理論最大値との比を取るため、サブステータス間の相対比のみが効きます。',
        },
        { type: 'h3', text: 'クリティカル率・クリティカルダメージ' },
        {
          type: 'p',
          text: '期待ダメージ倍率 `1 + critRate × (critDmg − 1)` を、クリティカル率とクリティカルダメージでそれぞれ偏微分します。クリティカル率が既に高いビルドではクリティカル率の重みが自動的に下がる、という挙動がここから生まれます。',
        },
        {
          type: 'code',
          text: `cdBonus  = baselineCritDmg - 1        // 非クリ超過分
critMult = 1 + baselineCritRate × cdBonus

weight[critRate] = (cdBonus × maxRollFraction(critRate)) / critMult
weight[critDmg]  = (baselineCritRate × maxRollFraction(critDmg)) / critMult`,
        },
        { type: 'h3', text: '攻撃力%・攻撃力実数（スケーリングステ）' },
        {
          type: 'p',
          text: '既にビルドに積まれているであろう他の%系バフの合計を仮定し（`0.45`）、そこにキャラクター自身のバフとモチーフ武器の副ステータス（%攻撃力の場合）を加えたものを分母に取ります。%系はすでに積み上がっているほど1本あたりの価値が薄まるため、この希釈を明示的に扱います。',
        },
        {
          type: 'code',
          text: `existingPctSum = 0.45 + selfAtkBuffPercent + weaponGivesScalingPct

weight[atkPercent] = maxRollFraction(atkPercent) / (1 + existingPctSum)
weight[atkFlat]    = maxRollFraction(atkFlat) / (totalMainStat × (1 + existingPctSum))
// totalMainStat = キャラ基礎攻撃力(Lv90) + モチーフ武器基礎攻撃力(Lv90)`,
        },
        { type: 'h3', text: '攻撃種別ダメージ%（通常/重撃/共鳴スキル/共鳴解放）' },
        {
          type: 'p',
          text: '各攻撃種別がそのキャラクターのダメージ全体に占める割合を、重みに直接乗算します。重撃主体のキャラクターなら重撃ダメージ%の重みが大きくなります。',
        },
        {
          type: 'code',
          text: `weight[basicAttackDmg]    = maxRollFraction(basicAttackDmg)    × typeShares.basic
weight[heavyAttackDmg]    = maxRollFraction(heavyAttackDmg)    × typeShares.heavy
weight[resonanceSkillDmg] = maxRollFraction(resonanceSkillDmg) × typeShares.skill
weight[resonanceLibDmg]   = maxRollFraction(resonanceLibDmg)   × typeShares.lib`,
        },
        { type: 'h3', text: '共鳴効率' },
        {
          type: 'p',
          text: '共鳴効率は「要求値に届くまでは高価値、届いた後はほぼ無価値」という閾値型のステータスであり、ダメージ式からの線形近似ができません。そのため運用ごとの要求共鳴効率に応じた静的な重みで代替しています（他の重み帯であるおおよそ 0.02〜0.10 に合わせてスケーリング）。',
        },
        {
          type: 'table',
          head: ['要求共鳴効率', '重み'],
          rows: [['≤ 1.05', '0.02'], ['≤ 1.30', '0.05'], ['≤ 1.60', '0.08'], ['それ以上', '0.11']],
        },
        {
          type: 'p',
          text: '武器またはキャラクターの基礎データが欠けている場合は、カテゴリ方式の採点へフォールバックします。',
        },
      ],
    },
    {
      title: '3. スコア計算の本体',
      blocks: [
        { type: 'h3', text: 'サブステータスの貢献' },
        {
          type: 'code',
          text: `points = (sub.value / sub.maxValue) × weight[sub.key]  // ロール実値の比率 × 重み`,
        },
        { type: 'h3', text: '理論最大値' },
        {
          type: 'p',
          text: '音骸のコストで決まるサブステータス枠数の分だけ、重みが上位のステータスを「基準ロール」で埋めた場合の合計を理論最大値とします。基準ロールは全ステータス共通で、8段階の値配列の 5/7 地点です。最大ロールではなく 5/7 を基準にしているのは、全枠が最高ロールという現実的にまず起きない状態を 100 点の基準にすると、スコアが実感と乖離するためです。',
        },
        {
          type: 'code',
          text: `REFERENCE_ROLL_FRACTION = 5 / 7
referenceRatio(key) = values[round(5/7 × (values.length-1))] / values[values.length-1]

topKeys        = weights を降順ソートして上位 substatCount 個
theoreticalMax = Σ referenceRatio(k) × weight[k]   (k ∈ topKeys)

substatScore = (Σ points / theoreticalMax) × 100`,
        },
        { type: 'h3', text: 'メインステータス補正' },
        {
          type: 'p',
          text: 'その運用でのコスト別推奨メインステータスと比較して減点します。サブステータスが優秀でもメインステータスが噛み合っていない音骸は、実戦では使いにくいためです。',
        },
        {
          type: 'table',
          head: ['状態', '補正'],
          rows: [['推奨メインステータス', '0'], ['許容メインステータス', '−10'], ['どちらでもない', '−25']],
        },
        { type: 'h3', text: 'ハーモニーセット補正' },
        {
          type: 'table',
          head: ['状態', '補正'],
          rows: [['推奨セット', '0'], ['許容セット', '−5'], ['どちらでもない', '−10']],
        },
        { type: 'h3', text: '推奨重複ボーナス' },
        {
          type: 'p',
          text: '各サブステータスの重みを最大重みと比較してカテゴリ相当に分類し、「推奨」相当が何本あるかで加点します。良いサブステータスが複数噛み合った音骸を、単純な合計よりも高く評価するための補正です。',
        },
        {
          type: 'code',
          text: `weightToCategory(weight, maxWeight):
  rel = weight / maxWeight
  rel >= 0.85 → 推奨
  rel >= 0.50 → 優先
  rel >= 0.15 → 可
  else        → 不要

COMBO_BONUS = { 3本: +3, 4本: +7, 5本: +12 }`,
        },
        { type: 'h3', text: '最終スコア' },
        {
          type: 'code',
          text: `rawScore = round(substatScore + mainstatBonus + setBonus) + comboBonus
score    = clamp(rawScore, 0, 100)`,
        },
      ],
    },
    {
      title: '4. ランク判定：ドロップ分布のパーセンタイル',
      blocks: [
        {
          type: 'p',
          text: 'スコアの絶対値をそのままランクに変換すると、体感とのズレが生じます。13種類から等確率で5枠を引く抽選では、推奨5種を高いロールで引き当てる確率が極めて低く（推奨5種すべてを引くだけで約 0.08%）、実際には十分良いドロップでも中位ランクに沈んでしまうためです。',
        },
        {
          type: 'p',
          text: 'そこで、キャラクターと運用バリアントごとに事前計算したドロップスコア分布のパーセンタイルを閾値として使っています。推奨メインステータスと推奨ハーモニーセットを固定し、サブステータス5枠を完全ランダムに抽選する試行を 50万回繰り返してスコア分布を作り、上位X%に対応するスコアを閾値にしています。',
        },
        {
          type: 'table',
          head: ['ランク', '累積確率（上位）'],
          rows: [
            ['GOD', '0.01%'], ['S+', '1%'], ['S', '5%'], ['A', '15%'],
            ['B', '35%'], ['C', '65%'], ['D', 'それ未満'],
          ],
        },
        {
          type: 'p',
          text: 'つまり S ランクは「そのキャラクター向けのドロップとして上位5%に入る音骸」という意味になります。閾値データが無いキャラクターや運用では、固定スコア閾値（S+ ≥ 90 / S ≥ 75 / A ≥ 58 / B ≥ 42 / C ≥ 25、それ未満は D）にフォールバックします。',
        },
      ],
    },
    {
      title: '5. 採点方式の選択順',
      blocks: [
        { type: 'p', text: '採点方式は次の優先順位で選ばれます。' },
        {
          type: 'code',
          text: `1. キャラクター未指定       → 汎用カテゴリ採点
2. 運用バリアントのデータあり → 装備セットから運用を推定して
                              運用バリアント方式で採点
                              （基礎データ不足なら 3. へ）
3. それ以外                 → カテゴリ方式で採点`,
        },
        {
          type: 'p',
          text: '運用の推定は、装備中のハーモニーセットから最も一致度の高いものを選びます。運用が1つしか無ければそれを、複数ある場合は装備セットが「推奨」または「許容」に含まれるものを探し、見つからなければ先頭の運用を既定とします。',
        },
      ],
    },
    {
      title: '6. 2つの方式の比較',
      blocks: [
        {
          type: 'table',
          head: ['項目', 'カテゴリ方式', '運用バリアント方式'],
          rows: [
            ['重みの単位', '4段階の固定倍率（2.0 / 1.6 / 0.8 / 0.1）', 'ダメージ式偏微分による連続値'],
            ['分類の根拠', 'キャラごとに手動でリストアップ', '基礎ステータス・モチーフ武器・ダメージ内訳から自動算出'],
            ['理論最大値', '固定倍率（≈1.84）× 基準ロール', '重み上位N個 × 基準ロール比率の合計'],
            ['ランク判定', 'スコア絶対値の固定閾値', 'キャラ・運用別のドロップ分布パーセンタイル'],
            ['対応範囲', '全キャラクター', 'データが揃ったキャラクターのみ'],
          ],
        },
      ],
    },
    {
      title: '7. 上位%表示と分布グラフ',
      blocks: [
        {
          type: 'p',
          text: 'スコアの絶対値とランクの体感がズレる問題（たとえば50点台でもAランクになりうる）に対応するため、スコア表示の隣に「上位X%」をバッジで表示しています。あわせて、スコアごとの出現率をヒストグラムとして可視化しています（横軸がスコア、縦軸が出現率）。ランク帯を背景色で示し、自分のスコアが属する区間をハイライトします。グラフ上をホバーすると、任意の区間の出現率と上位%をその場で確認できます。',
        },
        {
          type: 'p',
          text: 'ヒストグラムの区間は、閾値の生成時にスコア 0〜100 を幅2で区切って集計した51要素の出現確率配列です。上位%は、別途保存している「上位% ↔ スコア」のサンプル列から対数線形補間で求めています。',
        },
      ],
    },
  ],
  footerNote: 'キャラクターごとの推奨セット・メインステータス・サブステータス優先度は',
  footerLink: 'キャラクター別ビルドデータ',
  footerSuffix: 'のページで一覧できます。',
};

const EN: FormulaContent = {
  title: 'How Echo Scores Are Calculated',
  lead: 'Every formula behind the scores and ranks this tool displays is published here. This is the technical breakdown for anyone who wants to check the reasoning behind the numbers.',
  back: '← Back to Simulator',
  sections: [
    {
      title: '1. Two Scoring Modes',
      blocks: [
        {
          type: 'p',
          text: 'Scores are produced one of two ways. The first sorts substats by hand into four buckets — recommended, preferred, acceptable, unnecessary — and applies a fixed multiplier per bucket (the "category mode" below). The second derives a continuous weight for each substat from the partial derivatives of the damage formula, given the character\'s base stats, signature weapon, and damage type breakdown (the "build variant mode").',
        },
        {
          type: 'p',
          text: 'In build variant mode the buckets themselves are inferred back out of the weights. Characters with the required data use this mode; the rest fall back to category mode automatically.',
        },
        {
          type: 'p',
          text: 'A "build variant" captures the fact that the same character plays as a main DPS, sub DPS, or support depending on the team, and that each of those wants different sets and stats. The closest matching variant is selected from the harmony set you have equipped.',
        },
      ],
    },
    {
      title: '2. Deriving the Weights',
      blocks: [
        { type: 'p', text: 'The damage formula assumed throughout is:' },
        {
          type: 'code',
          text: `DMG ∝ MainStat_total × (1 + %DMG_typeX) × CritMult
CritMult = 1 + critRate × critDmg`,
        },
        {
          type: 'p',
          text: 'The weight of a substat is the relative damage increase ΔDMG/DMG from adding one maximum roll of it. The absolute magnitude carries no meaning — only the ratios between substats matter, because everything is later divided by a theoretical maximum.',
        },
        { type: 'h3', text: 'Crit Rate and Crit DMG' },
        {
          type: 'p',
          text: 'The expected damage multiplier `1 + critRate × (critDmg − 1)` is differentiated with respect to crit rate and crit DMG separately. This is what makes crit rate lose weight automatically on a build where it is already high.',
        },
        {
          type: 'code',
          text: `cdBonus  = baselineCritDmg - 1        // portion above non-crit
critMult = 1 + baselineCritRate × cdBonus

weight[critRate] = (cdBonus × maxRollFraction(critRate)) / critMult
weight[critDmg]  = (baselineCritRate × maxRollFraction(critDmg)) / critMult`,
        },
        { type: 'h3', text: 'ATK% and Flat ATK (scaling stats)' },
        {
          type: 'p',
          text: 'A baseline for the other percentage buffs already stacked on the build is assumed (`0.45`), plus the character\'s own buffs and the signature weapon\'s substat when it grants ATK%. That total goes in the denominator: percentage stats dilute as they pile up, and that dilution is modelled explicitly.',
        },
        {
          type: 'code',
          text: `existingPctSum = 0.45 + selfAtkBuffPercent + weaponGivesScalingPct

weight[atkPercent] = maxRollFraction(atkPercent) / (1 + existingPctSum)
weight[atkFlat]    = maxRollFraction(atkFlat) / (totalMainStat × (1 + existingPctSum))
// totalMainStat = character base ATK (Lv90) + signature weapon base ATK (Lv90)`,
        },
        { type: 'h3', text: 'Attack type DMG% (basic / heavy / skill / liberation)' },
        {
          type: 'p',
          text: 'The share each attack type contributes to the character\'s total damage multiplies the weight directly. A heavy-attack character gets a correspondingly larger weight on Heavy ATK DMG%.',
        },
        {
          type: 'code',
          text: `weight[basicAttackDmg]    = maxRollFraction(basicAttackDmg)    × typeShares.basic
weight[heavyAttackDmg]    = maxRollFraction(heavyAttackDmg)    × typeShares.heavy
weight[resonanceSkillDmg] = maxRollFraction(resonanceSkillDmg) × typeShares.skill
weight[resonanceLibDmg]   = maxRollFraction(resonanceLibDmg)   × typeShares.lib`,
        },
        { type: 'h3', text: 'Energy Regen' },
        {
          type: 'p',
          text: 'Energy regen is a threshold stat: highly valuable until the rotation requirement is met, then close to worthless. It admits no linear approximation from the damage formula, so a static weight keyed to each variant\'s energy requirement is substituted instead, scaled to sit alongside the other weights (roughly 0.02 to 0.10).',
        },
        {
          type: 'table',
          head: ['Energy requirement', 'Weight'],
          rows: [['≤ 1.05', '0.02'], ['≤ 1.30', '0.05'], ['≤ 1.60', '0.08'], ['Above that', '0.11']],
        },
        {
          type: 'p',
          text: 'When base data for the weapon or character is missing, scoring falls back to category mode.',
        },
      ],
    },
    {
      title: '3. Computing the Score',
      blocks: [
        { type: 'h3', text: 'Substat contribution' },
        {
          type: 'code',
          text: `points = (sub.value / sub.maxValue) × weight[sub.key]  // roll ratio × weight`,
        },
        { type: 'h3', text: 'Theoretical maximum' },
        {
          type: 'p',
          text: 'The theoretical maximum fills every substat slot available at that cost with the highest-weighted stats at a "reference roll." That reference is the same for every stat: the 5/7 point of the eight-step value array. Using 5/7 rather than the maximum keeps the 100-point mark attainable — anchoring it to an all-perfect-rolls echo, which essentially never happens, would leave scores feeling detached from reality.',
        },
        {
          type: 'code',
          text: `REFERENCE_ROLL_FRACTION = 5 / 7
referenceRatio(key) = values[round(5/7 × (values.length-1))] / values[values.length-1]

topKeys        = weights sorted descending, first substatCount entries
theoreticalMax = Σ referenceRatio(k) × weight[k]   (k ∈ topKeys)

substatScore = (Σ points / theoreticalMax) × 100`,
        },
        { type: 'h3', text: 'Main stat adjustment' },
        {
          type: 'p',
          text: 'A penalty applies when the main stat does not match what that variant wants at that cost. An echo with great substats but a mismatched main stat is hard to justify slotting in practice.',
        },
        {
          type: 'table',
          head: ['Condition', 'Adjustment'],
          rows: [['Recommended main stat', '0'], ['Acceptable main stat', '−10'], ['Neither', '−25']],
        },
        { type: 'h3', text: 'Harmony set adjustment' },
        {
          type: 'table',
          head: ['Condition', 'Adjustment'],
          rows: [['Recommended set', '0'], ['Acceptable set', '−5'], ['Neither', '−10']],
        },
        { type: 'h3', text: 'Combo bonus' },
        {
          type: 'p',
          text: 'Each substat weight is compared against the highest weight and sorted into an equivalent bucket; a bonus is then added based on how many land in "recommended." This rewards echoes where several good substats line up, beyond what a plain sum would give.',
        },
        {
          type: 'code',
          text: `weightToCategory(weight, maxWeight):
  rel = weight / maxWeight
  rel >= 0.85 → recommended
  rel >= 0.50 → preferred
  rel >= 0.15 → acceptable
  else        → unnecessary

COMBO_BONUS = { 3 stats: +3, 4 stats: +7, 5 stats: +12 }`,
        },
        { type: 'h3', text: 'Final score' },
        {
          type: 'code',
          text: `rawScore = round(substatScore + mainstatBonus + setBonus) + comboBonus
score    = clamp(rawScore, 0, 100)`,
        },
      ],
    },
    {
      title: '4. Ranks: Percentiles of the Drop Distribution',
      blocks: [
        {
          type: 'p',
          text: 'Converting a raw score straight into a rank does not match how the grind feels. When five slots are drawn at equal probability from 13 types, hitting all five wanted stats at high rolls is vanishingly unlikely — landing all five at any roll is already about 0.08% — so genuinely good drops kept settling into middling ranks.',
        },
        {
          type: 'p',
          text: 'Instead, thresholds come from a drop score distribution precomputed per character and per build variant. Holding the recommended main stat and harmony set fixed, five substats are drawn completely at random across 500,000 trials, and the score at each top-X% cut becomes that rank\'s threshold.',
        },
        {
          type: 'table',
          head: ['Rank', 'Cumulative probability (top)'],
          rows: [
            ['GOD', '0.01%'], ['S+', '1%'], ['S', '5%'], ['A', '15%'],
            ['B', '35%'], ['C', '65%'], ['D', 'Below that'],
          ],
        },
        {
          type: 'p',
          text: 'So an S rank means "an echo in the top 5% of drops for this character." Characters and variants without threshold data fall back to fixed score cutoffs: S+ ≥ 90, S ≥ 75, A ≥ 58, B ≥ 42, C ≥ 25, and D below that.',
        },
      ],
    },
    {
      title: '5. Which Mode Gets Used',
      blocks: [
        { type: 'p', text: 'The scoring mode is chosen in this order.' },
        {
          type: 'code',
          text: `1. No character selected     → generic category scoring
2. Build variant data exists → infer the variant from the equipped set
                               and score in build variant mode
                               (fall through to 3 if base data is missing)
3. Otherwise                 → category scoring`,
        },
        {
          type: 'p',
          text: 'The variant is inferred from the equipped harmony set. With only one variant defined, that one is used; with several, the tool looks for one listing the equipped set as recommended or acceptable, and defaults to the first variant if none matches.',
        },
      ],
    },
    {
      title: '6. The Two Modes Side by Side',
      blocks: [
        {
          type: 'table',
          head: ['Aspect', 'Category mode', 'Build variant mode'],
          rows: [
            ['Weight unit', 'Four fixed multipliers (2.0 / 1.6 / 0.8 / 0.1)', 'Continuous, from the damage formula\'s partial derivatives'],
            ['Basis for sorting', 'Listed by hand per character', 'Computed from base stats, signature weapon, and damage breakdown'],
            ['Theoretical maximum', 'Fixed multiplier (≈1.84) × reference roll', 'Sum of the top N weights × reference roll ratio'],
            ['Rank determination', 'Fixed cutoffs on the raw score', 'Drop distribution percentiles per character and variant'],
            ['Coverage', 'All characters', 'Only characters with complete data'],
          ],
        },
      ],
    },
    {
      title: '7. Percentile Badge and Distribution Chart',
      blocks: [
        {
          type: 'p',
          text: 'To address the gap between a raw score and how the rank feels — a score in the 50s can still be an A — a "top X%" badge sits next to the score. Alongside it, a histogram plots how often each score occurs, with score on the horizontal axis and frequency on the vertical. Rank bands are shaded in the background and the bin holding your score is highlighted. Hovering any bin shows its frequency and percentile.',
        },
        {
          type: 'p',
          text: 'The histogram bins come from the same threshold generation run, tallying scores from 0 to 100 in steps of 2 into a 51-element frequency array. The percentile itself is interpolated log-linearly from a separately stored series mapping top-% to score.',
        },
      ],
    },
  ],
  footerNote: 'Recommended sets, main stats, and substat priorities for each character are listed on the',
  footerLink: 'build data by character',
  footerSuffix: 'page.',
};

export const SCORE_FORMULA: Record<Locale, FormulaContent> = { ja: JA, en: EN };
