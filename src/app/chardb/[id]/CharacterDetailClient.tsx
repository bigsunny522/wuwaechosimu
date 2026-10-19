'use client';

import Link from 'next/link';
import { useLocale, withLang, type Locale } from '@/lib/locale';
import { getHarmonyBadgeColor, HARMONY_SETS_EN } from '@/data/echoes';
import { SUBSTAT_MAP } from '@/data/substats';
import { SUBSTAT_LABEL_EN, MAINSTAT_LABEL_EN } from '@/data/translations';
import { ELEMENT_EN, WEAPON_EN, ROLE_EN, localizeLabel } from '@/data/charLabels';
import type { CharacterPageData } from '@/lib/characterPages';
import type { SubstatKey } from '@/types/echo';
import CharDistributionChart from '@/components/CharDistributionChart';
import AdBanner from '@/components/AdBanner';
import NativeBanner from '@/components/NativeBanner';

const ACCENT = '#0275fd';

const MAINSTAT_JA: Record<string, string> = {
  critRate:     'クリティカル率',
  critDmg:      'クリティカルダメージ',
  healingBonus: 'HP回復効果アップ',
  atkPercent:   '攻撃力%',
  hpPercent:    'HP%',
  defPercent:   '防御力%',
  GlacioDmg:    '凝縮Dmg%',
  FusionDmg:    '焦熱Dmg%',
  ElectroDmg:   '電導Dmg%',
  AeroDmg:      '気動Dmg%',
  SpectroDmg:   '回折Dmg%',
  HavocDmg:     '消滅Dmg%',
  Resonanceeff: '共鳴効率',
  energyRegen:  '共鳴効率',
};

const ELEMENT_COLORS: Record<string, { bg: string; text: string }> = {
  '焦熱': { bg: '#fff3e0', text: '#ea580c' },
  '凝縮': { bg: '#e0f2fe', text: '#0284c7' },
  '電導': { bg: '#f3e8ff', text: '#9333ea' },
  '気動': { bg: '#dcfce7', text: '#16a34a' },
  '回折': { bg: '#fef9c3', text: '#b45309' },
  '消滅': { bg: '#ede9fe', text: '#7c3aed' },
};

// /chardb のカード表示と同じ区分色
const CATEGORY_COLORS: Record<string, string> = {
  recommended: '#A78BFA',
  preferred:   '#34D399',
  acceptable:  '#60A5FA',
};

// 運用バリアントのlabel（characters.ts は日本語）の英語表記。
// localizeLabel と同じく、辞書に無い値は元の文字列を返す。
const VARIANT_LABEL_EN: Record<string, string> = {
  'メインアタッカー運用': 'Main DPS',
  'サブアタッカー運用':   'Sub DPS',
};

// 妥協ライン表の行。上位%は rankThresholds.ts の定義（累積確率）と同じ
const RANK_ROWS: { key: 'god' | 'sPlus' | 's' | 'a' | 'b' | 'c'; label: string; pct: number }[] = [
  { key: 'god',   label: 'GOD', pct: 0.01 },
  { key: 'sPlus', label: 'S+',  pct: 1 },
  { key: 's',     label: 'S',   pct: 5 },
  { key: 'a',     label: 'A',   pct: 15 },
  { key: 'b',     label: 'B',   pct: 35 },
  { key: 'c',     label: 'C',   pct: 65 },
];

