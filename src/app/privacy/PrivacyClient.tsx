'use client';

import Link from 'next/link';
import { useLocale, withLang } from '@/lib/locale';
import EchoIcon from '@/components/EchoIcon';

const ACCENT = '#0275fd';

const CONTENT = {
  ja: {
    backBtn: '← シミュレーターへ戻る',
    tag: 'Privacy Policy',
    title: 'プライバシーポリシー',
    updated: '最終更新日: 2026年7月12日',
    sections: [
      {
        h: '1. 個人情報の取り扱いについて',
        body: '当サイト「音骸シミュレーター」（以下「当サイト」）は、鳴潮（Wuthering Waves）の非公式ファンツールです。当サイトでは、お問い合わせフォーム等を通じてご提供いただいた情報を、お問い合わせへの対応以外の目的では利用しません。',
      },
      {
        h: '2. Cookie（クッキー）について',
        body: '当サイトでは、ユーザー体験の向上・アクセス解析・広告配信のためにCookieを使用することがあります。Cookieはブラウザの設定により無効化することが可能です。無効化した場合、当サイトの一部機能が正しく動作しない場合があります。',
      },
      {
        h: '3. アクセス解析ツールについて',
        body: '当サイトでは、サイトの利用状況を把握するためにGoogleアナリティクス等のアクセス解析ツールを使用する場合があります。このツールはトラフィックデータの収集のためにCookieを使用しますが、匿名で収集されており個人を特定するものではありません。この機能はCookieを無効にすることで収集を拒否することができますので、お使いのブラウザの設定をご確認ください。この規約に関しての詳細は「Googleアナリティクス利用規約」をご確認ください。',
      },
      {
        h: '4. 広告配信について',
        body: '当サイトは、第三者配信の広告サービス（Googleアドセンス等）を利用しています。広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookie（氏名、住所、メールアドレス、電話番号は含まれません）を使用することがあります。\n\nGoogleが広告Cookieを使用することにより、当サイトや他のサイトにアクセスした際の情報に基づいて、Google及びそのパートナーが適切な広告を表示しています。この設定を無効にする場合は、Googleの広告設定ページから行うことができます。',
      },
      {
        h: '5. 免責事項',
        body: '当サイトのコンテンツ・情報について、できる限り正確な情報を提供するよう努めていますが、正確性や安全性を保証するものではありません。情報が古くなっていたり、誤りを含んでいる場合もございます。当サイトに掲載された内容によって生じた損害等の一切の責任を負いかねますので、あらかじめご了承ください。\n\n当サイトは「鳴潮（Wuthering Waves）」の非公式ファンサイトであり、Kuro Games及びその関連会社とは一切関係ありません。ゲーム内の名称・データ等の著作権は各権利者に帰属します。',
      },
      {
        h: '6. 著作権について',
        body: '当サイトで掲載しているシミュレーターのプログラム・文章・デザイン等の著作権は、当サイト運営者に帰属します。',
      },
      {
        h: '7. プライバシーポリシーの変更について',
        body: '当サイトは、法令等を除いて、本ポリシーの内容を事前の予告なく変更する場合があります。変更後のプライバシーポリシーは、当サイトに掲載したときから効力を生じるものとします。',
      },
      {
        h: '8. お問い合わせ',
        body: 'プライバシーポリシーに関するお問い合わせは、お問い合わせページよりご連絡ください。',
        link: true,
      },
    ],
  },
  en: {
    backBtn: '← Back to Simulator',
    tag: 'Privacy Policy',
    title: 'Privacy Policy',
    updated: 'Last updated: July 12, 2026',
    sections: [
      {
        h: '1. Handling of Personal Information',
        body: 'Echo Simulator ("this site") is an unofficial fan tool for Wuthering Waves. Information provided through the contact form is used solely to respond to inquiries and for no other purpose.',
      },
      {
        h: '2. Cookies',
        body: 'This site may use cookies to improve user experience, analyze traffic, and serve ads. You can disable cookies in your browser settings; doing so may affect some features of this site.',
      },
      {
        h: '3. Analytics',
        body: 'This site may use analytics tools such as Google Analytics to understand how the site is used. These tools use cookies to collect traffic data anonymously, without identifying individuals. You can opt out by disabling cookies in your browser. For details, see Google Analytics\' Terms of Service.',
      },
      {
        h: '4. Advertising',
        body: 'This site uses third-party advertising services (such as Google AdSense). Advertising vendors may use cookies (which do not include your name, address, email, or phone number) to serve ads based on your interests.\n\nGoogle uses advertising cookies to show ads based on your visits to this and other sites. You can opt out of personalized advertising via Google\'s Ads Settings.',
      },
      {
        h: '5. Disclaimer',
        body: 'While we strive to provide accurate information, we make no guarantees regarding its accuracy or safety. Content may be outdated or contain errors. We are not liable for any damages arising from the use of information on this site.\n\nThis site is an unofficial fan site for Wuthering Waves and is not affiliated with Kuro Games or its affiliates. In-game names and data are the property of their respective rights holders.',
      },
      {
        h: '6. Copyright',
        body: 'The simulator program, text, and design featured on this site are the copyright of the site operator.',
      },
      {
        h: '7. Changes to This Policy',
        body: 'We may update this policy without prior notice, except where required by law. The updated policy takes effect once posted on this site.',
      },
      {
        h: '8. Contact',
        body: 'For questions about this Privacy Policy, please reach out via the contact page.',
        link: true,
      },
    ],
  },
} as const;

export default function PrivacyClient() {
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
          <h1 className="text-3xl font-semibold text-[#222222] mb-2 leading-snug">{C.title}</h1>
          <p className="text-xs text-[#9ca3af]">{C.updated}</p>
        </section>

        <section className="flex flex-col gap-8">
          {C.sections.map((s) => (
            <div key={s.h}>
              <h2 className="text-sm font-semibold text-[#222222] mb-2">{s.h}</h2>
              <p className="text-sm text-[#707070] leading-relaxed whitespace-pre-line">
                {s.body}
              </p>
              {'link' in s && s.link && (
                <Link
                  href={withLang('/contact', locale)}
                  className="inline-block mt-2 text-sm font-medium"
                  style={{ color: ACCENT }}
                >
                  {locale === 'ja' ? 'お問い合わせページへ →' : 'Go to contact page →'}
                </Link>
              )}
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-[#f3f4f6] py-4">
        <p className="text-center text-xs text-[#9ca3af]">
          {locale === 'ja' ? '非公式ファンツール / Unofficial fan tool · 鳴潮 Wuthering Waves' : 'Unofficial Fan Tool · Wuthering Waves'}
        </p>
      </footer>
    </div>
  );
}
