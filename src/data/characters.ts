import type { CharacterBuild } from '@/types/character';
import { HARMONY_SETS as HS } from '@/data/echoes';

// ═══════════════════════════════════════════════════════════════════════════
//  ハーモニーセット名（echoes.ts の HARMONY_SETS と一致させること）
// ═══════════════════════════════════════════════════════════════════════════
const SET = {
  LINGERING:   HS.LINGERING_TUNES,
  HEALER:      HS.REJUVENATING_GLOW,
  MOONLIT:     HS.MOONLIT_CLOUDS,
  HAVOC_OLD:   HS.HAVOC_ECLIPSE,
  VOID:        HS.VOID_THUNDER,
  GALE:        HS.SIERRA_GALE,
  CELESTIAL:   HS.CELESTIAL_LIGHT,
  FROST:       HS.FREEZING_FROST,
  MOLTEN:      HS.MOLTEN_RIFT,
  MIDNIGHT:    HS.MIDNIGHT_VEIL,
  FROSTY:      HS.FROSTY_RESOLVE,
  ETERNAL:     HS.ETERNAL_RADIANCE,
  EMPYREAN:    HS.EMPYREAN_ANTHEM,
  TIDEBREAK:   HS.TIDEBREAKING_COURAGE,
  FLAMING:     HS.FLAMING_CLAW,
  BOUNDLESS:   HS.GUSTS_OF_WELKIN,
  GLORY_WIND:  HS.GLORIOUS_WIND,
  THREAD_FATE: HS.THREAD_OF_FATE,
  INFERNO:     HS.INFERNO_SHADOW,
  ASTRO:       HS.ASTRO_LORD,
  PATINA:      HS.PATINA_FOAM,
  SNOWY:       HS.SNOWY_SILENCE,
  SEMANTIC:    HS.SEMANTIC_WISH,
  REFLECT:     HS.REFLECT_BLAZE,
  STARLIGHT:   HS.STARLIGHT_RING,
  ETHER:       HS.ETHER_RESONANCE,
  MONTAGE:     HS.MONTAGE_SILHOUETTE,
  GLORY_CROWN: HS.GLORY_FORGE_CROWN,
  LOST_DREAM:  HS.LOST_DREAM,
  GOLDEN:      HS.GILDED_REVELATION,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
//  キャラクターデータ
//  mainstat は全キャラ個別定義
//  ・cost3 推奨: 属性判明キャラは属性ダメキー、不明キャラはスルー（atkPercent/Resonanceeff）
//  ・Resonanceeff = COST3 メインステの共鳴効率キー（substats の energyRegen とは別）
// ═══════════════════════════════════════════════════════════════════════════

export const CHARACTERS: CharacterBuild[] = [

  // ── 5★ キャラクター（実装降順）────────────────────────────────────────

  {
    id: 'hiyuki', name: '緋雪', element: '凝縮', weapon: '迅刀',
    role: 'メイン/サブ火力',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'resonanceLibDmg' },
        { key: 'atkPercent' },
      ],
      preferred:   [{ key: 'energyRegen' }],
      acceptable: [{ key: 'atkFlat' }],
    },
    mainstat: {
      cost4: { recommended: ['critDmg'],   acceptable: ['critRate', 'atkPercent'] },
      cost3: { recommended: ['GlacioDmg'],             acceptable: ['atkPercent'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.SNOWY], acceptable: [SET.FROST,SET.FROSTY] },
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
      cost3: { recommended: ['atkPercent'],               acceptable: ['AeroDmg', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.GALE, SET.SEMANTIC], acceptable: [SET.GLORY_WIND] },
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
        { key: 'basicAttackDmg' },
      ],
      preferred:   [{ key: 'atkFlat' }],
      acceptable: [{ key: 'resonanceSkillDmg' }, { key: 'resonanceLibDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['atkPercent','SpectroDmg'],            acceptable: [] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [], acceptable: [SET.CELESTIAL, SET.ETERNAL] },
  },

  {
    id: 'aimes', name: 'エイメス', element: '焦熱', weapon: '迅刀',
    role: 'メインアタッカー（全ダメバフ）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
      ],
      preferred:   [{ key: 'basicAttackDmg' }],
      acceptable: [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['SpectroDmg' , 'atkPercent'],   acceptable: [] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.ASTRO], acceptable: [] },
  },

  {
    id: 'mortefi', name: 'モーニエ', element: '焦熱', weapon: '長刃',
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
      cost4: { recommended: ['healingBonus', 'defPercent'],    acceptable: [] },
      cost3: { recommended: ['Resonanceeff'],    acceptable: ['GlacioDmg', 'defPercent'] },
      cost1: { recommended: ['defPercent'],                    acceptable: [] },
    },
    harmonySets: { recommended: [SET.STARLIGHT], acceptable: [] },
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
        { key: 'basicAttackDmg' },
      ],
      preferred:   [{ key: 'atkFlat' }],
      acceptable: [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],               acceptable: ['atkPercent'] },
      cost3: { recommended: ['SpectroDmg', 'atkPercent'],        acceptable: [] },
      cost1: { recommended: ['atkPercent'],           acceptable: [] },
    },
    harmonySets: { recommended: [SET.GOLDEN], acceptable: [SET.CELESTIAL, SET.ETERNAL] },
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
    id: 'quyuan', name: '仇遠', element: '気動', weapon: '迅刀',
    role: 'メインアタッカー（重撃・スキルダメ）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'heavyAttackDmg' },
        { key: 'atkPercent'},
      ],
      preferred:   [{ key: 'atkFlat' }],
      acceptable: [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['AeroDmg'],               acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.SEMANTIC], acceptable: [SET.GALE, SET.GLORY_WIND] },
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
      preferred:   [{ key: 'atkFlat' }],
      acceptable: [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['FusionDmg'],             acceptable: ['atkPercent'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [ SET.FLAMING,SET.INFERNO], acceptable: [SET.MOLTEN,SET.LINGERING] },
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
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent']  },
      cost3: { recommended: ['AeroDmg'],    acceptable: ['atkPercent'] },
      cost1: { recommended: ['atkPercent'],                    acceptable: [] },
    },
    harmonySets: { recommended: [SET.GLORY_CROWN], acceptable: [SET.BOUNDLESS, SET.GLORY_WIND] },
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
      cost3: { recommended: ['ElectroDmg'],   acceptable: [] },
      cost1: { recommended: ['atkPercent'],   acceptable: [] },
    },
    harmonySets: { recommended: [SET.GLORY_CROWN], acceptable: [] },
  },

  {
    id: 'flova', name: 'フローヴァ', element: '消滅', weapon: '増幅器',
    role: 'メインアタッカー（重撃重視）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'resonanceSkillDmg' },
        { key: 'atkPercent' },
      ],
      preferred:   [
        { key: 'resonanceLibDmg' },
        { key: 'atkFlat' },
      ],
      acceptable: [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['HavocDmg'],              acceptable: ['atkPercent'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.LOST_DREAM], acceptable: [SET.MIDNIGHT, SET.HAVOC_OLD] },
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
        { key: 'resonanceLibDmg' },
      ],
      preferred:   [{ key: 'basicAttackDmg' }],
      acceptable: [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],               acceptable: ['atkPercent'] },
      cost3: { recommended: ['FusionDmg'],         acceptable: ['atkPercent'] },
      cost1: { recommended: ['atkPercent'],           acceptable: [] },
    },
    harmonySets: { recommended: [SET.FLAMING], acceptable: [SET.MOLTEN] },
  },

  {
    id: 'cartethia', name: 'カルテジア', element: '気動', weapon: '迅刀',
    role: 'メインアタッカー（風蝕効果）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'hpPercent' },
        { key: 'basicAttackDmg' },
        { key: 'resonanceeff' },
      ],
      preferred:   [],
      acceptable: [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['AeroDmg'],               acceptable: ['atkPercent'] },
      cost1: { recommended: ['hpPercent'],            acceptable: ['atkPercent'] },
    },
    harmonySets: { recommended: [ SET.GLORY_WIND], acceptable: [SET.GALE] },
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
    id: 'zanni', name: 'ザンニー', element: '回折', weapon: '手甲',
    role: 'メインアタッカー（回折ダメバフ）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'heavyAttackDmg' },
      ],
      preferred:   [{ key: 'resonanceLibDmg' }, { key: 'atkFlat' },],
      acceptable: [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['SpectroDmg'],            acceptable: ['atkPercent',] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.CELESTIAL, SET.ETERNAL], acceptable: [] },
  },

  {
    id: 'cantarella', name: 'カンタレラ', element: '消滅', weapon: '増幅器',
    role: '耐久・回復、消滅ダメバフ',
    substats: {
      recommended: [
        { key: 'energyRegen' },
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'basicAttackDmg' },
        { key: 'atkPercent' }
      ],
      preferred:   [{ key: 'atkFlat' }],
      acceptable: [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],    acceptable: ['atkPercent'] },
      cost3: { recommended: ['HavocDmg', 'atkPercent'],    acceptable: [] },
      cost1: { recommended: ['atkPercent'],                    acceptable: [] },
    },
    harmonySets: { recommended: [SET.EMPYREAN], acceptable: [SET.MIDNIGHT, SET.HAVOC_OLD] },
  },

  {
    id: 'brant', name: 'ブラント', element: '焦熱', weapon: '迅刀',
    role: '耐久・回復、共鳴スキルバフ',
    substats: {
      recommended: [
        { key: 'energyRegen' },
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'atkPercent' },
        { key: 'basicAttackDmg' },
      ],
      preferred:   [],
      acceptable: [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],    acceptable: ['atkPercent'] },
      cost3: { recommended: ['FusionDmg','Resonanceeff'],    acceptable: [ 'atkPercent'] },
      cost1: { recommended: ['atkPercent'],                    acceptable: [] },
    },
    harmonySets: { recommended: [SET.TIDEBREAK], acceptable: [SET.MOLTEN, SET.FLAMING] },
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
      preferred:   [
        { key: 'resonanceLibDmg' },
        { key: 'atkFlat' },
      ],
      acceptable: [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['SpectroDmg'],            acceptable: ['atkPercent'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.ETERNAL], acceptable: [SET.CELESTIAL,SET.LINGERING] },
  },

  {
    id: 'rococo', name: 'ロココ', element: '消滅', weapon: '手甲',
    role: 'サブアタッカー（通常攻撃バフ）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'heavyAttackDmg' },
        { key: 'atkPercent' },
      ],
      preferred:   [{ key: 'atkFlat' }],
      acceptable: [],
    },
    mainstat: {
      cost4: { recommended: ['critRate'],   acceptable: ['atkPercent', 'critDmg'] },
      cost3: { recommended: ['HavocDmg'],              acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.MIDNIGHT, SET.INFERNO], acceptable: [SET.HAVOC_OLD,SET.MOONLIT] },
  },

  {
    id: 'carlotta', name: 'カルロッタ', element: '凝縮', weapon: '拳銃',
    role: 'メインアタッカー（共鳴スキル重視）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'resonanceSkillDmg' },
        { key: 'atkPercent' },
      ],
      preferred:   [
        { key: 'energyRegen' },
        { key: 'atkFlat' },
      ],
      acceptable: [{ key: 'resonanceLibDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['GlacioDmg' ,'atkPercent' ],            acceptable: ['Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.FROSTY], acceptable: [SET.FROST] },
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
      preferred:   [{ key: 'resonanceLibDmg' } , { key: 'atkFlat' }],
      acceptable: [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['HavocDmg' , 'atkPercent'],  acceptable: [] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.MIDNIGHT, SET.HAVOC_OLD], acceptable: [] },
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
      cost4: { recommended: ['healingBonus'],    acceptable: ['critDmg'] },
      cost3: { recommended: ['Resonanceeff', 'SpectroDmg'],    acceptable: ['SpectroDmg', 'atkPercent'] },
      cost1: { recommended: ['hpPercent'],  acceptable: ['atkPercent'] },
    },
    harmonySets: { recommended: [SET.HEALER], acceptable: [SET.CELESTIAL, SET.MOONLIT] },
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
      preferred:   [ { key: 'atkFlat' } ],
      acceptable: [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['ElectroDmg'],            acceptable: ['atkPercent'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.VOID], acceptable: [SET.LINGERING] },
  },

  {
    id: 'zhezhi', name: '折枝', element: '凝縮', weapon: '増幅器',
    role: 'サブアタッカー（共鳴スキルバフ）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
      ],
      preferred:   [
        { key: 'basicAttackDmg' },
        { key: 'atkFlat' },
      ],
      acceptable: [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['atkPercent', 'GlacioDmg'],             acceptable: [] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.EMPYREAN], acceptable: [SET.FROST, SET.FROSTY] },
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
      cost3: { recommended: ['FusionDmg' , 'atkPercent'],  acceptable: ['Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.MOLTEN], acceptable: [SET.FLAMING] },
  },

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
      cost3: { recommended: ['SpectroDmg' ,'atkPercent'],  acceptable: [] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.CELESTIAL], acceptable: [SET.ETERNAL] },
  },

  {
    id: 'yinlin', name: '吟霖', element: '電導', weapon: '増幅器',
    role: 'サブアタッカー（共鳴解放バフ）',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'resonanceSkillDmg' },
        { key: 'atkPercent' },
      ],
      preferred:   [{ key: 'atkFlat' },],
      acceptable: [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['ElectroDmg','atkPercent'],            acceptable: ['Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.EMPYREAN,SET.VOID], acceptable: [SET.MOONLIT] },
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
      preferred:   [{ key: 'atkFlat' }],
      acceptable: [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['AeroDmg'],               acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.GALE, SET.GLORY_WIND], acceptable: [SET.BOUNDLESS] },
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
        { key:'basicAttackDmg' },
      ],
      preferred:   [],
      acceptable: [{ key: 'resonanceLibDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['GlacioDmg'],             acceptable: ['atkPercent'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.FROST, SET.FROSTY], acceptable: [] },
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
      preferred:   [{ key: 'resonanceSkillDmg' }],
      acceptable: [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['FusionDmg'],             acceptable: ['atkPercent', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.MOLTEN], acceptable: [SET.FLAMING] },
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
      cost3: { recommended: ['ElectroDmg'],            acceptable: ['atkPercent'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.VOID], acceptable: [] },
  },

  {
    id: 'jianxin', name: '鑑心', element: '気動', weapon: '手甲',
    role: '耐久・回復、共鳴解放バフ',
    substats: {
      recommended: [
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'critRate' },
        { key: 'critDmg' },

      ],
      preferred:   [
        { key: 'resonanceLibDmg' },
        { key: 'heavyAttackDmg' },
      ],
      acceptable: [
        { key: 'atkPercent' },
        { key: 'resonanceLibDmg' }
      ],
    },
    mainstat: {
      cost4: { recommended: ['atkPercent','critRate', 'critDmg'],    acceptable: [] },
      cost3: { recommended: ['AeroDmg', 'atkPercent', 'Resonanceeff'],    acceptable: [] },
      cost1: { recommended: ['atkPercent'],                    acceptable: [] },
    },
    harmonySets: { recommended: [SET.HEALER], acceptable: [SET.GALE, SET.GLORY_WIND] },
  },

  {
    id: 'verina', name: 'ヴェリーナ', element: '回折', weapon: '増幅器',
    role: '継続回復サポート',
    substats: {
      recommended: [
        { key: 'energyRegen' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable: [{ key: 'atkPercent' }],
    },
    mainstat: {
      cost4: { recommended: ['healingBonus', ],    acceptable: ['hpPercent'] },
      cost3: { recommended: ['Resonanceeff'],    acceptable: ['SpectroDmg', 'atkPercent'] },
      cost1: { recommended: ['atkPercent'],    acceptable: ['hpPercent'] },
    },
    harmonySets: { recommended: [SET.HEALER], acceptable: [SET.CELESTIAL, SET.MOONLIT] },
  },

  // ── 漂泊者 ────────────────────────────────────────────────────────────────

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
      preferred:   [{ key: 'atkFlat' },],
      acceptable: [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],               acceptable: ['atkPercent'] },
      cost3: { recommended: ['atkPercent', 'SpectroDmg'],        acceptable: [] },
      cost1: { recommended: ['atkPercent'],           acceptable: [] },
    },
    harmonySets: { recommended: [SET.CELESTIAL,SET.ETERNAL], acceptable: [] },
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
      preferred:   [{ key: 'atkFlat' },],
      acceptable: [{ key: 'resonanceSkillDmg' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['HavocDmg','atkPercent'],              acceptable: [] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.MIDNIGHT, SET.HAVOC_OLD], acceptable: [] },
  },

  {
    id: 'rover_aero', name: '漂泊者(気動)', element: '気動', weapon: '迅刀',
    role: '耐久・回復サポート',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'atkPercent' } ,
        { key: 'resonanceSkillDmg' },
      ],
      preferred:   [{ key: 'hpPercent' },],
      acceptable: [],
    },
    mainstat: {
      cost4: { recommended:  ['critRate', 'critDmg'],    acceptable: ['atkPercent'] },
      cost3: { recommended: [ 'AeroDmg','atkPercent'],    acceptable: [] },
      cost1: { recommended: ['atkPercent'],       acceptable: [] },
    },
    harmonySets: { recommended: [SET.BOUNDLESS], acceptable: [SET.GALE, SET.GLORY_WIND] },
  },

  // ── 4★ キャラクター ────────────────────────────────────────────────────
  //変更前のため一度コメントアウト
  // {
  //   id: 'sanhua', name: '散華', element: '凝縮', weapon: '迅刀',
  //   role: 'サブアタッカー（通常攻撃バフ）',
  //   substats: {
  //     recommended: [
  //       { key: 'critRate' },
  //       { key: 'critDmg' },
  //       { key: 'energyRegen' },
  //       { key: 'basicAttackDmg' },
  //       { key: 'atkPercent' },
  //     ],
  //     preferred:   [],
  //     acceptable: [{ key: 'resonanceSkillDmg' }],
  //   },
  //   mainstat: {
  //     cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
  //     cost3: { recommended: ['GlacioDmg'],             acceptable: ['atkPercent', 'Resonanceeff'] },
  //     cost1: { recommended: ['atkPercent'],            acceptable: [] },
  //   },
  //   harmonySets: { recommended: [SET.FROST, SET.FROSTY], acceptable: [SET.LINGERING] },
  // },

  // {
  //   id: 'mortefi_4', name: 'モルトフィー', element: '焦熱', weapon: '拳銃',
  //   role: 'サブアタッカー（重撃バフ）',
  //   substats: {
  //     recommended: [
  //       { key: 'critRate' },
  //       { key: 'critDmg' },
  //       { key: 'energyRegen' },
  //       { key: 'heavyAttackDmg' },
  //       { key: 'atkPercent' },
  //     ],
  //     preferred:   [],
  //     acceptable: [{ key: 'resonanceSkillDmg' }],
  //   },
  //   mainstat: {
  //     cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
  //     cost3: { recommended: ['FusionDmg'],             acceptable: ['atkPercent', 'Resonanceeff'] },
  //     cost1: { recommended: ['atkPercent'],            acceptable: [] },
  //   },
  //   harmonySets: { recommended: [SET.MOLTEN, SET.FLAMING], acceptable: [SET.LINGERING] },
  // },

  // {
  //   id: 'baizhi', name: '白芷', element: '凝縮', weapon: '増幅器',
  //   role: 'ヒーラー（全ダメバフ）',
  //   substats: {
  //     recommended: [
  //       { key: 'hpPercent' },
  //       { key: 'energyRegen' },
  //       { key: 'critRate' },
  //       { key: 'critDmg' },
  //     ],
  //     preferred:   [],
  //     acceptable: [{ key: 'atkPercent' }],
  //   },
  //   mainstat: {
  //     cost4: { recommended: ['healingBonus', 'hpPercent'],    acceptable: ['atkPercent'] },
  //     cost3: { recommended: ['hpPercent', 'Resonanceeff'],    acceptable: ['GlacioDmg', 'atkPercent'] },
  //     cost1: { recommended: ['hpPercent'],                    acceptable: ['atkPercent'] },
  //   },
  //   harmonySets: { recommended: [SET.HEALER], acceptable: [SET.FROST, SET.FROSTY] },
  // },

  // {
  //   id: 'danjin', name: '丹瑾', element: '消滅', weapon: '迅刀',
  //   role: 'サブアタッカー（消滅ダメバフ）',
  //   substats: {
  //     recommended: [
  //       { key: 'critRate' },
  //       { key: 'critDmg' },
  //       { key: 'energyRegen' },
  //       { key: 'atkPercent' },
  //     ],
  //     preferred:   [],
  //     acceptable: [{ key: 'resonanceSkillDmg' }, { key: 'heavyAttackDmg' }],
  //   },
  //   mainstat: {
  //     cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
  //     cost3: { recommended: ['HavocDmg'],              acceptable: ['atkPercent', 'Resonanceeff'] },
  //     cost1: { recommended: ['atkPercent'],            acceptable: [] },
  //   },
  //   harmonySets: { recommended: [SET.MIDNIGHT, SET.HAVOC_OLD], acceptable: [SET.LINGERING] },
  // },

  // {
  //   id: 'youhu', name: '釉瑚', element: '凝縮', weapon: '手甲',
  //   role: 'ヒーラー（協同攻撃バフ）',
  //   substats: {
  //     recommended: [
  //       { key: 'hpPercent' },
  //       { key: 'energyRegen' },
  //       { key: 'critRate' },
  //       { key: 'critDmg' },
  //     ],
  //     preferred:   [],
  //     acceptable: [{ key: 'atkPercent' }],
  //   },
  //   mainstat: {
  //     cost4: { recommended: ['healingBonus', 'hpPercent'],    acceptable: ['atkPercent'] },
  //     cost3: { recommended: ['hpPercent', 'Resonanceeff'],    acceptable: ['GlacioDmg', 'atkPercent'] },
  //     cost1: { recommended: ['hpPercent'],                    acceptable: ['atkPercent'] },
  //   },
  //   harmonySets: { recommended: [SET.HEALER], acceptable: [SET.FROST, SET.FROSTY] },
  // },

  // {
  //   id: 'dengdeng', name: '灯灯', element: '不明', weapon: '長刃',
  //   role: 'メインアタッカー（共鳴スキル強化）',
  //   substats: {
  //     recommended: [
  //       { key: 'critRate' },
  //       { key: 'critDmg' },
  //       { key: 'energyRegen' },
  //       { key: 'resonanceSkillDmg' },
  //       { key: 'atkPercent' },
  //     ],
  //     preferred:   [],
  //     acceptable: [{ key: 'resonanceLibDmg' }],
  //   },
  //   mainstat: {
  //     cost4: { recommended: ['critRate', 'critDmg'],          acceptable: ['atkPercent'] },
  //     cost3: { recommended: ['atkPercent', 'Resonanceeff'],   acceptable: [] },
  //     cost1: { recommended: ['atkPercent'],                   acceptable: [] },
  //   },
  //   harmonySets: { recommended: [SET.LINGERING], acceptable: [] },
  // },

  // {
  //   id: 'buling', name: '卜霊', element: '不明', weapon: '増幅器',
  //   role: 'ヒーラー（全ダメバフ）',
  //   substats: {
  //     recommended: [
  //       { key: 'hpPercent' },
  //       { key: 'energyRegen' },
  //       { key: 'critRate' },
  //       { key: 'critDmg' },
  //     ],
  //     preferred:   [],
  //     acceptable: [{ key: 'atkPercent' }],
  //   },
  //   mainstat: {
  //     cost4: { recommended: ['healingBonus', 'hpPercent'],    acceptable: ['atkPercent'] },
  //     cost3: { recommended: ['hpPercent', 'Resonanceeff'],    acceptable: ['atkPercent'] },
  //     cost1: { recommended: ['hpPercent'],                    acceptable: ['atkPercent'] },
  //   },
  //   harmonySets: { recommended: [SET.HEALER], acceptable: [SET.LINGERING] },
  // },

  // {
  //   id: 'yuanwu_4', name: '淵武', element: '電導', weapon: '手甲',
  //   role: 'サポート（協同攻撃・共振削り）',
  //   substats: {
  //     recommended: [
  //       { key: 'critRate' },
  //       { key: 'critDmg' },
  //       { key: 'energyRegen' },
  //       { key: 'atkPercent' },
  //     ],
  //     preferred:   [],
  //     acceptable: [{ key: 'hpPercent' }],
  //   },
  //   mainstat: {
  //     cost4: { recommended: ['critRate', 'critDmg'],               acceptable: ['atkPercent', 'hpPercent'] },
  //     cost3: { recommended: ['Resonanceeff', 'ElectroDmg'],        acceptable: ['atkPercent', 'hpPercent'] },
  //     cost1: { recommended: ['atkPercent', 'hpPercent'],           acceptable: [] },
  //   },
  //   harmonySets: { recommended: [SET.VOID], acceptable: [SET.LINGERING] },
  // },

  // {
  //   id: 'taoqi', name: '桃祈', element: '消滅', weapon: '長刃',
  //   role: 'ヒーラー・スキルバフ',
  //   substats: {
  //     recommended: [
  //       { key: 'hpPercent' },
  //       { key: 'energyRegen' },
  //       { key: 'critRate' },
  //       { key: 'critDmg' },
  //     ],
  //     preferred:   [],
  //     acceptable: [{ key: 'atkPercent' }],
  //   },
  //   mainstat: {
  //     cost4: { recommended: ['healingBonus', 'hpPercent'],    acceptable: ['atkPercent'] },
  //     cost3: { recommended: ['hpPercent', 'Resonanceeff'],    acceptable: ['HavocDmg', 'atkPercent'] },
  //     cost1: { recommended: ['hpPercent'],                    acceptable: ['atkPercent'] },
  //   },
  //   harmonySets: { recommended: [SET.HEALER], acceptable: [SET.MIDNIGHT, SET.HAVOC_OLD] },
  // },

  // {
  //   id: 'aalto', name: 'アールト', element: '気動', weapon: '拳銃',
  //   role: 'サポート（気動ダメバフ）',
  //   substats: {
  //     recommended: [
  //       { key: 'energyRegen' },
  //       { key: 'critRate' },
  //       { key: 'critDmg' },
  //       { key: 'atkPercent' },
  //     ],
  //     preferred:   [],
  //     acceptable: [{ key: 'hpPercent' }],
  //   },
  //   mainstat: {
  //     cost4: { recommended: ['critRate', 'critDmg'],               acceptable: ['atkPercent', 'hpPercent'] },
  //     cost3: { recommended: ['Resonanceeff', 'AeroDmg'],           acceptable: ['atkPercent', 'hpPercent'] },
  //     cost1: { recommended: ['atkPercent', 'hpPercent'],           acceptable: [] },
  //   },
  //   harmonySets: { recommended: [SET.GALE, SET.GLORY_WIND], acceptable: [SET.LINGERING] },
  // },

  // {
  //   id: 'yangyang', name: '秧秧', element: '気動', weapon: '迅刀',
  //   role: 'サポート（エネルギー回復特化）',
  //   substats: {
  //     recommended: [
  //       { key: 'energyRegen' },
  //       { key: 'critRate' },
  //       { key: 'critDmg' },
  //       { key: 'hpPercent' },
  //     ],
  //     preferred:   [],
  //     acceptable: [{ key: 'atkPercent' }],
  //   },
  //   mainstat: {
  //     cost4: { recommended: ['hpPercent', 'healingBonus'],         acceptable: ['atkPercent'] },
  //     cost3: { recommended: ['Resonanceeff', 'hpPercent'],         acceptable: ['AeroDmg', 'atkPercent'] },
  //     cost1: { recommended: ['hpPercent'],                         acceptable: ['atkPercent'] },
  //   },
  //   harmonySets: { recommended: [SET.GALE, SET.GLORY_WIND], acceptable: [SET.HEALER] },
  // },

  // {
  //   id: 'chixia', name: '熾霞', element: '焦熱', weapon: '拳銃',
  //   role: '焦熱メインアタッカー',
  //   substats: {
  //     recommended: [
  //       { key: 'critRate' },
  //       { key: 'critDmg' },
  //       { key: 'energyRegen' },
  //       { key: 'atkPercent' },
  //     ],
  //     preferred:   [],
  //     acceptable: [{ key: 'basicAttackDmg' }, { key: 'resonanceLibDmg' }],
  //   },
  //   mainstat: {
  //     cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
  //     cost3: { recommended: ['FusionDmg'],             acceptable: ['atkPercent', 'Resonanceeff'] },
  //     cost1: { recommended: ['atkPercent'],            acceptable: [] },
  //   },
  //   harmonySets: { recommended: [SET.MOLTEN, SET.FLAMING], acceptable: [SET.LINGERING] },
  // },
];

// ── ルックアップ ────────────────────────────────────────────────────────────

export const CHARACTER_MAP: Record<string, CharacterBuild> = Object.fromEntries(
  CHARACTERS.map((c) => [c.id, c])
);

export const CHARACTER_LIST = CHARACTERS.map(({ id, name, element, role }) => ({
  id, name, element, role,
}));
