'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLocale } from '@/lib/locale';

const ACCENT = '#0275fd';

// ── Bilingual guide content ────────────────────────────────────────────────────
const GUIDE = {
  ja: {
    backBtn: '← シミュレーターへ戻る',
    hero: {
      tag:   '使い方ガイド',
      title: '音骸シミュレーター\n完全ガイド',
      sub:   '鳴潮の音骸厳選を効率よく行うための全機能を解説します',
    },
    stepsTitle: '基本の使い方',
    steps: [
      {
        num: '01', icon: '🎯',
        title: 'コストと音骸を選ぶ',
        body:  'COST 4・3・1 から音骸のコストを選択します。COST 4 は個別の音骸を直接指定でき、COST 3・1 はハーモニーセット（セット効果）を選ぶとそのセットに属する音骸からランダムに抽選されます。コストが高いほどサブステータスの枠数が多くなります。',
        chips: ['COST 4 → サブステ最大 5 個', 'COST 3 → 最大 4 個', 'COST 1 → 最大 3 個'],
      },
      {
        num: '02', icon: '👤',
        title: 'キャラクターを選ぶ（任意）',
        body:  'キャラクターを指定すると、そのキャラクター向けのスコア評価に切り替わります。各キャラの推奨サブステータスに応じた重み付けでスコアが計算され、より実戦的な評価が得られます。指定しない場合は汎用スコアが使われます。',
        chips: ['汎用スコア → キャラなし', 'キャラ指定 → 専用評価'],
      },
      {
        num: '03', icon: '✦',
        title: '音骸を入手する',
        body:  '「✦ 音骸を入手」ボタンをタップします。メインステータスと初期のサブステータス枠が生成されます。サブステの具体的な数値は +5 強化のたびに確定していきます。',
        chips: ['メインステータス確定', 'サブステは +5 ごとに解放'],
      },
      {
        num: '04', icon: '⚡',
        title: '+25 まで強化する',
        body:  '「+5 → +X」ボタンを押すと 5 レベルずつ強化され、同時にサブステータスが 1 つ追加・成長します。+25（MAX）まで強化するとすべてのサブステが解放されてスコアが確定します。',
        chips: ['+5 ごとにサブステ追加', '+25 でスコア確定', '一括強化はボーナスタイムで解放'],
      },
      {
        num: '05', icon: '📊',
        title: 'スコアを確認する',
        body:  'S+ ～ D のランクと 0〜100 のスコアで評価されます。「スコア計算の詳細 ▼」を開くと各サブステータスの Tier 評価・重み・寄与ポイントの内訳を細かく確認できます。',
        chips: ['S+: 85 点以上', 'S: 70〜84 点', 'A: 55〜69 点'],
      },
    ],
    rankSection: {
      title: 'ランク評価基準',
      sub:   'スコアは 0〜100 の数値で表されます',
      scoreNote: '各サブステータスの数値は T0（最低値）〜 T5（最高値）の Tier で評価されます。キャラクターおよびコストに応じた重み付けで合算し、メインステートとハーモニーセットが推奨値に合致する場合はボーナス補正が加算されます。',
      ranks: [
        { rank: 'S+', range: '85〜100 点', color: '#f59e0b', bg: '#fef3c7' },
        { rank: 'S',  range: '70〜84 点',  color: '#10b981', bg: '#d1fae5' },
        { rank: 'A',  range: '55〜69 点',  color: '#3b82f6', bg: '#dbeafe' },
        { rank: 'B',  range: '40〜54 点',  color: '#8b5cf6', bg: '#ede9fe' },
        { rank: 'C',  range: '25〜39 点',  color: '#6b7280', bg: '#f3f4f6' },
        { rank: 'D',  range: '0〜24 点',   color: '#9ca3af', bg: '#f9fafb' },
      ],
    },
    bonusSection: {
      title: '🎁 ボーナスタイム',
      sub:   '広告を 1 本（約 30 秒）視聴するだけで 5 分間の特典が解放されます',
      items: [
        {
          icon: '🔒→🔓', title: 'メインステータス固定',
          body: '次に引く音骸のメインステを好きな値に固定できます。狙ったメインステの音骸だけに集中して厳選できます。',
        },
        {
          icon: '🎲', title: 'サブステ再抽選（1 回限り）',
          body: '+25 まで強化した音骸のサブステを最大 3 個まで選んで 1 回だけ引き直しできます。惜しかった音骸を救済するのに最適です。',
        },
        {
          icon: '⚡', title: '一括強化（+25 まで）',
          body: '「⚡ +25 まで強化」ボタンが出現し、ワンタップで一気に +25 まで強化できます。厳選スピードが格段にアップします。',
        },
      ],
    },
    saveSection: {
      title: '📋 結果の保存・シェア',
      items: [
        {
          icon: '📋', title: '結果を保存',
          body: '+25 音骸のスコアをアプリ内に保存できます。広告を視聴すると保存枠が 10 枠追加されます。ヘッダーの「📋 履歴」から保存した結果を一覧確認できます。',
        },
        {
          icon: '💾', title: '画像保存',
          body: 'スコアカードを PNG 画像でダウンロードできます。すべてのサブステータスの数値とランクが 1 枚にまとまります。コミュニティへの報告に便利です。',
        },
        {
          icon: '𝕏', title: 'X（Twitter）シェア',
          body: 'スコアと音骸の情報をワンクリックでツイートできます。S+ が出たらぜひシェアしてみましょう。',
        },
      ],
    },
    faq: {
      title: 'よくある質問',
      items: [
        {
          q: 'このツールのデータは正確ですか？',
          a: 'サブステータスの数値範囲・確率・コスト別のメインステータスプールは実際のゲームデータをもとに設定しています。ただし非公式ファンツールのため、アップデートにより実際のゲームと差異が生じる場合があります。',
        },
        {
          q: 'スコア計算の「Tier」とは何ですか？',
          a: '各サブステータスの数値をそのステータスの最小値〜最大値の範囲で正規化した評価です。T0（最低値）〜T5（最高値）の 6 段階があり、スコア計算の重み付けの基礎になります。',
        },
        {
          q: '再抽選（リロール）とは何ですか？',
          a: 'ボーナスタイム中に +25 音骸のサブステを最大 3 個まで選び、もう一度ランダムで引き直す機能です。1 音骸につき 1 回限りで、ボーナスタイム中のみ使用できます。',
        },
        {
          q: '保存した結果はどこに保存されますか？',
          a: 'ブラウザのメモリ（React の state）上に保存されます。ページをリロードまたは閉じると消えますのでご注意ください。重要な結果は「💾 画像保存」でダウンロードしておくことをお勧めします。',
        },
        {
          q: 'COST 4 と COST 3・1 の違いは何ですか？',
          a: 'COST 4 は最大 5 個のサブステを持ち、特定の音骸名を直接指定できます。COST 3・1 はハーモニーセットを選択し、そのセットに属する音骸からランダムに抽選されます（COST 3: 最大 4 個、COST 1: 最大 3 個）。',
        },
        {
          q: 'PC とスマホどちらでも使えますか？',
          a: 'はい、どちらでもご利用いただけます。レスポンシブデザインに対応しています。',
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
    backBtn: '← Back to Simulator',
    hero: {
      tag:   'How to Use',
      title: 'Echo Simulator\nComplete Guide',
      sub:   'Everything you need to know to farm echoes efficiently in Wuthering Waves',
    },
    stepsTitle: 'Getting Started',
    steps: [
      {
        num: '01', icon: '🎯',
        title: 'Choose Cost & Echo',
        body:  'Select the echo cost: COST 4, 3, or 1. COST 4 lets you pick a specific echo by name. COST 3 and 1 use Sonata Sets — a random echo from that set is drawn each pull. Higher cost means more substat slots.',
        chips: ['COST 4 → up to 5 substats', 'COST 3 → up to 4', 'COST 1 → up to 3'],
      },
      {
        num: '02', icon: '👤',
        title: 'Select a Character (optional)',
        body:  "Pick a character to enable character-specific scoring. Each character's recommended substats receive higher weights, giving you a more realistic evaluation. Without a character, a generic score is used.",
        chips: ['Generic → no character', 'Character → tailored score'],
      },
      {
        num: '03', icon: '✦',
        title: 'Get an Echo',
        body:  'Tap "✦ Get Echo" to generate an echo. The main stat is determined immediately; substat values are revealed and locked in at each +5 upgrade step.',
        chips: ['Main stat fixed on roll', 'Substats unlock at +5 intervals'],
      },
      {
        num: '04', icon: '⚡',
        title: 'Upgrade to +25',
        body:  'Press "+5 → +X" to upgrade in 5-level steps. Each step unlocks or grows one substat. At +25 (MAX) all substats are revealed and the final score is shown.',
        chips: ['+5 per step unlocks a substat', 'Score confirmed at +25', 'One-click max available in Bonus Time'],
      },
      {
        num: '05', icon: '📊',
        title: 'Check the Score',
        body:  "Echoes are graded S+ through D with a 0–100 score. Open \"Score Breakdown ▼\" to see each substat's Tier rating, weight multiplier, and point contribution.",
        chips: ['S+: 85+', 'S: 70–84', 'A: 55–69'],
      },
    ],
    rankSection: {
      title: 'Rank Thresholds',
      sub:   'Scores range from 0 to 100',
      scoreNote: 'Each substat value is rated T0 (lowest) to T5 (highest) within its possible range. These tiers are multiplied by character-specific weights and summed. Matching main stat and Sonata Set add bonus points on top.',
      ranks: [
        { rank: 'S+', range: '85–100', color: '#f59e0b', bg: '#fef3c7' },
        { rank: 'S',  range: '70–84',  color: '#10b981', bg: '#d1fae5' },
        { rank: 'A',  range: '55–69',  color: '#3b82f6', bg: '#dbeafe' },
        { rank: 'B',  range: '40–54',  color: '#8b5cf6', bg: '#ede9fe' },
        { rank: 'C',  range: '25–39',  color: '#6b7280', bg: '#f3f4f6' },
        { rank: 'D',  range: '0–24',   color: '#9ca3af', bg: '#f9fafb' },
      ],
    },
    bonusSection: {
      title: '🎁 Bonus Time',
      sub:   'Watch one short ad (~30 sec) to unlock 5 minutes of premium features',
      items: [
        {
          icon: '🔒→🔓', title: 'Lock Main Stat',
          body: "Fix the next echo's main stat to any value you choose. Focus exclusively on echoes that have the right main stat for your character.",
        },
        {
          icon: '🎲', title: 'Reroll Substats (once per echo)',
          body: 'Select up to 3 substats on a +25 echo and re-draw them once at random. Great for salvaging a near-perfect echo that had one bad roll.',
        },
        {
          icon: '⚡', title: 'One-Click Max Upgrade',
          body: '"⚡ Max to +25" button appears, letting you instantly upgrade to +25 in one tap. Dramatically speeds up your farming workflow.',
        },
      ],
    },
    saveSection: {
      title: '📋 Save & Share Results',
      items: [
        {
          icon: '📋', title: 'Save Result',
          body: 'Save a +25 echo result inside the app. Watch an ad to add 10 save slots. Browse all saved results from the "📋 History" button in the header.',
        },
        {
          icon: '💾', title: 'Save as Image',
          body: 'Download a PNG score card containing all substats, values, and the rank badge. Great for record-keeping or sharing in Discord/Reddit.',
        },
        {
          icon: '𝕏', title: 'Share on X (Twitter)',
          body: 'One-click tweet with the echo score and all stat info. Show off your S+ pulls to the Wuthering Waves community.',
        },
      ],
    },
    faq: {
      title: 'FAQ',
      items: [
        {
          q: 'Is the simulation data accurate?',
          a: 'Substat value ranges, probabilities, and main stat pools are based on real game data. As an unofficial fan tool, discrepancies may appear after game updates.',
        },
        {
          q: 'What is a substat "Tier"?',
          a: 'Each substat value is normalized within its possible min–max range into a T0 (lowest) to T5 (highest) rating. These tiers form the basis of the weighted score calculation.',
        },
        {
          q: 'What does "Reroll" do?',
          a: 'During Bonus Time, you can select up to 3 substats on a +25 echo and re-draw them once randomly. Limited to once per echo, only available during Bonus Time.',
        },
        {
          q: 'Where are saved results stored?',
          a: 'Results are stored in browser memory (React state). They are lost on page reload or close. Use "💾 Save Image" to download important results as PNG.',
        },
        {
          q: "What's the difference between COST 4 and COST 3/1?",
          a: 'COST 4 echoes have up to 5 substats and can be selected by name. COST 3 and 1 echoes use Sonata Sets — a random echo from the chosen set is drawn each time (COST 3: up to 4 substats, COST 1: up to 3).',
        },
        {
          q: 'Does it work on mobile?',
          a: 'Yes, the tool is fully responsive and works on both desktop and mobile browsers.',
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-white" style={{ borderBottom: '1px solid #e5e7eb' }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <Link
            href="/"
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

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-10 flex flex-col gap-14">

        {/* ── Hero ── */}
        <section className="text-center pt-2">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-4"
            style={{ background: ACCENT }}
          >
            {G.hero.tag}
          </span>
          <h1 className="text-2xl font-semibold text-[#222222] mb-3 leading-snug whitespace-pre-line">
            {G.hero.title}
          </h1>
          <p className="text-sm text-[#707070] max-w-sm mx-auto leading-relaxed">
            {G.hero.sub}
          </p>
        </section>

        {/* ── Step-by-step ── */}
        <section>
          <SectionLabel>{G.stepsTitle}</SectionLabel>
          <div className="flex flex-col gap-4 mt-5">
            {G.steps.map((step) => (
              <div
                key={step.num}
                className="flex gap-4 rounded-2xl p-5 border border-[#e5e7eb] bg-white"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
              >
                {/* Step circle */}
                <div className="shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: ACCENT, fontFamily: '"IBM Plex Mono", monospace' }}
                  >
                    {step.num}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{step.icon}</span>
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
        </section>

        {/* ── Score & Ranks ── */}
        <section>
          <SectionLabel>Score System</SectionLabel>
          <div className="mt-5">
            <h2 className="text-base font-semibold text-[#222222] mb-1">{G.rankSection.title}</h2>
            <p className="text-xs text-[#9ca3af] mb-4">{G.rankSection.sub}</p>

            {/* Rank rows */}
            <div className="flex flex-col gap-2 mb-5">
              {G.rankSection.ranks.map((r) => (
                <div
                  key={r.rank}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 border border-[#e5e7eb]"
                >
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold shrink-0"
                    style={{ background: r.bg, color: r.color }}
                  >
                    {r.rank}
                  </span>
                  <span className="text-sm text-[#222222] font-medium">{r.range}</span>
                </div>
              ))}
            </div>

            {/* Score note */}
            <div
              className="rounded-xl p-4 text-xs text-[#707070] leading-relaxed"
              style={{ background: '#f7f7f7', border: '1px solid #e5e7eb' }}
            >
              {G.rankSection.scoreNote}
            </div>
          </div>
        </section>

        {/* ── Bonus Time ── */}
        <section>
          <SectionLabel>Bonus Time</SectionLabel>
          <div className="mt-5">
            <h2 className="text-base font-semibold text-[#222222] mb-1">{G.bonusSection.title}</h2>
            <p className="text-xs text-[#9ca3af] mb-4">{G.bonusSection.sub}</p>
            <div className="flex flex-col gap-3">
              {G.bonusSection.items.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 rounded-2xl p-4 border border-[#e5e7eb]"
                  style={{ background: '#f7f7f7' }}
                >
                  <div className="text-xl shrink-0 mt-0.5">{item.icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-[#222222] mb-1">{item.title}</p>
                    <p className="text-xs text-[#707070] leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Save & Share ── */}
        <section>
          <SectionLabel>Save &amp; Share</SectionLabel>
          <div className="mt-5">
            <h2 className="text-base font-semibold text-[#222222] mb-4">{G.saveSection.title}</h2>
            <div className="flex flex-col gap-3">
              {G.saveSection.items.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 rounded-2xl p-4 border border-[#e5e7eb] bg-white"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <div className="text-xl shrink-0 mt-0.5">{item.icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-[#222222] mb-1">{item.title}</p>
                    <p className="text-xs text-[#707070] leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section>
          <SectionLabel>FAQ</SectionLabel>
          <div className="mt-5">
            <h2 className="text-base font-semibold text-[#222222] mb-4">{G.faq.title}</h2>
            <div className="flex flex-col gap-2">
              {G.faq.items.map((item, i) => (
                <div key={i} className="rounded-xl border border-[#e5e7eb] overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left text-sm font-medium text-[#222222] hover:bg-[#f7f7f7] transition-colors"
                  >
                    <span className="pr-3">{item.q}</span>
                    <span
                      className="shrink-0 text-xs text-[#9ca3af] transition-transform"
                      style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                      ▼
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4 pt-3 text-sm text-[#707070] leading-relaxed border-t border-[#e5e7eb]">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="pb-2">
          <div
            className="rounded-2xl p-8 text-center border border-[#e5e7eb]"
            style={{ background: '#f7f7f7' }}
          >
            <h2 className="text-lg font-semibold text-[#222222] mb-1">{G.cta.title}</h2>
            <p className="text-xs text-[#9ca3af] mb-5">{G.cta.sub}</p>
            <Link
              href="/"
              className="inline-block px-8 py-3 rounded-[500px] text-sm font-semibold text-[#f7f7f7] bg-[#222222] hover:opacity-80 transition-opacity"
            >
              {G.cta.btn}
            </Link>
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

// ── Shared section label ───────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[10px] font-medium uppercase tracking-widest text-[#9ca3af]"
      style={{ fontFamily: '"IBM Plex Mono", monospace' }}
    >
      {children}
    </p>
  );
}
