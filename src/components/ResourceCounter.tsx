'use client';

import { useLocale } from '@/lib/locale';
import { TRANSLATIONS } from '@/data/translations';

interface Cost {
  shellCoins: number;
  tunerBasic: number;
  tunerAdvanced: number;
  expMaterial: number;
}

interface Props {
  totalCost: Cost;
}

function Stat({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-[#e5e7eb]"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      <span className="text-base">{icon}</span>
      <div className="flex flex-col leading-none">
        <span
          className="text-[10px] uppercase tracking-wider mb-0.5"
          style={{ fontFamily: '"IBM Plex Mono", monospace', color: '#707070' }}
        >
          {label}
        </span>
        <span className="text-sm font-semibold tabular-nums text-[#222222]">
          {value.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export default function ResourceCounter({ totalCost }: Props) {
  const { locale } = useLocale();
  const T = TRANSLATIONS[locale];

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Stat label={T.shellCoin}  value={totalCost.shellCoins}    icon="💰" />
      <Stat label={T.tunerAdv}   value={totalCost.tunerAdvanced} icon="🔧" />
      <Stat label={T.expMat}     value={totalCost.expMaterial}   icon="📦" />
    </div>
  );
}
