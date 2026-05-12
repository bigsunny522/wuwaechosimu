'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import type { EchoCost, EchoState, ScoreResult, MainstatInfo } from '@/types/echo';
import { createEcho, upgradeEcho, upgradeToFull, rerollSubstats } from '@/lib/simulator';
import { scoreEcho } from '@/lib/scorer';
import { SUBSTAT_COUNT, MAINSTAT_POOLS } from '@/data/mainstats';
import { ECHOES_BY_COST, ECHOES, DEFAULT_ECHO_ID, HARMONY_SETS, HARMONY_SETS_EN } from '@/data/echoes';
import { CHARACTER_LIST, CHARACTER_MAP } from '@/data/characters';
import EchoCard from '@/components/EchoCard';
import ResourceCounter from '@/components/ResourceCounter';
import BulkSimModal from '@/components/BulkSimModal';
import ScoreDebugPanel from '@/components/ScoreDebugPanel';
import AdBonusModal from '@/components/AdBonusModal';
import SavedResultsModal, { type SavedResult } from '@/components/SavedResultsModal';
import { generateResultCard, buildShareText } from '@/lib/imageGen';
import { useLocale } from '@/lib/locale';
import { TRANSLATIONS, MAINSTAT_LABEL_EN, interpolate } from '@/data/translations';

const COST_OPTIONS: EchoCost[] = [4, 3, 1];
const ACCENT = '#7c3aed';
const BONUS_DURATION_MS = 5 * 60 * 1000;
const MAX_REROLL = 3;
const SAVE_PER_AD = 10;

const ZERO_COST = { shellCoins: 0, tunerBasic: 0, tunerAdvanced: 0, expMaterial: 0 };
type TotalCost = typeof ZERO_COST;

function addCost(a: TotalCost, b: TotalCost): TotalCost {
  return {
    shellCoins:    a.shellCoins    + b.shellCoins,
    tunerBasic:    a.tunerBasic    + b.tunerBasic,
    tunerAdvanced: a.tunerAdvanced + b.tunerAdvanced,
    expMaterial:   a.expMaterial   + b.expMaterial,
  };
}

type AdPurpose = 'bonus' | 'saves';

