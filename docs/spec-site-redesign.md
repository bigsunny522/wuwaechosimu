# サイト全体をホームの新デザインにそろえる(ライト / ダーク・属性カラー)

## 背景

ホーム(`/`)は案4・案5・結果カード(コミット `5977412` 〜 `da7a1e3`)で、暗い配色・Noto Sans JP + Chakra Petch・キャラの属性カラーのデザインに作り直した。ほかのページ(`/gacha` `/guide` `/score-formula` `/chardb` `/news` `/about` `/privacy` `/contact`)は古い白地・青(`#0275fd`)のままで、ホームから移ると別のサイトに見える。

オーナーと決めたこと(2026-10-21):

1. 対象は**ホーム以外の全ページ**(ガチャを含む)
2. 差し色は**ホームで最後に選んだキャラの属性色**を全ページで引き継ぐ。キャラなしなら灰色
3. ガチャにあった「青 / 金」のサイトテーマ切り替えは廃止し、**ライト / ダーク**の切り替えにする。切り替えは全ページ(ホームを含む)で効く。既定はダーク

作業が大きいので、**3つの段階に分けて順に渡す**。段階ごとに確認コマンドを通し、レビューを受けてから次に進む。依頼文で「段階 N をやってください」と指定する。指定されていない段階には手を付けない。

- 段階1: 基盤(配色の変数・ライト/ダーク・属性色の保存・共通ヘッダー/フッター)とホームの移行
- 段階2: 読み物ページ(guide / score-formula / chardb / news / about / privacy / contact)
- 段階3: ガチャと、ガチャが使う共通部品。古いテーマの仕組みを消す

---

## 共通の決まり(全段階)

### 配色の変数

`--hd-*` の変数を**ホーム専用からサイト全体のもの**に格上げする。名前は変えない(ホームのコードをそのまま使うため)。

| 変数 | ダーク(既定) | ライト | 用途 |
|---|---|---|---|
| `--hd-bg` | `#101318` | `#F3F5F8` | ページの地 |
| `--hd-plate` | `#181C23` | `#FFFFFF` | カード・シート・ヘッダーのメニュー |
| `--hd-raise` | `#222833` | `#E9EDF2` | 一段浮いた面・未選択のボタン・入力欄 |
| `--hd-line` | `#333B47` | `#D3D9E1` | 罫線・枠 |
| `--hd-fg` | `#ECEFF3` | `#161A21` | 本文 |
| `--hd-sub` | `#A3ADBA` | `#596374` | 補足の文字 |
| `--hd-go` | `#7FD6A4` | `#1E7F4C` | (既存) |
| `--hd-great` | `#7FD6A4` | `#1E7F4C` | 判定「強く継続」 |
| `--hd-borderline` | `#F0B35A` | `#9A6200` | 判定「様子見」 |
| `--hd-scrap` | `#FF8A8A` | `#C43C3C` | 判定「破棄」 |

属性で変わる変数(`data-element` で切り替える。下の表):

| 変数 | 意味 |
|---|---|
| `--hd-accent` | 塗り(帯・棒・選択中のボタンの背景・アイコン)。ライトでもダークでも同じ明るい色 |
| `--hd-accent-ink` | `--hd-accent` の上の文字。常に `#11141A` |
| `--hd-accent-soft` | `color-mix(in srgb, var(--hd-accent) 16%, transparent)` |
| `--hd-accent-text` | **地の上に置くアクセント色の文字**。ダークは `--hd-accent` と同じ、ライトは濃い色 |

| 属性(`data-element`) | `--hd-accent` | ライトの `--hd-accent-text` |
|---|---|---|
| `fusion` | `#FF8A5B` | `#B4481B` |
| `glacio` | `#6CC8F0` | `#0E6A94` |
| `electro` | `#B18CFF` | `#6A42D0` |
| `aero` | `#5FD8A8` | `#11744F` |
| `spectro` | `#F2D16B` | `#806200` |
| `havoc` | `#E86AA8` | `#A3306A` |
| `none`(既定・属性なし) | `#A9B6C8` | `#56627A` |

(コントラスト比は Claude Code が計算済み。ライトの文字色は白地で 5.4 以上、`--hd-raise` 上で 4.6 以上。塗りの上の `#11141A` は 6.2 以上)

