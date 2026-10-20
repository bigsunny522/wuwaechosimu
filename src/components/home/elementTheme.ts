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

export const ELEMENT_THEME: Record<ElementKey, { accent: string; ja: string; en: string }> = {
  fusion:  { accent: '#FF8A5B', ja: '焦熱', en: 'Fusion' },
  glacio:  { accent: '#6CC8F0', ja: '凝縮', en: 'Glacio' },
  electro: { accent: '#B18CFF', ja: '電導', en: 'Electro' },
  aero:    { accent: '#5FD8A8', ja: '気動', en: 'Aero' },
  spectro: { accent: '#F2D16B', ja: '回折', en: 'Spectro' },
  havoc:   { accent: '#E86AA8', ja: '消滅', en: 'Havoc' },
  none:    { accent: '#A9B6C8', ja: '汎用', en: 'Generic' },
};

export const ELEMENT_ORDER: Exclude<ElementKey, 'none'>[] =
  ['fusion', 'glacio', 'electro', 'aero', 'spectro', 'havoc'];

export const ACCENT_INK = '#11141A';

export function elementKeyOf(element: string | undefined): ElementKey {
  if (!element) return 'none';
  return ELEMENT_KEY_BY_JA[element] ?? 'none';
}
