import { Fragment } from 'react';
import type { EchoCost } from '@/types/echo';
import CustomSelect, { type SelectOption } from '@/components/CustomSelect';

const COST_OPTIONS: EchoCost[] = [4, 3, 1];

export interface MainstatChoice {
  key: string;
  name: string;
  valueText: string;
  recommended: boolean;
}

interface BuildBarProps {
  ja: boolean;
  accent: string;
  charName: string;
  charElement: string;
  recommendFor: string;
  cost: EchoCost;
  onCostChange: (c: EchoCost) => void;
  onOpenPicker: () => void;
  open: boolean;
  onClose: () => void;
  selectedEchoId: string;
  onEchoChange: (id: string) => void;
  echoOptions: SelectOption[];
  selectedHarmonySet: string;
  onHarmonyChange: (s: string) => void;
  harmonyOptions: SelectOption[];
  draftMainstatKey: string;
  onMainstatChange: (key: string) => void;
  mainstatChoices: MainstatChoice[];
  /** メインステの小見出し(省略時は「メインステータス(+25 の値)」) */
  mainstatTitle?: string;
  /** シートの見出し(省略時は「音骸とメインステータス」) */
  sheetTitle?: string;
  cost4MultiSet: boolean;
  multiSetOptions: SelectOption[];
  draftHarmonySet: string;
  onDraftHarmonySetChange: (s: string) => void;
}

