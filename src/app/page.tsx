'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import Link from 'next/link';
import type { EchoCost, EchoState, ScoreResult, MainstatInfo } from '@/types/echo';
import { createEcho, upgradeEcho, upgradeToFull, rerollSubstats } from '@/lib/simulator';
import { scoreEcho } from '@/lib/scorer';
import { SUBSTAT_COUNT, MAINSTAT_POOLS } from '@/data/mainstats';
import { ECHOES_BY_COST, ECHOES, DEFAULT_ECHO_ID, HARMONY_SETS, HARMONY_SETS_EN } from '@/data/echoes';
import { CHARACTER_LIST, CHARACTER_MAP } from '@/data/characters';
import EchoCard from '@/components/EchoCard';
import ResourceCounter from '@/components/ResourceCounter';
import ScoreDebugPanel from '@/components/ScoreDebugPanel';
import AdBonusModal from '@/components/AdBonusModal';
import SavedResultsModal, { type SavedResult } from '@/components/SavedResultsModal';
import { generateResultCard, buildShareText } from '@/lib/imageGen';
import { useLocale } from '@/lib/locale';
import { TRANSLATIONS, MAINSTAT_LABEL_EN, interpolate } from '@/data/translations';
import CustomSelect from '@/components/CustomSelect';

const COST_OPTIONS: EchoCost[] = [4, 3, 1];
const ACCENT          = '#0275fd';
const BONUS_DURATION_MS = 5 * 60 * 1000;
const MAX_REROLL      = 3;
const SAVE_PER_AD     = 10;

const ZERO_COST = { shellCoins: 0, tunerBasic: 0, tunerAdvanced: 0, expMaterial: 0 };
type TotalCost  = typeof ZERO_COST;
type AdPurpose  = 'bonus' | 'saves';

function addCost(a: TotalCost, b: TotalCost): TotalCost {
  return {
    shellCoins:    a.shellCoins    + b.shellCoins,
    tunerBasic:    a.tunerBasic    + b.tunerBasic,
    tunerAdvanced: a.tunerAdvanced + b.tunerAdvanced,
    expMaterial:   a.expMaterial   + b.expMaterial,
  };
}


