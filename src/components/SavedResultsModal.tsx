'use client';

import { useRef, useState } from 'react';
import type { EchoState, ScoreResult } from '@/types/echo';
import { generateResultCard, buildShareText } from '@/lib/imageGen';
import ResultCardVisual from './ResultCardVisual';
import { useLocale } from '@/lib/locale';
import { TRANSLATIONS, interpolate } from '@/data/translations';

export interface SavedResult {
  id: number;
  echo: EchoState;
  score: ScoreResult;
  maxedAt: number;
  charName?: string; // キャラクター名（保存時のロケールに応じた名前）
}

interface Props {
  results: SavedResult[];
  onClear: (id: number) => void;
  onClose: () => void;
}

function formatDate(ts: number): string {
  const d    = new Date(ts);
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  const hh   = String(d.getHours()).padStart(2, '0');
  const min  = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
}

function SavedCard({ result, onClear }: { result: SavedResult; onClear: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const { locale } = useLocale();
  const T = TRANSLATIONS[locale];

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
    const text = buildShareText(result.echo, result.score, {
      locale,
      charName: result.charName,
    });
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      '_blank', 'noopener,noreferrer'
    );
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="text-[10px] text-[#9ca3af]"
        style={{ fontFamily: '"IBM Plex Mono", monospace' }}
      >
        {interpolate(T.savedDateLabel, [formatDate(result.maxedAt)])}
      </div>

      <div className="scale-[0.72] origin-top">
        <ResultCardVisual echo={result.echo} score={result.score} cardRef={cardRef} maxedAt={result.maxedAt} />
      </div>

      <div className="flex gap-2 w-full">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 py-1.5 rounded-lg text-xs font-medium text-[#f7f7f7] bg-[#222222] hover:opacity-80 transition-opacity disabled:opacity-40"
        >
          {downloading ? '⏳' : T.savedSaveBtn}
        </button>
        <button
          onClick={handleShare}
          className="flex-1 py-1.5 rounded-lg text-xs font-medium text-[#707070] border border-[#e5e7eb] hover:border-[#d1d5db] hover:text-[#222222] transition-colors"
        >
          𝕏
        </button>
        <button
          onClick={onClear}
          className="px-3 py-1.5 rounded-lg text-xs text-[#9ca3af] hover:text-[#ef4444] border border-[#e5e7eb] hover:border-[#fca5a5] transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function SavedResultsModal({ results, onClear, onClose }: Props) {
  const { locale } = useLocale();
  const T = TRANSLATIONS[locale];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg mx-4 rounded-2xl bg-white shadow-2xl flex flex-col"
        style={{ maxHeight: '85vh', border: '1px solid #e5e7eb' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f3f4f6]">
          <h2 className="text-base font-semibold text-[#222222]">{T.savedTitle}</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#9ca3af]">{interpolate(T.savedCount, [results.length])}</span>
            <button
              onClick={onClose}
              className="text-[#9ca3af] hover:text-[#222222] text-xl leading-none transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          {results.length === 0 ? (
            <div className="text-center py-12 text-[#9ca3af] text-sm">
              {T.savedEmpty}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {results.map((r) => (
                <SavedCard key={r.id} result={r} onClear={() => onClear(r.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
