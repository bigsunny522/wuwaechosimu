export interface UpdateEntry {
  id: string;
  date: string;
  title: { ja: string; en: string };
  items: Array<{ ja: string; en: string }>;
}

export const UPDATES: UpdateEntry[] = [
  {
    id: '2026-06-15',
    date: '2026-06-15',
    title: { ja: 'ルシラー追加', en: 'Lucilare Added' },
    items: [
      { ja: 'ルシラー（凝縮・サブアタッカー）を追加しました', en: 'Added Lucilare (Glacio / Sub Attacker)' },
    ],
  },
];

export const LATEST_UPDATE_ID = UPDATES[0].id;
