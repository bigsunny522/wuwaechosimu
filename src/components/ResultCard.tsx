'use client';

import { useState } from 'react';
import type { EchoState, ScoreResult } from '@/types/echo';
import { generateResultCard, buildShareText } from '@/lib/imageGen';
import ResultCardVisual from './ResultCardVisual';
import { useLocale } from '@/lib/locale';

interface Props {
  echo: EchoState;
  score: ScoreResult;
}

export default function ResultCard({ echo, score }: Props) {
  const { locale } = useLocale();
  const [downloading, setDownloading] = useState(false);
  const isCursed = score.score < 20;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const dataUrl = await generateResultCard(echo, score, locale);
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
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      '_blank', 'noopener,noreferrer'
    );
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <ResultCardVisual echo={echo} score={score} />

      {isCursed && (
        <div className="text-center p-3 rounded-xl border border-red-900/50 bg-red-950/30 max-w-xs animate-pulse">
          <div className="text-2xl mb-1">💀</div>
          <div className="text-red-400 font-bold text-sm">呪いの音骸</div>
          <div className="text-red-500/80 text-xs mt-0.5">固定値ばかりの……供養案件です</div>
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
