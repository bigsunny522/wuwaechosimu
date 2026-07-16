'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import type { EchoCost, EchoState, Substat, SubstatKey } from '@/types/echo';
import { SUBSTAT_DATA, SUBSTAT_MAP } from '@/data/substats';
import { MAINSTAT_POOLS } from '@/data/mainstats';
import { ECHOES, ECHOES_BY_COST, DEFAULT_ECHO_ID, HARMONY_SETS, HARMONY_SETS_EN } from '@/data/echoes';
import { CHARACTER_LIST, CHARACTER_MAP } from '@/data/characters';
import { scoreEcho, getSubstatCategory } from '@/lib/scorer';
import { RANK_COLORS } from '@/lib/scorer';
import { simulateCompletion } from '@/lib/monteCarlo';
import {
  type TrackedEntry, type Threshold, type BaselineStats,
  loadEntries, saveEntries, computeBaseline, predict, probAtLeastOneWithin,
  RANK_ORDER,
} from '@/lib/tracker';
import { useLocale, withLang } from '@/lib/locale';
import { SUBSTAT_LABEL_EN, MAINSTAT_LABEL_EN } from '@/data/translations';
import CustomSelect from '@/components/CustomSelect';
import EchoIcon from '@/components/EchoIcon';
import EchoAdvisor from '@/components/EchoAdvisor';
import ScoreDistributionChart from '@/components/ScoreDistributionChart';

const ACCENT = '#0275fd';
const COST_OPTIONS: EchoCost[] = [4, 3, 1];
const ZERO_COST = { shellCoins: 0, tunerBasic: 0, tunerAdvanced: 0, expMaterial: 0 };
const RUN_MILESTONES = [5, 10, 20, 50];
const MAX_SUBSTATS = 5;

function getRepresentativeEchoId(cost: EchoCost, harmonySet: string): string {
  const found = ECHOES.find((e) => e.cost === cost && e.sets.includes(harmonySet));
  return found?.id ?? DEFAULT_ECHO_ID[cost];
}

// COST4: キャラの推奨/可セットに属する音骸を探す（推奨優先）
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

// COST3/1: キャラの推奨/可セットのうち、そのコストに実在するものを探す（推奨優先）
function getRecommendedHarmonySet(charId: string, cost: EchoCost): string | null {
  if (charId === 'generic' || cost === 4) return null;
  const char = CHARACTER_MAP[charId];
  if (!char) return null;
  const available = new Set(ECHOES.filter((e) => e.cost === cost).flatMap((e) => e.sets));
  return char.harmonySets.recommended.find((s) => available.has(s))
    ?? char.harmonySets.acceptable.find((s) => available.has(s))
    ?? null;
}

