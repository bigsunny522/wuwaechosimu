import { useState } from 'react';
import type { ScoreResult, Substat, SubstatKey } from '@/types/echo';
import type { CharacterBuild } from '@/types/character';
import { SUBSTAT_DATA, SUBSTAT_MAP } from '@/data/substats';
import { SUBSTAT_LABEL_EN } from '@/data/translations';
import { getSubstatCategory, RANK_COLORS } from '@/lib/scorer';
import ScoreDistributionChart from '@/components/ScoreDistributionChart';

interface InputDockProps {
  ja: boolean;
  draftSubs: Substat[];
  pendingKey: string;
  onPendingKeyChange: (key: string) => void;
  onAdd: (key: SubstatKey, tier: number) => void;
  onReset: () => void;
  finalScore: ScoreResult | null;
  canFinalize: boolean;
  onFinalize: () => void;
  build?: CharacterBuild;
}

function formatValue(value: number, unit: string): string {
  return unit === '%' ? value.toFixed(1) : String(value);
}

export default function InputDock({
  ja,
  draftSubs,
  pendingKey,
  onPendingKeyChange,
  onAdd,
  onReset,
  finalScore,
  canFinalize,
  onFinalize,
  build,
}: InputDockProps) {
  const [chartOpen, setChartOpen] = useState(false);

  const usedKeys = new Set(draftSubs.map((s) => s.key));
  const pendingEntry = pendingKey ? (SUBSTAT_MAP[pendingKey as SubstatKey] ?? null) : null;

  return (
    <section
      className="flex flex-col h-[calc(248px_+_env(safe-area-inset-bottom,0px))] gap-[8px] pt-[12px] px-[16px] rounded-t-[16px] [@media(max-height:780px)]:h-[calc(216px_+_env(safe-area-inset-bottom,0px))] [@media(max-height:780px)]:gap-[6px] [@media(max-height:780px)]:pt-[10px]"
      style={{
        background: 'var(--hd-plate)',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        flex: 'none',
      }}
    >
      {finalScore ? (
        <>
          <div className="flex flex-col gap-[10px] min-h-0 flex-1">
            <div className="flex items-center gap-[14px]">
              <b
                className="hd-num text-[52px] leading-none font-bold"
                style={{ color: RANK_COLORS[finalScore.rank] }}
              >
                {finalScore.rank}
              </b>
              <div className="text-[13px]" style={{ color: 'var(--hd-sub)' }}>
                {ja ? 'スコア' : 'Score'}
                <strong
                  className="hd-num block text-[22px] font-bold"
                  style={{ color: 'var(--hd-fg)' }}
                >
                  {finalScore.score} / 100
                </strong>
              </div>
            </div>
            {finalScore.distributionCurve && (
              <button
                type="button"
                onClick={() => setChartOpen(true)}
                className="self-start text-[12px] font-bold"
                style={{ color: 'var(--hd-accent)' }}
              >
                {ja ? 'スコア分布を見る' : 'See score distribution'}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onFinalize}
            disabled={!canFinalize}
            className="w-full h-[52px] shrink-0 rounded-[26px] text-[15px] font-black disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'var(--hd-accent)', color: 'var(--hd-accent-ink)' }}
          >
            {ja ? 'この結果を記録する' : 'Record this result'}
          </button>
          <div className="flex items-center justify-center h-[17px] shrink-0 [@media(max-height:780px)]:h-[13px]">
            <button
              type="button"
              onClick={onReset}
              className="text-[13px] leading-none"
              style={{ color: 'var(--hd-sub)' }}
            >
              {ja ? 'やり直す' : 'Start over'}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-[8px] min-h-0 flex-1 [@media(max-height:780px)]:gap-[6px]">
            <div className="flex items-center justify-between h-[19px]">
              <span className="text-[13px] font-bold">
                {ja
                  ? `+${(draftSubs.length + 1) * 5} に出たサブステ`
                  : `Substat at +${(draftSubs.length + 1) * 5}`}
              </span>
              {draftSubs.length > 0 && (
                <button
                  type="button"
                  onClick={onReset}
                  className="text-[12px]"
                  style={{ color: 'var(--hd-sub)' }}
                >
                  {ja ? 'やり直す' : 'Start over'}
                </button>
              )}
            </div>
            <div className="grid grid-cols-5 gap-[5px]">
              {SUBSTAT_DATA.map((s) => {
                const used = usedKeys.has(s.key);
                const selected = s.key === pendingKey;
                const cat = getSubstatCategory(s.key, build);
                const recommended = cat === 'recommended' || cat === 'preferred';
                return (
                  <button
                    type="button"
                    key={s.key}
                    disabled={used}
                    onClick={() => onPendingKeyChange(s.key)}
                    className="relative grid place-items-center text-center h-[34px] px-[2px] rounded-[8px] text-[11px] leading-[1.2] disabled:cursor-not-allowed [@media(max-height:780px)]:h-[30px]"
                    style={{
                      background: selected ? 'var(--hd-accent)' : 'var(--hd-raise)',
                      color: selected ? 'var(--hd-accent-ink)' : 'var(--hd-fg)',
                      fontWeight: selected ? 700 : 400,
                      opacity: used ? 0.35 : 1,
                    }}
                  >
                    <span className="w-full line-clamp-2">
                      {ja ? s.label : (SUBSTAT_LABEL_EN[s.key] ?? s.label)}
                    </span>
                    {recommended && (
                      <span
                        className="absolute top-[3px] right-[3px] w-[4px] h-[4px] rounded-full"
                        style={{
                          background: selected ? 'var(--hd-accent-ink)' : 'var(--hd-accent)',
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {pendingEntry ? (
            <div
              className="grid gap-[4px] shrink-0"
              style={{
                gridTemplateColumns: `repeat(${pendingEntry.values.length}, minmax(0, 1fr))`,
              }}
            >
              {pendingEntry.values.map((v, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => onAdd(pendingEntry.key, idx)}
                  className="flex flex-col items-center justify-center h-[52px] rounded-[8px] [@media(max-height:780px)]:h-[44px]"
                  style={{ border: '1px solid var(--hd-line)' }}
                >
                  <span className="hd-num text-[10px]" style={{ color: 'var(--hd-sub)' }}>
                    T{idx}
                  </span>
                  <span className="hd-num text-[13px] font-bold">
                    {formatValue(v, pendingEntry.unit)}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[52px] shrink-0 [@media(max-height:780px)]:h-[44px]">
              <span className="text-[12px]" style={{ color: 'var(--hd-sub)' }}>
                {ja ? '出た数値をタップすると追加' : 'Tap the value you rolled to add it'}
              </span>
            </div>
          )}

          <div className="h-[17px] shrink-0 [@media(max-height:780px)]:h-[13px]" />
        </>
      )}

      {chartOpen && finalScore && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0, 0, 0, 0.55)' }}
            onClick={() => setChartOpen(false)}
          />
          <div
            className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[480px] rounded-t-[16px] p-[16px] flex flex-col gap-[12px] max-h-[85vh] overflow-y-auto"
            style={{ background: 'var(--hd-plate)' }}
          >
            <ScoreDistributionChart result={finalScore} />
            <button
              type="button"
              onClick={() => setChartOpen(false)}
              className="w-full h-[48px] rounded-[24px] text-[15px] font-black"
              style={{ background: 'var(--hd-accent)', color: 'var(--hd-accent-ink)' }}
            >
              {ja ? '閉じる' : 'Done'}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
