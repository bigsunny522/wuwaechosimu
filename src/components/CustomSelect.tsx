'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  badge?: 'recommended' | 'acceptable';
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  accentColor?: string;
  background?: string;
  borderColor?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  accentColor = '#0275fd',
  background = 'linear-gradient(135deg, #f0f7ff 0%, #fafbff 100%)',
  borderColor = '#bdd4fb',
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? '';

  const handleToggle = useCallback(() => {
    if (!open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropUp(window.innerHeight - rect.bottom < 260);
    }
    setOpen((prev) => !prev);
  }, [open]);

  const handleSelect = useCallback(
    (val: string) => {
      onChange(val);
      setOpen(false);
      setHoveredValue(null);
    },
    [onChange],
  );

  useEffect(() => {
    if (!open) return;
    // 選択中アイテムをスクロール表示
    selectedItemRef.current?.scrollIntoView({ block: 'nearest' });

    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* トリガーボタン */}
      <button
        type="button"
        onClick={handleToggle}
        className="w-full px-4 py-3 rounded-xl text-sm font-medium text-left flex items-center justify-between gap-2"
        style={{
          background,
          border: `1.5px solid ${open ? accentColor : borderColor}`,
          boxShadow: open
            ? `0 0 0 3px ${accentColor}1a, 0 2px 8px rgba(0,0,0,0.06)`
            : '0 2px 8px rgba(0,0,0,0.06)',
          color: '#222222',
          outline: 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      >
        <span className="truncate">{selectedLabel}</span>
        <span
          className="shrink-0 text-xs"
          style={{
            color: accentColor,
            display: 'inline-block',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          ▼
        </span>
      </button>

      {/* ドロップダウンリスト */}
      {open && (
        <div
          className="absolute left-0 right-0 z-50 rounded-xl overflow-y-auto"
          style={{
            ...(dropUp ? { bottom: 'calc(100% + 6px)' } : { top: 'calc(100% + 6px)' }),
            background: '#ffffff',
            border: `1.5px solid ${borderColor}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
            maxHeight: '240px',
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            const isHovered = hoveredValue === opt.value;
            return (
              <button
                key={opt.value}
                ref={isSelected ? selectedItemRef : undefined}
                type="button"
                onClick={() => handleSelect(opt.value)}
                onMouseEnter={() => setHoveredValue(opt.value)}
                onMouseLeave={() => setHoveredValue(null)}
                className="w-full px-4 py-2.5 text-sm text-left flex items-center justify-between gap-2"
                style={{
                  background: isSelected
                    ? `${accentColor}12`
                    : isHovered
                      ? '#f5f7fa'
                      : 'transparent',
                  color: isSelected ? accentColor : '#222222',
                  fontWeight: isSelected ? 600 : 400,
                  borderBottom: '1px solid #f3f4f6',
                  transition: 'background 0.1s',
                }}
              >
                <span className="truncate">{opt.label}</span>
                <div className="flex items-center gap-1 shrink-0">
                  {opt.badge === 'recommended' && (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: '#d1fae5', color: '#059669' }}
                    >
                      推奨
                    </span>
                  )}
                  {opt.badge === 'acceptable' && (
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{ background: '#f3f4f6', color: '#9ca3af' }}
                    >
                      可
                    </span>
                  )}
                  {isSelected && (
                    <span className="text-xs" style={{ color: accentColor }}>
                      ✓
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