const COPY = {
  ja: {
    h1: (name: string) => `${name}の音骸スコア目安`,
    lead: 'サブステだけをランダムに引いたとき(メインステ・ハーモニーは推奨で固定)を、50万回シミュレーションして出した数字です。',
    targetLine: (list: string) => `狙うサブステ: ${list}`,
    goodEnoughLine: (s: number) => `妥協ライン: ${s}点(上位5%)を超えたら次の部位へ`,
    thresholdsTitle: '妥協ライン表',
    rankHeader: 'ランク',
    scoreHeader: '必要スコア',
    pctHeader: '上位%',
    topPct: (pct: number) => `上位${pct}%`,
    distTitle: 'スコア分布(シミュレーション)',
    distAxis: 'スコア',
    distNote: 'サブステをランダムに50万回引いたときのスコアの散らばりです。プレイヤーの実績データではありません。',
    distS: (s: number) => `S: ${s}点`,
    distSPlus: (sPlus: number) => `S+: ${sPlus}点`,
    substatTitle: 'サブステの価値',
    substatNote: '1ロール最大値あたりの相対的な価値です（最大=100）。スコアの点数ではありません。',
    recommended: '推奨',
    preferred: '優先',
    acceptable: '可',
    cta: (name: string) => `${name}で音骸を判定する`,
    buildTitle: '推奨ハーモニー・メインステ',
    harmonySets: 'ハーモニーセット',
    mainstat: 'メインステータス',
    alternative: '代替',
    relatedTitle: '関連リンク',
    relatedChardb: 'キャラクター別 音骸ビルドデータ一覧',
    relatedFormula: 'スコアの計算方法',
  },
  en: {
    h1: (name: string) => `${name} Echo Score Benchmarks`,
    lead: 'These figures come from 500,000 simulations of randomly rolled substats (main stats and harmony sets fixed to the recommended setup).',
    targetLine: (list: string) => `Target substats: ${list}`,
    goodEnoughLine: (s: number) => `Good enough: ${s}+ pts (top 5%) — move on to the next slot`,
    thresholdsTitle: 'Score Thresholds by Rank',
    rankHeader: 'Rank',
    scoreHeader: 'Score',
    pctHeader: 'Top %',
    topPct: (pct: number) => `Top ${pct}%`,
    distTitle: 'Score Distribution (Simulated)',
    distAxis: 'Score',
    distNote: 'How scores spread across 500,000 simulated substat rolls. Not player data.',
    distS: (s: number) => `S: ${s} pts`,
    distSPlus: (sPlus: number) => `S+: ${sPlus} pts`,
    substatTitle: 'Substat Value',
    substatNote: 'Relative value per max roll (max = 100). These are not score points.',
    recommended: 'Rec.',
    preferred: 'Pref.',
    acceptable: 'OK',
    cta: (name: string) => `Check echoes with ${name}`,
    buildTitle: 'Recommended Harmony & Main Stats',
    harmonySets: 'Harmony Sets',
    mainstat: 'Main Stat',
    alternative: 'Alt.',
    relatedTitle: 'Related Links',
    relatedChardb: 'Echo Build Data by Character',
    relatedFormula: 'Scoring Method',
  },
} as const;

function substatLabel(key: SubstatKey, locale: Locale): string {
  return locale === 'en' ? SUBSTAT_LABEL_EN[key] : SUBSTAT_MAP[key].label;
}

function Badge({
  label, bg = '#f3f4f6', color = '#374151',
}: { label: string; bg?: string; color?: string }) {
  return (
    <span style={{
      background: bg,
      color,
      fontSize: 11,
      padding: '2px 8px',
      borderRadius: 99,
      fontWeight: 600,
      whiteSpace: 'nowrap' as const,
      display: 'inline-block',
    }}>
      {label}
    </span>
  );
}

function HarmonyBadge({ name, locale }: { name: string; locale: Locale }) {
  const { bg, text } = getHarmonyBadgeColor(name);
  const label = locale === 'en' ? (HARMONY_SETS_EN[name] ?? name) : name;
  return <Badge label={label} bg={bg} color={text} />;
}

