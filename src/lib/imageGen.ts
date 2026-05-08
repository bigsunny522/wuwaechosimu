import type { EchoState, ScoreResult } from '@/types/echo';

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

export function buildShareText(echo: EchoState, score: ScoreResult): string {
  const emoji =
    score.rank === 'S+' ? '🌟' : score.rank === 'S' ? '✨' : score.rank === 'A' ? '🔥' : '📊';
  const statLine = echo.substats
    .slice(0, 3)
    .map((s) => `${s.label}${s.value}${s.unit}`)
    .join(' / ');
  return `${emoji}【${score.rank}ランク】スコア${score.score}点の音骸が完成！\n${statLine}\n#鳴潮 #WutheringWaves #音骸シミュレーター`;
}
