import type { ScoreResult, Substat, SubstatKey } from '@/types/echo';
import type { CharacterBuild } from '@/types/character';
import { SUBSTAT_DATA, SUBSTAT_MAP } from '@/data/substats';
import { SUBSTAT_LABEL_EN } from '@/data/translations';
import { getSubstatCategory } from '@/lib/scorer';

interface InputDockProps {
  ja: boolean;
  draftSubs: Substat[];
  pendingKey: string;
  onPendingKeyChange: (key: string) => void;
  onAdd: (key: SubstatKey, tier: number) => void;
  onReset: () => void;
  onUndoLast: () => void;
  finalScore: ScoreResult | null;
  canFinalize: boolean;
  onFinalize: () => void;
  onSaveImage: () => void;
  onShare: () => void;
  savingImage: boolean;
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
  onUndoLast,
  finalScore,
  canFinalize,
  onFinalize,
  onSaveImage,
  onShare,
  savingImage,
  build,
}: InputDockProps) {
  const usedKeys = new Set(draftSubs.map((s) => s.key));
  const pendingEntry = pendingKey ? (SUBSTAT_MAP[pendingKey as SubstatKey] ?? null) : null;

  return (
    <section
      className={`flex flex-col gap-[8px] pt-[12px] px-[16px] rounded-t-[16px] [@media(max-height:780px)]:pt-[10px] ${
        finalScore
          ? ''
          : 'h-[calc(248px_+_env(safe-area-inset-bottom,0px))] [@media(max-height:780px)]:h-[calc(216px_+_env(safe-area-inset-bottom,0px))] [@media(max-height:780px)]:gap-[6px]'
      }`}
      style={{
        background: 'var(--hd-plate)',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        flex: 'none',
      }}
    >
      {finalScore ? (
        <>
          <div className="flex gap-[8px] shrink-0">
            <button
              type="button"
              onClick={onShare}
              className="flex-1 min-w-0 h-[54px] rounded-[27px] flex items-center justify-center gap-[10px] text-[16px] [@media(max-height:780px)]:h-[48px]"
              style={{ background: '#FFFFFF', color: '#0B0D11', fontWeight: 900 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.2-8.3L1.8 3h6.4l4.4 5.8zM16.7 19.2h1.7L7.2 4.7H5.4z"
                  fill="#0B0D11"
                ></path>
              </svg>
              {ja ? 'X でシェア' : 'Share on X'}
            </button>
            <button
              type="button"
              onClick={onSaveImage}
              disabled={savingImage}
              aria-label={ja ? '画像を保存' : 'Save image'}
              className="w-[54px] h-[54px] shrink-0 rounded-full flex items-center justify-center disabled:opacity-50 [@media(max-height:780px)]:w-[48px] [@media(max-height:780px)]:h-[48px]"
              style={{ background: 'var(--hd-raise)', color: 'var(--hd-fg)' }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 4v11"></path>
                <path d="M7 10l5 5 5-5"></path>
                <path d="M5 20h14"></path>
              </svg>
            </button>
          </div>

          <button
            type="button"
            onClick={onFinalize}
            disabled={!canFinalize}
            className="w-full h-[46px] shrink-0 rounded-[23px] text-[14px] font-bold disabled:opacity-30 disabled:cursor-not-allowed [@media(max-height:780px)]:h-[40px]"
            style={{ background: 'var(--hd-raise)', color: 'var(--hd-accent-text)' }}
          >
            {ja ? 'この結果を記録する' : 'Record this result'}
          </button>

          <div className="flex items-center justify-center gap-[24px] h-[24px] shrink-0 [@media(max-height:780px)]:h-[20px]">
            <button
              type="button"
              onClick={onUndoLast}
              className="text-[13px] leading-none"
              style={{ color: 'var(--hd-sub)' }}
            >
              {ja ? '1つ戻す' : 'Undo last'}
            </button>
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
    </section>
  );
}
