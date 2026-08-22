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
  lead: 'このツールが表示するスコアとランクを、どのような考え方で算出しているかを紹介します。',
  back: '← シミュレーターへ',
  sections: [
    {
      title: '1. 採点の考え方',
      blocks: [
        {
          type: 'p',
          text: 'スコアの算出には2つの方式があります。ひとつは、サブステータスを「推奨 / 優先 / 可 / 不要」の4区分に手動で分類し、区分ごとの倍率を掛ける方式です。もうひとつは、キャラクターの基礎ステータスやダメージタイプの内訳から、そのキャラクターにとって各サブステータスがどれだけダメージに貢献するかを算出し、連続的な重みとして扱う方式です。必要なデータが揃っているキャラクターには後者が使われ、揃っていない場合は前者にフォールバックします。',
        },
        {
          type: 'p',
          text: '重みの大きさは、そのサブステータスをどれだけ重視するかを表します。たとえばクリティカル率とクリティカルダメージは、ビルドの状態に応じてどちらを重視すべきかが変わるため、既に片方が十分に高いビルドではもう片方の重みが自動的に高くなります。攻撃力%や攻撃種別ダメージ%も、キャラクターの構成に応じて重みが変化します。共鳴効率のように、一定値に届くまでは重要でもそれ以降はあまり意味を持たないステータスも考慮しています。',
        },
        {
          type: 'p',
          text: '最終的なスコアは、各サブステータスの実際のロール値と重みから貢献度を積み上げ、そのキャラクター・コストで理論上取りうる最大値との比率をもとに0〜100へ変換しています。さらに、推奨メインステータスや推奨ハーモニーセットに合致しているかで補正が入り、価値の高いサブステータスが複数そろっている場合はボーナスが加算されます。',
        },
      ],
    },
    {
      title: '2. ランクの決め方',
      blocks: [
        {
          type: 'p',
          text: 'スコアの絶対値をそのままランクに変換すると、体感とズレが生じます。理想の構成を引き当てる確率はキャラクターや運用によって大きく異なるため、同じ点数でもキャラクターによって「良いドロップ」かどうかが変わるからです。',
        },
        {
          type: 'p',
          text: 'そこで、データが揃っているキャラクター・運用については、あらかじめ大量のシミュレーションを行ってスコアの分布を作り、その分布の中で自分のスコアが上位何%に入るかでランクを決めています。S ランクは「そのキャラクター向けのドロップとして上位に入る」音骸という意味です。分布データがまだ無いキャラクターや運用では、固定のスコア区分にフォールバックします。',
        },
      ],
    },
    {
      title: '3. なぜこの方式なのか',
      blocks: [
        {
          type: 'p',
          text: '単純にサブステータスの数値を合計するだけでは、キャラクターごとの得意不得意やビルドの状態を反映できません。このツールでは、ダメージへの実際の影響度をもとに評価することで、「そのキャラクターにとって本当に良い音骸か」をできるだけ正確に判定することを目指しています。',
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
  lead: 'Here is an overview of how this tool arrives at the scores and ranks it displays.',
  back: '← Back to Simulator',
  sections: [
    {
      title: '1. How Scoring Works',
      blocks: [
        {
          type: 'p',
          text: 'Scores are produced one of two ways. The first sorts substats by hand into four buckets — recommended, preferred, acceptable, unnecessary — and applies a multiplier per bucket. The second derives a weight for each substat from the character\'s base stats and damage type breakdown, capturing how much that substat actually contributes to that character\'s damage. Characters with the required data use the second mode; the rest fall back to the first automatically.',
        },
        {
          type: 'p',
          text: 'The size of a weight reflects how much a substat should be prioritized. Crit Rate and Crit DMG, for example, trade off against each other depending on the build — once one is already high, the other\'s weight rises automatically. ATK% and attack-type DMG% shift with the character\'s kit as well. Threshold-like stats, such as Energy Regen, are also accounted for: valuable until a target is met, then far less so.',
        },
        {
          type: 'p',
          text: 'The final score adds up each substat\'s actual roll weighted this way, then converts that total into a 0–100 figure relative to the highest score theoretically reachable for that character and cost. A bonus or penalty applies depending on whether the main stat and harmony set match what\'s recommended, and echoes with several high-value substats get an additional boost.',
        },
      ],
    },
    {
      title: '2. How Ranks Are Determined',
      blocks: [
        {
          type: 'p',
          text: 'Converting a raw score straight into a rank does not match how the grind feels, because the odds of landing an ideal roll vary a lot by character and build — the same score can mean a very different thing depending on who it\'s for.',
        },
        {
          type: 'p',
          text: 'So for characters and builds with enough data, ranks come from a large number of precomputed simulations: your score is placed within that distribution, and the rank reflects roughly where it lands. An S rank means the echo is near the top of what that character can realistically drop. Characters or builds without that data fall back to fixed score cutoffs.',
        },
      ],
    },
    {
      title: '3. Why This Approach',
      blocks: [
        {
          type: 'p',
          text: 'Simply adding up substat values would ignore how much each one actually matters to a specific character and build. By weighting substats according to their real contribution to damage, this tool aims to judge as accurately as possible whether an echo is genuinely good for the character you\'re building.',
        },
      ],
    },
  ],
  footerNote: 'Recommended sets, main stats, and substat priorities for each character are listed on the',
  footerLink: 'build data by character',
  footerSuffix: 'page.',
};

export const SCORE_FORMULA: Record<Locale, FormulaContent> = { ja: JA, en: EN };
