import type { TrackedEntry, Threshold, PredictionResult } from '@/lib/tracker';
import { RANK_ORDER, probAtLeastOneWithin } from '@/lib/tracker';
import { RANK_COLORS } from '@/lib/scorer';
import { SUBSTAT_LABEL_EN } from '@/data/translations';

const ACCENT = '#0275fd';
const RUN_MILESTONES = [5, 10, 20, 50];

interface RecordsPanelProps {
  ja: boolean;
  loaded: boolean;
  entries: TrackedEntry[];
  rankCounts: Record<string, number>;
  threshold: Threshold;
  onThresholdChange: (t: Threshold) => void;
  prediction: PredictionResult | null;
  onDelete: (id: number) => void;
  onClearAll: () => void;
}

const LUCK_LABEL: Record<string, { ja: string; en: string; icon: string; color: string }> = {
  hot:          { ja: '絶好調',       en: 'On fire',       icon: '🔥', color: '#f59e0b' },
  warm:         { ja: '好調',         en: 'Lucky',         icon: '📈', color: '#10b981' },
  neutral:      { ja: '平常運',       en: 'Average',       icon: '⚖️', color: '#6b7280' },
  cool:         { ja: 'やや不調',     en: 'Below average', icon: '📉', color: '#f97316' },
  cold:         { ja: '絶不調',       en: 'Cold streak',   icon: '🥶', color: '#ef4444' },
  insufficient: { ja: 'データ不足',   en: 'Not enough data', icon: '❔', color: '#9ca3af' },
};

const fmtPct = (v: number) => `${(v * 100).toFixed(1)}%`;

export default function RecordsPanel({
  ja,
  loaded,
  entries,
  rankCounts,
  threshold,
  onThresholdChange,
  prediction,
  onDelete,
  onClearAll,
}: RecordsPanelProps) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-[#e5e7eb] p-4">
      <div className="flex items-center justify-end">
        {entries.length > 0 && (
          <button onClick={onClearAll} className="text-[10px] text-[#9ca3af] hover:text-[#ef4444] border border-[#e5e7eb] hover:border-[#ef444466] px-1.5 py-0.5 rounded transition-colors">
            {ja ? '記録を全削除' : 'Clear all'}
          </button>
        )}
      </div>

      {!loaded ? null : entries.length === 0 ? (
        <p className="text-xs text-[#9ca3af] text-center py-4">
          {ja ? 'このビルドの記録はまだありません。上のフォームから記録してください。' : 'No records yet for this build. Log one above to get started.'}
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {RANK_ORDER.filter((r) => rankCounts[r] > 0).map((r) => (
              <span
                key={r}
                className="text-[11px] font-semibold px-2 py-1 rounded-full"
                style={{ background: `${RANK_COLORS[r as keyof typeof RANK_COLORS]}22`, color: RANK_COLORS[r as keyof typeof RANK_COLORS] }}
              >
                {r} × {rankCounts[r]}
              </span>
            ))}
            <span className="text-[11px] text-[#9ca3af] px-2 py-1">
              {ja ? `計 ${entries.length} 個` : `Total: ${entries.length}`}
            </span>
          </div>

          <div className="flex gap-2 justify-center">
            {(['A', 'S', 'S+'] as Threshold[]).map((t) => (
              <button
                key={t}
                onClick={() => onThresholdChange(t)}
                className="px-4 py-1.5 rounded-[500px] text-xs font-medium transition-all"
                style={threshold === t
                  ? { background: ACCENT, color: '#fff' }
                  : { background: '#f7f7f7', border: '1px solid #e5e7eb', color: '#707070' }}
              >
                {t}{ja ? '以上を狙う' : '+ target'}
              </button>
            ))}
          </div>

          {prediction && (
            <div className="flex flex-col gap-3 rounded-lg p-3" style={{ background: '#f7f7f7' }}>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <div className="text-[10px] text-[#9ca3af]">{ja ? '実測ヒット率' : 'Observed rate'}</div>
                  <div className="text-sm font-semibold text-[#222222]">
                    {prediction.observedRate !== null ? fmtPct(prediction.observedRate) : '—'}
                    <span className="text-[10px] text-[#9ca3af] font-normal"> ({prediction.observedHits}/{prediction.observedN})</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#9ca3af]">{ja ? '理論確率' : 'Theoretical rate'}</div>
                  <div className="text-sm font-semibold text-[#222222]">{fmtPct(prediction.theoreticalRate)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: `${LUCK_LABEL[prediction.luck].color}18` }}>
                <span className="text-xs font-semibold" style={{ color: LUCK_LABEL[prediction.luck].color }}>
                  {LUCK_LABEL[prediction.luck].icon} {ja ? LUCK_LABEL[prediction.luck].ja : LUCK_LABEL[prediction.luck].en}
                </span>
                <span className="text-[10px] text-[#9ca3af]">
                  {prediction.luck === 'insufficient' ? (ja ? '5個以上で判定' : 'Needs 5+ records') : (ja ? '理論値との比較' : 'vs. theoretical rate')}
                </span>
              </div>

              <div className="text-center">
                <div className="text-[10px] text-[#9ca3af] mb-0.5">
                  {ja ? '今後の予測（実測込みの補正確率）' : 'Prediction (rate adjusted with your data)'}
                </div>
                <div className="text-lg font-bold" style={{ color: ACCENT }}>
                  {fmtPct(prediction.posteriorRate)}
                </div>
                <div className="text-xs text-[#707070]">
                  {ja
                    ? `平均 ${prediction.expectedRuns.toFixed(1)} 個に1個のペースで ${threshold}以上 が出る見込み`
                    : `≈ 1 in every ${prediction.expectedRuns.toFixed(1)} echoes reach ${threshold}+`}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-center">
                {RUN_MILESTONES.map((n) => (
                  <div key={n} className="rounded-lg bg-white py-1.5 border border-[#e5e7eb]">
                    <div className="text-[9px] text-[#9ca3af]">{n}{ja ? '個以内' : ' runs'}</div>
                    <div className="text-xs font-semibold text-[#222222]">
                      {fmtPct(probAtLeastOneWithin(prediction.posteriorRate, n))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
            {entries.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg" style={{ background: '#fafafa' }}>
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                  style={{ background: `${RANK_COLORS[e.rank]}22`, color: RANK_COLORS[e.rank] }}
                >
                  {e.rank}
                </span>
                <span className="text-xs text-[#222222] font-medium tabular-nums shrink-0">{e.score}pt</span>
                <span className="text-[10px] text-[#9ca3af] truncate flex-1">
                  {e.substats.map((s) => ja ? s.label : (SUBSTAT_LABEL_EN[s.key] ?? s.label)).join(' / ')}
                </span>
                <span className="text-[10px] text-[#9ca3af] shrink-0">
                  {new Date(e.createdAt).toLocaleDateString(ja ? 'ja-JP' : 'en-US', { month: 'numeric', day: 'numeric' })}
                </span>
                <button onClick={() => onDelete(e.id)} className="text-[#9ca3af] hover:text-[#ef4444] shrink-0 text-xs px-1">✕</button>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
