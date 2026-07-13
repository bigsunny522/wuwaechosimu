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
//  回復/シールド量の重み導出用プロファイル（ヒーラー・純サポート運用）
//
//  HEAL ∝ MainStat_total(scalingStat) × (1 + %scalingStat_total)
//
//  ダメージ式と根本的に異なる前提がある：ダメージは「多いほど常に良い」
//  無制限の線形価値だが、回復量は味方の被ダメージを上回った時点で
//  それ以上は「オーバーヒール」となり実質価値が急減する、頭打ちのある指標。
//  そのため、%scalingStat/実数の重みはDPSと同じ希釈式
//  （scalingPctFlatWeights）を流用しつつ、assumedExistingScalingPercent に
//  「回復が頭打ちに近づいた状態」を表す高めの値を仮定することで、
//  回復系%/実数サブステの重みをDPSより相対的に低く抑える。
//
//  実ダメージも出すハイブリッドキット（例: ショアキーパーのイントロスキル）は
//  damageContributionShareのような曖昧な混合比率は使わない。RoleVariantに
//  damageProfile を healProfile と併記すれば、crit・攻撃タイプ別ダメージ%の
//  重みは通常のダメージ式からそのまま独立して加算される（イントロスキルの
//  実ダメージはクリの影響を受ける「本物のダメージ」であり、割引く理由がないため）。
//
//  ER自体がチーム全体バフに直接変換されるキャラ（モーニエ・ショアキーパー等）は
//  erConversions を設定する。ゲーム内で明言されている変換式をそのまま
//  偏微分的な重みに変換する（例: モーニエ「ER100%超過分、1%につきクリダメ+0.2%」、
//  ショアキーパー「ER1%につきクリ率+0.05%・クリダメ+0.1%」）。これは推測の
//  倍率（旧erWeightMultiplier）ではなく、ビルドガイドに明記された実際の
//  変換式に基づく値。
// ═══════════════════════════════════════════════════════════════════════════

// ERがチーム全体バフに直接変換されるキャラ用の変換式。
// buffGain%(ER%) = ratePerErPercent × max(0, ER% − baselineErPercent)
// capErPercent到達で頭打ちになるが、重み計算自体は基準点(erRequirement)での
// 単純な傾きとして扱う（DPSのcrit重み等と同じ「1点での偏微分」という簡略化）。
export interface ErConversion {
  // 超過ER%1につき増加するバフ%
  ratePerErPercent: number;
  // 変換の起点となるER%（0=ER実値そのものから変換、100=基礎100%からの超過分のみ）
  baselineErPercent: number;
  // 変換が頭打ちになるER%（ドキュメント用途）
  capErPercent: number;
}

export interface HealProfile {
  // 評価対象のscalingStat%以外に、既にビルドで積まれていると仮定する
  // 同スケーリングステ%量の合計。回復の頭打ち特性を反映し、DPSの
  // ASSUMED_EXISTING_SCALING_PCT(0.45)よりも高めの値を設定するのが通例。
  assumedExistingScalingPercent: number;
  // ERがチーム全体バフに直接変換されるキャラのみ設定する（複数バフがあれば複数指定）
  erConversions?: ErConversion[];
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
  // 連続値でなく erRequirement からの静的重みテーブルを介して評価する
  // （ERがチーム全体バフに直接変換されるキャラは healProfile.erConversions
  // で追加の重みが加算される）。
  erRequirement: number;

  // ダメージ系運用（DPS/SubDPS、通常アタッカーおよびハイブリッドキャラの
  // 実ダメージ成分）はこちらを設定する。crit・攻撃タイプ別ダメージ%の
  // 重みに反映される。
  damageProfile?: DamageProfile;

  // ヒーラー/純サポート運用の回復/防御スケーリングステはこちらを設定する。
  // damageProfileと併記可能（例: 回復しつつイントロスキルで実ダメージも
  // 出すハイブリッドキャラ）。その場合、%scalingStat/実数の重みはこちら、
  // crit/攻撃タイプ別ダメージ%の重みはdamageProfileから、それぞれ独立して
  // 計算され合算される。
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
