'use client';

import { useLocale } from '@/lib/locale';
import { UPDATES, LATEST_UPDATE_ID } from '@/data/updates';
import Link from 'next/link';

const ACCENT = '#0275fd';

interface Props {
  onClose: () => void;
}

export default function UpdateModal({ onClose }: Props) {
  const { locale } = useLocale();
  const latest = UPDATES[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl overflow-hidden animate-fadeUp"
        style={{ border: '1px solid #e5e7eb' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent stripe */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${ACCENT}, #60a5fa)` }} />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-base font-semibold text-[#222222]">
                  🔔 {locale === 'ja' ? 'アップデート情報' : "What's New"}
                </h2>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                  style={{ background: ACCENT, fontFamily: '"IBM Plex Mono", monospace' }}
                >
                  NEW
                </span>
              </div>
              <p className="text-xs text-[#9ca3af]">{latest.date}</p>
            </div>
            <button
              onClick={onClose}
              className="text-[#9ca3af] hover:text-[#222222] text-xl leading-none transition-colors shrink-0 ml-3"
            >
              ✕
            </button>
          </div>

          {/* Update content */}
          <div className="rounded-xl bg-[#f7f7f7] border border-[#e5e7eb] p-4 mb-5">
            <p
              className="text-[10px] uppercase tracking-wider text-[#9ca3af] mb-3"
              style={{ fontFamily: '"IBM Plex Mono", monospace' }}
            >
              {latest.title[locale]}
            </p>
            <div className="space-y-2.5">
              {latest.items.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm">
                  <span
                    className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold mt-0.5"
                    style={{ background: ACCENT }}
                  >
                    ✓
                  </span>
                  <span className="text-[#222222] leading-snug">{item[locale]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Link
              href="/news"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-[500px] text-sm font-medium border border-[#e5e7eb] text-[#707070] hover:text-[#222222] hover:border-[#d1d5db] transition-colors text-center"
            >
              {locale === 'ja' ? '更新履歴を見る' : 'View All Updates'}
            </Link>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-[500px] text-sm font-semibold text-[#f7f7f7] transition-opacity hover:opacity-80"
              style={{ background: '#222222' }}
            >
              {locale === 'ja' ? '閉じる' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
