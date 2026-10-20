'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Noto_Sans_JP, Chakra_Petch } from 'next/font/google';
import type { EchoCost, EchoState, Substat, SubstatKey } from '@/types/echo';
import { SUBSTAT_MAP } from '@/data/substats';
import { MAINSTAT_POOLS } from '@/data/mainstats';
import { ECHOES, ECHOES_BY_COST, DEFAULT_ECHO_ID, HARMONY_SETS, HARMONY_SETS_EN } from '@/data/echoes';
import { CHARACTER_LIST, CHARACTER_MAP } from '@/data/characters';
import { scoreEcho } from '@/lib/scorer';
import { simulateCompletion } from '@/lib/monteCarlo';
import {
  type TrackedEntry, type Threshold, type BaselineStats,
  loadEntries, saveEntries, computeBaseline, predict,
  RANK_ORDER,
} from '@/lib/tracker';
import { useLocale, withLang } from '@/lib/locale';
import { MAINSTAT_LABEL_EN } from '@/data/translations';
import EchoIcon from '@/components/EchoIcon';
import AdBanner from '@/components/AdBanner';
import AdBannerThin from '@/components/AdBannerThin';
import NativeBanner from '@/components/NativeBanner';
import UpdateModal from '@/components/UpdateModal';
import { LATEST_UPDATE_ID } from '@/data/updates';
import { Menu, BookOpen, Calculator, Users, Bell, Info, FileText, Mail } from 'lucide-react';
import BuildBar from '@/components/home/BuildBar';
import SlotList from '@/components/home/SlotList';
import ForecastStrip from '@/components/home/ForecastStrip';
import InputDock from '@/components/home/InputDock';
import RecordsPanel from '@/components/home/RecordsPanel';

const bodyFont = Noto_Sans_JP({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-home-body',
});

const numFont = Chakra_Petch({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-home-num',
});

const ZERO_COST = { shellCoins: 0, tunerBasic: 0, tunerAdvanced: 0, expMaterial: 0 };
const MAX_SUBSTATS = 5;
const HAS_THIN_AD = Boolean(
  process.env.NEXT_PUBLIC_ADSTERRA_BANNER_THIN_KEY &&
  process.env.NEXT_PUBLIC_ADSTERRA_BANNER_THIN_SCRIPT_SRC,
);

const MENU_ITEM =
  'flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-[#222222] hover:bg-[#f7f7f7] transition-colors';

function getRepresentativeEchoId(cost: EchoCost, harmonySet: string): string {
  const found = ECHOES.find((e) => e.cost === cost && e.sets.includes(harmonySet));
  return found?.id ?? DEFAULT_ECHO_ID[cost];
}

function getRecommendedEchoId(charId: string): string | null {
  if (charId === 'generic') return null;
  const char = CHARACTER_MAP[charId];
  if (!char) return null;
  for (const set of [...char.harmonySets.recommended, ...char.harmonySets.acceptable]) {
    const echo = ECHOES.find((e) => e.cost === 4 && e.sets.includes(set));
    if (echo) return echo.id;
  }
  return null;
}

function getRecommendedHarmonySet(charId: string, cost: EchoCost): string | null {
  if (charId === 'generic' || cost === 4) return null;
  const char = CHARACTER_MAP[charId];
  if (!char) return null;
  const available = new Set(ECHOES.filter((e) => e.cost === cost).flatMap((e) => e.sets));
  return char.harmonySets.recommended.find((s) => available.has(s))
    ?? char.harmonySets.acceptable.find((s) => available.has(s))
    ?? null;
}

