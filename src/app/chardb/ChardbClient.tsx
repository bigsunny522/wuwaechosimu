'use client';

import Link from 'next/link';
import { CHARACTERS } from '@/data/characters';
import { SUBSTAT_MAP } from '@/data/substats';
import { getHarmonyBadgeColor, HARMONY_SETS_EN } from '@/data/echoes';
import { SUBSTAT_LABEL_EN, MAINSTAT_LABEL_EN } from '@/data/translations';
import { ELEMENT_EN, WEAPON_EN, ROLE_EN, localizeLabel } from '@/data/charLabels';
import { useLocale, withLang, type Locale } from '@/lib/locale';
import AdBanner from '@/components/AdBanner';
import type { CharacterBuild } from '@/types/character';
import type { SubstatKey } from '@/types/echo';

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

const ROLE_TEMPLATE_LABEL: Record<Locale, Record<string, string>> = {
  ja: { DPS: 'メインDPS', SubDPS: 'サブDPS' },
  en: { DPS: 'Main DPS',  SubDPS: 'Sub DPS' },
};

const COPY = {
  ja: {
    title: 'キャラクター別 音骸ビルドデータ一覧',
    lead: (n: number) =>
      `全 ${n} キャラクターについて、推奨ハーモニーセット・コスト別メインステータス・サブステータスの優先度をまとめています。当ツールのスコア計算にそのまま使用している評価データです。`,
    back: '← シミュレーターへ',
    legend: '凡例',
    legendItems: [
      '推奨 = スコア計算で重み大のステータス',
      '優先 = 推奨に次ぐ優先度',
      '可 = 許容範囲内',
      '代替 = 推奨に代わる選択肢',
    ],
    harmonySets: 'ハーモニーセット',
    mainstat: 'メインステータス',
    substat: 'サブステータス',
    recommended: '推奨',
    preferred: '優先',
    acceptable: '可',
    alternative: '代替',
    altPrefix: '  └ 代替',
    note: 'このデータは当サイトが独自に整理したものです。スコア計算での使われ方は',
    noteLink: 'スコア計算方法',
    noteSuffix: 'のページで公開しています。',
  },
  en: {
    title: 'Echo Build Data by Character',
    lead: (n: number) =>
      `Recommended harmony sets, main stats by cost, and substat priorities for all ${n} characters. This is the evaluation data the score calculator uses directly.`,
    back: '← Back to Simulator',
    legend: 'Legend',
    legendItems: [
      'Recommended = weighted heavily in scoring',
      'Preferred = next priority after recommended',
      'Acceptable = within tolerable range',
      'Alternative = substitute for the recommendation',
    ],
    harmonySets: 'Harmony Sets',
    mainstat: 'Main Stat',
    substat: 'Substats',
    recommended: 'Rec.',
    preferred: 'Pref.',
    acceptable: 'OK',
    alternative: 'Alt.',
    altPrefix: '  └ Alt.',
    note: 'This data is compiled independently by this site. How it feeds into scoring is documented on the',
    noteLink: 'Scoring Method',
    noteSuffix: 'page.',
  },
} as const;

