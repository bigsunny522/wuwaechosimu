import type { Substat } from '@/types/echo';
import type { CharacterBuild } from '@/types/character';
import { getSubstatCategory } from '@/lib/scorer';
import { SUBSTAT_LABEL_EN } from '@/data/translations';

const MAX_SUBSTATS = 5;

interface SlotListProps {
  ja: boolean;
  substats: Substat[];
  build?: CharacterBuild;
  /** 省略時は ✕ ボタンを出さない */
  onRemove?: (index: number) => void;
}

export default function SlotList({ ja, substats, build, onRemove }: SlotListProps) {
  return (
    <div
      className="grid gap-[4px]"
      style={{
        flex: '0 1 auto',
        minHeight: 156, // 5 rows x 28px + 4 gaps x 4px
        gridTemplateRows: 'repeat(5, minmax(28px, 44px))',
        alignContent: 'start',
      }}
    >
      {Array.from({ length: MAX_SUBSTATS }, (_, i) => {
        const sub = substats[i];
        const isNext = !sub && i === substats.length;
        const name = sub
          ? ja
            ? sub.label
            : (SUBSTAT_LABEL_EN[sub.key] ?? sub.label)
          : isNext
            ? ja
              ? '次はここ'
              : 'Next up'
            : ja
              ? '未解放'
              : 'Locked';
        const tierHot = sub
          ? (() => {
              const cat = getSubstatCategory(sub.key, build);
              return cat === 'recommended' || cat === 'preferred';
            })()
          : false;

        return (
          <div
            key={i}
            className="grid items-center gap-[8px]"
            style={{
              gridTemplateColumns: onRemove
                ? '34px minmax(0, 1fr) auto 28px 28px'
                : '34px minmax(0, 1fr) auto 28px',
              padding: '0 12px',
              borderRadius: 8,
              maxHeight: 44,
              background: sub ? 'var(--hd-plate)' : 'transparent',
              boxShadow: sub
                ? 'none'
                : isNext
                  ? 'inset 0 0 0 2px var(--hd-accent)'
                  : 'inset 0 0 0 1px var(--hd-line)',
              color: sub ? 'var(--hd-fg)' : isNext ? 'var(--hd-accent-text)' : 'var(--hd-sub)',
            }}
          >
            <span className="hd-num" style={{ fontSize: 12, color: 'var(--hd-sub)' }}>
              +{(i + 1) * 5}
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: isNext ? 700 : 400,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </span>
            <span
              className="hd-num"
              style={{
                fontSize: 17,
                fontWeight: 600,
                textAlign: 'right',
                color: sub ? 'var(--hd-fg)' : 'var(--hd-sub)',
              }}
            >
              {sub ? `${sub.value}${sub.unit}` : '—'}
            </span>
            <span
              className="hd-num"
              style={{
                fontSize: 12,
                textAlign: 'right',
                color: tierHot ? 'var(--hd-accent-text)' : 'var(--hd-sub)',
                fontWeight: tierHot ? 700 : 400,
              }}
            >
              {sub ? `T${sub.tier}` : ''}
            </span>
            {onRemove ? (
              sub ? (
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  aria-label={ja ? '削除' : 'Remove'}
                  style={{
                    width: 28,
                    height: 28,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 12,
                    color: 'var(--hd-sub)',
                    borderRadius: 8,
                  }}
                >
                  ✕
                </button>
              ) : (
                <span />
              )
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
