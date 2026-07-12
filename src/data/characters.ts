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
  NIGHTMARE_SPECTER: HS.NIGHTMARE_SPECTER,
  SONG:        HS.SONG_OF_FEATHERED_TRACE,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
//  キャラクターデータ
//  mainstat は全キャラ個別定義
//  ・cost3 推奨: 属性判明キャラは属性ダメキー、不明キャラはスルー（atkPercent/Resonanceeff）
//  ・Resonanceeff = COST3 メインステの共鳴効率キー（substats の energyRegen とは別）
//
//  ── v2: 運用バリアント方式（連続重み採点）を有効化する場合 ─────────────────
//  下記4フィールドを追加すると、そのキャラは自動的にダメージ式ベースの
//  連続重み採点（scorer.ts の scoreWithVariant）に切り替わる。未設定のキャラは
//  従来どおり substats.recommended/preferred/acceptable のカテゴリ採点を使う。
//
//    weaponClass:   '迅刀' | '長刃' | '拳銃' | '手甲' | '増幅器'（既存 weapon と同じ値）
//    scalingStat:   'atk' | 'hp' | 'def'（ダメージ/回復のスケール元ステータス）
//    baseStats90:   { atk?, hp?, def? }（Lv90 素ステータス。scalingStat の値は必須）
//    motifWeaponId: src/data/weapons.ts の MOTIF_WEAPONS のキー（通常 id と同じ）
//    variants:      RoleVariant[]（メイン/サブ/サポート等の運用ごとに
//                   harmonySets・mainstat・damageProfile を定義。1個でも可）
//
//  damageProfile.typeShares は「このキャラのダメージが基本/重撃/スキル/解放に
//  何割配分されるか」の概算（合計≈1.0）。baselineCritRate/critDmg はその運用で
//  実際に目指すクリ率・クリダメ目標値（重み導出の基準点になる）。
//
//  ── ハーモニーセット→運用ロールのマッピング規約（データ入力ルール） ───────
//  scorer.ts の pickVariant は、音骸の装着セットを各バリアントの
//  harmonySets.recommended → acceptable の順で照合し、最初に一致した
//  バリアントの運用として採点する（どれにも一致しなければ variants[0]）。
//  したがって variants を定義するときは必ず:
//    1. そのキャラが実際に使う全セットを、対応する運用の recommended に置く
//       （例: 属性セット→メイン運用、軽雲出月/ER系セット→サブ運用）
//    2. 同一キャラ内で recommended セットがバリアント間で重複しないようにする
//       （重複すると先に定義したバリアントが常に勝つ）
//    3. 最も代表的な運用を variants[0] に置く（未知セット時のデフォルトになる）
// ═══════════════════════════════════════════════════════════════════════════

