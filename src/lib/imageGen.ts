import type { EchoState, ScoreResult } from '@/types/echo';
import { SUBSTAT_LABEL_EN } from '@/data/translations';
import { renderCardToCanvas } from './cardCanvas';

const SITE_URL = 'https://wuwaechosimu.xyzack271.com';

export async function generateResultCard(
  echo: EchoState,
  score: ScoreResult,
  locale: 'ja' | 'en',
  maxedAt?: number,
): Promise<string> {
  await document.fonts.ready;
  const canvas = renderCardToCanvas(echo, score, locale, maxedAt);
  return canvas.toDataURL('image/png');
}

interface ShareOptions {
  locale: 'ja' | 'en';
  charName?: string;
}

export function buildShareText(
  echo: EchoState,
  score: ScoreResult,
  { locale = 'ja', charName }: ShareOptions = { locale: 'ja' },
): string {
  const echoName = locale === 'en'
    ? (echo.echoNameEn ?? echo.echoName)
    : echo.echoName;

  const statLine = echo.substats
    .slice(0, 3)
    .map((s) => {
      const label = locale === 'en' ? (SUBSTAT_LABEL_EN[s.key] ?? s.label) : s.label;
      return `${label} ${s.value}${s.unit}`;
    })
    .join(' / ');

  if (locale === 'en') {
    const charPart = charName ? ` for ${charName}` : '';
    return [
      `[${score.rank}] Score ${score.score}pts — ${echoName}${charPart} complete!`,
      statLine,
      SITE_URL,
      '#WutheringWaves #EchoSimulator',
    ].join('\n');
  }

  const charPart = charName ? `${charName}用の` : '';
  return [
    `【${score.rank}ランク】スコア${score.score}点の${charPart}${echoName}が完成！`,
    statLine,
    SITE_URL,
    '#鳴潮 #音骸シミュレーター',
  ].join('\n');
}
