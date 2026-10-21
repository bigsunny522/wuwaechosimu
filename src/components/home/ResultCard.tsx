'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import type { EchoCost, MainstatInfo, ScoreRank, ScoreResult, Substat } from '@/types/echo';
import type { CharacterBuild } from '@/types/character';
import type { AdvisorResult } from '@/lib/monteCarlo';
import { MAINSTAT_LABEL_EN, SUBSTAT_LABEL_EN } from '@/data/translations';
import { getSubstatCategory, RANK_COLORS } from '@/lib/scorer';
import { formatPct } from '@/lib/distribution';

export type JourneyStep = {
  expected: number;
  recommendation: AdvisorResult['recommendation'];
};

export type Journey = {
  steps: JourneyStep[];
  baseline: number;
};

interface ResultCardProps {
  ja: boolean;
  echoName: string;
  echoNameEn?: string;
  cost: EchoCost;
  mainstat: MainstatInfo;
  charName?: string;
  finalScore: ScoreResult;
  subs: Substat[];
  build?: CharacterBuild;
  journey: Journey;
}

const BIN_WIDTH = 2;
const HIST_VB_W = 326;
const HIST_VB_H = 104;
const HIST_BASE_Y = 92;
const HIST_PLOT_H = 84;
const PATH_VB_W = 326;
const PATH_VB_H = 112;

const RARITY_DOTS: Record<ScoreRank, number> = {
  GOD: 6,
  'S+': 5,
  S: 4,
  A: 3,
  B: 2,
  C: 1,
  D: 0,
};

const STORY_RANKS: ScoreRank[] = ['GOD', 'S+', 'S', 'A', 'B'];

const VERDICT: Record<
  AdvisorResult['recommendation'],
  { ja: string; en: string; color: string }
> = {
  great: { ja: '強く継続', en: 'Strong', color: '#7FD6A4' },
  good: { ja: '継続', en: 'Continue', color: 'var(--hd-accent)' },
  borderline: { ja: '様子見', en: 'Wait', color: '#F0B35A' },
  scrap: { ja: '破棄推奨', en: 'Scrap', color: '#FF8A8A' },
};

const FOIL_BG =
  'linear-gradient(115deg, transparent 22%, rgba(255,120,180,.28) 36%, rgba(255,230,120,.32) 44%, rgba(120,255,200,.30) 52%, rgba(120,170,255,.32) 60%, rgba(200,130,255,.26) 68%, transparent 80%)';

const CARD_CSS = `
.rc-deal{animation:rc-deal .9s cubic-bezier(.2,.8,.2,1) both;container-type:size;container-name:rc;min-height:240px;max-height:440px}
@keyframes rc-deal{0%{opacity:0;transform:translateY(60px) rotateX(55deg) scale(.9)}60%{opacity:1}100%{opacity:1;transform:none}}
.rc-nudge svg{animation:rc-nudge 1.6s ease-in-out infinite}
@keyframes rc-nudge{0%,100%{transform:translateX(0)}30%{transform:translateX(-4px)}60%{transform:translateX(4px)}}
@media (prefers-reduced-motion: reduce){.rc-deal{animation:none}.rc-card{transition:none !important}.rc-nudge svg{animation:none}}
.rc-head{padding:14px 16px 0}
.rc-scoresec{padding:14px 16px 12px}
.rc-rank{font-size:76px}
.rc-score{font-size:34px}
.rc-rows{padding:0 16px;justify-content:center}
.rc-row{min-height:28px;max-height:44px}
.rc-band{padding:10px 16px 12px}
.rc-dist{padding:14px 16px 0}
.rc-journey{padding:16px 16px 0}
.rc-hist{height:104px}
.rc-path{flex:1 1 0;min-height:36px;max-height:120px}
@container rc (max-height:399px){
.rc-head{padding:12px 16px 0}
.rc-scoresec{padding:10px 16px 8px}
.rc-rank{font-size:56px}
.rc-score{font-size:28px}
.rc-row{min-height:26px;max-height:34px}
.rc-band{padding:6px 16px 8px}
.rc-dist{padding:12px 16px 0}
.rc-journey{padding:12px 16px 0}
.rc-hist{height:64px}
.rc-note{display:none !important}
}
@container rc (max-height:319px){
.rc-head{padding:10px 16px 0;line-height:1.25}
.rc-scoresec{padding:6px 16px 6px}
.rc-rank{font-size:40px}
.rc-score{font-size:24px}
.rc-rows{padding:0 16px 8px}
.rc-row{min-height:22px;max-height:34px}
.rc-pill{line-height:1.25}
.rc-band{display:none !important}
.rc-dist{padding:10px 16px 0}
.rc-journey{padding:10px 16px 0}
.rc-hist{height:44px}
.rc-story,.rc-verdict,.rc-histcap{display:none !important}
}
`;