**使い分けのルール(最重要)**: アクセント色で**文字**を書くときは `var(--hd-accent-text)`、**面・線・アイコン**を塗るときは `var(--hd-accent)`。アクセントで塗った面の上の文字は `var(--hd-accent-ink)`。白文字は使わない。

### `<html>` の属性

- `data-mode="dark" | "light"` — ライト/ダーク。サーバーの出力は `dark`
- `data-element="fusion" | … | "none"` — 属性。サーバーの出力は `none`
- 段階1・2の間は、ガチャ用の古い `data-theme="blue" | "gold"` も残る(段階3で消す)。**新しい仕組みに `data-theme` を使わない**(衝突するため)

### 保存(localStorage)

| キー | 値 | 書く場所 |
|---|---|---|
| `wuwa-site-mode` | `'dark'` / `'light'` | メニューの切り替え |
| `wuwa-accent-element` | `ElementKey` | ホームとガチャでキャラを変えたとき |
| `wuwa-last-char` | キャラの id(`'generic'` を含む) | ホームとガチャでキャラを変えたとき |

- 読み書きはすべて `try { } catch { }` で包む(プライベートモードで例外が出る)
- 値が上の表にないときは、mode は `dark`、element は `none` として扱う
- 古い `wuwa-site-theme`(`blue` / `gold`)は読まない。段階3で消すまでガチャ用にそのまま残す

### フォント

- 本文 Noto Sans JP、数字 Chakra Petch(`hd-num` クラス)。ホームと同じ
- `next/font` の読み込み(今は `HomeClient.tsx` の `bodyFont` / `numFont`)を `layout.tsx` に移し、変数(`--font-home-body` / `--font-home-num`)を `<html>` に付ける
- `layout.tsx` の Google Fonts の `<link>` は、`Noto+Sans+JP:wght@400;700;900` だけに減らす(Inter / IBM Plex Mono / Instrument Serif を外す)。日本語の字形はこの `<link>` から来るので、消さない
- `body` の `font-family` は `var(--font-home-body), 'Noto Sans JP', sans-serif`
- `'"IBM Plex Mono", monospace'` を直書きしている所(guide / news / gacha)は、`fontFamily` の指定を消して `className` に `hd-num` を足す

### ページの骨組み(ホーム以外)

```
<SiteHeader />            sticky、高さ 46px
<main>                    max-w-2xl、左右 16px
  ページの中身
</main>
<SiteFooter />
```

- 背景・文字色は `body` に付けるので、各ページで `bg-white` などを付けない
- カードは背景 `var(--hd-plate)`、角丸 10px、枠なし(ライトでは `1px solid var(--hd-line)`。下の CSS の `.hd-card` を使う)
- 影(`box-shadow`、`var(--shadow-*)`)は付けない

---

## 段階1: 基盤とホーム

### 変更対象

触るファイル:

- `src/app/globals.css` — 配色の変数・`.hd-card`・`.hd-num`・`.hd-force-dark`・`body`・スクロールバー
- `src/app/layout.tsx` — フォント、FOUC 防止のスクリプト、`<html>` の属性、`SiteAppearanceProvider`、`viewport.themeColor`
- `src/contexts/SiteAppearanceContext.tsx` — 新規
- `src/components/home/elementTheme.ts` — 文字用の色・順位の色を足す
- `src/components/site/SiteHeader.tsx` — 新規
- `src/components/site/SiteFooter.tsx` — 新規
- `src/app/HomeClient.tsx` — ヘッダーを `SiteHeader` に置き換え、属性色とキャラの保存
- `src/components/home/*.tsx` — 文字のアクセント色を `--hd-accent-text` に、判定色を変数に、`ResultCard` を常にダークに

触らないファイル:

- `src/contexts/SiteThemeContext.tsx` / `src/components/SiteThemeSwitcher.tsx` / `src/app/gacha/**` — 段階3でやる。段階1ではガチャが今のまま動くこと
- 読み物ページ — 段階2でやる
- `src/lib/**` / `src/data/**` — 計算とデータは変えない

### 1-1. `globals.css`

