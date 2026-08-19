'use client';

import { useEffect, useState } from 'react';
import { Check, Clock, Gift, X } from 'lucide-react';
import { useLocale } from '@/lib/locale';
import { TRANSLATIONS, interpolate } from '@/data/translations';
import AdBanner from '@/components/AdBanner';

const AD_WAIT_SECONDS = 15;

interface Props {
  title: string;
  items: string[];
  onGrantBonus: () => void;
  onClose: () => void;
}

/** Adsterra広告を表示しつつ15秒待機した後に特典を開放する確認モーダル。 */
export default function BonusModal({ title, items, onGrantBonus, onClose }: Props) {
  const { locale } = useLocale();
  const T = TRANSLATIONS[locale];
  const [secondsLeft, setSecondsLeft] = useState(AD_WAIT_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className="w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl overflow-hidden animate-fadeUp"
        style={{ border: '1px solid #e5e7eb' }}
      >
        {/* ── Top accent stripe ── */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #0275fd, #60a5fa)' }} />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="flex items-center gap-1.5 text-base font-semibold text-[#222222]">
                  <Gift size={16} style={{ color: '#0275fd' }} />
                  {title}
                </h2>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                  style={{ background: '#0275fd', fontFamily: '"IBM Plex Mono", monospace' }}
                >
                  {T.bonusFreeLabel}
                </span>
              </div>
              <p className="text-xs text-[#9ca3af]">{T.bonusNote}</p>
            </div>
            <button
              onClick={onClose}
              aria-label={T.closeBtn}
              className="text-[#9ca3af] hover:text-[#222222] transition-colors shrink-0 ml-3"
            >
              <X size={18} />
            </button>
          </div>

          {/* Benefits */}
          <div className="rounded-xl bg-[#f7f7f7] border border-[#e5e7eb] p-4 mb-5">
            <p
              className="text-[10px] uppercase tracking-wider text-[#9ca3af] mb-3"
              style={{ fontFamily: '"IBM Plex Mono", monospace' }}
            >
              {T.bonusRewardsTitle}
            </p>
            <div className="space-y-2.5">
              {items.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm">
                  <span
                    className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white mt-0.5"
                    style={{ background: '#0275fd' }}
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="text-[#222222] leading-snug">{item}</span>
                </div>
              ))}
            </div>
            {/* Duration badge */}
            <div className="mt-3 pt-3 border-t border-[#e5e7eb] flex items-center gap-1.5">
              <Clock size={12} className="text-[#9ca3af]" />
              <span className="text-xs font-medium text-[#0275fd]">{T.bonusValidFor}</span>
            </div>
          </div>

          {/* Ad */}
          <div className="rounded-xl bg-[#f7f7f7] border border-[#e5e7eb] p-3 mb-5">
            <p
              className="text-[10px] uppercase tracking-wider text-[#9ca3af] mb-1 text-center"
              style={{ fontFamily: '"IBM Plex Mono", monospace' }}
            >
              {T.bonusAdShowing}
            </p>
            <AdBanner />
          </div>

          <button
            onClick={() => { onGrantBonus(); onClose(); }}
            disabled={secondsLeft > 0}
            className="w-full py-3 rounded-[500px] text-sm font-semibold text-[#f7f7f7] bg-[#222222] hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40"
          >
            {secondsLeft > 0 ? interpolate(T.bonusAdWaiting, [secondsLeft]) : T.bonusCTA}
          </button>
        </div>
      </div>
    </div>
  );
}