export default function HomeClient() {
  const { locale, toggleLocale } = useLocale();
  const ja = locale === 'ja';
  const [menuOpen, setMenuOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [hasNewUpdate, setHasNewUpdate]       = useState(false);
  const [tab, setTab] = useState<'tune' | 'records'>('tune');
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('lastSeenUpdate');
    if (seen !== LATEST_UPDATE_ID) {
      setUpdateModalOpen(true);
      setHasNewUpdate(true);
    }
  }, []);

  const [selectedCharId, setSelectedCharId] = useState('generic');
  const [cost, setCost] = useState<EchoCost>(4);
  const [selectedEchoId, setSelectedEchoId] = useState(DEFAULT_ECHO_ID[4]);
  const [selectedHarmonySet, setSelectedHarmonySet] = useState('');
  const [draftHarmonySet, setDraftHarmonySet] = useState('');

  const [draftSubs, setDraftSubs] = useState<Substat[]>([]);
  const [pendingKey, setPendingKey] = useState('');
  const [pendingTier, setPendingTier] = useState(0);

  const harmonySetOptions = useMemo(() => {
    if (cost === 4) return [];
    const available = new Set(ECHOES.filter((e) => e.cost === cost).flatMap((e) => e.sets));
    return Object.values(HARMONY_SETS).filter((s) => available.has(s));
  }, [cost]);

  useEffect(() => {
    if (cost === 4) {
      const recId = getRecommendedEchoId(selectedCharId);
      setSelectedEchoId(recId ?? DEFAULT_ECHO_ID[4]);
    } else {
      const recSet = getRecommendedHarmonySet(selectedCharId, cost);
      setSelectedHarmonySet(recSet ?? (harmonySetOptions[0] ?? ''));
    }
    setDraftSubs([]);
    setPendingKey('');
    setPendingTier(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cost]);

  const handleCharacterChange = useCallback((charId: string) => {
    setSelectedCharId(charId);
    if (cost === 4) {
      const recId = getRecommendedEchoId(charId);
      if (recId) setSelectedEchoId(recId);
    } else {
      const recSet = getRecommendedHarmonySet(charId, cost);
      if (recSet) setSelectedHarmonySet(recSet);
    }
    setDraftSubs([]);
    setPendingKey('');
    setPendingTier(0);
  }, [cost]);

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
          if (e.sets.some((s) => recSets.has(s))) badge = 'recommended';
          else if (e.sets.some((s) => accSets.has(s))) badge = 'acceptable';
        }
        return { value: e.id, label: ja ? e.name : (e.nameEn ?? e.name), badge };
      })
      .sort((a, b) => {
        const pd = priority(a.badge) - priority(b.badge);
        if (pd !== 0) return pd;
        return a.label.localeCompare(b.label, ja ? 'ja' : 'en');
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

  const charOptions = useMemo(() => [
    { value: 'generic', label: ja ? '（キャラなし・汎用評価）' : '(No character — generic score)' },
    ...CHARACTER_LIST.map((c) => ({ value: c.id, label: ja ? c.name : (c.nameEn ?? c.name) })),
  ], [ja]);

  const currentEchoInfo = useMemo(() => ECHOES.find((e) => e.id === selectedEchoId), [selectedEchoId]);
  const cost4MultiSet = cost === 4 && (currentEchoInfo?.sets.length ?? 0) > 1;

  useEffect(() => {
    if (cost4MultiSet) setDraftHarmonySet(currentEchoInfo!.sets[0]);
  }, [cost4MultiSet, currentEchoInfo]);

  const build = selectedCharId !== 'generic' ? CHARACTER_MAP[selectedCharId] : undefined;

  const [baseline, setBaseline] = useState<BaselineStats | null>(null);

  useEffect(() => {
    const repEchoId = cost === 4 ? selectedEchoId : getRepresentativeEchoId(cost, selectedHarmonySet);
    const timer = setTimeout(() => {
      setBaseline(computeBaseline(cost, repEchoId, build));
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cost, selectedEchoId, selectedHarmonySet, selectedCharId]);

  const [entries, setEntries] = useState<TrackedEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setEntries(loadEntries()); setLoaded(true); }, []);

  const filteredEntries = useMemo(
    () => entries.filter((e) => e.cost === cost && e.charId === selectedCharId),
    [entries, cost, selectedCharId],
  );

  const [draftMainstatKey, setDraftMainstatKey] = useState(MAINSTAT_POOLS[4][0].key);
  useEffect(() => { setDraftMainstatKey(MAINSTAT_POOLS[cost][0].key); }, [cost]);

  const mainstatOptions = useMemo(() => {
    const costKey = `cost${cost}` as 'cost4' | 'cost3' | 'cost1';
    const recKeys = build ? new Set(build.mainstat[costKey].recommended) : new Set<string>();
    const accKeys = build ? new Set(build.mainstat[costKey].acceptable) : new Set<string>();
    const priority = (b?: 'recommended' | 'acceptable') =>
      b === 'recommended' ? 0 : b === 'acceptable' ? 1 : 2;

    return MAINSTAT_POOLS[cost]
      .map((m, i) => {
        let badge: 'recommended' | 'acceptable' | undefined;
        if (build) {
          if (recKeys.has(m.key)) badge = 'recommended';
          else if (accKeys.has(m.key)) badge = 'acceptable';
        }
        return {
          value: m.key,
          label: `${ja ? m.label : (MAINSTAT_LABEL_EN[m.key] ?? m.label)}（+25: ${m.value}${m.unit}）`,
          badge,
          _i: i,
        };
      })
      .sort((a, b) => {
        const pd = priority(a.badge) - priority(b.badge);
        return pd !== 0 ? pd : a._i - b._i;
      })
      .map(({ _i: _, ...opt }) => opt);
  }, [cost, ja, build]);

  const draftMeta = useMemo(() => {
    const mainstat = MAINSTAT_POOLS[cost].find((m) => m.key === draftMainstatKey)!;
    const harmonySet = cost === 4
      ? (cost4MultiSet ? draftHarmonySet : (currentEchoInfo?.sets[0] ?? ''))
      : selectedHarmonySet;
    const echoId = cost === 4 ? selectedEchoId : `harmony:${harmonySet}`;
    const echoName = cost === 4 ? (currentEchoInfo?.name ?? selectedEchoId) : harmonySet;
    const echoNameEn = cost === 4
      ? (currentEchoInfo?.nameEn ?? echoName)
      : (HARMONY_SETS_EN[harmonySet] ?? harmonySet);
    return { mainstat, harmonySet, echoId, echoName, echoNameEn };
  }, [cost, draftMainstatKey, cost4MultiSet, draftHarmonySet, currentEchoInfo, selectedHarmonySet, selectedEchoId]);

  const buildDraftEcho = useCallback((subs: Substat[]): EchoState => ({
    cost,
    echoId: draftMeta.echoId,
    echoName: draftMeta.echoName,
    echoNameEn: draftMeta.echoNameEn,
    activeHarmonySet: draftMeta.harmonySet,
    level: subs.length * 5,
    substats: subs,
    mainstat: draftMeta.mainstat,
    totalCost: ZERO_COST,
  }), [cost, draftMeta]);

  const addSubstat = useCallback((key: SubstatKey, tier: number) => {
    setPendingKey(key);
    setPendingTier(tier);
    const entry = SUBSTAT_MAP[key];
    if (!entry || draftSubs.length >= MAX_SUBSTATS) return;
    const sub: Substat = {
      key: entry.key,
      label: entry.label,
      unit: entry.unit,
      value: entry.values[tier],
      tier,
      maxValue: entry.values[entry.values.length - 1],
    };
    setDraftSubs((prev) => [...prev, sub]);
    setPendingKey('');
    setPendingTier(0);
  }, [draftSubs.length]);

  const removeSubstat = useCallback((idx: number) => {
    setDraftSubs((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const resetDraft = useCallback(() => {
    setDraftSubs([]);
    setPendingKey('');
    setPendingTier(0);
  }, []);

  const draftAdvisor = useMemo(() => {
    if (draftSubs.length === 0 || draftSubs.length >= MAX_SUBSTATS) return null;
    return simulateCompletion(buildDraftEcho(draftSubs), build);
  }, [draftSubs, buildDraftEcho, build]);

  const draftFinalScore = useMemo(() => {
    if (draftSubs.length < MAX_SUBSTATS) return null;
    return scoreEcho(buildDraftEcho(draftSubs), build);
  }, [draftSubs, buildDraftEcho, build]);

  const canFinalize = Boolean(draftSubs.length === MAX_SUBSTATS && (!cost4MultiSet || draftHarmonySet) && (cost === 4 || selectedHarmonySet));

  const handleFinalize = useCallback(() => {
    if (!canFinalize || !draftFinalScore) return;
    const entry: TrackedEntry = {
      id: Date.now(),
      cost,
      charId: selectedCharId,
      echoId: cost === 4 ? selectedEchoId : undefined,
      harmonySet: draftMeta.harmonySet,
      mainstat: draftMeta.mainstat,
      substats: draftSubs,
      score: draftFinalScore.score,
      rank: draftFinalScore.rank,
      createdAt: Date.now(),
    };
    setEntries((prev) => {
      const next = [entry, ...prev];
      saveEntries(next);
      return next;
    });
    resetDraft();
  }, [canFinalize, draftFinalScore, cost, selectedCharId, selectedEchoId, draftMeta, draftSubs, resetDraft]);

  const handleDelete = useCallback((id: number) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveEntries(next);
      return next;
    });
  }, []);

  const handleClearFiltered = useCallback(() => {
    if (!window.confirm(ja ? 'この条件で記録した音骸をすべて削除しますか？' : 'Delete all recorded echoes for this filter?')) return;
    setEntries((prev) => {
      const next = prev.filter((e) => !(e.cost === cost && e.charId === selectedCharId));
      saveEntries(next);
      return next;
    });
  }, [cost, selectedCharId, ja]);

  const [threshold, setThreshold] = useState<Threshold>('S+');
  const prediction = useMemo(() => {
    if (!baseline) return null;
    return predict(filteredEntries, threshold, baseline.probByThreshold[threshold]);
  }, [filteredEntries, threshold, baseline]);

  const rankCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of RANK_ORDER) map[r] = 0;
    for (const e of filteredEntries) map[e.rank] = (map[e.rank] ?? 0) + 1;
    return map;
  }, [filteredEntries]);

  const sPlusCount = useMemo(
    () => filteredEntries.filter((e) => e.rank === 'GOD' || e.rank === 'S+' || e.rank === 'S').length,
    [filteredEntries],
  );

  const multiSetOptions = useMemo(
    () => (cost4MultiSet
      ? currentEchoInfo!.sets.map((s) => ({ value: s, label: ja ? s : (HARMONY_SETS_EN[s] ?? s) }))
      : []),
    [cost4MultiSet, currentEchoInfo, ja],
  );

  const charChipName = build ? build.name : ja ? '汎用' : 'Generic';
  const charChipNameEn = build ? (build.nameEn ?? build.name) : 'Generic';

  const header = (
    <header
      className="flex items-center gap-[6px] h-[46px] pl-[16px] pr-[12px]"
      style={{ flex: 'none' }}
    >
      <div className="flex items-center gap-[6px] mr-auto min-w-0">
        <EchoIcon size={28} color="#A98BFF" bgColor="#101318" />
        <span className="text-[15px] font-bold whitespace-nowrap truncate min-w-0">
          {ja ? '厳選サポーター' : 'Selection Supporter'}
        </span>
      </div>
      <div className="flex rounded-[8px] p-[3px] shrink-0" style={{ background: 'var(--hd-raise)' }}>
        <button
          type="button"
          onClick={() => setTab('tune')}
          className="h-[28px] px-[8px] rounded-[6px] text-[12px] whitespace-nowrap"
          style={
            tab === 'tune'
              ? { background: 'var(--hd-fg)', color: 'var(--hd-bg)', fontWeight: 700 }
              : { color: 'var(--hd-sub)' }
          }
        >
          {ja ? '強化中' : 'Tuning'}
        </button>
        <button
          type="button"
          onClick={() => setTab('records')}
          className="h-[28px] px-[8px] rounded-[6px] text-[12px] whitespace-nowrap"
          style={
            tab === 'records'
              ? { background: 'var(--hd-fg)', color: 'var(--hd-bg)', fontWeight: 700 }
              : { color: 'var(--hd-sub)' }
          }
        >
          {ja ? '記録' : 'Records'}
          <em className="hd-num not-italic ml-[4px]">{filteredEntries.length}</em>
        </button>
      </div>
      <button
        type="button"
        onClick={toggleLocale}
        className="grid place-items-center h-[34px] px-[8px] rounded-[8px] text-[12px] shrink-0"
        style={{ border: '1px solid var(--hd-line)', color: 'var(--hd-sub)' }}
      >
        {ja ? 'EN' : 'JA'}
      </button>
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="relative grid place-items-center h-[34px] w-[34px] rounded-[8px]"
          style={{ border: '1px solid var(--hd-line)', color: 'var(--hd-sub)' }}
          aria-label={ja ? 'メニュー' : 'Menu'}
        >
          <Menu size={16} />
          {hasNewUpdate && (
            <span
              className="absolute -top-[4px] -right-[4px] w-[10px] h-[10px] rounded-full"
              style={{ background: 'var(--hd-accent)', border: '2px solid var(--hd-bg)' }}
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
              <Link
                href={withLang('/gacha', locale)}
                onClick={() => setMenuOpen(false)}
                className={MENU_ITEM}
              >
                <span>✦</span>
                <span>{ja ? 'ガチャ' : 'Gacha'}</span>
              </Link>
              <Link
                href={withLang('/guide', locale)}
                onClick={() => setMenuOpen(false)}
                className={MENU_ITEM}
              >
                <BookOpen size={14} />
                <span>{ja ? '使い方ガイド' : 'How to Use'}</span>
              </Link>
              <Link
                href={withLang('/score-formula', locale)}
                onClick={() => setMenuOpen(false)}
                className={MENU_ITEM}
              >
                <Calculator size={14} />
                <span>{ja ? 'スコア計算方法' : 'Scoring Method'}</span>
              </Link>
              <Link
                href={withLang('/chardb', locale)}
                onClick={() => setMenuOpen(false)}
                className={MENU_ITEM}
              >
                <Users size={14} />
                <span>{ja ? 'キャラ別ビルド' : 'Build Data'}</span>
              </Link>
              <Link
                href={withLang('/news', locale)}
                onClick={() => setMenuOpen(false)}
                className={MENU_ITEM}
              >
                <Bell size={14} />
                <span>{ja ? 'お知らせ' : "What's New"}</span>
                {hasNewUpdate && (
                  <span className="ml-auto w-2 h-2 rounded-full" style={{ background: 'var(--hd-accent)' }} />
                )}
              </Link>
              <Link
                href={withLang('/about', locale)}
                onClick={() => setMenuOpen(false)}
                className={MENU_ITEM}
                style={{ borderTop: '1px solid #f3f4f6' }}
              >
                <Info size={14} />
                <span>{ja ? 'このサイトについて' : 'About'}</span>
              </Link>
              <Link
                href={withLang('/privacy', locale)}
                onClick={() => setMenuOpen(false)}
                className={MENU_ITEM}
              >
                <FileText size={14} />
                <span>{ja ? 'プライバシーポリシー' : 'Privacy Policy'}</span>
              </Link>
              <Link
                href={withLang('/contact', locale)}
                onClick={() => setMenuOpen(false)}
                className={MENU_ITEM}
              >
                <Mail size={14} />
                <span>{ja ? 'お問い合わせ' : 'Contact'}</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </header>
  );

  return (
    <div
      className={`home-dark ${bodyFont.variable} ${numFont.variable} min-h-dvh`}
      style={{ background: 'var(--hd-bg)' }}
    >
      <h1 className="sr-only">
        {ja ? '音骸スコア厳選サポーター' : 'Echo Score Farming Supporter'}
      </h1>

      {tab === 'tune' ? (
        <div
          className="mx-auto w-full max-w-[480px] flex flex-col h-[100vh] overflow-hidden [@supports(height:100dvh)]:h-[100dvh]"
        >
          {header}

          {HAS_THIN_AD ? (
            <div className="-my-6 flex justify-center" style={{ flex: 'none' }}>
              <AdBannerThin />
            </div>
          ) : null}

          <BuildBar
            ja={ja}
            charName={charChipName}
            charNameEn={charChipNameEn}
            cost={cost}
            echoName={draftMeta.echoName}
            echoNameEn={draftMeta.echoNameEn}
            open={settingsOpen}
            onOpen={() => setSettingsOpen(true)}
            onClose={() => setSettingsOpen(false)}
            selectedCharId={selectedCharId}
            onCharChange={handleCharacterChange}
            charOptions={charOptions}
            onCostChange={setCost}
            selectedEchoId={selectedEchoId}
            onEchoChange={setSelectedEchoId}
            echoOptions={echoOptions}
            selectedHarmonySet={selectedHarmonySet}
            onHarmonyChange={setSelectedHarmonySet}
            harmonyOptions={harmonyOptions}
            draftMainstatKey={draftMainstatKey}
            onMainstatChange={setDraftMainstatKey}
            mainstatOptions={mainstatOptions}
            cost4MultiSet={cost4MultiSet}
            multiSetOptions={multiSetOptions}
            draftHarmonySet={draftHarmonySet}
            onDraftHarmonySetChange={setDraftHarmonySet}
          />

          <div
            className="flex flex-col gap-[8px] px-[16px] py-[8px] min-h-0 flex-1 overflow-hidden [@media(max-height:700px)]:gap-[6px] [@media(max-height:700px)]:pt-[6px]"
          >
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="flex items-baseline justify-between text-[13px] text-left w-full"
              style={{ flex: 'none', color: 'var(--hd-sub)' }}
            >
              <span>
                {ja ? 'メイン' : 'Main'}
                <b className="text-[14px] ml-[6px]" style={{ color: 'var(--hd-fg)' }}>
                  {ja
                    ? draftMeta.mainstat.label
                    : (MAINSTAT_LABEL_EN[draftMeta.mainstat.key] ?? draftMeta.mainstat.label)}
                </b>
              </span>
              <span
                className="hd-num text-[16px] font-semibold"
                style={{ color: 'var(--hd-fg)' }}
              >
                {draftMeta.mainstat.unit === '%'
                  ? `${draftMeta.mainstat.value.toFixed(1)}${draftMeta.mainstat.unit}`
                  : `${draftMeta.mainstat.value}${draftMeta.mainstat.unit}`}
              </span>
            </button>

            <SlotList
              ja={ja}
              substats={draftSubs}
              build={build}
              onRemove={removeSubstat}
            />

            <ForecastStrip
              ja={ja}
              advisor={draftAdvisor}
              finalScore={draftFinalScore}
            />

            <button
              type="button"
              onClick={() => setTab('records')}
              className="flex items-center gap-[14px] px-[12px] py-[8px] rounded-[10px] text-[12px] w-full text-left [@media(max-height:700px)]:hidden"
              style={{
                flex: 'none',
                boxShadow: 'inset 0 0 0 1px var(--hd-line)',
                color: 'var(--hd-sub)',
              }}
            >
              <span>
                {ja ? 'これまで' : 'So far'}
                <b className="hd-num text-[16px] mx-[2px]" style={{ color: 'var(--hd-fg)' }}>
                  {filteredEntries.length}
                </b>
                {ja ? '個' : ' echoes'}
              </span>
              <span>
                {ja ? 'S以上' : 'S or higher'}
                <b className="hd-num text-[16px] mx-[2px]" style={{ color: 'var(--hd-fg)' }}>
                  {sPlusCount}
                </b>
                {ja ? '個' : ' echoes'}
              </span>
              <span className="ml-auto font-bold" style={{ color: 'var(--hd-accent)' }}>
                {ja ? '記録を見る' : 'Open records'}
              </span>
            </button>
          </div>

          <InputDock
            ja={ja}
            draftSubs={draftSubs}
            pendingKey={pendingKey}
            onPendingKeyChange={setPendingKey}
            onAdd={addSubstat}
            onReset={resetDraft}
            finalScore={draftFinalScore}
            canFinalize={canFinalize}
            onFinalize={handleFinalize}
            build={build}
          />
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[480px]">
          {header}
          <div className="px-[16px] py-[24px] flex flex-col gap-[24px]">
            <RecordsPanel
              ja={ja}
              loaded={loaded}
              entries={filteredEntries}
              rankCounts={rankCounts}
              threshold={threshold}
              onThresholdChange={setThreshold}
              prediction={prediction}
              onDelete={handleDelete}
              onClearAll={handleClearFiltered}
            />
            <p className="text-[10px] text-[#9ca3af] text-center leading-relaxed" style={{ lineHeight: 1.6 }}>
              {ja
                ? '※ 予測はベイズ推定（理論確率を事前分布とし、実測データで更新）に基づく統計的な目安であり、実際の結果を保証するものではありません。記録データはブラウザ内（localStorage）にのみ保存されます。'
                : '* Predictions use Bayesian updating (theoretical rate as prior, updated with your logged data) and are a statistical estimate, not a guarantee. Your records are stored locally in your browser only.'}
            </p>
            <NativeBanner />
            <AdBanner />
          </div>
          <footer className="border-t border-[#f3f4f6] py-4">
            <p className="text-center text-xs text-[#9ca3af]">
              {ja ? '© 音骸シミュレーター（非公式ファンツール）' : '© Echo Simulator (unofficial fan tool)'}
            </p>
          </footer>
        </div>
      )}

      {updateModalOpen && (
        <UpdateModal
          onClose={() => {
            localStorage.setItem('lastSeenUpdate', LATEST_UPDATE_ID);
            setUpdateModalOpen(false);
            setHasNewUpdate(false);
          }}
        />
      )}
    </div>
  );
}
