/**
 * キャラクターデータ（src/data/characters.ts）に日本語で入っている
 * 属性・武器種・運用ロールの英語表記。/chardb の英語表示に使う。
 * characters.ts に新しい値を追加したら、ここにも追記すること。
 */

export const ELEMENT_EN: Record<string, string> = {
  消滅: 'Havoc',
  凝縮: 'Glacio',
  回折: 'Spectro',
  電導: 'Electro',
  焦熱: 'Fusion',
  気動: 'Aero',
  不明: 'Unknown',
};

export const WEAPON_EN: Record<string, string> = {
  迅刀:   'Sword',
  長刃:   'Broadblade',
  拳銃:   'Pistols',
  手甲:   'Gauntlets',
  増幅器: 'Rectifier',
};

export const ROLE_EN: Record<string, string> = {
  'メインアタッカー':                     'Main DPS',
  'メインアタッカー（重撃重視）':         'Main DPS (heavy attack focus)',
  'メインアタッカー（重撃・スキルダメ）': 'Main DPS (heavy attack & skill damage)',
  'メインアタッカー（牽引）':             'Main DPS (crowd control)',
  'メインアタッカー（回折ダメージ重視）': 'Main DPS (Spectro damage focus)',
  'メインアタッカー（回折ダメバフ）':     'Main DPS (Spectro damage buff)',
  'メインアタッカー（全ダメバフ）':       'Main DPS (all-damage buff)',
  'メインアタッカー（風蝕効果）':         'Main DPS (Aero Erosion)',
  'メインアタッカー（協奏効率）':         'Main DPS (concerto efficiency)',
  'メインアタッカー（共鳴スキル重視）':   'Main DPS (resonance skill focus)',
  'メインアタッカー（共鳴解放重視）':     'Main DPS (resonance liberation focus)',
  'メインアタッカー（通常攻撃重視）':     'Main DPS (basic attack focus)',
  'メインアタッカー（焦熱・共鳴スキル）': 'Main DPS (Fusion & resonance skill)',
  'メインアタッカー（凝縮ダメージ重視）': 'Main DPS (Glacio damage focus)',
  'サブアタッカー':                       'Sub DPS',
  'サブアタッカー/メインアタッカー':      'Sub DPS / Main DPS',
  'サブアタッカー（通常攻撃バフ）':       'Sub DPS (basic attack buff)',
  'サブアタッカー（共鳴スキルバフ）':     'Sub DPS (resonance skill buff)',
  'サブアタッカー（共鳴解放バフ）':       'Sub DPS (resonance liberation buff)',
  'サポート・サブ火力':                   'Support / secondary damage',
  'サポート（協奏効率・全ダメバフ）':     'Support (concerto efficiency & all-damage buff)',
  'サポート（協奏効率・通常攻撃バフ）':   'Support (concerto efficiency & basic attack buff)',
  '牽引・風蝕バフサポート':               'Crowd control & Aero Erosion support',
  '耐久・回復サポーター':                 'Survivability & healing support',
  '耐久・回復サポート':                   'Survivability & healing support',
  '耐久・回復、全ダメバフ':               'Survivability, healing & all-damage buff',
  '耐久・回復サポート（重撃バフ）':       'Survivability & healing support (heavy attack buff)',
  '耐久・回復、防御力デバフ':             'Survivability, healing & DEF shred',
  '耐久・回復、消滅ダメバフ':             'Survivability, healing & Havoc damage buff',
  '耐久・回復、共鳴スキルバフ':           'Survivability, healing & resonance skill buff',
  '耐久・回復、共鳴解放バフ':             'Survivability, healing & resonance liberation buff',
  '継続回復サポート':                     'Sustained healing support',
  'メインアタッカー（密集協和効果）':     'Main DPS (Tune Strain effect)',
  main:   'Main DPS',
  sub:    'Sub DPS',
  healer: 'Healer',
};

/** 辞書に未登録の値は元の文字列をそのまま返す */
export function localizeLabel(map: Record<string, string>, value: string, locale: 'ja' | 'en'): string {
  if (locale === 'ja') return value;
  return map[value] ?? value;
}