- 今の `.home-dark, html:has(.home-dark) { --hd-…: … }` を消し、代わりに次を置く
  ```css
  :root,
  :root[data-mode="dark"] { /* 上の表のダークの値 + --hd-accent-ink */ color-scheme: dark; }
  :root[data-mode="light"] { /* 上の表のライトの値 */ color-scheme: light; }

  :root { --hd-accent: #A9B6C8; --hd-accent-text: var(--hd-accent); }        /* none */
  :root[data-element="fusion"] { --hd-accent: #FF8A5B; }
  /* … glacio / electro / aero / spectro / havoc / none も同じ形 … */
  :root { --hd-accent-soft: color-mix(in srgb, var(--hd-accent) 16%, transparent); }

  :root[data-mode="light"] { --hd-accent-text: #56627A; }
  :root[data-mode="light"][data-element="fusion"] { --hd-accent-text: #B4481B; }
  /* … ほかの属性も … */
  ```
  - ダークでは `--hd-accent-text: var(--hd-accent)`。`:root[data-mode="dark"]` 側に書いてもよい。詳細度で負けないよう、最後に確かめる
- `.hd-force-dark`: 中だけダークの値に戻すクラス。ダークの表の値をすべて入れ、`--hd-accent-text: var(--hd-accent)` と `color-scheme: dark` も入れる。属性の `--hd-accent` は `:root` から継承されるので書かない
- `body`: `background: var(--hd-bg); color: var(--hd-fg); font-family: (上のフォント)`。今の `background: var(--background); color: var(--text)` を置き換える
- `html` の背景も `var(--hd-bg)` にする(iOS の引っぱりで地の色が見えるため)。今の `html:has(.home-dark)` の指定は消してよい
- `.home-dark .hd-num` を `.hd-num` に(どのページでも使えるように)。`.home-dark` の `background` / `color` / `font-family` は body と重なるので消してよい。クラス名 `home-dark` 自体は HomeClient に残してよい
- `.hd-card { background: var(--hd-plate); border-radius: 10px; }` と `:root[data-mode="light"] .hd-card { border: 1px solid var(--hd-line); }`
- スクロールバーの色を `var(--hd-bg)` / `var(--hd-line)` / `var(--hd-sub)` に
- 古い変数(`--accent` `--background` `--surface` `--text` `--text-sub` `--border` `--home-*`、`data-theme` の2ブロック、`--shadow-*`、`--font-display-serif`)は**段階1では消さない**(ガチャが使っている)。`body` からの参照だけ外す

### 1-2. `SiteAppearanceContext.tsx`(新規)

```ts
export type SiteMode = 'dark' | 'light';

interface SiteAppearance {
  mode: SiteMode;
  setMode: (m: SiteMode) => void;
  element: ElementKey;
  /** キャラを選んだときに呼ぶ。element と キャラ id を保存し、<html data-element> を書き換える。
   *  element は呼ぶ側が elementKeyOf(char?.element) で渡す(Provider にキャラのデータを持ち込まないため) */
  setCharacter: (charId: string, element: ElementKey) => void;
  /** 保存されているキャラ id。無ければ null。マウント後に読むので最初は null */
  savedCharId: string | null;
  /** JS で hex が要る所(CustomSelect・EchoIcon・SVG)向け */
  accentHex: string;      // ELEMENT_THEME[element].accent
  accentTextHex: string;  // mode が light なら ELEMENT_THEME[element].textLight、dark なら accent
}

export function SiteAppearanceProvider({ children }): JSX.Element
export function useSiteAppearance(): SiteAppearance
```

- 初期 state は `mode: 'dark'`, `element: 'none'`。マウント時に `document.documentElement.dataset.mode` / `dataset.element` を読んで合わせる(`SiteThemeContext` と同じやり方。値はスクリプトが先に入れている)
- `setMode`: state・`dataset.mode`・`wuwa-site-mode` を更新
- `setCharacter(charId, element)`: state・`dataset.element`・`wuwa-accent-element`・`wuwa-last-char` を更新する。`SiteAppearanceContext.tsx` は `src/data/**` を import しない(全ページの JS に キャラのデータが入るため)
- `useSiteAppearance` は Provider の外で呼ばれたら例外を投げる

### 1-3. `layout.tsx`

- `SITE_THEME_SCRIPT` に、`wuwa-site-mode` → `data-mode`、`wuwa-accent-element` → `data-element` を入れる処理を足す(値の確認つき。許す値の一覧はスクリプト内に直書きでよい)。既存の `wuwa-site-theme` の処理は残す
- `<html lang="ja" className="h-full …フォント変数" data-theme="blue" data-mode="dark" data-element="none" suppressHydrationWarning>`(スクリプトが属性を書き換えるので `suppressHydrationWarning` を付ける)
- `<body>` の `bg-white text-[#222222]` を外す
- `children` を `<SiteAppearanceProvider>` で包む
- `viewport.themeColor` を `'#101318'` に
- フォントは上の「フォント」の通り

