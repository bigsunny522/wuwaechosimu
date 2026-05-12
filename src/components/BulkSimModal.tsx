'use client';

import { useState } from 'react';
import type { EchoCost, EchoState, ScoreResult } from '@/types/echo';
import { bulkSimulate } from '@/lib/simulator';
import { scoreEcho, RANK_COLORS } from '@/lib/scorer';
import { RANK_GLOW } from '@/lib/scorer';
import { useLocale } from '@/lib/locale';
import { TRANSLATIONS, SUBSTAT_LABEL_EN, interpolate } from '@/data/translations';

interface Props {
  cost: EchoCost;
  unlocked: boolean;
  onUnlock: () => void;
  onClose: () => void;
}

interface BulkResult {
  echo: EchoState;
  score: ScoreResult;
}

export default function BulkSimModal({ cost, unlocked, onUnlock, onClose }: Props) {
  const [results, setResults] = useState<BulkResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [watchingAd, setWatchingAd] = useState(false);
  const { locale } = useLocale();
  const T = TRANSLATIONS[locale];

  const handleWatchAd = () => {
    setWatchingAd(true);
    setTimeout(() => {
      setWatchingAd(false);
      onUnlock();
    }, 3000);
  };

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => {
      const echoes = bulkSimulate(cost, 100);
      const scored = echoes.map((e) => ({ echo: e, score: scoreEcho(e) }));
      scored.sort((a, b) => b.score.score - a.score.score);
      setResults(scored);
      setRunning(false);
    }, 100);
  };

  const best = results?.[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg mx-4 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">{T.bulkTitle}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none">✕</button>
        </div>

        {!unlocked ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">🔒</div>
            <div className="text-slate-300 text-sm mb-1">{T.bulkLocked}</div>
            <div className="text-slate-500 text-xs mb-5">{T.bulkLockedSub}</div>
            {watchingAd ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-violet-400 text-sm">{T.bulkWatching}</span>
              </div>
            ) : (
              <button
                onClick={handleWatchAd}
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors"
              >
                {T.bulkUnlockBtn}
              </button>
            )}
          </div>
        ) : (
          <div>
            <p className="text-slate-400 text-sm mb-4">
              {interpolate(T.bulkDesc, [cost])}
            </p>
            {!results && (
              <button
                onClick={handleRun}
                disabled={running}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors disabled:opacity-50"
              >
                {running ? T.bulkRunning : T.bulkStart}
              </button>
            )}
            {results && best && (
              <div className="space-y-4">
                <div
                  className="rounded-xl p-4 border text-center"
                  style={{
                    borderColor: `${RANK_COLORS[best.score.rank]}44`,
                    background: `${RANK_COLORS[best.score.rank]}11`,
                  }}
                >
                  <div
                    className="text-4xl font-black"
                    style={{ color: RANK_COLORS[best.score.rank], textShadow: RANK_GLOW[best.score.rank] }}
                  >
                    {best.score.rank}
                  </div>
                  <div className="text-white text-lg font-bold">
                    {interpolate(T.bulkScoreOf, [best.score.score])}
                  </div>
                  <div className="mt-2 space-y-1">
                    {best.echo.substats.map((s) => {
                      const label = locale === 'en' ? (SUBSTAT_LABEL_EN[s.key] ?? s.label) : s.label;
                      return (
                        <div key={s.key} className="flex justify-between text-sm">
                          <span className="text-slate-400">{label}</span>
                          <span className="text-white">{s.value}{s.unit}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Distribution */}
                <div className="text-xs text-slate-500">
                  {T.bulkDist}
                  {(['S+', 'S', 'A', 'B', 'C', 'D'] as const).map((r) => {
                    const cnt = results.filter((x) => x.score.rank === r).length;
                    if (cnt === 0) return null;
                    return (
                      <span key={r} className="ml-2" style={{ color: RANK_COLORS[r] }}>
                        {r}:{cnt}
                      </span>
                    );
                  })}
                </div>
                <button
                  onClick={() => setResults(null)}
                  className="w-full py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-sm text-white transition-colors"
                >
                  {T.bulkRetry}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
