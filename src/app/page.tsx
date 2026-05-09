'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import type { EchoCost, EchoState, ScoreResult, Theme } from '@/types/echo';
import { createEcho, upgradeEcho } from '@/lib/simulator';
import { scoreEcho } from '@/lib/scorer';
import { SUBSTAT_COUNT } from '@/data/mainstats';
import { ECHOES_BY_COST, ECHOES, DEFAULT_ECHO_ID, HARMONY_SETS } from '@/data/echoes';
import { CHARACTER_LIST, CHARACTER_MAP } from '@/data/characters';
import EchoCard from '@/components/EchoCard';
import ResourceCounter from '@/components/ResourceCounter';
import ResultCard from '@/components/ResultCard';
import BulkSimModal from '@/components/BulkSimModal';
import ThemeSelector, { THEME_ACCENT } from '@/components/ThemeSelector';
import ScoreDebugPanel from '@/components/ScoreDebugPanel';

const COST_OPTIONS: EchoCost[] = [4, 3, 1];

export default function Home() {
  const [cost, setCost] = useState<EchoCost>(4);
  const [selectedEchoId, setSelectedEchoId] = useState<string>(DEFAULT_ECHO_ID[4]);
  const [selectedHarmonySet, setSelectedHarmonySet] = useState<string>('');
  const [echo, setEcho] = useState<EchoState | null>(null);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [theme, setTheme] = useState<Theme>('default');
  const [selectedCharId, setSelectedCharId] = useState<string>('generic');
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkUnlocked, setBulkUnlocked] = useState(false);
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const accent = THEME_ACCENT[theme];
  const isMaxLevel = echo?.level === 25;

  // コストごとに存在するハーモニーセット一覧（HARMONY_SETS の定義順を維持）
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
    setEcho(null);
    setScore(null);
  }, []);

  const handleStart = useCallback(() => {
    let echoId = selectedEchoId;
    if (cost !== 4) {
      const pool = ECHOES.filter(e => e.cost === cost && e.sets.includes(selectedHarmonySet));
      if (pool.length === 0) return;
      echoId = pool[Math.floor(Math.random() * pool.length)].id;
    }
    setEcho(createEcho(cost, echoId));
    setScore(null);
  }, [cost, selectedEchoId, selectedHarmonySet]);

  const handleUpgrade = useCallback(() => {
    if (!echo || echo.level >= 25) return;
    const next = upgradeEcho(echo);
    setEcho(next);
    // レベルに関わらず常にスコアを計算してカテゴリ情報をサブステ色付けに使う
    const build = selectedCharId !== 'generic' ? CHARACTER_MAP[selectedCharId] : undefined;
    setScore(scoreEcho(next, build));
  }, [echo, selectedCharId]);

  const handleReset = useCallback(() => {
    setEcho(null);
    setScore(null);
  }, []);

  const echoList = ECHOES_BY_COST[cost];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0a0c14 0%, #0d0f1e 50%, #080b12 100%)' }}
    >
      {/* Header */}
      <header className="border-b border-slate-800/60 sticky top-0 z-30" style={{ background: 'rgba(10,12,20,0.85)' }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: `${accent}33`, border: `1px solid ${accent}66`, color: accent }}
            >
              ◈
            </div>
            <span className="font-bold text-white text-sm tracking-wide">音骸シミュレーター</span>
            <span className="text-[10px] text-slate-600 hidden sm:inline">鳴潮 / Wuthering Waves</span>
          </div>
          <button
            onClick={() => setBulkOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border"
            style={{ borderColor: `${accent}44`, color: accent, background: `${accent}11` }}
          >
            ⚡ 100連厳選
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Theme */}
        <div className="flex flex-col gap-2">
          <div className="text-xs text-slate-600 text-center tracking-wider uppercase">テーマ</div>
          <ThemeSelector current={theme} unlocked={premiumUnlocked} onSelect={setTheme} onUnlock={() => setPremiumUnlocked(true)} />
        </div>

        {/* Character selector */}
        <div className="flex flex-col gap-2">
          <div className="text-xs text-slate-600 text-center tracking-wider uppercase">評価キャラクター</div>
          <div className="relative">
            <select
              value={selectedCharId}
              onChange={(e) => { setSelectedCharId(e.target.value); setScore(null); }}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-200 appearance-none cursor-pointer transition-colors"
              style={{ background: 'rgba(15,17,23,0.8)', border: `1px solid ${accent}44`, outline: 'none' }}
            >
              <option value="generic" style={{ background: '#0f1117' }}>汎用スコア（キャラ指定なし）</option>
              {CHARACTER_LIST.map((c) => (
                <option key={c.id} value={c.id} style={{ background: '#0f1117' }}>
                  {c.name}（{c.element}）
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">▼</div>
          </div>
        </div>

        {/* Cost selector */}
        <div className="flex flex-col gap-2">
          <div className="text-xs text-slate-600 text-center tracking-wider uppercase">音骸コスト</div>
          <div className="flex gap-2 justify-center">
            {COST_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => handleCostChange(c)}
                className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
                style={
                  cost === c
                    ? { background: accent, color: '#fff', boxShadow: `0 0 16px ${accent}66` }
                    : { background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.12)', color: '#94a3b8' }
                }
              >
                COST {c}
              </button>
            ))}
          </div>
          <div className="text-center text-xs text-slate-600">サブステ最大 {SUBSTAT_COUNT[cost]} 個</div>
        </div>

        {/* Echo / Harmony selector */}
        {cost === 4 ? (
          <div className="flex flex-col gap-2">
            <div className="text-xs text-slate-600 text-center tracking-wider uppercase">音骸を選択</div>
            <div className="relative">
              <select
                value={selectedEchoId}
                onChange={(e) => { setSelectedEchoId(e.target.value); setEcho(null); setScore(null); }}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-200 appearance-none cursor-pointer transition-colors"
                style={{ background: 'rgba(15,17,23,0.8)', border: `1px solid ${accent}44`, outline: 'none' }}
              >
                {echoList.map((e) => (
                  <option key={e.id} value={e.id} style={{ background: '#0f1117' }}>
                    {e.name}（{e.nameEn}）
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">▼</div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="text-xs text-slate-600 text-center tracking-wider uppercase">ハーモニーセットを選択</div>
            <div className="relative">
              <select
                value={selectedHarmonySet}
                onChange={(e) => { setSelectedHarmonySet(e.target.value); setEcho(null); setScore(null); }}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-200 appearance-none cursor-pointer transition-colors"
                style={{ background: 'rgba(15,17,23,0.8)', border: `1px solid ${accent}44`, outline: 'none' }}
              >
                {harmonySetOptions.map((s) => (
                  <option key={s} value={s} style={{ background: '#0f1117' }}>{s}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">▼</div>
            </div>
            <div className="text-center text-xs text-slate-600">
              該当音骸 {ECHOES.filter(e => e.cost === cost && e.sets.includes(selectedHarmonySet)).length} 体からランダム抽選
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 justify-center">
          {!echo ? (
            <button
              onClick={handleStart}
              className="px-8 py-3 rounded-xl font-bold text-base text-white transition-all"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, boxShadow: `0 4px 20px ${accent}55` }}
            >
              ✦ 音骸を入手
            </button>
          ) : (
            <>
              <button
                onClick={handleUpgrade}
                disabled={isMaxLevel}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={
                  !isMaxLevel
                    ? { background: `linear-gradient(135deg, ${accent}, ${accent}aa)`, boxShadow: `0 4px 16px ${accent}44` }
                    : { background: 'rgba(148,163,184,0.1)' }
                }
              >
                {isMaxLevel ? '✓ MAX強化済み' : `+5 強化 → +${echo.level + 5}`}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl text-sm text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-slate-200 transition-colors"
              >
                リセット
              </button>
            </>
          )}
        </div>

        {/* Echo card */}
        {echo && (
          <div className="flex flex-col items-center gap-4">
            <EchoCard echo={echo} score={score} cardRef={cardRef} />
            {echo.totalCost.shellCoins > 0 && (
              <div className="w-full">
                <div className="text-xs text-slate-600 text-center tracking-wider uppercase mb-2">累計消費リソース</div>
                <ResourceCounter totalCost={echo.totalCost} />
              </div>
            )}
            {score && isMaxLevel && (
              <>
                <ScoreDebugPanel echo={echo} score={score} />
                <div className="w-full flex flex-col items-center gap-2">
                  <div className="text-xs text-slate-600 text-center tracking-wider uppercase">結果をシェア</div>
                  <ResultCard echo={echo} score={score} />
                </div>
              </>
            )}
            {!isMaxLevel && echo.level > 0 && (
              <p className="text-xs text-slate-600 text-center">あと {(25 - echo.level) / 5} 回強化でMAX (+25)</p>
            )}
          </div>
        )}

        {/* Empty state */}
        {!echo && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl border"
              style={{ background: `${accent}11`, borderColor: `${accent}33` }}
            >
              ◈
            </div>
            <p className="text-slate-500 text-sm max-w-xs">
              音骸とコストを選んで「音骸を入手」から強化シミュレーションを開始できます
            </p>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800/40 py-3">
        <p className="text-center text-xs text-slate-700">
          非公式ファンツール / Unofficial fan tool · 鳴潮 Wuthering Waves
        </p>
      </footer>

      {bulkOpen && (
        <BulkSimModal
          cost={cost}
          unlocked={bulkUnlocked}
          onUnlock={() => setBulkUnlocked(true)}
          onClose={() => setBulkOpen(false)}
        />
      )}
    </div>
  );
}
