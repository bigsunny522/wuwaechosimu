'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/locale';
import EchoIcon from '@/components/EchoIcon';
import CustomSelect from '@/components/CustomSelect';

const ACCENT = '#0275fd';

// https://web3forms.com で無料登録して取得したアクセスキーを .env.local に設定してください
// NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? '';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

const CONTENT = {
  ja: {
    backBtn: '← シミュレーターへ戻る',
    tag: 'Contact',
    title: 'お問い合わせ',
    lead: '不具合報告・データの誤り・ご要望などがございましたら、下記フォームよりお気軽にご連絡ください。内容を確認の上、可能な範囲で対応いたします。',
    form: {
      name: 'お名前',
      namePh: '例）田中太郎',
      email: 'メールアドレス',
      emailPh: 'reply@example.com',
      category: 'お問い合わせ種別',
      categoryOptions: [
        '音骸データ・スコア計算について',
        'キャラクターデータの追加・修正',
        '不具合・表示崩れの報告',
        '広告に関するお問い合わせ',
        'その他',
      ],
      message: 'お問い合わせ内容',
      messagePh: '内容をできるだけ詳しくご記入ください',
      submit: '送信する',
      submitting: '送信中…',
    },
    success: '送信が完了しました。お問い合わせありがとうございます。',
    error: '送信に失敗しました。時間をおいて再度お試しください。',
    notConfigured: '現在フォームの準備中です。時間をおいて再度お試しください。',
    topicsTitle: 'よくあるお問い合わせ内容',
    topics: [
      '音骸のサブステータス・確率・スコア計算の誤りについて',
      'キャラクターデータの追加・修正リクエスト',
      'サイトの表示崩れ・動作不具合の報告',
      '広告表示に関するお問い合わせ',
      'その他ご要望・ご意見',
    ],
    note: 'いただいたお問い合わせ内容は、返信対応の目的にのみ使用します。詳しくは「プライバシーポリシー」をご確認ください。',
    privacyLink: 'プライバシーポリシーを見る →',
  },
  en: {
    backBtn: '← Back to Simulator',
    tag: 'Contact',
    title: 'Contact Us',
    lead: 'If you find a bug, incorrect data, or have a feature request, feel free to reach out via the form below. We\'ll do our best to respond.',
    form: {
      name: 'Name',
      namePh: 'e.g. Jane Doe',
      email: 'Email',
      emailPh: 'reply@example.com',
      category: 'Topic',
      categoryOptions: [
        'Echo data / score calculation',
        'Add or fix character data',
        'Bug report / layout issue',
        'Question about ads',
        'Other',
      ],
      message: 'Message',
      messagePh: 'Please describe your inquiry in detail',
      submit: 'Send',
      submitting: 'Sending…',
    },
    success: 'Your message has been sent. Thank you for reaching out.',
    error: 'Something went wrong. Please try again later.',
    notConfigured: 'The contact form is not set up yet. Please try again later.',
    topicsTitle: 'Common Topics',
    topics: [
      'Errors in echo substats, probabilities, or score calculation',
      'Requests to add or fix character data',
      'Reporting layout issues or bugs',
      'Questions about ads on this site',
      'Other feedback or suggestions',
    ],
    note: 'Information you provide is used only to respond to your inquiry. See our Privacy Policy for details.',
    privacyLink: 'View Privacy Policy →',
  },
} as const;

export default function ContactClient() {
  const { locale, toggleLocale } = useLocale();
  const C = CONTENT[locale];
  const [state, setState] = useState<SubmitState>('idle');
  const [category, setCategory] = useState(C.form.categoryOptions[0]);

  useEffect(() => {
    setCategory(CONTENT[locale].form.categoryOptions[0]);
  }, [locale]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!WEB3FORMS_ACCESS_KEY) {
      setState('error');
      return;
    }
    setState('submitting');
    const formData = new FormData(e.currentTarget);
    formData.set('category', category);
    formData.append('access_key', WEB3FORMS_ACCESS_KEY);
    formData.append('subject', locale === 'ja' ? '【音骸シミュレーター】お問い合わせ' : '[Echo Simulator] Inquiry');

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setState('success');
        e.currentTarget.reset();
        setCategory(C.form.categoryOptions[0]);
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-30 bg-white" style={{ borderBottom: '1px solid #e5e7eb' }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <Link
            href="/"
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
          <h1 className="text-3xl font-semibold text-[#222222] mb-4 leading-snug">{C.title}</h1>
          <p className="text-sm text-[#707070] max-w-sm mx-auto leading-relaxed">{C.lead}</p>
        </section>

        <section className="rounded-2xl p-6" style={{ background: '#eef9ff' }}>
          {state === 'success' ? (
            <p className="text-sm font-medium text-center py-6" style={{ color: ACCENT }}>
              ✓ {C.success}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Honeypot（スパム対策・非表示） */}
              <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

              <div>
                <label htmlFor="name" className="block text-xs font-medium text-[#707070] mb-1.5">
                  {C.form.name}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder={C.form.namePh}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-[#222222] bg-white border border-[#e5e7eb] focus:outline-none focus:border-[#0275fd] transition-colors"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-[#707070] mb-1.5">
                  {C.form.email}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder={C.form.emailPh}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-[#222222] bg-white border border-[#e5e7eb] focus:outline-none focus:border-[#0275fd] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#707070] mb-1.5">
                  {C.form.category}
                </label>
                <CustomSelect
                  value={category}
                  onChange={setCategory}
                  options={C.form.categoryOptions.map((opt) => ({ value: opt, label: opt }))}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-medium text-[#707070] mb-1.5">
                  {C.form.message}
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder={C.form.messagePh}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-[#222222] bg-white border border-[#e5e7eb] focus:outline-none focus:border-[#0275fd] transition-colors resize-none"
                />
              </div>

              {state === 'error' && (
                <p className="text-xs text-red-500">
                  {WEB3FORMS_ACCESS_KEY ? C.error : C.notConfigured}
                </p>
              )}

              <button
                type="submit"
                disabled={state === 'submitting'}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: '#222222' }}
              >
                {state === 'submitting' ? C.form.submitting : C.form.submit}
              </button>
            </form>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-[#222222] mb-3">{C.topicsTitle}</h2>
          <ul className="flex flex-col gap-2">
            {C.topics.map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-[#707070] leading-relaxed">
                <span style={{ color: ACCENT }}>•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <p className="text-xs text-[#9ca3af] leading-relaxed">{C.note}</p>
          <Link href="/privacy" className="inline-block mt-2 text-sm font-medium" style={{ color: ACCENT }}>
            {C.privacyLink}
          </Link>
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