export default function Home() {
  const { locale, toggleLocale } = useLocale();
  const T = TRANSLATIONS[locale];

  const [cost, setCost] = useState<EchoCost>(4);
  const [selectedEchoId, setSelectedEchoId] = useState<string>(DEFAULT_ECHO_ID[4]);
  const [selectedHarmonySet, setSelectedHarmonySet] = useState<string>('');
  const [echo, setEcho] = useState<EchoState | null>(null);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [selectedCharId, setSelectedCharId] = useState<string>('generic');
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkUnlocked, setBulkUnlocked] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [maxedAt, setMaxedAt] = useState<number | null>(null);
  const [lifetimeCost, setLifetimeCost] = useState<TotalCost>(ZERO_COST);
  const cardRef = useRef<HTMLDivElement>(null);

  // ── Bonus time ──────────────────────────────────────────────────────────
  const [bonusEndTime, setBonusEndTime] = useState<number | null>(null);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [adPurpose, setAdPurpose] = useState<AdPurpose>('bonus');
  const [timeLeft, setTimeLeft] = useState(0);
  const [lockedMainstatKey, setLockedMainstatKey] = useState<string>('');
  const [rerollUsed, setRerollUsed] = useState(false);
  const [rerollIndices, setRerollIndices] = useState<Set<number>>(new Set());

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

  // ── Save slots ─────────────────────────────────────────────────────────
  const [saveSlots, setSaveSlots] = useState(0);
  const [savedResults, setSavedResults] = useState<SavedResult[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  // ── Ad configs (locale-aware) ──────────────────────────────────────────
  const adConfigs: Record<AdPurpose, { title: string; items: string[] }> = useMemo(() => ({
    bonus: {
      title: T.adBonusTitle,
      items: [T.adBonusItem1, T.adBonusItem2],
    },
    saves: {
      title: T.adSavesTitle,
      items: [
        interpolate(T.adSavesItem1, [SAVE_PER_AD]),
        T.adSavesItem2,
      ],
    },
  }), [T]);

  // ── Ad grant handler ───────────────────────────────────────────────────
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

  // ── Harmony set options ────────────────────────────────────────────────
  const harmonySetOptions = useMemo(() => {
    if (cost === 4) return [];
    const available = new Set(ECHOES.filter(e => e.cost === cost).flatMap(e => e.sets));
    return Object.values(HARMONY_SETS).filter(s => available.has(s));
  }, [cost]);

  // ── Core handlers ──────────────────────────────────────────────────────
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
  }, [echo, cost, selectedEchoId, selectedHarmonySet, bonusEndTime, lockedMainstatKey]);

  const handleUpgrade = useCallback(() => {
    if (!echo || echo.level >= 25) return;
    const next = upgradeEcho(echo);
    setEcho(next);
    const build = selectedCharId !== 'generic' ? CHARACTER_MAP[selectedCharId] : undefined;
    setScore(scoreEcho(next, build));
    if (next.level === 25) setMaxedAt(Date.now());
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
    if (echo) setLifetimeCost(prev => addCost(prev, echo.totalCost));
    setEcho(null);
    setScore(null);
    setMaxedAt(null);
    setRerollUsed(false);
    setRerollIndices(new Set());
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
      if (next.has(idx)) { next.delete(idx); }
      else if (next.size < MAX_REROLL) { next.add(idx); }
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    if (!echo || !score || echo.level < 25 || saveSlots <= 0) return;
    const ts = maxedAt ?? Date.now();
    setSavedResults(prev => [{ id: Date.now(), echo, score, maxedAt: ts }, ...prev]);
    setSaveSlots(prev => prev - 1);
  }, [echo, score, saveSlots, maxedAt]);

  const handleClearSaved = useCallback((id: number) => {
    setSavedResults(prev => prev.filter(r => r.id !== id));
  }, []);

  const isMaxLevel = echo?.level === 25;

  const displayCost = addCost(lifetimeCost, echo?.totalCost ?? ZERO_COST);
  const hasAnyCost = displayCost.shellCoins > 0;
  const echoList = ECHOES_BY_COST[cost];
  const showRerollPanel = bonusActive && echo?.level === 25 && !rerollUsed;
  const showMainstatLock = bonusActive;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0a0c14 0%, #0d0f1e 50%, #080b12 100%)' }}
    >
      {/* Header */}
      <header className="border-b border-slate-800/60 sticky top-0 z-30" style={{ background: 'rgba(10,12,20,0.85)' }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: `${ACCENT}33`, border: `1px solid ${ACCENT}66`, color: ACCENT }}
            >
              ◈
            </div>
            <span className="font-bold text-white text-sm tracking-wide">{T.appTitle}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Locale toggle */}
            <button
              onClick={toggleLocale}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors border"
              style={{ borderColor: 'rgba(148,163,184,0.2)', color: '#94a3b8', background: 'rgba(148,163,184,0.06)' }}
            >
              {locale === 'ja' ? 'EN' : 'JA'}
            </button>
            {/* Bonus status */}
            {bonusActive ? (
              <div
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium border"
                style={{ borderColor: '#f59e0b44', color: '#fbbf24', background: '#f59e0b11' }}
              >
                <span className="animate-pulse">✨</span>
                <span className="font-mono">{formatTime(timeLeft)}</span>
              </div>
            ) : (
              <button
                onClick={() => openAdModal('bonus')}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors border"
                style={{ borderColor: `${ACCENT}44`, color: ACCENT, background: `${ACCENT}11` }}
              >
                🎁<span className="hidden sm:inline"> {T.bonusBtn}</span>
              </button>
            )}
            {/* History */}
            <button
              onClick={() => setHistoryOpen(true)}
              className="relative flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors border"
              style={{ borderColor: `${ACCENT}44`, color: ACCENT, background: `${ACCENT}11` }}
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
            {/* Bulk sim */}
            <button
              onClick={() => setBulkOpen(true)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors border"
              style={{ borderColor: `${ACCENT}44`, color: ACCENT, background: `${ACCENT}11` }}
            >
              ⚡<span className="hidden sm:inline"> {T.bulkBtn}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 flex flex-col gap-6">

        {/* Character selector */}
        <div className="flex flex-col gap-2">
          <div className="text-xs text-slate-600 text-center tracking-wider uppercase">{T.charLabel}</div>
          <div className="relative">
            <select
              value={selectedCharId}
              onChange={(e) => { setSelectedCharId(e.target.value); setScore(null); }}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-200 appearance-none cursor-pointer"
              style={{ background: 'rgba(15,17,23,0.8)', border: `1px solid ${ACCENT}44`, outline: 'none' }}
            >
              <option value="generic" style={{ background: '#0f1117' }}>{T.charGeneric}</option>
              {CHARACTER_LIST.map((c) => (
                <option key={c.id} value={c.id} style={{ background: '#0f1117' }}>
                  {locale === 'en' ? (c.nameEn ?? c.name) : c.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">▼</div>
          </div>
        </div>

        {/* Cost selector */}
        <div className="flex flex-col gap-2">
          <div className="text-xs text-slate-600 text-center tracking-wider uppercase">{T.costLabel}</div>
          <div className="flex gap-2 justify-center">
            {COST_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => handleCostChange(c)}
                className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
                style={
                  cost === c
                    ? { background: ACCENT, color: '#fff', boxShadow: `0 0 16px ${ACCENT}66` }
                    : { background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.12)', color: '#94a3b8' }
                }
              >
                COST {c}
              </button>
            ))}
          </div>
          <div className="text-center text-xs text-slate-600">{interpolate(T.costSubstats, [SUBSTAT_COUNT[cost]])}</div>
        </div>

        {/* Main stat lock (bonus only) */}
        {showMainstatLock && (
          <div
            className="flex flex-col gap-2 rounded-xl p-4 border"
            style={{ borderColor: '#f59e0b44', background: '#f59e0b08' }}
          >
            <div className="text-xs text-amber-500 text-center tracking-wider uppercase">
              {T.bonusMainTitle}
            </div>
            <div className="relative">
              <select
                value={lockedMainstatKey}
                onChange={(e) => setLockedMainstatKey(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-200 appearance-none cursor-pointer"
                style={{ background: 'rgba(15,17,23,0.8)', border: '1px solid #f59e0b44', outline: 'none' }}
              >
                {MAINSTAT_POOLS[cost].map((m) => {
                  const label = locale === 'en' ? (MAINSTAT_LABEL_EN[m.key] ?? m.label) : m.label;
                  return (
                    <option key={m.key} value={m.key} style={{ background: '#0f1117' }}>
                      {label}（+25: {m.value}{m.unit}）
                    </option>
                  );
                })}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">▼</div>
            </div>
            <p className="text-xs text-amber-600/80 text-center">{T.bonusMainHint}</p>
          </div>
        )}

        {/* Echo / Harmony selector */}
        {cost === 4 ? (
          <div className="flex flex-col gap-2">
            <div className="text-xs text-slate-600 text-center tracking-wider uppercase">{T.echoSelectLabel}</div>
            <div className="relative">
              <select
                value={selectedEchoId}
                onChange={(e) => { setSelectedEchoId(e.target.value); setEcho(null); setScore(null); }}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-200 appearance-none cursor-pointer"
                style={{ background: 'rgba(15,17,23,0.8)', border: `1px solid ${ACCENT}44`, outline: 'none' }}
              >
                {echoList.map((e) => (
                  <option key={e.id} value={e.id} style={{ background: '#0f1117' }}>
                    {locale === 'en' ? (e.nameEn ?? e.name) : e.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">▼</div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="text-xs text-slate-600 text-center tracking-wider uppercase">{T.harmonySelectLabel}</div>
            <div className="relative">
              <select
                value={selectedHarmonySet}
                onChange={(e) => { setSelectedHarmonySet(e.target.value); setEcho(null); setScore(null); }}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-200 appearance-none cursor-pointer"
                style={{ background: 'rgba(15,17,23,0.8)', border: `1px solid ${ACCENT}44`, outline: 'none' }}
              >
                {harmonySetOptions.map((s) => (
                  <option key={s} value={s} style={{ background: '#0f1117' }}>
                    {locale === 'en' ? (HARMONY_SETS_EN[s] ?? s) : s}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">▼</div>
            </div>
            <div className="text-center text-xs text-slate-600">
              {interpolate(T.harmonyCount, [ECHOES.filter(e => e.cost === cost && e.sets.includes(selectedHarmonySet)).length])}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 justify-center flex-wrap">
          {!echo ? (
            <button
              onClick={handleStart}
              className="px-8 py-3 rounded-xl font-bold text-base text-white transition-all"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)`, boxShadow: `0 4px 20px ${ACCENT}55` }}
            >
              {T.getEcho}
            </button>
          ) : (
            <>
              <button
                onClick={handleUpgrade}
                disabled={isMaxLevel}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={
                  !isMaxLevel
                    ? { background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}aa)`, boxShadow: `0 4px 16px ${ACCENT}44` }
                    : { background: 'rgba(148,163,184,0.1)' }
                }
              >
                {isMaxLevel ? T.maxed : `+5 → +${echo.level + 5}`}
              </button>
              {bonusActive && (
                <button
                  onClick={handleMaxUpgrade}
                  disabled={isMaxLevel}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed border"
                  style={
                    !isMaxLevel
                      ? { borderColor: '#f59e0b66', color: '#fbbf24', background: '#f59e0b11' }
                      : { background: 'rgba(148,163,184,0.06)', borderColor: 'rgba(148,163,184,0.12)', color: '#94a3b8' }
                  }
                >
                  {T.maxUpgrade}
                </button>
              )}
              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl text-sm text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-slate-200 transition-colors"
              >
                {T.resetBtn}
              </button>
            </>
          )}
        </div>

        {/* 累計消費リソース */}
        {hasAnyCost && (
          <div className="w-full">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-xs text-slate-600 tracking-wider uppercase">{T.resourceLabel}</span>
              <button
                onClick={() => setLifetimeCost(ZERO_COST)}
                className="text-[10px] text-slate-700 hover:text-slate-400 border border-slate-800 hover:border-slate-600 px-1.5 py-0.5 rounded transition-colors"
              >
                {T.resourceReset}
              </button>
            </div>
            <ResourceCounter totalCost={displayCost} />
          </div>
        )}

        {/* Echo card */}
        {echo && (
          <div className="flex flex-col items-center gap-4">
            <EchoCard echo={echo} score={score} cardRef={cardRef} maxedAt={maxedAt} />

            {score && isMaxLevel && (
              <>
                <ScoreDebugPanel echo={echo} score={score} />

                {/* Download + Share + Save */}
                <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                  <button
                    onClick={async () => {
                      if (!cardRef.current) return;
                      setDownloading(true);
                      try {
                        const dataUrl = await generateResultCard(cardRef.current);
                        const a = document.createElement('a');
                        a.href = dataUrl;
                        a.download = `echo-${score.rank}-${score.score}pt.png`;
                        a.click();
                      } finally {
                        setDownloading(false);
                      }
                    }}
                    disabled={downloading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white border transition-all disabled:opacity-50"
                    style={{ borderColor: '#64748b44', background: 'rgba(100,116,139,0.12)', color: '#cbd5e1' }}
                  >
                    {downloading ? '⏳' : T.imgSave}
                  </button>
                  <button
                    onClick={() => {
                      const text = buildShareText(echo, score);
                      window.open(
                        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
                        '_blank', 'noopener,noreferrer'
                      );
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white border transition-all"
                    style={{ background: '#1a1a2e', border: '1px solid #334155' }}
                  >
                    {T.shareBtn}
                  </button>
                  {saveSlots > 0 ? (
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all"
                      style={{ borderColor: '#22c55e44', background: '#22c55e11', color: '#4ade80' }}
                    >
                      {T.saveBtn}
                      <span className="text-xs opacity-60">{interpolate(T.saveSlotsLeft, [saveSlots])}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => openAdModal('saves')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all"
                      style={{ borderColor: `${ACCENT}44`, color: ACCENT, background: `${ACCENT}11` }}
                    >
                      {interpolate(T.adSaveSlots, [SAVE_PER_AD])}
                    </button>
                  )}
                </div>
              </>
            )}

            {!isMaxLevel && echo.level > 0 && (
              <p className="text-xs text-slate-600 text-center">
                {interpolate(T.untilMax, [(25 - echo.level) / 5])}
              </p>
            )}
          </div>
        )}

        {/* Substat reroll panel */}
        {showRerollPanel && echo && (
          <div
            className="rounded-xl border p-4 flex flex-col gap-3"
            style={{ borderColor: '#f59e0b44', background: '#f59e0b08' }}
          >
            <div className="text-xs text-amber-500 text-center tracking-wider uppercase">
              {interpolate(T.rerollPanelTitle, [MAX_REROLL])}
            </div>
            <div className="space-y-2">
              {echo.substats.map((s, i) => {
                const selected = rerollIndices.has(i);
                const disabled = !selected && rerollIndices.size >= MAX_REROLL;
                return (
                  <button
                    key={i}
                    onClick={() => !disabled && toggleRerollIndex(i)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all"
                    style={{
                      background: selected ? '#f59e0b22' : 'rgba(15,17,23,0.6)',
                      border: selected ? '1px solid #f59e0b66' : '1px solid rgba(148,163,184,0.12)',
                      opacity: disabled ? 0.4 : 1,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <span className="text-slate-300">{s.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{s.value}{s.unit}</span>
                      {selected && <span className="text-amber-400 text-xs">{T.rerollBadge}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleReroll}
              disabled={rerollIndices.size === 0}
              className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={
                rerollIndices.size > 0
                  ? { background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 16px #f59e0b44' }
                  : { background: 'rgba(148,163,184,0.1)' }
              }
            >
              {rerollIndices.size > 0
                ? interpolate(T.rerollBtn, [rerollIndices.size])
                : T.rerollSelect}
            </button>
          </div>
        )}

        {bonusActive && echo?.level === 25 && rerollUsed && (
          <div className="text-center text-xs text-amber-600/70">{T.rerollUsed}</div>
        )}

        {/* Empty state */}
        {!echo && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl border"
              style={{ background: `${ACCENT}11`, borderColor: `${ACCENT}33` }}
            >
              ◈
            </div>
            <p className="text-slate-500 text-sm max-w-xs">
              {T.emptyText}
            </p>
            {!bonusActive && (
              <button
                onClick={() => openAdModal('bonus')}
                className="mt-2 px-5 py-2 rounded-xl text-sm font-medium border transition-colors"
                style={{ borderColor: `${ACCENT}44`, color: ACCENT, background: `${ACCENT}11` }}
              >
                {T.emptyBonus}
              </button>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800/40 py-3">
        <p className="text-center text-xs text-slate-700">{T.footer}</p>
      </footer>

      {bulkOpen && (
        <BulkSimModal
          cost={cost}
          unlocked={bulkUnlocked}
          onUnlock={() => setBulkUnlocked(true)}
          onClose={() => setBulkOpen(false)}
        />
      )}

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
    </div>
  );
}
