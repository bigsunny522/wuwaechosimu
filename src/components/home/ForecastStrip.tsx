import type { AdvisorResult } from '@/lib/monteCarlo';
import type { ScoreResult } from '@/types/echo';
import { RANK_COLORS } from '@/lib/scorer';

interface ForecastStripProps {
  ja: boolean;
  advisor: AdvisorResult | null;
  finalScore: ScoreResult | null;
}

const RECOMMENDATION: Record<
  AdvisorResult['recommendation'],
  { ja: string; en: string; color: string }
> = {
  great: { ja: '強く継続推奨', en: 'Strong Continue', color: '#7FD6A4' },
  good: { ja: '継続推奨', en: 'Continue', color: '#A98BFF' },
  borderline: { ja: '様子見', en: 'Borderline', color: '#F0B35A' },
  scrap: { ja: '破棄推奨', en: 'Consider Scrap', color: '#FF8A8A' },
};

const PROB_ROWS = [
  { ja: 'A以上', en: 'A or higher', key: 'probAPlus' },
  { ja: 'S以上', en: 'S or higher', key: 'probSPlus' },
  { ja: 'S+以上', en: 'S+', key: 'probSStarPlus' },
] as const;

export default function ForecastStrip({ ja, advisor, finalScore }: ForecastStripProps) {
  return (
    <div
      className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-[12px] px-[12px] py-[10px] rounded-[10px] overflow-hidden h-[88px] [@media(max-height:700px)]:h-[84px] [@media(max-height:700px)]:py-[8px]"
      style={{ background: 'var(--hd-plate)', flex: 'none', lineHeight: 1.45 }}
    >
      <div className="text-center pr-[12px]" style={{ borderRight: '1px solid var(--hd-line)' }}>
        {finalScore ? (
          <>
            <span
              className="hd-num block text-[34px] leading-none font-bold [@media(max-height:700px)]:text-[28px]"
              style={{ color: 'var(--hd-accent)' }}
            >
              {finalScore.score}
            </span>
            <span className="block text-[11px]" style={{ color: 'var(--hd-sub)' }}>
              {ja ? '最終スコア' : 'Final score'}
            </span>
          </>
        ) : advisor ? (
          <>
            <span
              className="hd-num block text-[34px] leading-none font-bold [@media(max-height:700px)]:text-[28px]"
              style={{ color: 'var(--hd-accent)' }}
            >
              {Math.round(advisor.expectedScore)}
            </span>
            <span className="block text-[11px]" style={{ color: 'var(--hd-sub)' }}>
              {ja ? '予想スコア' : 'Est. score'}
            </span>
          </>
        ) : (
          <span
            className="hd-num block text-[34px] leading-none font-bold [@media(max-height:700px)]:text-[28px]"
            style={{ color: 'var(--hd-accent)' }}
          >
            —
          </span>
        )}
      </div>

      {finalScore ? (
        <div className="flex items-baseline gap-[6px] min-w-0">
          <span
            className="text-[22px] leading-none font-bold"
            style={{ color: RANK_COLORS[finalScore.rank] }}
          >
            {finalScore.rank}
          </span>
          <span className="text-[12px]" style={{ color: 'var(--hd-sub)' }}>
            {ja ? '確定' : 'Final'}
          </span>
        </div>
      ) : advisor ? (
        <div className="min-w-0">
          <div
            className="flex items-baseline gap-[6px] text-[13px] font-bold min-w-0"
            style={{ color: RECOMMENDATION[advisor.recommendation].color }}
          >
            <span className="shrink-0">
              {ja
                ? RECOMMENDATION[advisor.recommendation].ja
                : RECOMMENDATION[advisor.recommendation].en}
            </span>
            <small
              className="text-[12px] font-normal truncate"
              style={{ color: 'var(--hd-sub)' }}
            >
              {ja
                ? `この音骸の平均 ${Math.round(advisor.baselineScore)}`
                : `avg for this echo ${Math.round(advisor.baselineScore)}`}
            </small>
          </div>
          <div className="grid grid-cols-3 gap-[8px] mt-[4px]">
            {PROB_ROWS.map((row) => {
              const pct = Math.round(advisor[row.key] * 100);
              return (
                <div key={row.key} className="min-w-0">
                  <div className="text-[11px] truncate" style={{ color: 'var(--hd-sub)' }}>
                    {ja ? row.ja : row.en}
                  </div>
                  <div className="hd-num text-[16px]">{pct}%</div>
                  <div
                    className="mt-[2px] h-[3px] rounded-[2px]"
                    style={{ background: 'var(--hd-line)' }}
                  >
                    <div
                      className="h-full rounded-[2px]"
                      style={{ width: `${pct}%`, background: 'var(--hd-accent)' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-[13px] min-w-0" style={{ color: 'var(--hd-sub)' }}>
          {ja ? 'サブステを1個入れると予測が出ます' : 'Add a substat to see the forecast'}
        </div>
      )}
    </div>
  );
}