function MainstatLine({
  label, keys, locale,
}: { label: string; keys: string[]; locale: Locale }) {
  if (keys.length === 0) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' as const }}>
      <span style={{ fontSize: 11, color: '#9ca3af', width: 50, flexShrink: 0 }}>{label}</span>
      {keys.map((k) => (
        <span
          key={k}
          style={{
            fontSize: 11,
            background: '#eff6ff',
            color: '#1d4ed8',
            padding: '1px 6px',
            borderRadius: 4,
            fontWeight: 500,
          }}
        >
          {locale === 'en' ? (MAINSTAT_LABEL_EN[k] ?? k) : (MAINSTAT_JA[k] ?? k)}
        </span>
      ))}
    </div>
  );
}

function SectionHeading({ level, children }: { level: 2 | 3; children: string }) {
  const style =
    level === 2
      ? { fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 10px' }
      : { fontSize: 14, fontWeight: 700, color: '#374151', margin: '0 0 8px' };
  if (level === 2) return <h2 style={style}>{children}</h2>;
  return <h3 style={style}>{children}</h3>;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: '16px',
      marginBottom: 16,
    }}>
      {children}
    </section>
  );
}

export default function CharacterDetailClient({ data }: { data: CharacterPageData }) {
  const { locale } = useLocale();
  const C = COPY[locale];
  const name = locale === 'en' ? data.nameEn : data.name;
  const displayName = locale === 'en' ? data.name : data.nameEn;
  const elColor = ELEMENT_COLORS[data.element] ?? { bg: '#f3f4f6', text: '#6b7280' };
  const multiVariant = data.variants.length > 1;
  const variantName = (label: string) => localizeLabel(VARIANT_LABEL_EN, label, locale);

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '28px 16px 48px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* ── 1. 見出しとリード ── */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>
            {C.h1(name)}
          </h1>
          {displayName && displayName !== name && (
            <p style={{ color: '#9ca3af', fontSize: 12, margin: '4px 0 0' }}>{displayName}</p>
          )}
          <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.8, margin: '8px 0 0' }}>
            {C.lead}
          </p>
          <div style={{ display: 'flex', gap: 5, marginTop: 10, flexWrap: 'wrap' as const, alignItems: 'center' }}>
            <Badge label={localizeLabel(ELEMENT_EN, data.element, locale)} bg={elColor.bg} color={elColor.text} />
            <Badge label={localizeLabel(WEAPON_EN, data.weapon, locale)} />
            <span style={{ color: '#6b7280', fontSize: 12 }}>
              {localizeLabel(ROLE_EN, data.role, locale)}
            </span>
          </div>
        </div>

        {/* ── 2. 要点カード ── */}
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 16,
          display: 'flex',
          flexDirection: 'column' as const,
          gap: multiVariant ? 14 : 6,
        }}>
          {data.variants.map((variant) => (
            <div key={variant.id}>
              {multiVariant && (
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', marginBottom: 4 }}>
                  {variantName(variant.label)}
                </div>
              )}
              {variant.substatWeights !== null && variant.substatWeights.length > 0 && (
                <p style={{ fontSize: 14, color: '#374151', margin: '0 0 4px', lineHeight: 1.7 }}>
                  {C.targetLine(
                    variant.substatWeights
                      .slice(0, 3)
                      .map((row) => substatLabel(row.key, locale))
                      .join(' > '),
                  )}
                </p>
              )}
              <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.7 }}>
                {C.goodEnoughLine(variant.thresholds.s)}
              </p>
            </div>
          ))}
        </div>

        {/* ── 3. サブステの価値 ── */}
        {data.variants.map((variant) => {
          const weights = variant.substatWeights;
          if (weights === null || weights.length === 0) return null;
          return multiVariant ? (
            <Card key={variant.id}>
              <SectionHeading level={2}>{variantName(variant.label)}</SectionHeading>
              <SectionHeading level={3}>{C.substatTitle}</SectionHeading>
              <SubstatWeightBars weights={weights} locale={locale} C={C} />
            </Card>
          ) : (
            <Card key={variant.id}>
              <SectionHeading level={2}>{C.substatTitle}</SectionHeading>
              <SubstatWeightBars weights={weights} locale={locale} C={C} />
            </Card>
          );
        })}

        {/* ── 4. 判定ツールへの導線 ── */}
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
          textAlign: 'center' as const,
        }}>
          <Link
            href={withLang(`/?char=${data.id}`, locale)}
            style={{
              display: 'inline-block',
              background: ACCENT,
              color: '#fff',
              padding: '11px 24px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            {C.cta(name)}
          </Link>
        </div>

        {/* 広告: 本文の途中に1つ（4の判定ボタンと5の妥協ライン表の間） */}
        <NativeBanner />

        {/* ── 5. 妥協ライン表 ── */}
        {data.variants.map((variant) => (
          multiVariant ? (
            <Card key={variant.id}>
              <SectionHeading level={2}>{variantName(variant.label)}</SectionHeading>
              <SectionHeading level={3}>{C.thresholdsTitle}</SectionHeading>
              <ThresholdTable thresholds={variant.thresholds} C={C} />
            </Card>
          ) : (
            <Card key={variant.id}>
              <SectionHeading level={2}>{C.thresholdsTitle}</SectionHeading>
              <ThresholdTable thresholds={variant.thresholds} C={C} />
            </Card>
          )
        ))}

        {/* ── 6. 推奨ハーモニー・メインステ ── */}
        <Card>
          <SectionHeading level={2}>{C.buildTitle}</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12, fontSize: 13 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.05em', marginBottom: 5, textTransform: 'uppercase' as const }}>
                {C.harmonySets}
              </div>
              {data.harmonySets.recommended.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: '#6b7280', width: 30, flexShrink: 0 }}>{C.recommended}</span>
                  {data.harmonySets.recommended.map((s) => (
                    <HarmonyBadge key={s} name={s} locale={locale} />
                  ))}
                </div>
              )}
              {data.harmonySets.acceptable.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#9ca3af', width: 30, flexShrink: 0 }}>{C.alternative}</span>
                  {data.harmonySets.acceptable.map((s) => (
                    <HarmonyBadge key={s} name={s} locale={locale} />
                  ))}
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.05em', marginBottom: 5, textTransform: 'uppercase' as const }}>
                {C.mainstat}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
                <MainstatLine label="Cost 4" keys={data.mainstat.cost4.recommended} locale={locale} />
                {data.mainstat.cost4.acceptable.length > 0 && (
                  <MainstatLine label={`${C.alternative}  └`} keys={data.mainstat.cost4.acceptable} locale={locale} />
                )}
                <MainstatLine label="Cost 3" keys={data.mainstat.cost3.recommended} locale={locale} />
                {data.mainstat.cost3.acceptable.length > 0 && (
                  <MainstatLine label={`${C.alternative}  └`} keys={data.mainstat.cost3.acceptable} locale={locale} />
                )}
                <MainstatLine label="Cost 1" keys={data.mainstat.cost1.recommended} locale={locale} />
                {data.mainstat.cost1.acceptable.length > 0 && (
                  <MainstatLine label={`${C.alternative}  └`} keys={data.mainstat.cost1.acceptable} locale={locale} />
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* ── 7. スコア分布グラフ ── */}
        {data.variants.map((variant) => (
          multiVariant ? (
            <Card key={variant.id}>
              <SectionHeading level={2}>{variantName(variant.label)}</SectionHeading>
              <SectionHeading level={3}>{C.distTitle}</SectionHeading>
              <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 10px', lineHeight: 1.7 }}>
                {C.distNote}
              </p>
              <CharDistributionChart
                thresholds={variant.thresholds}
                sLabel={C.distS(variant.thresholds.s)}
                sPlusLabel={C.distSPlus(variant.thresholds.sPlus)}
                axisLabel={C.distAxis}
              />
            </Card>
          ) : (
            <Card key={variant.id}>
              <SectionHeading level={2}>{C.distTitle}</SectionHeading>
              <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 10px', lineHeight: 1.7 }}>
                {C.distNote}
              </p>
              <CharDistributionChart
                thresholds={variant.thresholds}
                sLabel={C.distS(variant.thresholds.s)}
                sPlusLabel={C.distSPlus(variant.thresholds.sPlus)}
                axisLabel={C.distAxis}
              />
            </Card>
          )
        ))}

        {/* ── 8. 関連リンク ── */}
        <Card>
          <SectionHeading level={2}>{C.relatedTitle}</SectionHeading>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
            <li>
              <Link href={withLang('/chardb', locale)} style={{ color: ACCENT, fontSize: 13, fontWeight: 600 }}>
                {C.relatedChardb}
              </Link>
            </li>
            <li>
              <Link href={withLang('/score-formula', locale)} style={{ color: ACCENT, fontSize: 13, fontWeight: 600 }}>
                {C.relatedFormula}
              </Link>
            </li>
          </ul>
        </Card>

        {/* 広告: 末尾に1つ */}
        <AdBanner />
      </div>
    </div>
  );
}

