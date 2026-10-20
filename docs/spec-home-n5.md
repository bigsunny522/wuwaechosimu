# ホーム案5: 属性カラー・キャラ選択の作り直し・広告枠

## 背景

案4(コミット `5977412`)をオーナーが見て、次の4点を指摘した。

1. キャラのチップにある頭文字の丸いアイコンがダサい。キャラ画像はないので、アイコン自体をなくしたい
2. キャラを選ぶ場所がわかりにくい(3つのチップのどれを押しても同じシートが開き、その中のプルダウンで選ぶ)
3. 広告の入る場所がない(今は環境変数があるときだけ `-my-6` で挟んでいて、場所を取っていない)
4. キャラの属性ごとに画面の色が変わってほしい

デザインの見本は `.impeccable/mocks/decision/n5.html`(ブラウザで開ける。`?el=fusion` などで属性を、`?sheet=1` でキャラ選択を表示)。寸法・色はこの見本に合わせる。

あわせて、案4で暗い背景に明るいままの部品が残っていた「記録」タブも暗い配色にそろえる。

## 変更対象

触るファイル:

- `src/components/home/elementTheme.ts` — 新規。属性→色の対応表
- `src/components/home/CharacterPicker.tsx` — 新規。キャラ選択のシート
- `src/components/home/BuildBar.tsx` — 上段(キャラのボタン + COST の切り替え)に作り直す。設定シートからキャラと COST を外す
- `src/app/HomeClient.tsx` — 属性カラーの適用、広告枠、メインステータス行、キャラ選択シートの組み込み、記録タブの文字色
- `src/components/home/ForecastStrip.tsx` — 紫の直書き(`#A98BFF`)をアクセント色に置き換える
- `src/components/home/RecordsPanel.tsx` — 暗い配色にする

触らないファイル:

- `src/components/AdBannerThin.tsx` — サイズは環境変数(`NEXT_PUBLIC_ADSTERRA_BANNER_THIN_WIDTH` / `_HEIGHT`)で変えられるので、コードは変えない
- `src/components/CustomSelect.tsx` — 他のページでも使っている
- `src/components/home/SlotList.tsx` / `InputDock.tsx` — すでに `var(--hd-accent)` を使っているので、色はそのまま追従する
- `src/data/**` / `src/lib/**` — データと計算は変えない
- `src/app/globals.css` — `--hd-accent` の既定値(紫)はそのまま残す。属性の色は HomeClient の inline style で上書きする

## 仕様

### 1. 属性カラー(`elementTheme.ts`)

```ts
export type ElementKey = 'fusion' | 'glacio' | 'electro' | 'aero' | 'spectro' | 'havoc' | 'none';

// キャラデータの element(日本語)→ キー。表にない値('不明' など)は 'none'
export const ELEMENT_KEY_BY_JA: Record<string, ElementKey> = {
  '焦熱': 'fusion', '凝縮': 'glacio', '電導': 'electro',
  '気動': 'aero', '回折': 'spectro', '消滅': 'havoc',
};

export const ELEMENT_THEME: Record<ElementKey, { accent: string; ja: string; en: string }> = {
  fusion:  { accent: '#FF8A5B', ja: '焦熱', en: 'Fusion' },
  glacio:  { accent: '#6CC8F0', ja: '凝縮', en: 'Glacio' },
  electro: { accent: '#B18CFF', ja: '電導', en: 'Electro' },
  aero:    { accent: '#5FD8A8', ja: '気動', en: 'Aero' },
  spectro: { accent: '#F2D16B', ja: '回折', en: 'Spectro' },
  havoc:   { accent: '#E86AA8', ja: '消滅', en: 'Havoc' },
  none:    { accent: '#A9B6C8', ja: '汎用', en: 'Generic' },
};

export const ELEMENT_ORDER: Exclude<ElementKey, 'none'>[] =
  ['fusion', 'glacio', 'electro', 'aero', 'spectro', 'havoc'];

export const ACCENT_INK = '#11141A';

export function elementKeyOf(element: string | undefined): ElementKey { ... }
```

- 「キャラなし(generic)」と、element が表にないキャラ(現在 `'不明'` が2体)は `'none'`
- `HomeClient.tsx` の一番外側の `.home-dark` の div の `style` に次を足す(既存の `background` は残す)。子孫の `var(--hd-accent)` がすべて追従する:
  - `--hd-accent`: その属性の `accent`
  - `--hd-accent-ink`: `ACCENT_INK`
  - `--hd-accent-soft`: `color-mix(in srgb, <accent> 16%, transparent)`
  - TypeScript では `style={{ background: 'var(--hd-bg)', ['--hd-accent' as string]: accent, ... } as React.CSSProperties}` の形にする
