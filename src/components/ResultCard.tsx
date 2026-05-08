'use client';

import { useRef, useState } from 'react';
import type { EchoState, ScoreResult } from '@/types/echo';
import { RANK_COLORS } from '@/lib/scorer';
import { generateResultCard, buildShareText } from '@/lib/imageGen';

interface Props {
  echo: EchoState;
  score: ScoreResult;
}

export default function ResultCard({ echo, score }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const color = RANK_COLORS[score.rank];

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await generateResultCard(cardRef.current);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `echo-${score.rank}-${score.score}pt.png`;
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    const text = buildShareText(echo, score);
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Low score curse effect
  const isCursed = score.score < 20;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Shareable card (off-screen render target) */}
      <div
        ref={cardRef}
        className="w-72 rounded-2xl p-5 border"
        style={{
          background: 'linear-gradient(145deg, #0f1117, #161b27)',
          borderColor: `${color}44`,
          boxShadow: `0 0 32px ${color}33`,
          fontFamily: 'sans-serif',
        }}
      >
        <div className="text-center mb-4">
          <div className="text-xs text-slate-500 tracking-widest uppercase mb-1">鳴潮 音骸シミュレーター</div>
          <div className="text-5xl font-black" style={{ color }}>{score.rank}</div>
          <div className="text-slate-400 text-sm">スコア {score.score} / 100</div>
        </div>
        <div className="border-t border-slate-700/50 pt-3 space-y-1.5">
          {echo.substats.map((s) => (
            <div key={s.key} className="flex items-start justify-between gap-2 text-sm">
              <span className="text-slate-400 leading-snug">{s.label}</span>
              <span className="text-white font-semibold shrink-0 tabular-nums">{s.value}{s.unit}</span>
            </div>
          ))}
        </div>
        {isCursed && (
          <div className="mt-3 text-center text-red-400 text-xs font-bold animate-pulse">
            ⚠️ 呪いの音骸 ⚠️
          </div>
        )}
      </div>

      {/* Curse overlay */}
      {isCursed && (
        <div className="text-center p-3 rounded-xl border border-red-900/50 bg-red-950/30 max-w-xs animate-pulse">
          <div className="text-2xl mb-1">💀</div>
          <div className="text-red-400 font-bold text-sm">呪いの音骸</div>
          <div className="text-red-500/80 text-xs mt-0.5">
            固定値ばかりの……供養案件です
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium text-white transition-colors disabled:opacity-50"
        >
          {downloading ? '⏳' : '💾'} 画像保存
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ background: '#1a1a2e', border: '1px solid #334155' }}
        >
          𝕏 シェア
        </button>
      </div>
    </div>
  );
}