### 1-4. `elementTheme.ts`

- `ELEMENT_THEME` の各項目に `textLight`(上の表のライトの文字色)を足す
- ライト用の順位の色を足す(`RANK_COLORS` は `src/lib/scorer.ts` にあり、白地では S+ などが読めないため):
  ```ts
  export const RANK_TEXT_LIGHT: Record<ScoreRank, string> = {
    GOD: '#B35F00', 'S+': '#8A6D00', S: '#806600', A: '#6A42D0', B: '#1F64C2', C: '#1B7F45', D: '#56627A',
  };
  export function rankTextColor(rank: ScoreRank, mode: SiteMode): string  // dark なら RANK_COLORS[rank]
  ```
- ファイルの場所は今のまま(`src/components/home/`)。サイト全体から import してよい

### 1-5. `SiteHeader.tsx`(新規)

ホームのヘッダー(今の `HomeClient.tsx` の `header`)を共通部品にしたもの。見た目はホームと同じ。

props:

```ts
interface Props {
  /** 左の名前。既定は「音骸シミュレーター」/ "Echo Simulator" */
  title?: string;
  /** true ならロゴと名前を '/' へのリンクにしない(ホーム用) */
  isHome?: boolean;
  /** 名前と EN ボタンの間に置くもの(ホームのタブ、ガチャのボーナス残り時間) */
  center?: ReactNode;
  /** メニューの先頭に足す項目(ガチャの履歴・ボーナス) */
  extraMenuItems?: ReactNode;
  /** 新着の点。渡さないときは SiteHeader が localStorage の lastSeenUpdate と LATEST_UPDATE_ID を比べて決める */
  hasNewUpdate?: boolean;
  /** 中身の最大幅。既定 'max-w-2xl'。ホームは 'max-w-[480px]' */
  maxWidthClass?: string;
}
```

- 外側: `sticky top-0 z-30`、背景 `var(--hd-bg)`、下に `1px solid var(--hd-line)`。ただし `isHome` のときは今のホームと同じく sticky と下線なし(ホームは全体が固定の縦 flex なので)
- 中: 高さ 46px、`mx-auto w-full {maxWidthClass}`、左 16px・右 12px、間隔 6px
- 左: `EchoIcon`(size 28、`color={accentHex}`、`bgColor` は mode が dark なら `#101318`、light なら `#F3F5F8`)+ 名前(15px 太字、`truncate`)。`isHome` でなければ全体を `Link`(`withLang('/', locale)`)にする
- 右: `center` → EN/JA の切り替え(今のホームと同じ見た目)→ メニューボタン(今のホームと同じ。新着の点は `var(--hd-accent)`)
- メニュー(今のホームのドロップダウンを暗い配色にする):
  - 背景 `var(--hd-plate)`、枠 `1px solid var(--hd-line)`、角丸 12px、幅 208px、影なし
  - 項目の文字 `var(--hd-fg)`、アイコン `var(--hd-sub)`、hover の背景 `var(--hd-raise)`、区切り線 `var(--hd-line)`
  - 並び: `extraMenuItems` →(区切り)→ 厳選サポーター(`/`、`BarChart3`)/ ガチャ(`/gacha`、`Dices`)/ 使い方ガイド / スコア計算方法 / キャラ別ビルド / お知らせ(新着の点)→(区切り)→ **表示の切り替え** →(区切り)→ このサイトについて / プライバシーポリシー / お問い合わせ。文言とアイコンは今のホームのメニューに合わせる
  - 今いるページの項目は文字 `var(--hd-accent-text)`・太字・`aria-current="page"`(`usePathname()` で判定)
  - 表示の切り替え: 1行に「表示」/ "Theme" のラベル(`var(--hd-sub)`、12px)と、「ダーク」/ "Dark"・「ライト」/ "Light" の2つのボタン(高さ 28px、角丸 6px、12px)。選択中は背景 `var(--hd-fg)`・文字 `var(--hd-bg)`・太字、ほかは背景 `var(--hd-raise)`・文字 `var(--hd-sub)`。押してもメニューは閉じない。`role="radiogroup"` / `role="radio"` / `aria-checked`
  - 暗幕(`fixed inset-0 z-40`)を押すか、項目のリンクを押すと閉じる