type Copy = (typeof COPY)[Locale];

function ThresholdTable({
  thresholds, C,
}: {
  thresholds: CharacterPageData['variants'][number]['thresholds'];
  C: Copy;
}) {
  const cellStyle: React.CSSProperties = {
    padding: '7px 10px',
    borderBottom: '1px solid #f3f4f6',
    fontSize: 13,
    textAlign: 'left' as const,
  };
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' as const, minWidth: 260 }}>
        <thead>
          <tr style={{ background: '#f9fafb' }}>
            <th style={{ ...cellStyle, fontWeight: 700, color: '#6b7280', fontSize: 11 }}>{C.rankHeader}</th>
            <th style={{ ...cellStyle, fontWeight: 700, color: '#6b7280', fontSize: 11 }}>{C.scoreHeader}</th>
            <th style={{ ...cellStyle, fontWeight: 700, color: '#6b7280', fontSize: 11 }}>{C.pctHeader}</th>
          </tr>
        </thead>
        <tbody>
          {RANK_ROWS.map((row) => (
            <tr key={row.key}>
              <td style={{ ...cellStyle, fontWeight: 700, color: '#374151' }}>{row.label}</td>
              <td style={{ ...cellStyle, color: '#111827', fontWeight: 600 }}>{thresholds[row.key]}</td>
              <td style={{ ...cellStyle, color: '#6b7280' }}>{C.topPct(row.pct)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubstatWeightBars({
  weights, locale, C,
}: {
  weights: CharacterPageData['variants'][number]['substatWeights'];
  locale: Locale;
  C: Copy;
}) {
  if (!weights || weights.length === 0) return null;
  const categoryLabel: Record<string, string> = {
    recommended: C.recommended,
    preferred: C.preferred,
    acceptable: C.acceptable,
  };
  return (
    <div>
      <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 10px' }}>{C.substatNote}</p>
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
        {weights.map((row) => (
          <div key={row.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#374151', width: 104, flexShrink: 0 }}>
              {substatLabel(row.key, locale)}
            </span>
            <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 4, height: 14, minWidth: 60 }}>
              <div style={{
                width: `${row.relative}%`,
                height: '100%',
                borderRadius: 4,
                background: CATEGORY_COLORS[row.category],
              }} />
            </div>
            <span style={{ fontSize: 11, color: '#6b7280', width: 30, textAlign: 'right' as const, flexShrink: 0 }}>
              {row.relative}
            </span>
            <span style={{ width: 40, flexShrink: 0 }}>
              <Badge
                label={categoryLabel[row.category]}
                bg={row.category === 'recommended' ? '#f5f3ff' : row.category === 'preferred' ? '#f0fdf4' : '#eff6ff'}
                color={CATEGORY_COLORS[row.category]}
              />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
