import type { EchoCost } from '@/types/echo';

// ═══════════════════════════════════════════════════════════════════════════
//  HOW TO ADD / UPDATE ECHO DATA
// ═══════════════════════════════════════════════════════════════════════════
//
//  1. 新しいセット名を追加する場合
//     → HARMONY_SETS オブジェクトに key: '日本語セット名' を追記する
//
//  2. 音骸を追加する場合
//     → ECHOES 配列に EchoInfo オブジェクトを追記する
//        フォーマット:
//        {
//          id:     string   — 小文字英数字 + アンダースコア（一意）
//          name:   string   — ゲーム内日本語名（ユーザー提供データを優先）
//          nameEn: string   — 英語名
//          cost:   4 | 3 | 1
//          sets:   string[] — HARMONY_SETS の値を配列で指定（1〜2個）
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
} as const;

const S = HARMONY_SETS; // 短縮エイリアス

export interface EchoInfo {
  id:     string;
  name:   string;
  nameEn: string;
  cost:   EchoCost;
  sets:   string[];
}

// ═══════════════════════════════════════════════════════════════════════════
//  ECHO LIST  (コスト降順、ユーザー提供データ準拠)
// ═══════════════════════════════════════════════════════════════════════════
export const ECHOES: EchoInfo[] = [

  // ── COST 4 ──────────────────────────────────────────────────────────────
  { id: 'bell_borne_geochelone',  name: '鳴鐘の亀',              nameEn: 'Bell-Borne Geochelone',             cost: 4, sets: [S.REJUVENATING_GLOW, S.MOONLIT_CLOUDS]   },
  { id: 'dreamless',              name: '無妄者',                 nameEn: 'Dreamless',                         cost: 4, sets: [S.HAVOC_ECLIPSE]                         },
  { id: 'jue',                    name: '角',             nameEn: 'Jué',                                  cost: 4, sets: [S.CELESTIAL_LIGHT]                       },
  { id: 'fleurdelys',             name: 'フルールドリス',         nameEn: 'Reminiscence: Fleurdelys',          cost: 4, sets: [S.SIERRA_GALE, S.FLAMING_CLAW]           },
  { id: 'leviathan',              name: '鳴式・レビヤタン',       nameEn: 'Reminiscence: Threnodian-Leviathan',cost: 4, sets: [S.HAVOC_ECLIPSE, S.THREAD_OF_FATE]       },
  { id: 'sigillum',               name: 'シギルム',               nameEn: 'Sigillum',                          cost: 4, sets: [S.MOLTEN_RIFT, S.ASTRO_LORD]             },
  { id: 'denia',                  name: '響き渡る共鳴・ダーニャ', nameEn: 'Reminiscence: Denia',               cost: 4, sets: [S.MOLTEN_RIFT, S.PATINA_FOAM]            },
  { id: 'voidborne_construct',    name: '鳴式・虚構神機',         nameEn: 'Reminiscence: Voidborne Construct', cost: 4, sets: [S.FREEZING_FROST, S.SNOWY_SILENCE]       },
  { id: 'hecate',                 name: 'ヘカテー',               nameEn: 'Hecate',                            cost: 4, sets: [S.HAVOC_ECLIPSE, S.MIDNIGHT_VEIL]        },
  { id: 'feilian_beringal',       name: '飛廉の大猿',             nameEn: 'Feilian Beringal',                  cost: 4, sets: [S.SIERRA_GALE]                           },
  { id: 'impermanence_heron',     name: '無情のサギ',             nameEn: 'Impermanence Heron',                cost: 4, sets: [S.MOONLIT_CLOUDS]                        },
  { id: 'mourning_aix',           name: '哀切の凶鳥',             nameEn: 'Mourning Aix',                      cost: 4, sets: [S.CELESTIAL_LIGHT]                       },
  { id: 'crownless',              name: '無冠者',                  nameEn: 'Crownless',                         cost: 4, sets: [S.HAVOC_ECLIPSE]                         },
  { id: 'dragon_of_dirge',        name: '嘆きのドレイク',         nameEn: 'Dragon of Dirge',                   cost: 4, sets: [S.MOLTEN_RIFT]                           },
  { id: 'lampylumen_myriad',      name: '輝き蛍の軍勢',           nameEn: 'Lampylumen Myriad',                 cost: 4, sets: [S.FREEZING_FROST]                        },
  { id: 'mech_abomination',       name: '機械アボミネーション',   nameEn: 'Mech Abomination',                  cost: 4, sets: [S.VOID_THUNDER]                          },
  { id: 'tempest_mephis',         name: '雷刹のウロコ',           nameEn: 'Tempest Mephis',                    cost: 4, sets: [S.VOID_THUNDER]                          },
  { id: 'thundering_mephis',      name: '雲閃のウロコ',           nameEn: 'Thundering Mephis',                 cost: 4, sets: [S.VOID_THUNDER]                          },
  { id: 'inferno_rider',          name: '燎原の炎騎',             nameEn: 'Inferno Rider',                     cost: 4, sets: [S.MOLTEN_RIFT]                           },
  { id: 'lorelei',                name: 'ローレライ',             nameEn: 'Lorelei',                           cost: 4, sets: [S.HAVOC_ECLIPSE, S.MIDNIGHT_VEIL]        },
  { id: 'sentry_construct',       name: 'ゼノコロッサス',         nameEn: 'Sentry Construct',                  cost: 4, sets: [S.FROSTY_RESOLVE]      },
  { id: 'lioness_of_glory',       name: '誉れのライオネス',       nameEn: 'Lioness of Glory',                  cost: 4, sets: [S.MOLTEN_RIFT, S.FLAMING_CLAW]           },
  { id: 'lady_of_the_sea',        name: '海の娘',                 nameEn: 'Lady of the Sea',                   cost: 4, sets: [S.SIERRA_GALE, S.GUSTS_OF_WELKIN]          },
  { id: 'nameless_explorer',      name: '名もない探索者',         nameEn: 'Nameless Explorer',                 cost: 4, sets: [S.SIERRA_GALE, S.SEMANTIC_WISH]           },
  { id: 'fallacy_of_no_return',   name: 'フェイタルエラー',       nameEn: 'Fallacy of No Return',              cost: 4, sets: [S.CELESTIAL_LIGHT, S.ETERNAL_RADIANCE]   },
  { id: 'fenrico',                name: 'フェンリコ',             nameEn: 'Reminiscence: Fenrico',             cost: 4, sets: [S.SIERRA_GALE, S.GLORIOUS_WIND]          },
  { id: 'hyvatia',                name: 'ハイヴェイシャ',         nameEn: 'Hyvatia',                           cost: 4, sets: [S.CELESTIAL_LIGHT, S.REFLECT_BLAZE]       },
  { id: 'reactor_husk',           name: 'ドライブの機骸',         nameEn: 'Reactor Husk',                      cost: 4, sets: [S.MOLTEN_RIFT, S.INFERNO_SHADOW]         },

  // ── COST 3 ──────────────────────────────────────────────────────────────
  { id: 'cyan_feathered_heron',   name: '青羽サギ',               nameEn: 'Cyan-Feathered Heron',              cost: 3, sets: [S.SIERRA_GALE, S.MOONLIT_CLOUDS]         },
  { id: 'violet_feathered_heron', name: '紫羽サギ',               nameEn: 'Violet-Feathered Heron',            cost: 3, sets: [S.VOID_THUNDER, S.MOONLIT_CLOUDS]         },
  { id: 'viridblaze_saurian',     name: '熔解トカゲ',             nameEn: 'Viridblaze Saurian',                cost: 3, sets: [S.MOLTEN_RIFT]                           },
  { id: 'hoochief',               name: 'ハリケーン熊',           nameEn: 'Hoochief',                          cost: 3, sets: [S.SIERRA_GALE]                           },
  { id: 'spearback',              name: '黒棘熊',                 nameEn: 'Spearback',                         cost: 3, sets: [S.LINGERING_TUNES]                       },
  { id: 'havoc_dreadmane',        name: '闇鬣狼',                 nameEn: 'Havoc Dreadmane',                   cost: 3, sets: [S.HAVOC_ECLIPSE]                         },
  { id: 'carapace',               name: 'いたずら猿',             nameEn: 'Carapace',                          cost: 3, sets: [S.SIERRA_GALE]                           },
  { id: 'glacio_dreadmane',       name: '雪鬣狼',                 nameEn: 'Glacio Dreadmane',                  cost: 3, sets: [S.FREEZING_FROST]                        },
  { id: 'lightcrusher',           name: '光踏獣',                 nameEn: 'Lightcrusher',                      cost: 3, sets: [S.CELESTIAL_LIGHT]                       },
  { id: 'chasm_guardian',         name: 'クラトスクス',           nameEn: 'Chasm Guardian',                    cost: 3, sets: [S.SIERRA_GALE, S.GUSTS_OF_WELKIN]          },
  { id: 'corrosaurus',            name: 'コロサウルス',           nameEn: 'Corrosaurus',                       cost: 3, sets: [S.MOLTEN_RIFT, S.ETHER_RESONANCE]        },
  { id: 'rocksteady_guardian',    name: '恐刃の車',               nameEn: 'Rocksteady Guardian',               cost: 3, sets: [S.SIERRA_GALE]                           },
  { id: 'stonewall_bracer',       name: 'フロートアルマ',         nameEn: 'Stonewall Bracer',                  cost: 3, sets: [S.MOLTEN_RIFT]                           },
  { id: 'chop_chop',              name: 'ビッグベア',             nameEn: 'Chop Chop',                         cost: 3, sets: [S.LINGERING_TUNES]                       },
  { id: 'roseshroom',             name: 'トゲバラタケ',           nameEn: 'Roseshroom',                        cost: 3, sets: [S.HAVOC_ECLIPSE]                         },
  { id: 'tambourinist',           name: '巨岩の闘士',             nameEn: 'Tambourinist',                      cost: 3, sets: [S.LINGERING_TUNES]                       },
  { id: 'flautist',               name: '金鈴の楽手',             nameEn: 'Flautist',                          cost: 3, sets: [S.HAVOC_ECLIPSE]                         },
  { id: 'rage_against_statue',    name: '彫像を再構築する岩拳',   nameEn: 'Rage Against the Statue',           cost: 3, sets: [S.CELESTIAL_LIGHT]                       },
  { id: 'lumiscale_construct',    name: '宣諭の楽手',             nameEn: 'Lumiscale Construct',               cost: 3, sets: [S.VOID_THUNDER, S.MOONLIT_CLOUDS]         },
  { id: 'questless_knight',       name: '冥淵の守り手',           nameEn: 'Questless Knight',                  cost: 3, sets: [S.HAVOC_ECLIPSE]                         },
  { id: 'diurnus_knight',         name: '盤石の守り手',           nameEn: 'Diurnus Knight',                    cost: 3, sets: [S.CELESTIAL_LIGHT, S.MOONLIT_CLOUDS]      },
  { id: 'nocturnus_knight_d',     name: '回歴の騎士',             nameEn: 'Nocturnus Knight (Day)',             cost: 3, sets: [S.VOID_THUNDER]                          },
  { id: 'nocturnus_knight_f',     name: '炎昼の騎士',             nameEn: 'Nocturnus Knight (Flame)',          cost: 3, sets: [S.CELESTIAL_LIGHT]                       },
  { id: 'nocturnus_knight',       name: '闇夜の騎士',             nameEn: 'Nocturnus Knight',                  cost: 3, sets: [S.HAVOC_ECLIPSE]                         },
  { id: 'abyssal_patricius',      name: 'アビサル・パトリシウス', nameEn: 'Abyssal Patricius',                 cost: 3, sets: [S.FREEZING_FROST, S.MOONLIT_CLOUDS]       },
  { id: 'abyssal_gladius',        name: 'アビサル・グラディウス', nameEn: 'Abyssal Gladius',                   cost: 3, sets: [S.FREEZING_FROST]                        },
  { id: 'abyssal_mercator',       name: 'アビサル・メルカトル',   nameEn: 'Abyssal Mercator',                  cost: 3, sets: [S.FREEZING_FROST]                        },
  { id: 'vitreum_dancer',         name: 'ヴィトルムダンサー',     nameEn: 'Vitreum Dancer',                    cost: 3, sets: [S.VOID_THUNDER, S.MOONLIT_CLOUDS]         },
  { id: 'capitaneus',             name: 'カピタネウス',           nameEn: 'Capitaneus',                        cost: 3, sets: [S.CELESTIAL_LIGHT, S.MOONLIT_CLOUDS]      },
  { id: 'pilgrims_shell',         name: '伝道師の空殻',           nameEn: "Pilgrim's Shell",                   cost: 3, sets: [S.SIERRA_GALE]                           },
  { id: 'autopuppet_scout',       name: '巡回のカラクリ',         nameEn: 'Autopuppet Scout',                  cost: 3, sets: [S.FREEZING_FROST]                        },
  { id: 'lumiscale_float',        name: '浮遊鱗機',               nameEn: 'Lumiscale Float',                   cost: 3, sets: [S.FREEZING_FROST]                        },
  { id: 'bipolar_nova_cannon',    name: 'バイポーラ・ノヴァライザー', nameEn: 'Twin Nova: Nebulous Cannon',     cost: 3, sets: [S.CELESTIAL_LIGHT, S.STARLIGHT_RING]     },
  { id: 'bipolar_collapsar',      name: 'バイポーラ・アビスフォール', nameEn: 'Twin Nova: Collapsar Blade',     cost: 3, sets: [S.VOID_THUNDER, S.STARLIGHT_RING]         },
  { id: 'flora_reindeer',         name: 'フローラ・メカレインディア', nameEn: 'Flora Reindeer',                 cost: 3, sets: [S.SIERRA_GALE, S.GUSTS_OF_WELKIN]          },
  { id: 'mining_reindeer',        name: 'マイニング・メカレインディア', nameEn: 'Mining Reindeer',              cost: 3, sets: [S.VOID_THUNDER, S.ETHER_RESONANCE]        },
  { id: 'ironhoof',               name: 'アイアン・フーフ',       nameEn: 'Ironhoof',                          cost: 3, sets: [S.MOLTEN_RIFT, S.INFERNO_SHADOW]         },
  { id: 'spacetrek_explorer',     name: 'スペーストレック重機',   nameEn: 'Spacetrek Explorer',                cost: 3, sets: [S.REJUVENATING_GLOW, S.GLORY_FORGE_CROWN] },
  { id: 'sabercat_reaver',        name: 'リッパーシェード',       nameEn: 'Sabercat Reaver',                   cost: 3, sets: [S.MOLTEN_RIFT, S.PATINA_FOAM]            },
  { id: 'sabercat_prowler',       name: 'プラウラーシェード',     nameEn: 'Sabercat Prowler',                  cost: 3, sets: [S.HAVOC_ECLIPSE, S.THREAD_OF_FATE]        },
  { id: 'frostbite_coleoid',      name: '霜纏いの寄生甲',         nameEn: 'Frostbite Coleoid',                 cost: 3, sets: [S.FREEZING_FROST, S.SNOWY_SILENCE]        },
  { id: 'windlash_coleoid',       name: '風纏いの寄生甲',         nameEn: 'Windlash Coleoid',                  cost: 3, sets: [S.SIERRA_GALE, S.MONTAGE_SILHOUETTE]      },
  { id: 'kronablight',            name: 'クロナファルコン',       nameEn: 'Kronablight',                       cost: 3, sets: [S.SIERRA_GALE]                           },
  { id: 'kronaclaw',              name: 'メカファルコン',         nameEn: 'Reminiscence: Kronaclaw',           cost: 3, sets: [S.VOID_THUNDER]                          },
  { id: 'glommoth',               name: 'グローモス',             nameEn: 'Glommoth',                          cost: 3, sets: [S.FREEZING_FROST]                        },
  { id: 'voidwing_moth',          name: 'ファントムモス',         nameEn: 'Voidwing Moth',                     cost: 3, sets: [S.CELESTIAL_LIGHT]                       },

  // ── COST 1 ──────────────────────────────────────────────────────────────
  { id: 'whiff_whaff',            name: 'フシュシュ',             nameEn: 'Whiff Whaff',                       cost: 1, sets: [S.SIERRA_GALE, S.MOONLIT_CLOUDS]         },
  { id: 'tick_tack',              name: 'カチャチャ',             nameEn: 'Tick Tack',                         cost: 1, sets: [S.MOLTEN_RIFT, S.LINGERING_TUNES]        },
  { id: 'snip_snap',              name: 'アツツ',                 nameEn: 'Snip Snap',                         cost: 1, sets: [S.CELESTIAL_LIGHT, S.LINGERING_TUNES]    },
  { id: 'zig_zag',                name: 'ウカカ',                 nameEn: 'Zig Zag',                           cost: 1, sets: [S.HAVOC_ECLIPSE, S.LINGERING_TUNES]      },
  { id: 'clang_bang',             name: 'チリン',                 nameEn: 'Clang Bang',                        cost: 1, sets: [S.FREEZING_FROST, S.MOONLIT_CLOUDS]       },
  { id: 'gulpuff',                name: 'グルッポ',               nameEn: 'Gulpuff',                           cost: 1, sets: [S.FREEZING_FROST, S.LINGERING_TUNES]     },
  { id: 'hooscamp',               name: 'ジュルッポ',             nameEn: 'Hooscamp',                          cost: 1, sets: [S.SIERRA_GALE, S.LINGERING_TUNES]        },
  { id: 'diamondclaw',            name: 'モグロン',               nameEn: 'Diamondclaw',                       cost: 1, sets: [S.LINGERING_TUNES]                       },
  { id: 'baby_viridblaze_saurian',name: '熔解トカゲ（幼体）',     nameEn: 'Baby Viridblaze Saurian',           cost: 1, sets: [S.REJUVENATING_GLOW, S.LINGERING_TUNES]  },
  { id: 'sabyr_boar',             name: '砕牙イノシシ',           nameEn: 'Sabyr Boar',                        cost: 1, sets: [S.LINGERING_TUNES]                       },
  { id: 'fusion_dreadmane',       name: '火鬣狼',                 nameEn: 'Fusion Dreadmane',                  cost: 1, sets: [S.MOLTEN_RIFT]                           },
  { id: 'excarat',                name: '結晶化サソリ',           nameEn: 'Excarat',                           cost: 1, sets: [S.LINGERING_TUNES]                       },
  { id: 'cruisewing',             name: '遊弋蝶',                 nameEn: 'Cruisewing',                        cost: 1, sets: [S.REJUVENATING_GLOW, S.MOONLIT_CLOUDS]    },
  { id: 'hoartoise',              name: '寒霜亀',                 nameEn: 'Hoartoise',                         cost: 1, sets: [S.REJUVENATING_GLOW, S.MOONLIT_CLOUDS]    },
  { id: 'chirpuff',               name: '猿の幼体',               nameEn: 'Chirpuff',                          cost: 1, sets: [S.SIERRA_GALE]                           },
  { id: 'lava_larva',             name: '溶岩虫',                 nameEn: 'Lava Larva',                        cost: 1, sets: [S.MOLTEN_RIFT]                           },
  { id: 'dwarf_cassowary',        name: '地駝鳥',                 nameEn: 'Dwarf Cassowary',                   cost: 1, sets: [S.LINGERING_TUNES]                       },
  { id: 'aero_predator',          name: '風鬣狼',                 nameEn: 'Aero Predator',                     cost: 1, sets: [S.REJUVENATING_GLOW]                     },
  { id: 'electro_predator',       name: '雷鬣狼',                 nameEn: 'Electro Predator',                  cost: 1, sets: [S.VOID_THUNDER]                          },
  { id: 'glacio_predator',        name: '霜鬣狼',                 nameEn: 'Glacio Predator',                   cost: 1, sets: [S.FREEZING_FROST]                        },
  { id: 'glacio_prism',           name: '凝縮のプリズム',         nameEn: 'Glacio Prism',                      cost: 1, sets: [S.FREEZING_FROST, S.MOONLIT_CLOUDS]       },
  { id: 'fusion_prism',           name: '焦熱のプリズム',         nameEn: 'Fusion Prism',                      cost: 1, sets: [S.MOLTEN_RIFT, S.MOONLIT_CLOUDS]          },
  { id: 'havoc_prism',            name: '消滅のプリズム',         nameEn: 'Havoc Prism',                       cost: 1, sets: [S.HAVOC_ECLIPSE, S.MOONLIT_CLOUDS]        },
  { id: 'spectro_prism',          name: '回折のプリズム',         nameEn: 'Spectro Prism',                     cost: 1, sets: [S.CELESTIAL_LIGHT, S.MOONLIT_CLOUDS]      },
  { id: 'aero_prism',             name: '気動のプリズム',         nameEn: 'Aero Prism',                        cost: 1, sets: [S.SIERRA_GALE, S.MOONLIT_CLOUDS]          },
  { id: 'chop_chop_head',         name: 'フロートアルマ・ヘッド', nameEn: 'Chop Chop: Headless',               cost: 1, sets: [S.MOLTEN_RIFT]                           },
  { id: 'chop_chop_left',         name: 'フロートアルマ・レフト', nameEn: 'Chop Chop: Leftless',               cost: 1, sets: [S.CELESTIAL_LIGHT]                       },
  { id: 'chop_chop_right',        name: 'フロートアルマ・ライト', nameEn: 'Chop Chop: Rightless',              cost: 1, sets: [S.HAVOC_ECLIPSE]                         },
  { id: 'fae_ignis',              name: 'フェイイグニス',         nameEn: 'Fae Ignis',                         cost: 1, sets: [S.HAVOC_ECLIPSE]                         },
  { id: 'nimbus_wraith',          name: '雲の妖精',               nameEn: 'Nimbus Wraith',                     cost: 1, sets: [S.REJUVENATING_GLOW]                     },
  { id: 'hocus_pocus',            name: 'ミスター・マギア',       nameEn: 'Hocus Pocus',                       cost: 1, sets: [S.HAVOC_ECLIPSE]                         },
  { id: 'lottie_lost',            name: 'ミス・ロンリー',         nameEn: 'Lottie Lost',                       cost: 1, sets: [S.CELESTIAL_LIGHT]                       },
  { id: 'diggy_duggy',            name: 'サクサクベア',           nameEn: 'Diggy Duggy',                       cost: 1, sets: [S.LINGERING_TUNES]                       },
  { id: 'chest_mimic',            name: '秘蔵ミミック',           nameEn: 'Chest Mimic',                       cost: 1, sets: [S.CELESTIAL_LIGHT]                       },
  { id: 'baby_roseshroom',        name: 'トゲバラタケ（幼体）',   nameEn: 'Baby Roseshroom',                   cost: 1, sets: [S.HAVOC_ECLIPSE]                         },
  { id: 'vanguard_junrock',       name: '先兵岩塊',               nameEn: 'Vanguard Junrock',                  cost: 1, sets: [S.LINGERING_TUNES]                       },
  { id: 'fission_junrock',        name: '壊れかけ岩塊',           nameEn: 'Fission Junrock',                   cost: 1, sets: [S.REJUVENATING_GLOW]                     },
  { id: 'golden_junrock',         name: '愚者のゴールドの岩塊',   nameEn: 'Golden Junrock',                    cost: 1, sets: [S.CELESTIAL_LIGHT]                       },
  { id: 'calcified_junrock',      name: 'ミカーレの岩塊',         nameEn: 'Calcified Junrock',                 cost: 1, sets: [S.REJUVENATING_GLOW]                     },
  { id: 'voltscourge_stalker',    name: '春雷の狩人',             nameEn: 'Voltscourge Stalker',               cost: 1, sets: [S.VOID_THUNDER]                          },
  { id: 'frostscourge_stalker',   name: '破霜の狩人',             nameEn: 'Frostscourge Stalker',              cost: 1, sets: [S.FREEZING_FROST]                        },
  { id: 'galescourge_stalker',    name: '徘徊の狩人',             nameEn: 'Galescourge Stalker',               cost: 1, sets: [S.SIERRA_GALE]                           },
  { id: 'havoc_warrior',          name: '慟哭の戦士',             nameEn: 'Havoc Warrior',                     cost: 1, sets: [S.MOLTEN_RIFT]                           },
  { id: 'fusion_warrior',         name: '審判の戦士',             nameEn: 'Fusion Warrior',                    cost: 1, sets: [S.HAVOC_ECLIPSE]                         },
  { id: 'traffic_illuminator',    name: '信号機モドキ',           nameEn: 'Traffic Illuminator',               cost: 1, sets: [S.LINGERING_TUNES]                       },
  { id: 'la_guardia',             name: 'ガルディア',             nameEn: 'La Guardia',                        cost: 1, sets: [S.LINGERING_TUNES]                       },
  { id: 'sagittario',             name: 'サジタリオ',             nameEn: 'Sagittario',                        cost: 1, sets: [S.CELESTIAL_LIGHT]                       },
  { id: 'sacerdos',               name: 'サケルドス',             nameEn: 'Sacerdos',                          cost: 1, sets: [S.SIERRA_GALE]                           },
  { id: 'devotees_flesh',         name: '狂信者の血肉',           nameEn: "Devotee's Flesh",                   cost: 1, sets: [S.SIERRA_GALE]                           },
  { id: 'aero_drake',             name: 'ドレイクの幼体・気動',   nameEn: 'Aero Drake',                        cost: 1, sets: [S.SIERRA_GALE]                           },
  { id: 'electro_drake',          name: 'ドレイクの幼体・電導',   nameEn: 'Electro Drake',                     cost: 1, sets: [S.VOID_THUNDER]                          },
  { id: 'glacio_drake',           name: 'ドレイクの幼体・凝縮',   nameEn: 'Glacio Drake',                      cost: 1, sets: [S.FREEZING_FROST]                        },
  { id: 'fusion_drake',           name: 'ドレイクの幼体・焦熱',   nameEn: 'Fusion Drake',                      cost: 1, sets: [S.MOLTEN_RIFT]                           },
  { id: 'spectro_drake',          name: 'ドレイクの幼体・回折',   nameEn: 'Spectro Drake',                     cost: 1, sets: [S.CELESTIAL_LIGHT]                       },
  { id: 'havoc_drake',            name: 'ドレイクの幼体・消滅',   nameEn: 'Havoc Drake',                       cost: 1, sets: [S.HAVOC_ECLIPSE]                         },
  { id: 'pollen_bee_a',           name: 'カフンクマバチ',         nameEn: 'Pollinator Bee A',                  cost: 1, sets: [S.SIERRA_GALE, S.STARLIGHT_RING]         },
  { id: 'pollen_bee_b',           name: 'サイクツクマバチ',       nameEn: 'Pollinator Bee B',                  cost: 1, sets: [S.HAVOC_ECLIPSE, S.ETHER_RESONANCE]      },
  { id: 'geospider_s4',           name: 'イワグモS4型',           nameEn: 'Geospider S4',                      cost: 1, sets: [S.CELESTIAL_LIGHT, S.INFERNO_SHADOW]     },
  { id: 'tremor_warrior',         name: '戦慄の戦士',             nameEn: 'Tremor Warrior',                    cost: 1, sets: [S.VOID_THUNDER, S.PATINA_FOAM]           },
  { id: 'zip_zap',                name: 'ビリリ',                 nameEn: 'Zip Zap',                           cost: 1, sets: [S.VOID_THUNDER, S.SEMANTIC_WISH]          },
  { id: 'iceglint_dancer',        name: 'アイスグリントダンサー', nameEn: 'Iceglint Dancer',                   cost: 1, sets: [S.FREEZING_FROST, S.SNOWY_SILENCE]        },
  { id: 'shadow_stepper',         name: 'シャドウステッパー',     nameEn: 'Shadow Stepper',                    cost: 1, sets: [S.HAVOC_ECLIPSE, S.MONTAGE_SILHOUETTE]   },
];

// ── ヘルパー ─────────────────────────────────────────────────────────────
export const ECHOES_BY_COST: Record<EchoCost, EchoInfo[]> = {
  4: ECHOES.filter((e) => e.cost === 4),
  3: ECHOES.filter((e) => e.cost === 3),
  1: ECHOES.filter((e) => e.cost === 1),
};

export const DEFAULT_ECHO_ID: Record<EchoCost, string> = {
  4: 'thundering_mephis',
  3: 'violet_feathered_heron',
  1: 'vanguard_junrock',
};