- 文言はすべて `ja ? '…' : '…'` で日英を書く

### 1-6. `SiteFooter.tsx`(新規)

- `border-t`、枠の色 `var(--hd-line)`、上下 16px
- 1行目: 「このサイトについて」「プライバシーポリシー」「お問い合わせ」のリンク(12px、`var(--hd-sub)`、間に `·`)
- 2行目: 「© 音骸シミュレーター(非公式ファンツール)」/ "© Echo Simulator (unofficial fan tool)"(12px、`var(--hd-sub)`、中央)
- リンクは `withLang` を通す

### 1-7. `HomeClient.tsx`

- `header` の JSX を `<SiteHeader isHome title={ja ? '厳選サポーター' : 'Selection Supporter'} maxWidthClass="max-w-[480px]" center={タブの JSX} hasNewUpdate={hasNewUpdate} />` に置き換える。タブの JSX は今のものをそのまま `center` に渡す。`menuOpen` と `MENU_ITEM` は不要になれば消す
- 一番外側の div の inline style から `--hd-accent` / `--hd-accent-ink` / `--hd-accent-soft` と `background` を消す(CSS の `data-element` に任せる)。`bodyFont` / `numFont` の定義とクラスも消す(layout へ移した)
- キャラの保存と復元:
  - `handleCharacterChange` の中で `setCharacter(charId, elementKeyOf(キャラの element))` を呼ぶ(`'generic'` は `'none'`)(既存の処理はそのまま)
  - マウント後、`savedCharId` が `null` でなく、`'generic'` か `CHARACTER_LIST` にある id で、今の `selectedCharId` と違うなら、**一度だけ** `handleCharacterChange(savedCharId)` を呼ぶ(`useRef` で一度きりにする)
- `theme.accent`(hex)を使っている所: `BuildBar` の `accent` prop と `CharacterPicker` などの CustomSelect 向けは `accentHex` を渡す
- 記録タブのフッターは `<SiteFooter />` に置き換える

### 1-8. ホームの部品(`src/components/home/*.tsx`)

- **文字**に `var(--hd-accent)` を使っている所を `var(--hd-accent-text)` にする。今わかっている所: `RecordsPanel.tsx:117`、`InputDock.tsx:108`、`ForecastStrip.tsx:16,38,50,61`、`BuildBar.tsx:93`、`HomeClient.tsx:754`。ほかにも `color:` / `text-[var(--hd-accent)]` で見つけたものはすべて。面・線・`background`・`fill`・`stroke` はそのまま
- 判定の色(`ForecastStrip.tsx` の `RECOMMENDATION`)を `var(--hd-great)` / `var(--hd-accent-text)` / `var(--hd-borderline)` / `var(--hd-scrap)` に
- 順位の文字色を地の上に出している所(ForecastStrip・InputDock・RecordsPanel の `RANK_COLORS[...]`)は `rankTextColor(rank, mode)` に。順位色を `background` に使っている所や、`${color}18` のように透明度を連結している所は今のまま
- `ResultCard.tsx`: 一番外側の要素に `className="hd-force-dark"` を足す(カードはライトでも暗いまま。中の hex の直書きは変えない)
- `InputDock.tsx:67,72` の `#FFFFFF` / `#0B0D11`: ライトでも読めるなら変えなくてよい(白地の小さな札。レビューで見る)
- シート(設定シート・キャラ選択・スコア分布)の暗幕 `rgba(0,0,0,.6)` はライトでも同じでよい

### 段階1の受け入れ条件

- [ ] `npx tsc --noEmit` が通る
- [ ] `npm run build` が通る
- [ ] 変更が段階1の「変更対象」に収まっている(`git status`)
- [ ] `grep -rn "font-home-body\|Noto_Sans_JP" src/app/HomeClient.tsx` が0件
- [ ] `grep -n "'--hd-accent'" src/app/HomeClient.tsx` が0件
- [ ] 以下は Claude Code がブラウザで確かめる(実装担当は不要)
  - ホームの見た目がダークで今と変わらない(390×844 / 375×667 でスクロールなし)
  - メニューの「ライト」でホームが明るくなり、リロードしても保たれる。結果カードは暗いまま
  - 景燃(焦熱)を選んでリロードすると、景燃のまま・橙のまま
  - `/gacha` が今の見た目のまま動く(段階3まで)
  - ライトで、属性の文字(上段の属性名、T 表記、判定)が読める

