'use client';

import Link from 'next/link';
import { useLocale, withLang } from '@/lib/locale';
import EchoIcon from '@/components/EchoIcon';
import AdBanner from '@/components/AdBanner';
import NativeBanner from '@/components/NativeBanner';

const ACCENT = '#0275fd';

// ── Bilingual guide content ──────────────────────────────────────────────────
const GUIDE = {
  ja: {
    backBtn: '← ホームへ戻る',
    hero: {
      tag:   '使い方ガイド',
      title: '音骸シミュレーター\n完全ガイド',
      sub:   '鳴潮の音骸厳選を効率よく行うための全機能を解説します',
    },
    labels: {
      steps: '基本の使い方',
      rank:  'スコアシステム',
      bonus: 'ボーナスタイム',
      save:  '保存・シェア',
      faq:   'よくある質問',
    },
    steps: [
      {
        num: '01', icon: '🎯',
        title: 'コストと音骸を選ぶ',
        body:  'COST 4・3・1 から音骸のコストを選択します。COST 4 は個別の音骸を直接指定でき、COST 3・1 はハーモニーセット（セット効果）を選ぶとそのセットに属する音骸からランダムに抽選されます。',
        chips: ['COST 4 → サブステ最大 5 個', 'COST 3 / 1 → ハーモニーセットで抽選'],
      },
      {
        num: '02', icon: '👤',
        title: 'キャラクターを選ぶ（任意）',
        body:  'キャラクターを指定すると、そのキャラクター向けのスコア評価に切り替わります。推奨サブステに応じた重み付けでスコアが計算され、より実戦的な評価が得られます。',
        chips: ['汎用スコア → キャラなし', 'キャラ指定 → 専用評価'],
      },
      {
        num: '03', icon: '✦',
        title: '音骸を入手する',
        body:  '「✦ 音骸を入手」をタップします。メインステータスが決まり、サブステータスは +5 強化のたびに 1 つずつ確定していきます。',
        chips: ['メインステータス確定', 'サブステは +5 ごとに解放'],
      },
      {
        num: '04', icon: '⚡',
        title: '+25 まで強化する',
        body:  '「+5 → +X」ボタンを押すと 5 レベルずつ強化されます。+25（MAX）まで強化するとすべてのサブステが解放されてスコアが確定します。ボーナスタイム中は一括強化も使えます。',
        chips: ['+5 ごとにサブステ追加', '+25 でスコア確定'],
      },
      {
        num: '05', icon: '📊',
        title: 'スコアを確認・保存する',
        body:  '+25 になると結果ポップアップが表示されます。S+ ～ D のランクと 0〜100 のスコアで評価されます。画像保存・X シェア・アプリ内保存がそのまま行えます。',
        chips: ['ランクは上位%で判定', 'S = 上位 5%', 'S+ = 上位 1%'],
      },
    ],
    rankSection: {
      title: 'ランク評価基準',
      scoreNote: '各サブステータスの数値を最小〜最大の範囲で Tier 評価し、キャラクターごとの重みを掛けて合算します。推奨メインステータスおよび推奨ハーモニーセットに合致しない場合は減点され、良いサブステータスが複数噛み合った場合は加点されます。\n\nランクの区切りは、データが揃っているキャラクターではドロップ分布のパーセンタイルで決まります。たとえば S ランクは「そのキャラクター向けのドロップとして上位5%に入る」という意味です。そのためスコアの絶対値が同じでも、キャラクターによってランクが変わることがあります。下表は、分布データがまだ無いキャラクターに使われる固定の区切りです。',
      ranks: [
        { rank: 'S+', range: '90〜100',  color: '#f59e0b', bg: '#fef3c7' },
        { rank: 'S',  range: '75〜89',   color: '#10b981', bg: '#d1fae5' },
        { rank: 'A',  range: '58〜74',   color: '#3b82f6', bg: '#dbeafe' },
        { rank: 'B',  range: '42〜57',   color: '#8b5cf6', bg: '#ede9fe' },
        { rank: 'C',  range: '25〜41',   color: '#6b7280', bg: '#f3f4f6' },
        { rank: 'D',  range: '0〜24',    color: '#9ca3af', bg: '#f9fafb' },
      ],
    },
    bonusSection: {
      title: 'ボーナスタイムで厳選を加速',
      sub:   'ヘッダーの「ボーナス」から短い広告（15秒）を見るだけで 5 分間の特典を解放できます',
      items: [
        {
          icon: '🔒', title: 'メインステータス固定',
          color: ACCENT, bg: '#eef9ff',
          body: '次に引く音骸のメインステを好きな値に固定できます。狙ったメインステの音骸だけを効率よく厳選できます。',
        },
        {
          icon: '🎲', title: 'サブステ再抽選（1 回限り）',
          color: '#a855f7', bg: '#f5f3ff',
          body: '+25 まで強化した音骸のサブステを最大 3 個まで選んで 1 回だけ引き直せます。惜しかった音骸を救済できます。',
        },
        {
          icon: '⚡', title: '一括強化（+25 まで）',
          color: '#f59e0b', bg: '#fffbeb',
          body: '「⚡ +25 まで強化」ボタンが出現し、ワンタップで一気に +25 まで強化できます。',
        },
      ],
    },
    saveSection: {
      title: '結果の保存・シェア',
      items: [
        {
          icon: '📋', title: '結果を保存',
          body: '+25 音骸のスコアをアプリ内に保存できます。保存枠は無料で 10 枠ずつ追加できます。ヘッダーの「履歴」から一覧確認できます。',
        },
        {
          icon: '💾', title: '画像保存',
          body: 'スコアカードを PNG 画像でダウンロードできます。すべてのサブステとランクが 1 枚にまとまります。',
        },
        {
          icon: '𝕏', title: 'X シェア',
          body: 'スコアと音骸情報をワンクリックでツイートできます。S+ が出たらシェアしてみましょう。',
        },
      ],
    },
    faq: {
      items: [
        {
          q: 'このツールのデータは正確ですか？',
          a: 'サブステの種類が13種類から均等（各 7.6923%）に抽選される点は、Kuro Games が公開している公式の確率公示に基づいています。数値の8段階とコスト別のメインステプールは、ゲーム内で確認できる値をもとに設定しています。非公式ファンツールのため、アップデート直後は実装との差異が生じる場合があります。',
        },
        {
          q: 'スコア計算の「Tier」とは何ですか？',
          a: '各サブステの数値をそのステータスの最小〜最大の範囲で正規化した評価です。T0（最低）〜T7（最高）の 8 段階があり、スコア計算の重み付けの基礎になります。たとえばクリティカル率は 6.3%（T0）から 10.5%（T7）まで、クリティカルダメージは 12.6%（T0）から 21.0%（T7）までの幅があります。',
        },
        {
          q: 'サブステに同じ種類が2回出ることはありますか？',
          a: 'ありません。1つの音骸に同じ種類のサブステが重複することはなく、13種類から重複なしで抽選されます。そのため COST 4 の5枠は、13種類から5つを選ぶ組み合わせ（1,287通り）のいずれかになります。',
        },
        {
          q: '狙ったサブステが揃う確率はどのくらいですか？',
          a: '欲しいサブステを4種類に絞った場合、その4種類すべてが5枠に収まる確率は 1,287通りのうち9通り、約 0.7%（およそ143個に1個）です。ここにさらに数値ロールの当たり外れが乗ります。1つの音骸に期待しすぎず、試行回数を稼ぐ前提で考えるのが現実的です。',
        },
        {
          q: '再抽選（リロール）とは何ですか？',
          a: 'ボーナスタイム中に +25 音骸のサブステを最大 3 個まで選び、もう一度ランダムで引き直す機能です。1 音骸につき 1 回限り、ボーナスタイム中のみ使用できます。引き直した結果が元より悪くなることもあります。',
        },
        {
          q: '保存した結果はどこに保存されますか？',
          a: 'ブラウザのメモリ上に保存されます。ページをリロードまたは閉じると消えます。重要な結果は「💾 画像保存」でダウンロードしておくことをお勧めします。なお、厳選サポーターに記録した内容はブラウザ内（localStorage）に保存されるため、リロードしても残ります。',
        },
        {
          q: 'COST 4 と COST 3・1 の違いは何ですか？',
          a: 'COST 4 は特定の音骸名を直接指定できます。COST 3・1 はハーモニーセットを選択し、そのセットに属する音骸からランダムに抽選されます。またコストによってメインステータスの候補も異なり、クリティカル率・クリティカルダメージがメインステータスに出るのは COST 4 のみです。',
        },
        {
          q: '厳選サポーターは何が違うのですか？',
          a: 'シミュレーターが「架空の音骸を引いて試す」機能なのに対し、厳選サポーターは「実際のゲームで出た音骸を記録して管理する」機能です。判明済みのサブステを入力すると、残りの枠に何が来る見込みかをベイズ推定で予測します。強化を続けるか途中で切るかの判断材料になります。',
        },
        {
          q: 'PC とスマホどちらでも使えますか？',
          a: 'はい、どちらでもご利用いただけます。スマホでも 1 画面に収まるよう最適化されています。',
        },
      ],
    },
    cta: {
      title: 'さっそく厳選を始めよう',
      sub:   '無料で使えます。アカウント不要。',
      btn:   '✦ シミュレーターを開く',
    },
  },

  en: {
    backBtn: '← Back to Home',
    hero: {
      tag:   'How to Use',
      title: 'Echo Simulator\nComplete Guide',
      sub:   'Everything you need to efficiently farm echoes in Wuthering Waves',
    },
    labels: {
      steps: 'Getting Started',
      rank:  'Score System',
      bonus: 'Bonus Time',
      save:  'Save & Share',
      faq:   'FAQ',
    },
    steps: [
      {
        num: '01', icon: '🎯',
        title: 'Choose Cost & Echo',
        body:  'Select COST 4, 3, or 1. COST 4 lets you pick a specific echo by name. COST 3 and 1 use Sonata Sets — a random echo from that set is drawn each pull.',
        chips: ['COST 4 → up to 5 substats', 'COST 3 / 1 → Sonata Set draw'],
      },
      {
        num: '02', icon: '👤',
        title: 'Select a Character (optional)',
        body:  "Pick a character to enable character-specific scoring. Each character's recommended substats are weighted higher, giving a more realistic evaluation.",
        chips: ['Generic → no character', 'Character → tailored score'],
      },
      {
        num: '03', icon: '✦',
        title: 'Get an Echo',
        body:  'Tap "✦ Get Echo" to generate an echo. The main stat is set immediately; substat values are revealed one by one at each +5 upgrade step.',
        chips: ['Main stat set on roll', 'Substats unlock at +5 intervals'],
      },
      {
        num: '04', icon: '⚡',
        title: 'Upgrade to +25',
        body:  'Press "+5 → +X" to upgrade in 5-level steps. Each step adds or grows a substat. At +25 (MAX) all substats are revealed and the final score is confirmed.',
        chips: ['One substat per +5 step', 'Score confirmed at +25'],
      },
      {
        num: '05', icon: '📊',
        title: 'Check Score & Save',
        body:  'A result popup appears at +25. Echoes are rated S+ through D with a 0–100 score. Save as image, share on X, or save the result in-app directly from the popup.',
        chips: ['Ranks use percentiles', 'S = top 5%', 'S+ = top 1%'],
      },
    ],
    rankSection: {
      title: 'Rank Thresholds',
      scoreNote: 'Each substat value is rated within its possible min-max range and multiplied by character-specific weights. Missing the recommended main stat or Sonata Set costs points, while several strong substats landing together earn a bonus.\n\nFor characters with distribution data, rank cutoffs come from percentiles of the drop distribution. An S rank means "in the top 5% of drops for this character," so the same raw score can land on different ranks for different characters. The table below shows the fixed cutoffs used for characters without distribution data yet.',
      ranks: [
        { rank: 'S+', range: '90–100', color: '#f59e0b', bg: '#fef3c7' },
        { rank: 'S',  range: '75–89',  color: '#10b981', bg: '#d1fae5' },
        { rank: 'A',  range: '58–74',  color: '#3b82f6', bg: '#dbeafe' },
        { rank: 'B',  range: '42–57',  color: '#8b5cf6', bg: '#ede9fe' },
        { rank: 'C',  range: '25–41',  color: '#6b7280', bg: '#f3f4f6' },
        { rank: 'D',  range: '0–24',   color: '#9ca3af', bg: '#f9fafb' },
      ],
    },
    bonusSection: {
      title: 'Boost Your Farming',
      sub:   'Watch a short 15-second ad from "Bonus" in the header to unlock 5 minutes of extra features',
      items: [
        {
          icon: '🔒', title: 'Lock Main Stat',
          color: ACCENT, bg: '#eef9ff',
          body: "Fix the next echo's main stat to any value you want. Focus only on echoes with the right main stat for your character.",
        },
        {
          icon: '🎲', title: 'Reroll Substats (once per echo)',
          color: '#a855f7', bg: '#f5f3ff',
          body: 'Select up to 3 substats on a +25 echo and re-draw them once. Great for salvaging a near-perfect roll.',
        },
        {
          icon: '⚡', title: 'One-Click Max Upgrade',
          color: '#f59e0b', bg: '#fffbeb',
          body: '"⚡ Max to +25" button appears, letting you instantly upgrade to +25 in one tap.',
        },
      ],
    },
    saveSection: {
      title: 'Save & Share Results',
      items: [
        {
          icon: '📋', title: 'Save Result',
          body: 'Save a +25 echo inside the app. Add 10 save slots at a time, free of charge. View all saved results from "History" in the header.',
        },
        {
          icon: '💾', title: 'Save as Image',
          body: 'Download a PNG score card with all substats and the rank badge. Great for Discord or Reddit.',
        },
        {
          icon: '𝕏', title: 'Share on X',
          body: 'One-click tweet with your echo score and stat info. Show off your S+ pulls to the community.',
        },
      ],
    },
    faq: {
      items: [
        {
          q: 'Is the simulation data accurate?',
          a: 'The equal 7.6923% selection chance across all 13 substat types comes from the official probability disclosure published by Kuro Games. The eight value steps and the main stat pools per cost are set from values observable in game. As an unofficial fan tool, discrepancies may appear right after a game update.',
        },
        {
          q: 'What is a substat "Tier"?',
          a: 'Each substat value is normalized within its possible min-max range into a T0 (lowest) to T7 (highest) rating. These tiers form the basis of the weighted score calculation. Crit Rate, for instance, spans 6.3% (T0) to 10.5% (T7), and Crit DMG spans 12.6% (T0) to 21.0% (T7).',
        },
        {
          q: 'Can the same substat type appear twice?',
          a: 'No. A single echo never repeats a substat type — the five slots are drawn from the 13 types without replacement. That means a COST 4 echo lands on one of the 1,287 ways to choose 5 types out of 13.',
        },
        {
          q: 'What are the odds of hitting the substats I want?',
          a: 'If you narrow your wishlist to four types, the chance all four land within the five slots is 9 of those 1,287 combinations — about 0.7%, or roughly 1 echo in 143. The value rolls stack on top of that. Plan around volume rather than pinning hopes on any single echo.',
        },
        {
          q: 'What does "Reroll" do?',
          a: 'During Bonus Time, you can select up to 3 substats on a +25 echo and re-draw them once randomly. Limited to once per echo, only available during Bonus Time. The new roll can come out worse than what you had.',
        },
        {
          q: 'Where are saved results stored?',
          a: 'Results are held in browser memory and are lost on page reload or close. Use "💾 Save Image" to download anything important. Records entered in the Farming Supporter are stored in localStorage instead, so those survive a reload.',
        },
        {
          q: "What's the difference between COST 4 and COST 3/1?",
          a: 'COST 4 echoes can be selected by name. COST 3 and 1 echoes use Sonata Sets — a random echo from the chosen set is drawn each time. The main stat pools also differ by cost: Crit Rate and Crit DMG only appear as main stats on COST 4.',
        },
        {
          q: 'How is the Farming Supporter different?',
          a: 'The simulator draws hypothetical echoes so you can experiment. The Farming Supporter is for logging the echoes you actually pulled in game. Enter the substats revealed so far and it estimates, using Bayesian inference, what the remaining slots are likely to roll — which helps you decide whether to keep upgrading.',
        },
        {
          q: 'Does it work on mobile?',
          a: 'Yes. The result popup and echo card are optimized to fit on a single screen without scrolling.',
        },
      ],
    },
    cta: {
      title: 'Ready to Start Farming?',
      sub:   'Completely free. No account needed.',
      btn:   '✦ Open Simulator',
    },
  },
} as const;

