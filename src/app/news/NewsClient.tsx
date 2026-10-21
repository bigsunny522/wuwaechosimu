'use client';

import { useLocale } from '@/lib/locale';
import { UPDATES } from '@/data/updates';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';

export default function NewsClient() {
  const { locale } = useLocale();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-8">
          <div
            className="hd-num inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold mb-3"
            style={{ background: 'var(--hd-accent)', color: 'var(--hd-accent-ink)' }}
          >
            {locale === 'ja' ? 'お知らせ' : 'Updates'}
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--hd-fg)' }}>
            {locale === 'ja' ? '更新情報' : "What's New"}
          </h1>
          <p className="text-sm" style={{ color: 'var(--hd-sub)' }}>
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
              className="hd-card overflow-hidden"
            >
              {/* Card top stripe */}
              <div
                className="h-0.5 w-full"
                style={{ background: index === 0 ? 'var(--hd-accent)' : 'var(--hd-line)' }}
              />
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="hd-num text-xs font-medium px-2 py-0.5 rounded-full border"
                    style={
                      index === 0
                        ? { color: 'var(--hd-accent-text)', borderColor: 'var(--hd-accent-soft)', background: 'var(--hd-accent-soft)' }
                        : { color: 'var(--hd-sub)', borderColor: 'var(--hd-line)', background: 'var(--hd-raise)' }
                    }
                  >
                    {entry.date}
                  </span>
                  {index === 0 && (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--hd-accent)', color: 'var(--hd-accent-ink)' }}
                    >
                      NEW
                    </span>
                  )}
                </div>
                <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--hd-fg)' }}>
                  {entry.title[locale]}
                </h2>
                <ul className="space-y-2">
                  {entry.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--hd-fg)' }}>
                      <span className="shrink-0 mt-0.5" style={{ color: 'var(--hd-sub)' }}>•</span>
                      <span className="leading-snug">{item[locale]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
