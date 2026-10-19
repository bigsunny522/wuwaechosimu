// キャラ別ページ（試作3キャラ）用のデータ組み立て。
// docs/spec-character-pages.md の「変更対象」のひとつ。
// データと採点ロジック（characters.ts / rankThresholds.ts / weaponScoring.ts）は
// 読むだけにする。

import { CHARACTER_MAP } from '@/data/characters';
import { getRankThresholds, type RankThresholds } from '@/data/rankThresholds';
import { deriveSubstatWeights } from '@/lib/weaponScoring';
import { getMotifWeapon } from '@/data/weapons';
import type { CharacterBuild } from '@/types/character';
import type { SubstatKey } from '@/types/echo';
import type { Locale } from '@/lib/locale-utils';
import { SITE_URL } from '@/lib/seo';

// 試作としてページを作るキャラクターID。generateStaticParams・sitemap・
// /chardb のカードリンクはこの一覧を唯一の根拠にする。
export const CHARACTER_PAGE_IDS = ['hsin', 'jingran', 'phoebe'] as const;

export type CharacterPageId = (typeof CHARACTER_PAGE_IDS)[number];

export function isCharacterPageId(id: string): id is CharacterPageId {
  return (CHARACTER_PAGE_IDS as readonly string[]).includes(id);
}

// scorer.ts の weightToCategory と同じ境界（0.85 / 0.5 / 0.15）。
// weightToCategory は export されていないため、境界値をここに写し取る。
// 出どころ: src/lib/scorer.ts の weightToCategory。
const WEIGHT_RECOMMENDED = 0.85;
const WEIGHT_PREFERRED = 0.5;
const WEIGHT_ACCEPTABLE = 0.15;

export type SubstatWeightCategory = 'recommended' | 'preferred' | 'acceptable';

export interface SubstatWeightRow {
  key: SubstatKey;
  /** 最大値を100とした相対値（1ロール最大値あたりの相対的な価値。スコアの点数ではない） */
  relative: number;
  /** 区分ラベル（推奨 / 優先 / 可）。表に出すのはラベルが付く行だけなので常に値が入る */
  category: SubstatWeightCategory;
}

export interface CharacterVariantPageData {
  id: string;
  label: string;
  thresholds: RankThresholds;
  /** totalMainStat が null（データ不足）の場合は null。null のときはサブステの価値と要点カード1行目を出さない */
  substatWeights: SubstatWeightRow[] | null;
}

export interface CharacterPageData {
  id: string;
  name: string;
  nameEn: string;
  element: string;
  weapon: string;
  role: string;
  variants: CharacterVariantPageData[];
  harmonySets: { recommended: string[]; acceptable: string[] };
  mainstat: CharacterBuild['mainstat'];
}

function buildSubstatWeights(
  build: CharacterBuild,
  variant: NonNullable<CharacterBuild['variants']>[number],
): SubstatWeightRow[] | null {
  const weapon = build.motifWeaponId ? getMotifWeapon(build.motifWeaponId) : undefined;
  const { weights, totalMainStat } = deriveSubstatWeights(build, variant, weapon);
  if (totalMainStat == null) return null;

  const maxWeight = Math.max(...Object.values(weights));
  if (maxWeight <= 0) return [];

  const rows: SubstatWeightRow[] = [];
  for (const key of Object.keys(weights) as SubstatKey[]) {
    const raw = weights[key];
    if (raw <= 0) continue;
    const rel = raw / maxWeight;
    // 表に出すのはラベルが付く行（相対値が15以上）だけ。それ未満の行は出さない
    let category: SubstatWeightCategory;
    if (rel >= WEIGHT_RECOMMENDED) category = 'recommended';
    else if (rel >= WEIGHT_PREFERRED) category = 'preferred';
    else if (rel >= WEIGHT_ACCEPTABLE) category = 'acceptable';
    else continue;
    rows.push({ key, relative: Math.round(rel * 100), category });
  }
  rows.sort((a, b) => b.relative - a.relative);
  return rows;
}

