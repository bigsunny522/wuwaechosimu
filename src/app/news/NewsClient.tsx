'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/locale';
import EchoIcon from '@/components/EchoIcon';
import { UPDATES } from '@/data/updates';

const ACCENT = '#0275fd';

export default function NewsClient() {
  const { locale, toggleLocale } = useLocale();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white" style={{ borderBottom: '1px solid #e5e7eb' }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <EchoIcon size={28} color={ACCENT} />
            <span className="font-semibold text-[#222222] text-sm tracking-tight">
              {locale === 'ja' ? '音骸シミュレーター' : 'Echo Simulator'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors border border-[#e5e7eb] text-[#707070] hover:text-[#222222] hover:border-[#d1d5db]"
            >
              <span>←</span>
              <span className="hidden sm:inline">{locale === 'ja' ? 'シミュレーターへ' : 'Back'}</span>
            </Link>
            <button
              onClick={toggleLocale}
              className="px-2 py-1.5 rounded-lg text-xs font-medium transition-colors border border-[#e5e7eb] text-[#707070] hover:text-[#222222] hover:border-[#d1d5db]"
            >
              {locale === 'ja' ? 'EN' : 'JA'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-8">
          <div
            className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold text-white mb-3"
            style={{ background: ACCENT, fontFamily: '"IBM Plex Mono", monospace' }}
          >
            {locale === 'ja' ? 'お知らせ' : 'Updates'}
          </div>
          <h1 className="text-2xl font-bold text-[#222222] mb-2">
            {locale === 'ja' ? '更新情報' : "What's New"}
          </h1>
          <p className="text-sm text-[#707070]">
            {locale === 'ja'
              ? 'キャラクター追加・機能改善などの更新履歴です'
              : 'Character additions, feature updates, and improvements'}
          </p>
        </div>

        {/* Update list */}
        <div className="space-y-4">
          {UPDATES.map((entry, index) => (
            <div
              key={entry.id}
              className="rounded-2xl border border-[#e5e7eb] overflow-hidden"
            >
              {/* Card top stripe */}
              <div
                className="h-0.5 w-full"
                style={{ background: index === 0 ? `linear-gradient(90deg, ${ACCENT}, #60a5fa)` : '#e5e7eb' }}
              />
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full border"
                    style={
                      index === 0
                        ? { color: ACCENT, borderColor: `${ACCENT}44`, background: '#eef9ff', fontFamily: '"IBM Plex Mono", monospace' }
                        : { color: '#9ca3af', borderColor: '#e5e7eb', background: '#f9fafb', fontFamily: '"IBM Plex Mono", monospace' }
                    }
                  >
                    {entry.date}
                  </span>
                  {index === 0 && (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded text-white"
                      style={{ background: ACCENT }}
                    >
                      NEW
                    </span>
                  )}
                </div>
                <h2 className="text-sm font-semibold text-[#222222] mb-3">
                  {entry.title[locale]}
                </h2>
                <ul className="space-y-2">
                  {entry.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#444444]">
                      <span className="shrink-0 mt-0.5 text-[#9ca3af]">•</span>
                      <span className="leading-snug">{item[locale]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-[#f3f4f6] py-4">
        <p className="text-center text-xs text-[#9ca3af]">
          {locale === 'ja'
            ? '非公式ファンツール / Unofficial fan tool · 鳴潮 Wuthering Waves'
            : 'Unofficial Fan Tool · Wuthering Waves'}
        </p>
      </footer>
    </div>
  );
}
