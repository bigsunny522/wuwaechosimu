import type { EchoCost } from '@/types/echo';

// ═══════════════════════════════════════════════════════════════════════════
//  HOW TO ADD / UPDATE ECHO DATA
// ═══════════════════════════════════════════════════════════════════════════
//
//  1. 新しいセット名を追加する場合
//     → HARMONY_SETS オブジェクトに key: '日本語セット名' を追記する
//     → HARMONY_SETS_EN にも英語名を追記する
//
//  2. 音骸を追加する場合
//     → ECHOES 配列に EchoInfo オブジェクトを追記する
//        フォーマット:
//        {
//          id:     string   — 小文字英数字 + アンダースコア（一意）
//          name:   string   — ゲーム内日本語名
//          nameEn: string   — 英語名
//          cost:   4 | 3 | 1
//          sets:   string[] — HARMONY_SETS の値を配列で指定（1〜4個）
//        }
//
//  3. 音骸名を修正する場合
//     → ECHOES 内の該当エントリの name / nameEn を書き換えるだけ
//        id は変えないこと（変えると選択状態がリセットされる）
//
//  4. セット名を修正する場合
//     → HARMONY_SETS の値のみ変更すれば全エントリに一括反映される
//
// ═══════════════════════════════════════════════════════════════════════════

export const HARMONY_SETS = {
  // ── 基本セット (Ver 1.x) ────────────────────────────────────────────────
  LINGERING_TUNES:      '絶えない余韻',
  REJUVENATING_GLOW:    '喧騒に隠す回光',
  MOONLIT_CLOUDS:       '月を窺う軽雲',
  HAVOC_ECLIPSE:        '二度と輝かない沈日',
  VOID_THUNDER:         '空を切り裂く冥雷',
  SIERRA_GALE:          '谷を突き抜ける長風',
  CELESTIAL_LIGHT:      '闇を取り払う浮星',
  FREEZING_FROST:       '夜にこびり付く白霜',
  MOLTEN_RIFT:          '山を轟かせる崩火',
  // ── 追加セット (Ver 2.x) ────────────────────────────────────────────────
  MIDNIGHT_VEIL:        'ミッドナイト・ベール',
  FROSTY_RESOLVE:       'フロステッド・ハート',
  ETERNAL_RADIANCE:     'エターナル・ライト',
  EMPYREAN_ANTHEM:      'セレッシャル・アンサム',
  TIDEBREAKING_COURAGE: 'タイズターニング・ヴァラ',
  // ── 追加セット (Ver 2.x 後期) ───────────────────────────────────────────
  FLAMING_CLAW:         'ハウリング・フレイム',
  GUSTS_OF_WELKIN:      'バウンドレス・スカイ',
  GLORIOUS_WIND:        'グロリアス・ウィンド',
  THREAD_OF_FATE:       '命理崩壊の弦',
  INFERNO_SHADOW:       'インフェルノ・シャドウ',
  // ── 追加セット (Ver 3.x) ────────────────────────────────────────────────
  ASTRO_LORD:           'アストロ・ロード',
  PATINA_FOAM:          'パティナ・フォーム',
  SNOWY_SILENCE:        '静寂祈念の雪',
  SEMANTIC_WISH:        'セマンティック・ウィッシュ',
  REFLECT_BLAZE:        'リフレクト・ブレイズ',
  STARLIGHT_RING:       'スターブライト・リング',
  ETHER_RESONANCE:      'エーテル・レゾナンス',
  MONTAGE_SILHOUETTE:   'モンタージュ・シルエット',
  GLORY_FORGE_CROWN:    'グローリーフォージ・クラウン',
  LOST_DREAM:           'ロスト・ドリーム',
  GILDED_REVELATION:    'ゴールデン・ヴァリアント',
  // ── 追加セット (Ver 4.x) ────────────────────────────────────────────────
  NIGHTMARE_SPECTER:    'ナイトメア・スペクター',
} as const;

// ── 英語ハーモニーセット名（英語UI対応用） ──────────────────────────────────
export const HARMONY_SETS_EN: Record<string, string> = {
  '絶えない余韻':           'Lingering Tunes',
  '喧騒に隠す回光':         'Rejuvenating Glow',
  '月を窺う軽雲':           'Moonlit Clouds',
  '二度と輝かない沈日':     'Sun-sinking Eclipse',
  '空を切り裂く冥雷':       'Void Thunder',
  '谷を突き抜ける長風':     'Sierra Gale',
  '闇を取り払う浮星':       'Celestial Light',
  '夜にこびり付く白霜':     'Freezing Frost',
  '山を轟かせる崩火':       'Molten Rift',
  'ミッドナイト・ベール':   'Midnight Veil',
  'フロステッド・ハート':   'Frosty Resolve',
  'エターナル・ライト':     'Eternal Radiance',
  'セレッシャル・アンサム': 'Empyrean Anthem',
  'タイズターニング・ヴァラ': 'Tidebreaking Courage',
  'ハウリング・フレイム':   'Flaming Clawprint',
  'バウンドレス・スカイ':   'Gusts of Welkin',
  'グロリアス・ウィンド':   'Windward Pilgrimage',
  '命理崩壊の弦':           'Thread of Severed Fate',
  'インフェルノ・シャドウ': "Flamewing's Shadow",
  'アストロ・ロード':       'Trailblazing Star',
  'パティナ・フォーム':     'Chromatic Foam',
  '静寂祈念の雪':           'Wishes of Quiet Snowfall',
  'セマンティック・ウィッシュ': 'Sound of True Name',
  'リフレクト・ブレイズ':   'Pact of Neonlight Leap',
  'スターブライト・リング': 'Halo of Starry Radiance',
  'エーテル・レゾナンス':   'Law of Harmony',
  'モンタージュ・シルエット': 'Reel of Spliced Memories',
  'グローリーフォージ・クラウン': 'Crown of Valor',
  'ロスト・ドリーム':       'Dream of the Lost',
  'ゴールデン・ヴァリアント': 'Rite of Gilded Revelation',
  'ナイトメア・スペクター':   'Nightmare Specter',
};

