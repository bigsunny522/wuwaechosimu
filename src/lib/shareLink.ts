import type { CharacterBuild } from '@/types/character';
import type { EchoCost, EchoState, ScoreResult, Substat, SubstatKey } from '@/types/echo';
import { CHARACTER_MAP } from '@/data/characters';
import { ECHOES, HARMONY_SETS, HARMONY_SETS_EN } from '@/data/echoes';
import { MAINSTAT_POOLS } from '@/data/mainstats';
import { SUBSTAT_MAP } from '@/data/substats';
import { scoreEcho } from '@/lib/scorer';
import type { Locale } from '@/lib/locale-utils';
import { SITE_URL } from '@/lib/seo';

export const SHARE_PATH = '/share';

export type ShareQueryParams = URLSearchParams | Record<string, string | string[] | undefined>;

function readParam(params: ShareQueryParams, key: string): string | undefined {
  if (params instanceof URLSearchParams) {
    return params.get(key) ?? undefined;
  }
  const raw = params[key];
  return Array.isArray(raw) ? raw[0] : raw;
}

function findSetKey(jaName: string): string | undefined {
  return Object.keys(HARMONY_SETS).find(
    (key) => HARMONY_SETS[key as keyof typeof HARMONY_SETS] === jaName,
  );
}

/** シェア URL のクエリ(先頭の ? なし)を作る */
export function encodeShareQuery(
  echo: EchoState,
  opts: { charId?: string; locale: Locale },
): string | null {
  const setKey = findSetKey(echo.activeHarmonySet);
  if (!setKey) return null;
  if (echo.substats.length === 0) return null;

  const parts: string[] = [`c=${echo.cost}`];
  const echoInfo = ECHOES.find((e) => e.id === echo.echoId);
  if (echoInfo) parts.push(`e=${echoInfo.id}`);
  parts.push(`m=${echo.mainstat.key}`);
  parts.push(`h=${setKey}`);
  parts.push(`s=${echo.substats.map((sub) => `${sub.key}.${sub.tier}`).join(',')}`);
  if (opts.charId) parts.push(`ch=${opts.charId}`);
  if (opts.locale === 'en') parts.push('lang=en');
  return parts.join('&');
}

/** 完全なシェア URL(https://wuwaechotools.com/share?...)を作る。作れないときは null */
export function buildShareUrl(
  echo: EchoState,
  opts: { charId?: string; locale: Locale },
): string | null {
  const query = encodeShareQuery(echo, opts);
  return query ? `${SITE_URL}${SHARE_PATH}?${query}` : null;
}

export interface DecodedShare {
  echo: EchoState;
  build?: CharacterBuild;
  score: ScoreResult;
  locale: Locale;
}

/** クエリから結果を復元し、scoreEcho で採点し直す。不正なら null */
export function decodeShareQuery(params: ShareQueryParams): DecodedShare | null {
  const c = readParam(params, 'c');
  if (c !== '4' && c !== '3' && c !== '1') return null;
  const cost = Number(c) as EchoCost;

  const m = readParam(params, 'm');
  const mainstat = MAINSTAT_POOLS[cost].find((ms) => ms.key === m);
  if (!mainstat) return null;

  const h = readParam(params, 'h');
  if (!h || !Object.hasOwn(HARMONY_SETS, h)) return null;
  const harmonySet = HARMONY_SETS[h as keyof typeof HARMONY_SETS];

  const s = readParam(params, 's');
  if (!s) return null;
  const tokens = s.split(',');
  if (tokens.length > 5) return null;

  const usedKeys = new Set<string>();
  const substats: Substat[] = [];
  for (const token of tokens) {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [key, tierRaw] = parts;
    if (!Object.hasOwn(SUBSTAT_MAP, key)) return null;
    const entry = SUBSTAT_MAP[key as SubstatKey];
    if (!entry) return null;
    if (!/^[0-9]+$/.test(tierRaw)) return null;
    const tier = Number(tierRaw);
    if (tier > entry.values.length - 1) return null;
    if (usedKeys.has(key)) return null;
    usedKeys.add(key);
    substats.push({
      key: entry.key,
      label: entry.label,
      unit: entry.unit,
      value: entry.values[tier],
      tier,
      maxValue: entry.values[entry.values.length - 1],
    });
  }

  const e = readParam(params, 'e');
  const echoInfo = e ? ECHOES.find((info) => info.id === e) : undefined;

  const ch = readParam(params, 'ch');
  const build = ch && Object.hasOwn(CHARACTER_MAP, ch) ? CHARACTER_MAP[ch] : undefined;

  const echo: EchoState = {
    cost,
    echoId: echoInfo ? echoInfo.id : '',
    echoName: echoInfo ? echoInfo.name : harmonySet,
    echoNameEn: echoInfo ? echoInfo.nameEn : (HARMONY_SETS_EN[harmonySet] ?? harmonySet),
    activeHarmonySet: harmonySet,
    level: substats.length * 5,
    substats,
    mainstat,
    totalCost: { shellCoins: 0, tunerBasic: 0, tunerAdvanced: 0, expMaterial: 0 },
  };

  const locale: Locale = readParam(params, 'lang') === 'en' ? 'en' : 'ja';
  const score = scoreEcho(echo, build);
  return { echo, build, score, locale };
}
