'use client';

/* Hallmark · design-system: DESIGN.md (blue = STUDIO §1-9, gold = §10) */

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import Link from 'next/link';
import type { EchoCost, EchoState, ScoreResult, MainstatInfo } from '@/types/echo';
import { createEcho, upgradeEcho, upgradeToFull, rerollSubstats } from '@/lib/simulator';
import { simulateCompletion, clearBaselineCache, type AdvisorResult } from '@/lib/monteCarlo';
import { scoreEcho } from '@/lib/scorer';
import { SUBSTAT_COUNT, MAINSTAT_POOLS } from '@/data/mainstats';
import { ECHOES_BY_COST, ECHOES, DEFAULT_ECHO_ID, HARMONY_SETS, HARMONY_SETS_EN } from '@/data/echoes';
import { CHARACTER_LIST, CHARACTER_MAP } from '@/data/characters';
import EchoCard from '@/components/EchoCard';
import EchoAdvisor from '@/components/EchoAdvisor';
import ScoreDebugPanel from '@/components/ScoreDebugPanel';
import BonusModal from '@/components/BonusModal';
import SavedResultsModal, { type SavedResult } from '@/components/SavedResultsModal';
import HomeExplainer from '@/components/HomeExplainer';
import AdBanner from '@/components/AdBanner';
import UpdateModal from '@/components/UpdateModal';
import { LATEST_UPDATE_ID } from '@/data/updates';
import { generateResultCard, buildShareText } from '@/lib/imageGen';
import { useLocale, withLang } from '@/lib/locale';
import { TRANSLATIONS, MAINSTAT_LABEL_EN, interpolate } from '@/data/translations';
import CustomSelect from '@/components/CustomSelect';
import EchoIcon from '@/components/EchoIcon';
import SiteThemeSwitcher from '@/components/SiteThemeSwitcher';
import { useSiteTheme, type SiteTheme } from '@/contexts/SiteThemeContext';
import {
  Dices, BarChart3, Sparkles, Gift, History, Menu, BookOpen, Bell,
  Globe, FileText, Mail, Swords, Clock, Check, Loader2, Calculator, Users, Info,
} from 'lucide-react';

const COST_OPTIONS: EchoCost[] = [4, 3, 1];

/** サイトテーマごとのアクセント色(hex)。alpha付き文字列連結(`${ACCENT}44`)で
 *  使われる箇所が多いため、CSS変数ではなく実hexで持つ。 */
const ACCENT_BY_THEME: Record<SiteTheme, string> = {
  blue: '#0275fd',
  gold: '#a8823a',
};
/** CTAボタンの実際の塗り(グラデーション含む)に近い単色。SVGのfillはグラデーション文字列を
 *  受け付けないため、EchoIconの「背景に溶け込む」用途にはこちらを使う。 */
const CTA_SOLID_BY_THEME: Record<SiteTheme, string> = {
  blue: '#222222',
  gold: '#8a6a2e',
};
interface SelectTheme {
  charAccent: string; charBg: string; charBorder: string;
  echoAccent: string; echoBg: string; echoBorder: string;
  text: string; dropdownBg: string;
}
const SELECT_ACCENT_BY_THEME: Record<SiteTheme, SelectTheme> = {
  blue: {
    charAccent: '#0275fd', charBg: 'linear-gradient(135deg, #f0f7ff 0%, #fafbff 100%)', charBorder: '#bdd4fb',
    echoAccent: '#783cf0', echoBg: 'linear-gradient(135deg, #f5f0ff 0%, #fafbff 100%)', echoBorder: '#cdbdfb',
    text: '#222222', dropdownBg: '#ffffff',
  },
  gold: {
    charAccent: '#a8823a', charBg: 'linear-gradient(135deg, #17140d 0%, #0d0b07 100%)', charBorder: '#2e2412',
    echoAccent: '#8a6a2e', echoBg: 'linear-gradient(135deg, #17140d 0%, #0d0b07 100%)', echoBorder: '#2e2412',
    text: '#f3ead2', dropdownBg: '#1a160e',
  },
};

function getRecommendedEchoId(charId: string): string | null {
  if (charId === 'generic') return null;
  const char = CHARACTER_MAP[charId];
  if (!char) return null;
  // 推奨セットを優先、なければ可セットにフォールバック
  for (const set of [...char.harmonySets.recommended, ...char.harmonySets.acceptable]) {
    const echo = ECHOES.find(e => e.cost === 4 && e.sets.includes(set));
    if (echo) return echo.id;
  }
  return null;
}

function getRecommendedHarmonySet(charId: string, cost: EchoCost): string | null {
  if (charId === 'generic' || cost === 4) return null;
  const char = CHARACTER_MAP[charId];
  if (!char) return null;
  const available = new Set(ECHOES.filter(e => e.cost === cost).flatMap(e => e.sets));
  // 推奨セットを優先、なければ可セットにフォールバック
  return char.harmonySets.recommended.find(s => available.has(s))
    ?? char.harmonySets.acceptable.find(s => available.has(s))
    ?? null;
}

function getRecommendedMainstatKey(cost: EchoCost, charId: string): string {
  const char = charId !== 'generic' ? CHARACTER_MAP[charId] : undefined;
  if (cost === 4) {
    if (char?.mainstat.cost4.recommended.includes('healingBonus')) return 'healingBonus';
    return 'critDmg';
  }
  if (cost === 1) {
    if (char?.mainstat.cost1.recommended.includes('hpPercent')) return 'hpPercent';
    return 'atkPercent';
  }
  if (!char) return 'atkPercent';
  const dmgKey = char.mainstat.cost3.recommended.find(k => k.endsWith('Dmg'));
  return dmgKey ?? char.mainstat.cost3.recommended[0] ?? 'atkPercent';
}
const BONUS_DURATION_MS = 5 * 60 * 1000;
const MAX_REROLL        = 3;
const SAVE_PER_UNLOCK   = 10;