---

## 段階2: 読み物ページ

### 変更対象

触るファイル:

- `src/app/guide/GuideClient.tsx`
- `src/app/score-formula/ScoreFormulaClient.tsx`
- `src/app/chardb/ChardbClient.tsx`
- `src/app/news/NewsClient.tsx`
- `src/app/about/AboutClient.tsx`
- `src/app/privacy/PrivacyClient.tsx`
- `src/app/contact/ContactClient.tsx`

触らないファイル:

- 各ページの `page.tsx`(メタデータ・JSON-LD はそのまま)
- `src/components/AdBanner.tsx` / `NativeBanner.tsx` / `EchoIcon.tsx` / `CustomSelect.tsx`
- 段階1で作った部品(直したいところがあれば止めて質問する)

### やること(全ページ共通)

1. 今の `<header>…</header>` を `<SiteHeader />` に置き換える(戻るリンクと EN ボタンはヘッダーが持つので消す)。`<footer>…</footer>` は `<SiteFooter />` に
2. 一番外側の `min-h-screen flex flex-col bg-white` から `bg-white` を外す
3. 色の直書きを下の表で置き換える。**Tailwind のクラス(`text-[#222222]` など)・inline style・定数(`const ACCENT = '#0275fd'`)のすべてが対象**

| 今 | 置き換え |
|---|---|
| ページの地 `#ffffff` / `#fff` / `bg-white` | なし(body の `--hd-bg`) |
| カード・箱の背景 `#fff` / `bg-white` | `.hd-card` クラス、または `var(--hd-plate)` |
| 面 `#f7f7f7` `#f9fafb` `#fafafa` `#f3f4f6` `#f1f5f9` | `var(--hd-raise)` |
| 枠・罫線 `#e5e7eb` `#d1d5db` `#f3f4f6`(線として) | `var(--hd-line)` |
| 本文 `#222222` `#111827` `#1f2937` `#374151` `#0f172a`(文字) | `var(--hd-fg)` |
| 補足 `#707070` `#6b7280` `#9ca3af` | `var(--hd-sub)` |
| 青の文字・リンク `#0275fd` | `var(--hd-accent-text)` |
| 青の塗り(ボタン・帯・バッジ)`#0275fd`、`linear-gradient(90deg, #0275fd, #60a5fa)` | 背景 `var(--hd-accent)`、上の文字 `var(--hd-accent-ink)`(グラデーションはやめて単色) |
| 薄い青の面 `#eef9ff`、`${ACCENT}22` などの連結 | `var(--hd-accent-soft)` |
| `white` / `#fff` の文字(青の塗りの上) | `var(--hd-accent-ink)` |
| コードの箱(score-formula の `#0f172a` 地・`#e2e8f0` 文字) | 背景 `var(--hd-raise)`、文字 `var(--hd-fg)` |
| 影(`boxShadow`、`shadow-*`) | 消す |

- `EchoIcon` の `color` / `bgColor` に hex を直書きしている所は、`useSiteAppearance()` の `accentHex` と、地の色(`#101318` / `#F3F5F8`)を mode で切り替えて渡す。塗りの上に置くアイコン(`color="white" bgColor="#0275fd"`)は `color="#11141A" bgColor={accentHex}`
- `CustomSelect`(contact)は hex を連結するので、`accentColor={accentHex}`。`textColor` / `background` / `borderColor` は mode で hex を切り替える(ダーク `#ECEFF3` / `#222833` / `#333B47`、ライト `#161A21` / `#FFFFFF` / `#D3D9E1`)
- 意味のある色(注意の琥珀 `#f59e0b`、成功の緑、エラーの赤、順位の色)は残してよい。ただし文字として地の上に置いていて、ライトかダークで読めないものは止めて質問する(勝手に色を決めない)
- 入力欄(contact)は背景 `var(--hd-raise)`、枠 `var(--hd-line)`、フォーカスの枠 `var(--hd-accent)`、文字 `var(--hd-fg)`、placeholder `var(--hd-sub)`
- 見出しや数字で `"IBM Plex Mono"` を使っている所は `hd-num` に(共通の決まり「フォント」)
- レイアウト(並び・余白・文言)は変えない。色・フォント・ヘッダー/フッターだけ

