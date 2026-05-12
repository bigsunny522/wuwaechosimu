'use client';

import { useState } from 'react';
import type { EchoCost, EchoState, ScoreResult } from '@/types/echo';
import { bulkSimulate } from '@/lib/simulator';
import { scoreEcho, RANK_COLORS } from '@/lib/scorer';
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
  const [results, setResults]     = useState<BulkResult[] | null>(null);
  const [running, setRunning]     = useState(false);
  const [watchingAd, setWatchingAd] = useState(false);
  const { locale } = useLocale();
  const T = TRANSLATIONS[locale];

  const handleWatchAd = () => {
    setWatchingAd(true);
    setTimeout(() => { setWatchingAd(false); onUnlock(); }, 3000);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg mx-4 rounded-2xl bg-white p-6 shadow-2xl"
        style={{ border: '1px solid #e5e7eb' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-[#222222]">{T.bulkTitle}</h2>
          <button
            onClick={onClose}
            className="text-[#9ca3af] hover:text-[#222222] text-xl leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        {!unlocked ? (
          <div className="flex flex-col gap-4">
            {/* Icon + headline */}
            <div className="text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3"
                style={{ background: '#eef9ff', border: '1px solid #0275fd33' }}
              >
                ⚡
              </div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-sm font-semibold text-[#222222]">{T.bulkLocked}</span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                  style={{ background: '#0275fd', fontFamily: '"IBM Plex Mono", monospace' }}
                >
                  {T.adFreeLabel}
                </span>
              </div>
              <p className="text-xs text-[#9ca3af]">{T.bulkForever}</p>
            </div>

            {/* Benefits */}
            <div className="rounded-xl bg-[#f7f7f7] border border-[#e5e7eb] p-4">
              <p
                className="text-[10px] uppercase tracking-wider text-[#9ca3af] mb-3"
                style={{ fontFamily: '"IBM Plex Mono", monospace' }}
              >
                {T.adRewardsTitle}
              </p>
              <div className="space-y-2.5">
                {[T.bulkUnlockB1, T.bulkUnlockB2].map((item, i) => (
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
            </div>

            {/* CTA */}
            {watchingAd ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="w-10 h-10 border-2 border-[#0275fd] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-[#0275fd]">{T.bulkWatching}</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleWatchAd}
                  className="w-full py-3 rounded-[500px] text-sm font-semibold text-[#f7f7f7] bg-[#222222] transition-opacity hover:opacity-80 animate-pulseRing"
                >
                  {T.bulkUnlockBtn}
                </button>
                <p className="text-center text-xs text-[#9ca3af]">{T.bonusAdNote}</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm text-[#707070] mb-4">
              {interpolate(T.bulkDesc, [cost])}
            </p>
            {!results && (
              <button
                onClick={handleRun}
                disabled={running}
                className="w-full py-2.5 rounded-[500px] text-sm font-medium text-[#f7f7f7] bg-[#222222] transition-opacity hover:opacity-80 disabled:opacity-40"
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
                    background: `${RANK_COLORS[best.score.rank]}08`,
                  }}
                >
                  <div
                    className="text-4xl font-semibold mb-1"
                    style={{ color: RANK_COLORS[best.score.rank], fontFamily: 'Inter, sans-serif' }}
                  >
                    {best.score.rank}
                  </div>
                  <div className="text-[#222222] font-medium">
                    {interpolate(T.bulkScoreOf, [best.score.score])}
                  </div>
                  <div className="mt-3 space-y-1.5">
                    {best.echo.substats.map((s) => {
                      const label = locale === 'en' ? (SUBSTAT_LABEL_EN[s.key] ?? s.label) : s.label;
                      return (
                        <div key={s.key} className="flex justify-between text-sm">
                          <span className="text-[#707070]">{label}</span>
                          <span className="text-[#222222] font-medium">{s.value}{s.unit}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-xs text-[#9ca3af]">
                  {T.bulkDist}
                  {(['S+', 'S', 'A', 'B', 'C', 'D'] as const).map((r) => {
                    const cnt = results.filter((x) => x.score.rank === r).length;
                    if (cnt === 0) return null;
                    return (
                      <span key={r} className="ml-2 font-medium" style={{ color: RANK_COLORS[r] }}>
                        {r}:{cnt}
                      </span>
                    );
                  })}
                </div>

                <button
                  onClick={() => setResults(null)}
                  className="w-full py-2 rounded-lg text-sm text-[#707070] border border-[#e5e7eb] hover:border-[#d1d5db] hover:text-[#222222] transition-colors"
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
