import type { SubstatKey } from '@/types/echo';
import type { RoleTemplate } from '@/data/roleTemplates';
import type { WeaponClass } from '@/types/weapon';

export type { RoleTemplate };

export interface SubstatBuild {
  key: SubstatKey;
}

export interface MainstatCategory {
  recommended: string[];
  acceptable: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
//  運用バリアント（ロールバリアント）
//  同一キャラでもパーティ編成によりメイン運用/サブ運用/サポート運用が変わり、
//  それぞれでハーモニーセット・メインステ・サブステの理想が異なる。
// ═══════════════════════════════════════════════════════════════════════════
export type OperatingRole = 'main' | 'sub' | 'support' | 'healer';

// キャラのダメージがどの攻撃タイプに何割配分されるか（合計 ≈ 1.0）
// 重み導出（deriveSubstatWeights）でタイプ別ダメージ%サブステの価値を決めるのに使う
export interface DamageTypeShares {
  basic: number;   // 通常攻撃
  heavy: number;   // 重撃
  skill: number;   // 共鳴スキル
  lib:   number;   // 共鳴解放（凸/イントロ等の細分はしない）
}

export interface DamageProfile {
  typeShares: DamageTypeShares;
  // キット自体が常時付与する攻撃力%バフの合計（サブステ攻撃%の希釈計算に使用）
  selfAtkBuffPercent: number;
  // 想定到達クリ率・クリダメ（この運用でのビルド目標値。重み導出のベースライン）
  // baselineCritDmg はゲーム内表示値をそのまま指定する（例 2.30 = 表示230%。
  // 基礎150%込みの値であり、「非クリ超過分」への変換は重み導出側で行う）
  baselineCritRate: number;
  baselineCritDmg: number;
}

export interface RoleVariant {
  id: string;                 // キャラ内で一意（例: 'main' / 'sub'）
  role: OperatingRole;
  label: string;               // UI表示名（例: 'メインアタッカー運用'）

  harmonySets: { recommended: string[]; acceptable: string[] };
  mainstat: {
    cost4: MainstatCategory;
    cost3: MainstatCategory;
    cost1: MainstatCategory;
  };

  // 目標共鳴効率（例 1.2 = 120%）。共鳴効率は閾値型のため重み導出では
  // 連続値でなく erRequirement からの静的重みテーブルを介して評価する。
  erRequirement: number;

  // ダメージ系運用（DPS/SubDPS）のみ。ヒーラー/純サポート運用では省略。
  //
  // 既知の制限: damageProfile が無い場合、deriveSubstatWeights は
  // energyRegen 以外の全サブステ重みを 0 にする（= ヒーラー/純サポートの
  // HP%・防御力%等が現状スコアに反映されない）。回復量スケーリングは
  // ダメージ式と別の計算体系が必要なため、healingProfile 相当の仕組みは
  // 未実装。ヒーラー系キャラに variants を設定する場合は、当面は
  // damageProfile を省略した従来カテゴリ採点（substats.recommended 等）の
  // ままにしておくこと。
  damageProfile?: DamageProfile;
}

// ═══════════════════════════════════════════════════════════════════════════
//  キャラクター基礎データ（v2 拡張フィールド）
//  完全なデータが揃うまでは全て optional。未設定のキャラは従来の
//  カテゴリベース採点（substats.recommended/preferred/acceptable）にフォールバックする。
// ═══════════════════════════════════════════════════════════════════════════
export interface CharacterBaseStats90 {
  atk?: number;
  hp?: number;
  def?: number;
}

export interface CharacterBuild {
  id: string;
  name: string;
  nameEn: string;
  element: string;
  weapon: string;
  role: string;
  roleTemplate?: RoleTemplate;

  substats: {
    recommended: SubstatBuild[];
    preferred:   SubstatBuild[];
    acceptable?: SubstatBuild[];
  };

  mainstat: {
    cost4: MainstatCategory;
    cost3: MainstatCategory;
    cost1: MainstatCategory;
  };

  harmonySets: {
    recommended: string[];
    acceptable:  string[];
  };

  // ── v2: 運用バリアント方式（データが揃ったキャラのみ設定） ──────────────
  weaponClass?: WeaponClass;
  scalingStat?: 'atk' | 'hp' | 'def';
  baseStats90?: CharacterBaseStats90;
  motifWeaponId?: string;      // src/data/weapons.ts の WeaponData.id
  variants?: RoleVariant[];
}
