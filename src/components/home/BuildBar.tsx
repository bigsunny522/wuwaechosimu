import type { EchoCost } from '@/types/echo';
import CustomSelect, { type SelectOption } from '@/components/CustomSelect';

const COST_OPTIONS: EchoCost[] = [4, 3, 1];

const SELECT_STYLE = {
  textColor: 'var(--hd-fg)',
  background: 'var(--hd-raise)',
  borderColor: 'var(--hd-line)',
  accentColor: '#A98BFF',
  dropdownBg: 'var(--hd-raise)',
};

interface BuildBarProps {
  ja: boolean;
  charName: string;
  charNameEn: string;
  cost: EchoCost;
  echoName: string;
  echoNameEn: string;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  selectedCharId: string;
  onCharChange: (id: string) => void;
  charOptions: SelectOption[];
  onCostChange: (c: EchoCost) => void;
  selectedEchoId: string;
  onEchoChange: (id: string) => void;
  echoOptions: SelectOption[];
  selectedHarmonySet: string;
  onHarmonyChange: (s: string) => void;
  harmonyOptions: SelectOption[];
  draftMainstatKey: string;
  onMainstatChange: (key: string) => void;
  mainstatOptions: SelectOption[];
  cost4MultiSet: boolean;
  multiSetOptions: SelectOption[];
  draftHarmonySet: string;
  onDraftHarmonySetChange: (s: string) => void;
}

export default function BuildBar({
  ja,
  charName,
  charNameEn,
  cost,
  echoName,
  echoNameEn,
  open,
  onOpen,
  onClose,
  selectedCharId,
  onCharChange,
  charOptions,
  onCostChange,
  selectedEchoId,
  onEchoChange,
  echoOptions,
  selectedHarmonySet,
  onHarmonyChange,
  harmonyOptions,
  draftMainstatKey,
  onMainstatChange,
  mainstatOptions,
  cost4MultiSet,
  multiSetOptions,
  draftHarmonySet,
  onDraftHarmonySetChange,
}: BuildBarProps) {
  const name = ja ? charName : charNameEn;
  const initial = name.charAt(0);
  const chipStyle = { background: 'var(--hd-raise)' };

  return (
    <>
      <div className="flex gap-[6px] px-[16px] pt-[8px] overflow-hidden" style={{ flex: 'none' }}>
        <button
          type="button"
          onClick={onOpen}
          className="flex items-center gap-[6px] h-[34px] pl-[3px] pr-[12px] rounded-[17px] text-[13px] font-bold whitespace-nowrap shrink-0"
          style={chipStyle}
        >
          <span
            className="grid place-items-center w-[28px] h-[28px] rounded-full text-[12px] shrink-0"
            style={{ border: '2px solid var(--hd-accent)', color: 'var(--hd-accent)' }}
          >
            {initial}
          </span>
          {name}
        </button>
        <button
          type="button"
          onClick={onOpen}
          className="hd-num flex items-center h-[34px] px-[12px] rounded-[17px] text-[13px] whitespace-nowrap shrink-0"
          style={chipStyle}
        >
          COST {cost}
        </button>
        <button
          type="button"
          onClick={onOpen}
          className="flex items-center h-[34px] px-[12px] rounded-[17px] text-[13px] whitespace-nowrap shrink-0"
          style={chipStyle}
        >
          {ja ? echoName : echoNameEn}
        </button>
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
            <CustomSelect
              value={selectedCharId}
              onChange={onCharChange}
              options={charOptions}
              {...SELECT_STYLE}
            />
            <div className="flex gap-[8px] justify-center">
              {COST_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => onCostChange(c)}
                  className="hd-num px-[20px] py-[8px] rounded-[500px] text-[14px] font-medium"
                  style={
                    cost === c
                      ? { background: 'var(--hd-accent)', color: 'var(--hd-accent-ink)' }
                      : {
                          background: 'var(--hd-raise)',
                          border: '1px solid var(--hd-line)',
                          color: 'var(--hd-sub)',
                        }
                  }
                >
                  COST {c}
                </button>
              ))}
            </div>
            {cost === 4 ? (
              <CustomSelect
                value={selectedEchoId}
                onChange={onEchoChange}
                options={echoOptions}
                {...SELECT_STYLE}
              />
            ) : (
              <CustomSelect
                value={selectedHarmonySet}
                onChange={onHarmonyChange}
                options={harmonyOptions}
                {...SELECT_STYLE}
              />
            )}
            <CustomSelect
              value={draftMainstatKey}
              onChange={onMainstatChange}
              options={mainstatOptions}
              {...SELECT_STYLE}
            />
            {cost4MultiSet && (
              <CustomSelect
                value={draftHarmonySet}
                onChange={onDraftHarmonySetChange}
                options={multiSetOptions}
                {...SELECT_STYLE}
              />
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
