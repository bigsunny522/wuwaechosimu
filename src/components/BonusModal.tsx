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
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" style={{ background: 'rgba(0,0,0,.6)' }}>
      <div
        className="w-full max-w-md mx-4 rounded-2xl overflow-hidden animate-fadeUp"
        style={{ background: 'var(--hd-plate)', border: '1px solid var(--hd-line)' }}
      >
        {/* ── Top accent stripe ── */}
        <div className="h-1 w-full" style={{ background: 'var(--hd-accent)' }} />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="flex items-center gap-1.5 text-base font-semibold text-[var(--hd-fg)]">
                  <Gift size={16} style={{ color: 'var(--hd-accent)' }} />
                  {title}
                </h2>
                <span
                  className="hd-num px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ background: 'var(--hd-accent)', color: 'var(--hd-accent-ink)' }}
                >
                  {T.bonusFreeLabel}
                </span>
              </div>
              <p className="text-xs text-[var(--hd-sub)]">{T.bonusNote}</p>
            </div>
            <button
              onClick={onClose}
              aria-label={T.closeBtn}
              className="text-[var(--hd-sub)] hover:text-[var(--hd-fg)] transition-colors shrink-0 ml-3"
            >
              <X size={18} />
            </button>
          </div>

          {/* Benefits */}
          <div className="rounded-xl bg-[var(--hd-raise)] border border-[var(--hd-line)] p-4 mb-5">
            <p
              className="hd-num text-[10px] uppercase tracking-wider text-[var(--hd-sub)] mb-3"
            >
              {T.bonusRewardsTitle}
            </p>
            <div className="space-y-2.5">
              {items.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm">
                  <span
                    className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                    style={{ background: 'var(--hd-accent)', color: 'var(--hd-accent-ink)' }}
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="text-[var(--hd-fg)] leading-snug">{item}</span>
                </div>
              ))}
            </div>
            {/* Duration badge */}
            <div className="mt-3 pt-3 border-t border-[var(--hd-line)] flex items-center gap-1.5">
              <Clock size={12} className="text-[var(--hd-sub)]" />
              <span className="text-xs font-medium text-[var(--hd-accent-text)]">{T.bonusValidFor}</span>
            </div>
          </div>

          {/* Ad */}
          <div className="rounded-xl bg-[var(--hd-raise)] border border-[var(--hd-line)] p-3 mb-5">
            <p
              className="hd-num text-[10px] uppercase tracking-wider text-[var(--hd-sub)] mb-1 text-center"
            >
              {T.bonusAdShowing}
            </p>
            <AdBanner />
          </div>

          <button
            onClick={() => { onGrantBonus(); onClose(); }}
            disabled={secondsLeft > 0}
            className="w-full py-3 rounded-[500px] text-sm font-semibold bg-[var(--hd-accent)] text-[var(--hd-accent-ink)] hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40"
          >
            {secondsLeft > 0 ? interpolate(T.bonusAdWaiting, [secondsLeft]) : T.bonusCTA}
          </button>
        </div>
      </div>
    </div>
  );
}