export default function BuildBar({
  ja,
  accent,
  charName,
  charElement,
  recommendFor,
  cost,
  onCostChange,
  onOpenPicker,
  open,
  onClose,
  selectedEchoId,
  onEchoChange,
  echoOptions,
  selectedHarmonySet,
  onHarmonyChange,
  harmonyOptions,
  draftMainstatKey,
  onMainstatChange,
  mainstatChoices,
  mainstatTitle,
  sheetTitle,
  cost4MultiSet,
  multiSetOptions,
  draftHarmonySet,
  onDraftHarmonySetChange,
}: BuildBarProps) {
  const selectStyle = {
    textColor: 'var(--hd-fg)',
    background: 'var(--hd-raise)',
    borderColor: 'var(--hd-line)',
    accentColor: accent,
    dropdownBg: 'var(--hd-raise)',
  };

  return (
    <>
      <div className="flex gap-[6px] px-[16px] pt-[8px]" style={{ flex: 'none' }}>
        <button
          type="button"
          onClick={onOpenPicker}
          className="flex-1 min-w-0 h-[48px] [@media(max-height:780px)]:h-[44px] rounded-[10px] overflow-hidden grid items-center gap-[12px] pr-[12px] text-left"
          style={{ background: 'var(--hd-plate)', gridTemplateColumns: '4px minmax(0,1fr) auto' }}
        >
          <span className="self-stretch" style={{ background: 'var(--hd-accent)' }} />
          <span className="min-w-0">
            <small className="block text-[11px] leading-[1.2]" style={{ color: 'var(--hd-sub)' }}>
              {ja ? 'キャラ' : 'Character'}
            </small>
            <span className="flex items-baseline">
              <strong className="flex-1 min-w-0 truncate text-[16px] leading-[1.25] font-bold">
                {charName}
              </strong>
              <span
                className="shrink-0 ml-[8px] text-[12px] font-bold"
                style={{ color: 'var(--hd-accent-text)' }}
              >
                {charElement}
              </span>
            </span>
          </span>
          <span
            className="flex items-center gap-[4px] whitespace-nowrap text-[12px]"
            style={{ color: 'var(--hd-sub)' }}
          >
            {ja ? '変更' : 'Change'}
            <span
              aria-hidden
              className="shrink-0"
              style={{
                width: 7,
                height: 7,
                borderRight: '2px solid currentColor',
                borderBottom: '2px solid currentColor',
                transform: 'rotate(-45deg)',
              }}
            />
          </span>
        </button>

        <div
          className="flex items-center gap-[2px] px-[6px] rounded-[10px] shrink-0"
          style={{ background: 'var(--hd-plate)' }}
        >
          <small
            className="mr-[2px] text-[10px]"
            style={{ color: 'var(--hd-sub)', writingMode: 'vertical-rl', letterSpacing: '0.05em' }}
          >
            COST
          </small>
          {COST_OPTIONS.map((c) => (
            <button
              type="button"
              key={c}
              aria-pressed={cost === c}
              onClick={() => onCostChange(c)}
              className={`hd-num grid place-items-center h-[32px] [@media(max-height:780px)]:h-[28px] min-w-[30px] text-[13px] rounded-[6px] ${
                cost === c ? 'font-bold' : ''
              }`}
              style={
                cost === c
                  ? { background: 'var(--hd-accent)', color: 'var(--hd-accent-ink)' }
                  : { color: 'var(--hd-sub)' }
              }
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0, 0, 0, 0.55)' }}
            onClick={onClose}
          />
          <div
            className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[480px] rounded-t-[16px] p-[16px] flex flex-col gap-[12px]"
            style={{ background: 'var(--hd-plate)' }}
          >
            <h2 className="text-[16px] font-bold">
              {sheetTitle ?? (ja ? '音骸とメインステータス' : 'Echo & main stat')}
            </h2>
            {mainstatChoices.length > 0 && (
              <>
                <h3 className="text-[12px] font-bold" style={{ color: 'var(--hd-sub)' }}>
                  {mainstatTitle ?? (ja ? 'メインステータス(+25 の値)' : 'Main stat (value at +25)')}
                </h3>
                <div className="grid grid-cols-3 gap-[8px]">
                  {mainstatChoices.map((c) => {
                    const selected = c.key === draftMainstatKey;
                    return (
                      <button
                        key={c.key}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onMainstatChange(c.key)}
                        className="flex flex-col items-center justify-center gap-[2px] h-[56px] rounded-[8px] px-[6px] text-center"
                        style={
                          selected
                            ? { background: 'var(--hd-accent)', color: 'var(--hd-accent-ink)' }
                            : { background: 'var(--hd-raise)', color: 'var(--hd-fg)' }
                        }
                      >
                        {/* 改行は「ダメージ」「アップ」の手前だけで起こす(「アッ/プ」のような割れ方を防ぐ) */}
                        <span className="w-full text-[12px] leading-[1.25] line-clamp-2 [word-break:keep-all]">
                          {c.name.split(/(?=ダメージ|アップ)/).map((part, i) => (
                            <Fragment key={i}>{i > 0 && <wbr />}{part}</Fragment>
                          ))}
                        </span>
                        <span className="hd-num text-[13px] font-bold">
                          {c.recommended && (
                            <span className="mr-[2px]" style={{ color: selected ? undefined : 'var(--hd-accent-text)' }}>★</span>
                          )}
                          {c.valueText}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {recommendFor && (
                  <p className="text-[11px]" style={{ color: 'var(--hd-sub)' }}>
                    {ja ? `★ は ${recommendFor} のおすすめ` : `★ = recommended for ${recommendFor}`}
                  </p>
                )}
              </>
            )}
            <h3 className="text-[12px] font-bold" style={{ color: 'var(--hd-sub)' }}>
              {cost === 4 ? (ja ? '音骸' : 'Echo') : (ja ? 'ハーモニー' : 'Set')}
            </h3>
            {cost === 4 ? (
              <CustomSelect
                value={selectedEchoId}
                onChange={onEchoChange}
                options={echoOptions}
                {...selectStyle}
              />
            ) : (
              <CustomSelect
                value={selectedHarmonySet}
                onChange={onHarmonyChange}
                options={harmonyOptions}
                {...selectStyle}
              />
            )}
            {cost4MultiSet && (
              <>
                <h3 className="text-[12px] font-bold" style={{ color: 'var(--hd-sub)' }}>
                  {ja ? 'ハーモニー' : 'Set'}
                </h3>
                <CustomSelect
                  value={draftHarmonySet}
                  onChange={onDraftHarmonySetChange}
                  options={multiSetOptions}
                  {...selectStyle}
                />
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-full h-[48px] rounded-[24px] text-[15px] font-black"
              style={{ background: 'var(--hd-accent)', color: 'var(--hd-accent-ink)' }}
            >
              {ja ? '閉じる' : 'Done'}
            </button>
          </div>
        </>
      )}
    </>
  );
}
