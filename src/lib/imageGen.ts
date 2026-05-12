import type { EchoState, ScoreResult } from '@/types/echo';
import { SUBSTAT_LABEL_EN } from '@/data/translations';

const SITE_URL = 'https://wuwaechosimu.xyzack271.com';

export async function generateResultCard(
  cardRef: HTMLElement,
): Promise<string> {
  const { toPng } = await import('html-to-image');
  return toPng(cardRef, {
    quality: 1,
    pixelRatio: 2,
    backgroundColor: '#0f1117',
  });
}

interface ShareOptions {
  locale: 'ja' | 'en';
  /** キャラクター名（指定なしの場合は省略） */
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

  // JA
  const charPart = charName ? `${charName}用の` : '';
  return [
    `【${score.rank}ランク】スコア${score.score}点の${charPart}${echoName}が完成！`,
    statLine,
    SITE_URL,
    '#鳴潮 #音骸シミュレーター',
  ].join('\n');
}
