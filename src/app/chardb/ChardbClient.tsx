'use client';

import { CHARACTERS } from '@/data/characters';
import { SUBSTAT_MAP } from '@/data/substats';
import { getHarmonyBadgeColor } from '@/data/echoes';
import type { CharacterBuild } from '@/types/character';

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

const ROLE_TEMPLATE_LABEL: Record<string, string> = {
  DPS:    'メインDPS',
  SubDPS: 'サブDPS',
};

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

function HarmonyBadge({ name }: { name: string }) {
  const { bg, text } = getHarmonyBadgeColor(name);
  return <Badge label={name} bg={bg} color={text} />;
}

function SubstatBadge({ statKey, muted = false }: { statKey: string; muted?: boolean }) {
  const label = SUBSTAT_MAP[statKey as keyof typeof SUBSTAT_MAP]?.label ?? statKey;
  return (
    <Badge
      label={label}
      bg={muted ? '#f9fafb' : '#f3f4f6'}
      color={muted ? '#9ca3af' : '#374151'}
    />
  );
}

function MainstatLine({ label, keys, muted = false }: { label: string; keys: string[]; muted?: boolean }) {
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
          {MAINSTAT_JA[k] ?? k}
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

function CharCard({ char }: { char: CharacterBuild }) {
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
          <span style={{ fontWeight: 700, fontSize: 16 }}>{char.name}</span>
          {char.nameEn && (
            <span style={{ color: '#9ca3af', fontSize: 12 }}>{char.nameEn}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' as const, alignItems: 'center' }}>
          <Badge label={char.element} bg={elColor.bg} color={elColor.text} />
          <Badge label={char.weapon} />
          {char.roleTemplate && (
            <Badge label={ROLE_TEMPLATE_LABEL[char.roleTemplate] ?? char.roleTemplate} bg="#f0fdf4" color="#16a34a" />
          )}
          <span style={{ color: '#6b7280', fontSize: 12 }}>{char.role}</span>
        </div>
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column' as const, gap: 12 }}>

        {/* ── ハーモニーセット ── */}
        <div>
          <SectionTitle>ハーモニーセット</SectionTitle>
          {char.harmonySets.recommended.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const, alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: '#6b7280', width: 26, flexShrink: 0 }}>推奨</span>
              {char.harmonySets.recommended.map(s => (
                <HarmonyBadge key={s} name={s} />
              ))}
            </div>
          )}
          {char.harmonySets.acceptable.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#9ca3af', width: 26, flexShrink: 0 }}>代替</span>
              {char.harmonySets.acceptable.map(s => (
                <HarmonyBadge key={s} name={s} />
              ))}
            </div>
          )}
        </div>

        {/* ── メインステ ── */}
        <div>
          <SectionTitle>メインステータス</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
            <MainstatLine label="Cost 4" keys={char.mainstat.cost4.recommended} />
            {char.mainstat.cost4.acceptable.length > 0 && (
              <MainstatLine label="  └ 代替" keys={char.mainstat.cost4.acceptable} muted />
            )}
            <MainstatLine label="Cost 3" keys={char.mainstat.cost3.recommended} />
            {char.mainstat.cost3.acceptable.length > 0 && (
              <MainstatLine label="  └ 代替" keys={char.mainstat.cost3.acceptable} muted />
            )}
            <MainstatLine label="Cost 1" keys={char.mainstat.cost1.recommended} />
            {char.mainstat.cost1.acceptable.length > 0 && (
              <MainstatLine label="  └ 代替" keys={char.mainstat.cost1.acceptable} muted />
            )}
          </div>
        </div>

        {/* ── サブステ ── */}
        <div>
          <SectionTitle>サブステータス</SectionTitle>
          {char.substats.recommended.length > 0 && (
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const, alignItems: 'center', marginBottom: hasPreferred || hasAcceptable ? 4 : 0 }}>
              <span style={{ fontSize: 11, color: '#6b7280', width: 26, flexShrink: 0 }}>推奨</span>
              {char.substats.recommended.map(s => (
                <SubstatBadge key={s.key} statKey={s.key} />
              ))}
            </div>
          )}
          {hasPreferred && (
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const, alignItems: 'center', marginBottom: hasAcceptable ? 4 : 0 }}>
              <span style={{ fontSize: 11, color: '#6b7280', width: 26, flexShrink: 0 }}>優先</span>
              {char.substats.preferred.map(s => (
                <SubstatBadge key={s.key} statKey={s.key} />
              ))}
            </div>
          )}
          {hasAcceptable && (
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#9ca3af', width: 26, flexShrink: 0 }}>可</span>
              {(char.substats.acceptable ?? []).map(s => (
                <SubstatBadge key={s.key} statKey={s.key} muted />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChardbClient() {
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
              キャラクタービルドデータ確認
            </h1>
            <p style={{ color: '#6b7280', fontSize: 13, marginTop: 6, margin: '6px 0 0' }}>
              登録済みキャラクター：<strong>{CHARACTERS.length}</strong> 件　／
              ハーモニーセット・メインステ・サブステの設定内容を一覧表示します
            </p>
          </div>
          <a
            href="/"
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
            ← シミュレーターへ
          </a>
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
          <span style={{ fontWeight: 600, color: '#374151' }}>凡例</span>
          <span>推奨 = スコア計算で重み大のステータス</span>
          <span>優先 = 推奨に次ぐ優先度</span>
          <span>可 = 許容範囲内</span>
          <span>代替 = 推奨に代わる選択肢</span>
        </div>

        {/* ── キャラクターグリッド ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
          gap: 16,
        }}>
          {CHARACTERS.map(char => (
            <CharCard key={char.id} char={char} />
          ))}
        </div>

        {/* ── フッター ── */}
        <p style={{ textAlign: 'center' as const, color: '#9ca3af', fontSize: 12, marginTop: 32 }}>
          このページは検索エンジンに登録されていません。URLを知っている人のみアクセス可能です。
        </p>
      </div>
    </div>
  );
}