// ── ハーモニーセット別バッジカラー（属性区分） ────────────────────────────
export const HARMONY_SET_COLORS: Record<string, { bg: string; text: string }> = {
  // 凝縮 (Ice)
  '夜にこびり付く白霜':       { bg: '#e0f2fe', text: '#0284c7' },
  'フロステッド・ハート':      { bg: '#e0f2fe', text: '#0284c7' },
  '静寂祈念の雪':              { bg: '#e0f2fe', text: '#0284c7' },
  // 焦熱 (Fire)
  '山を轟かせる崩火':          { bg: '#fff3e0', text: '#ea580c' },
  'ハウリング・フレイム':      { bg: '#fff3e0', text: '#ea580c' },
  'インフェルノ・シャドウ':    { bg: '#fff3e0', text: '#ea580c' },
  'パティナ・フォーム':        { bg: '#fff3e0', text: '#ea580c' },
  'アストロ・ロード':          { bg: '#fff3e0', text: '#ea580c' },
  // 電導 (Electro)
  '空を切り裂く冥雷':          { bg: '#f3e8ff', text: '#9333ea' },
  // 気動 (Aero)
  '谷を突き抜ける長風':        { bg: '#dcfce7', text: '#16a34a' },
  'バウンドレス・スカイ':      { bg: '#dcfce7', text: '#16a34a' },
  'グロリアス・ウィンド':      { bg: '#dcfce7', text: '#16a34a' },
  'セマンティック・ウィッシュ': { bg: '#dcfce7', text: '#16a34a' },
  // 回折 (Spectro)
  '闇を取り払う浮星':          { bg: '#fef9c3', text: '#b45309' },
  'エターナル・ライト':        { bg: '#fef9c3', text: '#b45309' },
  'ゴールデン・ヴァリアント':  { bg: '#fef9c3', text: '#b45309' },
  'リフレクト・ブレイズ':      { bg: '#fef9c3', text: '#b45309' },
  // 消滅 (Havoc)
  '二度と輝かない沈日':        { bg: '#ede9fe', text: '#7c3aed' },
  'ミッドナイト・ベール':      { bg: '#ede9fe', text: '#7c3aed' },
  '命理崩壊の弦':              { bg: '#ede9fe', text: '#7c3aed' },
};

const HARMONY_BADGE_DEFAULT = { bg: '#f3f4f6', text: '#6b7280' };

export function getHarmonyBadgeColor(setName: string): { bg: string; text: string } {
  return HARMONY_SET_COLORS[setName] ?? HARMONY_BADGE_DEFAULT;
}

const S = HARMONY_SETS; // 短縮エイリアス

export interface EchoInfo {
  id:     string;
  name:   string;
  nameEn: string;
  cost:   EchoCost;
  sets:   string[];
}

