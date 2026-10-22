import { useEffect, useState } from 'react';
import { CHARACTER_LIST } from '@/data/characters';
import { ELEMENT_ORDER, ELEMENT_THEME, elementKeyOf, type ElementKey } from './elementTheme';

type Filter = 'all' | Exclude<ElementKey, 'none'>;

interface CharacterPickerProps {
  ja: boolean;
  open: boolean;
  onClose: () => void;
  selectedCharId: string;
  onSelect: (id: string) => void;
}

export default function CharacterPicker({
  ja,
  open,
  onClose,
  selectedCharId,
  onSelect,
}: CharacterPickerProps) {
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    if (open) setFilter('all');
  }, [open]);

  if (!open) return null;

  const choose = (id: string) => {
    onSelect(id);
    onClose();
  };

  const list = filter === 'all'
    ? CHARACTER_LIST
    : CHARACTER_LIST.filter((c) => elementKeyOf(c.element) === filter);

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,.6)' }}
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[480px] rounded-t-[16px] flex flex-col h-[78vh] [@supports(height:100dvh)]:h-[78dvh]"
        style={{ background: 'var(--hd-plate)' }}
      >
        <div
          className="flex items-center justify-between shrink-0 pt-[14px] px-[16px] pb-[10px]"
        >
          <span className="text-[16px] font-bold">
            {ja ? 'キャラを選ぶ' : 'Choose character'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-[13px]"
            style={{ color: 'var(--hd-sub)' }}
          >
            {ja ? '閉じる' : 'Close'}
          </button>
        </div>

        <div className="grid grid-cols-7 gap-[4px] px-[16px] pb-[10px] shrink-0">
          <button
            type="button"
            aria-pressed={filter === 'all'}
            onClick={() => setFilter('all')}
            className={`h-[32px] rounded-[16px] whitespace-nowrap ${ja ? 'text-[12px]' : 'text-[11px]'}`}
            style={
              filter === 'all'
                ? { background: 'var(--hd-fg)', color: 'var(--hd-bg)', fontWeight: 700 }
                : { background: 'var(--hd-raise)', color: 'var(--hd-sub)' }
            }
          >
            {ja ? 'すべて' : 'All'}
          </button>
          {ELEMENT_ORDER.map((key) => {
            const theme = ELEMENT_THEME[key];
            return (
              <button
                type="button"
                key={key}
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
                className={`flex items-center justify-center gap-[4px] h-[32px] rounded-[16px] whitespace-nowrap ${ja ? 'text-[12px]' : 'text-[11px]'}`}
                style={
                  filter === key
                    ? { background: 'var(--hd-fg)', color: 'var(--hd-bg)', fontWeight: 700 }
                    : { background: 'var(--hd-raise)', color: 'var(--hd-sub)' }
                }
              >
                {ja && (
                  <span
                    className="w-[8px] h-[8px] rounded-full shrink-0"
                    style={{ background: theme.accent }}
                  />
                )}
                <span>{ja ? theme.ja : theme.en}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-3 gap-[6px] px-[16px] pb-[16px] content-start">
          {filter === 'all' && (
            <button
              type="button"
              aria-pressed={selectedCharId === 'generic'}
              onClick={() => choose('generic')}
              className="col-span-3 h-[44px] rounded-[8px] overflow-hidden grid items-center gap-[8px] pr-[6px]"
              style={{
                gridTemplateColumns: '4px minmax(0,1fr)',
                background: 'var(--hd-raise)',
                boxShadow: selectedCharId === 'generic' ? 'inset 0 0 0 2px var(--hd-fg)' : undefined,
              }}
            >
              <span className="self-stretch" style={{ background: ELEMENT_THEME.none.accent }} />
              <span className="text-left text-[13px] leading-[1.25]">
                {ja ? 'キャラなし(汎用の評価)' : 'No character (generic score)'}
              </span>
            </button>
          )}
          {list.map((c) => {
            const theme = ELEMENT_THEME[elementKeyOf(c.element)];
            const selected = selectedCharId === c.id;
            return (
              <button
                type="button"
                key={c.id}
                aria-pressed={selected}
                onClick={() => choose(c.id)}
                className="h-[52px] rounded-[8px] overflow-hidden grid items-center gap-[8px] pr-[6px]"
                style={{
                  gridTemplateColumns: '4px minmax(0,1fr)',
                  background: 'var(--hd-raise)',
                  boxShadow: selected ? 'inset 0 0 0 2px var(--hd-fg)' : undefined,
                }}
              >
                <span className="self-stretch" style={{ background: theme.accent }} />
                <span className="min-w-0 text-left">
                  <span className="block text-[13px] leading-[1.25] line-clamp-2">
                    {ja ? c.name : (c.nameEn ?? c.name)}
                  </span>
                  <span className="block text-[10px]" style={{ color: 'var(--hd-sub)' }}>
                    {ja ? theme.ja : theme.en}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
