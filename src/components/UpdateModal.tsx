'use client';

import { useLocale, withLang } from '@/lib/locale';
import { UPDATES } from '@/data/updates';
import Link from 'next/link';

interface Props {
  onClose: () => void;
}

export default function UpdateModal({ onClose }: Props) {
  const { locale } = useLocale();
  const latest = UPDATES[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ background: 'rgba(0,0,0,.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-4 rounded-2xl overflow-hidden animate-fadeUp"
        style={{ background: 'var(--hd-plate)', border: '1px solid var(--hd-line)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent stripe */}
        <div className="h-1 w-full" style={{ background: 'var(--hd-accent)' }} />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-base font-semibold text-[var(--hd-fg)]">
                  🔔 {locale === 'ja' ? 'アップデート情報' : "What's New"}
                </h2>
                <span
                  className="hd-num px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ background: 'var(--hd-accent)', color: 'var(--hd-accent-ink)' }}
                >
                  NEW
                </span>
              </div>
              <p className="text-xs text-[var(--hd-sub)]">{latest.date}</p>
            </div>
            <button
              onClick={onClose}
              className="text-[var(--hd-sub)] hover:text-[var(--hd-fg)] text-xl leading-none transition-colors shrink-0 ml-3"
            >
              ✕
            </button>
          </div>

          {/* Update content */}
          <div className="rounded-xl bg-[var(--hd-raise)] border border-[var(--hd-line)] p-4 mb-5">
            <p
              className="hd-num text-[10px] uppercase tracking-wider text-[var(--hd-sub)] mb-3"
            >
              {latest.title[locale]}
            </p>
            <div className="space-y-2.5">
              {latest.items.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm">
                  <span
                    className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                    style={{ background: 'var(--hd-accent)', color: 'var(--hd-accent-ink)' }}
                  >
                    ✓
                  </span>
                  <span className="text-[var(--hd-fg)] leading-snug">{item[locale]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Link
              href={withLang(latest.link?.href ?? '/news', locale)}
              onClick={onClose}
              className="flex-1 py-2.5 rounded-[500px] text-sm font-medium border border-[var(--hd-line)] text-[var(--hd-sub)] hover:text-[var(--hd-fg)] hover:border-[var(--hd-sub)] transition-colors text-center"
            >
              {latest.link ? latest.link.label[locale] : (locale === 'ja' ? '更新履歴を見る' : 'View All Updates')}
            </Link>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-[500px] text-sm font-semibold bg-[var(--hd-accent)] text-[var(--hd-accent-ink)] transition-opacity hover:opacity-80"
            >
              {locale === 'ja' ? '閉じる' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