/** 試作キャラのページ用データ。対象外の id は null を返す（呼び出し側は notFound する） */
export function getCharacterPageData(id: string): CharacterPageData | null {
  if (!isCharacterPageId(id)) return null;
  const build = CHARACTER_MAP[id];
  if (!build || !build.variants || build.variants.length === 0) return null;

  const variants: CharacterVariantPageData[] = [];
  for (const variant of build.variants) {
    const thresholds = getRankThresholds(id, variant.id);
    // 閾値が無い運用は妥協ライン表・分布図が出せないためページ全体を出さない
    if (!thresholds) return null;
    variants.push({
      id: variant.id,
      label: variant.label,
      thresholds,
      substatWeights: buildSubstatWeights(build, variant),
    });
  }

  return {
    id,
    name: build.name,
    nameEn: build.nameEn,
    element: build.element,
    weapon: build.weapon,
    role: build.role,
    variants,
    harmonySets: build.harmonySets,
    mainstat: build.mainstat,
  };
}

/** メタデータ用コピー。運用が複数あるキャラは variants[0] の数値を使う */
export function getCharacterPageMetaCopy(id: CharacterPageId): {
  ja: { title: string; description: string };
  en: { title: string; description: string };
} {
  const build = CHARACTER_MAP[id];
  const firstVariant = build?.variants?.[0];
  const th = firstVariant ? getRankThresholds(id, firstVariant.id) : undefined;
  const s = th?.s ?? 0;
  const sPlus = th?.sPlus ?? 0;
  const name = build?.name ?? '';
  const nameEn = build?.nameEn ?? '';
  return {
    ja: {
      title: `${name}の音骸スコア目安・妥協ライン | 鳴潮 (Wuthering Waves)`,
      description:
        `鳴潮の${name}の音骸は${s}点で上位5%、${sPlus}点で上位1%。50万回のシミュレーションから出したスコア分布・妥協ライン・サブステの価値を、キャラ専用の判定ツールと一緒に確認できます。`,
    },
    en: {
      title: `${nameEn} Echo Score Benchmarks & When to Stop Farming | Wuthering Waves`,
      description:
        `${nameEn} echoes: ${s}+ pts is top 5%, ${sPlus}+ pts is top 1%. Score distribution from 500,000 simulated drops, stop-farming thresholds, and substat values — with a character-specific echo checker.`,
    },
  };
}

// seo.ts の buildBreadcrumbJsonLd は2階層（トップ > このページ）しか出せないので、
// キャラ別ページ用に3階層版（ホーム > キャラ別ビルドデータ > {name}）を作る。
// seo.ts は触らない。
const BREADCRUMB_HOME_NAME: Record<Locale, string> = {
  ja: '音骸シミュレーター',
  en: 'Echo Simulator',
};

const BREADCRUMB_LIST_NAME: Record<Locale, string> = {
  ja: 'キャラクター別 音骸ビルドデータ一覧',
  en: 'Echo Build Data by Character',
};

export function buildCharacterBreadcrumbJsonLd(id: CharacterPageId, locale: Locale) {
  const data = getCharacterPageData(id);
  const pageName = locale === 'en' ? (data?.nameEn ?? '') : (data?.name ?? '');
  const homeUrl = locale === 'en' ? `${SITE_URL}?lang=en` : SITE_URL;
  const listUrl = locale === 'en' ? `${SITE_URL}/chardb?lang=en` : `${SITE_URL}/chardb`;
  const pageUrl = locale === 'en' ? `${SITE_URL}/chardb/${id}?lang=en` : `${SITE_URL}/chardb/${id}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: BREADCRUMB_HOME_NAME[locale],
        item: homeUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: BREADCRUMB_LIST_NAME[locale],
        item: listUrl,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: pageName,
        item: pageUrl,
      },
    ],
  };
}
