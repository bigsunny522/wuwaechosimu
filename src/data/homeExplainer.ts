import type { Locale } from '@/lib/locale-utils';

/**
 * トップページ下部の解説セクションの文言。
 * 数値は src/data/substats.ts・src/data/mainstats.ts の実装値と一致させること。
 */

export interface ExplainerBlock {
  heading: string;
  paragraphs: string[];
  /** 箇条書き。省略可 */
  bullets?: { term: string; desc: string }[];
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface ExplainerContent {
  sectionLabel: string;
  blocks: ExplainerBlock[];
  faqHeading: string;
  faq: FaqItem[];
  moreHeading: string;
  moreLinks: { href: string; label: string; desc: string }[];
}

const JA: ExplainerContent = {
  sectionLabel: '音骸厳選ガイド',
  blocks: [
    {
      heading: '音骸厳選とは',
      paragraphs: [
        '鳴潮の音骸は、メインステータス1つとサブステータス最大5つで構成されます。サブステータスは13種類から均等な確率で選ばれ、数値も8段階の幅でランダムに決まるため、狙った構成の音骸はなかなか出ません。',
      ],
    },
    {
      heading: 'このツールでできること',
      paragraphs: [
        '素材を消費せずに、厳選の感触を手元で確かめられます。',
      ],
      bullets: [
        {
          term: '本物と同じ確率での強化シミュレーション',
          desc: '公開されている確率情報に沿って、メインステ・サブステの抽選を再現します。',
        },
        {
          term: 'キャラクター別のスコア評価',
          desc: 'キャラクターを指定すると、そのキャラにとっての価値でサブステータスが評価されます。',
        },
        {
          term: '100連一括シミュレーション',
          desc: 'まとめて回したときのスコア分布を確認できます。',
        },
        {
          term: '厳選サポーターでの実測管理',
          desc: '実際に出た音骸を記録し、残り枠の見込みを予測できます。',
        },
      ],
    },
    {
      heading: 'スコアの考え方',
      paragraphs: [
        'スコアは0〜100で算出され、S+〜Dの6段階のランクに対応します。キャラクターごとの重み付けやメインステータス・セットとの相性をもとに算出しており、詳しい考え方は「スコア計算方法」のページで解説しています。',
      ],
    },
    {
      heading: '使い方：3ステップ',
      paragraphs: [],
      bullets: [
        {
          term: 'ステップ1：コストと音骸を選ぶ',
          desc: 'COST 4・3・1 から選びます。キャラクターを指定すると推奨構成が自動で選ばれます。',
        },
        {
          term: 'ステップ2：入手して +25 まで強化する',
          desc: '「音骸を入手」でメインステータスが確定し、あとは「+5」を押していくだけです。',
        },
        {
          term: 'ステップ3：スコアとランクを確認する',
          desc: '+25 に到達すると結果が表示されます。画像として保存・共有もできます。',
        },
      ],
    },
  ],
  faqHeading: 'よくある質問',
  faq: [
    {
      q: '確率データはどこから取っていますか？',
      a: 'サブステータスの種類選択が13種類均等（各 7.6923%）である点は、Kuro Games が公開している公式の確率公示に基づいています。数値の8段階、コスト別のメインステータスプール、各ステータスの最小値・最大値は、ゲーム内で実際に確認できる値をもとに設定しています。',
    },
    {
      q: 'ゲーム内の結果とまったく同じになりますか？',
      a: 'いいえ。これは確率モデルに基づくシミュレーションであり、実際の抽選結果を再現するものではありません。非公式のファンツールのため、ゲームのアップデートによって実装との差異が生じる場合もあります。厳選の目安を掴むための道具として使ってください。',
    },
    {
      q: '利用料はかかりますか？会員登録は必要ですか？',
      a: 'どちらも不要です。全ての機能を登録なしで無料で利用できます。ボーナスタイムや保存枠の追加も含め、料金や条件は一切ありません。',
    },
  ],
  moreHeading: 'もっと詳しく',
  moreLinks: [
    { href: '/guide', label: '使い方ガイド', desc: '全機能の詳しい操作手順とボーナスタイムの使い方' },
    { href: '/score-formula', label: 'スコア計算方法', desc: '採点の考え方をわかりやすく解説' },
    { href: '/chardb', label: 'キャラ別ビルドデータ', desc: '全キャラクターの推奨セット・メインステ・サブステ優先度' },
    { href: '/supporter', label: '厳選サポーター', desc: '実際に出た音骸を記録してベイズ推定で残り枠を予測' },
  ],
};

const EN: ExplainerContent = {
  sectionLabel: 'Echo Farming Guide',
  blocks: [
    {
      heading: 'What Echo Farming Is',
      paragraphs: [
        'An echo in Wuthering Waves has one main stat and up to five substats. Substats are drawn evenly from 13 types and their values are rolled across eight possible steps, so an echo with exactly the substats you want rarely shows up.',
      ],
    },
    {
      heading: 'What This Tool Does',
      paragraphs: [
        'Get a feel for the grind without spending a single upgrade material.',
      ],
      bullets: [
        {
          term: 'Upgrade simulation at the real rates',
          desc: 'Main stat and substat rolls follow the published probability data.',
        },
        {
          term: 'Per-character scoring',
          desc: 'Pick a character and substats are weighted by what they are actually worth to that character.',
        },
        {
          term: '100-pull batch simulation',
          desc: 'See the score distribution across a large run.',
        },
        {
          term: 'Tracking real results in the Supporter',
          desc: 'Log the echoes you actually pulled and get a prediction for the remaining slots.',
        },
      ],
    },
    {
      heading: 'How Scoring Works',
      paragraphs: [
        'Scores run from 0 to 100 and map onto six ranks, S+ down to D. They are based on per-character weighting and how well the main stat and harmony set match — see the "Scoring Method" page for the full explanation.',
      ],
    },
    {
      heading: 'Three Steps to Get Started',
      paragraphs: [],
      bullets: [
        {
          term: 'Step 1: Pick a cost and an echo',
          desc: 'Choose COST 4, 3, or 1. Selecting a character fills in the recommended setup for you.',
        },
        {
          term: 'Step 2: Obtain it and upgrade to +25',
          desc: '"Get Echo" locks in the main stat, then just press "+5" repeatedly.',
        },
        {
          term: 'Step 3: Read the score and rank',
          desc: 'At +25 the result appears. You can save it as an image or share it directly.',
        },
      ],
    },
  ],
  faqHeading: 'Frequently Asked Questions',
  faq: [
    {
      q: 'Where does the probability data come from?',
      a: 'The equal 7.6923% selection chance across all 13 substat types comes from the official probability disclosure published by Kuro Games. The eight value steps, the main stat pools per cost, and each stat\'s minimum and maximum are set from values observable in game.',
    },
    {
      q: 'Will results match the game exactly?',
      a: 'No. This is a simulation built on a probability model, not a reproduction of the game\'s actual rolls. It is an unofficial fan tool, so game updates can introduce discrepancies. Treat it as a way to gauge the grind, not as a guarantee.',
    },
    {
      q: 'Is there any cost or sign-up?',
      a: 'Neither. Every feature is free and requires no account. That includes bonus time and additional save slots — there are no fees and no conditions attached.',
    },
  ],
  moreHeading: 'Read More',
  moreLinks: [
    { href: '/guide', label: 'How to Use', desc: 'Full walkthrough of every feature and how bonus time works' },
    { href: '/score-formula', label: 'Scoring Method', desc: 'A clear explanation of how scoring works' },
    { href: '/chardb', label: 'Build Data by Character', desc: 'Recommended sets, main stats, and substat priorities for every character' },
    { href: '/supporter', label: 'Farming Supporter', desc: 'Log real echoes and predict remaining slots with Bayesian estimation' },
  ],
};

export const HOME_EXPLAINER: Record<Locale, ExplainerContent> = { ja: JA, en: EN };

/** FAQ を schema.org の FAQPage 構造化データに変換する */
export function buildFaqJsonLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOME_EXPLAINER[locale].faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}