// ═══════════════════════════════════════════════════════════════════════════
//  ECHO LIST  (echo-list.csv 準拠、コスト降順)
// ═══════════════════════════════════════════════════════════════════════════
export const ECHOES: EchoInfo[] = [

  // ── COST 4 ──────────────────────────────────────────────────────────────
  { id: 'bell_borne_geochelone',       name: '鳴鐘の亀',                    nameEn: 'Bell-Borne Geochelone',              cost: 4, sets: [S.REJUVENATING_GLOW, S.MOONLIT_CLOUDS]                          },
  { id: 'dreamless',                   name: '無妄者',                       nameEn: 'Dreamless',                          cost: 4, sets: [S.HAVOC_ECLIPSE]                                                  },
  { id: 'jue',                         name: '歳主「角」',                   nameEn: 'Jué',                                cost: 4, sets: [S.CELESTIAL_LIGHT]                                                },
  { id: 'fleurdelys',                  name: 'フルールドリス',               nameEn: 'Fleurdelys',                         cost: 4, sets: [S.GUSTS_OF_WELKIN]                                                },
  { id: 'leviathan',                   name: '響き渡る共鳴・鳴式・レビヤタン', nameEn: 'Threnodian - Leviathan',           cost: 4, sets: [S.THREAD_OF_FATE, S.INFERNO_SHADOW]                               },
  { id: 'sigillum',                    name: 'シギルム',                     nameEn: 'Sigillum',                           cost: 4, sets: [S.ASTRO_LORD]                                                      },
  { id: 'denia',                       name: '響き渡る共鳴・ダーニャ',       nameEn: 'Denia',                              cost: 4, sets: [S.PATINA_FOAM]                                                     },
  { id: 'voidborne_construct',         name: '鳴式・虚構神機',               nameEn: 'Voidborne Construct',                cost: 4, sets: [S.SNOWY_SILENCE]                                                  },
  { id: 'hecate',                      name: 'ヘカテー',                     nameEn: 'Hecate',                             cost: 4, sets: [S.EMPYREAN_ANTHEM]                                                 },
  { id: 'feilian_beringal',            name: '飛廉の大猿',                   nameEn: 'Feilian Beringal',                   cost: 4, sets: [S.SIERRA_GALE]                                                    },
  { id: 'impermanence_heron',          name: '無情のサギ',                   nameEn: 'Impermanence Heron',                 cost: 4, sets: [S.MOONLIT_CLOUDS]                                                 },
  { id: 'mourning_aix',                name: '哀切の凶鳥',                   nameEn: 'Mourning Aix',                       cost: 4, sets: [S.CELESTIAL_LIGHT]                                                },
  { id: 'crownless',                   name: '無冠者',                       nameEn: 'Crownless',                          cost: 4, sets: [S.HAVOC_ECLIPSE]                                                   },
  { id: 'dragon_of_dirge',             name: '嘆きのドレイク',               nameEn: 'Dragon of Dirge',                    cost: 4, sets: [S.TIDEBREAKING_COURAGE]                                           },
  { id: 'lampylumen_myriad',           name: '輝き蛍の軍勢',                 nameEn: 'Lampylumen Myriad',                  cost: 4, sets: [S.FREEZING_FROST]                                                 },
  { id: 'mech_abomination',            name: '機械アボミネーション',         nameEn: 'Mech Abomination',                   cost: 4, sets: [S.LINGERING_TUNES]                                                },
  { id: 'tempest_mephis',              name: '雷刹のウロコ',                 nameEn: 'Tempest Mephis',                     cost: 4, sets: [S.VOID_THUNDER]                                                   },
  { id: 'thundering_mephis',           name: '雲閃のウロコ',                 nameEn: 'Thundering Mephis',                  cost: 4, sets: [S.VOID_THUNDER]                                                   },
  { id: 'inferno_rider',               name: '燎原の炎騎',                   nameEn: 'Inferno Rider',                      cost: 4, sets: [S.MOLTEN_RIFT]                                                    },
  { id: 'lorelei',                     name: 'ローレライ',                   nameEn: 'Lorelei',                            cost: 4, sets: [S.MIDNIGHT_VEIL]                                                  },
  { id: 'sentry_construct',            name: 'ゼノコロッサス',               nameEn: 'Sentry Construct',                   cost: 4, sets: [S.FROSTY_RESOLVE]                                                 },
  { id: 'lioness_of_glory',            name: '誉れのライオネス',             nameEn: 'Lioness of Glory',                   cost: 4, sets: [S.FLAMING_CLAW]                                                   },
  { id: 'lady_of_the_sea',             name: '海の娘',                       nameEn: 'Lady of the Sea',                    cost: 4, sets: [S.GLORY_FORGE_CROWN]                                              },
  { id: 'nameless_explorer',           name: '名もない探索者',               nameEn: 'Nameless Explorer',                  cost: 4, sets: [S.SEMANTIC_WISH, S.MONTAGE_SILHOUETTE]                            },
  { id: 'fallacy_of_no_return',        name: 'フェイタルエラー',             nameEn: 'Fallacy of No Return',               cost: 4, sets: [S.REJUVENATING_GLOW]                                              },
  { id: 'fenrico',                     name: 'フェンリコ',                   nameEn: 'Fenrico',                            cost: 4, sets: [S.LOST_DREAM, S.ETHER_RESONANCE]                                  },
  { id: 'hyvatia',                     name: 'ハイヴェイシャ',               nameEn: 'Hyvatia',                            cost: 4, sets: [S.REFLECT_BLAZE, S.GILDED_REVELATION]                             },
  { id: 'reactor_husk',                name: 'ドライブの機骸',               nameEn: 'Reactor Husk',                       cost: 4, sets: [S.STARLIGHT_RING]                                                 },
  { id: 'nm_hecate',                   name: 'ナイトメア・ヘカテー',         nameEn: 'Nightmare: Hecate',                  cost: 4, sets: [S.LOST_DREAM]                                                     },
  { id: 'nm_feilian_beringal',         name: 'ナイトメア・飛廉の大猿',       nameEn: 'Nightmare: Feilian Beringal',        cost: 4, sets: [S.SIERRA_GALE]                                                    },
  { id: 'nm_impermanence_heron',       name: 'ナイトメア・無情のサギ',       nameEn: 'Nightmare: Impermanence Heron',      cost: 4, sets: [S.MIDNIGHT_VEIL]                                                  },
  { id: 'nm_mourning_aix',             name: 'ナイトメア・哀切の凶鳥',       nameEn: 'Nightmare: Mourning Aix',            cost: 4, sets: [S.ETERNAL_RADIANCE]                                               },
  { id: 'nm_crownless',               name: 'ナイトメア・無冠者',           nameEn: 'Nightmare: Crownless',               cost: 4, sets: [S.HAVOC_ECLIPSE, S.EMPYREAN_ANTHEM]                               },
  { id: 'nm_lampylumen_myriad',        name: 'ナイトメア・輝き蛍の軍勢',     nameEn: 'Nightmare: Lampylumen Myriad',       cost: 4, sets: [S.FROSTY_RESOLVE, S.EMPYREAN_ANTHEM]                              },
  { id: 'nm_tempest_mephis',           name: 'ナイトメア・雷刹のウロコ',     nameEn: 'Nightmare: Tempest Mephis',          cost: 4, sets: [S.VOID_THUNDER]                                                   },
  { id: 'nm_thundering_mephis',        name: 'ナイトメア・雲閃のウロコ',     nameEn: 'Nightmare: Thundering Mephis',       cost: 4, sets: [S.VOID_THUNDER]                                                   },
  { id: 'nm_inferno_rider',            name: 'ナイトメア・燎原の炎騎',       nameEn: 'Nightmare: Inferno Rider',           cost: 4, sets: [S.MOLTEN_RIFT]                                                    },
  { id: 'nm_kelpie',                   name: 'ナイトメア・ケルピー',         nameEn: 'Nightmare: Kelpie',                  cost: 4, sets: [S.GLORIOUS_WIND, S.GUSTS_OF_WELKIN]                               },
  { id: 'false_sovereign',             name: '偽りの神王',                   nameEn: 'The False Sovereign',                cost: 4, sets: [S.GLORY_FORGE_CROWN]                                              },
  { id: 'nightmare_smasher',           name: '響き渡る共鳴・ナイトメア・スマッシャー', nameEn: 'Resonating Chord: Nightmare Smasher', cost: 4, sets: [S.NIGHTMARE_SPECTER]                                        },

  // ── COST 3 ──────────────────────────────────────────────────────────────
  { id: 'cyan_feathered_heron',        name: '青羽サギ',                     nameEn: 'Cyan-Feathered Heron',               cost: 3, sets: [S.SIERRA_GALE, S.CELESTIAL_LIGHT]                                },
  { id: 'violet_feathered_heron',      name: '紫羽サギ',                     nameEn: 'Violet-Feathered Heron',             cost: 3, sets: [S.VOID_THUNDER, S.MOLTEN_RIFT]                                   },
  { id: 'viridblaze_saurian',          name: '熔解トカゲ',                   nameEn: 'Viridblaze Saurian',                 cost: 3, sets: [S.MOLTEN_RIFT, S.MOONLIT_CLOUDS]                                 },
  { id: 'hoochief',                    name: 'ハリケーン熊',                 nameEn: 'Hurriclaw',                          cost: 3, sets: [S.GUSTS_OF_WELKIN, S.TIDEBREAKING_COURAGE, S.GLORY_FORGE_CROWN]  },
  { id: 'spearback',                   name: '黒棘熊',                       nameEn: 'Spearback',                          cost: 3, sets: [S.LINGERING_TUNES, S.MOONLIT_CLOUDS]                              },
  { id: 'havoc_dreadmane',             name: '闇鬣狼',                       nameEn: 'Havoc Dreadmane',                    cost: 3, sets: [S.HAVOC_ECLIPSE, S.MOLTEN_RIFT]                                  },
  { id: 'carapace',                    name: 'いたずら猿',                   nameEn: 'Hoochief',                           cost: 3, sets: [S.SIERRA_GALE, S.REJUVENATING_GLOW]                               },
  { id: 'glacio_dreadmane',            name: '雪鬣狼',                       nameEn: 'Glacio Dreadmane',                   cost: 3, sets: [S.FREEZING_FROST, S.MOONLIT_CLOUDS]                              },
  { id: 'lightcrusher',                name: '光踏獣',                       nameEn: 'Lightcrusher',                       cost: 3, sets: [S.CELESTIAL_LIGHT]                                                },
  { id: 'chasm_guardian',              name: 'クラトスクス',                 nameEn: 'Kerasaur',                           cost: 3, sets: [S.GLORIOUS_WIND, S.INFERNO_SHADOW, S.FLAMING_CLAW]               },
  { id: 'corrosaurus',                 name: 'コロサウルス',                 nameEn: 'Corrosaurus',                        cost: 3, sets: [S.INFERNO_SHADOW, S.FLAMING_CLAW]                                 },
  { id: 'rocksteady_guardian',         name: '恐刃の車',                     nameEn: 'Carapace',                           cost: 3, sets: [S.SIERRA_GALE, S.MOONLIT_CLOUDS]                                  },
  { id: 'stonewall_bracer',            name: 'フロートアルマ',               nameEn: 'Chop Chop',                          cost: 3, sets: [S.EMPYREAN_ANTHEM, S.TIDEBREAKING_COURAGE, S.LOST_DREAM]         },
  { id: 'chop_chop',                   name: 'ビッグベア',                   nameEn: 'Cuddle Wuddle',                      cost: 3, sets: [S.FROSTY_RESOLVE, S.MIDNIGHT_VEIL]                               },
  { id: 'roseshroom',                  name: 'トゲバラタケ',                 nameEn: 'Roseshroom',                         cost: 3, sets: [S.HAVOC_ECLIPSE, S.FREEZING_FROST]                               },
  { id: 'tambourinist',                name: '巨岩の闘士',                   nameEn: 'Stonewall Bracer',                   cost: 3, sets: [S.REJUVENATING_GLOW, S.MOONLIT_CLOUDS]                           },
  { id: 'flautist',                    name: '金鈴の楽手',                   nameEn: 'Tambourinist',                       cost: 3, sets: [S.HAVOC_ECLIPSE, S.FREEZING_FROST]                               },
  { id: 'rage_against_statue',         name: '彫像を再構築する岩拳',         nameEn: 'Rage Against the Statue',            cost: 3, sets: [S.ETERNAL_RADIANCE, S.ETHER_RESONANCE]                           },
  { id: 'lumiscale_construct',         name: '宣諭の楽手',                   nameEn: 'Flautist',                           cost: 3, sets: [S.VOID_THUNDER, S.LINGERING_TUNES]                               },
  { id: 'questless_knight',            name: '冥淵の守り手',                 nameEn: 'Chasm Guardian',                     cost: 3, sets: [S.LINGERING_TUNES, S.REJUVENATING_GLOW]                          },
  { id: 'diurnus_knight',              name: '盤石の守り手',                 nameEn: 'Rocksteady Guardian',                cost: 3, sets: [S.CELESTIAL_LIGHT, S.REJUVENATING_GLOW]                          },
  { id: 'nocturnus_knight_d',          name: '回歴の騎士',                   nameEn: 'Questless Knight',                   cost: 3, sets: [S.MIDNIGHT_VEIL, S.FROSTY_RESOLVE]                               },
  { id: 'nocturnus_knight_f',          name: '炎昼の騎士',                   nameEn: 'Diurnus Knight',                     cost: 3, sets: [S.TIDEBREAKING_COURAGE, S.ETERNAL_RADIANCE]                      },
  { id: 'nocturnus_knight',            name: '闇夜の騎士',                   nameEn: 'Nocturnus Knight',                   cost: 3, sets: [S.EMPYREAN_ANTHEM, S.MIDNIGHT_VEIL]                              },
  { id: 'abyssal_patricius',           name: 'アビサル・パトリシウス',       nameEn: 'Abyssal Patricius',                  cost: 3, sets: [S.EMPYREAN_ANTHEM, S.FROSTY_RESOLVE]                             },
  { id: 'abyssal_gladius',             name: 'アビサル・グラディウス',       nameEn: 'Abyssal Gladius',                    cost: 3, sets: [S.TIDEBREAKING_COURAGE, S.MIDNIGHT_VEIL, S.THREAD_OF_FATE]       },
  { id: 'abyssal_mercator',            name: 'アビサル・メルカトル',         nameEn: 'Abyssal Mercator',                   cost: 3, sets: [S.FROSTY_RESOLVE, S.ETERNAL_RADIANCE]                            },
  { id: 'vitreum_dancer',              name: 'ヴィトルムダンサー',           nameEn: 'Vitreum Dancer',                     cost: 3, sets: [S.EMPYREAN_ANTHEM, S.ETERNAL_RADIANCE]                           },
  { id: 'capitaneus',                  name: 'カピタネウス',                 nameEn: 'Capitaneus',                         cost: 3, sets: [S.ETERNAL_RADIANCE, S.GUSTS_OF_WELKIN]                           },
  { id: 'pilgrims_shell',              name: '伝道師の空殻',                 nameEn: "Pilgrim's Shell",                    cost: 3, sets: [S.FLAMING_CLAW, S.GLORIOUS_WIND]                                 },
  { id: 'autopuppet_scout',            name: '巡回のカラクリ',               nameEn: 'Autopuppet Scout',                   cost: 3, sets: [S.FREEZING_FROST, S.CELESTIAL_LIGHT]                             },
  { id: 'lumiscale_float',             name: '浮遊鱗機',                     nameEn: 'Lumiscale Construct',                cost: 3, sets: [S.FREEZING_FROST, S.VOID_THUNDER]                                },
  { id: 'bipolar_nova_cannon',         name: 'バイポーラ・ノヴァライザー',   nameEn: 'Twin Nova: Nebulous Cannon',         cost: 3, sets: [S.GILDED_REVELATION, S.PATINA_FOAM]                              },
  { id: 'bipolar_collapsar',           name: 'バイポーラ・アビスフォール',   nameEn: 'Twin Nova: Collapsar Blade',         cost: 3, sets: [S.GILDED_REVELATION, S.SEMANTIC_WISH]                            },
  { id: 'flora_reindeer',              name: 'フローラ・メカレインディア',    nameEn: 'Flora Reindeer',                     cost: 3, sets: [S.GILDED_REVELATION, S.MONTAGE_SILHOUETTE]                       },
  { id: 'mining_reindeer',             name: 'マイニング・メカレインディア',  nameEn: 'Mining Reindeer',                    cost: 3, sets: [S.REFLECT_BLAZE, S.MONTAGE_SILHOUETTE]                           },
  { id: 'ironhoof',                    name: 'アイアン・フーフ',             nameEn: 'Ironhoof',                           cost: 3, sets: [S.REFLECT_BLAZE, S.SNOWY_SILENCE, S.MONTAGE_SILHOUETTE]          },
  { id: 'spacetrek_explorer',          name: 'スペーストレック重機',         nameEn: 'Spacetrek Explorer',                 cost: 3, sets: [S.STARLIGHT_RING, S.SEMANTIC_WISH, S.PATINA_FOAM]                },
  { id: 'sabercat_reaver',             name: 'リッパーシェード',             nameEn: 'Sabercat Reaver',                    cost: 3, sets: [S.STARLIGHT_RING, S.REFLECT_BLAZE, S.SEMANTIC_WISH]              },
  { id: 'sabercat_prowler',            name: 'プラウラーシェード',           nameEn: 'Sabercat Prowler',                   cost: 3, sets: [S.STARLIGHT_RING, S.REFLECT_BLAZE, S.SEMANTIC_WISH]              },
  { id: 'frostbite_coleoid',           name: '霜纏いの寄生甲',               nameEn: 'Frostbite Coleoid',                  cost: 3, sets: [S.STARLIGHT_RING, S.SNOWY_SILENCE]                               },
  { id: 'windlash_coleoid',            name: '風纏いの寄生甲',               nameEn: 'Windlash Coleoid',                   cost: 3, sets: [S.GILDED_REVELATION, S.SNOWY_SILENCE]                            },
  { id: 'kronablight',                 name: 'クロナファルコン',             nameEn: 'Reminiscence: Kronaclaw',            cost: 3, sets: [S.PATINA_FOAM, S.ASTRO_LORD]                                     },
  { id: 'kronaclaw',                   name: 'メカファルコン',               nameEn: 'Kronablight',                        cost: 3, sets: [S.PATINA_FOAM, S.ASTRO_LORD]                                     },
  { id: 'glommoth',                    name: 'グローモス',                   nameEn: 'Glommoth',                           cost: 3, sets: [S.FREEZING_FROST, S.ASTRO_LORD, S.SNOWY_SILENCE]                 },
  { id: 'voidwing_moth',               name: 'ファントムモス',               nameEn: 'Voidwing Moth',                      cost: 3, sets: [S.MONTAGE_SILHOUETTE]                                            },
  { id: 'nm_cyan_feathered_heron',     name: 'ナイトメア・青羽サギ',         nameEn: 'Nightmare: Cyan-Feathered Heron',    cost: 3, sets: [S.ETHER_RESONANCE]                                               },
  { id: 'nm_violet_feathered_heron',   name: 'ナイトメア・紫羽サギ',         nameEn: 'Nightmare: Violet-Feathered Heron',  cost: 3, sets: [S.GLORY_FORGE_CROWN]                                             },
  { id: 'nm_viridblaze_saurian',       name: 'ナイトメア・熔解トカゲ',       nameEn: 'Nightmare: Viridblaze Saurian',      cost: 3, sets: [S.INFERNO_SHADOW]                                                },
  { id: 'nm_roseshroom',               name: 'ナイトメア・トゲバラタケ',     nameEn: 'Nightmare: Roseshroom',              cost: 3, sets: [S.THREAD_OF_FATE]                                                },
  { id: 'nm_tambourinist',             name: 'ナイトメア・金鈴の楽手',       nameEn: 'Nightmare: Tambourinist',            cost: 3, sets: [S.LOST_DREAM]                                                     },

  // ── COST 1 ──────────────────────────────────────────────────────────────
  { id: 'whiff_whaff',                 name: 'フシュシュ',                   nameEn: 'Whiff Whaff',                        cost: 1, sets: [S.SIERRA_GALE, S.MOONLIT_CLOUDS, S.REJUVENATING_GLOW]           },
  { id: 'tick_tack',                   name: 'カチャチャ',                   nameEn: 'Snip Snap',                          cost: 1, sets: [S.LINGERING_TUNES, S.REJUVENATING_GLOW, S.MOLTEN_RIFT]          },
  { id: 'snip_snap',                   name: 'アツツ',                       nameEn: 'Zig Zag',                            cost: 1, sets: [S.LINGERING_TUNES, S.MOONLIT_CLOUDS, S.CELESTIAL_LIGHT]         },
  { id: 'zig_zag',                     name: 'ウカカ',                       nameEn: 'Tick Tack',                          cost: 1, sets: [S.LINGERING_TUNES, S.REJUVENATING_GLOW, S.HAVOC_ECLIPSE]        },
  { id: 'clang_bang',                  name: 'チリン',                       nameEn: 'Clang Bang',                         cost: 1, sets: [S.FREEZING_FROST, S.CELESTIAL_LIGHT]                             },
  { id: 'gulpuff',                     name: 'グルッポ',                     nameEn: 'Gulpuff',                            cost: 1, sets: [S.FREEZING_FROST, S.CELESTIAL_LIGHT]                             },
  { id: 'hooscamp',                    name: 'ジュルッポ',                   nameEn: 'Chirpuff',                           cost: 1, sets: [S.SIERRA_GALE, S.HAVOC_ECLIPSE]                                  },
  { id: 'diamondclaw',                 name: 'モグロン',                     nameEn: 'Excarat',                            cost: 1, sets: [S.HAVOC_ECLIPSE, S.FREEZING_FROST]                               },
  { id: 'baby_viridblaze_saurian',     name: '熔解トカゲ（幼体）',           nameEn: 'Baby Viridblaze Saurian',            cost: 1, sets: [S.LINGERING_TUNES, S.VOID_THUNDER, S.MOLTEN_RIFT]               },
  { id: 'sabyr_boar',                  name: '砕牙イノシシ',                 nameEn: 'Sabyr Boar',                         cost: 1, sets: [S.SIERRA_GALE, S.MOONLIT_CLOUDS, S.FREEZING_FROST]              },
  { id: 'fusion_dreadmane',            name: '火鬣狼',                       nameEn: 'Fusion Dreadmane',                   cost: 1, sets: [S.MOLTEN_RIFT, S.REJUVENATING_GLOW]                             },
  { id: 'excarat',                     name: '結晶化サソリ',                 nameEn: 'Diamondclaw',                        cost: 1, sets: [S.LINGERING_TUNES, S.MOONLIT_CLOUDS]                            },
  { id: 'cruisewing',                  name: '遊弋蝶',                       nameEn: 'Cruisewing',                         cost: 1, sets: [S.REJUVENATING_GLOW, S.MOONLIT_CLOUDS, S.CELESTIAL_LIGHT]       },
  { id: 'hoartoise',                   name: '寒霜亀',                       nameEn: 'Hoartoise',                          cost: 1, sets: [S.CELESTIAL_LIGHT, S.FREEZING_FROST]                             },
  { id: 'chirpuff',                    name: '猿の幼体',                     nameEn: 'Hooscamp',                           cost: 1, sets: [S.SIERRA_GALE, S.LINGERING_TUNES]                               },
  { id: 'lava_larva',                  name: '溶岩虫',                       nameEn: 'Lava Larva',                         cost: 1, sets: [S.MOLTEN_RIFT, S.LINGERING_TUNES]                               },
  { id: 'dwarf_cassowary',             name: '地駝鳥',                       nameEn: 'Dwarf Cassowary',                    cost: 1, sets: [S.SIERRA_GALE, S.REJUVENATING_GLOW]                            },
  { id: 'aero_predator',               name: '風鬣狼',                       nameEn: 'Galescourge Stalker',                cost: 1, sets: [S.EMPYREAN_ANTHEM, S.FROSTY_RESOLVE]                            },
  { id: 'electro_predator',            name: '雷鬣狼',                       nameEn: 'Voltscourge Stalker',                cost: 1, sets: [S.EMPYREAN_ANTHEM, S.MIDNIGHT_VEIL]                             },
  { id: 'glacio_predator',             name: '霜鬣狼',                       nameEn: 'Frostscourge Stalker',               cost: 1, sets: [S.MIDNIGHT_VEIL, S.ETERNAL_RADIANCE]                            },
  { id: 'glacio_prism',                name: '凝縮のプリズム',               nameEn: 'Glacio Prism',                       cost: 1, sets: [S.FREEZING_FROST, S.MOONLIT_CLOUDS, S.HAVOC_ECLIPSE]           },
  { id: 'fusion_prism',                name: '焦熱のプリズム',               nameEn: 'Fusion Prism',                       cost: 1, sets: [S.LINGERING_TUNES, S.MOLTEN_RIFT, S.FREEZING_FROST]            },
  { id: 'havoc_prism',                 name: '消滅のプリズム',               nameEn: 'Havoc Prism',                        cost: 1, sets: [S.HAVOC_ECLIPSE, S.CELESTIAL_LIGHT, S.VOID_THUNDER]            },
  { id: 'spectro_prism',               name: '回折のプリズム',               nameEn: 'Spectro Prism',                      cost: 1, sets: [S.CELESTIAL_LIGHT, S.VOID_THUNDER, S.MOLTEN_RIFT]              },
  { id: 'aero_prism',                  name: '気動のプリズム',               nameEn: 'Aero Prism',                         cost: 1, sets: [S.TIDEBREAKING_COURAGE, S.ETERNAL_RADIANCE]                    },
  { id: 'chop_chop_head',              name: 'フロートアルマ・ヘッド',       nameEn: 'Chop Chop: Headless',                cost: 1, sets: [S.TIDEBREAKING_COURAGE, S.ETERNAL_RADIANCE, S.LOST_DREAM]       },
  { id: 'chop_chop_left',              name: 'フロートアルマ・レフト',       nameEn: 'Chop Chop: Leftless',                cost: 1, sets: [S.TIDEBREAKING_COURAGE, S.FROSTY_RESOLVE]                       },
  { id: 'chop_chop_right',             name: 'フロートアルマ・ライト',       nameEn: 'Chop Chop: Rightless',               cost: 1, sets: [S.TIDEBREAKING_COURAGE, S.FROSTY_RESOLVE]                       },
  { id: 'fae_ignis',                   name: 'フェイイグニス',               nameEn: 'Fae Ignis',                          cost: 1, sets: [S.MIDNIGHT_VEIL, S.ETERNAL_RADIANCE, S.LOST_DREAM]             },
  { id: 'nimbus_wraith',               name: '雲の妖精',                     nameEn: 'Nimbus Wraith',                      cost: 1, sets: [S.EMPYREAN_ANTHEM, S.MIDNIGHT_VEIL]                             },
  { id: 'hocus_pocus',                 name: 'ミスター・マギア',             nameEn: 'Hocus Pocus',                        cost: 1, sets: [S.EMPYREAN_ANTHEM, S.FROSTY_RESOLVE]                            },
  { id: 'lottie_lost',                 name: 'ミス・ロンリー',               nameEn: 'Lottie Lost',                        cost: 1, sets: [S.TIDEBREAKING_COURAGE, S.FROSTY_RESOLVE]                       },
  { id: 'diggy_duggy',                 name: 'サクサクベア',                 nameEn: 'Diggy Duggy',                        cost: 1, sets: [S.TIDEBREAKING_COURAGE, S.ETERNAL_RADIANCE]                    },
  { id: 'chest_mimic',                 name: '秘蔵ミミック',                 nameEn: 'Chest Mimic',                        cost: 1, sets: [S.EMPYREAN_ANTHEM, S.MIDNIGHT_VEIL, S.FROSTY_RESOLVE]          },
  { id: 'baby_roseshroom',             name: 'トゲバラタケ（幼体）',         nameEn: 'Baby Roseshroom',                    cost: 1, sets: [S.HAVOC_ECLIPSE, S.SIERRA_GALE]                                },
  { id: 'vanguard_junrock',            name: '先兵岩塊',                     nameEn: 'Vanguard Junrock',                   cost: 1, sets: [S.LINGERING_TUNES, S.REJUVENATING_GLOW, S.VOID_THUNDER]        },
  { id: 'fission_junrock',             name: '壊れかけ岩塊',                 nameEn: 'Fission Junrock',                    cost: 1, sets: [S.REJUVENATING_GLOW, S.MOONLIT_CLOUDS, S.VOID_THUNDER]         },
  { id: 'golden_junrock',              name: '愚者のゴールドの岩塊',         nameEn: 'Golden Junrock',                     cost: 1, sets: [S.ETERNAL_RADIANCE, S.FROSTY_RESOLVE, S.ETHER_RESONANCE]       },
  { id: 'calcified_junrock',           name: 'ミカーレの岩塊',               nameEn: 'Calcified Junrock',                  cost: 1, sets: [S.TIDEBREAKING_COURAGE]                                         },
  { id: 'voltscourge_stalker',         name: '春雷の狩人',                   nameEn: 'Electro Predator',                   cost: 1, sets: [S.VOID_THUNDER, S.MOLTEN_RIFT]                                  },
  { id: 'frostscourge_stalker',        name: '破霜の狩人',                   nameEn: 'Glacio Predator',                    cost: 1, sets: [S.FREEZING_FROST, S.CELESTIAL_LIGHT]                            },
  { id: 'galescourge_stalker',         name: '徘徊の狩人',                   nameEn: 'Aero Predator',                      cost: 1, sets: [S.SIERRA_GALE]                                                   },
  { id: 'havoc_warrior',               name: '慟哭の戦士',                   nameEn: 'Fusion Warrior',                     cost: 1, sets: [S.MOLTEN_RIFT, S.SIERRA_GALE, S.VOID_THUNDER]                  },
  { id: 'fusion_warrior',              name: '審判の戦士',                   nameEn: 'Havoc Warrior',                      cost: 1, sets: [S.HAVOC_ECLIPSE, S.CELESTIAL_LIGHT]                             },
  { id: 'traffic_illuminator',         name: '信号機モドキ',                 nameEn: 'Traffic Illuminator',                cost: 1, sets: [S.MOLTEN_RIFT, S.SIERRA_GALE, S.VOID_THUNDER]                  },
  { id: 'la_guardia',                  name: 'ガルディア',                   nameEn: 'La Guardia',                         cost: 1, sets: [S.MIDNIGHT_VEIL, S.GUSTS_OF_WELKIN]                             },
  { id: 'sagittario',                  name: 'サジタリオ',                   nameEn: 'Sagittario',                         cost: 1, sets: [S.ETERNAL_RADIANCE, S.GUSTS_OF_WELKIN]                          },
  { id: 'sacerdos',                    name: 'サケルドス',                   nameEn: 'Sacerdos',                           cost: 1, sets: [S.GUSTS_OF_WELKIN]                                              },
  { id: 'devotees_flesh',              name: '狂信者の血肉',                 nameEn: "Devotee's Flesh",                    cost: 1, sets: [S.FLAMING_CLAW, S.GLORIOUS_WIND, S.GUSTS_OF_WELKIN]            },
  { id: 'aero_drake',                  name: 'ドレイクの幼体・気動',         nameEn: 'Aero Drake',                         cost: 1, sets: [S.TIDEBREAKING_COURAGE, S.GUSTS_OF_WELKIN]                      },
  { id: 'electro_drake',               name: 'ドレイクの幼体・電導',         nameEn: 'Electro Drake',                      cost: 1, sets: [S.MIDNIGHT_VEIL, S.GUSTS_OF_WELKIN]                             },
  { id: 'glacio_drake',                name: 'ドレイクの幼体・凝縮',         nameEn: 'Glacio Drake',                       cost: 1, sets: [S.GUSTS_OF_WELKIN]                                              },
  { id: 'fusion_drake',                name: 'ドレイクの幼体・焦熱',         nameEn: 'Fusion Drake',                       cost: 1, sets: [S.FLAMING_CLAW, S.GLORIOUS_WIND]                               },
  { id: 'spectro_drake',               name: 'ドレイクの幼体・回折',         nameEn: 'Spectro Drake',                      cost: 1, sets: [S.FLAMING_CLAW, S.GLORIOUS_WIND]                               },
  { id: 'havoc_drake',                 name: 'ドレイクの幼体・消滅',         nameEn: 'Havoc Drake',                        cost: 1, sets: [S.FLAMING_CLAW, S.GLORIOUS_WIND, S.THREAD_OF_FATE]             },
  { id: 'pollen_bee_a',                name: 'カフンクマバチ',               nameEn: 'Flora Drone',                        cost: 1, sets: [S.REFLECT_BLAZE, S.GILDED_REVELATION, S.SEMANTIC_WISH, S.MONTAGE_SILHOUETTE] },
  { id: 'pollen_bee_b',                name: 'サイクツクマバチ',             nameEn: 'Mining Drone',                       cost: 1, sets: [S.STARLIGHT_RING, S.GILDED_REVELATION, S.SEMANTIC_WISH, S.MONTAGE_SILHOUETTE] },
  { id: 'geospider_s4',                name: 'イワグモS4型',                 nameEn: 'Geospider S4',                       cost: 1, sets: [S.STARLIGHT_RING, S.REFLECT_BLAZE]                              },
  { id: 'tremor_warrior',              name: '戦慄の戦士',                   nameEn: 'Tremor Warrior',                     cost: 1, sets: [S.STARLIGHT_RING, S.PATINA_FOAM, S.SNOWY_SILENCE]              },
  { id: 'zip_zap',                     name: 'ビリリ',                       nameEn: 'Zip Zap',                            cost: 1, sets: [S.REFLECT_BLAZE, S.GILDED_REVELATION, S.SEMANTIC_WISH, S.PATINA_FOAM] },
  { id: 'iceglint_dancer',             name: 'アイスグリントダンサー',       nameEn: 'Iceglint Dancer',                    cost: 1, sets: [S.ASTRO_LORD, S.SNOWY_SILENCE, S.MONTAGE_SILHOUETTE]           },
  { id: 'shadow_stepper',              name: 'シャドウステッパー',           nameEn: 'Shadow Stepper',                     cost: 1, sets: [S.PATINA_FOAM, S.ASTRO_LORD, S.SNOWY_SILENCE]                  },
  { id: 'nm_tick_tack',                name: 'ナイトメア・ウカカ',           nameEn: 'Nightmare: Tick Tack',               cost: 1, sets: [S.THREAD_OF_FATE]                                               },
  { id: 'nm_gulpuff',                  name: 'ナイトメア・グルッポ',         nameEn: 'Nightmare: Gulpuff',                 cost: 1, sets: [S.ETHER_RESONANCE]                                              },
  { id: 'nm_chirpuff',                 name: 'ナイトメア・ジュルッポ',       nameEn: 'Nightmare: Chirpuff',                cost: 1, sets: [S.ETHER_RESONANCE]                                              },
  { id: 'nm_baby_viridblaze',          name: 'ナイトメア・熔解トカゲ（幼体）', nameEn: 'Nightmare: Baby Viridblaze Saurian', cost: 1, sets: [S.INFERNO_SHADOW]                                             },
  { id: 'nm_dwarf_cassowary',          name: 'ナイトメア・地駝鳥',           nameEn: 'Nightmare: Dwarf Cassowary',         cost: 1, sets: [S.THREAD_OF_FATE]                                               },
  { id: 'nm_baby_roseshroom',          name: 'ナイトメア・トゲバラタケ（幼体）', nameEn: 'Nightmare: Baby Roseshroom',     cost: 1, sets: [S.INFERNO_SHADOW]                                               },
  { id: 'nm_electro_predator',         name: 'ナイトメア・春雷の狩人',       nameEn: 'Nightmare: Electro Predator',        cost: 1, sets: [S.GLORY_FORGE_CROWN]                                            },
  { id: 'nm_glacio_predator',          name: 'ナイトメア・破霜の狩人',       nameEn: 'Nightmare: Glacio Predator',         cost: 1, sets: [S.FREEZING_FROST]                                               },
  { id: 'nm_aero_predator',            name: 'ナイトメア・徘徊の狩人',       nameEn: 'Nightmare: Aero Predator',           cost: 1, sets: [S.GLORY_FORGE_CROWN]                                            },
  { id: 'nm_havoc_warrior',            name: 'ナイトメア・審判の戦士',       nameEn: 'Nightmare: Havoc Warrior',           cost: 1, sets: [S.LOST_DREAM]                                                    },
];

// ── ヘルパー ─────────────────────────────────────────────────────────────
export const ECHOES_BY_COST: Record<EchoCost, EchoInfo[]> = {
  4: ECHOES.filter((e) => e.cost === 4),
  3: ECHOES.filter((e) => e.cost === 3),
  1: ECHOES.filter((e) => e.cost === 1),
};

export const DEFAULT_ECHO_ID: Record<EchoCost, string> = {
  4: 'sigillum',
  3: 'violet_feathered_heron',
  1: 'vanguard_junrock',
};
