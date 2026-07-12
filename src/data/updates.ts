export interface UpdateEntry {
  id: string;
  date: string;
  title: { ja: string; en: string };
  items: Array<{ ja: string; en: string }>;
  /** ポップアップ左側のリンクボタン（未指定なら「更新履歴を見る」/news にフォールバック） */
  link?: {
    href: string;
    label: { ja: string; en: string };
  };
}

export const UPDATES: UpdateEntry[] = [
  {
    id: '2026-07-12',
    date: '2026-07-12',
    title: { ja: 'ツールを公開しました', en: 'Site Launched' },
    items: [
      { ja: '音骸の強化・スコア計算をゲーム感覚で試せる「ガチャ」機能を公開', en: 'Released the "Gacha" simulator for echo farming and score calculation' },
      { ja: '実際の厳選結果を記録し、確率的に予測する「厳選サポーター」を公開', en: 'Released "Selection Supporter" to log your real pulls and get probability-based predictions' },
      { ja: 'キャラクター別のサブステ評価・おすすめメインステータスに対応', en: 'Added per-character substat evaluation and recommended main stats' },
      { ja: '日本語・英語の両方に対応', en: 'Available in both Japanese and English' },
    ],
    link: {
      href: '/guide',
      label: { ja: '使い方ガイドを見る', en: 'View How to Use' },
    },
  },
];

export const LATEST_UPDATE_ID = UPDATES[0].id;