function pathX(i: number): number {
  return 20 + i * 71.5;
}

function pathY(v: number): number {
  return 8 + ((100 - Math.max(25, Math.min(100, v))) / 75) * 96;
}

function mainValueText(mainstat: MainstatInfo): string {
  return mainstat.unit === '%'
    ? `${mainstat.value.toFixed(1)}${mainstat.unit}`
    : `${mainstat.value}${mainstat.unit}`;
}

export default function ResultCard({
  ja,
  echoName,
  echoNameEn,
  cost,
  mainstat,
  charName,
  finalScore,
  subs,
  build,
  journey,
}: ResultCardProps) {
  const [base, setBase] = useState(0);
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [peek, setPeek] = useState(0);
  const [touched, setTouched] = useState(false);

  const pointerRef = useRef({
    startX: 0,
    startY: 0,
    lastX: 0,
    lastT: 0,
    vx: 0,
    dragging: false,
  });
  const touchedRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (mq?.matches) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const peekAt = (at: number) => {
      timers.push(
        setTimeout(() => {
          if (!touchedRef.current) setPeek(-38);
        }, at),
      );
      timers.push(setTimeout(() => setPeek(0), at + 450));
    };
    peekAt(1100);
    peekAt(7000);
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  const isBack = ((base % 360) + 360) % 360 === 180;

  const showFace = (back: boolean) => {
    touchedRef.current = true;
    setTouched(true);
    setPeek(0);
    setBase((cur) => (((cur % 360) + 360) % 360 === 180) === back ? cur : cur + 180);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Pointer capture is best-effort only.
    }
    const p = pointerRef.current;
    p.startX = e.clientX;
    p.startY = e.clientY;
    p.lastX = e.clientX;
    p.lastT = Date.now();
    p.vx = 0;
    p.dragging = true;
    touchedRef.current = true;
    setTouched(true);
    setPeek(0);
    setDragging(true);
    setDx(0);
    setDy(0);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pointerRef.current;
    if (!p.dragging) return;
    const now = Date.now();
    const dt = Math.max(1, now - p.lastT);
    p.vx = (e.clientX - p.lastX) / dt;
    p.lastX = e.clientX;
    p.lastT = now;
    setDx(e.clientX - p.startX);
    setDy(e.clientY - p.startY);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pointerRef.current;
    if (!p.dragging) return;
    p.dragging = false;
    const ddx = e.clientX - p.startX;
    const ddy = e.clientY - p.startY;
    const turned = ddx * 0.55;
    setDragging(false);
    setDx(0);
    setDy(0);
    if (Math.hypot(ddx, ddy) < 6) return;
    const fling = Math.abs(p.vx) > 0.45 && Math.abs(turned) > 12;
    if (Math.abs(turned) > 70 || fling) {
      setBase((cur) => cur + (turned > 0 ? 180 : -180));
    }
  };

  const rankColor = RANK_COLORS[finalScore.rank];
  const rankSoft = `${rankColor}22`;
  const rankGlow = `${rankColor}66`;
  const rankLine = `${rankColor}55`;
  const score = finalScore.score;
  const topPct = finalScore.topPercentile;
  const histogram = finalScore.distributionHistogram;

  const angle = base + dx * 0.55 + peek;
  const rx = Math.max(-12, Math.min(12, -dy * 0.08));
  const cardTransform = `rotateX(${rx.toFixed(2)}deg) rotateY(${angle.toFixed(2)}deg)`;
  const cardTransition = dragging ? 'none' : 'transform .65s cubic-bezier(.25,1.35,.45,1)';

  let tilt = ((angle % 180) + 180) % 180;
  if (tilt > 90) tilt -= 180;
  const sheenPos = `${(50 + tilt * 0.9).toFixed(1)}% ${(50 + rx * 3).toFixed(1)}%`;
  const foil = finalScore.rank === 'S+' || finalScore.rank === 'S' || finalScore.rank === 'GOD';
  const sheenBg = foil
    ? FOIL_BG
    : `linear-gradient(115deg, transparent 32%, rgba(255,255,255,.10) 44%, ${rankColor}40 50%, rgba(255,255,255,.08) 56%, transparent 68%)`;

  const sheen = (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        mixBlendMode: 'screen',
        background: sheenBg,
        backgroundSize: '260% 260%',
        backgroundPosition: sheenPos,
      }}
    />
  );

  const faceStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    borderRadius: 18,
    overflow: 'hidden',
    background: '#1A1F28',
    boxShadow: `0 0 0 1px ${rankLine}, 0 24px 48px rgba(0,0,0,.45)`,
    display: 'flex',
    flexDirection: 'column',
  };

  const pctLabel = topPct !== undefined ? formatPct(topPct) : '';

  const topPillStyle: React.CSSProperties = {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: 700,
    padding: '3px 9px',
    borderRadius: 12,
    background: rankSoft,
    color: rankColor,
  };

  const front = (
    <div style={faceStyle}>
      <div style={{ height: 3, background: rankColor, flex: 'none' }} />

      <div className="rc-head" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span
            style={{
              flex: '1 1 0',
              minWidth: 0,
              fontSize: 15,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {ja ? echoName : echoNameEn ?? echoName}
          </span>
          {charName && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                color: 'var(--hd-accent)',
              }}
            >
              {charName}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--hd-sub)' }}>
          {ja
            ? `COST ${cost} ・ メイン ${mainstat.label} `
            : `COST ${cost} · Main ${MAINSTAT_LABEL_EN[mainstat.key] ?? mainstat.label} `}
          <span className="hd-num" style={{ color: 'var(--hd-fg)' }}>
            {mainValueText(mainstat)}
          </span>
        </div>
      </div>

      <div
        className="rc-scoresec"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <span
          className="hd-num rc-rank"
          style={{
            lineHeight: 0.9,
            fontWeight: 700,
            color: rankColor,
            textShadow: `0 0 28px ${rankGlow}`,
          }}
        >
          {finalScore.rank}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div
            className="hd-num rc-score"
            style={{ lineHeight: 1, fontWeight: 700 }}
          >
            {score}
            <small
              style={{ fontSize: 15, color: 'var(--hd-sub)', fontWeight: 500 }}
            >{` / 100`}</small>
          </div>
          {topPct !== undefined && (
            <span className="rc-pill" style={topPillStyle}>
              {charName
                ? ja
                  ? `${charName} の中で上位 ${pctLabel}%`
                  : `Top ${pctLabel}% for ${charName}`
                : ja
                  ? `上位 ${pctLabel}%`
                  : `Top ${pctLabel}%`}
            </span>
          )}
        </div>
      </div>

      <div
        className="rc-rows"
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 0',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {subs.map((sub, i) => {
          const cat = getSubstatCategory(sub.key, build);
          const hot = cat === 'recommended' || cat === 'preferred';
          const ink = hot ? 'var(--hd-fg)' : '#7D8794';
          const pipOn = hot ? 'var(--hd-accent)' : '#5A6372';
          return (
            <div
              key={i}
              className="rc-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '30px minmax(0, 1fr) auto 64px',
                alignItems: 'center',
                columnGap: 8,
                flex: '1 1 0',
                borderTop: i > 0 ? '1px solid #262C37' : undefined,
              }}
            >
              <span className="hd-num" style={{ fontSize: 11, color: 'var(--hd-sub)' }}>
                {`+${(i + 1) * 5}`}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: ink,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {ja ? sub.label : (SUBSTAT_LABEL_EN[sub.key] ?? sub.label)}
              </span>
              <span className="hd-num" style={{ fontSize: 15, fontWeight: 700, color: ink }}>
                {`${sub.value}${sub.unit}`}
              </span>
              <span
                role="img"
                aria-label={
                  ja
                    ? `8段階中 ${sub.tier + 1} 段目`
                    : `Tier ${sub.tier + 1} of 8`
                }
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
                  gap: 2,
                }}
              >
                {Array.from({ length: 8 }, (_, k) => (
                  <span
                    key={k}
                    style={{
                      height: 8,
                      borderRadius: 2,
                      background: k <= sub.tier ? pipOn : '#2C333F',
                    }}
                  />
                ))}
              </span>
            </div>
          );
        })}
      </div>

      <div
        className="rc-band"
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: 11,
          color: 'var(--hd-sub)',
          borderTop: '1px solid #262C37',
        }}
      >
        <span
          style={{
            flex: '1 1 0',
            letterSpacing: 2,
            color: rankColor,
            fontSize: 12,
          }}
        >
          {'◆'.repeat(RARITY_DOTS[finalScore.rank])}
        </span>
        <span>{ja ? '‹ スワイプで裏面 ›' : '‹ Swipe to flip ›'}</span>
      </div>

      {sheen}
    </div>
  );

  const histMax = histogram ? Math.max(...histogram, 0.0001) : 0.0001;
  const histBars: ReactElement[] = histogram
    ? histogram.map((h, i) => {
        const w = HIST_VB_W / histogram.length;
        const barH = (h / histMax) * HIST_PLOT_H;
        const centerScore = i * BIN_WIDTH + BIN_WIDTH / 2;
        return (
          <rect
            key={i}
            x={i * w + 0.5}
            y={HIST_BASE_Y - barH}
            width={Math.max(0.5, w - 1)}
            height={barH}
            fill={centerScore <= score ? rankColor : '#3A4250'}
            fillOpacity={centerScore <= score ? 0.85 : 1}
          />
        );
      })
    : [];

  const markX = (score / 100) * HIST_VB_W;

  const pathPoints = [
    ...journey.steps.map((s) => s.expected),
    score,
  ];
  const polylinePts = pathPoints
    .map((v, i) => `${pathX(i).toFixed(1)},${pathY(v).toFixed(1)}`)
    .join(' ');

  const baseY = pathY(journey.baseline);

  const story = (() => {
    const hadScrap = journey.steps.some((s) => s.recommendation === 'scrap');
    if (hadScrap && STORY_RANKS.includes(finalScore.rank)) {
      return ja ? '破棄推奨から逆転' : 'Came back from Scrap';
    }
    if (score >= 70) {
      return ja ? '最初から好調のまま完走' : 'Strong from start to finish';
    }
    return '';
  })();

  const back = (
    <div style={{ ...faceStyle, transform: 'rotateY(180deg)' }}>
      <div style={{ height: 3, background: rankColor, flex: 'none' }} />

      <div className="rc-dist" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ flex: '1 1 0', fontSize: 13, fontWeight: 700 }}>
            {ja ? 'スコア分布' : 'Score distribution'}
          </span>
          {histogram && charName && (
            <span style={{ fontSize: 11, color: 'var(--hd-sub)' }}>
              {ja
                ? `${charName}・この運用で強化したとき`
                : `If built for ${charName}`}
            </span>
          )}
        </div>

        {histogram ? (
          <>
            <svg
              width="100%"
              viewBox={`0 0 ${HIST_VB_W} ${HIST_VB_H}`}
              preserveAspectRatio="none"
              className="rc-hist block"
              role="img"
              aria-label={
                ja
                  ? `スコア分布。あなたのスコアは上位 ${pctLabel}%`
                  : `Score distribution. Your score is top ${pctLabel}%`
              }
            >
              {histBars}
              <line
                x1={markX}
                x2={markX}
                y1={4}
                y2={HIST_BASE_Y}
                stroke="#ECEFF3"
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
              <line
                x1={0}
                x2={HIST_VB_W}
                y1={92.5}
                y2={92.5}
                stroke="#333B47"
              />
            </svg>
            <div className="rc-histcap" style={{ display: 'flex', fontSize: 11, color: 'var(--hd-sub)' }}>
              <span className="hd-num" style={{ flex: '1 1 0' }}>
                0
              </span>
              <span>
                {ja ? 'この音骸は ' : 'This echo is '}
                <b style={{ color: rankColor }}>
                  {ja ? `上位 ${pctLabel}%` : `top ${pctLabel}%`}
                </b>
                {ja ? '(色の部分に勝ち)' : ' (beats the colored part)'}
              </span>
              <span className="hd-num" style={{ flex: '1 1 0', textAlign: 'right' }}>
                100
              </span>
            </div>
          </>
        ) : (
          <div
            className="rc-hist flex items-center justify-center"
            style={{
              padding: '0 8px',
              textAlign: 'center',
              fontSize: 12,
              color: 'var(--hd-sub)',
            }}
          >
            {ja
              ? 'キャラを選ぶと、ほかの音骸と比べた位置が出ます'
              : 'Pick a character to see how this echo compares'}
          </div>
        )}
      </div>

      <div
        className="rc-journey"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          flex: '1 1 0',
          minHeight: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ flex: '1 1 0', fontSize: 13, fontWeight: 700 }}>
            {ja ? '強化の道のり' : 'Enhancement journey'}
          </span>
          <span style={{ fontSize: 11, color: 'var(--hd-sub)' }}>
            {ja ? '各段階の予想スコア' : 'Expected score at each step'}
          </span>
        </div>

        {story && <span className="rc-story" style={topPillStyle}>{story}</span>}

        <svg
          width="100%"
          viewBox={`0 0 ${PATH_VB_W} ${PATH_VB_H}`}
          preserveAspectRatio="none"
          className="rc-path block"
          role="img"
          aria-label={
            ja
              ? '強化の道のり。予想スコアの推移'
              : 'Enhancement journey. Expected score at each step'
          }
        >
          <line
            x1={0}
            x2={PATH_VB_W}
            y1={baseY}
            y2={baseY}
            stroke="#333B47"
            strokeDasharray="2 4"
          />
          <polyline
            points={polylinePts}
            fill="none"
            stroke={rankColor}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {pathPoints.slice(0, 4).map((v, i) => (
            <circle
              key={i}
              cx={pathX(i)}
              cy={pathY(v)}
              r={3.5}
              fill="#1A1F28"
              stroke={rankColor}
              strokeWidth={2}
            />
          ))}
          <circle cx={pathX(4)} cy={pathY(score)} r={5} fill={rankColor} />
        </svg>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
            textAlign: 'center',
          }}
        >
          {pathPoints.map((v, i) => {
            const isFinal = i === 4;
            const rec = isFinal ? null : journey.steps[i].recommendation;
            const verdict = rec ? VERDICT[rec] : null;
            return (
              <div
                key={i}
                style={{ display: 'flex', flexDirection: 'column', gap: 1 }}
              >
                <span className="hd-num" style={{ fontSize: 11, color: 'var(--hd-sub)' }}>
                  {`+${(i + 1) * 5}`}
                </span>
                <span className="hd-num" style={{ fontSize: 15, fontWeight: 700 }}>
                  {v}
                </span>
                <span
                  className="rc-verdict"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: isFinal
                      ? rankColor
                      : verdict
                        ? verdict.color
                        : 'var(--hd-sub)',
                  }}
                >
                  {isFinal
                    ? ja
                      ? `${finalScore.rank} 確定`
                      : `${finalScore.rank} final`
                    : verdict
                      ? ja
                        ? verdict.ja
                        : verdict.en
                      : ''}
                </span>
              </div>
            );
          })}
        </div>

        <div className="rc-note" style={{ fontSize: 10, color: 'var(--hd-sub)' }}>
          {ja
            ? `点線 = この音骸の平均 ${Math.round(journey.baseline)}`
            : `Dotted line = average for this echo (${Math.round(journey.baseline)})`}
        </div>
      </div>

      <div
        className="rc-band"
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: 11,
          color: 'var(--hd-sub)',
          borderTop: '1px solid #262C37',
        }}
      >
        <span className="hd-num" style={{ flex: '1 1 0' }}>
          wuwaechotools.com
        </span>
        <span>{ja ? '‹ スワイプで表面 ›' : '‹ Swipe to flip back ›'}</span>
      </div>

      {sheen}
    </div>
  );

  return (
    <div
      style={{
        flex: '1 1 0',
        minHeight: 282,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: CARD_CSS }} />
      <div
        className="rc-deal"
        style={{ position: 'relative', flex: '1 1 0', perspective: '1200px' }}
      >
        <div
          className="rc-card"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            position: 'absolute',
            inset: 0,
            transformStyle: 'preserve-3d',
            touchAction: 'pan-y',
            cursor: 'grab',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            transform: cardTransform,
            transition: cardTransition,
          }}
        >
          {front}
          {back}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flex: 'none',
          height: 34,
        }}
      >
        <div
          style={{
            display: 'flex',
            padding: 3,
            gap: 2,
            borderRadius: 17,
            background: 'var(--hd-plate)',
          }}
        >
          <button
            type="button"
            onClick={() => showFace(false)}
            aria-pressed={!isBack}
            style={{
              height: 28,
              minWidth: 44,
              padding: '0 12px',
              border: 0,
              borderRadius: 14,
              fontSize: 12,
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: 'pointer',
              background: isBack ? 'transparent' : 'var(--hd-fg)',
              color: isBack ? 'var(--hd-sub)' : 'var(--hd-bg)',
            }}
          >
            {ja ? '表' : 'Front'}
          </button>
          <button
            type="button"
            onClick={() => showFace(true)}
            aria-pressed={isBack}
            style={{
              height: 28,
              minWidth: 44,
              padding: '0 12px',
              border: 0,
              borderRadius: 14,
              fontSize: 12,
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: 'pointer',
              background: isBack ? 'var(--hd-fg)' : 'transparent',
              color: isBack ? 'var(--hd-bg)' : 'var(--hd-sub)',
            }}
          >
            {ja ? '裏' : 'Back'}
          </button>
        </div>
        {!touched && (
          <span
            className="rc-nudge"
            style={{
              fontSize: 12,
              color: 'var(--hd-sub)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true">
              <path
                d="M1 7h20M5 3L1 7l4 4M17 3l4 4-4 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {ja ? 'カードをスワイプすると裏返せます' : 'Swipe the card to flip it'}
          </span>
        )}
      </div>
    </div>
  );
}