- 紫の直書きを置き換える:
  - `HomeClient.tsx` ヘッダーの `<EchoIcon color="#A98BFF" ...>` → その属性の `accent`(hex のまま渡す)
  - `BuildBar.tsx` の `SELECT_STYLE.accentColor` → その属性の `accent`。**`CustomSelect` は `${accentColor}1a` のように hex に透明度を連結しているので、`var(...)` ではなく hex 文字列を渡す**。BuildBar に `accent: string` の prop を足して受け取る
  - `ForecastStrip.tsx` の `RECOMMENDATION.good.color` → `'var(--hd-accent)'`(ここは `style={{ color }}` にそのまま入るだけなので var でよい)

### 2. 画面の並び(強化中タブ)

上から順に、すべて高さ固定(`flex: none`)。真ん中のエリアだけが縮む、という案4の構造は変えない。

1. ヘッダー 46px(変更なし。アイコンの色だけ属性に)
2. **広告枠 50px**(下の §4)
3. **上段**(§3): キャラのボタン + COST の切り替え。上の余白 8px、左右 16px
4. 真ん中のエリア(今の `flex-1` の div)
   - **メインステータス行**: 左に音骸名(COST 4 のとき)/ハーモニー名(COST 3・1 のとき)、右に「メインステータス名 + 値」。今のメイン行と同じ1行に入れる。左の名前は1行で `truncate`(`flex: 1 1 0; min-width: 0`)、右は `white-space: nowrap; flex: none`。行全体が今と同じく設定シートを開くボタン
   - 「メイン」というラベルは消す(見本の通り、名前と値だけ)
   - SlotList(変更なし)/ ForecastStrip / 記録への1行(変更なし)
5. InputDock(変更なし)

### 3. 上段(`BuildBar.tsx`)

頭文字の丸、COST のチップ、音骸名のチップは**すべて削除**する。代わりに横並びで2つ置く(間隔 6px)。

**キャラのボタン**(幅いっぱい: `flex: 1; min-width: 0`)

- 高さ 48px(`@media (max-height: 700px)` では 44px)、背景 `var(--hd-plate)`、角丸 10px、`overflow: hidden`
- 中身は3列のグリッド `4px minmax(0,1fr) auto`、間隔 12px、右の余白 12px
  - 1列目: 幅 4px・高さいっぱいの帯。色は `var(--hd-accent)`
  - 2列目: 上に小さく「キャラ」/ "Character"(11px、`var(--hd-sub)`)、下にキャラ名(16px、太字、`truncate`)。名前の後ろに属性名(12px、太字、`var(--hd-accent)`、左余白 8px)。キャラなしのときは名前「キャラなし」/ "No character"、属性名「汎用」/ "Generic"
  - 3列目: 「変更」/ "Change"(12px、`var(--hd-sub)`)+ 右向きの山形(`›`)。改行しない
- 押すと §5 のキャラ選択シートを開く

**COST の切り替え**(`flex: none`)

- 背景 `var(--hd-plate)`、角丸 10px、左右の余白 6px、間隔 2px
- 先頭に縦書きの小さい「COST」(10px、`var(--hd-sub)`、`writing-mode: vertical-rl`)
- `4` `3` `1` の3つのボタン。各 高さ 32px(低い画面では 28px)、最小幅 30px、13px、数字フォント(`hd-num`)、角丸 6px
- 選択中は背景 `var(--hd-accent)`・文字 `var(--hd-accent-ink)`・太字。それ以外は文字 `var(--hd-sub)`
- 押すとその場で `onCostChange(c)`(シートは開かない)

**設定シート**(今あるもの)

- キャラの `CustomSelect` と COST のボタン列を**シートから外す**。残すのは、音骸(COST 4)/ハーモニー(COST 3・1)、メインステータス、複数セット音骸のセット選択、「閉じる」
- シートの先頭に見出し「音骸とメインステータス」/ "Echo & main stat"(16px 太字)を足す
- 開き方: メインステータス行(§2)をタップしたとき。上段のボタンからは開かない
- 不要になった prop(`charName` / `charNameEn` / `echoName` / `echoNameEn` / `selectedCharId` / `onCharChange` / `charOptions` など)は消してよい。上段に要るのは、表示するキャラ名・属性名、`cost`、`onCostChange`、`onOpenPicker` くらい