const FOOTER_LINKS = [
  { href: '/guide',         ja: '使い方ガイド',           en: 'How to Use' },
  { href: '/score-formula', ja: 'スコア計算方法',         en: 'Scoring Method' },
  { href: '/chardb',        ja: 'キャラ別ビルド',         en: 'Build Data' },
  { href: '/supporter',     ja: '厳選サポーター',         en: 'Farming Supporter' },
  { href: '/news',          ja: 'お知らせ',               en: "What's New" },
  { href: '/about',         ja: 'このサイトについて',     en: 'About' },
  { href: '/privacy',       ja: 'プライバシーポリシー',   en: 'Privacy Policy' },
  { href: '/contact',       ja: 'お問い合わせ',           en: 'Contact' },
] as const;

type BonusKind = 'bonus' | 'saves';

/** ヘッダーのオーバーフローメニュー1行分の共通スタイル */
const MENU_ITEM =
  'flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-[#222222] hover:bg-[#f7f7f7] transition-colors';


export default function HomeClient() {
  const { locale, toggleLocale } = useLocale();
  const T = TRANSLATIONS[locale];
  const { theme } = useSiteTheme();
  const ACCENT = ACCENT_BY_THEME[theme];
  const CTA_SOLID = CTA_SOLID_BY_THEME[theme];
  const SEL = SELECT_ACCENT_BY_THEME[theme];

  const [cost, setCost]                       = useState<EchoCost>(4);
  const [selectedEchoId, setSelectedEchoId]   = useState<string>(DEFAULT_ECHO_ID[4]);
  const [selectedHarmonySet, setSelectedHarmonySet] = useState<string>('');
  const [echo, setEcho]                       = useState<EchoState | null>(null);
  const [score, setScore]                     = useState<ScoreResult | null>(null);
  const [selectedCharId, setSelectedCharId]   = useState<string>('generic');
  const [downloading, setDownloading]         = useState(false);
  const [maxedAt, setMaxedAt]                 = useState<number | null>(null);
  const echoSectionRef   = useRef<HTMLDivElement>(null);
  const scrollOnNext     = useRef(false);

  /* ── Bonus time ─────────────────────────────────────────────── */
  const [bonusEndTime, setBonusEndTime]       = useState<number | null>(null);
  const [bonusModalOpen, setBonusModalOpen]   = useState(false);
  const [bonusKind, setBonusKind]             = useState<BonusKind>('bonus');
  const [timeLeft, setTimeLeft]               = useState(0);
  const [lockedMainstatKey, setLockedMainstatKey] = useState<string>('');
  const [rerollUsed, setRerollUsed]           = useState(false);
  const [rerollIndices, setRerollIndices]     = useState<Set<number>>(new Set());

  const bonusActive = bonusEndTime !== null && Date.now() < bonusEndTime;

  useEffect(() => {
    if (!bonusEndTime) return;
    const tick = () => {
      const left = Math.max(0, bonusEndTime - Date.now());
      setTimeLeft(Math.ceil(left / 1000));
      if (left === 0) setBonusEndTime(null);
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [bonusEndTime]);

  /* ── Update notification ────────────────────────────────────── */
  useEffect(() => {
    const seen = localStorage.getItem('lastSeenUpdate');
    if (seen !== LATEST_UPDATE_ID) {
      setUpdateModalOpen(true);
      setHasNewUpdate(true);
    }
  }, []);

  /* ── Auto-scroll to echo card on new draw ───────────────────── */
  // 入手直後はカードが小さいため、上端合わせより中央寄せの方が収まりが良い
  useEffect(() => {
    if (!echo || !scrollOnNext.current) return;
    scrollOnNext.current = false;
    const timer = setTimeout(() => {
      echoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
    return () => clearTimeout(timer);
  }, [echo]);

  /* ── Auto-scroll once fully upgraded (PC のみ、スマホはモーダル表示) ── */
  // 完成した音骸カード（サブステ5個）の上端に合わせる。結果ブロックを対象にすると
  // カードが画面外へ流れてしまい、何を引いたのかが見えなくなる
  useEffect(() => {
    if (!score || echo?.level !== 25) return;
    if (window.innerWidth < 640) return;
    const timer = setTimeout(() => {
      echoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => clearTimeout(timer);
  }, [score, echo?.level]);

  /* ── Save slots ─────────────────────────────────────────────── */
  const [saveSlots, setSaveSlots]             = useState(0);
  const [savedResults, setSavedResults]       = useState<SavedResult[]>([]);
  const [historyOpen, setHistoryOpen]         = useState(false);
  const [menuOpen, setMenuOpen]               = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [hasNewUpdate, setHasNewUpdate]       = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [advisorResult, setAdvisorResult]     = useState<AdvisorResult | null>(null);

  /* ── Bonus configs (locale-aware) ───────────────────────────── */
  const bonusConfigs: Record<BonusKind, { title: string; items: string[] }> = useMemo(() => ({
    bonus: { title: T.bonusModalTitle, items: [T.bonusModalItem1, T.bonusModalItem2] },
    saves: { title: T.savesModalTitle, items: [interpolate(T.savesModalItem1, [SAVE_PER_UNLOCK]), T.savesModalItem2] },
  }), [T]);

  /* ── Handlers ───────────────────────────────────────────────── */
  const handleGrantBonus = useCallback(() => {
    if (bonusKind === 'bonus') {
      setBonusEndTime(Date.now() + BONUS_DURATION_MS);
      setLockedMainstatKey(getRecommendedMainstatKey(cost, selectedCharId));
      setRerollUsed(false);
      setRerollIndices(new Set());
    } else {
      setSaveSlots((prev) => prev + SAVE_PER_UNLOCK);
    }
  }, [bonusKind, cost, selectedCharId]);

  const openBonusModal = useCallback((kind: BonusKind) => {
    setBonusKind(kind);
    setBonusModalOpen(true);
  }, []);

  const handleCharacterChange = useCallback((charId: string) => {
    setSelectedCharId(charId);
    setScore(null);
    clearBaselineCache();
    if (cost === 4) {
      const recId = getRecommendedEchoId(charId);
      if (recId) setSelectedEchoId(recId);
    } else {
      const recSet = getRecommendedHarmonySet(charId, cost);
      if (recSet) setSelectedHarmonySet(recSet);
    }
    setLockedMainstatKey(getRecommendedMainstatKey(cost, charId));
  }, [cost]);

  const harmonySetOptions = useMemo(() => {
    if (cost === 4) return [];
    const available = new Set(ECHOES.filter(e => e.cost === cost).flatMap(e => e.sets));
    return Object.values(HARMONY_SETS).filter(s => available.has(s));
  }, [cost]);

  const handleCostChange = useCallback((c: EchoCost) => {
    setCost(c);
    if (c === 4) {
      const recId = getRecommendedEchoId(selectedCharId);
      setSelectedEchoId(recId ?? DEFAULT_ECHO_ID[c]);
    } else {
      const recSet = getRecommendedHarmonySet(selectedCharId, c);
      if (recSet) {
        setSelectedHarmonySet(recSet);
      } else {
        const available = new Set(ECHOES.filter(e => e.cost === c).flatMap(e => e.sets));
        const first = Object.values(HARMONY_SETS).find(s => available.has(s)) ?? '';
        setSelectedHarmonySet(first);
      }
    }
    setLockedMainstatKey(getRecommendedMainstatKey(c, selectedCharId));
    setEcho(null);
    setScore(null);
  }, [selectedCharId]);

  const handleStart = useCallback(() => {
    scrollOnNext.current = true;
    let echoId = selectedEchoId;
    if (cost !== 4) {
      const pool = ECHOES.filter(e => e.cost === cost && e.sets.includes(selectedHarmonySet));
      if (pool.length === 0) return;
      echoId = pool[Math.floor(Math.random() * pool.length)].id;
    }
    let fixedMain: MainstatInfo | undefined;
    if (bonusEndTime && Date.now() < bonusEndTime && lockedMainstatKey) {
      fixedMain = MAINSTAT_POOLS[cost].find(m => m.key === lockedMainstatKey);
    }
    const harmonyForEcho = cost !== 4 ? selectedHarmonySet : undefined;
    setEcho(createEcho(cost, echoId, fixedMain, harmonyForEcho));
    setScore(null);
    setMaxedAt(null);
    setRerollUsed(false);
    setRerollIndices(new Set());
    setShowResultModal(false);
    setAdvisorResult(null);
  }, [echo, cost, selectedEchoId, selectedHarmonySet, bonusEndTime, lockedMainstatKey]);

  const handleUpgrade = useCallback(() => {
    if (!echo || echo.level >= 25) return;
    const next = upgradeEcho(echo);
    setEcho(next);
    const build = selectedCharId !== 'generic' ? CHARACTER_MAP[selectedCharId] : undefined;
    setScore(scoreEcho(next, build));
    if (next.level === 25) {
      setMaxedAt(Date.now());
      setAdvisorResult(null);
      if (window.innerWidth < 640) setShowResultModal(true);
    } else {
      setAdvisorResult(simulateCompletion(next, build));
    }
  }, [echo, selectedCharId]);

  const handleMaxUpgrade = useCallback(() => {
    if (!echo || echo.level >= 25) return;
    const maxed = upgradeToFull(echo);
    setEcho(maxed);
    const build = selectedCharId !== 'generic' ? CHARACTER_MAP[selectedCharId] : undefined;
    setScore(scoreEcho(maxed, build));
    setMaxedAt(Date.now());
    if (window.innerWidth < 640) setShowResultModal(true);
  }, [echo, selectedCharId]);

  const handleReset = useCallback(() => {
    setEcho(null); setScore(null); setMaxedAt(null);
    setRerollUsed(false); setRerollIndices(new Set());
    setShowResultModal(false); setAdvisorResult(null);
  }, []);

  const handleReroll = useCallback(() => {
    if (!echo || rerollUsed || rerollIndices.size === 0) return;
    const newEcho = rerollSubstats(echo, Array.from(rerollIndices));
    setEcho(newEcho);
    const build = selectedCharId !== 'generic' ? CHARACTER_MAP[selectedCharId] : undefined;
    setScore(scoreEcho(newEcho, build));
    setRerollUsed(true);
    setRerollIndices(new Set());
  }, [echo, rerollUsed, rerollIndices, selectedCharId]);

  const toggleRerollIndex = useCallback((idx: number) => {
    setRerollIndices(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else if (next.size < MAX_REROLL) next.add(idx);
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    if (!echo || !score || echo.level < 25 || saveSlots <= 0) return;
    const ts = maxedAt ?? Date.now();
    const char = selectedCharId !== 'generic' ? CHARACTER_MAP[selectedCharId] : undefined;
    const charName = char
      ? (locale === 'en' ? char.nameEn : char.name)
      : undefined;
    setSavedResults(prev => [{ id: Date.now(), echo, score, maxedAt: ts, charName }, ...prev]);
    setSaveSlots(prev => prev - 1);
  }, [echo, score, saveSlots, maxedAt, selectedCharId, locale]);

  const handleClearSaved = useCallback((id: number) => {
    setSavedResults(prev => prev.filter(r => r.id !== id));
  }, []);

  const isMaxLevel  = echo?.level === 25;
  // スマホ：アドバイザーを下固定バーに表示するフラグ
  const showAdvisorInBar = !!(advisorResult && echo && echo.level > 0 && echo.level < 25);
  const echoList    = ECHOES_BY_COST[cost];

  const charOptions = useMemo(() => [
    { value: 'generic', label: T.charGeneric },
    ...CHARACTER_LIST.map((c) => ({
      value: c.id,
      label: locale === 'en' ? (c.nameEn ?? c.name) : c.name,
    })),
  ], [T.charGeneric, locale]);

  const echoOptions = useMemo(() => {
    const char = selectedCharId !== 'generic' ? CHARACTER_MAP[selectedCharId] : undefined;
    const recSets = char ? new Set(char.harmonySets.recommended) : new Set<string>();
    const accSets = char ? new Set(char.harmonySets.acceptable) : new Set<string>();
    const priority = (b?: 'recommended' | 'acceptable') =>
      b === 'recommended' ? 0 : b === 'acceptable' ? 1 : 2;

    return echoList
      .map((e) => {
        let badge: 'recommended' | 'acceptable' | undefined;
        if (char) {
          if (e.sets.some(s => recSets.has(s))) badge = 'recommended';
          else if (e.sets.some(s => accSets.has(s))) badge = 'acceptable';
        }
        return { value: e.id, label: locale === 'en' ? (e.nameEn ?? e.name) : e.name, badge };
      })
      .sort((a, b) => {
        const pd = priority(a.badge) - priority(b.badge);
        if (pd !== 0) return pd;
        return a.label.localeCompare(b.label, locale === 'en' ? 'en' : 'ja', { sensitivity: 'base' });
      });
  }, [echoList, locale, selectedCharId]);

  const harmonyOptions = useMemo(() => {
    const char = selectedCharId !== 'generic' ? CHARACTER_MAP[selectedCharId] : undefined;
    const recSets = char ? new Set(char.harmonySets.recommended) : new Set<string>();
    const accSets = char ? new Set(char.harmonySets.acceptable) : new Set<string>();
    const priority = (b?: 'recommended' | 'acceptable') =>
      b === 'recommended' ? 0 : b === 'acceptable' ? 1 : 2;

    const items = harmonySetOptions.map((s, i) => {
      let badge: 'recommended' | 'acceptable' | undefined;
      if (char) {
        if (recSets.has(s)) badge = 'recommended';
        else if (accSets.has(s)) badge = 'acceptable';
      }
      return { value: s, label: locale === 'en' ? (HARMONY_SETS_EN[s] ?? s) : s, badge, _i: i };
    });
    items.sort((a, b) => {
      const pd = priority(a.badge) - priority(b.badge);
      return pd !== 0 ? pd : a._i - b._i;
    });
    return items.map(({ _i: _, ...opt }) => opt);
  }, [harmonySetOptions, locale, selectedCharId]);

  const mainstatOptions = useMemo(() => {
    const char = selectedCharId !== 'generic' ? CHARACTER_MAP[selectedCharId] : undefined;
    const costKey = `cost${cost}` as 'cost4' | 'cost3' | 'cost1';
    const recKeys = char ? new Set(char.mainstat[costKey].recommended) : new Set<string>();
    const accKeys = char ? new Set(char.mainstat[costKey].acceptable) : new Set<string>();
    const priority = (b?: 'recommended' | 'acceptable') =>
      b === 'recommended' ? 0 : b === 'acceptable' ? 1 : 2;

    return MAINSTAT_POOLS[cost]
      .map((m, i) => {
        let badge: 'recommended' | 'acceptable' | undefined;
        if (char) {
          if (recKeys.has(m.key)) badge = 'recommended';
          else if (accKeys.has(m.key)) badge = 'acceptable';
        }
        return {
          value: m.key,
          label: `${locale === 'en' ? (MAINSTAT_LABEL_EN[m.key] ?? m.label) : m.label}（+25: ${m.value}${m.unit}）`,
          badge,
          _i: i,
        };
      })
      .sort((a, b) => {
        const pd = priority(a.badge) - priority(b.badge);
        return pd !== 0 ? pd : a._i - b._i;
      })
      .map(({ _i: _, ...opt }) => opt);
  }, [cost, locale, selectedCharId]);
  const showRerollPanel   = bonusActive && echo?.level === 25 && !rerollUsed;
  const showMainstatLock  = bonusActive;
  const formatTime  = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--home-bg)', color: 'var(--home-text)' }}
    >

      {/* ── Header ────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30"
        style={{ background: 'var(--home-bg)', borderBottom: '1px solid var(--home-border)' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <EchoIcon size={28} color={ACCENT} />
            <span
              className="text-base tracking-tight"
              style={{ color: 'var(--home-text)', fontFamily: 'var(--font-display-serif)' }}
            >
              {T.appTitle}
            </span>
          </div>

          {/* Nav buttons — 常時出すのはモード切替と ☰ のみ。
              テーマ・履歴・ボーナス開放は ☰ に集約している */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Mode switcher: ガチャ（シミュレーター） / 厳選管理（サポーター） */}
            <div
              className="flex items-center rounded-lg p-0.5 shrink-0"
              style={{ background: 'var(--home-surface)' }}
              title={locale === 'ja' ? 'ゲーム感覚で理論値を試す' : 'Try theoretical odds, game-style'}
            >
              <span
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold"
                style={{ background: 'var(--home-card)', color: ACCENT, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}
              >
                <Dices size={13} />
                <span className="hidden sm:inline">{locale === 'ja' ? 'ガチャ' : 'Gacha'}</span>
              </span>
              <Link
                href={withLang('/supporter', locale)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors"
                style={{ color: 'var(--home-text-sub)' }}
                title={locale === 'ja' ? '実際の厳選を記録・管理する' : 'Log and manage your real pulls'}
              >
                <BarChart3 size={13} />
                <span className="hidden sm:inline">{locale === 'ja' ? '厳選管理' : 'Manage'}</span>
              </Link>
            </div>

            {/* ボーナス発動中の残り時間。未発動時は ☰ と本文カードから開放する */}
            {bonusActive && (
              <div
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium border"
                style={{ borderColor: `${ACCENT}44`, color: ACCENT, background: 'var(--home-accent-bg)' }}
              >
                <Sparkles size={13} className="animate-pulse" />
                <span style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}

            {/* Overflow menu */}
            <div className="relative shrink-0">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="relative flex items-center justify-center w-8 h-8 rounded-lg text-sm transition-colors border border-[#e5e7eb] text-[#707070] hover:text-[#222222] hover:border-[#d1d5db]"
                aria-label={locale === 'ja' ? 'メニュー' : 'Menu'}
              >
                <Menu size={16} />
                {hasNewUpdate && (
                  <span
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white"
                    style={{ background: ACCENT }}
                  />
                )}
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div
                    className="absolute right-0 top-full mt-2 z-50 w-52 rounded-xl bg-white overflow-hidden"
                    style={{ border: '1px solid #e5e7eb', boxShadow: 'var(--shadow-3)' }}
                  >
                    {/* ── 操作 ── */}
                    {!bonusActive && (
                      <button
                        onClick={() => { openBonusModal('bonus'); setMenuOpen(false); }}
                        className={`${MENU_ITEM} w-full text-left`}
                        style={{ color: ACCENT }}
                      >
                        <Gift size={14} />
                        <span>{T.bonusBtn}</span>
                      </button>
                    )}
                    <button
                      onClick={() => { setHistoryOpen(true); setMenuOpen(false); }}
                      className={`${MENU_ITEM} w-full text-left`}
                    >
                      <History size={14} />
                      <span>{T.historyBtn}</span>
                      {savedResults.length > 0 && (
                        <span
                          className="ml-auto min-w-4 h-4 px-1 rounded-full text-[9px] font-semibold flex items-center justify-center text-white"
                          style={{ background: ACCENT }}
                        >
                          {savedResults.length}
                        </span>
                      )}
                    </button>

                    {/* ── ページ ── */}
                    <Link
                      href={withLang('/guide', locale)}
                      onClick={() => setMenuOpen(false)}
                      className={MENU_ITEM}
                      style={{ borderTop: '1px solid #f3f4f6' }}
                    >
                      <BookOpen size={14} />
                      <span>{locale === 'ja' ? '使い方ガイド' : 'How to Use'}</span>
                    </Link>
                    <Link
                      href={withLang('/score-formula', locale)}
                      onClick={() => setMenuOpen(false)}
                      className={MENU_ITEM}
                    >
                      <Calculator size={14} />
                      <span>{locale === 'ja' ? 'スコア計算方法' : 'Scoring Method'}</span>
                    </Link>
                    <Link
                      href={withLang('/chardb', locale)}
                      onClick={() => setMenuOpen(false)}
                      className={MENU_ITEM}
                    >
                      <Users size={14} />
                      <span>{locale === 'ja' ? 'キャラ別ビルド' : 'Build Data'}</span>
                    </Link>
                    <Link
                      href={withLang('/news', locale)}
                      onClick={() => setMenuOpen(false)}
                      className={MENU_ITEM}
                    >
                      <Bell size={14} />
                      <span>{locale === 'ja' ? 'お知らせ' : "What's New"}</span>
                      {hasNewUpdate && (
                        <span className="ml-auto w-2 h-2 rounded-full" style={{ background: ACCENT }} />
                      )}
                    </Link>

                    {/* ── 表示設定 ── */}
                    <div style={{ borderTop: '1px solid #f3f4f6' }}>
                      <SiteThemeSwitcher variant="menu" />
                    </div>
                    <button
                      onClick={() => { toggleLocale(); setMenuOpen(false); }}
                      className={`${MENU_ITEM} w-full text-left`}
                    >
                      <Globe size={14} />
                      <span>{locale === 'ja' ? 'English に切替' : '日本語に切替'}</span>
                    </button>

                    {/* ── サイト情報 ── */}
                    <Link
                      href={withLang('/about', locale)}
                      onClick={() => setMenuOpen(false)}
                      className={MENU_ITEM}
                      style={{ borderTop: '1px solid #f3f4f6' }}
                    >
                      <Info size={14} />
                      <span>{locale === 'ja' ? 'このサイトについて' : 'About'}</span>
                    </Link>
                    <Link
                      href={withLang('/privacy', locale)}
                      onClick={() => setMenuOpen(false)}
                      className={MENU_ITEM}
                    >
                      <FileText size={14} />
                      <span>{locale === 'ja' ? 'プライバシーポリシー' : 'Privacy Policy'}</span>
                    </Link>
                    <Link
                      href={withLang('/contact', locale)}
                      onClick={() => setMenuOpen(false)}
                      className={MENU_ITEM}
                    >
                      <Mail size={14} />
                      <span>{locale === 'ja' ? 'お問い合わせ' : 'Contact'}</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className={`flex-1 max-w-2xl w-full mx-auto px-4 py-8 flex flex-col gap-8 sm:pb-28 ${showAdvisorInBar ? 'pb-56' : 'pb-28'}`}>

        {/* Character selector */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center gap-1.5">
            <Swords size={14} />
            <label
              className="text-xs font-medium uppercase tracking-wider text-[#9ca3af]"
              style={{ fontFamily: '"IBM Plex Mono", monospace' }}
            >
              {T.charLabel}
            </label>
          </div>
          <CustomSelect
            value={selectedCharId}
            onChange={handleCharacterChange}
            options={charOptions}
            accentColor={SEL.charAccent}
            background={SEL.charBg}
            borderColor={SEL.charBorder}
            textColor={SEL.text}
            dropdownBg={SEL.dropdownBg}
          />
        </div>

        {/* Cost selector */}
        <div className="flex flex-col gap-2">
          <label
            className="text-xs font-medium uppercase tracking-wider text-[#9ca3af] text-center"
            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
          >
            {T.costLabel}
          </label>
          <div className="flex gap-2 justify-center">
            {COST_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => handleCostChange(c)}
                className="px-6 py-2.5 rounded-[500px] font-medium text-sm transition-all"
                style={
                  cost === c
                    ? { background: 'var(--home-cta-bg)', color: 'var(--home-cta-text)', boxShadow: 'var(--home-cta-shadow)' }
                    : { background: 'var(--home-surface)', border: '1px solid var(--home-border)', color: 'var(--home-text-sub)' }
                }
              >
                COST {c}
              </button>
            ))}
          </div>
          <div
            className="text-center text-xs text-[#9ca3af]"
            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
          >
            {interpolate(T.costSubstats, [SUBSTAT_COUNT[cost]])}
          </div>
        </div>

        {/* Main stat lock (bonus only) */}
        {showMainstatLock && (
          <div
            className="flex flex-col gap-2 rounded-xl p-4 border"
            style={{ borderColor: `${ACCENT}44`, background: 'var(--home-accent-bg)' }}
          >
            <div
              className="text-xs font-medium text-center uppercase tracking-wider"
              style={{ color: ACCENT, fontFamily: '"IBM Plex Mono", monospace' }}
            >
              {T.bonusMainTitle}
            </div>
            <CustomSelect
              value={lockedMainstatKey}
              onChange={setLockedMainstatKey}
              options={mainstatOptions}
              accentColor={ACCENT}
              background={SEL.dropdownBg}
              borderColor={`${ACCENT}44`}
              textColor={SEL.text}
              dropdownBg={SEL.dropdownBg}
            />
            <p className="text-xs text-center" style={{ color: `${ACCENT}99` }}>{T.bonusMainHint}</p>
          </div>
        )}

        {/* Echo / Harmony selector */}
        {cost === 4 ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-1.5">
              <EchoIcon size={14} color={ACCENT} />
              <label
                className="text-xs font-medium uppercase tracking-wider text-[#9ca3af]"
                style={{ fontFamily: '"IBM Plex Mono", monospace' }}
              >
                {T.echoSelectLabel}
              </label>
            </div>
            <CustomSelect
              value={selectedEchoId}
              onChange={(v) => { setSelectedEchoId(v); setEcho(null); setScore(null); }}
              options={echoOptions}
              accentColor={SEL.echoAccent}
              background={SEL.echoBg}
              borderColor={SEL.echoBorder}
              textColor={SEL.text}
              dropdownBg={SEL.dropdownBg}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-1.5">
              <EchoIcon size={14} color={ACCENT} />
              <label
                className="text-xs font-medium uppercase tracking-wider text-[#9ca3af]"
                style={{ fontFamily: '"IBM Plex Mono", monospace' }}
              >
                {T.harmonySelectLabel}
              </label>
            </div>
            <CustomSelect
              value={selectedHarmonySet}
              onChange={(v) => { setSelectedHarmonySet(v); setEcho(null); setScore(null); }}
              options={harmonyOptions}
              accentColor={SEL.echoAccent}
              background={SEL.echoBg}
              borderColor={SEL.echoBorder}
              textColor={SEL.text}
              dropdownBg={SEL.dropdownBg}
            />
            <div
              className="text-center text-xs text-[#9ca3af]"
              style={{ fontFamily: '"IBM Plex Mono", monospace' }}
            >
              {interpolate(T.harmonyCount, [ECHOES.filter(e => e.cost === cost && e.sets.includes(selectedHarmonySet)).length])}
            </div>
          </div>
        )}

        {/* Echo card
            scroll-my-20: 自動スクロールの基準余白。上下対称にすることで
            block:'start' では sticky ヘッダー(59px)を避け、
            block:'center' では上下が相殺されて正確に中央へ来る */}
        {echo && (
          <div ref={echoSectionRef} className="flex flex-col items-center gap-4 scroll-my-20">
            <EchoCard echo={echo} score={score} maxedAt={maxedAt} />

            {/* アドバイザー: PC は直下に表示 / スマホは下固定バーに表示（showAdvisorInBar） */}
            {advisorResult && echo.level > 0 && echo.level < 25 && (
              <div className="hidden sm:block w-full">
                <EchoAdvisor result={advisorResult} />
              </div>
            )}

            {score && isMaxLevel && (
              <div className="w-full flex flex-col gap-2">
                <ScoreDebugPanel echo={echo} score={score} />

                {/* ── PC: アクションボタンをインライン表示 ── */}
                <div className="hidden sm:flex flex-col gap-2 w-full">
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (!echo || !score) return;
                        setDownloading(true);
                        try {
                          const dataUrl = await generateResultCard(echo, score, locale, maxedAt ?? undefined);
                          const a = document.createElement('a');
                          a.href = dataUrl;
                          a.download = `echo-${score.rank}-${score.score}pt.png`;
                          a.click();
                        } finally { setDownloading(false); }
                      }}
                      disabled={downloading}
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-[#e5e7eb] text-[#707070] hover:text-[#222222] hover:border-[#d1d5db] transition-colors disabled:opacity-50"
                    >
                      {downloading ? <Loader2 size={14} className="animate-spin mx-auto" /> : T.imgSave}
                    </button>
                    <button
                      onClick={() => {
                        const char = selectedCharId !== 'generic' ? CHARACTER_MAP[selectedCharId] : undefined;
                        const charName = char ? (locale === 'en' ? char.nameEn : char.name) : undefined;
                        const text = buildShareText(echo, score, { locale, charName });
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                      }}
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-[#e5e7eb] text-[#707070] hover:text-[#222222] hover:border-[#d1d5db] transition-colors"
                    >
                      {T.shareBtn}
                    </button>
                    {saveSlots > 0 && (
                      <button
                        onClick={handleSave}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors"
                        style={{ borderColor: '#10b98144', background: '#f0fdf4', color: '#059669' }}
                      >
                        {T.saveBtn}
                        <span className="block text-[10px] opacity-70">{interpolate(T.saveSlotsLeft, [saveSlots])}</span>
                      </button>
                    )}
                  </div>
                  {saveSlots === 0 && (
                    <button
                      onClick={() => openBonusModal('saves')}
                      className="w-full py-2.5 rounded-[500px] text-sm font-medium hover:opacity-80 transition-opacity"
                      style={{ background: 'var(--home-cta-bg)', color: 'var(--home-cta-text)', boxShadow: 'var(--home-cta-shadow)' }}
                    >
                      {interpolate(T.saveCTABtn, [SAVE_PER_UNLOCK])}
                    </button>
                  )}
                  <Link
                    href={withLang('/supporter', locale)}
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-[500px] text-sm font-medium transition-colors"
                    style={{ background: 'var(--home-accent-bg)', color: ACCENT, border: `1px solid ${ACCENT}33` }}
                  >
                    {T.resultTrackerCTA}
                  </Link>
                </div>

                {/* ── スマホ: モーダルを再表示するボタン ── */}
                {!showResultModal && (
                  <button
                    onClick={() => setShowResultModal(true)}
                    className="sm:hidden w-full py-2.5 rounded-[500px] text-sm font-medium border transition-colors"
                    style={{ borderColor: `${ACCENT}44`, color: ACCENT }}
                  >
                    {T.resultShowBtn}
                  </button>
                )}
              </div>
            )}

          </div>
        )}

        {/* Reroll panel */}
        {showRerollPanel && echo && (
          <div
            className="rounded-xl border p-4 flex flex-col gap-3"
            style={{ borderColor: `${ACCENT}44`, background: 'var(--home-accent-bg)' }}
          >
            <div
              className="text-xs font-medium text-center uppercase tracking-wider"
              style={{ color: ACCENT, fontFamily: '"IBM Plex Mono", monospace' }}
            >
              {interpolate(T.rerollPanelTitle, [MAX_REROLL])}
            </div>
            <div className="space-y-1.5">
              {echo.substats.map((s, i) => {
                const selected = rerollIndices.has(i);
                const disabled = !selected && rerollIndices.size >= MAX_REROLL;
                return (
                  <button
                    key={i}
                    onClick={() => !disabled && toggleRerollIndex(i)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all"
                    style={{
                      background: selected ? `${ACCENT}0f` : '#ffffff',
                      border: selected ? `1px solid ${ACCENT}66` : '1px solid #e5e7eb',
                      opacity: disabled ? 0.4 : 1,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <span className="text-[#222222] font-medium">{s.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#707070]">{s.value}{s.unit}</span>
                      {selected && (
                        <span
                          className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                          style={{ background: `${ACCENT}18`, color: ACCENT }}
                        >
                          {T.rerollBadge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleReroll}
              disabled={rerollIndices.size === 0}
              className="w-full py-2.5 rounded-[500px] font-medium text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: rerollIndices.size > 0 ? 'var(--home-cta-bg)' : '#9ca3af',
                color: rerollIndices.size > 0 ? 'var(--home-cta-text)' : '#f7f7f7',
                boxShadow: rerollIndices.size > 0 ? 'var(--home-cta-shadow)' : 'none',
              }}
            >
              {rerollIndices.size > 0
                ? interpolate(T.rerollBtn, [rerollIndices.size])
                : T.rerollSelect}
            </button>
          </div>
        )}

        {bonusActive && echo?.level === 25 && rerollUsed && (
          <div
            className="text-center text-xs"
            style={{ color: `${ACCENT}80` }}
          >
            {T.rerollUsed}
          </div>
        )}

        {/* Empty state */}
        {!echo && (
          <div className="flex flex-col items-center gap-6 py-8 text-center">
            <div>
              <p className="text-[#707070] text-sm max-w-xs leading-relaxed mx-auto" style={{ lineHeight: 1.7 }}>
                {T.emptyText}
              </p>
            </div>

            {!bonusActive && (
              <div
                className="w-full rounded-2xl overflow-hidden animate-fadeUp"
                style={{ background: 'var(--home-card)', border: '1px solid var(--home-border)', boxShadow: 'var(--shadow-1)' }}
              >
                {/* Top accent stripe */}
                <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT}88)` }} />
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--home-card-text)' }}>
                      <Gift size={15} /> {T.bonusCardTitle}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white shrink-0"
                      style={{ background: ACCENT }}
                    >
                      {T.bonusFree}
                    </span>
                  </div>
                  {/* Benefits */}
                  <div className="space-y-2.5 mb-4 text-left">
                    {[T.bonusCardBenefit1, T.bonusCardBenefit2, T.bonusCardBenefit3].map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm">
                        <span
                          className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white mt-0.5"
                          style={{ background: ACCENT }}
                        >
                          <Check size={12} strokeWidth={3} />
                        </span>
                        <span className="leading-snug" style={{ color: 'var(--home-card-text)' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                  {/* Duration badge */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <Clock size={12} className="text-[#9ca3af]" />
                    <span className="text-xs font-medium" style={{ color: ACCENT }}>{T.bonusValidFor}</span>
                  </div>
                  {/* Ad note */}
                  <p className="text-xs text-[#9ca3af] mb-4">{T.bonusNote}</p>
                  {/* CTA */}
                  <button
                    onClick={() => openBonusModal('bonus')}
                    className="w-full py-3 rounded-[500px] text-sm font-semibold hover:opacity-80 transition-opacity animate-pulseRing"
                    style={{ background: 'var(--home-cta-bg)', color: 'var(--home-cta-text)', boxShadow: 'var(--home-cta-shadow)' }}
                  >
                    {T.bonusCTA}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <HomeExplainer />
        <AdBanner />
      </main>

      {/* ── Sticky bottom action bar ─────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 inset-x-0 z-20 backdrop-blur-sm"
        style={{
          background: 'color-mix(in srgb, var(--home-bg) 95%, transparent)',
          borderTop: '1px solid var(--home-border)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="max-w-2xl mx-auto px-4 pt-2 pb-3">
          {/* アドバイザー: スマホのみ・コンパクト版（PCはメインコンテンツに表示） */}
          {showAdvisorInBar && (
            <div className="sm:hidden mb-2">
              <EchoAdvisor result={advisorResult!} compact />
            </div>
          )}

          {/* Progress hint */}
          {echo && !isMaxLevel && echo.level > 0 && (
            <p
              className="text-[11px] text-[#9ca3af] text-center mb-2"
              style={{ fontFamily: '"IBM Plex Mono", monospace' }}
            >
              {interpolate(T.untilMax, [(25 - echo.level) / 5])}
            </p>
          )}

          {!echo ? (
            /* ── No echo: Get Echo CTA ── */
            <button
              onClick={handleStart}
              className="w-full py-3 rounded-[500px] font-semibold text-sm hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
              style={{ background: 'var(--home-cta-bg)', color: 'var(--home-cta-text)', boxShadow: 'var(--home-cta-shadow)' }}
            >
              <EchoIcon size={15} color="var(--home-cta-text)" bgColor={CTA_SOLID} />
              {T.getEcho}
            </button>
          ) : !isMaxLevel ? (
            /* ── Upgrading: level-up controls ── */
            <div className="flex items-center gap-2">
              <button
                onClick={handleUpgrade}
                className="flex-1 py-3 rounded-[500px] font-semibold text-sm hover:opacity-80 transition-opacity"
                style={{ background: 'var(--home-cta-bg)', color: 'var(--home-cta-text)', boxShadow: 'var(--home-cta-shadow)' }}
              >
                +5 → +{echo.level + 5}
              </button>
              {bonusActive && (
                <button
                  onClick={handleMaxUpgrade}
                  className="px-4 py-3 rounded-[500px] font-medium text-sm border hover:opacity-80 transition-opacity shrink-0"
                  style={{ borderColor: `${ACCENT}66`, color: ACCENT, background: 'var(--home-accent-bg)' }}
                >
                  {T.maxUpgrade}
                </button>
              )}
              <button
                onClick={handleReset}
                className="px-4 py-3 rounded-[500px] text-sm border hover:opacity-70 transition-colors shrink-0"
                style={{ color: 'var(--home-text-sub)', borderColor: 'var(--home-border)' }}
              >
                {T.resetBtn}
              </button>
            </div>
          ) : (
            /* ── Maxed: next echo or reset ── */
            <div className="flex items-center gap-2">
              <button
                onClick={handleStart}
                className="flex-1 py-3 rounded-[500px] font-semibold text-sm hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
                style={{ background: 'var(--home-cta-bg)', color: 'var(--home-cta-text)', boxShadow: 'var(--home-cta-shadow)' }}
              >
                <EchoIcon size={15} color="var(--home-cta-text)" bgColor={CTA_SOLID} />
                {T.getEcho}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-3 rounded-[500px] text-sm border hover:opacity-70 transition-colors shrink-0"
                style={{ color: 'var(--home-text-sub)', borderColor: 'var(--home-border)' }}
              >
                {T.resetBtn}
              </button>
            </div>
          )}
        </div>
      </div>

      <footer
        className="border-t pt-6 pb-32"
        style={{ borderColor: 'var(--home-border)' }}
      >
        <nav className="max-w-2xl mx-auto px-4 flex flex-wrap justify-center gap-x-4 gap-y-2 mb-4">
          {FOOTER_LINKS.map(({ href, ja, en }) => (
            <Link
              key={href}
              href={withLang(href, locale)}
              className="text-xs hover:opacity-70 transition-opacity"
              style={{ color: 'var(--home-text-sub)' }}
            >
              {locale === 'ja' ? ja : en}
            </Link>
          ))}
        </nav>
        <p className="text-center text-xs" style={{ color: 'var(--home-text-sub)' }}>{T.footer}</p>
      </footer>

      {updateModalOpen && (
        <UpdateModal
          onClose={() => {
            localStorage.setItem('lastSeenUpdate', LATEST_UPDATE_ID);
            setUpdateModalOpen(false);
            setHasNewUpdate(false);
          }}
        />
      )}

      {bonusModalOpen && (
        <BonusModal
          {...bonusConfigs[bonusKind]}
          onGrantBonus={handleGrantBonus}
          onClose={() => setBonusModalOpen(false)}
        />
      )}

      {historyOpen && (
        <SavedResultsModal
          results={savedResults}
          onClear={handleClearSaved}
          onClose={() => setHistoryOpen(false)}
        />
      )}

      {/* ── Result modal (auto-shows at +25) ─────────────────────── */}
      {showResultModal && echo && score && isMaxLevel && (
        <div
          className="sm:hidden fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowResultModal(false)}
        >
          <div
            className="w-full rounded-t-3xl bg-white shadow-2xl animate-fadeUp max-h-[88vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-2.5 pb-1 sticky top-0 bg-white">
              <div className="w-8 h-1 rounded-full bg-[#e5e7eb]" />
            </div>

            <div className="px-4 pt-1 pb-2 flex flex-col gap-1.5">
              {/* Compact card (display only — image export uses hidden full card) */}
              <EchoCard echo={echo} score={score} maxedAt={maxedAt} compact />

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (!echo || !score) return;
                    setDownloading(true);
                    try {
                      const dataUrl = await generateResultCard(echo, score, locale, maxedAt ?? undefined);
                      const a = document.createElement('a');
                      a.href = dataUrl;
                      a.download = `echo-${score.rank}-${score.score}pt.png`;
                      a.click();
                    } finally {
                      setDownloading(false);
                    }
                  }}
                  disabled={downloading}
                  className="flex-1 py-1.5 rounded-lg text-sm font-medium border border-[#e5e7eb] text-[#707070] hover:text-[#222222] hover:border-[#d1d5db] transition-colors disabled:opacity-50"
                >
                  {downloading ? <Loader2 size={14} className="animate-spin mx-auto" /> : T.imgSave}
                </button>
                <button
                  onClick={() => {
                    const char = selectedCharId !== 'generic' ? CHARACTER_MAP[selectedCharId] : undefined;
                    const charName = char ? (locale === 'en' ? char.nameEn : char.name) : undefined;
                    const text = buildShareText(echo, score, { locale, charName });
                    window.open(
                      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
                      '_blank', 'noopener,noreferrer'
                    );
                  }}
                  className="flex-1 py-1.5 rounded-lg text-sm font-medium border border-[#e5e7eb] text-[#707070] hover:text-[#222222] hover:border-[#d1d5db] transition-colors"
                >
                  {T.shareBtn}
                </button>
                {saveSlots > 0 && (
                  <button
                    onClick={() => { handleSave(); setShowResultModal(false); }}
                    className="flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                    style={{ borderColor: '#10b98144', background: '#f0fdf4', color: '#059669' }}
                  >
                    {T.saveBtn}
                    <span className="block text-[10px] opacity-70">{interpolate(T.saveSlotsLeft, [saveSlots])}</span>
                  </button>
                )}
              </div>

              {/* Save CTA — compact single button (no card) */}
              {saveSlots === 0 && (
                <button
                  onClick={() => { openBonusModal('saves'); setShowResultModal(false); }}
                  className="w-full py-1.5 rounded-[500px] text-sm font-medium hover:opacity-80 transition-opacity"
                  style={{ background: 'var(--home-cta-bg)', color: 'var(--home-cta-text)', boxShadow: 'var(--home-cta-shadow)' }}
                >
                  {interpolate(T.saveCTABtn, [SAVE_PER_UNLOCK])}
                </button>
              )}

              {/* Tracker CTA — bridge from casual simulation to real farming */}
              <Link
                href={withLang('/supporter', locale)}
                onClick={() => setShowResultModal(false)}
                className="flex items-center justify-center gap-1 w-full py-1.5 rounded-[500px] text-sm font-medium transition-colors"
                style={{ background: 'var(--home-accent-bg)', color: ACCENT, border: `1px solid ${ACCENT}33` }}
              >
                {T.resultTrackerCTA}
              </Link>

              {/* Close */}
              <button
                onClick={() => setShowResultModal(false)}
                className="w-full py-1.5 rounded-[500px] text-sm text-[#9ca3af] border border-[#e5e7eb] hover:text-[#222222] hover:border-[#d1d5db] transition-colors"
              >
                {T.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
