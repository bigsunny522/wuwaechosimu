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

// ═══════════════════════════════════════════════════════════════════════════
//  回復/シールド量の偏微分に基づく重み導出用プロファイル（ヒーラー・純サポート運用）
//
//  HEAL ∝ MainStat_total(scalingStat) × (1 + %scalingStat_total)
//
//  ダメージ式と違い、回復量にはクリティカルも攻撃タイプ別ダメージ%も
//  基本的に影響しない（このゲームでは回復はクリットしない）。そのため
//  DamageProfile とは別の軽量なプロファイルとして扱う。
//  実ダメージも出すハイブリッドキット（例: ショアキーパーのイントロスキル）は
//  damageContributionShare（0〜1）と damageProfile を併記することで、
//  crit・攻撃タイプ別ダメージ%の重みをその割合だけ加算する。
// ═══════════════════════════════════════════════════════════════════════════
export interface HealProfile {
  // 評価対象のscalingStat%以外に、既にビルドで積まれていると仮定する
  // 同スケーリングステ%量の合計（DamageProfileのASSUMED_EXISTING_SCALING_PCT
  // 相当。ハーモニーセットのバフ等を含む）
  assumedExistingScalingPercent: number;
  // 実ダメージ要素への寄与割合（0=純粋回復、1に近いほど通常DPSキャラ相当）
  damageContributionShare: number;
  // damageContributionShare > 0 の場合のみ使用
  damageProfile?: DamageProfile;
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
  //
  // 既知の制限: ショアキーパーのように共鳴効率の値そのものが味方への
  // クリバフ強度に直結するキャラでも、他キャラと同じ閾値テーブルで
  // 評価している（継続値としての追加価値は未反映）。
  erRequirement: number;

  // ダメージ系運用（DPS/SubDPS）はこちらを設定する。
  damageProfile?: DamageProfile;

  // ヒーラー/純サポート運用はこちらを設定する（damageProfileとは排他）。
  healProfile?: HealProfile;
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