export default function Home() {
  const { locale, toggleLocale } = useLocale();
  const T = TRANSLATIONS[locale];

  const [cost, setCost]                       = useState<EchoCost>(4);
  const [selectedEchoId, setSelectedEchoId]   = useState<string>(DEFAULT_ECHO_ID[4]);
  const [selectedHarmonySet, setSelectedHarmonySet] = useState<string>('');
  const [echo, setEcho]                       = useState<EchoState | null>(null);
  const [score, setScore]                     = useState<ScoreResult | null>(null);
  const [selectedCharId, setSelectedCharId]   = useState<string>('generic');
  const [downloading, setDownloading]         = useState(false);
  const [maxedAt, setMaxedAt]                 = useState<number | null>(null);
  const [lifetimeCost, setLifetimeCost]       = useState<TotalCost>(ZERO_COST);
  const echoSectionRef   = useRef<HTMLDivElement>(null);
  const scrollOnNext     = useRef(false);

  /* ── Bonus time ─────────────────────────────────────────────── */
  const [bonusEndTime, setBonusEndTime]       = useState<number | null>(null);
  const [adModalOpen, setAdModalOpen]         = useState(false);
  const [adPurpose, setAdPurpose]             = useState<AdPurpose>('bonus');
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

  /* ── Auto-scroll to echo card on new draw ───────────────────── */
  useEffect(() => {
    if (!echo || !scrollOnNext.current) return;
    scrollOnNext.current = false;
    const timer = setTimeout(() => {
      echoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => clearTimeout(timer);
  }, [echo]);

  /* ── Save slots ─────────────────────────────────────────────── */
  const [saveSlots, setSaveSlots]             = useState(0);
  const [savedResults, setSavedResults]       = useState<SavedResult[]>([]);
  const [historyOpen, setHistoryOpen]         = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  /* ── Ad configs (locale-aware) ──────────────────────────────── */
  const adConfigs: Record<AdPurpose, { title: string; items: string[] }> = useMemo(() => ({
    bonus: { title: T.adBonusTitle, items: [T.adBonusItem1, T.adBonusItem2] },
    saves: { title: T.adSavesTitle, items: [interpolate(T.adSavesItem1, [SAVE_PER_AD]), T.adSavesItem2] },
  }), [T]);

  /* ── Handlers ───────────────────────────────────────────────── */
  const handleGrantBonus = useCallback(() => {
    if (adPurpose === 'bonus') {
      setBonusEndTime(Date.now() + BONUS_DURATION_MS);
      setLockedMainstatKey(MAINSTAT_POOLS[cost][0].key);
      setRerollUsed(false);
      setRerollIndices(new Set());
    } else {
      setSaveSlots((prev) => prev + SAVE_PER_AD);
    }
  }, [adPurpose, cost]);

  const openAdModal = useCallback((purpose: AdPurpose) => {
    setAdPurpose(purpose);
    setAdModalOpen(true);
  }, []);

  const harmonySetOptions = useMemo(() => {
    if (cost === 4) return [];
    const available = new Set(ECHOES.filter(e => e.cost === cost).flatMap(e => e.sets));
    return Object.values(HARMONY_SETS).filter(s => available.has(s));
  }, [cost]);

  const handleCostChange = useCallback((c: EchoCost) => {
    setCost(c);
    setSelectedEchoId(DEFAULT_ECHO_ID[c]);
    if (c !== 4) {
      const available = new Set(ECHOES.filter(e => e.cost === c).flatMap(e => e.sets));
      const first = Object.values(HARMONY_SETS).find(s => available.has(s)) ?? '';
      setSelectedHarmonySet(first);
    }
    setLockedMainstatKey(MAINSTAT_POOLS[c][0].key);
    setEcho(null);
    setScore(null);
  }, []);

  const handleStart = useCallback(() => {
    scrollOnNext.current = true;
    if (echo) setLifetimeCost(prev => addCost(prev, echo.totalCost));
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
    setEcho(createEcho(cost, echoId, fixedMain));
    setScore(null);
    setMaxedAt(null);
    setRerollUsed(false);
    setRerollIndices(new Set());
    setShowResultModal(false);
  }, [echo, cost, selectedEchoId, selectedHarmonySet, bonusEndTime, lockedMainstatKey]);

  const handleUpgrade = useCallback(() => {
    if (!echo || echo.level >= 25) return;
    const next = upgradeEcho(echo);
    setEcho(next);
    const build = selectedCharId !== 'generic' ? CHARACTER_MAP[selectedCharId] : undefined;
    setScore(scoreEcho(next, build));
    if (next.level === 25) {
      setMaxedAt(Date.now());
      if (window.innerWidth < 640) setShowResultModal(true);
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
    if (echo) setLifetimeCost(prev => addCost(prev, echo.totalCost));
    setEcho(null); setScore(null); setMaxedAt(null);
    setRerollUsed(false); setRerollIndices(new Set());
    setShowResultModal(false);
  }, [echo]);

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
  const displayCost = addCost(lifetimeCost, echo?.totalCost ?? ZERO_COST);
  const hasAnyCost  = displayCost.shellCoins > 0;
  const echoList    = ECHOES_BY_COST[cost];

  const charOptions = useMemo(() => [
    { value: 'generic', label: T.charGeneric },
    ...CHARACTER_LIST.map((c) => ({
      value: c.id,
      label: locale === 'en' ? (c.nameEn ?? c.name) : c.name,
    })),
  ], [T.charGeneric, locale]);

  const echoOptions = useMemo(() =>
    echoList
      .map((e) => ({
        value: e.id,
        label: locale === 'en' ? (e.nameEn ?? e.name) : e.name,
      }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, locale === 'en' ? 'en' : 'ja', { sensitivity: 'base' })
      ),
  [echoList, locale]);

  const harmonyOptions = useMemo(() =>
    harmonySetOptions.map((s) => ({
      value: s,
      label: locale === 'en' ? (HARMONY_SETS_EN[s] ?? s) : s,
    })),
  [harmonySetOptions, locale]);

  const mainstatOptions = useMemo(() =>
    MAINSTAT_POOLS[cost].map((m) => ({
      value: m.key,
      label: `${locale === 'en' ? (MAINSTAT_LABEL_EN[m.key] ?? m.label) : m.label}（+25: ${m.value}${m.unit}）`,
    })),
  [cost, locale]);
  const showRerollPanel   = bonusActive && echo?.level === 25 && !rerollUsed;
  const showMainstatLock  = bonusActive;
  const formatTime  = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ── Header ────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 bg-white"
        style={{ borderBottom: '1px solid #e5e7eb' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-semibold text-white"
              style={{ background: ACCENT }}
            >
              ◈
            </div>
            <span className="font-semibold text-[#222222] text-sm tracking-tight">{T.appTitle}</span>
          </div>

          {/* Nav buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Guide link */}
            <Link
              href="/guide"
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors border border-[#e5e7eb] text-[#707070] hover:text-[#222222] hover:border-[#d1d5db]"
              title={locale === 'ja' ? '使い方ガイド' : 'How to Use'}
            >
              <span>📖</span>
              <span className="hidden sm:inline">{locale === 'ja' ? '使い方' : 'Guide'}</span>
            </Link>
            {/* Locale toggle */}
            <button
              onClick={toggleLocale}
              className="px-2 py-1.5 rounded-lg text-xs font-medium transition-colors border border-[#e5e7eb] text-[#707070] hover:text-[#222222] hover:border-[#d1d5db]"
            >
              {locale === 'ja' ? 'EN' : 'JA'}
            </button>

            {/* Bonus */}
            {bonusActive ? (
              <div
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium border"
                style={{ borderColor: `${ACCENT}44`, color: ACCENT, background: '#eef9ff' }}
              >
                <span className="animate-pulse">✨</span>
                <span
                  className="font-medium"
                  style={{ fontFamily: '"IBM Plex Mono", monospace' }}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>
            ) : (
              <button
                onClick={() => openAdModal('bonus')}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors border animate-pulseRing"
                style={{ borderColor: `${ACCENT}44`, color: ACCENT, background: '#eef9ff' }}
              >
                🎁<span className="hidden sm:inline"> {T.bonusBtn}</span>
              </button>
            )}

            {/* History */}
            <button
              onClick={() => setHistoryOpen(true)}
              className="relative flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors border border-[#e5e7eb] text-[#707070] hover:text-[#222222] hover:border-[#d1d5db]"
            >
              📋<span className="hidden sm:inline"> {T.historyBtn}</span>
              {savedResults.length > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                  style={{ background: ACCENT }}
                >
                  {savedResults.length}
                </span>
              )}
            </button>

          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 flex flex-col gap-8 pb-28">

        {/* Character selector */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-sm">⚔️</span>
            <label
              className="text-xs font-medium uppercase tracking-wider text-[#9ca3af]"
              style={{ fontFamily: '"IBM Plex Mono", monospace' }}
            >
              {T.charLabel}
            </label>
          </div>
          <CustomSelect
            value={selectedCharId}
            onChange={(v) => { setSelectedCharId(v); setScore(null); }}
            options={charOptions}
            accentColor="#0275fd"
            background="linear-gradient(135deg, #f0f7ff 0%, #fafbff 100%)"
            borderColor="#bdd4fb"
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
                    ? { background: '#222222', color: '#f7f7f7' }
                    : { background: '#f7f7f7', border: '1px solid #e5e7eb', color: '#707070' }
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
            style={{ borderColor: `${ACCENT}44`, background: '#eef9ff' }}
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
              background="#ffffff"
              borderColor={`${ACCENT}44`}
            />
            <p className="text-xs text-center" style={{ color: `${ACCENT}99` }}>{T.bonusMainHint}</p>
          </div>
        )}

        {/* Echo / Harmony selector */}
        {cost === 4 ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-sm">◈</span>
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
              accentColor="#783cf0"
              background="linear-gradient(135deg, #f5f0ff 0%, #fafbff 100%)"
              borderColor="#cdbdfb"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-sm">◈</span>
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
              accentColor="#783cf0"
              background="linear-gradient(135deg, #f5f0ff 0%, #fafbff 100%)"
              borderColor="#cdbdfb"
            />
            <div
              className="text-center text-xs text-[#9ca3af]"
              style={{ fontFamily: '"IBM Plex Mono", monospace' }}
            >
              {interpolate(T.harmonyCount, [ECHOES.filter(e => e.cost === cost && e.sets.includes(selectedHarmonySet)).length])}
            </div>
          </div>
        )}

        {/* Echo card */}
        {echo && (
          <div ref={echoSectionRef} className="flex flex-col items-center gap-4">
            <EchoCard echo={echo} score={score} maxedAt={maxedAt} />

            {score && isMaxLevel && (
              <>
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
                      {downloading ? '⏳' : T.imgSave}
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
                      onClick={() => openAdModal('saves')}
                      className="w-full py-2.5 rounded-[500px] text-sm font-medium text-[#f7f7f7] bg-[#222222] hover:opacity-80 transition-opacity"
                    >
                      {interpolate(T.saveCTABtn, [SAVE_PER_AD])}
                    </button>
                  )}
                </div>

                {/* ── スマホ: モーダルを再表示するボタン ── */}
                {!showResultModal && (
                  <button
                    onClick={() => setShowResultModal(true)}
                    className="sm:hidden w-full py-2.5 rounded-[500px] text-sm font-medium border border-[#0275fd44] text-[#0275fd] hover:bg-[#eef9ff] transition-colors"
                  >
                    {T.resultShowBtn}
                  </button>
                )}
              </>
            )}

          </div>
        )}

        {/* 累計消費リソース */}
        {hasAnyCost && (
          <div className="w-full">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span
                className="text-xs text-[#9ca3af] tracking-wider uppercase"
                style={{ fontFamily: '"IBM Plex Mono", monospace' }}
              >
                {T.resourceLabel}
              </span>
              <button
                onClick={() => setLifetimeCost(ZERO_COST)}
                className="text-[10px] text-[#9ca3af] hover:text-[#707070] border border-[#e5e7eb] hover:border-[#d1d5db] px-1.5 py-0.5 rounded transition-colors"
              >
                {T.resourceReset}
              </button>
            </div>
            <ResourceCounter totalCost={displayCost} />
          </div>
        )}

        {/* Reroll panel */}
        {showRerollPanel && echo && (
          <div
            className="rounded-xl border p-4 flex flex-col gap-3"
            style={{ borderColor: `${ACCENT}44`, background: '#eef9ff' }}
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
              className="w-full py-2.5 rounded-[500px] font-medium text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed text-[#f7f7f7]"
              style={{ background: rerollIndices.size > 0 ? '#222222' : '#9ca3af' }}
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
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
                style={{ background: '#eef9ff', border: `1px solid ${ACCENT}33` }}
              >
                ◈
              </div>
              <p className="text-[#707070] text-sm max-w-xs leading-relaxed mx-auto" style={{ lineHeight: 1.7 }}>
                {T.emptyText}
              </p>
            </div>

            {!bonusActive && (
              <div
                className="w-full rounded-2xl bg-white overflow-hidden animate-fadeUp"
                style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
              >
                {/* Top accent stripe */}
                <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #0275fd, #60a5fa)' }} />
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-sm font-semibold text-[#222222]">🎁 {T.bonusCardTitle}</span>
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
                          className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold mt-0.5"
                          style={{ background: ACCENT }}
                        >
                          ✓
                        </span>
                        <span className="text-[#222222] leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                  {/* Duration badge */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-xs text-[#9ca3af]">⏱</span>
                    <span className="text-xs font-medium" style={{ color: ACCENT }}>{T.adDuration}</span>
                  </div>
                  {/* Ad note */}
                  <p className="text-xs text-[#9ca3af] mb-4">{T.bonusAdNote}</p>
                  {/* CTA */}
                  <button
                    onClick={() => openAdModal('bonus')}
                    className="w-full py-3 rounded-[500px] text-sm font-semibold text-[#f7f7f7] bg-[#222222] hover:opacity-80 transition-opacity animate-pulseRing"
                  >
                    {T.bonusCTA}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Sticky bottom action bar ─────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur-sm"
        style={{ borderTop: '1px solid #e5e7eb', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="max-w-2xl mx-auto px-4 pt-2 pb-3">
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
              className="w-full py-3 rounded-[500px] font-semibold text-sm text-[#f7f7f7] bg-[#222222] hover:opacity-80 transition-opacity"
            >
              {T.getEcho}
            </button>
          ) : !isMaxLevel ? (
            /* ── Upgrading: level-up controls ── */
            <div className="flex items-center gap-2">
              <button
                onClick={handleUpgrade}
                className="flex-1 py-3 rounded-[500px] font-semibold text-sm text-white hover:opacity-80 transition-opacity"
                style={{ background: ACCENT }}
              >
                +5 → +{echo.level + 5}
              </button>
              {bonusActive && (
                <button
                  onClick={handleMaxUpgrade}
                  className="px-4 py-3 rounded-[500px] font-medium text-sm border hover:opacity-80 transition-opacity shrink-0"
                  style={{ borderColor: `${ACCENT}66`, color: ACCENT, background: '#eef9ff' }}
                >
                  {T.maxUpgrade}
                </button>
              )}
              <button
                onClick={handleReset}
                className="px-4 py-3 rounded-[500px] text-sm text-[#707070] border border-[#e5e7eb] hover:border-[#d1d5db] hover:text-[#222222] transition-colors shrink-0"
              >
                {T.resetBtn}
              </button>
            </div>
          ) : (
            /* ── Maxed: next echo or reset ── */
            <div className="flex items-center gap-2">
              <button
                onClick={handleStart}
                className="flex-1 py-3 rounded-[500px] font-semibold text-sm text-[#f7f7f7] bg-[#222222] hover:opacity-80 transition-opacity"
              >
                {T.getEcho}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-3 rounded-[500px] text-sm text-[#707070] border border-[#e5e7eb] hover:border-[#d1d5db] hover:text-[#222222] transition-colors shrink-0"
              >
                {T.resetBtn}
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-[#f3f4f6] py-4">
        <p className="text-center text-xs text-[#9ca3af]">{T.footer}</p>
      </footer>

      {adModalOpen && (
        <AdBonusModal
          {...adConfigs[adPurpose]}
          onGrantBonus={handleGrantBonus}
          onClose={() => setAdModalOpen(false)}
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
            className="w-full rounded-t-3xl bg-white shadow-2xl animate-fadeUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-2.5 pb-1">
              <div className="w-8 h-1 rounded-full bg-[#e5e7eb]" />
            </div>

            <div className="px-4 pt-1 pb-5 flex flex-col gap-3">
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
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-[#e5e7eb] text-[#707070] hover:text-[#222222] hover:border-[#d1d5db] transition-colors disabled:opacity-50"
                >
                  {downloading ? '⏳' : T.imgSave}
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
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-[#e5e7eb] text-[#707070] hover:text-[#222222] hover:border-[#d1d5db] transition-colors"
                >
                  {T.shareBtn}
                </button>
                {saveSlots > 0 && (
                  <button
                    onClick={() => { handleSave(); setShowResultModal(false); }}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors"
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
                  onClick={() => { openAdModal('saves'); setShowResultModal(false); }}
                  className="w-full py-2.5 rounded-[500px] text-sm font-medium text-[#f7f7f7] bg-[#222222] hover:opacity-80 transition-opacity"
                >
                  {interpolate(T.saveCTABtn, [SAVE_PER_AD])}
                </button>
              )}

              {/* Close */}
              <button
                onClick={() => setShowResultModal(false)}
                className="w-full py-2.5 rounded-[500px] text-sm text-[#9ca3af] border border-[#e5e7eb] hover:text-[#222222] hover:border-[#d1d5db] transition-colors"
              >
                {T.adCloseBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
