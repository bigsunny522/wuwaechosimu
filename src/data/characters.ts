import type { CharacterBuild } from '@/types/character';

// ═══════════════════════════════════════════════════════════════════════════
//  ハーモニーセット名（echoes.ts の HARMONY_SETS と一致させること）
// ═══════════════════════════════════════════════════════════════════════════
const SET = {
  LINGERING:   '絶えない余韻',
  HEALER:      '喧騒に隠す回光',
  MOONLIT:     '月を窺う軽雲',
  HAVOC_OLD:   '二度と輝かない沈日',
  VOID:        '空を切り裂く冥雷',
  GALE:        '谷を突き抜ける長風',
  CELESTIAL:   '闇を取り払う浮星',
  FROST:       '夜にこびり付く白霜',
  MOLTEN:      '山を轟かせる崩火',
  MIDNIGHT:    'ミッドナイト・ベール',
  FROSTY:      'フロステッド・ハート',
  ETERNAL:     'エターナル・ライト',
  EMPYREAN:    'セレッシャル・アンサム',
  TIDEBREAK:   'タイズターニング・ヴァラ',
  FLAMING:     'ハウリング・フレイム',
  BOUNDLESS:   'バウンドレス・スカイ',
  GLORY_WIND:  'グロリアス・ウィンド',
  THREAD_FATE: '命理崩壊の弦',
  INFERNO:     'インフェルノ・シャドウ',
  ASTRO:       'アストロ・ロード',
  PATINA:      'パティナ・フォーム',
  SNOWY:       '静寂祈念の雪',
  SEMANTIC:    'セマンティック・ウィッシュ',
  REFLECT:     'リフレクト・ブレイズ',
  STARLIGHT:   'スターブライト・リング',
  ETHER:       'エーテル・レゾナンス',
  MONTAGE:     'モンタージュ・シルエット',
  GLORY_CROWN: 'グローリーフォージ・クラウン',
  LOST_DREAM:  'ロスト・ドリーム',
  GOLDEN:      'ゴールデン・ヴァリアント',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
//  キャラクターデータ（50体）
//  mainstat は全キャラ個別定義
//  ・cost3 推奨: 属性判明キャラは属性ダメキー、不明キャラはスルー（atkPercent/Resonanceeff）
//  ・Resonanceeff = COST3 メインステの共鳴効率キー（substats の energyRegen とは別）
// ═══════════════════════════════════════════════════════════════════════════

export const CHARACTERS: CharacterBuild[] = [

  // ── 5★ アタッカー ─────────────────────────────────────────────────────

  {
    id: 'hiyuki', name: '緋雪', element: '凝縮', weapon: '迅刀',
    role: 'メイン/サブ火力',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'resonanceSkillDmg' }, { key: 'heavyAttackDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['GlacioDmg'],             acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.SNOWY], acceptable: [SET.FROST,SET.FROSTY] },
  },

  //実装前
  // {
  //   id: 'dania', name: 'ダーニャ', element: '不明', weapon: '不明',
  //   role: 'メインアタッカー',
  //   substats: {
  //     recommended: [
  //       { key: 'critRate' },
  //       { key: 'critDmg' },
  //       { key: 'energyRegen' },
  //       { key: 'atkPercent' },
  //     ],
  //     acceptable: [{ key: 'resonanceLibDmg' }, { key: 'resonanceSkillDmg' }],
  //   },
  //   mainstat: {
  //     cost4: { recommended: ['critRate', 'critDmg'],          acceptable: ['atkPercent'] },
  //     cost3: { recommended: ['atkPercent', 'Resonanceeff'],   acceptable: [] },
  //     cost1: { recommended: ['atkPercent'],                   acceptable: [] },
  //   },
  //   harmonySets: { recommended: [SET.LINGERING], acceptable: [] },
  // },

  {
    id: 'jinhsi', name: '今汐', element: '回折', weapon: '長刃',
    role: 'メインアタッカー（共鳴スキル重視）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'resonanceSkillDmg' },
        { key: 'atkPercent' },
        { key: 'energyRegen' },
      ],
      preferred: [
        { key: 'basicAttackDmg' },
        { key: 'resonanceLibDmg'}
      ],
      acceptable: [{ key: 'atkFlat' },],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['SpectroDmg'],            acceptable: ['atkPercent'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.CELESTIAL], acceptable: [SET.ETERNAL] },
  },

  {
    id: 'changli', name: '長離', element: '焦熱', weapon: '迅刀',
    role: 'メインアタッカー（焦熱・共鳴解放）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'resonanceLibDmg' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'basicAttackDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['FusionDmg'],             acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.MOLTEN, SET.FLAMING], acceptable: [SET.LINGERING] },
  },

  {
    id: 'shorekeeper', name: 'ショアキーパー', element: '回折', weapon: '増幅器',
    role: '耐久・回復サポート',
    substats: {
      recommended: [
        { key: 'hpPercent' },
        { key: 'energyRegen' },
        { key: 'critRate' },
        { key: 'critDmg' },
      ],
      preferred:   [],
      acceptable: [{ key: 'atkPercent' }],
    },
    mainstat: {
      cost4: { recommended: ['healingBonus', 'hpPercent'],    acceptable: ['atkPercent'] },
      cost3: { recommended: ['hpPercent', 'Resonanceeff'],    acceptable: ['SpectroDmg', 'atkPercent'] },
      cost1: { recommended: ['hpPercent'],                    acceptable: ['atkPercent'] },
    },
    harmonySets: { recommended: [SET.HEALER], acceptable: [SET.CELESTIAL, SET.MOONLIT] },
  },

  {
    id: 'camellya', name: 'ツバキ', element: '消滅', weapon: '迅刀',
    role: 'メインアタッカー（通常攻撃重視）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'basicAttackDmg' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'resonanceSkillDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['HavocDmg'],              acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.MIDNIGHT, SET.HAVOC_OLD], acceptable: [SET.LINGERING] },
  },

  {
    id: 'xiangli_yao', name: '相里要', element: '電導', weapon: '手甲',
    role: 'メインアタッカー（共鳴解放重視）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'resonanceLibDmg' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'resonanceSkillDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['ElectroDmg'],            acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.VOID], acceptable: [SET.LINGERING] },
  },

  {
    id: 'verina', name: 'ヴェリーナ', element: '回折', weapon: '増幅器',
    role: '継続回復サポート',
    substats: {
      recommended: [
        { key: 'hpPercent' },
        { key: 'energyRegen' },
        { key: 'critRate' },
        { key: 'critDmg' },
      ],
      preferred:   [],
      acceptable: [{ key: 'atkPercent' }],
    },
    mainstat: {
      cost4: { recommended: ['healingBonus', 'hpPercent'],    acceptable: ['atkPercent'] },
      cost3: { recommended: ['hpPercent', 'Resonanceeff'],    acceptable: ['SpectroDmg', 'atkPercent'] },
      cost1: { recommended: ['hpPercent'],                    acceptable: ['atkPercent'] },
    },
    harmonySets: { recommended: [SET.HEALER], acceptable: [SET.CELESTIAL, SET.MOONLIT] },
  },

  {
    id: 'jiyan', name: '忌炎', element: '気動', weapon: '長刃',
    role: 'メインアタッカー（重撃重視）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'heavyAttackDmg' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'resonanceLibDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['AeroDmg'],               acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.GALE, SET.GLORY_WIND], acceptable: [SET.LINGERING] },
  },

  {
    id: 'sigrid', name: 'シグリカ', element: '気動', weapon: '手甲',
    role: 'メインアタッカー（牽引）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'resonanceSkillDmg' }, { key: 'resonanceLibDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['AeroDmg'],               acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.GALE, SET.GLORY_WIND], acceptable: [SET.LINGERING] },
  },

  {
    id: 'aimes', name: 'エイメス', element: '回折', weapon: '迅刀',
    role: 'メインアタッカー（全ダメバフ）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'resonanceSkillDmg' }, { key: 'resonanceLibDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['SpectroDmg'],            acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.CELESTIAL, SET.ETERNAL], acceptable: [SET.LINGERING] },
  },

  {
    id: 'mortefi', name: 'モーニエ', element: '凝縮', weapon: '長刃',
    role: '耐久・回復サポーター',
    substats: {
      recommended: [
        { key: 'hpPercent' },
        { key: 'energyRegen' },
        { key: 'critRate' },
        { key: 'critDmg' },
      ],
      preferred:   [],
      acceptable: [{ key: 'atkPercent' }],
    },
    mainstat: {
      cost4: { recommended: ['healingBonus', 'hpPercent'],    acceptable: ['atkPercent'] },
      cost3: { recommended: ['hpPercent', 'Resonanceeff'],    acceptable: ['GlacioDmg', 'atkPercent'] },
      cost1: { recommended: ['hpPercent'],                    acceptable: ['atkPercent'] },
    },
    harmonySets: { recommended: [SET.HEALER], acceptable: [SET.FROST, SET.FROSTY] },
  },

  {
    id: 'yuanwu', name: 'ユーノ', element: '気動', weapon: '手甲',
    role: '耐久・回復サポート（重撃バフ）',
    substats: {
      recommended: [
        { key: 'hpPercent' },
        { key: 'energyRegen' },
        { key: 'critRate' },
        { key: 'critDmg' },
      ],
      preferred:   [],
      acceptable: [{ key: 'heavyAttackDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['healingBonus', 'hpPercent'],    acceptable: ['atkPercent'] },
      cost3: { recommended: ['hpPercent', 'Resonanceeff'],    acceptable: ['AeroDmg', 'atkPercent'] },
      cost1: { recommended: ['hpPercent'],                    acceptable: ['atkPercent'] },
    },
    harmonySets: { recommended: [SET.HEALER], acceptable: [SET.GALE, SET.GLORY_WIND] },
  },

  {
    id: 'chixia_sanhua', name: '千咲', element: '消滅', weapon: '長刃',
    role: '耐久・回復、防御力デバフ',
    substats: {
      recommended: [
        { key: 'hpPercent' },
        { key: 'energyRegen' },
        { key: 'critRate' },
        { key: 'critDmg' },
      ],
      preferred:   [],
      acceptable: [{ key: 'atkPercent' }, { key: 'defPercent' }],
    },
    mainstat: {
      cost4: { recommended: ['healingBonus', 'hpPercent'],    acceptable: ['atkPercent'] },
      cost3: { recommended: ['hpPercent', 'Resonanceeff'],    acceptable: ['HavocDmg', 'atkPercent'] },
      cost1: { recommended: ['hpPercent'],                    acceptable: ['atkPercent'] },
    },
    harmonySets: { recommended: [SET.HEALER], acceptable: [SET.MIDNIGHT, SET.HAVOC_OLD] },
  },

  {
    id: 'phoebe', name: 'フィービー', element: '回折', weapon: '増幅器',
    role: 'メインアタッカー（協奏効率）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'resonanceSkillDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['SpectroDmg'],            acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.CELESTIAL, SET.ETERNAL], acceptable: [SET.LINGERING] },
  },

  {
    id: 'flova', name: 'フローヴァ', element: '消滅', weapon: '増幅器',
    role: 'メインアタッカー（重撃重視）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'heavyAttackDmg' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'resonanceSkillDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['HavocDmg'],              acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.MIDNIGHT, SET.HAVOC_OLD], acceptable: [SET.LINGERING] },
  },

  {
    id: 'zhezhi', name: '折枝', element: '凝縮', weapon: '増幅器',
    role: 'サブアタッカー（共鳴スキルバフ）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'resonanceSkillDmg' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'resonanceLibDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['GlacioDmg'],             acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.FROST, SET.FROSTY], acceptable: [SET.LINGERING] },
  },

  {
    id: 'carlotta', name: 'カルロッタ', element: '凝縮', weapon: '拳銃',
    role: 'メインアタッカー（共鳴スキル重視）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'resonanceSkillDmg' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'resonanceLibDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['GlacioDmg'],             acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.FROSTY], acceptable: [SET.FROST] },
  },

  {
    id: 'rococo', name: 'ロココ', element: '消滅', weapon: '手甲',
    role: 'サブアタッカー（通常攻撃バフ）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'basicAttackDmg' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'resonanceSkillDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['HavocDmg'],              acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.MIDNIGHT, SET.HAVOC_OLD], acceptable: [SET.LINGERING] },
  },

  {
    id: 'rover_spectro', name: '漂泊者(回折)', element: '回折', weapon: '迅刀',
    role: 'サポート・サブ火力',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'hpPercent' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],               acceptable: ['atkPercent', 'hpPercent'] },
      cost3: { recommended: ['Resonanceeff', 'SpectroDmg'],        acceptable: ['atkPercent', 'hpPercent'] },
      cost1: { recommended: ['atkPercent', 'hpPercent'],           acceptable: [] },
    },
    harmonySets: { recommended: [SET.CELESTIAL, SET.MOONLIT], acceptable: [SET.LINGERING] },
  },

  {
    id: 'rover_havoc', name: '漂泊者(消滅)', element: '消滅', weapon: '迅刀',
    role: 'メインアタッカー',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'resonanceSkillDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['HavocDmg'],              acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.MIDNIGHT, SET.HAVOC_OLD], acceptable: [SET.LINGERING] },
  },

  {
    id: 'rover_aero', name: '漂泊者(気動)', element: '気動', weapon: '迅刀',
    role: '耐久・回復サポート',
    substats: {
      recommended: [
        { key: 'hpPercent' },
        { key: 'energyRegen' },
        { key: 'critRate' },
        { key: 'critDmg' },
      ],
      preferred:   [],
      acceptable: [{ key: 'atkPercent' }],
    },
    mainstat: {
      cost4: { recommended: ['healingBonus', 'hpPercent'],    acceptable: ['atkPercent'] },
      cost3: { recommended: ['hpPercent', 'Resonanceeff'],    acceptable: ['AeroDmg', 'atkPercent'] },
      cost1: { recommended: ['hpPercent'],                    acceptable: ['atkPercent'] },
    },
    harmonySets: { recommended: [SET.HEALER], acceptable: [SET.GALE, SET.GLORY_WIND] },
  },

  {
    id: 'jianxin', name: '鑑心', element: '気動', weapon: '手甲',
    role: '耐久・回復、共鳴解放バフ',
    substats: {
      recommended: [
        { key: 'hpPercent' },
        { key: 'energyRegen' },
        { key: 'critRate' },
        { key: 'critDmg' },
      ],
      preferred:   [],
      acceptable: [{ key: 'atkPercent' }, { key: 'resonanceLibDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['healingBonus', 'hpPercent'],    acceptable: ['atkPercent'] },
      cost3: { recommended: ['hpPercent', 'Resonanceeff'],    acceptable: ['AeroDmg', 'atkPercent'] },
      cost1: { recommended: ['hpPercent'],                    acceptable: ['atkPercent'] },
    },
    harmonySets: { recommended: [SET.HEALER], acceptable: [SET.GALE, SET.GLORY_WIND] },
  },

  {
    id: 'calcharo', name: 'カカロ', element: '電導', weapon: '長刃',
    role: 'メインアタッカー（共鳴解放重視）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'resonanceLibDmg' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'resonanceSkillDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['ElectroDmg'],            acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.VOID], acceptable: [SET.LINGERING] },
  },

  {
    id: 'encore', name: 'アンコ', element: '焦熱', weapon: '増幅器',
    role: 'メインアタッカー（通常攻撃重視）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'basicAttackDmg' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'resonanceLibDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['FusionDmg'],             acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.MOLTEN, SET.FLAMING], acceptable: [SET.LINGERING] },
  },

  {
    id: 'yinlin', name: '吟霖', element: '電導', weapon: '増幅器',
    role: 'サブアタッカー（共鳴解放バフ）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'resonanceLibDmg' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'resonanceSkillDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['ElectroDmg'],            acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.VOID], acceptable: [SET.LINGERING] },
  },

  {
    id: 'lingyang', name: '凌陽', element: '凝縮', weapon: '手甲',
    role: 'メインアタッカー（凝縮ダメージ重視）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'basicAttackDmg' }, { key: 'resonanceLibDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['GlacioDmg'],             acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.FROST, SET.FROSTY], acceptable: [SET.LINGERING] },
  },

  {
    id: 'brant', name: 'ブラント', element: '焦熱', weapon: '迅刀',
    role: '耐久・回復、共鳴スキルバフ',
    substats: {
      recommended: [
        { key: 'hpPercent' },
        { key: 'energyRegen' },
        { key: 'critRate' },
        { key: 'critDmg' },
      ],
      preferred:   [],
      acceptable: [{ key: 'atkPercent' }],
    },
    mainstat: {
      cost4: { recommended: ['healingBonus', 'hpPercent'],    acceptable: ['atkPercent'] },
      cost3: { recommended: ['hpPercent', 'Resonanceeff'],    acceptable: ['FusionDmg', 'atkPercent'] },
      cost1: { recommended: ['hpPercent'],                    acceptable: ['atkPercent'] },
    },
    harmonySets: { recommended: [SET.HEALER], acceptable: [SET.MOLTEN, SET.FLAMING] },
  },

  {
    id: 'cantarella', name: 'カンタレラ', element: '消滅', weapon: '増幅器',
    role: '耐久・回復、消滅ダメバフ',
    substats: {
      recommended: [
        { key: 'hpPercent' },
        { key: 'energyRegen' },
        { key: 'critRate' },
        { key: 'critDmg' },
      ],
      preferred:   [],
      acceptable: [{ key: 'atkPercent' }],
    },
    mainstat: {
      cost4: { recommended: ['healingBonus', 'hpPercent'],    acceptable: ['atkPercent'] },
      cost3: { recommended: ['hpPercent', 'Resonanceeff'],    acceptable: ['HavocDmg', 'atkPercent'] },
      cost1: { recommended: ['hpPercent'],                    acceptable: ['atkPercent'] },
    },
    harmonySets: { recommended: [SET.HEALER], acceptable: [SET.MIDNIGHT, SET.HAVOC_OLD] },
  },

  {
    id: 'zanni', name: 'ザンニー', element: '回折', weapon: '手甲',
    role: 'メインアタッカー（回折ダメバフ）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'resonanceSkillDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['SpectroDmg'],            acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.CELESTIAL, SET.ETERNAL], acceptable: [SET.MOONLIT] },
  },

  {
    id: 'shaconne', name: 'シャコンヌ', element: '気動', weapon: '拳銃',
    role: '牽引・風蝕バフサポート',
    substats: {
      recommended: [
        { key: 'energyRegen' },
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'hpPercent' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],               acceptable: ['atkPercent', 'hpPercent'] },
      cost3: { recommended: ['Resonanceeff', 'AeroDmg'],           acceptable: ['atkPercent', 'hpPercent'] },
      cost1: { recommended: ['atkPercent', 'hpPercent'],           acceptable: [] },
    },
    harmonySets: { recommended: [SET.GALE, SET.GLORY_WIND], acceptable: [SET.LINGERING] },
  },

  {
    id: 'cartethia', name: 'カルテジア', element: '気動', weapon: '迅刀',
    role: 'メインアタッカー（風蝕効果）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'resonanceSkillDmg' }, { key: 'resonanceLibDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['AeroDmg'],               acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.GALE, SET.GLORY_WIND], acceptable: [SET.LINGERING] },
  },

  {
    id: 'lupa', name: 'ルパ', element: '焦熱', weapon: '長刃',
    role: 'サポート（協奏効率・通常攻撃バフ）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'basicAttackDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],               acceptable: ['atkPercent', 'hpPercent'] },
      cost3: { recommended: ['Resonanceeff', 'FusionDmg'],         acceptable: ['atkPercent', 'hpPercent'] },
      cost1: { recommended: ['atkPercent', 'hpPercent'],           acceptable: [] },
    },
    harmonySets: { recommended: [SET.MOLTEN, SET.FLAMING], acceptable: [SET.LINGERING] },
  },

  {
    id: 'augusta', name: 'オーガスタ', element: '不明', weapon: '長刃',
    role: 'メインアタッカー（全ダメバフ）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'resonanceLibDmg' }, { key: 'resonanceSkillDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],          acceptable: ['atkPercent'] },
      cost3: { recommended: ['atkPercent', 'Resonanceeff'],   acceptable: [] },
      cost1: { recommended: ['atkPercent'],                   acceptable: [] },
    },
    harmonySets: { recommended: [SET.LINGERING], acceptable: [] },
  },

  {
    id: 'galbrena', name: 'ガルブレーナ', element: '焦熱', weapon: '拳銃',
    role: 'メインアタッカー（重撃重視）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'heavyAttackDmg' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'resonanceSkillDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['FusionDmg'],             acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.MOLTEN, SET.FLAMING], acceptable: [SET.LINGERING] },
  },

  {
    id: 'quyuan', name: '仇遠', element: '気動', weapon: '迅刀',
    role: 'メインアタッカー（重撃・スキルダメ）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'heavyAttackDmg' },
        { key: 'resonanceSkillDmg' },
      ],
      preferred:   [],
      acceptable: [{ key: 'atkPercent' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['AeroDmg'],               acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.GALE, SET.GLORY_WIND], acceptable: [SET.LINGERING] },
  },

  {
    id: 'linne', name: 'リンネー', element: '不明', weapon: '拳銃',
    role: 'サポート（協奏効率・全ダメバフ）',
    substats: {
      recommended: [
        { key: 'energyRegen' },
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'hpPercent' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],               acceptable: ['atkPercent', 'hpPercent'] },
      cost3: { recommended: ['Resonanceeff', 'atkPercent'],        acceptable: ['hpPercent'] },
      cost1: { recommended: ['atkPercent', 'hpPercent'],           acceptable: [] },
    },
    harmonySets: { recommended: [SET.LINGERING], acceptable: [] },
  },

  {
    id: 'ryuk', name: 'リューク・ヘルセン', element: '回折', weapon: '手甲',
    role: 'メインアタッカー（回折ダメージ重視）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'resonanceSkillDmg' }, { key: 'resonanceLibDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['SpectroDmg'],            acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.CELESTIAL, SET.ETERNAL], acceptable: [SET.LINGERING] },
  },

  // ── 4★ キャラクター ────────────────────────────────────────────────────

  {
    id: 'sanhua', name: '散華', element: '凝縮', weapon: '迅刀',
    role: 'サブアタッカー（通常攻撃バフ）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'basicAttackDmg' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'resonanceSkillDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['GlacioDmg'],             acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.FROST, SET.FROSTY], acceptable: [SET.LINGERING] },
  },

  {
    id: 'mortefi_4', name: 'モルトフィー', element: '焦熱', weapon: '拳銃',
    role: 'サブアタッカー（重撃バフ）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'heavyAttackDmg' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'resonanceSkillDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['FusionDmg'],             acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.MOLTEN, SET.FLAMING], acceptable: [SET.LINGERING] },
  },

  {
    id: 'baizhi', name: '白芷', element: '凝縮', weapon: '増幅器',
    role: 'ヒーラー（全ダメバフ）',
    substats: {
      recommended: [
        { key: 'hpPercent' },
        { key: 'energyRegen' },
        { key: 'critRate' },
        { key: 'critDmg' },
      ],
      preferred:   [],
      acceptable: [{ key: 'atkPercent' }],
    },
    mainstat: {
      cost4: { recommended: ['healingBonus', 'hpPercent'],    acceptable: ['atkPercent'] },
      cost3: { recommended: ['hpPercent', 'Resonanceeff'],    acceptable: ['GlacioDmg', 'atkPercent'] },
      cost1: { recommended: ['hpPercent'],                    acceptable: ['atkPercent'] },
    },
    harmonySets: { recommended: [SET.HEALER], acceptable: [SET.FROST, SET.FROSTY] },
  },

  {
    id: 'danjin', name: '丹瑾', element: '消滅', weapon: '迅刀',
    role: 'サブアタッカー（消滅ダメバフ）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'resonanceSkillDmg' }, { key: 'heavyAttackDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['HavocDmg'],              acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.MIDNIGHT, SET.HAVOC_OLD], acceptable: [SET.LINGERING] },
  },

  {
    id: 'youhu', name: '釉瑚', element: '凝縮', weapon: '手甲',
    role: 'ヒーラー（協同攻撃バフ）',
    substats: {
      recommended: [
        { key: 'hpPercent' },
        { key: 'energyRegen' },
        { key: 'critRate' },
        { key: 'critDmg' },
      ],
      preferred:   [],
      acceptable: [{ key: 'atkPercent' }],
    },
    mainstat: {
      cost4: { recommended: ['healingBonus', 'hpPercent'],    acceptable: ['atkPercent'] },
      cost3: { recommended: ['hpPercent', 'Resonanceeff'],    acceptable: ['GlacioDmg', 'atkPercent'] },
      cost1: { recommended: ['hpPercent'],                    acceptable: ['atkPercent'] },
    },
    harmonySets: { recommended: [SET.HEALER], acceptable: [SET.FROST, SET.FROSTY] },
  },

  {
    id: 'dengdeng', name: '灯灯', element: '不明', weapon: '長刃',
    role: 'メインアタッカー（共鳴スキル強化）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'resonanceSkillDmg' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'resonanceLibDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],          acceptable: ['atkPercent'] },
      cost3: { recommended: ['atkPercent', 'Resonanceeff'],   acceptable: [] },
      cost1: { recommended: ['atkPercent'],                   acceptable: [] },
    },
    harmonySets: { recommended: [SET.LINGERING], acceptable: [] },
  },

  {
    id: 'buling', name: '卜霊', element: '不明', weapon: '増幅器',
    role: 'ヒーラー（全ダメバフ）',
    substats: {
      recommended: [
        { key: 'hpPercent' },
        { key: 'energyRegen' },
        { key: 'critRate' },
        { key: 'critDmg' },
      ],
      preferred:   [],
      acceptable: [{ key: 'atkPercent' }],
    },
    mainstat: {
      cost4: { recommended: ['healingBonus', 'hpPercent'],    acceptable: ['atkPercent'] },
      cost3: { recommended: ['hpPercent', 'Resonanceeff'],    acceptable: ['atkPercent'] },
      cost1: { recommended: ['hpPercent'],                    acceptable: ['atkPercent'] },
    },
    harmonySets: { recommended: [SET.HEALER], acceptable: [SET.LINGERING] },
  },

  {
    id: 'yuanwu_4', name: '淵武', element: '電導', weapon: '手甲',
    role: 'サポート（協同攻撃・共振削り）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'hpPercent' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],               acceptable: ['atkPercent', 'hpPercent'] },
      cost3: { recommended: ['Resonanceeff', 'ElectroDmg'],        acceptable: ['atkPercent', 'hpPercent'] },
      cost1: { recommended: ['atkPercent', 'hpPercent'],           acceptable: [] },
    },
    harmonySets: { recommended: [SET.VOID], acceptable: [SET.LINGERING] },
  },

  {
    id: 'taoqi', name: '桃祈', element: '消滅', weapon: '長刃',
    role: 'ヒーラー・スキルバフ',
    substats: {
      recommended: [
        { key: 'hpPercent' },
        { key: 'energyRegen' },
        { key: 'critRate' },
        { key: 'critDmg' },
      ],
      preferred:   [],
      acceptable: [{ key: 'atkPercent' }],
    },
    mainstat: {
      cost4: { recommended: ['healingBonus', 'hpPercent'],    acceptable: ['atkPercent'] },
      cost3: { recommended: ['hpPercent', 'Resonanceeff'],    acceptable: ['HavocDmg', 'atkPercent'] },
      cost1: { recommended: ['hpPercent'],                    acceptable: ['atkPercent'] },
    },
    harmonySets: { recommended: [SET.HEALER], acceptable: [SET.MIDNIGHT, SET.HAVOC_OLD] },
  },

  {
    id: 'aalto', name: 'アールト', element: '気動', weapon: '拳銃',
    role: 'サポート（気動ダメバフ）',
    substats: {
      recommended: [
        { key: 'energyRegen' },
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'hpPercent' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],               acceptable: ['atkPercent', 'hpPercent'] },
      cost3: { recommended: ['Resonanceeff', 'AeroDmg'],           acceptable: ['atkPercent', 'hpPercent'] },
      cost1: { recommended: ['atkPercent', 'hpPercent'],           acceptable: [] },
    },
    harmonySets: { recommended: [SET.GALE, SET.GLORY_WIND], acceptable: [SET.LINGERING] },
  },

  {
    id: 'yangyang', name: '秧秧', element: '気動', weapon: '迅刀',
    role: 'サポート（エネルギー回復特化）',
    substats: {
      recommended: [
        { key: 'energyRegen' },
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'hpPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'atkPercent' }],
    },
    mainstat: {
      cost4: { recommended: ['hpPercent', 'healingBonus'],         acceptable: ['atkPercent'] },
      cost3: { recommended: ['Resonanceeff', 'hpPercent'],         acceptable: ['AeroDmg', 'atkPercent'] },
      cost1: { recommended: ['hpPercent'],                         acceptable: ['atkPercent'] },
    },
    harmonySets: { recommended: [SET.GALE, SET.GLORY_WIND], acceptable: [SET.HEALER] },
  },

  {
    id: 'chixia', name: '熾霞', element: '焦熱', weapon: '拳銃',
    role: '焦熱メインアタッカー',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'basicAttackDmg' }, { key: 'resonanceLibDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['FusionDmg'],             acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.MOLTEN, SET.FLAMING], acceptable: [SET.LINGERING] },
  },
];

// ── ルックアップ ────────────────────────────────────────────────────────────

export const CHARACTER_MAP: Record<string, CharacterBuild> = Object.fromEntries(
  CHARACTERS.map((c) => [c.id, c])
);

export const CHARACTER_LIST = CHARACTERS.map(({ id, name, element, role }) => ({
  id, name, element, role,
}));
