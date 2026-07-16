// score分布カーブ（percentile ↔ score の対応表）からの補間ユーティリティ
// ScoreDistributionChart（DOM/SVG）と cardCanvas（画像書き出し）の両方で使う

export function pctAtScore(curve: [number, number][], score: number): number {
  const bySco = [...curve].sort((a, b) => a[1] - b[1]);
  if (score >= bySco[bySco.length - 1][1]) return bySco[bySco.length - 1][0];
  if (score <= bySco[0][1]) return bySco[0][0];
  for (let i = 0; i < bySco.length - 1; i++) {
    const [pctLo, scoreLo] = bySco[i];
    const [pctHi, scoreHi] = bySco[i + 1];
    if (score >= scoreLo && score <= scoreHi) {
      if (scoreHi === scoreLo) return pctLo;
      const t = (score - scoreLo) / (scoreHi - scoreLo);
      const logLo = Math.log10(Math.max(pctLo, 0.001));
      const logHi = Math.log10(Math.max(pctHi, 0.001));
      return Math.pow(10, logLo + (logHi - logLo) * t);
    }
  }
  return bySco[0][0];
}

export function formatPct(pct: number): string {
  if (pct < 1) return pct.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  if (pct < 10) return pct.toFixed(1).replace(/\.0$/, '');
  return Math.round(pct).toString();
}
