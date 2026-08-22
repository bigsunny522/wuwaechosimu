'use client';

import Link from 'next/link';
import { useLocale, withLang } from '@/lib/locale';
import EchoIcon from '@/components/EchoIcon';

const ACCENT = '#0275fd';

interface Section {
  h: string;
  body: string;
  /** 本文の下に出す内部リンク */
  links?: { href: string; label: string }[];
}

interface AboutCopy {
  backBtn: string;
  tag: string;
  title: string;
  lead: string;
  updated: string;
  sections: Section[];
  footer: string;
}

const CONTENT: Record<'ja' | 'en', AboutCopy> = {
  ja: {
    backBtn: '← シミュレーターへ戻る',
    tag: 'About',
    title: 'このサイトについて',
    lead: '音骸シミュレーターは、鳴潮（Wuthering Waves）の音骸厳選を無料でシミュレートできる非公式のファンツールです。',
    updated: '最終更新日: 2026年7月27日',
    sections: [
      {
        h: '運営者',
        body: '個人が制作・運営している非公式のファンツールです。ゲーム開発元である Kuro Games およびその関連会社とは一切関係がなく、公式の許諾・監修・提携を受けたものではありません。\n\nサイトに関するご連絡は、お問い合わせフォームからお願いします。不具合の報告やデータの誤りのご指摘は、内容を確認のうえ可能な範囲で対応します。',
        links: [{ href: '/contact', label: 'お問い合わせフォームへ' }],
      },
      {
        h: 'このサイトを作った理由',
        body: '鳴潮の音骸厳選は、サブステータスの種類が13種類から均等に抽選され、さらにその数値も8段階の幅を持つという二重の抽選構造になっています。そのため「あと何個掘れば目当ての音骸が出るのか」がプレイヤーからは非常に見えづらく、素材を大量に消費してから期待外れに終わることが珍しくありません。\n\n実際に素材を使う前に確率の感触を掴めること、そしてスコアがどのような考え方で決まるのかを分かりやすく示すことを目的に、このツールを作りました。',
      },
      {
        h: 'データの出典',
        body: 'サブステータスの種類選択が13種類均等（各 7.6923%）である点は、Kuro Games が公開している公式の確率公示に基づいています。\n\n各ステータスの数値範囲（8段階）、コスト別のメインステータスプールとその出現重みについては、ゲーム内で実際に確認できる値をもとに設定しています。キャラクターごとの推奨ハーモニーセット・推奨メインステータス・サブステータスの優先度は、当サイトが独自に整理した評価データです。',
        links: [
          { href: '/score-formula', label: 'スコア計算方法の詳細を見る' },
          { href: '/chardb', label: 'キャラクター別のビルドデータを見る' },
        ],
      },
      {
        h: '更新方針',
        body: '新キャラクターの実装や、音骸・ハーモニーセットの追加に合わせてデータを更新しています。更新内容はお知らせページに記載しています。\n\n非公式ツールという性質上、ゲームのアップデート直後は実装との差異が生じる場合があります。お気づきの点があればお問い合わせからご連絡ください。',
        links: [{ href: '/news', label: '更新履歴を見る' }],
      },
      {
        h: '利用について',
        body: '全ての機能を、会員登録なし・無料で利用できます。料金の請求や、機能を解放するための条件は一切ありません。\n\nシミュレーション結果や厳選サポーターの記録は、お使いのブラウザ内（localStorage）にのみ保存され、サーバーへは送信されません。ブラウザのデータを消去すると記録も削除されます。',
        links: [{ href: '/privacy', label: 'プライバシーポリシーを見る' }],
      },
      {
        h: '免責事項',
        body: 'このツールは確率モデルに基づくシミュレーションであり、ゲーム内の実際の抽選結果を再現・保証するものではありません。表示されるスコアやランクも、当サイトが独自に定めた評価基準による目安です。\n\n掲載内容の正確性には努めていますが、その完全性を保証するものではありません。当サイトの利用によって生じた損害について、責任を負いかねます。\n\nゲーム内の名称・画像・データ等の著作権は、Kuro Games をはじめとする各権利者に帰属します。',
      },
    ],
    footer: '非公式ファンツール / Unofficial fan tool · 鳴潮 Wuthering Waves',
  },
  en: {
    backBtn: '← Back to Simulator',
    tag: 'About',
    title: 'About This Site',
    lead: 'Echo Simulator is an unofficial fan tool that lets you simulate Wuthering Waves echo farming for free.',
    updated: 'Last updated: July 27, 2026',
    sections: [
      {
        h: 'Who Runs This',
        body: 'This is an unofficial fan tool built and maintained by an individual. It has no affiliation with Kuro Games or its subsidiaries, and it is not licensed, supervised, or endorsed by them.\n\nPlease use the contact form to get in touch. Bug reports and corrections to the data are reviewed and addressed where possible.',
        links: [{ href: '/contact', label: 'Go to the contact form' }],
      },
      {
        h: 'Why This Exists',
        body: 'Echo farming in Wuthering Waves runs on a double lottery: the substat type is drawn evenly from 13 options, and then its value is rolled across eight possible steps. That structure makes it very hard for a player to judge how many more echoes they need before the one they want appears, and it is common to burn a large amount of materials only to come up short.\n\nThis tool exists so you can get a feel for those odds before spending anything, and so the reasoning behind every score is easy to understand.',
      },
      {
        h: 'Where the Data Comes From',
        body: 'The equal 7.6923% selection chance across all 13 substat types comes from the official probability disclosure published by Kuro Games.\n\nThe eight-step value ranges and the main stat pools and draw weights per cost are set from values observable in game. The recommended harmony sets, main stats, and substat priorities for each character are evaluation data compiled independently by this site.',
        links: [
          { href: '/score-formula', label: 'See the scoring method in detail' },
          { href: '/chardb', label: 'See build data by character' },
        ],
      },
      {
        h: 'How It Is Maintained',
        body: 'Data is updated as new characters, echoes, and harmony sets are released. Changes are listed on the news page.\n\nBecause this is an unofficial tool, discrepancies can appear right after a game update. If you spot one, please let me know through the contact form.',
        links: [{ href: '/news', label: 'See the update history' }],
      },
      {
        h: 'Using the Site',
        body: 'Every feature is free and requires no account. There are no charges and no conditions attached to unlocking anything.\n\nSimulation results and Farming Supporter records are stored only in your own browser via localStorage; nothing is sent to a server. Clearing your browser data also clears those records.',
        links: [{ href: '/privacy', label: 'Read the privacy policy' }],
      },
      {
        h: 'Disclaimer',
        body: 'This tool is a simulation built on a probability model. It does not reproduce or guarantee the game\'s actual roll results. The scores and ranks it displays are guidance based on evaluation criteria defined by this site.\n\nWhile care is taken to keep the content accurate, its completeness is not guaranteed, and no liability is accepted for any loss arising from use of this site.\n\nAll in-game names, images, and data remain the property of their respective rights holders, including Kuro Games.',
      },
    ],
    footer: 'Unofficial Fan Tool · Wuthering Waves',
  },
};