### 段階2の受け入れ条件

- [ ] `npx tsc --noEmit` が通る
- [ ] `npm run build` が通る
- [ ] 変更が段階2の「変更対象」に収まっている
- [ ] 次の grep が0件
  ```
  grep -nE "#0275fd|#60a5fa|#eef9ff|bg-white|#222222|#707070|#9ca3af|#e5e7eb|#f3f4f6|IBM Plex" \
    src/app/guide/GuideClient.tsx src/app/score-formula/ScoreFormulaClient.tsx src/app/chardb/ChardbClient.tsx \
    src/app/news/NewsClient.tsx src/app/about/AboutClient.tsx src/app/privacy/PrivacyClient.tsx src/app/contact/ContactClient.tsx
  ```
- [ ] `grep -n "<header\|<footer" ` を上の7ファイルにかけて0件
- [ ] Claude Code がブラウザで確かめる: 7ページ × ダーク/ライト × 390 幅で、文字が読める・白い箱が残っていない・ヘッダーからホームとほかのページへ移れる

---

## 段階3: ガチャと共通部品・古いテーマの撤去

### 変更対象

触るファイル:

- `src/app/gacha/GachaClient.tsx`
- `src/app/gacha/page.tsx` — `SiteThemeProvider` を外す
- ガチャが使う部品: `src/components/EchoCard.tsx` `SubstatRow.tsx` `ScoreBadge.tsx` `ScoreDistributionChart.tsx` `EchoAdvisor.tsx` `ScoreDebugPanel.tsx` `BonusModal.tsx` `SavedResultsModal.tsx` `ResultCardVisual.tsx` `HomeExplainer.tsx` `UpdateModal.tsx`
- `src/contexts/SiteThemeContext.tsx` / `src/components/SiteThemeSwitcher.tsx` — 削除
- `src/app/globals.css` — 古い変数を消す
- `src/app/layout.tsx` — `data-theme` と `wuwa-site-theme` の処理を消す

触らないファイル:

- `src/components/CustomSelect.tsx` — props で色を渡す
- `src/components/ThemeSelector.tsx` / `src/components/ResultCard.tsx` — どこからも使われていない。今回は触らない
- `src/components/home/**`(段階1で済み)
- `src/lib/**` / `src/data/**`(`src/lib/cardCanvas.ts` の画像の色も変えない)

### やること

1. **ヘッダー**: ガチャの `<header>` を `<SiteHeader title={T.appTitle} center={ボーナス残り時間の表示} extraMenuItems={履歴・ボーナスの項目} hasNewUpdate={hasNewUpdate} />` に置き換える
   - 「ガチャ / 厳選管理」の切り替えは消す(メニューにある)
   - メニューの `SiteThemeSwitcher` と「English に切替」は消す(ヘッダーにある)
   - ボーナス残り時間の札: 枠 `var(--hd-accent)`、文字 `var(--hd-accent-text)`、背景 `var(--hd-accent-soft)`、数字は `hd-num`
2. **テーマの分岐をなくす**: `useSiteTheme` と `ACCENT_BY_THEME` / `CTA_SOLID_BY_THEME` / `SELECT_ACCENT_BY_THEME` を消し、`useSiteAppearance()` に置き換える
   - `ACCENT` を文字に使っている所 → `var(--hd-accent-text)`、塗り・SVG の `fill` → `var(--hd-accent)` か(hex が要るなら)`accentHex`
   - `var(--home-bg)` → `var(--hd-bg)`、`--home-surface` → `--hd-raise`、`--home-card` → `--hd-plate`、`--home-text` / `--home-card-text` → `--hd-fg`、`--home-text-sub` / `--home-card-text-sub` → `--hd-sub`、`--home-accent` → `--hd-accent`(文字なら `--hd-accent-text`)、`--home-accent-bg` → `--hd-accent-soft`、`--home-border` → `--hd-line`
   - CTA(`--home-cta-bg` / `--home-cta-text` / `--home-cta-shadow`): 背景 `var(--hd-accent)`、文字 `var(--hd-accent-ink)`、影なし。角丸は全丸(ホームの記録ボタンと同じ)
   - `CustomSelect` には段階2と同じ hex を渡す(キャラ・音骸の2種類あった色分けはやめ、どちらも `accentHex`)
