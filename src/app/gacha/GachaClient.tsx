'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { EchoCost, EchoState, ScoreResult, MainstatInfo } from '@/types/echo';
import { createEcho, upgradeEcho, upgradeToFull, rerollSubstats } from '@/lib/simulator';
import { simulateCompletion, clearBaselineCache, type AdvisorResult } from '@/lib/monteCarlo';
import { scoreEcho } from '@/lib/scorer';
import { MAINSTAT_POOLS } from '@/data/mainstats';
import { ECHOES_BY_COST, ECHOES, DEFAULT_ECHO_ID, HARMONY_SETS, HARMONY_SETS_EN } from '@/data/echoes';
import { CHARACTER_LIST, CHARACTER_MAP } from '@/data/characters';
import ScoreDebugPanel from '@/components/ScoreDebugPanel';
import BonusModal from '@/components/BonusModal';
import SavedResultsModal, { type SavedResult } from '@/components/SavedResultsModal';
import HomeExplainer from '@/components/HomeExplainer';
import AdBanner from '@/components/AdBanner';
import AdBannerThin from '@/components/AdBannerThin';
import UpdateModal from '@/components/UpdateModal';
import { LATEST_UPDATE_ID } from '@/data/updates';
import { generateResultCard, buildShareText } from '@/lib/imageGen';
import { useLocale, withLang } from '@/lib/locale';
import { TRANSLATIONS, MAINSTAT_LABEL_EN, interpolate } from '@/data/translations';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import BuildBar from '@/components/home/BuildBar';
import SlotList from '@/components/home/SlotList';
import ForecastStrip from '@/components/home/ForecastStrip';
import ResultCard, { type Journey, type JourneyStep } from '@/components/home/ResultCard';
import CharacterPicker from '@/components/home/CharacterPicker';
import { ELEMENT_THEME, elementKeyOf } from '@/components/home/elementTheme';
import { useSiteAppearance } from '@/contexts/SiteAppearanceContext';
import { Sparkles, Gift, History } from 'lucide-react';

