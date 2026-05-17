'use client';

// useEffect, useRef, useState は AdSense復元時に再度importする
// import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/lib/locale';
import { TRANSLATIONS } from '@/data/translations';

// ─────────────────────────────────────────────────────────────────────────────
// Google Ad Manager の設定
// Ad Manager（https://admanager.google.com）でネットワークコードと
// リワード広告ユニットを作成し、下記のパスを書き換えてください
// ─────────────────────────────────────────────────────────────────────────────
const REWARDED_AD_UNIT = '/YOUR_NETWORK_CODE/rewarded-bonus';

// type AdState = 'loading' | 'watching' | 'error'; // TODO: AdSense承認後に復元

interface Props {
  title: string;
  items: string[];
  onGrantBonus: () => void;
  onClose: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let googletag: any;

export default function AdBonusModal({ title, items, onGrantBonus, onClose }: Props) {
  const { locale } = useLocale();
  const T = TRANSLATIONS[locale];

  // TODO: AdSense承認後に以下のコードブロックを復元し、上の2行（useState除く）と差し替える
  // const [adState, setAdState] = useState<AdState>('loading');
  // const onGrantBonusRef = useRef(onGrantBonus);
  // const onCloseRef      = useRef(onClose);
  // useEffect(() => { onGrantBonusRef.current = onGrantBonus; }, [onGrantBonus]);
  // useEffect(() => { onCloseRef.current      = onClose;      }, [onClose]);
  // const slotRef    = useRef<any>(null);
  // const grantedRef = useRef(false);
  // useEffect(() => {
  //   const gtag = (typeof googletag !== 'undefined' ? googletag : null)
  //     ?? (window as any).googletag ?? null;
  //   if (!gtag) { setAdState('error'); return; }
  //   gtag.cmd = gtag.cmd || [];
  //   gtag.cmd.push(() => {
  //     const slot = gtag.defineOutOfPageSlot(REWARDED_AD_UNIT, gtag.enums.OutOfPageFormat.REWARDED);
  //     if (!slot) { setAdState('error'); return; }
  //     slotRef.current = slot;
  //     slot.addService(gtag.pubads());
  //     const handleReady   = (e: any) => { if (e.slot !== slot) return; setAdState('watching'); e.makeRewardedVisible(); };
  //     const handleGranted = (e: any) => { if (e.slot !== slot) return; grantedRef.current = true; };
  //     const handleClosed  = (e: any) => {
  //       if (e.slot !== slot) return;
  //       gtag.pubads().removeEventListener('rewardedSlotReady',   handleReady);
  //       gtag.pubads().removeEventListener('rewardedSlotGranted', handleGranted);
  //       gtag.pubads().removeEventListener('rewardedSlotClosed',  handleClosed);
  //       if (slotRef.current) { gtag.destroySlots([slotRef.current]); slotRef.current = null; }
  //       if (grantedRef.current) onGrantBonusRef.current();
  //       onCloseRef.current();
  //     };
  //     gtag.pubads().addEventListener('rewardedSlotReady',   handleReady);
  //     gtag.pubads().addEventListener('rewardedSlotGranted', handleGranted);
  //     gtag.pubads().addEventListener('rewardedSlotClosed',  handleClosed);
  //     gtag.enableServices();
  //     gtag.display(slot);
  //   });
  //   return () => {
  //     if (slotRef.current && typeof googletag !== 'undefined' && googletag.destroySlots) {
  //       googletag.destroySlots([slotRef.current]); slotRef.current = null;
  //     }
  //   };
  // }, []);

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
                <h2 className="text-base font-semibold text-[#222222]">🎁 {title}</h2>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                  style={{ background: '#0275fd', fontFamily: '"IBM Plex Mono", monospace' }}
                >
                  {T.adFreeLabel}
                </span>
              </div>
              <p className="text-xs text-[#9ca3af]">{T.bonusAdNote}</p>
            </div>
            <button
              onClick={onClose}
              className="text-[#9ca3af] hover:text-[#222222] text-xl leading-none transition-colors shrink-0 ml-3"
            >
              ✕
            </button>
          </div>

          {/* Benefits */}
          <div className="rounded-xl bg-[#f7f7f7] border border-[#e5e7eb] p-4 mb-5">
            <p
              className="text-[10px] uppercase tracking-wider text-[#9ca3af] mb-3"
              style={{ fontFamily: '"IBM Plex Mono", monospace' }}
            >
              {T.adRewardsTitle}
            </p>
            <div className="space-y-2.5">
              {items.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm">
                  <span
                    className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold mt-0.5"
                    style={{ background: '#0275fd' }}
                  >
                    ✓
                  </span>
                  <span className="text-[#222222] leading-snug">{item}</span>
                </div>
              ))}
            </div>
            {/* Duration badge */}
            <div className="mt-3 pt-3 border-t border-[#e5e7eb] flex items-center gap-1.5">
              <span className="text-xs text-[#9ca3af]">⏱</span>
              <span className="text-xs font-medium text-[#0275fd]">{T.adDuration}</span>
            </div>
          </div>

          {/* TODO: AdSense承認後に上記コメントアウトのad状態UIを復元してこのブロックを削除 */}
          <button
            onClick={() => { onGrantBonus(); onClose(); }}
            className="w-full py-3 rounded-[500px] text-sm font-semibold text-[#f7f7f7] bg-[#222222] hover:opacity-80 transition-opacity"
          >
            🎁 {locale === 'ja' ? '受け取る' : 'Claim'}
          </button>

          {/* --- 広告状態UI (AdSense承認後に復元) ---
          {adState === 'loading' && (
            <div className="flex flex-col items-center py-6 gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-[#e5e7eb] border-t-[#0275fd] animate-spin" />
              <div className="text-center">
                <p className="text-sm font-medium text-[#222222]">{T.adLoading}</p>
                <p className="text-xs text-[#9ca3af] mt-1">{T.bonusAdNote}</p>
              </div>
            </div>
          )}
          {adState === 'watching' && (
            <div className="flex flex-col items-center py-6 gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: '#eef9ff', border: '2px solid #0275fd33' }}>▶️</div>
              <div className="text-center">
                <p className="text-base font-semibold text-[#222222]">{T.adWatching}</p>
                <p className="text-sm text-[#707070] mt-1">{T.adWatchHint}</p>
              </div>
              <div className="w-full h-1.5 bg-[#e5e7eb] rounded-full overflow-hidden">
                <div className="h-full bg-[#0275fd] rounded-full" style={{ animation: 'shimmer 3s linear infinite', width: '60%' }} />
              </div>
              <p className="text-xs text-[#9ca3af] text-center">{T.adWatchingSub}</p>
            </div>
          )}
          {adState === 'error' && (
            <div className="flex flex-col items-center py-4 gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>⚠️</div>
              <div className="text-center">
                <p className="text-sm font-medium text-[#222222] mb-1">{T.adWatching.replace('中', 'エラー')}</p>
                <p className="text-xs text-[#707070] leading-relaxed max-w-xs">{T.adErrorTip}</p>
              </div>
              <button onClick={onClose} className="w-full py-2.5 rounded-[500px] text-sm font-medium text-[#f7f7f7] bg-[#222222] hover:opacity-80 transition-opacity">{T.adCloseBtn}</button>
            </div>
          )}
          --- */}
        </div>
      </div>
    </div>
  );
}
