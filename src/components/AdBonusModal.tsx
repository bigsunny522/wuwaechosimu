'use client';

import { useEffect, useRef, useState } from 'react';

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

  // コールバックを ref に保持してクロージャのズレを防ぐ
  const onGrantBonusRef = useRef(onGrantBonus);
  const onCloseRef      = useRef(onClose);
  useEffect(() => { onGrantBonusRef.current = onGrantBonus; }, [onGrantBonus]);
  useEffect(() => { onCloseRef.current      = onClose;      }, [onClose]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const slotRef    = useRef<any>(null);
  const grantedRef = useRef(false);

  useEffect(() => {
    const gtag = (typeof googletag !== 'undefined' ? googletag : null)
      ?? (window as any).googletag    // eslint-disable-line @typescript-eslint/no-explicit-any
      ?? null;

    if (!gtag) {
      setAdState('error');
      return;
    }

    gtag.cmd = gtag.cmd || [];
    gtag.cmd.push(() => {
      const slot = gtag.defineOutOfPageSlot(
        REWARDED_AD_UNIT,
        gtag.enums.OutOfPageFormat.REWARDED,
      );

      if (!slot) {
        // リワード広告が利用できない環境（広告ブロッカー、設定未完了 など）
        setAdState('error');
        return;
      }

      slotRef.current = slot;
      slot.addService(gtag.pubads());

      // ── イベントハンドラ ──────────────────────────────────────────
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleReady = (e: any) => {
        if (e.slot !== slot) return;
        setAdState('watching');
        e.makeRewardedVisible(); // 広告を表示
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleGranted = (e: any) => {
        if (e.slot !== slot) return;
        grantedRef.current = true; // 視聴完了フラグ
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleClosed = (e: any) => {
        if (e.slot !== slot) return;
        cleanup();
        if (grantedRef.current) {
          onGrantBonusRef.current(); // 特典付与
        }
        onCloseRef.current();
      };

      const cleanup = () => {
        gtag.pubads().removeEventListener('rewardedSlotReady',   handleReady);
        gtag.pubads().removeEventListener('rewardedSlotGranted', handleGranted);
        gtag.pubads().removeEventListener('rewardedSlotClosed',  handleClosed);
        if (slotRef.current) {
          gtag.destroySlots([slotRef.current]);
          slotRef.current = null;
        }
      };

      gtag.pubads().addEventListener('rewardedSlotReady',   handleReady);
      gtag.pubads().addEventListener('rewardedSlotGranted', handleGranted);
      gtag.pubads().addEventListener('rewardedSlotClosed',  handleClosed);

      gtag.enableServices();
      gtag.display(slot);
    });

    return () => {
      // アンマウント時のクリーンアップ
      if (slotRef.current && typeof googletag !== 'undefined' && googletag.destroySlots) {
        googletag.destroySlots([slotRef.current]);
        slotRef.current = null;
      }
    };
  }, []); // マウント時に1回だけ実行

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">🎁 {title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none">✕</button>
        </div>

        {/* 特典説明 */}
        <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-4 mb-5 space-y-2 text-sm">
          <p className="text-slate-300 font-semibold mb-1">獲得できる特典</p>
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-slate-400">
              <span className="text-amber-400 mt-0.5 shrink-0">◈</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* 状態表示 */}
        {adState === 'loading' && (
          <div className="text-center py-8 space-y-3">
            <div className="text-3xl animate-pulse">📺</div>
            <p className="text-slate-400 text-sm">広告を読み込んでいます…</p>
          </div>
        )}

        {adState === 'watching' && (
          <div className="text-center py-8 space-y-3">
            <div className="text-3xl">▶️</div>
            <p className="text-slate-300 text-sm font-medium">広告を視聴中</p>
            <p className="text-slate-500 text-xs">最後まで視聴すると特典が付与されます</p>
          </div>
        )}

        {adState === 'error' && (
          <div className="text-center py-8 space-y-4">
            <p className="text-red-400 text-sm leading-relaxed">
              広告を読み込めませんでした。<br />
              広告ブロッカーを無効にするか、<br />しばらくしてからもう一度お試しください。
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm text-white transition-colors"
            >
              閉じる
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
