import type { ScoreRank } from '@/types/echo';
import { RANK_COLORS } from '@/lib/scorer';
import type { SiteMode } from '@/contexts/SiteAppearanceContext';

export type ElementKey = 'fusion' | 'glacio' | 'electro' | 'aero' | 'spectro' | 'havoc' | 'none';

// キャラデータの element(日本語)→ キー。表にない値('不明' など)は 'none'
export const ELEMENT_KEY_BY_JA: Record<string, ElementKey> = {
  '焦熱': 'fusion',
  '凝縮': 'glacio',
  '電導': 'electro',
  '気動': 'aero',
  '回折': 'spectro',
  '消滅': 'havoc',
};

export const ELEMENT_THEME: Record<ElementKey, { accent: string; textLight: string; ja: string; en: string }> = {
  fusion:  { accent: '#FF8A5B', textLight: '#B4481B', ja: '焦熱', en: 'Fusion' },
  glacio:  { accent: '#6CC8F0', textLight: '#0E6A94', ja: '凝縮', en: 'Glacio' },
  electro: { accent: '#B18CFF', textLight: '#6A42D0', ja: '電導', en: 'Electro' },
  aero:    { accent: '#5FD8A8', textLight: '#11744F', ja: '気動', en: 'Aero' },
  spectro: { accent: '#F2D16B', textLight: '#806200', ja: '回折', en: 'Spectro' },
  havoc:   { accent: '#E86AA8', textLight: '#A3306A', ja: '消滅', en: 'Havoc' },
  none:    { accent: '#A9B6C8', textLight: '#56627A', ja: '汎用', en: 'Generic' },
};

export const ELEMENT_ORDER: Exclude<ElementKey, 'none'>[] =
  ['fusion', 'glacio', 'electro', 'aero', 'spectro', 'havoc'];

export const ACCENT_INK = '#11141A';

// ライト(白地)で順位の文字として読める色。ダークは RANK_COLORS
export const RANK_TEXT_LIGHT: Record<ScoreRank, string> = {
  GOD: '#B35F00',
  'S+': '#8A6D00',
  S: '#806600',
  A: '#6A42D0',
  B: '#1F64C2',
  C: '#1B7F45',
  D: '#56627A',
};

export function rankTextColor(rank: ScoreRank, mode: SiteMode): string {
  return mode === 'light' ? RANK_TEXT_LIGHT[rank] : RANK_COLORS[rank];
}

export function elementKeyOf(element: string | undefined): ElementKey {
  if (!element) return 'none';
  return ELEMENT_KEY_BY_JA[element] ?? 'none';
}