// ── Component ─────────────────────────────────────────────────────────────────
export default function GuideClient() {
  const { locale, toggleLocale } = useLocale();
  const G = GUIDE[locale];
  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-white" style={{ borderBottom: '1px solid #e5e7eb' }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <Link
            href={withLang('/', locale)}
            className="flex items-center gap-1.5 text-xs font-medium text-[#707070] hover:text-[#222222] transition-colors"
          >
            {G.backBtn}
          </Link>
          <button
            onClick={toggleLocale}
            className="px-2 py-1.5 rounded-lg text-xs font-medium transition-colors border border-[#e5e7eb] text-[#707070] hover:text-[#222222] hover:border-[#d1d5db]"
          >
            {locale === 'ja' ? 'EN' : 'JA'}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-10 flex flex-col gap-16">

        {/* ── Hero ── */}
        <section className="text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white mb-5"
            style={{ background: 'linear-gradient(90deg, #0275fd, #60a5fa)' }}
          >
            <EchoIcon size={14} color="white" bgColor="#0275fd" />
            <span>{G.hero.tag}</span>
          </div>
          <h1 className="text-3xl font-semibold text-[#222222] mb-4 leading-snug whitespace-pre-line">
            {G.hero.title}
          </h1>
          <p className="text-sm text-[#707070] max-w-sm mx-auto leading-relaxed">
            {G.hero.sub}
          </p>
        </section>

        {/* ── Steps (timeline) ── */}
        <section>
          <SectionLabel>{G.labels.steps}</SectionLabel>
          <div className="mt-6 relative">
            {/* Vertical connecting line */}
            <div
              className="absolute top-5 left-5 w-0.5 bg-[#e5e7eb]"
              style={{ height: 'calc(100% - 40px)' }}
            />
            <div className="flex flex-col gap-0">
              {G.steps.map((step, idx) => (
                <div key={step.num} className="flex gap-5 pb-8 last:pb-0">
                  {/* Step number badge */}
                  <div className="shrink-0 relative z-10">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                      style={{ background: ACCENT, fontFamily: '"IBM Plex Mono", monospace' }}
                    >
                      {step.num}
                    </div>
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1.5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base leading-none">{step.icon}</span>
                      <h2 className="text-sm font-semibold text-[#222222]">{step.title}</h2>
                    </div>
                    <p className="text-sm text-[#707070] leading-relaxed mb-3">{step.body}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {step.chips.map((chip, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                          style={{ background: '#eef9ff', color: ACCENT }}
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <NativeBanner />

        {/* ── Score & Ranks ── */}
        <section>
          <SectionLabel>{G.labels.rank}</SectionLabel>
          <div className="mt-6">
            <h2 className="text-base font-semibold text-[#222222] mb-4">{G.rankSection.title}</h2>

            {/* Rank grid 3×2 */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {G.rankSection.ranks.map((r) => (
                <div
                  key={r.rank}
                  className="rounded-2xl py-3 text-center"
                  style={{ background: r.bg }}
                >
                  <div className="text-2xl font-bold leading-none mb-0.5" style={{ color: r.color }}>
                    {r.rank}
                  </div>
                  <div className="text-[11px] text-[#707070] font-medium">{r.range}</div>
                </div>
              ))}
            </div>

            {/* Visual score bar */}
            <div className="relative h-3 rounded-full overflow-hidden mb-1.5"
              style={{ background: 'linear-gradient(90deg, #9ca3af 0%, #6b7280 25%, #8b5cf6 40%, #3b82f6 55%, #10b981 70%, #f59e0b 85%)' }}
            />
            <div className="flex justify-between text-[10px] text-[#9ca3af] mb-5"
              style={{ fontFamily: '"IBM Plex Mono", monospace' }}
            >
              <span>0</span>
              <span>25</span>
              <span>40</span>
              <span>55</span>
              <span>70</span>
              <span>85</span>
              <span>100</span>
            </div>

            {/* Note */}
            <div
              className="rounded-xl p-4 text-xs text-[#707070] leading-relaxed whitespace-pre-line"
              style={{ background: '#f7f7f7', border: '1px solid #e5e7eb' }}
            >
              {G.rankSection.scoreNote}
            </div>
          </div>
        </section>

        {/* ── Bonus Time ── */}
        <section>
          <SectionLabel>{G.labels.bonus}</SectionLabel>
          <div className="mt-6">
            <h2 className="text-base font-semibold text-[#222222] mb-1">{G.bonusSection.title}</h2>
            <p className="text-xs text-[#9ca3af] mb-4">{G.bonusSection.sub}</p>
            <div className="flex flex-col gap-3">
              {G.bonusSection.items.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 rounded-2xl p-4"
                  style={{
                    background: item.bg,
                    border: `1px solid ${item.color}22`,
                    borderLeft: `3px solid ${item.color}`,
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ background: `${item.color}18` }}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold mb-1" style={{ color: item.color }}>{item.title}</p>
                    <p className="text-xs text-[#707070] leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Save & Share ── */}
        <section>
          <SectionLabel>{G.labels.save}</SectionLabel>
          <div className="mt-6">
            <h2 className="text-base font-semibold text-[#222222] mb-4">{G.saveSection.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {G.saveSection.items.map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-4 border border-[#e5e7eb] bg-white flex flex-col gap-2"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ background: '#f3f4f6' }}
                  >
                    {item.icon}
                  </div>
                  <p className="text-sm font-semibold text-[#222222]">{item.title}</p>
                  <p className="text-xs text-[#707070] leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section>
          <SectionLabel>{G.labels.faq}</SectionLabel>
          <div className="mt-6 flex flex-col gap-2">
            {/* details 要素で開閉する。回答テキストが常にHTMLに含まれるため、
                クローラーからも本文として読める */}
            {G.faq.items.map((item, i) => (
              <details key={i} className="rounded-xl border border-[#e5e7eb] overflow-hidden group">
                <summary className="w-full flex items-center justify-between px-4 py-3.5 text-left text-sm font-medium text-[#222222] hover:bg-[#f7f7f7] transition-colors cursor-pointer list-none">
                  <span className="pr-4 leading-snug">{item.q}</span>
                  <span className="shrink-0 text-[10px] text-[#9ca3af] transition-transform duration-200 group-open:rotate-180">
                    ▼
                  </span>
                </summary>
                <div className="px-4 pb-4 pt-3 text-sm text-[#707070] leading-relaxed border-t border-[#f3f4f6]">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        <AdBanner />

        {/* ── CTA ── */}
        <section className="pb-2">
          <div
            className="relative rounded-2xl p-8 text-center overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #eef9ff 0%, #f5f0ff 100%)',
              border: '1px solid #dbeafe',
            }}
          >
            {/* Decorative circles */}
            <div
              className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20"
              style={{ background: ACCENT }}
            />
            <div
              className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-10"
              style={{ background: '#a855f7' }}
            />
            <div className="relative z-10">
              <h2 className="text-lg font-semibold text-[#222222] mb-1">{G.cta.title}</h2>
              <p className="text-xs text-[#9ca3af] mb-5">{G.cta.sub}</p>
              <Link
                href={withLang('/', locale)}
                className="inline-block px-8 py-3 rounded-[500px] text-sm font-semibold text-[#f7f7f7] hover:opacity-80 transition-opacity"
                style={{ background: '#222222' }}
              >
                {G.cta.btn}
              </Link>
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-[#f3f4f6] py-4">
        <p className="text-center text-xs text-[#9ca3af]">
          非公式ファンツール / Unofficial fan tool · 鳴潮 Wuthering Waves
        </p>
      </footer>
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[10px] font-semibold uppercase tracking-widest text-[#9ca3af]"
      style={{ fontFamily: '"IBM Plex Mono", monospace' }}
    >
      {children}
    </p>
  );
}