export default function SupporterClient() {
  const { locale, toggleLocale } = useLocale();
  const ja = locale === 'ja';

  /* ── 対象ビルド選択 ─────────────────────────────────────────── */
  const [selectedCharId, setSelectedCharId] = useState('generic');
  const [cost, setCost] = useState<EchoCost>(4);
  const [selectedEchoId, setSelectedEchoId] = useState(DEFAULT_ECHO_ID[4]);
  const [selectedHarmonySet, setSelectedHarmonySet] = useState('');
  const [draftHarmonySet, setDraftHarmonySet] = useState(''); // cost4で複数セット持ちの音骸用

  /* ── 記録フォーム：判明済みサブステ（+5ごとに1個ずつ追加） ────── */
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

  /* ── 理論値（ベースライン） ─────────────────────────────────── */
  const [baseline, setBaseline] = useState<BaselineStats | null>(null);
  const [, setBaselineLoading] = useState(false);

  useEffect(() => {
    setBaselineLoading(true);
    const repEchoId = cost === 4 ? selectedEchoId : getRepresentativeEchoId(cost, selectedHarmonySet);
    const timer = setTimeout(() => {
      setBaseline(computeBaseline(cost, repEchoId, build));
      setBaselineLoading(false);
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cost, selectedEchoId, selectedHarmonySet, selectedCharId]);

  /* ── 記録一覧（localStorage 永続化） ────────────────────────── */
  const [entries, setEntries] = useState<TrackedEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setEntries(loadEntries()); setLoaded(true); }, []);

  const filteredEntries = useMemo(
    () => entries.filter((e) => e.cost === cost && e.charId === selectedCharId),
    [entries, cost, selectedCharId],
  );

  /* ── 入力フォーム ───────────────────────────────────────────── */
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

  // 現在のフォーム選択（メインステ・セット）から音骸のメタ情報を組み立てる
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

  const availableSubstatOptions = useMemo(() => {
    const used = new Set(draftSubs.map((s) => s.key));
    const priority = (b?: 'recommended' | 'acceptable') =>
      b === 'recommended' ? 0 : b === 'acceptable' ? 1 : 2;

    return SUBSTAT_DATA
      .filter((s) => !used.has(s.key))
      .map((s, i) => {
        const cat = getSubstatCategory(s.key, build);
        const badge: 'recommended' | 'acceptable' | undefined =
          cat === 'recommended' || cat === 'preferred' ? 'recommended'
          : cat === 'acceptable' ? 'acceptable'
          : undefined;
        return { ...s, badge, _i: i };
      })
      .sort((a, b) => {
        const pd = priority(a.badge) - priority(b.badge);
        return pd !== 0 ? pd : a._i - b._i;
      });
  }, [draftSubs, build]);

  const pendingEntry = pendingKey ? SUBSTAT_MAP[pendingKey as SubstatKey] : null;
  const pendingTierOptions = pendingEntry
    ? pendingEntry.values.map((v, idx) => ({ value: String(idx), label: `${v}${pendingEntry.unit}（T${idx}）` }))
    : [];

  const addSubstat = useCallback(() => {
    if (!pendingEntry || draftSubs.length >= MAX_SUBSTATS) return;
    const sub: Substat = {
      key: pendingEntry.key,
      label: pendingEntry.label,
      unit: pendingEntry.unit,
      value: pendingEntry.values[pendingTier],
      tier: pendingTier,
      maxValue: pendingEntry.values[pendingEntry.values.length - 1],
    };
    setDraftSubs((prev) => [...prev, sub]);
    setPendingKey('');
    setPendingTier(0);
  }, [pendingEntry, pendingTier, draftSubs.length]);

  const removeSubstat = useCallback((idx: number) => {
    setDraftSubs((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const resetDraft = useCallback(() => {
    setDraftSubs([]);
    setPendingKey('');
    setPendingTier(0);
  }, []);

  // +5ごとに1個ずつ判明していく過程のライブ予測（EchoAdvisorを流用）
  const draftAdvisor = useMemo(() => {
    if (draftSubs.length === 0 || draftSubs.length >= MAX_SUBSTATS) return null;
    return simulateCompletion(buildDraftEcho(draftSubs), build);
  }, [draftSubs, buildDraftEcho, build]);

  // 5個そろったら確定スコアを計算
  const draftFinalScore = useMemo(() => {
    if (draftSubs.length < MAX_SUBSTATS) return null;
    return scoreEcho(buildDraftEcho(draftSubs), build);
  }, [draftSubs, buildDraftEcho, build]);

  const canFinalize = draftSubs.length === MAX_SUBSTATS && (!cost4MultiSet || draftHarmonySet) && (cost === 4 || selectedHarmonySet);

  // 5個そろって確定スコアが出た瞬間、フォームが伸びて画面外に隠れている結果を自動で表示範囲に入れる
  const resultRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!draftFinalScore) return;
    const timer = setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => clearTimeout(timer);
  }, [draftFinalScore]);

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

  /* ── 予測 ───────────────────────────────────────────────────── */
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

  const LUCK_LABEL: Record<string, { ja: string; en: string; icon: string; color: string }> = {
    hot:          { ja: '絶好調',       en: 'On fire',       icon: '🔥', color: '#f59e0b' },
    warm:         { ja: '好調',         en: 'Lucky',         icon: '📈', color: '#10b981' },
    neutral:      { ja: '平常運',       en: 'Average',       icon: '⚖️', color: '#6b7280' },
    cool:         { ja: 'やや不調',     en: 'Below average', icon: '📉', color: '#f97316' },
    cold:         { ja: '絶不調',       en: 'Cold streak',   icon: '🥶', color: '#ef4444' },
    insufficient: { ja: 'データ不足',   en: 'Not enough data', icon: '❔', color: '#9ca3af' },
  };

  const fmtPct = (v: number) => `${(v * 100).toFixed(1)}%`;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white" style={{ borderBottom: '1px solid #e5e7eb' }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <EchoIcon size={28} color={ACCENT} />
            <span className="font-semibold text-[#222222] text-sm tracking-tight">
              {ja ? '厳選サポーター' : 'Selection Supporter'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Mode switcher: シミュレーター / 厳選サポーター */}
            <div
              className="flex items-center rounded-lg p-0.5 shrink-0"
              style={{ background: '#f3f4f6' }}
            >
              <Link
                href={withLang('/', locale)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-[#707070] hover:text-[#222222] transition-colors"
                title={ja ? 'ゲーム感覚で理論値を試す' : 'Try theoretical odds, game-style'}
              >
                <span>✦</span>
                <span className="hidden sm:inline">{ja ? 'ガチャ' : 'Gacha'}</span>
              </Link>
              <span
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold"
                style={{ background: '#ffffff', color: ACCENT, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}
              >
                <span>📊</span>
                <span className="hidden sm:inline">{ja ? '厳選管理' : 'Manage'}</span>
              </span>
            </div>
            <button
              onClick={toggleLocale}
              className="px-2 py-1.5 rounded-lg text-xs font-medium transition-colors border border-[#e5e7eb] text-[#707070] hover:text-[#222222] hover:border-[#d1d5db]"
            >
              {ja ? 'EN' : 'JA'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 flex flex-col gap-6 pb-16">
        {/* Intro */}
        <div className="text-center flex flex-col gap-1.5">
          <h1 className="text-lg font-semibold text-[#222222]">
            {ja ? '厳選サポーター' : 'Selection Supporter'}
          </h1>
        </div>

        {/* ── 対象ビルド ── */}
        <section className="flex flex-col gap-3 rounded-xl border border-[#e5e7eb] p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-[#9ca3af]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
            {ja ? '① 対象ビルド' : '① Target build'}
          </div>
          <CustomSelect value={selectedCharId} onChange={handleCharacterChange} options={charOptions} />
          <div className="flex gap-2 justify-center">
            {COST_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => setCost(c)}
                className="px-5 py-2 rounded-[500px] font-medium text-sm transition-all"
                style={cost === c
                  ? { background: '#222222', color: '#f7f7f7' }
                  : { background: '#f7f7f7', border: '1px solid #e5e7eb', color: '#707070' }}
              >
                COST {c}
              </button>
            ))}
          </div>
          {cost === 4 ? (
            <CustomSelect
              value={selectedEchoId}
              onChange={setSelectedEchoId}
              options={echoOptions}
              accentColor="#783cf0"
              background="linear-gradient(135deg, #f5f0ff 0%, #fafbff 100%)"
              borderColor="#cdbdfb"
            />
          ) : (
            <CustomSelect
              value={selectedHarmonySet}
              onChange={setSelectedHarmonySet}
              options={harmonyOptions}
              accentColor="#783cf0"
              background="linear-gradient(135deg, #f5f0ff 0%, #fafbff 100%)"
              borderColor="#cdbdfb"
            />
          )}
        </section>

        {/* ── 記録フォーム ── */}
        <section className="flex flex-col gap-3 rounded-xl border border-[#e5e7eb] p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-[#9ca3af]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
            {ja ? '② 実際に出た音骸を記録' : '② Record an echo you actually pulled'}
          </div>

          <CustomSelect value={draftMainstatKey} onChange={setDraftMainstatKey} options={mainstatOptions} />

          {cost4MultiSet && (
            <CustomSelect
              value={draftHarmonySet}
              onChange={setDraftHarmonySet}
              options={currentEchoInfo!.sets.map((s) => ({ value: s, label: ja ? s : (HARMONY_SETS_EN[s] ?? s) }))}
            />
          )}

          {/* 進捗インジケーター（ゲーム内の +5 強化と同じ流れで1個ずつ追加） */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#707070]">
              {ja ? `判明済み: ${draftSubs.length} / ${MAX_SUBSTATS} 個` : `Revealed: ${draftSubs.length} / ${MAX_SUBSTATS}`}
            </span>
            {draftSubs.length > 0 && (
              <button onClick={resetDraft} className="text-[10px] text-[#9ca3af] hover:text-[#ef4444] px-1.5 py-0.5 rounded transition-colors">
                {ja ? 'やり直す' : 'Start over'}
              </button>
            )}
          </div>

          {/* 判明済みサブステ一覧 */}
          {draftSubs.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {draftSubs.map((s, i) => (
                <div key={i} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg" style={{ background: '#f7f7f7' }}>
                  <span className="text-xs text-[#9ca3af] w-4 shrink-0">{i + 1}</span>
                  <span className="text-sm font-medium text-[#222222] flex-1 min-w-0 truncate">
                    {ja ? s.label : (SUBSTAT_LABEL_EN[s.key] ?? s.label)}
                  </span>
                  <span className="text-sm font-semibold text-[#222222] tabular-nums shrink-0">{s.value}{s.unit}</span>
                  <button onClick={() => removeSubstat(i)} className="text-[#9ca3af] hover:text-[#ef4444] shrink-0 text-xs px-1">✕</button>
                </div>
              ))}
            </div>
          )}

          {/* 次の1個を追加するミニフォーム（+5強化のたびに1個ずつ判明する流れを再現） */}
          {draftSubs.length < MAX_SUBSTATS && (
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <div className="min-w-0 sm:flex-1">
                <CustomSelect
                  value={pendingKey}
                  onChange={(v) => { setPendingKey(v); setPendingTier(0); }}
                  options={[
                    { value: '', label: ja ? `（${draftSubs.length + 1}個目のステータス）` : `(Substat #${draftSubs.length + 1})` },
                    ...availableSubstatOptions.map((s) => ({ value: s.key, label: ja ? s.label : (SUBSTAT_LABEL_EN[s.key] ?? s.label), badge: s.badge })),
                  ]}
                />
              </div>
              <div className="flex gap-2 items-center">
                <div className="flex-1 min-w-0 sm:w-36 sm:flex-none">
                  <CustomSelect
                    value={pendingKey ? String(pendingTier) : ''}
                    onChange={(v) => setPendingTier(Number(v))}
                    options={pendingTierOptions.length ? pendingTierOptions : [{ value: '', label: '—' }]}
                  />
                </div>
                <button
                  onClick={addSubstat}
                  disabled={!pendingKey}
                  className="shrink-0 px-3 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed text-[#f7f7f7]"
                  style={{ background: pendingKey ? ACCENT : '#9ca3af' }}
                >
                  {ja ? '＋追加' : '+ Add'}
                </button>
              </div>
            </div>
          )}

          {/* 途中経過のライブ予測（EchoAdvisorを流用） */}
          {draftAdvisor && (
            <div className="flex flex-col gap-1.5">
              <div className="text-[10px] text-[#9ca3af] text-center">
                {ja ? '現時点の情報から見た最終スコア予測' : 'Predicted final outcome based on revealed substats so far'}
              </div>
              <EchoAdvisor result={draftAdvisor} />
            </div>
          )}

          {/* 5個そろったら確定 */}
          {draftFinalScore && (
            <div ref={resultRef} className="flex flex-col gap-3 scroll-mt-20">
              <div className="flex items-center justify-center gap-3 rounded-xl py-3" style={{ background: `${RANK_COLORS[draftFinalScore.rank]}18` }}>
                <span
                  className="text-lg font-bold px-3 py-1 rounded-lg"
                  style={{ background: RANK_COLORS[draftFinalScore.rank], color: '#fff' }}
                >
                  {draftFinalScore.rank}
                </span>
                <span className="text-xl font-bold" style={{ color: RANK_COLORS[draftFinalScore.rank] }}>
                  {draftFinalScore.score} <span className="text-xs font-normal text-[#9ca3af]">/ 100</span>
                </span>
              </div>

              {/* スコア分布図（v2運用バリアント方式が使えるキャラのみ表示） */}
              {draftFinalScore.distributionCurve && (
                <ScoreDistributionChart result={draftFinalScore} />
              )}

              <button
                onClick={handleFinalize}
                disabled={!canFinalize}
                className="w-full py-2.5 rounded-[500px] font-medium text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed text-[#f7f7f7]"
                style={{ background: canFinalize ? '#222222' : '#9ca3af' }}
              >
                {ja ? '📥 この結果を記録する' : '📥 Log this result'}
              </button>
            </div>
          )}
        </section>

        {/* ── 統計 & 予測 ── */}
        <section className="flex flex-col gap-3 rounded-xl border border-[#e5e7eb] p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium uppercase tracking-wider text-[#9ca3af]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
              {ja ? '③ 進捗と予測' : '③ Progress & prediction'}
            </div>
            {filteredEntries.length > 0 && (
              <button onClick={handleClearFiltered} className="text-[10px] text-[#9ca3af] hover:text-[#ef4444] border border-[#e5e7eb] hover:border-[#ef444466] px-1.5 py-0.5 rounded transition-colors">
                {ja ? '記録を全削除' : 'Clear all'}
              </button>
            )}
          </div>

          {!loaded ? null : filteredEntries.length === 0 ? (
            <p className="text-xs text-[#9ca3af] text-center py-4">
              {ja ? 'このビルドの記録はまだありません。上のフォームから記録してください。' : 'No records yet for this build. Log one above to get started.'}
            </p>
          ) : (
            <>
              {/* ランク分布 */}
              <div className="flex flex-wrap gap-1.5">
                {RANK_ORDER.filter((r) => rankCounts[r] > 0).map((r) => (
                  <span
                    key={r}
                    className="text-[11px] font-semibold px-2 py-1 rounded-full"
                    style={{ background: `${RANK_COLORS[r as keyof typeof RANK_COLORS]}22`, color: RANK_COLORS[r as keyof typeof RANK_COLORS] }}
                  >
                    {r} × {rankCounts[r]}
                  </span>
                ))}
                <span className="text-[11px] text-[#9ca3af] px-2 py-1">
                  {ja ? `計 ${filteredEntries.length} 個` : `Total: ${filteredEntries.length}`}
                </span>
              </div>

              {/* しきい値選択 */}
              <div className="flex gap-2 justify-center">
                {(['A', 'S', 'S+'] as Threshold[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setThreshold(t)}
                    className="px-4 py-1.5 rounded-[500px] text-xs font-medium transition-all"
                    style={threshold === t
                      ? { background: ACCENT, color: '#fff' }
                      : { background: '#f7f7f7', border: '1px solid #e5e7eb', color: '#707070' }}
                  >
                    {t}{ja ? '以上を狙う' : '+ target'}
                  </button>
                ))}
              </div>

              {prediction && (
                <div className="flex flex-col gap-3 rounded-lg p-3" style={{ background: '#f7f7f7' }}>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <div className="text-[10px] text-[#9ca3af]">{ja ? '実測ヒット率' : 'Observed rate'}</div>
                      <div className="text-sm font-semibold text-[#222222]">
                        {prediction.observedRate !== null ? fmtPct(prediction.observedRate) : '—'}
                        <span className="text-[10px] text-[#9ca3af] font-normal"> ({prediction.observedHits}/{prediction.observedN})</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#9ca3af]">{ja ? '理論確率' : 'Theoretical rate'}</div>
                      <div className="text-sm font-semibold text-[#222222]">{fmtPct(prediction.theoreticalRate)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: `${LUCK_LABEL[prediction.luck].color}18` }}>
                    <span className="text-xs font-semibold" style={{ color: LUCK_LABEL[prediction.luck].color }}>
                      {LUCK_LABEL[prediction.luck].icon} {ja ? LUCK_LABEL[prediction.luck].ja : LUCK_LABEL[prediction.luck].en}
                    </span>
                    <span className="text-[10px] text-[#9ca3af]">
                      {prediction.luck === 'insufficient' ? (ja ? '5個以上で判定' : 'Needs 5+ records') : (ja ? '理論値との比較' : 'vs. theoretical rate')}
                    </span>
                  </div>

                  <div className="text-center">
                    <div className="text-[10px] text-[#9ca3af] mb-0.5">
                      {ja ? '今後の予測（実測込みの補正確率）' : 'Prediction (rate adjusted with your data)'}
                    </div>
                    <div className="text-lg font-bold" style={{ color: ACCENT }}>
                      {fmtPct(prediction.posteriorRate)}
                    </div>
                    <div className="text-xs text-[#707070]">
                      {ja
                        ? `平均 ${prediction.expectedRuns.toFixed(1)} 個に1個のペースで ${threshold}以上 が出る見込み`
                        : `≈ 1 in every ${prediction.expectedRuns.toFixed(1)} echoes reach ${threshold}+`}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    {RUN_MILESTONES.map((n) => (
                      <div key={n} className="rounded-lg bg-white py-1.5 border border-[#e5e7eb]">
                        <div className="text-[9px] text-[#9ca3af]">{n}{ja ? '個以内' : ' runs'}</div>
                        <div className="text-xs font-semibold text-[#222222]">
                          {fmtPct(probAtLeastOneWithin(prediction.posteriorRate, n))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 履歴一覧 */}
              <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                {filteredEntries.map((e) => (
                  <div key={e.id} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg" style={{ background: '#fafafa' }}>
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                      style={{ background: `${RANK_COLORS[e.rank]}22`, color: RANK_COLORS[e.rank] }}
                    >
                      {e.rank}
                    </span>
                    <span className="text-xs text-[#222222] font-medium tabular-nums shrink-0">{e.score}pt</span>
                    <span className="text-[10px] text-[#9ca3af] truncate flex-1">
                      {e.substats.map((s) => ja ? s.label : (SUBSTAT_LABEL_EN[s.key] ?? s.label)).join(' / ')}
                    </span>
                    <span className="text-[10px] text-[#9ca3af] shrink-0">
                      {new Date(e.createdAt).toLocaleDateString(ja ? 'ja-JP' : 'en-US', { month: 'numeric', day: 'numeric' })}
                    </span>
                    <button onClick={() => handleDelete(e.id)} className="text-[#9ca3af] hover:text-[#ef4444] shrink-0 text-xs px-1">✕</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <p className="text-[10px] text-[#9ca3af] text-center leading-relaxed" style={{ lineHeight: 1.6 }}>
          {ja
            ? '※ 予測はベイズ推定（理論確率を事前分布とし、実測データで更新）に基づく統計的な目安であり、実際の結果を保証するものではありません。記録データはブラウザ内（localStorage）にのみ保存されます。'
            : '* Predictions use Bayesian updating (theoretical rate as prior, updated with your logged data) and are a statistical estimate, not a guarantee. Your records are stored locally in your browser only.'}
        </p>
      </main>

      <footer className="border-t border-[#f3f4f6] py-4">
        <p className="text-center text-xs text-[#9ca3af]">
          {ja ? '© 音骸シミュレーター（非公式ファンツール）' : '© Echo Simulator (unofficial fan tool)'}
        </p>
      </footer>
    </div>
  );
}
