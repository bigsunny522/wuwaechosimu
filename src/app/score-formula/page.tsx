import type { Metadata } from 'next';
import ScoreFormulaClient from './ScoreFormulaClient';

export const metadata: Metadata = {
  title: 'スコア計算式 v2 ドキュメント | 音骸シミュレーター',
  robots: { index: false, follow: false },
};

export default function ScoreFormulaPage() {
  return <ScoreFormulaClient />;
}
