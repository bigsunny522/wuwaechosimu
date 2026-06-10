import type { Metadata } from 'next';
import ChardbClient from './ChardbClient';

export const metadata: Metadata = {
  title: 'キャラクタービルドデータ確認 | 音骸シミュレーター',
  robots: { index: false, follow: false },
};

export default function ChardbPage() {
  return <ChardbClient />;
}
