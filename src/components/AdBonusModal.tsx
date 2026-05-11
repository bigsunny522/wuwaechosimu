'use client';

import { useState, useEffect } from 'react';

const AD_DURATION = 30; // seconds to watch before claiming
const BONUS_MINUTES = 5;

interface Props {
  onGrantBonus: () => void;
  onClose: () => void;
}

export default function AdBonusModal({ onGrantBonus, onClose }: Props) {
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Push AdSense ad unit
    try {
      ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
    } catch {}
  }, []);

  useEffect(() => {
    if (countdown <= 0) { setReady(true); return; }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const handleClaim = () => { onGrantBonus(); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">🎁 ボーナスタイム獲得</h2>
          {ready && (
            <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none">✕</button>
          )}
        </div>

        {/* Ad banner slot */}
        <div className="w-full rounded-xl overflow-hidden bg-slate-800 mb-5" style={{ minHeight: 90 }}>
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', height: 90 }}
            data-ad-client="ca-pub-6628382645135412"
            data-ad-slot="YOUR_AD_SLOT_ID"
            data-ad-format="fixed"
          />
        </div>

        {/* Bonus description */}
        <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-4 mb-5 space-y-2 text-sm">
          <p className="text-slate-300 font-semibold mb-1">獲得できるボーナス（{BONUS_MINUTES}分間）</p>
          <div className="flex items-start gap-2 text-slate-400">
            <span className="text-amber-400 mt-0.5">◈</span>
            <span>メインステータスを自由に固定して音骸を引ける</span>
          </div>
          <div className="flex items-start gap-2 text-slate-400">
            <span className="text-amber-400 mt-0.5">◈</span>
            <span>+25音骸のサブステを最大3個まで1回だけ再抽選できる</span>
          </div>
        </div>

        {/* Timer / Claim */}
        {!ready ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>広告視聴中…</span>
              <span className="font-mono text-slate-400">{countdown}秒</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
              <div
                className="bg-violet-500 h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${((AD_DURATION - countdown) / AD_DURATION) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <button
            onClick={handleClaim}
            className="w-full py-3 rounded-xl font-bold text-white text-base transition-all"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 4px 20px #7c3aed55' }}
          >
            ✨ ボーナスタイムを受け取る
          </button>
        )}
      </div>
    </div>
  );
}
