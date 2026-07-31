export interface UpdateEntry {
  id: string;
  date: string;
  title: { ja: string; en: string };
  items: Array<{ ja: string; en: string }>;
  /** ポップアップ左側のリンクボタン（未指定なら「更新履歴を見る」/news にフォールバック） */
  link?: {
    href: string;
    label: { ja: string; en: string };
  };
}

export const UPDATES: UpdateEntry[] = [
  {
    id: '2026-07-31',
    date: '2026-07-31',
    title: { ja: '穂穂（スイスイ）のビルドデータを追加', en: 'Added Build Data for Suisui' },
    items: [
      {
        ja: '穂穂（スイスイ）を追加しました',
        en: 'Added Suisui',
      },
    ],
    link: {
      href: '/chardb',
      label: { ja: 'キャラ別ビルドデータを見る', en: 'View the Build Data' },
    },
  },
  {
    id: '2026-07-27',
    date: '2026-07-27',
    title: { ja: '解説コンテンツを大幅に追加', en: 'Major Documentation Update' },
    items: [
      {
        ja: 'スコアの算出方法を全公開する「スコア計算方法」ページを公開しました',
        en: 'Published the "Scoring Method" page, documenting every formula behind the scores',
      },
      {
        ja: '全42キャラクターの推奨セット・メインステ・サブステ優先度をまとめた「キャラクター別ビルドデータ」ページを公開しました',
        en: 'Published "Echo Build Data by Character" with recommended sets, main stats, and substat priorities for all 42 characters',
      },
      {
        ja: 'トップページに音骸厳選の仕組みとスコアの考え方の解説を追加しました',
        en: 'Added an explainer on the home page covering how echo farming works and how scoring is derived',
      },
      {
        ja: '運営方針・データ出典・免責事項を記載した「このサイトについて」ページを追加しました',
        en: 'Added an "About This Site" page covering how the site is run, its data sources, and its disclaimers',
      },
      {
        ja: 'ボーナスタイムと保存枠を、条件なしで誰でも開放できるように変更しました',
        en: 'Bonus time and save slots can now be unlocked by anyone, with no conditions attached',
      },
      {
        ja: '使い方ガイドのランク基準の記載を実際の判定ロジックに合わせて修正しました',
        en: 'Corrected the rank thresholds listed in the guide to match the actual scoring logic',
      },
    ],
    link: {
      href: '/score-formula',
      label: { ja: 'スコア計算方法を見る', en: 'View the Scoring Method' },
    },
  },
  {
    id: '2026-07-24',
    date: '2026-07-24',
    title: { ja: 'サイトテーマの切り替えに対応', en: 'Site Theme Switcher' },
    items: [
      {
        ja: 'ブルーとゴールドの2種類からサイトの配色を選べるようにしました',
        en: 'Added a choice of two color themes, Blue and Gold',
      },
      {
        ja: 'ボタンの押下時の反応を調整し、操作感を改善しました',
        en: 'Refined button press feedback for a more responsive feel',
      },
    ],
  },
  {
    id: '2026-07-17',
    date: '2026-07-17',
    title: { ja: 'スコア分布グラフを追加', en: 'Score Distribution Chart' },
    items: [
      {
        ja: '結果画面に、そのキャラクター向けドロップのスコア分布をヒストグラムで表示するようにしました',
        en: 'The result view now plots the score distribution of drops for that character as a histogram',
      },
      {
        ja: '自分のスコアが上位何%に当たるかをバッジで表示するようにしました',
        en: 'Added a badge showing what percentile your score falls into',
      },
      {
        ja: '画像書き出しにもスコア分布グラフを含めるようにしました',
        en: 'Exported result images now include the distribution chart as well',
      },
    ],
  },
  {
    id: '2026-07-12',
    date: '2026-07-12',
    title: { ja: 'ツールを公開しました', en: 'Site Launched' },
    items: [
      { ja: '音骸の強化・スコア計算をゲーム感覚で試せる「ガチャ」機能を公開', en: 'Released the "Gacha" simulator for echo farming and score calculation' },
      { ja: '実際の厳選結果を記録し、確率的に予測する「厳選サポーター」を公開', en: 'Released "Selection Supporter" to log your real pulls and get probability-based predictions' },
      { ja: 'キャラクター別のサブステ評価・おすすめメインステータスに対応', en: 'Added per-character substat evaluation and recommended main stats' },
      { ja: '日本語・英語の両方に対応', en: 'Available in both Japanese and English' },
    ],
    link: {
      href: '/guide',
      label: { ja: '使い方ガイドを見る', en: 'View How to Use' },
    },
  },
];

export const LATEST_UPDATE_ID = UPDATES[0].id;