3. **キャラの保存**: ガチャの `handleCharacterChange` で `setCharacter(charId, element)` を呼ぶ(ホームと同じ)。マウント後の復元はホームと同じ(1-7)
4. **共通部品**: 上に挙げた部品の色の直書きを、段階2の表と `--home-*` の対応で置き換える。SVG のグラフ(`ScoreDistributionChart`)の軸・目盛り・文字は `var(--hd-line)` / `var(--hd-sub)`、棒・線は `var(--hd-accent)`
   - `UpdateModal` / `BonusModal` / `SavedResultsModal`: 背景 `var(--hd-plate)`、暗幕 `rgba(0,0,0,.6)`、角丸 16px
   - `ResultCardVisual`(保存した結果の画像の見た目): 一番外側に `hd-force-dark` を付け、中は変えない(ホームの結果カードと同じ扱い)
   - 順位の色を地の上の文字に使っている所は `rankTextColor(rank, mode)`
5. **古い仕組みの撤去**
   - `SiteThemeContext.tsx` / `SiteThemeSwitcher.tsx` を削除
   - `globals.css` から `--accent` `--accent-bg` `--background` `--surface` `--text` `--text-sub` `--border` `--shadow-*` `--font-display-serif`、`:root[data-theme=…]` の2ブロック(`--home-*`)を消す
   - `layout.tsx` から `data-theme="blue"` と、スクリプトの `wuwa-site-theme` の処理を消す。コメント「サイトテーマ(Homeページ)」も新しい中身に合わせる
6. レイアウト・文言・ガチャの動き(確率・ボーナス・保存)は変えない

### 段階3の受け入れ条件

- [ ] `npx tsc --noEmit` が通る
- [ ] `npm run build` が通る
- [ ] 変更が段階3の「変更対象」に収まっている
- [ ] 次がすべて0件
  ```
  grep -rn "useSiteTheme\|SiteThemeSwitcher\|SiteThemeProvider\|data-theme\|wuwa-site-theme" src
  grep -rn "var(--home-\|var(--accent)\|var(--text\|var(--surface)\|var(--border)\|var(--background)\|var(--shadow" src
  grep -rnE "#0275fd|IBM Plex" src/app src/components
  ```
- [ ] Claude Code がブラウザで確かめる: `/gacha` をダーク/ライトで、キャラ選択・強化・ボーナス・履歴・お知らせのモーダルが読める。ガチャでキャラを変えてホームに戻ると、そのキャラと色になっている

---

## 対象外

- ページのレイアウト・文言・機能の変更(色・フォント・ヘッダー/フッターだけ)
- OS の設定(`prefers-color-scheme`)に合わせる自動切り替え。既定は常にダーク
- X シェア用の画像(`src/lib/cardCanvas.ts`)の配色
- 使われていない部品(`ThemeSelector.tsx` / `components/ResultCard.tsx`)の削除
- `DESIGN.md` の書き直し(Claude Code がレビュー後に行う)

## 想定される落とし穴

- Next.js はこのリポジトリ専用の版。`next/font` を layout へ移す前、`suppressHydrationWarning` を使う前に `node_modules/next/dist/docs/` の該当ガイドを読む
- FOUC 防止のスクリプトが `<html>` の属性を書き換えるので、React のハイドレーションの警告が出る。`<html>` に `suppressHydrationWarning` を付ける
- `CustomSelect` は `${accentColor}1a` のように hex に透明度を連結する。`var(...)` を渡すと CSS が壊れる。hex(`accentHex`)を渡す
- `--hd-accent-text` を `--hd-accent` と取り違えやすい。文字は `-text`、面・線は無印
- `:root[data-mode="light"][data-element="x"]` は `:root[data-element="x"]` より詳細度が高い。ダークの `--hd-accent-text` が `var(--hd-accent)` に戻ることを最後に確かめる
- `.hd-force-dark` の中では `--hd-accent-text` を `var(--hd-accent)` に戻す必要がある(ライトの濃い文字色が暗いカードに出ないように)
- ホームは「強化中」タブが `100dvh` の固定の縦 flex。`SiteHeader` を `isHome` で sticky にすると高さの計算が変わるので、ホームでは sticky にしない
- `usePathname()` を使う `SiteHeader` は client component(`'use client'`)にする
- ホームの復元で `handleCharacterChange` を呼ぶと下書きがリセットされる。マウント直後(下書きが空)の一度だけにする
- 文言はすべて `ja ? '…' : '…'` で日英を両方書く