function getRecommendedEchoId(charId: string): string | null {
  if (charId === 'generic') return null;
  const char = CHARACTER_MAP[charId];
  if (!char) return null;
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

const HAS_THIN_AD = Boolean(
  process.env.NEXT_PUBLIC_ADSTERRA_BANNER_THIN_KEY &&
  process.env.NEXT_PUBLIC_ADSTERRA_BANNER_THIN_SCRIPT_SRC,
);

type BonusKind = 'bonus' | 'saves';

/** SiteHeader のメニューに足す項目の行スタイル(SiteHeader の項目と揃える) */
const MENU_ITEM =
  'flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors hover:bg-[var(--hd-raise)]';

export default function GachaClient() {
  const { locale } = useLocale();
  const ja = locale === 'ja';
  const T = TRANSLATIONS[locale];
  const { setCharacter, savedCharId, accentHex } = useSiteAppearance();

  const [cost, setCost]                       = useState<EchoCost>(4);
  const [selectedEchoId, setSelectedEchoId]   = useState<string>(DEFAULT_ECHO_ID[4]);
  const [selectedHarmonySet, setSelectedHarmonySet] = useState<string>('');
  const [echo, setEcho]                       = useState<EchoState | null>(null);
  const [score, setScore]                     = useState<ScoreResult | null>(null);
  const [selectedCharId, setSelectedCharId]   = useState<string>('generic');
  const [downloading, setDownloading]         = useState(false);
  const [maxedAt, setMaxedAt]                 = useState<number | null>(null);

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

  /* ── Save slots ─────────────────────────────────────────────── */
  const [saveSlots, setSaveSlots]             = useState(0);
  const [savedResults, setSavedResults]       = useState<SavedResult[]>([]);
  const [historyOpen, setHistoryOpen]         = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [hasNewUpdate, setHasNewUpdate]       = useState(false);
  const [advisorResult, setAdvisorResult]     = useState<AdvisorResult | null>(null);

  /* ── Bottom sheets(同時に開かない) ───────────────────────────── */
  const [buildSheetOpen, setBuildSheetOpen]   = useState(false);
  const [pickerOpen, setPickerOpen]           = useState(false);
  const [rerollSheetOpen, setRerollSheetOpen] = useState(false);

  const openBuildSheet = useCallback(() => {
    setPickerOpen(false);
    setRerollSheetOpen(false);
    setBuildSheetOpen(true);
  }, []);

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
    setAdvisorResult(null);
  }, [cost, selectedEchoId, selectedHarmonySet, bonusEndTime, lockedMainstatKey]);

  const handleUpgrade = useCallback(() => {
    if (!echo || echo.level >= 25) return;
    const next = upgradeEcho(echo);
    setEcho(next);
    const build = selectedCharId !== 'generic' ? CHARACTER_MAP[selectedCharId] : undefined;
    setScore(scoreEcho(next, build));
    if (next.level === 25) {
      setMaxedAt(Date.now());
      setAdvisorResult(null);
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
  }, [echo, selectedCharId]);

  const handleReset = useCallback(() => {
    setEcho(null); setScore(null); setMaxedAt(null);
    setRerollUsed(false); setRerollIndices(new Set());
    setAdvisorResult(null);
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

  const handleSaveImage = useCallback(async () => {
    if (!echo || !score) return;
    setDownloading(true);
    try {
      const char = selectedCharId !== 'generic' ? CHARACTER_MAP[selectedCharId] : undefined;
      const dataUrl = await generateResultCard(echo, score, locale, {
        source: 'gacha',
        maxedAt: maxedAt ?? undefined,
        charName: char ? (locale === 'en' ? char.nameEn : char.name) : undefined,
        build: char,
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `echo-${score.rank}-${score.score}pt.png`;
      a.click();
    } finally {
      setDownloading(false);
    }
  }, [echo, score, selectedCharId, locale, maxedAt]);

  const handleShare = useCallback(() => {
    if (!echo || !score) return;
    const char = selectedCharId !== 'generic' ? CHARACTER_MAP[selectedCharId] : undefined;
    const charName = char ? (locale === 'en' ? char.nameEn : char.name) : undefined;
    const text = buildShareText(echo, score, { locale, charName });
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      '_blank', 'noopener,noreferrer',
    );
  }, [echo, score, selectedCharId, locale]);

  const isMaxLevel = echo?.level === 25;

  /* ── 使っている部品の素材 ───────────────────────────────────── */
  const build = selectedCharId !== 'generic' ? CHARACTER_MAP[selectedCharId] : undefined;
  const elementKey = elementKeyOf(build?.element);
  const theme = ELEMENT_THEME[elementKey];
  const charName = build
    ? (ja ? build.name : (build.nameEn ?? build.name))
    : (ja ? 'キャラなし' : 'No character');
  const recommendFor = build ? charName : '';
  const charElement = !build ? '' : ja ? theme.ja : theme.en;

  const echoOptions = useMemo(() => {
    const char = selectedCharId !== 'generic' ? CHARACTER_MAP[selectedCharId] : undefined;
    const recSets = char ? new Set(char.harmonySets.recommended) : new Set<string>();
    const accSets = char ? new Set(char.harmonySets.acceptable) : new Set<string>();
    const priority = (b?: 'recommended' | 'acceptable') =>
      b === 'recommended' ? 0 : b === 'acceptable' ? 1 : 2;

    return ECHOES_BY_COST[cost]
      .map((e) => {
        let badge: 'recommended' | 'acceptable' | undefined;
        if (char) {
          if (e.sets.some(s => recSets.has(s))) badge = 'recommended';
          else if (e.sets.some(s => accSets.has(s))) badge = 'acceptable';
        }
        return { value: e.id, label: ja ? e.name : (e.nameEn ?? e.name), badge };
      })
      .sort((a, b) => {
        const pd = priority(a.badge) - priority(b.badge);
        if (pd !== 0) return pd;
        return a.label.localeCompare(b.label, ja ? 'ja' : 'en', { sensitivity: 'base' });
      });
  }, [cost, ja, selectedCharId]);

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
      return { value: s, label: ja ? s : (HARMONY_SETS_EN[s] ?? s), badge, _i: i };
    });
    items.sort((a, b) => {
      const pd = priority(a.badge) - priority(b.badge);
      return pd !== 0 ? pd : a._i - b._i;
    });
    return items.map(({ _i: _, ...opt }) => opt);
  }, [harmonySetOptions, ja, selectedCharId]);

  const mainstatChoices = useMemo(() => {
    const costKey = `cost${cost}` as 'cost4' | 'cost3' | 'cost1';
    const recKeys = build ? new Set(build.mainstat[costKey].recommended) : new Set<string>();
    return MAINSTAT_POOLS[cost].map((m) => ({
      key: m.key,
      name: ja ? m.label : (MAINSTAT_LABEL_EN[m.key] ?? m.label),
      valueText: m.unit === '%' ? `${m.value.toFixed(1)}${m.unit}` : `${m.value}${m.unit}`,
      recommended: recKeys.has(m.key),
    }));
  }, [cost, ja, build]);

  const journey = useMemo<Journey | null>(() => {
    if (!echo || echo.level !== 25) return null;
    const charBuild = selectedCharId !== 'generic' ? CHARACTER_MAP[selectedCharId] : undefined;
    const steps: JourneyStep[] = [];
    let baseline = 0;
    for (let n = 1; n <= 4; n++) {
      const r = simulateCompletion({ ...echo, level: n * 5, substats: echo.substats.slice(0, n) }, charBuild);
      if (n === 1) baseline = r.baselineScore;
      steps.push({ expected: Math.round(r.expectedScore), recommendation: r.recommendation });
    }
    return { steps, baseline };
  }, [echo, selectedCharId]);

  /* ── 中央の音骸プレート ─────────────────────────────────────── */
  const selectedEchoInfo = useMemo(() => ECHOES.find((e) => e.id === selectedEchoId), [selectedEchoId]);
  const plateLabelTop  = cost === 4 ? (ja ? '音骸' : 'Echo') : (ja ? 'ハーモニー' : 'Set');
  const plateLabelMain = ja ? 'メイン' : 'Main';
  const plateLabelMin  = `${Math.max(plateLabelTop.length, plateLabelMain.length)}em`;

  const plateTopName = echo
    ? (ja ? echo.echoName : (echo.echoNameEn ?? echo.echoName))
    : cost === 4
      ? (ja
          ? (selectedEchoInfo?.name ?? selectedEchoId)
          : (selectedEchoInfo?.nameEn ?? selectedEchoInfo?.name ?? selectedEchoId))
      : (ja ? selectedHarmonySet : (HARMONY_SETS_EN[selectedHarmonySet] ?? selectedHarmonySet));
  const plateTopSet = echo && echo.activeHarmonySet
    ? (ja ? echo.activeHarmonySet : (HARMONY_SETS_EN[echo.activeHarmonySet] ?? echo.activeHarmonySet))
    : '';

  const lockedMainstat = bonusActive && lockedMainstatKey
    ? MAINSTAT_POOLS[cost].find((m) => m.key === lockedMainstatKey)
    : undefined;
  const plateMainName = echo
    ? (ja ? echo.mainstat.label : (MAINSTAT_LABEL_EN[echo.mainstat.key] ?? echo.mainstat.label))
    : lockedMainstat
      ? (ja ? lockedMainstat.label : (MAINSTAT_LABEL_EN[lockedMainstat.key] ?? lockedMainstat.label))
      : (ja ? 'ランダム' : 'Random');
  const plateMainValue = echo
    ? (echo.mainstat.unit === '%'
        ? `${echo.mainstat.value.toFixed(1)}${echo.mainstat.unit}`
        : `${echo.mainstat.value}${echo.mainstat.unit}`)
    : '';

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  /* ── SiteHeader に渡す部品 ─────────────────────────────────── */
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
    <div className="home-dark min-h-dvh">
      <div className="mx-auto w-full max-w-[480px] flex flex-col h-[100vh] overflow-hidden [@supports(height:100dvh)]:h-[100dvh]">
        <SiteHeader
          title={T.appTitle}
          center={bonusTimeBadge}
          extraMenuItems={extraMenuItems}
          hasNewUpdate={hasNewUpdate}
          maxWidthClass="max-w-[480px]"
        />

        <div
          className="overflow-hidden flex items-center justify-center"
          style={{ flex: 'none', height: 50 }}
        >
          {HAS_THIN_AD ? (
            <div className="-my-6">
              <AdBannerThin />
            </div>
          ) : null}
        </div>

        <BuildBar
          ja={ja}
          accent={accentHex}
          charName={charName}
          charElement={charElement}
          recommendFor={recommendFor}
          cost={cost}
          onCostChange={handleCostChange}
          onOpenPicker={() => {
            setBuildSheetOpen(false);
            setRerollSheetOpen(false);
            setPickerOpen(true);
          }}
          open={buildSheetOpen}
          onClose={() => setBuildSheetOpen(false)}
          selectedEchoId={selectedEchoId}
          onEchoChange={(v) => { setSelectedEchoId(v); setEcho(null); setScore(null); }}
          echoOptions={echoOptions}
          selectedHarmonySet={selectedHarmonySet}
          onHarmonyChange={(v) => { setSelectedHarmonySet(v); setEcho(null); setScore(null); }}
          harmonyOptions={harmonyOptions}
          draftMainstatKey={lockedMainstatKey}
          onMainstatChange={setLockedMainstatKey}
          mainstatChoices={bonusActive ? mainstatChoices : []}
          mainstatTitle={bonusActive ? (ja ? 'メインステータスを固定(ボーナス)' : 'Lock main stat (bonus)') : undefined}
          sheetTitle={bonusActive
            ? undefined
            : (cost === 4 ? (ja ? '音骸' : 'Echo') : (ja ? 'ハーモニー' : 'Set'))}
          cost4MultiSet={false}
          multiSetOptions={[]}
          draftHarmonySet=""
          onDraftHarmonySetChange={() => {}}
        />

        <div className="flex flex-col gap-[8px] px-[16px] py-[8px] min-h-0 flex-1 overflow-y-auto [@media(max-height:780px)]:gap-[6px] [@media(max-height:780px)]:pt-[6px]">
          <button
            type="button"
            onClick={openBuildSheet}
            className="flex items-center gap-[12px] w-full h-[44px] rounded-[10px] px-[12px] text-left [@media(max-height:780px)]:h-[36px]"
            style={{ flex: 'none', background: 'var(--hd-plate)' }}
          >
            <span className="min-w-0 flex-1 flex flex-col justify-center">
              <span className="flex items-baseline gap-[8px]">
                <small
                  className="flex-none text-[11px] leading-[1.2] [@media(max-height:780px)]:text-[10px]"
                  style={{ color: 'var(--hd-sub)', minWidth: plateLabelMin }}
                >
                  {plateLabelTop}
                </small>
                <span
                  className="min-w-0 truncate text-[13px] leading-[1.25] [@media(max-height:780px)]:text-[12px]"
                  style={{ color: 'var(--hd-fg)' }}
                >
                  {plateTopName}
                </span>
                {plateTopSet && (
                  <span
                    className="shrink-0 text-[12px] font-bold leading-[1.25]"
                    style={{ color: 'var(--hd-accent-text)' }}
                  >
                    {plateTopSet}
                  </span>
                )}
              </span>
              <span className="flex items-baseline gap-[8px]">
                <small
                  className="flex-none text-[11px] leading-[1.2] [@media(max-height:780px)]:text-[10px]"
                  style={{ color: 'var(--hd-sub)', minWidth: plateLabelMin }}
                >
                  {plateLabelMain}
                </small>
                <span
                  className="min-w-0 truncate text-[13px] leading-[1.25] [@media(max-height:780px)]:text-[12px]"
                  style={{ color: 'var(--hd-fg)' }}
                >
                  {plateMainName}
                </span>
                {plateMainValue && (
                  <b
                    className="hd-num shrink-0 font-bold text-[13px] leading-[1.25] [@media(max-height:780px)]:text-[12px]"
                    style={{ color: 'var(--hd-fg)' }}
                  >
                    {plateMainValue}
                  </b>
                )}
              </span>
            </span>
            <span
              className="flex items-center gap-[4px] whitespace-nowrap text-[12px] shrink-0"
              style={{ color: 'var(--hd-sub)' }}
            >
              {ja ? '変更' : 'Change'}
              <span
                aria-hidden
                className="shrink-0"
                style={{
                  width: 7,
                  height: 7,
                  borderRight: '2px solid currentColor',
                  borderBottom: '2px solid currentColor',
                  transform: 'rotate(-45deg)',
                }}
              />
            </span>
          </button>

          {isMaxLevel && echo && score && journey ? (
            <ResultCard
              ja={ja}
              echoName={echo.echoName}
              echoNameEn={echo.echoNameEn}
              cost={echo.cost}
              mainstat={echo.mainstat}
              charName={build ? charName : undefined}
              finalScore={score}
              subs={echo.substats}
              build={build}
              journey={journey}
            />
          ) : (
            <>
              <SlotList
                ja={ja}
                substats={echo ? echo.substats : []}
                build={build}
              />

              <ForecastStrip
                ja={ja}
                advisor={advisorResult}
                finalScore={null}
                emptyHint={!echo
                  ? (ja ? '「音骸を入手」から始めます' : 'Tap "Get Echo" to start')
                  : (ja ? '強化すると予測が出ます' : 'Upgrade to see the forecast')}
              />
            </>
          )}
        </div>

        <section
          className="flex flex-col gap-[8px] pt-[12px] px-[16px] rounded-t-[16px]"
          style={{
            background: 'var(--hd-plate)',
            paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
            flex: 'none',
          }}
        >
          {!echo ? (
            <>
              <button
                type="button"
                onClick={handleStart}
                className="w-full h-[54px] rounded-[27px] text-[16px] [@media(max-height:780px)]:h-[48px]"
                style={{
                  background: 'var(--hd-accent)',
                  color: 'var(--hd-accent-ink)',
                  fontWeight: 900,
                }}
              >
                {T.getEcho}
              </button>
              <div className="flex items-center justify-center h-[24px] shrink-0">
                {bonusActive ? (
                  <span className="hd-num text-[13px]" style={{ color: 'var(--hd-sub)' }}>
                    {formatTime(timeLeft)}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => openBonusModal('bonus')}
                    className="text-[13px] leading-none"
                    style={{ color: 'var(--hd-sub)' }}
                  >
                    {ja ? 'ボーナスタイム' : 'Bonus time'}
                  </button>
                )}
              </div>
            </>
          ) : !isMaxLevel ? (
            <>
              <div className="flex items-center gap-[8px] shrink-0">
                <button
                  type="button"
                  onClick={handleUpgrade}
                  className="flex-1 h-[54px] rounded-[27px] text-[16px] [@media(max-height:780px)]:h-[48px]"
                  style={{
                    background: 'var(--hd-accent)',
                    color: 'var(--hd-accent-ink)',
                    fontWeight: 900,
                  }}
                >
                  {`+${echo.level} → +${echo.level + 5}`}
                </button>
                {bonusActive && (
                  <button
                    type="button"
                    onClick={handleMaxUpgrade}
                    className="w-[96px] h-[54px] shrink-0 rounded-[27px] text-[14px] font-medium [@media(max-height:780px)]:h-[48px]"
                    style={{ background: 'var(--hd-raise)', color: 'var(--hd-accent-text)' }}
                  >
                    一括MAX
                  </button>
                )}
              </div>
              <div className="flex items-center gap-[12px] h-[24px] shrink-0">
                <span
                  className="flex-1 text-center text-[12px]"
                  style={{ color: 'var(--hd-sub)' }}
                >
                  {interpolate(T.untilMax, [(25 - echo.level) / 5])}
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[13px] leading-none shrink-0"
                  style={{ color: 'var(--hd-sub)' }}
                >
                  {ja ? 'リセット' : 'Reset'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-[8px] shrink-0">
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex-1 min-w-0 h-[54px] rounded-[27px] flex items-center justify-center gap-[10px] text-[16px] [@media(max-height:780px)]:h-[48px]"
                  style={{ background: '#FFFFFF', color: '#0B0D11', fontWeight: 900 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.2-8.3L1.8 3h6.4l4.4 5.8zM16.7 19.2h1.7L7.2 4.7H5.4z"
                      fill="#0B0D11"
                    ></path>
                  </svg>
                  {ja ? 'X でシェア' : 'Share on X'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveImage}
                  disabled={downloading}
                  aria-label={ja ? '画像を保存' : 'Save image'}
                  className="w-[54px] h-[54px] shrink-0 rounded-full flex items-center justify-center disabled:opacity-50 [@media(max-height:780px)]:w-[48px] [@media(max-height:780px)]:h-[48px]"
                  style={{ background: 'var(--hd-raise)', color: 'var(--hd-fg)' }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 4v11"></path>
                    <path d="M7 10l5 5 5-5"></path>
                    <path d="M5 20h14"></path>
                  </svg>
                </button>
              </div>

              <button
                type="button"
                onClick={handleStart}
                className="w-full h-[46px] shrink-0 rounded-[23px] text-[14px] font-bold [@media(max-height:780px)]:h-[40px]"
                style={{ background: 'var(--hd-raise)', color: 'var(--hd-accent-text)' }}
              >
                {ja ? '次の音骸を入手' : 'Get next echo'}
              </button>

              <div className="flex flex-wrap items-center justify-center gap-x-[16px] gap-y-[6px] min-h-[24px] shrink-0">
                {saveSlots > 0 ? (
                  <button
                    type="button"
                    onClick={handleSave}
                    className="text-[13px] leading-none"
                    style={{ color: 'var(--hd-sub)' }}
                  >
                    {ja ? `結果を保存(残り${saveSlots})` : `Save result (${saveSlots} left)`}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => openBonusModal('saves')}
                    className="text-[13px] leading-none"
                    style={{ color: 'var(--hd-sub)' }}
                  >
                    {ja ? '保存枠+10' : '+10 slots'}
                  </button>
                )}
                {bonusActive && !rerollUsed && (
                  <button
                    type="button"
                    onClick={() => {
                      setBuildSheetOpen(false);
                      setPickerOpen(false);
                      setRerollSheetOpen(true);
                    }}
                    className="text-[13px] leading-none"
                    style={{ color: 'var(--hd-sub)' }}
                  >
                    {ja ? '再抽選' : 'Reroll'}
                  </button>
                )}
                <Link
                  href={withLang('/', locale)}
                  className="text-[13px] leading-none"
                  style={{ color: 'var(--hd-sub)' }}
                >
                  {ja ? 'サポーターで記録' : 'Track in Supporter'}
                </Link>
              </div>
            </>
          )}
        </section>
      </div>

      <div className="mx-auto w-full max-w-[480px]">
        <div className="px-[16px] py-[24px] flex flex-col gap-[24px]">
          {isMaxLevel && echo && score && (
            <ScoreDebugPanel echo={echo} score={score} />
          )}
          <HomeExplainer />
          <AdBanner />
        </div>
        <SiteFooter />
      </div>

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

      <CharacterPicker
        ja={ja}
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedCharId={selectedCharId}
        onSelect={handleCharacterChange}
      />

      {rerollSheetOpen && echo && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0, 0, 0, 0.55)' }}
            onClick={() => setRerollSheetOpen(false)}
          />
          <div
            className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[480px] rounded-t-[16px] p-[16px] flex flex-col gap-[12px]"
            style={{ background: 'var(--hd-plate)' }}
          >
            <h2
              className="text-[12px] font-bold text-center"
              style={{ color: 'var(--hd-accent-text)' }}
            >
              {interpolate(T.rerollPanelTitle, [MAX_REROLL])}
            </h2>
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
              onClick={() => { handleReroll(); setRerollSheetOpen(false); }}
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
            <button
              type="button"
              onClick={() => setRerollSheetOpen(false)}
              className="w-full h-[48px] rounded-[24px] text-[15px] font-black"
              style={{ background: 'var(--hd-accent)', color: 'var(--hd-accent-ink)' }}
            >
              {ja ? '閉じる' : 'Done'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