export default function AboutClient() {
  const { locale, toggleLocale } = useLocale();
  const C = CONTENT[locale];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-30 bg-white" style={{ borderBottom: '1px solid #e5e7eb' }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <Link
            href={withLang('/', locale)}
            className="flex items-center gap-1.5 text-xs font-medium text-[#707070] hover:text-[#222222] transition-colors"
          >
            {C.backBtn}
          </Link>
          <button
            onClick={toggleLocale}
            className="px-2 py-1.5 rounded-lg text-xs font-medium transition-colors border border-[#e5e7eb] text-[#707070] hover:text-[#222222] hover:border-[#d1d5db]"
          >
            {locale === 'ja' ? 'EN' : 'JA'}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-10 flex flex-col gap-10">
        <section className="text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white mb-5"
            style={{ background: 'linear-gradient(90deg, #0275fd, #60a5fa)' }}
          >
            <EchoIcon size={14} color="white" bgColor="#0275fd" />
            <span>{C.tag}</span>
          </div>
          <h1 className="text-3xl font-semibold text-[#222222] mb-3 leading-snug">{C.title}</h1>
          <p className="text-sm text-[#707070] leading-relaxed mb-2">{C.lead}</p>
          <p className="text-xs text-[#9ca3af]">{C.updated}</p>
        </section>

        <section className="flex flex-col gap-8">
          {C.sections.map((s) => (
            <div key={s.h}>
              <h2 className="text-sm font-semibold text-[#222222] mb-2">{s.h}</h2>
              <p className="text-sm text-[#707070] leading-relaxed whitespace-pre-line">
                {s.body}
              </p>
              {s.links && (
                <div className="flex flex-col items-start gap-1 mt-2">
                  {s.links.map((l) => (
                    <Link
                      key={l.href}
                      href={withLang(l.href, locale)}
                      className="text-sm font-medium"
                      style={{ color: ACCENT }}
                    >
                      {l.label} →
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-[#f3f4f6] py-4">
        <p className="text-center text-xs text-[#9ca3af]">{C.footer}</p>
      </footer>
    </div>
  );
}
