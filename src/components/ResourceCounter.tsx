'use client';

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
    <div className="flex items-center gap-1.5 bg-slate-800/60 rounded-lg px-3 py-1.5 border border-slate-700/50">
      <span className="text-base">{icon}</span>
      <div className="flex flex-col leading-none">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-semibold text-slate-200 tabular-nums">
          {value.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export default function ResourceCounter({ totalCost }: Props) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Stat label="シェルコイン" value={totalCost.shellCoins} icon="💰" />
      <Stat label="高級チューナー" value={totalCost.tunerAdvanced} icon="🔧" />
      <Stat label="秘音筒" value={totalCost.expMaterial} icon="📦" />
    </div>
  );
}