function Badge({
  label, bg = '#f3f4f6', color = '#374151', small = false,
}: {
  label: string; bg?: string; color?: string; small?: boolean;
}) {
  return (
    <span style={{
      background: bg,
      color,
      fontSize: small ? 10 : 11,
      padding: small ? '1px 5px' : '2px 8px',
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

function SubstatBadge({ statKey, locale, muted = false }: { statKey: string; locale: Locale; muted?: boolean }) {
  const label = locale === 'en'
    ? (SUBSTAT_LABEL_EN[statKey as SubstatKey] ?? statKey)
    : (SUBSTAT_MAP[statKey as keyof typeof SUBSTAT_MAP]?.label ?? statKey);
  return (
    <Badge
      label={label}
      bg={muted ? '#f9fafb' : '#f3f4f6'}
      color={muted ? '#9ca3af' : '#374151'}
    />
  );
}

function MainstatLine({
  label, keys, locale, muted = false,
}: {
  label: string; keys: string[]; locale: Locale; muted?: boolean;
}) {
  if (keys.length === 0) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' as const }}>
      <span style={{ fontSize: 11, color: muted ? '#d1d5db' : '#9ca3af', width: 50, flexShrink: 0 }}>
        {label}
      </span>
      {keys.map(k => (
        <span
          key={k}
          style={{
            fontSize: 11,
            background: muted ? '#fafafa' : '#eff6ff',
            color: muted ? '#d1d5db' : '#1d4ed8',
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

function SectionTitle({ children }: { children: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.05em', marginBottom: 5, textTransform: 'uppercase' as const }}>
      {children}
    </div>
  );
}

function CharCard({ char, locale }: { char: CharacterBuild; locale: Locale }) {
  const C = COPY[locale];
  const elColor = ELEMENT_COLORS[char.element] ?? { bg: '#f3f4f6', text: '#6b7280' };
  const hasPreferred  = char.substats.preferred.length > 0;
  const hasAcceptable = (char.substats.acceptable ?? []).length > 0;

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      background: '#ffffff',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column' as const,
      fontSize: 13,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      {/* ── カードヘッダー ── */}
      <div style={{ padding: '12px 16px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' as const }}>
          <h2 style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>
            {locale === 'en' && char.nameEn ? char.nameEn : char.name}
          </h2>
          <span style={{ color: '#9ca3af', fontSize: 12 }}>
            {locale === 'en' ? char.name : char.nameEn}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' as const, alignItems: 'center' }}>
          <Badge label={localizeLabel(ELEMENT_EN, char.element, locale)} bg={elColor.bg} color={elColor.text} />
          <Badge label={localizeLabel(WEAPON_EN, char.weapon, locale)} />
          {char.roleTemplate && (
            <Badge
              label={ROLE_TEMPLATE_LABEL[locale][char.roleTemplate] ?? char.roleTemplate}
              bg="#f0fdf4"
              color="#16a34a"
            />
          )}
          <span style={{ color: '#6b7280', fontSize: 12 }}>
            {localizeLabel(ROLE_EN, char.role, locale)}
          </span>
        </div>
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column' as const, gap: 12 }}>

        {/* ── ハーモニーセット ── */}
        <div>
          <SectionTitle>{C.harmonySets}</SectionTitle>
          {char.harmonySets.recommended.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const, alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: '#6b7280', width: 30, flexShrink: 0 }}>{C.recommended}</span>
              {char.harmonySets.recommended.map(s => (
                <HarmonyBadge key={s} name={s} locale={locale} />
              ))}
            </div>
          )}
          {char.harmonySets.acceptable.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#9ca3af', width: 30, flexShrink: 0 }}>{C.alternative}</span>
              {char.harmonySets.acceptable.map(s => (
                <HarmonyBadge key={s} name={s} locale={locale} />
              ))}
            </div>
          )}
        </div>

        {/* ── メインステ ── */}
        <div>
          <SectionTitle>{C.mainstat}</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
            <MainstatLine label="Cost 4" keys={char.mainstat.cost4.recommended} locale={locale} />
            {char.mainstat.cost4.acceptable.length > 0 && (
              <MainstatLine label={C.altPrefix} keys={char.mainstat.cost4.acceptable} locale={locale} muted />
            )}
            <MainstatLine label="Cost 3" keys={char.mainstat.cost3.recommended} locale={locale} />
            {char.mainstat.cost3.acceptable.length > 0 && (
              <MainstatLine label={C.altPrefix} keys={char.mainstat.cost3.acceptable} locale={locale} muted />
            )}
            <MainstatLine label="Cost 1" keys={char.mainstat.cost1.recommended} locale={locale} />
            {char.mainstat.cost1.acceptable.length > 0 && (
              <MainstatLine label={C.altPrefix} keys={char.mainstat.cost1.acceptable} locale={locale} muted />
            )}
          </div>
        </div>

        {/* ── サブステ ── */}
        <div>
          <SectionTitle>{C.substat}</SectionTitle>
          {char.substats.recommended.length > 0 && (
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const, alignItems: 'center', marginBottom: hasPreferred || hasAcceptable ? 4 : 0 }}>
              <span style={{ fontSize: 11, color: '#6b7280', width: 30, flexShrink: 0 }}>{C.recommended}</span>
              {char.substats.recommended.map(s => (
                <SubstatBadge key={s.key} statKey={s.key} locale={locale} />
              ))}
            </div>
          )}
          {hasPreferred && (
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const, alignItems: 'center', marginBottom: hasAcceptable ? 4 : 0 }}>
              <span style={{ fontSize: 11, color: '#6b7280', width: 30, flexShrink: 0 }}>{C.preferred}</span>
              {char.substats.preferred.map(s => (
                <SubstatBadge key={s.key} statKey={s.key} locale={locale} />
              ))}
            </div>
          )}
          {hasAcceptable && (
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#9ca3af', width: 30, flexShrink: 0 }}>{C.acceptable}</span>
              {(char.substats.acceptable ?? []).map(s => (
                <SubstatBadge key={s.key} statKey={s.key} locale={locale} muted />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChardbClient() {
  const { locale } = useLocale();
  const C = COPY[locale];

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '28px 16px 48px' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto' }}>

        {/* ── ページヘッダー ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
          flexWrap: 'wrap' as const,
          gap: 12,
        }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>
              {C.title}
            </h1>
            <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.8, margin: '6px 0 0', maxWidth: 760 }}>
              {C.lead(CHARACTERS.length)}
            </p>
          </div>
          <Link
            href={withLang('/', locale)}
            style={{
              background: ACCENT,
              color: '#fff',
              padding: '9px 18px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            {C.back}
          </Link>
        </div>

        {/* ── 凡例 ── */}
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: '10px 16px',
          marginBottom: 20,
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap' as const,
          alignItems: 'center',
          fontSize: 12,
          color: '#6b7280',
        }}>
          <span style={{ fontWeight: 600, color: '#374151' }}>{C.legend}</span>
          {C.legendItems.map(item => <span key={item}>{item}</span>)}
        </div>

        <AdBanner />

        {/* ── キャラクターグリッド ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
          gap: 16,
        }}>
          {CHARACTERS.map(char => (
            <CharCard key={char.id} char={char} locale={locale} />
          ))}
        </div>

        <AdBanner />

        {/* ── フッター ── */}
        <p style={{ textAlign: 'center' as const, color: '#9ca3af', fontSize: 12, marginTop: 32, lineHeight: 1.8 }}>
          {C.note}{' '}
          <Link href={withLang('/score-formula', locale)} style={{ color: ACCENT }}>{C.noteLink}</Link>
          {' '}{C.noteSuffix}
        </p>
      </div>
    </div>
  );
}
