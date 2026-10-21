'use client';

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
import SiteHeader from '@/components/site/SiteHeader';
import { useSiteAppearance } from '@/contexts/SiteAppearanceContext';
import { elementKeyOf } from '@/components/home/elementTheme';
import {
  Sparkles, Gift, History,
  Swords, Clock, Check, Loader2,
} from 'lucide-react';

const COST_OPTIONS: EchoCost[] = [4, 3, 1];

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
  { href: '/',              ja: '厳選サポーター',         en: 'Farming Supporter' },
  { href: '/news',          ja: 'お知らせ',               en: "What's New" },
  { href: '/about',         ja: 'このサイトについて',     en: 'About' },
  { href: '/privacy',       ja: 'プライバシーポリシー',   en: 'Privacy Policy' },
  { href: '/contact',       ja: 'お問い合わせ',           en: 'Contact' },
] as const;

type BonusKind = 'bonus' | 'saves';

/** SiteHeader のメニューに足す項目の行スタイル(SiteHeader の項目と揃える) */
const MENU_ITEM =
  'flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors hover:bg-[var(--hd-raise)]';


export default function GachaClient() {
  const { locale } = useLocale();
  const T = TRANSLATIONS[locale];
  const { mode, setCharacter, savedCharId, accentHex } = useSiteAppearance();

  /** CustomSelect に渡す色(hex が必要なため CSS 変数ではなく実値)。キャラ・音骸とも同じ */
  const selectColors = {
    accentColor: accentHex,
    textColor: mode === 'dark' ? '#ECEFF3' : '#161A21',
    background: mode === 'dark' ? '#222833' : '#FFFFFF',
    borderColor: mode === 'dark' ? '#333B47' : '#D3D9E1',
    dropdownBg: mode === 'dark' ? '#222833' : '#FFFFFF',
  };

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
    const char = charId !== 'generic' ? CHARACTER_MAP[charId] : undefined;
    setCharacter(charId, elementKeyOf(char?.element));
  }, [cost, setCharacter]);

  // 保存したキャラの復元(マウント直後・下書きが空の一度だけ)
  const restoredCharRef = useRef(false);
  useEffect(() => {
    if (restoredCharRef.current || !savedCharId) return;
    if (savedCharId === selectedCharId) {
      restoredCharRef.current = true;
      return;
    }
    if (savedCharId === 'generic' || CHARACTER_LIST.some((c) => c.id === savedCharId)) {
      restoredCharRef.current = true;
      handleCharacterChange(savedCharId);
    }
  }, [savedCharId, selectedCharId, handleCharacterChange]);

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

  /* ── SiteHeader に渡す部品 ─────────────────────────────────── */
  // ボーナス発動中の残り時間。未発動時はメニューと本文カードから開放する
  const bonusTimeBadge = bonusActive ? (
    <div
      className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium border shrink-0"
      style={{ borderColor: 'var(--hd-accent)', color: 'var(--hd-accent-text)', background: 'var(--hd-accent-soft)' }}
    >
      <Sparkles size={13} className="animate-pulse" style={{ color: 'var(--hd-accent)' }} />
      <span className="hd-num">{formatTime(timeLeft)}</span>
    </div>
  ) : null;

  const extraMenuItems = (
    <>
      {!bonusActive && (
        <button
          type="button"
          onClick={() => openBonusModal('bonus')}
          className={`${MENU_ITEM} w-full text-left`}
          style={{ color: 'var(--hd-accent-text)' }}
        >
          <span className="shrink-0" style={{ color: 'var(--hd-accent)' }}><Gift size={14} /></span>
          <span>{T.bonusBtn}</span>
        </button>
      )}
      <button
        type="button"
        onClick={() => setHistoryOpen(true)}
        className={`${MENU_ITEM} w-full text-left`}
        style={{ color: 'var(--hd-fg)' }}
      >
        <span className="shrink-0" style={{ color: 'var(--hd-sub)' }}><History size={14} /></span>
        <span>{T.historyBtn}</span>
        {savedResults.length > 0 && (
          <span
            className="ml-auto min-w-4 h-4 px-1 rounded-full text-[9px] font-semibold flex items-center justify-center"
            style={{ background: 'var(--hd-accent)', color: 'var(--hd-accent-ink)' }}
          >
            {savedResults.length}
          </span>
        )}
      </button>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col">

      <SiteHeader
        title={T.appTitle}
        center={bonusTimeBadge}
        extraMenuItems={extraMenuItems}
        hasNewUpdate={hasNewUpdate}
      />

      <main className={`flex-1 max-w-2xl w-full mx-auto px-4 py-8 flex flex-col gap-8 sm:pb-28 ${showAdvisorInBar ? 'pb-56' : 'pb-28'}`}>

        {/* Character selector */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center gap-1.5">
            <Swords size={14} />
            <label
              className="hd-num text-xs font-medium uppercase tracking-wider text-[var(--hd-sub)]"
            >
              {T.charLabel}
            </label>
          </div>
          <CustomSelect
            value={selectedCharId}
            onChange={handleCharacterChange}
            options={charOptions}
            {...selectColors}
          />
        </div>

        {/* Cost selector */}
        <div className="flex flex-col gap-2">
          <label
            className="hd-num text-xs font-medium uppercase tracking-wider text-[var(--hd-sub)] text-center"
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
                    ? { background: 'var(--hd-accent)', color: 'var(--hd-accent-ink)' }
                    : { background: 'var(--hd-raise)', border: '1px solid var(--hd-line)', color: 'var(--hd-sub)' }
                }
              >
                COST {c}
              </button>
            ))}
          </div>
          <div
            className="hd-num text-center text-xs text-[var(--hd-sub)]"
          >
            {interpolate(T.costSubstats, [SUBSTAT_COUNT[cost]])}
          </div>
        </div>

        {/* Main stat lock (bonus only) */}
        {showMainstatLock && (
          <div
            className="flex flex-col gap-2 rounded-xl p-4 border"
            style={{ borderColor: 'var(--hd-line)', background: 'var(--hd-accent-soft)' }}
          >
            <div
              className="hd-num text-xs font-medium text-center uppercase tracking-wider"
              style={{ color: 'var(--hd-accent-text)' }}
            >
              {T.bonusMainTitle}
            </div>
            <CustomSelect
              value={lockedMainstatKey}
              onChange={setLockedMainstatKey}
              options={mainstatOptions}
              {...selectColors}
            />
            <p className="text-xs text-center" style={{ color: 'var(--hd-accent-text)' }}>{T.bonusMainHint}</p>
          </div>
        )}

        {/* Echo / Harmony selector */}
        {cost === 4 ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-1.5">
              <EchoIcon size={14} color={accentHex} />
              <label
                className="hd-num text-xs font-medium uppercase tracking-wider text-[var(--hd-sub)]"
              >
                {T.echoSelectLabel}
              </label>
            </div>
            <CustomSelect
              value={selectedEchoId}
              onChange={(v) => { setSelectedEchoId(v); setEcho(null); setScore(null); }}
              options={echoOptions}
              {...selectColors}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-1.5">
              <EchoIcon size={14} color={accentHex} />
              <label
                className="hd-num text-xs font-medium uppercase tracking-wider text-[var(--hd-sub)]"
              >
                {T.harmonySelectLabel}
              </label>
            </div>
            <CustomSelect
              value={selectedHarmonySet}
              onChange={(v) => { setSelectedHarmonySet(v); setEcho(null); setScore(null); }}
              options={harmonyOptions}
              {...selectColors}
            />
            <div
              className="hd-num text-center text-xs text-[var(--hd-sub)]"
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
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-[var(--hd-line)] text-[var(--hd-sub)] hover:text-[var(--hd-fg)] hover:border-[var(--hd-sub)] transition-colors disabled:opacity-50"
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
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-[var(--hd-line)] text-[var(--hd-sub)] hover:text-[var(--hd-fg)] hover:border-[var(--hd-sub)] transition-colors"
                    >
                      {T.shareBtn}
                    </button>
                    {saveSlots > 0 && (
                      <button
                        onClick={handleSave}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors"
                        style={{ borderColor: '#10b98144', background: '#10b9811f', color: 'var(--hd-fg)' }}
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
                      style={{ background: 'var(--hd-accent)', color: 'var(--hd-accent-ink)' }}
                    >
                      {interpolate(T.saveCTABtn, [SAVE_PER_UNLOCK])}
                    </button>
                  )}
                  <Link
                    href={withLang('/', locale)}
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-[500px] text-sm font-medium transition-colors"
                    style={{ background: 'var(--hd-accent-soft)', color: 'var(--hd-accent-text)', border: '1px solid var(--hd-line)' }}
                  >
                    {T.resultTrackerCTA}
                  </Link>
                </div>

                {/* ── スマホ: モーダルを再表示するボタン ── */}
                {!showResultModal && (
                  <button
                    onClick={() => setShowResultModal(true)}
                    className="sm:hidden w-full py-2.5 rounded-[500px] text-sm font-medium border transition-colors"
                    style={{ borderColor: 'var(--hd-accent)', color: 'var(--hd-accent-text)' }}
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
            style={{ borderColor: 'var(--hd-line)', background: 'var(--hd-accent-soft)' }}
          >
            <div
              className="hd-num text-xs font-medium text-center uppercase tracking-wider"
              style={{ color: 'var(--hd-accent-text)' }}
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
                      background: selected ? 'var(--hd-accent-soft)' : 'var(--hd-plate)',
                      border: selected ? '1px solid var(--hd-accent)' : '1px solid var(--hd-line)',
                      opacity: disabled ? 0.4 : 1,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <span className="text-[var(--hd-fg)] font-medium">{s.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--hd-sub)]">{s.value}{s.unit}</span>
                      {selected && (
                        <span
                          className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                          style={{ background: 'var(--hd-accent)', color: 'var(--hd-accent-ink)' }}
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
                background: rerollIndices.size > 0 ? 'var(--hd-accent)' : 'var(--hd-raise)',
                color: rerollIndices.size > 0 ? 'var(--hd-accent-ink)' : 'var(--hd-sub)',
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
            style={{ color: 'var(--hd-accent-text)' }}
          >
            {T.rerollUsed}
          </div>
        )}

        {/* Empty state */}
        {!echo && (
          <div className="flex flex-col items-center gap-6 py-8 text-center">
            <div>
              <p className="text-[var(--hd-sub)] text-sm max-w-xs leading-relaxed mx-auto" style={{ lineHeight: 1.7 }}>
                {T.emptyText}
              </p>
            </div>

            {!bonusActive && (
              <div
                className="w-full rounded-2xl overflow-hidden animate-fadeUp"
                style={{ background: 'var(--hd-plate)', border: '1px solid var(--hd-line)' }}
              >
                {/* Top accent stripe */}
                <div className="h-1 w-full" style={{ background: 'var(--hd-accent)' }} />
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--hd-fg)' }}>
                      <Gift size={15} /> {T.bonusCardTitle}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0"
                      style={{ background: 'var(--hd-accent)', color: 'var(--hd-accent-ink)' }}
                    >
                      {T.bonusFree}
                    </span>
                  </div>
                  {/* Benefits */}
                  <div className="space-y-2.5 mb-4 text-left">
                    {[T.bonusCardBenefit1, T.bonusCardBenefit2, T.bonusCardBenefit3].map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm">
                        <span
                          className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                          style={{ background: 'var(--hd-accent)', color: 'var(--hd-accent-ink)' }}
                        >
                          <Check size={12} strokeWidth={3} />
                        </span>
                        <span className="leading-snug" style={{ color: 'var(--hd-fg)' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                  {/* Duration badge */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <Clock size={12} className="text-[var(--hd-sub)]" />
                    <span className="text-xs font-medium" style={{ color: 'var(--hd-accent-text)' }}>{T.bonusValidFor}</span>
                  </div>
                  {/* Ad note */}
                  <p className="text-xs text-[var(--hd-sub)] mb-4">{T.bonusNote}</p>
                  {/* CTA */}
                  <button
                    onClick={() => openBonusModal('bonus')}
                    className="w-full py-3 rounded-[500px] text-sm font-semibold hover:opacity-80 transition-opacity animate-pulseRing"
                    style={{ background: 'var(--hd-accent)', color: 'var(--hd-accent-ink)' }}
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
          background: 'color-mix(in srgb, var(--hd-bg) 95%, transparent)',
          borderTop: '1px solid var(--hd-line)',
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
              className="hd-num text-[11px] text-[var(--hd-sub)] text-center mb-2"
            >
              {interpolate(T.untilMax, [(25 - echo.level) / 5])}
            </p>
          )}

          {!echo ? (
            /* ── No echo: Get Echo CTA ── */
            <button
              onClick={handleStart}
              className="w-full py-3 rounded-[500px] font-semibold text-sm hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
              style={{ background: 'var(--hd-accent)', color: 'var(--hd-accent-ink)' }}
            >
              <EchoIcon size={15} color="#11141A" bgColor={accentHex} />
              {T.getEcho}
            </button>
          ) : !isMaxLevel ? (
            /* ── Upgrading: level-up controls ── */
            <div className="flex items-center gap-2">
              <button
                onClick={handleUpgrade}
                className="flex-1 py-3 rounded-[500px] font-semibold text-sm hover:opacity-80 transition-opacity"
                style={{ background: 'var(--hd-accent)', color: 'var(--hd-accent-ink)' }}
              >
                +5 → +{echo.level + 5}
              </button>
              {bonusActive && (
                <button
                  onClick={handleMaxUpgrade}
                  className="px-4 py-3 rounded-[500px] font-medium text-sm border hover:opacity-80 transition-opacity shrink-0"
                  style={{ borderColor: 'var(--hd-accent)', color: 'var(--hd-accent-text)', background: 'var(--hd-accent-soft)' }}
                >
                  {T.maxUpgrade}
                </button>
              )}
              <button
                onClick={handleReset}
                className="px-4 py-3 rounded-[500px] text-sm border hover:opacity-70 transition-colors shrink-0"
                style={{ color: 'var(--hd-sub)', borderColor: 'var(--hd-line)' }}
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
                style={{ background: 'var(--hd-accent)', color: 'var(--hd-accent-ink)' }}
              >
                <EchoIcon size={15} color="#11141A" bgColor={accentHex} />
                {T.getEcho}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-3 rounded-[500px] text-sm border hover:opacity-70 transition-colors shrink-0"
                style={{ color: 'var(--hd-sub)', borderColor: 'var(--hd-line)' }}
              >
                {T.resetBtn}
              </button>
            </div>
          )}
        </div>
      </div>

      <footer
        className="border-t pt-6 pb-32"
        style={{ borderColor: 'var(--hd-line)' }}
      >
        <nav className="max-w-2xl mx-auto px-4 flex flex-wrap justify-center gap-x-4 gap-y-2 mb-4">
          {FOOTER_LINKS.map(({ href, ja, en }) => (
            <Link
              key={href}
              href={withLang(href, locale)}
              className="text-xs hover:opacity-70 transition-opacity"
              style={{ color: 'var(--hd-sub)' }}
            >
              {locale === 'ja' ? ja : en}
            </Link>
          ))}
        </nav>
        <p className="text-center text-xs" style={{ color: 'var(--hd-sub)' }}>{T.footer}</p>
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
            className="w-full rounded-t-3xl animate-fadeUp max-h-[88vh] overflow-y-auto"
            style={{ background: 'var(--hd-plate)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-2.5 pb-1 sticky top-0" style={{ background: 'var(--hd-plate)' }}>
              <div className="w-8 h-1 rounded-full bg-[var(--hd-line)]" />
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
                  className="flex-1 py-1.5 rounded-lg text-sm font-medium border border-[var(--hd-line)] text-[var(--hd-sub)] hover:text-[var(--hd-fg)] hover:border-[var(--hd-sub)] transition-colors disabled:opacity-50"
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
                  className="flex-1 py-1.5 rounded-lg text-sm font-medium border border-[var(--hd-line)] text-[var(--hd-sub)] hover:text-[var(--hd-fg)] hover:border-[var(--hd-sub)] transition-colors"
                >
                  {T.shareBtn}
                </button>
                {saveSlots > 0 && (
                  <button
                    onClick={() => { handleSave(); setShowResultModal(false); }}
                    className="flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                    style={{ borderColor: '#10b98144', background: '#10b9811f', color: 'var(--hd-fg)' }}
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
                  style={{ background: 'var(--hd-accent)', color: 'var(--hd-accent-ink)' }}
                >
                  {interpolate(T.saveCTABtn, [SAVE_PER_UNLOCK])}
                </button>
              )}

              {/* Tracker CTA — bridge from casual simulation to real farming */}
              <Link
                href={withLang('/', locale)}
                onClick={() => setShowResultModal(false)}
                className="flex items-center justify-center gap-1 w-full py-1.5 rounded-[500px] text-sm font-medium transition-colors"
                style={{ background: 'var(--hd-accent-soft)', color: 'var(--hd-accent-text)', border: '1px solid var(--hd-line)' }}
              >
                {T.resultTrackerCTA}
              </Link>

              {/* Close */}
              <button
                onClick={() => setShowResultModal(false)}
                className="w-full py-1.5 rounded-[500px] text-sm text-[var(--hd-sub)] border border-[var(--hd-line)] hover:text-[var(--hd-fg)] hover:border-[var(--hd-sub)] transition-colors"
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
