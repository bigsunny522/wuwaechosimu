'use client';

import { useRef, useState } from 'react';
import type { EchoState, ScoreResult } from '@/types/echo';
import { RANK_COLORS } from '@/lib/scorer';
import { generateResultCard, buildShareText } from '@/lib/imageGen';

export interface SavedResult {
  id: number;
  echo: EchoState;
  score: ScoreResult;
}

interface Props {
  results: SavedResult[];
  onClear: (id: number) => void;
  onClose: () => void;
}

function SavedCard({ result, onClear }: { result: SavedResult; onClear: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const color = RANK_COLORS[result.score.rank];

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await generateResultCard(cardRef.current);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `echo-${result.score.rank}-${result.score.score}pt.png`;
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    const text = buildShareText(result.echo, result.score);
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      '_blank', 'noopener,noreferrer'
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Capturable card */}
      <div
        ref={cardRef}
        className="rounded-2xl p-4 border"
        style={{
          background: 'linear-gradient(145deg, #0f1117, #161b27)',
          borderColor: `${color}44`,
          boxShadow: `0 0 20px ${color}22`,
          fontFamily: 'sans-serif',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[10px] text-slate-500 tracking-widest uppercase">鳴潮 音骸シミュレーター</div>
            <div className="text-sm font-bold text-slate-300">{result.echo.echoName}</div>
            <div className="text-xs text-slate-500">
              {result.echo.mainstat.label} {result.echo.mainstat.value}{result.echo.mainstat.unit}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black" style={{ color }}>{result.score.rank}</div>
            <div className="text-xs text-slate-400">{result.score.score} / 100</div>
          </div>
        </div>
        <div className="border-t border-slate-700/50 pt-2 space-y-1">
          {result.echo.substats.map((s) => (
            <div key={s.key} className="flex justify-between text-xs">
              <span className="text-slate-400">{s.label}</span>
              <span className="text-white font-semibold tabular-nums">{s.value}{s.unit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-medium text-white transition-colors disabled:opacity-50"
        >
          {downloading ? '⏳' : '💾'} 画像保存
        </button>
        <button
          onClick={handleShare}
          className="flex-1 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
          style={{ background: '#1a1a2e', border: '1px solid #334155' }}
        >
          𝕏 シェア
        </button>
        <button
          onClick={onClear}
          className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-red-400 border border-slate-700 hover:border-red-900 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function SavedResultsModal({ results, onClear, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg mx-4 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl flex flex-col"
        style={{ maxHeight: '85vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-base font-bold text-white">📋 保存済み結果</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">{results.length} 件</span>
            <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none">✕</button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4">
          {results.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              保存された結果がありません
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {results.map((r) => (
                <SavedCard
                  key={r.id}
                  result={r}
                  onClear={() => onClear(r.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
