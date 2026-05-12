'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/lib/locale';
import { TRANSLATIONS } from '@/data/translations';

// ─────────────────────────────────────────────────────────────────────────────
// Google Ad Manager の設定
// Ad Manager（https://admanager.google.com）でネットワークコードと
// リワード広告ユニットを作成し、下記のパスを書き換えてください
// 例: '/1234567890/rewarded-bonus'
// ─────────────────────────────────────────────────────────────────────────────
const REWARDED_AD_UNIT = '/YOUR_NETWORK_CODE/rewarded-bonus';

type AdState = 'loading' | 'watching' | 'error';

interface Props {
  title: string;
  items: string[];
  onGrantBonus: () => void;
  onClose: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let googletag: any;

export default function AdBonusModal({ title, items, onGrantBonus, onClose }: Props) {
  const [adState, setAdState] = useState<AdState>('loading');
  const { locale } = useLocale();
  const T = TRANSLATIONS[locale];

  const onGrantBonusRef = useRef(onGrantBonus);
  const onCloseRef      = useRef(onClose);
  useEffect(() => { onGrantBonusRef.current = onGrantBonus; }, [onGrantBonus]);
  useEffect(() => { onCloseRef.current      = onClose;      }, [onClose]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const slotRef    = useRef<any>(null);
  const grantedRef = useRef(false);

  useEffect(() => {
    const gtag = (typeof googletag !== 'undefined' ? googletag : null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?? (window as any).googletag ?? null;

    if (!gtag) { setAdState('error'); return; }

    gtag.cmd = gtag.cmd || [];
    gtag.cmd.push(() => {
      const slot = gtag.defineOutOfPageSlot(
        REWARDED_AD_UNIT,
        gtag.enums.OutOfPageFormat.REWARDED,
      );
      if (!slot) { setAdState('error'); return; }

      slotRef.current = slot;
      slot.addService(gtag.pubads());

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleReady   = (e: any) => { if (e.slot !== slot) return; setAdState('watching'); e.makeRewardedVisible(); };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleGranted = (e: any) => { if (e.slot !== slot) return; grantedRef.current = true; };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleClosed  = (e: any) => {
        if (e.slot !== slot) return;
        cleanup();
        if (grantedRef.current) onGrantBonusRef.current();
        onCloseRef.current();
      };
      const cleanup = () => {
        gtag.pubads().removeEventListener('rewardedSlotReady',   handleReady);
        gtag.pubads().removeEventListener('rewardedSlotGranted', handleGranted);
        gtag.pubads().removeEventListener('rewardedSlotClosed',  handleClosed);
        if (slotRef.current) { gtag.destroySlots([slotRef.current]); slotRef.current = null; }
      };

      gtag.pubads().addEventListener('rewardedSlotReady',   handleReady);
      gtag.pubads().addEventListener('rewardedSlotGranted', handleGranted);
      gtag.pubads().addEventListener('rewardedSlotClosed',  handleClosed);
      gtag.enableServices();
      gtag.display(slot);
    });

    return () => {
      if (slotRef.current && typeof googletag !== 'undefined' && googletag.destroySlots) {
        googletag.destroySlots([slotRef.current]);
        slotRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className="w-full max-w-md mx-4 rounded-2xl bg-white p-6 shadow-2xl"
        style={{ border: '1px solid #e5e7eb' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-[#222222]">🎁 {title}</h2>
          <button
            onClick={onClose}
            className="text-[#9ca3af] hover:text-[#222222] text-xl leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 特典説明 */}
        <div className="rounded-xl bg-[#f7f7f7] border border-[#e5e7eb] p-4 mb-5 space-y-2.5">
          <p className="text-sm font-medium text-[#222222]">{T.adRewardsTitle}</p>
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-[#707070]">
              <span className="text-[#0275fd] mt-0.5 shrink-0">◈</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        {adState === 'loading' && (
          <div className="text-center py-8 space-y-3">
            <div className="text-3xl animate-pulse">📺</div>
            <p className="text-sm text-[#707070]">{T.adLoading}</p>
          </div>
        )}

        {adState === 'watching' && (
          <div className="text-center py-8 space-y-3">
            <div className="text-3xl">▶️</div>
            <p className="text-sm font-medium text-[#222222]">{T.adWatching}</p>
            <p className="text-xs text-[#707070]">{T.adWatchingSub}</p>
          </div>
        )}

        {adState === 'error' && (
          <div className="text-center py-8 space-y-4">
            <p className="text-sm text-[#ef4444] leading-relaxed whitespace-pre-line">
              {T.adError}
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-[500px] text-sm font-medium text-[#f7f7f7] bg-[#222222] hover:opacity-80 transition-opacity"
            >
              {T.adCloseBtn}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