### 4. 広告枠

- ヘッダーの直後に、**環境変数の有無にかかわらず常に**高さ 50px の枠を置く(`flex: none; height: 50px; overflow: hidden; display: flex; align-items: center; justify-content: center`)
- `HAS_THIN_AD` が true のときだけ、中に `<AdBannerThin />` を入れる。`AdBannerThin` は外側に `my-6` を持っているので、今と同じく `-my-6` の div で包んで打ち消す
- `HAS_THIN_AD` が false のときは枠の中は空(点線や「広告」の文字は出さない)
- 広告のサイズは 320×50 を想定。オーナーが Adsterra で 320×50 のユニットを発行し、`NEXT_PUBLIC_ADSTERRA_BANNER_THIN_*` の4つを差し替える(コードの作業ではない)

### 5. キャラ選択シート(`CharacterPicker.tsx`)

props: `ja`, `open`, `onClose`, `selectedCharId`, `onSelect(id: string)`。キャラの一覧は `CHARACTER_LIST`(並び順もそのまま)。

- 背景の幕: `fixed inset-0 z-40`、`rgba(0,0,0,.6)`、押すと閉じる
- シート: `fixed bottom-0`、横は中央寄せで `w-full max-w-[480px]`(今の設定シートと同じ置き方)、`z-50`、高さ `78dvh`、背景 `var(--hd-plate)`、上の角丸 16px、縦の flex
- 見出し行(`flex: none`、余白 14px 16px 10px): 左「キャラを選ぶ」/ "Choose character"(16px 太字)、右「閉じる」/ "Close"(13px、`var(--hd-sub)`、押すと閉じる)
- 属性の絞り込み(`flex: none`、7列の等幅グリッド、間隔 4px、左右 16px、下 10px)
  - 「すべて」/ "All" と、`ELEMENT_ORDER` の6属性。各ボタン 高さ 32px、角丸 16px、12px、改行しない
  - 属性ボタンは名前の前に 8px の丸(その属性の `accent`)
  - 選択中は背景 `var(--hd-fg)`・文字 `var(--hd-bg)`・太字。それ以外は背景 `var(--hd-raise)`・文字 `var(--hd-sub)`
  - 絞り込みの状態は CharacterPicker の中の state。開くたびに「すべて」に戻す
  - 「すべて」以外を選ぶと、その属性のキャラだけを出す。element が表にないキャラ(`'none'`)は「すべて」のときだけ出る
  - EN 表示でボタンに収まらないときは文字を 11px に下げてよい。それでも収まらないときは止めて質問する
- 一覧(`flex: 1; min-height: 0; overflow-y: auto`、3列の等幅グリッド、間隔 6px、左右と下 16px)
  - 先頭に「キャラなし(汎用の評価)」/ "No character (generic score)" のタイル。3列ぶち抜き、高さ 44px。帯の色は `ELEMENT_THEME.none.accent`。絞り込みが「すべて」のときだけ出す
  - キャラのタイル: 高さ 52px、背景 `var(--hd-raise)`、角丸 8px、`overflow: hidden`。2列のグリッド `4px minmax(0,1fr)`、間隔 8px、右の余白 6px
    - 左に 4px の帯(**そのキャラの属性の色**。今選んでいるキャラの色ではない)
    - 右に名前(13px、`line-height: 1.25`。長い名前は2行まで折り返してよい)と、その下に属性名(10px、`var(--hd-sub)`)
  - 今選んでいるキャラ(キャラなしを含む)のタイルは `box-shadow: inset 0 0 0 2px var(--hd-fg)`
  - タイルを押すと `onSelect(id)` → シートを閉じる。`onSelect` は今の `handleCharacterChange` を呼ぶ
- 名前は `ja ? c.name : (c.nameEn ?? c.name)`
- シートは `button` 要素で作り、`aria-pressed` を選択中のタイルと絞り込みボタンに付ける

### 6. 記録タブを暗い配色にする

背景はすでに `var(--hd-bg)`(暗い)なので、明るい色の直書きを置き換える。

`RecordsPanel.tsx`:

| 今 | 置き換え |
|---|---|
| `const ACCENT = '#0275fd'` | 使っている所を `var(--hd-accent)` に。ボタンの選択中の文字 `#fff` は `var(--hd-accent-ink)` |
| 外枠 `border-[#e5e7eb]` | 枠をやめて背景 `var(--hd-plate)` |
| 予測ボックスの背景 `#f7f7f7` | `var(--hd-raise)` |
| 未選択ボタンの `#f7f7f7` / `1px solid #e5e7eb` / `#707070` | 背景 `var(--hd-raise)` / `1px solid var(--hd-line)` / 文字 `var(--hd-sub)` |
| `text-[#222222]` | `var(--hd-fg)` |
| `text-[#9ca3af]` / `text-[#707070]` | `var(--hd-sub)` |
| `bg-white` + `border-[#e5e7eb]`(N個以内の小箱) | 背景 `var(--hd-plate)` + `1px solid var(--hd-line)` |
| 一覧の行の背景 `#fafafa` | `var(--hd-raise)` |
| 「記録を全削除」の枠 `#e5e7eb` | `var(--hd-line)`(hover の赤はそのまま) |

- ランクの色(`RANK_COLORS`)、運勢の色(`LUCK_LABEL`)、✕ の hover の赤はそのまま
- 文言の「上のフォームから記録してください」は「強化中タブで5個そろえて記録してください」/ "Fill all five on the Tuning tab and record it." に変える(フォームはもうないため)

`HomeClient.tsx` の記録タブ部分:

- 注意書き `text-[#9ca3af]` → `var(--hd-sub)`
- footer の `border-[#f3f4f6]` → `var(--hd-line)`、`text-[#9ca3af]` → `var(--hd-sub)`
- `NativeBanner` / `AdBanner` は変えない

## 受け入れ条件

- [ ] `npx tsc --noEmit` が通る
- [ ] `npm run build` が通る
- [ ] `grep -n "#A98BFF" src/app/HomeClient.tsx src/components/home/*.tsx` が0件
- [ ] `grep -n "#0275fd\|#f7f7f7\|#e5e7eb\|#222222\|#9ca3af" src/components/home/RecordsPanel.tsx` が0件
- [ ] `grep -n "charAt(0)" src/components/home/BuildBar.tsx` が0件(頭文字の丸を消した)
- [ ] 画面での確認(Claude Code がレビューで行う。実装担当は不要):
  - 390×844 と 375×667 で、強化中タブにスクロールが出ない。サブステを0→5個入れても入力欄の上端が動かない
  - 心(電導)で紫、景燃(焦熱)で橙、キャラなしで灰色になる
  - キャラのボタン → シートが開き、「焦熱」で絞るとタイルが焦熱だけになる。タイルを押すとシートが閉じ、キャラ名と色が変わる
  - COST の 3 を押すと、シートを開かずに COST が変わり、メイン行の左がハーモニー名になる
  - メイン行を押すと設定シートが開き、キャラと COST の項目がない
  - 広告の環境変数がなくても、ヘッダーの下に 50px の空きがある
  - EN 表示で上段・シートの文字がはみ出さない

## 対象外

- 広告ユニット(320×50)の発行と環境変数の差し替え(オーナーの作業)
- ヘッダーのメニュー(白いドロップダウン)の配色
- キャラの画像・アイコン
- 記録タブのレイアウトの作り直し(色だけ変える)
- `UpdateModal` など、ホーム以外から来る部品の配色

## 想定される落とし穴

- `CustomSelect` は `accentColor` に hex を連結している(`${accentColor}1a`)。`var(--hd-accent)` を渡すと CSS が壊れる。hex を渡すこと
- CSS 変数を inline style で渡すときの TypeScript の型(`React.CSSProperties` にキャストが要る)
- 設定シートからキャラを外しても、`handleCharacterChange` の処理(おすすめ音骸・ハーモニーへの切り替え、下書きのリセット)は変えない。CharacterPicker からも同じ関数を呼ぶ
- COST を上段で直接切り替えるようになるが、`cost` が変わったときの既存の `useEffect`(下書きのリセットなど)はそのまま動かす
- キャラ選択シートと設定シートが同時に開かないようにする(片方を開くときにもう片方を閉じる)
- `78dvh` は古いブラウザで効かない。`h-[78vh] [@supports(height:100dvh)]:h-[78dvh]` のように今の画面の高さと同じ書き方にする
- 広告枠は常に 50px 取るので、真ん中のエリアが案4より 50px 狭くなる。375×667 で 5枠目と予測の帯が重ならないか確かめる(見本 n5.html では、COST を上段に移し音骸名をメイン行にまとめたことで収まっている)
- 低い画面用の指定は今と同じ `[@media(max-height:700px)]:` の書き方にそろえる
