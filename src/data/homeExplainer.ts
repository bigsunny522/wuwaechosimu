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
        '鳴潮（Wuthering Waves）の音骸は、1つのメインステータスと最大5つのサブステータスで構成されます。入手した時点でメインステータスが確定し、サブステータスは強化レベルが +5 上がるごとに1つずつ解放され、+25（MAX）で全てが出そろいます。',
        'このサブステータスがくせ者です。公式が公開している確率情報によると、サブステータスの種類は13種類あり、どれが選ばれるかは完全に均等（1種類あたり約 7.69%）です。しかも同じ音骸に同じ種類は重複しません。さらに種類が決まったあとで、その数値自体も8段階の幅からランダムに決まります。',
        'たとえばクリティカル率なら 6.3% から 10.5% まで、クリティカルダメージなら 12.6% から 21.0% までの幅があります。種類が当たっても数値が最低ロールなら、実戦での差は小さくありません。',
        'この「種類の抽選」と「数値の抽選」が二重にかかるため、狙った構成の音骸はまず出ません。仮に欲しいサブステータスを4種類に絞ったとしても、5枠すべてにその4種類が収まる確率は 13種類から5つを選ぶ組み合わせのうち9通り、つまり約 0.7%（およそ143個に1個）です。ここに数値の当たり外れが乗ります。この果てしない反復作業が、プレイヤーの間で「厳選」と呼ばれているものです。',
      ],
    },
    {
      heading: 'このツールでできること',
      paragraphs: [
        '実際にゲーム内で音骸を掘り続ける前に、どのくらいの試行でどのくらいの音骸が出るのかを、手元で確かめられるようにしたのがこのシミュレーターです。素材を1つも消費せずに、厳選の感触をつかめます。',
      ],
      bullets: [
        {
          term: '本物と同じ確率での強化シミュレーション',
          desc: 'メインステータスのコスト別プール、サブステータスの種類抽選、8段階の数値抽選まで、公開されている確率情報に沿って再現しています。COST 4・3・1 それぞれのメインステータスの出方の違いも反映されます。',
        },
        {
          term: 'キャラクター別のスコア評価',
          desc: 'キャラクターを指定すると、そのキャラクターにとっての価値でサブステータスが重み付けされます。同じ音骸でもメインアタッカーとサブアタッカーでは評価が変わります。',
        },
        {
          term: '100連一括シミュレーション',
          desc: 'まとめて回したときのスコア分布を見られます。「S+ を狙うなら何個掘る必要があるのか」を体感で理解するための機能です。',
        },
        {
          term: '厳選サポーターでの実測管理',
          desc: 'シミュレーションだけでなく、実際のゲームで出た音骸を記録して、残り枠にどのサブステータスが来る見込みかをベイズ推定で予測できます。強化を続けるか切るかの判断に使えます。',
        },
      ],
    },
    {
      heading: 'スコアの考え方',
      paragraphs: [
        'このツールのスコアは 0〜100 で表され、S+ から D までの6段階のランクに対応します。単純な合計値ではなく、次の手順で算出しています。',
      ],
      bullets: [
        {
          term: '1. 数値を Tier に正規化',
          desc: '各サブステータスの実数値を、そのステータスが取りうる最小値から最大値の範囲で T0（最低ロール）から T7（最高ロール）の8段階に置き換えます。クリティカル率の 8.7% とクリティカルダメージの 17.4% が同じ「4段階目」として扱われる、という考え方です。',
        },
        {
          term: '2. キャラクターごとの重みを掛ける',
          desc: 'ダメージ計算式をサブステータスごとに偏微分し、そのキャラクターの基礎ステータスとダメージタイプ構成のもとで「そのサブステータス1本がダメージを何%押し上げるか」を重みとして使います。クリティカル率が飽和しているビルドではクリティカル率の重みが自動的に下がります。',
        },
        {
          term: '3. メインステータスとセットの一致を加点',
          desc: 'そのキャラクターの推奨メインステータス、および推奨ハーモニーセットに一致していればボーナス補正が入ります。サブステータスが優秀でもメインステータスが噛み合っていない音骸は、実戦では使いにくいためです。',
        },
        {
          term: '4. 理論最大値との比で正規化',
          desc: '最後に、そのキャラクター・そのコストで理論上取りうる最大スコアとの比を取って 0〜100 に収めます。だからキャラクターが違ってもスコアを横並びで比較できます。',
        },
      ],
    },
    {
      heading: '使い方：3ステップ',
      paragraphs: [],
      bullets: [
        {
          term: 'ステップ1：コストと音骸を選ぶ',
          desc: 'COST 4・3・1 から選びます。COST 4 は音骸を直接指定でき、COST 3・1 はハーモニーセットを選ぶとそのセットに属する音骸から抽選されます。キャラクターを指定すると、推奨構成が自動で選ばれます。',
        },
        {
          term: 'ステップ2：入手して +25 まで強化する',
          desc: '「音骸を入手」でメインステータスが確定します。あとは「+5」を押していくだけです。1回ごとにサブステータスが1つ解放され、消費した素材の累計も表示されます。',
        },
        {
          term: 'ステップ3：スコアとランクを確認する',
          desc: '+25 に到達すると結果が表示されます。ランク、スコア、各サブステータスの Tier が一覧できます。画像として保存したり、そのまま共有したりできます。',
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
      q: 'スコアが低い音骸は使えないということですか？',
      a: 'そうとは限りません。スコアはあくまで「そのキャラクターのダメージへの寄与」を一つの基準で数値化したものです。実際には手持ちの音骸との兼ね合い、共鳴効率の要求値、コンテンツの内容によって最適解は変わります。B ランクでも、共鳴効率が足りている構成ならメインで使い続ける価値があります。',
    },
    {
      q: 'スコアの計算方法をもっと詳しく知りたいです。',
      a: '「スコア計算方法」のページで、重みの導出式からランクのしきい値まで全て公開しています。どのサブステータスにどの重みが掛かっているかを確認できます。',
    },
    {
      q: '記録したデータはどこに保存されますか？',
      a: '厳選サポーターに記録した内容は、ブラウザ内（localStorage）にのみ保存されます。サーバーへは送信していません。ブラウザのデータを消去すると記録も消えます。なお、シミュレーターの「保存」枠に入れた結果はページを開いている間だけ保持され、リロードすると消えるため、残しておきたい結果は画像として保存してください。',
    },
    {
      q: '利用料はかかりますか？会員登録は必要ですか？',
      a: 'どちらも不要です。全ての機能を登録なしで無料で利用できます。ボーナスタイムや保存枠の追加も含め、料金や条件は一切ありません。',
    },
  ],
  moreHeading: 'もっと詳しく',
  moreLinks: [
    { href: '/guide', label: '使い方ガイド', desc: '全機能の詳しい操作手順とボーナスタイムの使い方' },
    { href: '/score-formula', label: 'スコア計算方法', desc: '重みの導出式・Tier評価・ランクしきい値の全公開' },
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
        'An echo in Wuthering Waves has one main stat and up to five substats. The main stat is fixed the moment you obtain the echo. The substats unlock one at a time, once every five upgrade levels, until the echo reaches +25 and all of them are visible.',
        'The substats are where the difficulty lives. According to the official probability disclosure, there are 13 substat types and each one is equally likely to be selected — roughly 7.69% each. No type repeats on the same echo. Once a type is chosen, its actual value is then rolled from one of eight possible steps.',
        'Crit Rate, for example, lands somewhere between 6.3% and 10.5%. Crit DMG ranges from 12.6% to 21.0%. Rolling the right stat at the lowest step is a meaningfully worse outcome than rolling it at the highest.',
        'Because the type lottery and the value lottery stack, the echo you actually want almost never shows up. Even if you narrow your wishlist to four substat types, the odds that all four land within the five slots are 9 out of the 1,287 ways to pick 5 types from 13 — about 0.7%, or roughly 1 echo in 143. The value rolls are on top of that. This grind is what players call "echo farming."',
      ],
    },
    {
      heading: 'What This Tool Does',
      paragraphs: [
        'This simulator lets you find out how many attempts a given result takes before you spend anything in game. You can get a feel for the grind without burning a single upgrade material.',
      ],
      bullets: [
        {
          term: 'Upgrade simulation at the real rates',
          desc: 'Main stat pools per cost, substat type selection, and the eight-step value roll all follow the published probability data. The differences between COST 4, 3, and 1 main stat pools are reflected too.',
        },
        {
          term: 'Per-character scoring',
          desc: 'Pick a character and substats are weighted by what they are actually worth to that character. The same echo scores differently for a main DPS than it does for a sub DPS.',
        },
        {
          term: '100-pull batch simulation',
          desc: 'See the score distribution across a large run. This is the feature that answers "how many echoes do I realistically need to farm for an S+?"',
        },
        {
          term: 'Tracking real results in the Supporter',
          desc: 'Beyond simulation, you can log the echoes you actually pulled in game and get a Bayesian estimate of what the remaining slots are likely to roll — useful for deciding whether to keep upgrading or cut your losses.',
        },
      ],
    },
    {
      heading: 'How Scoring Works',
      paragraphs: [
        'Scores run from 0 to 100 and map onto six ranks, S+ down to D. The number is not a simple sum. It is built in four steps.',
      ],
      bullets: [
        {
          term: '1. Normalize each value into a tier',
          desc: 'Each substat value is rescaled across that stat\'s own minimum-to-maximum range into eight tiers, T0 (lowest roll) through T7 (highest). This is what lets 8.7% Crit Rate and 17.4% Crit DMG both count as "the fourth step up."',
        },
        {
          term: '2. Apply per-character weights',
          desc: 'The damage formula is differentiated with respect to each substat, given that character\'s base stats and damage type breakdown, to find how much one roll of that substat actually raises damage. On a build where crit rate is already saturated, its weight drops automatically.',
        },
        {
          term: '3. Reward main stat and set matches',
          desc: 'A bonus applies when the echo matches the character\'s recommended main stat and harmony set. An echo with great substats but a mismatched main stat is hard to justify slotting in practice.',
        },
        {
          term: '4. Normalize against the theoretical maximum',
          desc: 'Finally the raw total is divided by the highest score theoretically reachable for that character and cost, producing the 0-100 figure. That is what makes scores comparable across different characters.',
        },
      ],
    },
    {
      heading: 'Three Steps to Get Started',
      paragraphs: [],
      bullets: [
        {
          term: 'Step 1: Pick a cost and an echo',
          desc: 'Choose COST 4, 3, or 1. At COST 4 you name the echo directly; at COST 3 and 1 you pick a harmony set and the echo is drawn from that set. Selecting a character fills in the recommended setup for you.',
        },
        {
          term: 'Step 2: Obtain it and upgrade to +25',
          desc: '"Get Echo" locks in the main stat. From there you just press "+5" repeatedly. Each press unlocks one more substat, and the running material cost is tracked as you go.',
        },
        {
          term: 'Step 3: Read the score and rank',
          desc: 'At +25 the result appears with the rank, the score, and the tier of every substat. You can save it as an image or share it directly.',
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
      q: 'Does a low score mean the echo is unusable?',
      a: 'Not necessarily. The score quantifies one thing: contribution to that character\'s damage. In practice the best choice also depends on what else you have equipped, how much energy regen your rotation needs, and the content you are running. A B-rank echo can be worth keeping if it is what gets your energy requirement met.',
    },
    {
      q: 'Can I see the scoring math in detail?',
      a: 'Yes. The "Scoring Method" page publishes everything from the weight derivation to the rank thresholds, so you can check exactly which weight is applied to which substat.',
    },
    {
      q: 'Where is my tracked data stored?',
      a: 'Records you enter in the Farming Supporter are stored only in your browser, via localStorage. Nothing is sent to a server, and clearing your browser data clears the records. Results placed in the simulator\'s save slots are kept only while the page stays open and are lost on reload, so download anything you want to keep as an image.',
    },
    {
      q: 'Is there any cost or sign-up?',
      a: 'Neither. Every feature is free and requires no account. That includes bonus time and additional save slots — there are no fees and no conditions attached.',
    },
  ],
  moreHeading: 'Read More',
  moreLinks: [
    { href: '/guide', label: 'How to Use', desc: 'Full walkthrough of every feature and how bonus time works' },
    { href: '/score-formula', label: 'Scoring Method', desc: 'Weight derivation, tier evaluation, and rank thresholds in full' },
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
