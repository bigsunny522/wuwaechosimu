import type { SubstatKey } from '@/types/echo';

// ═══════════════════════════════════════════════════════════════════════════
//  武器クラス（キャラの weapon フィールドと一致する値のみ）
// ═══════════════════════════════════════════════════════════════════════════
export type WeaponClass = '迅刀' | '長刃' | '拳銃' | '手甲' | '増幅器';

// 武器サブステとして実在しうる型（HP%を除きキャラの主要ダメ倍率に効くもののみ）
export type WeaponSubstatKey = Extract<
  SubstatKey,
  'critRate' | 'critDmg' | 'atkPercent' | 'energyRegen' | 'hpPercent'
>;

// ═══════════════════════════════════════════════════════════════════════════
//  モチーフ（凸2 = 専用5★）武器データ
//  基準: Lv90・精錬(重ね刻印) R1 の値。R1固定とする理由は、
//  サブステ実数値・基礎攻撃力は精錬レベルに依存せず、
//  精錬効果（固有パッシブの倍率）だけが変動するため。
//  精錬効果自体はスコア計算に現状使用しない（将来拡張用に summary のみ保持）。
// ═══════════════════════════════════════════════════════════════════════════
export interface WeaponData {
  id: string;            // characters.ts の id と1:1（モチーフ武器のため）
  name: string;
  nameEn: string;
  class: WeaponClass;
  baseAtk90: number;
  substatKey: WeaponSubstatKey;
  substatValue90: number;    // %表記の数値（例: critRate なら 24.3）
  passiveSummary?: string;   // R1固有効果の要約（計算には未使用、将来拡張用）
  sourceConfidence: 'high' | 'medium' | 'low' | 'unverified';
}