export const CHARACTERS: CharacterBuild[] = [

  // ── 5★ キャラクター（実装降順）────────────────────────────────────────

  {
    id: 'yangyang_xuanling', name: '秧秧・玄翎', nameEn: 'Yangyang (Xuanling)', element: '消滅', weapon: '迅刀',
    role: 'メインアタッカー（重撃重視）',
    roleTemplate: 'DPS',
    scalingStat: 'atk',
    baseStats90: { atk: 425, hp: 11025, def: 1148 },
    motifWeaponId: 'yangyang_xuanling',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'heavyAttackDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],                      acceptable: ['atkPercent'] },
      cost3: { recommended: ['HavocDmg', 'atkPercent', 'Resonanceeff'],   acceptable: [] },
      cost1: { recommended: ['atkPercent'],                               acceptable: [] },
    },
    harmonySets: { recommended: [SET.SONG, SET.HAVOC_OLD], acceptable: [] },
  },

  {
    id: 'lucilare', name: 'ルシラー', nameEn: 'Lucilare', element: '凝縮', weapon: '迅刀',
    role: 'サブアタッカー',
    roleTemplate: 'SubDPS',
    scalingStat: 'atk',
    baseStats90: { atk: 375, hp: 12237, def: 1197 },
    motifWeaponId: 'lucilare',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
      ],
      preferred:   [
        { key: 'atkPercent' },
        { key: 'basicAttackDmg' },
      ],
      acceptable:  [
        { key: 'atkFlat' },
      ],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],       acceptable: ['atkPercent'] },
      cost3: { recommended: ['GlacioDmg', 'atkPercent'],  acceptable: [] },
      cost1: { recommended: ['atkPercent'],                acceptable: [] },
    },
    harmonySets: { recommended: [SET.SNOWY, SET.MOONLIT, SET.MONTAGE, SET.LOST_DREAM], acceptable: [] },
  },

  {
    id: 'lucy', name: 'ルーシー', nameEn: 'Lucy', element: '回折', weapon: '長刃',
    role: 'メインアタッカー',
    roleTemplate: 'DPS',
    scalingStat: 'atk',
    baseStats90: { atk: 425, hp: 11025, def: 1148 },
    motifWeaponId: 'lucy',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'heavyAttackDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],        acceptable: ['atkPercent'] },
      cost3: { recommended: ['SpectroDmg', 'atkPercent'],   acceptable: [] },
      cost1: { recommended: ['atkPercent'],                 acceptable: [] },
    },
    harmonySets: { recommended: [SET.NIGHTMARE_SPECTER], acceptable: [SET.CELESTIAL, SET.REFLECT, SET.LINGERING, SET.MONTAGE] },
  },

  {
    id: 'rebecca', name: 'レベッカ', nameEn: 'Rebecca', element: '電導', weapon: '拳銃',
    role: 'サブアタッカー',
    roleTemplate: 'SubDPS',
    scalingStat: 'atk',
    baseStats90: { atk: 400, hp: 11600, def: 1173 },
    motifWeaponId: 'rebecca',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'basicAttackDmg' },
        { key: 'atkFlat' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],          acceptable: ['atkPercent'] },
      cost3: { recommended: ['ElectroDmg', 'atkPercent'],     acceptable: [] },
      cost1: { recommended: ['atkPercent'],                   acceptable: [] },
    },
    harmonySets: { recommended: [SET.NIGHTMARE_SPECTER], acceptable: [SET.VOID, SET.MONTAGE, SET.LINGERING, SET.MOONLIT] },
  },

  {
    id: 'denia', name: 'ダーニャ', nameEn: 'Denia', element: '焦熱', weapon: '長刃',
    role: 'メインアタッカー',
    roleTemplate: 'DPS',
    scalingStat: 'atk',
    baseStats90: { atk: 425, hp: 11025, def: 1148 },
    motifWeaponId: 'denia',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'resonanceLibDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critDmg', 'critRate'],      acceptable: ['atkPercent'] },
      cost3: { recommended: ['FusionDmg', 'atkPercent'],  acceptable: [] },
      cost1: { recommended: ['atkPercent'],               acceptable: [] },
    },
    harmonySets: { recommended: [SET.PATINA, SET.MONTAGE, SET.REFLECT, SET.MOONLIT], acceptable: [] },
  },

  {
    id: 'hiyuki', name: '緋雪', nameEn: 'Hiyuki', element: '凝縮', weapon: '迅刀',
    role: 'メイン/サブ火力',
    roleTemplate: 'DPS',
    scalingStat: 'atk',
    baseStats90: { atk: 462, hp: 10300, def: 1112 },
    motifWeaponId: 'hiyuki',
    // v2パイロット: メイン/サブ両運用でセットが変わる代表例（既存role記述どおり）
    variants: [
      {
        id: 'main',
        role: 'main',
        label: 'メインアタッカー運用',
        harmonySets: { recommended: [SET.SNOWY], acceptable: [SET.FROST, SET.FROSTY] },
        mainstat: {
          cost4: { recommended: ['critDmg'],               acceptable: ['critRate', 'atkPercent'] },
          cost3: { recommended: ['GlacioDmg', 'atkPercent'], acceptable: [] },
          cost1: { recommended: ['atkPercent'],             acceptable: [] },
        },
        erRequirement: 1.20,
        damageProfile: {
          typeShares: { basic: 0.30, heavy: 0.15, skill: 0.15, lib: 0.40 },
          selfAtkBuffPercent: 0.15,
          baselineCritRate: 0.70,
          baselineCritDmg: 2.30,
        },
      },
      {
        id: 'sub',
        role: 'sub',
        label: 'サブアタッカー（凸待ち撃ち）運用',
        harmonySets: { recommended: [SET.FROST, SET.FROSTY], acceptable: [SET.SNOWY] },
        mainstat: {
          cost4: { recommended: ['critDmg'],               acceptable: ['critRate', 'atkPercent'] },
          cost3: { recommended: ['GlacioDmg', 'atkPercent'], acceptable: [] },
          cost1: { recommended: ['atkPercent'],             acceptable: [] },
        },
        erRequirement: 1.40,
        damageProfile: {
          typeShares: { basic: 0.10, heavy: 0.10, skill: 0.10, lib: 0.70 },
          selfAtkBuffPercent: 0.15,
          baselineCritRate: 0.70,
          baselineCritDmg: 2.30,
        },
      },
    ],
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'resonanceLibDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critDmg'],   acceptable: ['critRate', 'atkPercent'] },
      cost3: { recommended: ['GlacioDmg', 'atkPercent'],             acceptable: [] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.SNOWY], acceptable: [SET.FROST,SET.FROSTY] },
  },

  {
    id: 'sigrid', name: 'シグリカ', nameEn: 'Sigrika', element: '気動', weapon: '手甲',
    role: 'メインアタッカー（牽引）',
    roleTemplate: 'DPS',
    scalingStat: 'atk',
    baseStats90: { atk: 437, hp: 10775, def: 1136 },
    motifWeaponId: 'sigrid',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'resonanceLibDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['atkPercent'],               acceptable: ['AeroDmg', 'Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.GALE, SET.SEMANTIC], acceptable: [SET.GLORY_WIND] },
  },

  {
    id: 'ryuk', name: 'リューク・ヘルセン', nameEn: 'Luuk Herssen', element: '回折', weapon: '手甲',
    role: 'メインアタッカー（回折ダメージ重視）',
    roleTemplate: 'DPS',
    scalingStat: 'atk',
    baseStats90: { atk: 462, hp: 10300, def: 1112 },
    motifWeaponId: 'ryuk',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'basicAttackDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['atkPercent','SpectroDmg'],            acceptable: [] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [], acceptable: [SET.CELESTIAL, SET.ETERNAL] },
  },

  {
    id: 'aimes', name: 'エイメス', nameEn: 'Aemeath', element: '焦熱', weapon: '迅刀',
    role: 'メインアタッカー（全ダメバフ）',
    roleTemplate: 'DPS',
    scalingStat: 'atk',
    baseStats90: { atk: 425, hp: 11025, def: 1148 },
    motifWeaponId: 'aimes',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'resonanceLibDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['SpectroDmg' , 'atkPercent'],   acceptable: [] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.ASTRO], acceptable: [] },
  },

  {
    id: 'mortefi', name: 'モーニエ', nameEn: 'Mornye', element: '焦熱', weapon: '長刃',
    role: '耐久・回復サポーター',
    scalingStat: 'def',
    baseStats90: { atk: 287, hp: 15375, def: 1356 },
    motifWeaponId: 'mortefi',
    substats: {
      recommended: [
        { key: 'energyRegen' },
        { key: 'defPercent' },
        { key: 'defFlat' },
        { key: 'resonanceLibDmg' },
        { key: 'critDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['healingBonus', 'defPercent'],    acceptable: [] },
      cost3: { recommended: ['Resonanceeff'],    acceptable: ['GlacioDmg', 'defPercent'] },
      cost1: { recommended: ['defPercent'],                    acceptable: [] },
    },
    harmonySets: { recommended: [SET.STARLIGHT], acceptable: [] },
  },

  {
    id: 'linne', name: 'リンネー', nameEn: 'Lynae', element: '回折', weapon: '拳銃',
    role: 'サポート（協奏効率・全ダメバフ）',
    roleTemplate: 'SubDPS',
    scalingStat: 'atk',
    baseStats90: { atk: 375, hp: 12237, def: 1197 },
    motifWeaponId: 'linne',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'basicAttackDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],               acceptable: ['atkPercent'] },
      cost3: { recommended: ['SpectroDmg', 'atkPercent'],        acceptable: [] },
      cost1: { recommended: ['atkPercent'],           acceptable: [] },
    },
    harmonySets: { recommended: [SET.GOLDEN], acceptable: [SET.CELESTIAL, SET.ETERNAL] },
  },

  {
    id: 'chixia_sanhua', name: '千咲', nameEn: 'Chisa', element: '消滅', weapon: '長刃',
    role: '耐久・回復、防御力デバフ',
    roleTemplate: 'SubDPS',
    scalingStat: 'atk',
    baseStats90: { atk: 437, hp: 10775, def: 1136 },
    motifWeaponId: 'chixia_sanhua',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'resonanceLibDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],    acceptable: ['atkPercent'] },
      cost3: { recommended: ['HavocDmg', 'atkPercent'],    acceptable: [] },
      cost1: { recommended: ['atkPercent'],                    acceptable: [] },
    },
    harmonySets: { recommended: [SET.THREAD_FATE], acceptable: [] },
  },

  {
    id: 'quyuan', name: '仇遠', nameEn: 'Qiuyuan', element: '気動', weapon: '迅刀',
    role: 'メインアタッカー（重撃・スキルダメ）',
    roleTemplate: 'SubDPS',
    scalingStat: 'atk',
    baseStats90: { atk: 375, hp: 12237, def: 1197 },
    motifWeaponId: 'quyuan',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'heavyAttackDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['AeroDmg', 'atkPercent'],               acceptable: ['Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.SEMANTIC], acceptable: [SET.GALE, SET.GLORY_WIND] },
  },

  {
    id: 'galbrena', name: 'ガルブレーナ', nameEn: 'Galbrena', element: '焦熱', weapon: '拳銃',
    role: 'メインアタッカー（重撃重視）',
    roleTemplate: 'DPS',
    scalingStat: 'atk',
    baseStats90: { atk: 462, hp: 10300, def: 1112 },
    motifWeaponId: 'galbrena',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'heavyAttackDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['FusionDmg', 'atkPercent'],             acceptable: [] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [ SET.FLAMING,SET.INFERNO], acceptable: [SET.MOLTEN,SET.LINGERING] },
  },

  {
    id: 'yuanwu', name: 'ユーノ', nameEn: 'Iuno', element: '気動', weapon: '手甲',
    role: '耐久・回復サポート（重撃バフ）',
    roleTemplate: 'SubDPS',
    scalingStat: 'atk',
    baseStats90: { atk: 450, hp: 10525, def: 1124 },
    motifWeaponId: 'yuanwu',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'resonanceLibDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent']  },
      cost3: { recommended: ['AeroDmg', 'atkPercent'],    acceptable: [] },
      cost1: { recommended: ['atkPercent'],                    acceptable: [] },
    },
    harmonySets: { recommended: [SET.GLORY_CROWN], acceptable: [SET.BOUNDLESS, SET.GLORY_WIND] },
  },

  {
    id: 'augusta', name: 'オーガスタ', nameEn: 'Augusta', element: '電導', weapon: '長刃',
    role: 'メインアタッカー（全ダメバフ）',
    roleTemplate: 'DPS',
    scalingStat: 'atk',
    baseStats90: { atk: 462, hp: 10300, def: 1112 },
    motifWeaponId: 'augusta',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'heavyAttackDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],          acceptable: ['atkPercent'] },
      cost3: { recommended: ['ElectroDmg'],   acceptable: [] },
      cost1: { recommended: ['atkPercent'],   acceptable: [] },
    },
    harmonySets: { recommended: [SET.GLORY_CROWN], acceptable: [] },
  },

  {
    id: 'flova', name: 'フローヴァ', nameEn: 'Phrolova', element: '消滅', weapon: '増幅器',
    role: 'メインアタッカー（重撃重視）',
    roleTemplate: 'DPS',
    scalingStat: 'atk',
    baseStats90: { atk: 437, hp: 10775, def: 1136 },
    motifWeaponId: 'flova',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'resonanceSkillDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['HavocDmg', 'atkPercent'],              acceptable: [] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.LOST_DREAM], acceptable: [SET.MIDNIGHT, SET.HAVOC_OLD] },
  },

  {
    id: 'lupa', name: 'ルパ', nameEn: 'Lupa', element: '焦熱', weapon: '長刃',
    role: 'サポート（協奏効率・通常攻撃バフ）',
    roleTemplate: 'SubDPS',
    scalingStat: 'atk',
    baseStats90: { atk: 387, hp: 11912, def: 1185 },
    motifWeaponId: 'lupa',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'resonanceLibDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],               acceptable: ['atkPercent'] },
      cost3: { recommended: ['FusionDmg', 'atkPercent'],         acceptable: [] },
      cost1: { recommended: ['atkPercent'],           acceptable: [] },
    },
    harmonySets: { recommended: [SET.FLAMING], acceptable: [SET.MOLTEN] },
  },

  {
    id: 'cartethia', name: 'カルテジア', nameEn: 'Cartethyia', element: '気動', weapon: '迅刀',
    role: 'メインアタッカー（風蝕効果）',
    scalingStat: 'hp',
    baseStats90: { atk: 312, hp: 14800, def: 611 },
    motifWeaponId: 'cartethia',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'hpPercent' },
        { key: 'basicAttackDmg' },
      ],
      preferred:   [{ key: 'atkPercent' }],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['AeroDmg', 'atkPercent'],               acceptable: [] },
      cost1: { recommended: ['hpPercent'],            acceptable: ['atkPercent'] },
    },
    harmonySets: { recommended: [ SET.GLORY_WIND], acceptable: [SET.GALE] },
  },

  {
    id: 'shaconne', name: 'シャコンヌ', nameEn: 'Ciaccona', element: '気動', weapon: '拳銃',
    role: '牽引・風蝕バフサポート',
    roleTemplate: 'SubDPS',
    scalingStat: 'atk',
    baseStats90: { atk: 375, hp: 12237, def: 1197 },
    motifWeaponId: 'shaconne',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'resonanceLibDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],               acceptable: ['atkPercent', 'hpPercent'] },
      cost3: { recommended: ['Resonanceeff', 'AeroDmg', 'atkPercent'],           acceptable: ['hpPercent'] },
      cost1: { recommended: ['atkPercent', 'hpPercent'],           acceptable: [] },
    },
    harmonySets: { recommended: [SET.GALE, SET.GLORY_WIND], acceptable: [SET.LINGERING] },
  },

  {
    id: 'zanni', name: 'ザンニー', nameEn: 'Zani', element: '回折', weapon: '手甲',
    role: 'メインアタッカー（回折ダメバフ）',
    roleTemplate: 'DPS',
    scalingStat: 'atk',
    baseStats90: { atk: 437, hp: 10775, def: 1136 },
    motifWeaponId: 'zanni',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'heavyAttackDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['SpectroDmg', 'atkPercent'],            acceptable: [] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.CELESTIAL, SET.ETERNAL], acceptable: [] },
  },

  {
    id: 'cantarella', name: 'カンタレラ', nameEn: 'Cantarella', element: '消滅', weapon: '増幅器',
    role: '耐久・回復、消滅ダメバフ',
    roleTemplate: 'DPS',
    scalingStat: 'atk',
    baseStats90: { atk: 400, hp: 11600, def: 1099 },
    motifWeaponId: 'cantarella',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'basicAttackDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],    acceptable: ['atkPercent'] },
      cost3: { recommended: ['HavocDmg', 'atkPercent'],    acceptable: [] },
      cost1: { recommended: ['atkPercent'],                    acceptable: [] },
    },
    harmonySets: { recommended: [SET.EMPYREAN], acceptable: [SET.MIDNIGHT, SET.HAVOC_OLD] },
  },

  {
    id: 'brant', name: 'ブラント', nameEn: 'Brant', element: '焦熱', weapon: '迅刀',
    role: '耐久・回復、共鳴スキルバフ',
    roleTemplate: 'SubDPS',
    scalingStat: 'atk',
    baseStats90: { atk: 375, hp: 11675, def: 1307 },
    motifWeaponId: 'brant',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'basicAttackDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],    acceptable: ['atkPercent'] },
      cost3: { recommended: ['FusionDmg', 'Resonanceeff', 'atkPercent'],    acceptable: [] },
      cost1: { recommended: ['atkPercent'],                    acceptable: [] },
    },
    harmonySets: { recommended: [SET.TIDEBREAK], acceptable: [SET.MOLTEN, SET.FLAMING] },
  },

  {
    id: 'phoebe', name: 'フィービー', nameEn: 'Phoebe', element: '回折', weapon: '増幅器',
    role: 'メインアタッカー（協奏効率）',
    roleTemplate: 'DPS',
    scalingStat: 'atk',
    baseStats90: { atk: 412, hp: 10825, def: 1258 },
    motifWeaponId: 'phoebe',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'resonanceLibDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['SpectroDmg', 'atkPercent'],            acceptable: [] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.ETERNAL], acceptable: [SET.CELESTIAL,SET.LINGERING] },
  },

  {
    id: 'rococo', name: 'ロココ', nameEn: 'Roccia', element: '消滅', weapon: '手甲',
    role: 'サブアタッカー（通常攻撃バフ）',
    roleTemplate: 'SubDPS',
    scalingStat: 'atk',
    baseStats90: { atk: 375, hp: 12250, def: 1197 },
    motifWeaponId: 'rococo',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'heavyAttackDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate'],   acceptable: ['atkPercent', 'critDmg'] },
      cost3: { recommended: ['HavocDmg', 'atkPercent'],              acceptable: ['Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.MIDNIGHT, SET.INFERNO], acceptable: [SET.HAVOC_OLD,SET.MOONLIT] },
  },

  {
    id: 'carlotta', name: 'カルロッタ', nameEn: 'Carlotta', element: '凝縮', weapon: '拳銃',
    role: 'メインアタッカー（共鳴スキル重視）',
    roleTemplate: 'DPS',
    scalingStat: 'atk',
    baseStats90: { atk: 462, hp: 12450, def: 1197 },
    motifWeaponId: 'carlotta',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'resonanceSkillDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['GlacioDmg', 'atkPercent'],            acceptable: ['Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.FROSTY], acceptable: [SET.FROST] },
  },

  {
    id: 'camellya', name: 'ツバキ', nameEn: 'Camellya', element: '消滅', weapon: '迅刀',
    role: 'メインアタッカー（通常攻撃重視）',
    roleTemplate: 'DPS',
    scalingStat: 'atk',
    baseStats90: { atk: 450, hp: 10325, def: 1161 },
    motifWeaponId: 'camellya',
    // v2パイロット: 通常攻撃重視のメイン単一運用
    variants: [
      {
        id: 'main',
        role: 'main',
        label: 'メインアタッカー運用',
        harmonySets: { recommended: [SET.MIDNIGHT, SET.HAVOC_OLD], acceptable: [] },
        mainstat: {
          cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
          cost3: { recommended: ['HavocDmg', 'atkPercent'], acceptable: [] },
          cost1: { recommended: ['atkPercent'],            acceptable: [] },
        },
        erRequirement: 1.15,
        damageProfile: {
          typeShares: { basic: 0.65, heavy: 0.05, skill: 0.10, lib: 0.20 },
          selfAtkBuffPercent: 0.20,
          baselineCritRate: 0.70,
          baselineCritDmg: 2.30,
        },
      },
    ],
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'basicAttackDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['HavocDmg' , 'atkPercent'],  acceptable: [] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.MIDNIGHT, SET.HAVOC_OLD], acceptable: [] },
  },

  {
    id: 'shorekeeper', name: 'ショアキーパー', nameEn: 'Shorekeeper', element: '回折', weapon: '増幅器',
    role: '耐久・回復サポート',
    scalingStat: 'hp',
    baseStats90: { atk: 287, hp: 16712, def: 1099 },
    motifWeaponId: 'shorekeeper',
    substats: {
      recommended: [
        { key: 'energyRegen' },
        { key: 'critDmg' },
        { key: 'hpPercent' },
        { key: 'resonanceLibDmg' },
      ],
      preferred:   [{ key: 'atkPercent' }],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['healingBonus'],    acceptable: ['critDmg'] },
      cost3: { recommended: ['Resonanceeff', 'SpectroDmg', 'atkPercent'],    acceptable: ['SpectroDmg'] },
      cost1: { recommended: ['hpPercent'],  acceptable: ['atkPercent'] },
    },
    harmonySets: { recommended: [SET.HEALER], acceptable: [SET.CELESTIAL, SET.MOONLIT] },
  },

  {
    id: 'xiangli_yao', name: '相里要', nameEn: 'Xiangli Yao', element: '電導', weapon: '手甲',
    role: 'メインアタッカー（共鳴解放重視）',
    roleTemplate: 'DPS',
    scalingStat: 'atk',
    baseStats90: { atk: 425, hp: 10625, def: 1222 },
    motifWeaponId: 'xiangli_yao',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'resonanceLibDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['ElectroDmg', 'atkPercent'],            acceptable: [] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.VOID], acceptable: [SET.LINGERING] },
  },

  {
    id: 'zhezhi', name: '折枝', nameEn: 'Zhezhi', element: '凝縮', weapon: '増幅器',
    role: 'サブアタッカー（共鳴スキルバフ）',
    roleTemplate: 'SubDPS',
    scalingStat: 'atk',
    baseStats90: { atk: 375, hp: 12250, def: 1197 },
    motifWeaponId: 'zhezhi',
    // v2パイロット: オフフィールドバフ主体のサブ単一運用
    variants: [
      {
        id: 'sub',
        role: 'sub',
        label: 'サブアタッカー（オフフィールドバフ）運用',
        harmonySets: { recommended: [SET.EMPYREAN], acceptable: [SET.FROST, SET.FROSTY] },
        mainstat: {
          cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
          cost3: { recommended: ['atkPercent', 'GlacioDmg'], acceptable: [] },
          cost1: { recommended: ['atkPercent'],            acceptable: [] },
        },
        erRequirement: 1.40,
        damageProfile: {
          typeShares: { basic: 0.55, heavy: 0.05, skill: 0.20, lib: 0.20 },
          selfAtkBuffPercent: 0.10,
          baselineCritRate: 0.70,
          baselineCritDmg: 2.30,
        },
      },
    ],
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'basicAttackDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['atkPercent', 'GlacioDmg'],             acceptable: [] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.EMPYREAN], acceptable: [SET.FROST, SET.FROSTY] },
  },

  {
    id: 'changli', name: '長離', nameEn: 'Changli', element: '焦熱', weapon: '迅刀',
    role: 'メインアタッカー（焦熱・共鳴スキル）',
    roleTemplate: 'DPS',
    scalingStat: 'atk',
    baseStats90: { atk: 462, hp: 10387, def: 1099 },
    motifWeaponId: 'changli',
    // v2パイロット: 共鳴スキル重視のメイン単一運用
    variants: [
      {
        id: 'main',
        role: 'main',
        label: 'メインアタッカー運用',
        harmonySets: { recommended: [SET.MOLTEN], acceptable: [SET.FLAMING] },
        mainstat: {
          cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
          cost3: { recommended: ['FusionDmg', 'atkPercent'], acceptable: ['Resonanceeff'] },
          cost1: { recommended: ['atkPercent'],            acceptable: [] },
        },
        erRequirement: 1.15,
        damageProfile: {
          typeShares: { basic: 0.10, heavy: 0.05, skill: 0.50, lib: 0.35 },
          selfAtkBuffPercent: 0.15,
          baselineCritRate: 0.70,
          baselineCritDmg: 2.30,
        },
      },
    ],
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'resonanceSkillDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['FusionDmg' , 'atkPercent'],  acceptable: ['Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.MOLTEN], acceptable: [SET.FLAMING] },
  },

  {
    id: 'jinhsi', name: '今汐', nameEn: 'Jinhsi', element: '回折', weapon: '長刃',
    role: 'メインアタッカー（共鳴スキル重視）',
    roleTemplate: 'DPS',
    scalingStat: 'atk',
    baseStats90: { atk: 412, hp: 10825, def: 1258 },
    motifWeaponId: 'jinhsi',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'resonanceSkillDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['SpectroDmg' ,'atkPercent'],  acceptable: [] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.CELESTIAL], acceptable: [SET.ETERNAL] },
  },

  {
    id: 'yinlin', name: '吟霖', nameEn: 'Yinlin', element: '電導', weapon: '増幅器',
    role: 'サブアタッカー（共鳴解放バフ）',
    roleTemplate: 'SubDPS',
    scalingStat: 'atk',
    baseStats90: { atk: 400, hp: 11000, def: 1283 },
    motifWeaponId: 'yinlin',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'resonanceSkillDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['ElectroDmg','atkPercent'],            acceptable: ['Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.EMPYREAN,SET.VOID], acceptable: [SET.MOONLIT] },
  },

  {
    id: 'jiyan', name: '忌炎', nameEn: 'Jiyan', element: '気動', weapon: '長刃',
    role: 'メインアタッカー（重撃重視）',
    roleTemplate: 'DPS',
    scalingStat: 'atk',
    baseStats90: { atk: 437, hp: 10487, def: 1185 },
    motifWeaponId: 'jiyan',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'heavyAttackDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['AeroDmg', 'atkPercent'],               acceptable: ['Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.GALE, SET.GLORY_WIND], acceptable: [SET.BOUNDLESS] },
  },

  {
    id: 'lingyang', name: '凌陽', nameEn: 'Lingyang', element: '凝縮', weapon: '手甲',
    role: 'メインアタッカー（凝縮ダメージ重視）',
    roleTemplate: 'DPS',
    scalingStat: 'atk',
    baseStats90: { atk: 437, hp: 10387, def: 1209 },
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'resonanceLibDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['GlacioDmg', 'atkPercent'],             acceptable: [] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.FROST, SET.FROSTY], acceptable: [] },
  },

  {
    id: 'encore', name: 'アンコ', nameEn: 'Encore', element: '焦熱', weapon: '増幅器',
    role: 'メインアタッカー（通常攻撃重視）',
    roleTemplate: 'DPS',
    scalingStat: 'atk',
    baseStats90: { atk: 425, hp: 10512, def: 1246 },
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'basicAttackDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['FusionDmg', 'atkPercent'],             acceptable: ['Resonanceeff'] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.MOLTEN], acceptable: [SET.FLAMING] },
  },

  {
    id: 'calcharo', name: 'カカロ', nameEn: 'Calcharo', element: '電導', weapon: '長刃',
    role: 'メインアタッカー（共鳴解放重視）',
    roleTemplate: 'DPS',
    scalingStat: 'atk',
    baseStats90: { atk: 437, hp: 10500, def: 1185 },
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'resonanceLibDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['ElectroDmg', 'atkPercent'],            acceptable: [] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.VOID], acceptable: [] },
  },

  {
    id: 'jianxin', name: '鑑心', nameEn: 'Jianxin', element: '気動', weapon: '手甲',
    role: '耐久・回復、共鳴解放バフ',
    roleTemplate: 'SubDPS',
    scalingStat: 'atk',
    baseStats90: { atk: 337, hp: 14112, def: 1124 },
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'heavyAttackDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['atkPercent','critRate', 'critDmg'],    acceptable: [] },
      cost3: { recommended: ['AeroDmg', 'atkPercent', 'Resonanceeff'],    acceptable: [] },
      cost1: { recommended: ['atkPercent'],                    acceptable: [] },
    },
    harmonySets: { recommended: [SET.HEALER], acceptable: [SET.GALE, SET.GLORY_WIND] },
  },

  {
    id: 'verina', name: 'ヴェリーナ', nameEn: 'Verina', element: '回折', weapon: '増幅器',
    role: '継続回復サポート',
    scalingStat: 'atk',
    baseStats90: { atk: 337, hp: 14237, def: 1099 },
    substats: {
      recommended: [
        { key: 'energyRegen' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable:  [],
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
    id: 'rover_spectro', name: '漂泊者(回折)', nameEn: 'Rover (Spectro)', element: '回折', weapon: '迅刀',
    role: 'サポート・サブ火力',
    roleTemplate: 'DPS',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'resonanceSkillDmg' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],               acceptable: ['atkPercent'] },
      cost3: { recommended: ['atkPercent', 'SpectroDmg'],        acceptable: [] },
      cost1: { recommended: ['atkPercent'],           acceptable: [] },
    },
    harmonySets: { recommended: [SET.CELESTIAL,SET.ETERNAL], acceptable: [] },
  },

  {
    id: 'rover_havoc', name: '漂泊者(消滅)', nameEn: 'Rover (Havoc)', element: '消滅', weapon: '迅刀',
    role: 'メインアタッカー',
    roleTemplate: 'DPS',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
      ],
      preferred:   [],
      acceptable:  [],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['atkPercent'] },
      cost3: { recommended: ['HavocDmg','atkPercent'],              acceptable: [] },
      cost1: { recommended: ['atkPercent'],            acceptable: [] },
    },
    harmonySets: { recommended: [SET.MIDNIGHT, SET.HAVOC_OLD], acceptable: [] },
  },

  {
    id: 'rover_aero', name: '漂泊者(気動)', nameEn: 'Rover (Aero)', element: '気動', weapon: '迅刀',
    role: '耐久・回復サポート',
    roleTemplate: 'SubDPS',
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'energyRegen' },
        { key: 'atkPercent' },
        { key: 'resonanceSkillDmg' },
      ],
      preferred:   [],
      acceptable:  [],
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

export const CHARACTER_LIST = CHARACTERS.map(({ id, name, nameEn, element, role }) => ({
  id, name, nameEn, element, role,
}));
