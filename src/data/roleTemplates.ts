import type { SubstatKey, SubstatCategory } from '@/types/echo';

export type RoleTemplate = 'DPS' | 'SubDPS' | 'Healer';

// ロール別サブステデフォルト分類
// キャラの explicit recommended/preferred/acceptable に含まれないサブステへのフォールバック
export const ROLE_TEMPLATE_CATEGORIES: Record<RoleTemplate, Record<SubstatKey, SubstatCategory>> = {

  // ── DPS（メインアタッカー） ─────────────────────────────────────────────────
  // 基本4推奨 + キャラ固有ダメージ系1種を recommended_extra で追加する想定
  // ダメージ系4種はどれもゼロではないため acceptable に
  DPS: {
    critRate:          'recommended',
    critDmg:           'recommended',
    energyRegen:       'recommended',
    atkPercent:        'recommended',
    atkFlat:           'preferred',
    basicAttackDmg:    'acceptable',
    heavyAttackDmg:    'acceptable',
    resonanceSkillDmg: 'acceptable',
    resonanceLibDmg:   'acceptable',
    hpPercent:         'unnecessary',
    defPercent:        'unnecessary',
    hpFlat:            'unnecessary',
    defFlat:           'unnecessary',
  },

  // ── SubDPS（サブアタッカー・支援火力） ────────────────────────────────────
  // DPS と同じ構造。energyRegen は shared recommended に含まれる
  SubDPS: {
    critRate:          'recommended',
    critDmg:           'recommended',
    energyRegen:       'recommended',
    atkPercent:        'recommended',
    atkFlat:           'preferred',
    basicAttackDmg:    'acceptable',
    heavyAttackDmg:    'acceptable',
    resonanceSkillDmg: 'acceptable',
    resonanceLibDmg:   'acceptable',
    hpPercent:         'unnecessary',
    defPercent:        'unnecessary',
    hpFlat:            'unnecessary',
    defFlat:           'unnecessary',
  },

  // ── Healer（回復特化） ────────────────────────────────────────────────────
  // energyRegen のみ推奨。atkPercent/hpPercent は回復量に寄与するため優先
  // critRate/critDmg は一部スキルに有効なため妥協として残す
  Healer: {
    energyRegen:       'recommended',
    atkPercent:        'preferred',
    hpPercent:         'preferred',
    critRate:          'acceptable',
    critDmg:           'acceptable',
    atkFlat:           'acceptable',
    basicAttackDmg:    'unnecessary',
    heavyAttackDmg:    'unnecessary',
    resonanceSkillDmg: 'unnecessary',
    resonanceLibDmg:   'unnecessary',
    defPercent:        'unnecessary',
    hpFlat:            'unnecessary',
    defFlat:           'unnecessary',
  },
};
