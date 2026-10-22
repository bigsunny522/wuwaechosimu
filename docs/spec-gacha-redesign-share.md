# ガチャ画面をサポーターと同じ見た目にし、保存画像を新デザインにする

## 背景

段階1〜3で、サイト全体を共通ヘッダー・ライト/ダーク・属性カラーにそろえた(`DESIGN.md`、`docs/spec-site-redesign.md`)。残っている問題は次の2つ。

1. **ガチャ画面(`/gacha`)の配置が古いまま。** 縦に長いページで、音骸選択・カード・下部固定バー・結果モーダルが別々に並んでいる。サポーター(`/`)は1画面に収まるアプリ型(上にキャラ/COST バー、中央に +5〜+25 の枠、+25 で 3D カード、下に操作ドック)になっており、2つの画面で操作感が違う。
2. **「画像を保存」の画像が古いデザイン。** `src/lib/cardCanvas.ts` は白地・水色グラデ・IBM Plex Mono の旧デザインのまま。画面の 3D カード(`src/components/home/ResultCard.tsx` の表面)と似ていない。また、サポーター(実際の厳選結果)とガチャ(シミュレーション)のどちらの画像か見分けられない。

オーナーの決定(2026-10-22):

- ガチャ: サポーターと同じ1画面のアプリ型。解説と広告はスクロールした下に置く
- 保存画像: 3D カードの表面をそのまま画像にする。暗い背景に暗いカード。ライトモードでも暗いまま
- 見分け: 上の帯にツール名(「厳選サポーター」/「ガチャシミュレーター」)を入れる。ガチャの画像には斜めの「SIMULATION」ラベルも付ける(実際の厳選結果と誤解されないように)

## 変更対象

触るファイル:

- `src/lib/cardCanvas.ts` — `renderCardToCanvas` を新デザインで書き直す(§2)
- `src/lib/imageGen.ts` — `generateResultCard` の引数を変える(§2.1)
- `src/app/HomeClient.tsx` — `generateResultCard` の呼び出しだけを新しい引数に合わせる(他は触らない)
- `src/components/SavedResultsModal.tsx` — `generateResultCard` の呼び出しを新しい引数に合わせる。見た目は変えない
- `src/components/ResultCard.tsx` — どこからも import されていない旧ファイル。削除する(削除前に `grep -rn "components/ResultCard'" src` で import がないことを確かめる。`components/home/ResultCard` と取り違えないこと)
- `src/app/gacha/GachaClient.tsx` — 画面の組み立てを書き直す(§1)
- `src/components/home/BuildBar.tsx` — 省略可能な props を足す(§1.3)
- `src/components/home/SlotList.tsx` — `onRemove` を省略可能にする(§1.4)
- `src/components/home/ForecastStrip.tsx` — 空のときの文言を差し替えられるようにする(§1.4)
- `src/components/EchoCard.tsx` / `src/components/EchoAdvisor.tsx` — §1 のあと、どこからも import されなくなったら削除する(`grep -rn` で確かめてから。まだ使われていれば残す)

触らないファイル:

- `src/lib/simulator.ts` / `src/lib/monteCarlo.ts` / `src/lib/scorer.ts` — 確率・スコア・助言の計算は変えない
- `src/data/**` — データは変えない
- `src/lib/imageGen.ts` の `buildShareText` — シェア文は変えない
- `src/components/home/ResultCard.tsx` / `InputDock.tsx` / `CharacterPicker.tsx` — そのまま使う。中身は変えない
- `src/app/globals.css` / `DESIGN.md` / ほかのページ — 今回は触らない(`DESIGN.md` はレビュー後に Claude Code が直す)

## 仕様

### 1. ガチャ画面(`GachaClient.tsx`)

#### 1.1 全体の骨組み

`HomeClient.tsx` の骨組みをそのまま真似る。

```
<div className="home-dark min-h-dvh">            ← HomeClient と同じ外枠
  <div className="mx-auto max-w-[480px] flex flex-col h-[100dvh] overflow-hidden">
    SiteHeader(maxWidthClass="max-w-[480px]")
    細い広告帯(HomeClient の HAS_THIN_AD / AdBannerThin と同じ 50px)
    BuildBar(キャラ / COST)
    中央(flex-1 min-h-0 overflow-y-auto):音骸プレート → 枠 or 3Dカード
    操作ドック(§1.5)
  </div>
  スクロールした下:ScoreDebugPanel(+25 のときだけ)/ HomeExplainer / AdBanner / SiteFooter
  CharacterPicker / BuildBar のシート / UpdateModal / BonusModal / SavedResultsModal / 再抽選シート
</div>
```

- `HAS_THIN_AD` の判定式は HomeClient と同じものを GachaClient にも書く(HomeClient から export して共有してもよいが、HomeClient の変更は `generateResultCard` の呼び出しだけにしたいので、GachaClient 側に同じ式を書く)
- SiteHeader の props は今のまま(`title={T.appTitle}`、`center={bonusTimeBadge}`、`extraMenuItems`、`hasNewUpdate`)に `maxWidthClass="max-w-[480px]"` を足す
- 自前の `<footer>`(`FOOTER_LINKS`)は削除し、HomeClient と同じ `<SiteFooter />` にする。`FOOTER_LINKS` が他で使われていなければ定数も消す

#### 1.2 削除するもの

- 画面上部のキャラ CustomSelect、COST のピルボタン、音骸/ハーモニーの CustomSelect(→ BuildBar とそのシートに移る)
- `EchoCard` の表示、PC 用の `EchoAdvisor`、PC 用の結果ボタン群(画像保存/Xシェア/保存)
- 下部の固定バー(`fixed bottom-0 inset-x-0 z-20` のブロック)とその中の compact `EchoAdvisor`
- スマホ用の結果ボトムシート(`showResultModal` とその state・効果)
- 空のときの説明文(`T.emptyText`)とボーナス宣伝カード(ボーナスの入口は §1.5 のドックに移る)

#### 1.3 BuildBar とキャラ選択

- `BuildBar` を使う。渡すもの:
  - `charName` / `charElement` / `accent` / `recommendFor`:HomeClient と同じ求め方(`useSiteAppearance()` の `accentHex`、キャラの属性名)
  - `cost` / `onCostChange={handleCostChange}`
  - `onOpenPicker`:`CharacterPicker` を開く。`CharacterPicker` の `onSelect` は今の `handleCharacterChange` を呼ぶ
  - `open` / `onClose`:BuildBar のシートの開閉(新しい state `buildSheetOpen`)
  - `selectedEchoId` / `onEchoChange` / `echoOptions` / `selectedHarmonySet` / `onHarmonyChange` / `harmonyOptions`:今の CustomSelect に渡していた値・ハンドラ・選択肢をそのまま使う(音骸やセットを変えたら今と同じく音骸をリセットする)
  - `cost4MultiSet={false}`、`multiSetOptions={[]}`、`draftHarmonySet=""`、`onDraftHarmonySetChange={() => {}}`
  - メインステータス:ボーナス中は今の「メインステ固定」の選択肢を `mainstatChoices` として渡し、`draftMainstatKey={lockedMainstatKey}`、`onMainstatChange={setLockedMainstatKey}`。ボーナス中でなければ `mainstatChoices={[]}`
- `BuildBar.tsx` に省略可能な props を2つ足す。HomeClient は渡さないので、今の表示は変わらない:
  - `mainstatTitle?: string` — メインステの小見出しを差し替える。ガチャのボーナス中は `ja ? 'メインステータスを固定(ボーナス)' : 'Lock main stat (bonus)'`
  - `sheetTitle?: string` — シートの見出し(今は「音骸とメインステータス」)を差し替える。ガチャでボーナス中でないときは `ja ? '音骸' : 'Echo'`(COST 1/3 は `ja ? 'ハーモニー' : 'Set'`)
  - `mainstatChoices` が空配列のときは、メインステの小見出し・グリッド・「★ は〜のおすすめ」をまとめて出さない

#### 1.4 中央

1. **音骸プレート**:HomeClient の「音骸/メイン」のボタンと同じ見た目のボタン。押すと BuildBar のシートを開く
   - 左:音骸名(COST 4)かハーモニーセット名(COST 1/3)。入手後は `echo.echoName` と `echo.activeHarmonySet`
   - 右:メインステ。入手前は、ボーナス中なら固定したメインステ名、そうでなければ `ja ? 'ランダム' : 'Random'`。入手後は `echo.mainstat` の名前と値
2. **+25 未満**:`SlotList` と `ForecastStrip` を HomeClient と同じ並びで出す
   - `SlotList`:入手前は `substats={[]}`、入手後は `substats={echo.substats}`。`build` は今のキャラのビルド。`onRemove` は渡さない
   - `SlotList.tsx` の `onRemove` を省略可能にし、渡されないときは ✕ ボタンを出さない
   - `ForecastStrip`:`advisor={advisorResult}`、`finalScore={null}`、`emptyHint` に入手前は `ja ? '「音骸を入手」から始めます' : 'Tap "Get Echo" to start'`、入手後 +0 のときは `ja ? '強化すると予測が出ます' : 'Upgrade to see the forecast'`
   - `ForecastStrip.tsx` に `emptyHint?: string` を足す。渡されたら、今の「サブステを1個入れると予測が出ます」の代わりにその文言を出す
3. **+25(`isMaxLevel`)**:`src/components/home/ResultCard.tsx` を HomeClient と同じ props で出す
   - `echoName` / `echoNameEn` / `cost` / `mainstat`:`echo` から
   - `charName`:今のキャラ名(汎用なら undefined。HomeClient と同じ扱い)
   - `finalScore={score}`、`subs={echo.substats}`、`build`
   - `journey`:HomeClient の journey と同じ計算を `echo.substats` で行う(n=1〜4 で `simulateCompletion({ ...echo, level: n * 5, substats: echo.substats.slice(0, n) }, build)`、n=1 の `baselineScore` を基準、最後に `score.totalScore`)。HomeClient の journey の型・組み立て方をそのまま写す
   - `useMemo` で echo が +25 になったときだけ計算する

#### 1.5 操作ドック

`InputDock` と同じ見た目の箱(`background: var(--hd-plate)`、上だけ角丸 16px、`padding 12px 16px`、下に `env(safe-area-inset-bottom)`)を GachaClient の中に書く(InputDock は入力専用なので使わない)。ボタンの見た目は InputDock のものを写す。

- **入手前**(`!echo`)
  - 主ボタン(幅いっぱい、高さ 54px、`var(--hd-accent)` 地に `var(--hd-accent-ink)` 文字、太字):`T.getEcho` → `handleStart`
  - その下に小さな文字ボタン(`var(--hd-sub)`、13px):ボーナス中でなければ `ja ? 'ボーナスタイム' : 'Bonus time'` → `openBonusModal`。ボーナス中なら残り時間(今の `bonusTimeBadge` と同じ値)を表示するだけ
- **強化中**(`echo && !isMaxLevel`)
  - 1行目:主ボタン `+${echo.level} → +${次のレベル}` → `handleUpgrade`(幅いっぱい、上と同じ見た目)。ボーナス中は右に副ボタン「一括MAX」(`var(--hd-raise)` 地、`var(--hd-accent-text)` 文字、高さ 54px、幅 96px)→ `handleMaxUpgrade`
  - 2行目:`T.untilMax` の文言(`var(--hd-sub)`、12px、中央)と、右に文字ボタン `ja ? 'リセット' : 'Reset'` → `handleReset`
- **+25**(`isMaxLevel`)
  - 1行目:InputDock の最終状態と同じ。白いピル「X でシェア」(→ 今の X シェア処理。`buildShareText` の呼び出しは今のまま)+ 丸い保存ボタン(→ §2 の画像保存。`downloading` 中は disabled)
  - 2行目:`var(--hd-raise)` 地のボタン(高さ 46px)`ja ? '次の音骸を入手' : 'Get next echo'` → `handleStart`
  - 3行目:小さな文字ボタンを中央に並べる(InputDock の「1つ戻す / やり直す」と同じ見た目)
    - 保存枠が残っていれば `ja ? \`結果を保存(残り${n})\` : \`Save result (${n} left)\`` → `handleSave`。残りがなければ `ja ? '保存枠+10' : '+10 slots'` → 今の保存枠追加の処理(今のモーダル内の CTA と同じ動き)
    - ボーナス中で再抽選がまだなら `ja ? '再抽選' : 'Reroll'` → 再抽選シートを開く
    - `ja ? 'サポーターで記録' : 'Track in Supporter'` → `/` へのリンク(今の `T.resultTrackerCTA` のリンク先と同じ)
- **再抽選シート**:今の再抽選パネル(枠を最大3つ選んで再抽選)の中身を、BuildBar のシートと同じ見た目のボトムシート(`fixed bottom-0`、`max-w-[480px]`、`var(--hd-plate)`、上角丸 16px、背景の暗幕)に移す。再抽選を実行したらシートを閉じる。ロジック(`handleReroll` / `toggleRerollIndex` / `MAX_REROLL`)は変えない

#### 1.6 変えないもの

確率・ボーナスの付与と時間・メインステ固定・再抽選・保存枠・履歴・アップデート通知の挙動。state とハンドラは再利用し、見た目と置き場所だけ変える。

### 2. 保存画像(`cardCanvas.ts` / `imageGen.ts`)

#### 2.1 関数の形

```ts
export interface ResultCardImageOptions {
  source: 'supporter' | 'gacha';
  maxedAt?: number;          // ガチャ:+25 になった時刻。帯の右に日付を出す
  charName?: string;         // カード右上に出すキャラ名
  build?: CharacterBuild;    // サブステの「おすすめ」判定(なければ全部ふつうの色)
}

// imageGen.ts
export async function generateResultCard(
  echo: EchoState, score: ScoreResult, locale: Locale, opts: ResultCardImageOptions,
): Promise<string>;

// cardCanvas.ts
export function renderCardToCanvas(
  echo: EchoState, score: ScoreResult, locale: Locale, opts: ResultCardImageOptions,
): HTMLCanvasElement;
```

呼び出し側:

| 呼び出し | `source` | ほかの値 |
|---|---|---|
| `HomeClient.tsx` の `handleSaveImage` | `'supporter'` | `charName`(汎用なら undefined)、`build` |
| `GachaClient.tsx` の保存ボタン | `'gacha'` | `maxedAt`、`charName`、`build` |
| `SavedResultsModal.tsx` | `'gacha'` | `maxedAt: result.maxedAt`、`charName: result.charName`(`build` は渡さない) |

`generateResultCard` は今と同じく `document.fonts.ready` を待ってから描き、PNG の dataURL を返す。描く前に、使うフォントを `document.fonts.load('700 16px "<実フォント名>"')` で読み込んでおく(§2.4)。

#### 2.2 寸法

- 論理サイズ 540 × 675(4:5)、`scale = 2` で書き出し → **1080 × 1350 px**
- 背景:全面 `#101318`(`--hd-bg` のダーク値)。カードの後ろに、ランク色の放射グラデーション(中心 = カード中央、半径 360、`${rank}26` → 透明)を重ねる

#### 2.3 レイアウト(上から)

1. **上の帯**(高さ 64、左右の余白 32)
   - 左:ツール名。`source` で決める
     - supporter:`ja ? '厳選サポーター' : 'Selection Supporter'`
     - gacha:`ja ? 'ガチャシミュレーター' : 'Gacha Simulator'`
     - 17px / 700、`#ECEFF3`。左に 4×18 の縦棒(属性カラーではなく、カードと揃えてランク色)
   - 右:`wuwaechotools.com`(Chakra Petch 13px / 600、`#A3ADBA`)
   - gacha のときだけ、ツール名の右に斜めのラベル「SIMULATION」:`skew(-14deg)` の平行四辺形(高さ 22、左右パディング 10)、地 `#F59E0B`、文字 `#11141A`、Chakra Petch 11px / 700、字間 0.2em
2. **カード**(x = 32、幅 476、高さ 560、角丸 18)— `src/components/home/ResultCard.tsx` の**表面**を写す。色・文字サイズは ResultCard の値を 476/340 ≒ 1.4 倍した目安で、バランスを見て調整してよい
   - 地 `#1A1F28`、外周 1px `${rank}55`、上辺に 3px のランク色の帯
   - GOD / S+ / S のときは ResultCard の `FOIL_BG` の色で虹色の斜めグラデーションを薄く(不透明度 0.10〜0.15)重ねる。それ以外はランク色の斜めグラデーションを薄く重ねる
   - ヘッダー:音骸名(ロケールで `echoName` / `echoNameEn`)21px / 700。右に `charName`(あれば)をランク色ではなく `#ECEFF3` の 15px / 700 で。下の行に `COST n ・ メイン <名前> <値>`(14px、`#A3ADBA`、値は Chakra Petch)
   - スコア:ランク文字(Chakra Petch 104px / 700、ランク色、同色の影 `blur 36`)。右にスコア(Chakra Petch 48px / 700、`#ECEFF3`)と ` / 100`(20px、`#A3ADBA`)。その下に「上位 X%」のピル(地 `${rank}22`、文字ランク色、角丸 14、15px / 700)。X% は ResultCard と同じ値の出し方を使う(`charName` があれば ResultCard と同じく「<キャラ> の中で上位 X%」)
   - サブステ 5 行:ResultCard の行と同じ構成(`+5`〜`+25` のラベル / 名前 / 値 / 8 個のピップ)。行の高さ 44、区切り線 `#262C37`。おすすめ(`getSubstatCategory` が recommended / preferred)の行は文字 `#ECEFF3`・ピップ ランク色、それ以外は文字 `#7D8794`・ピップ `#5A6372`、空のピップ `#2C333F`。ピップの点灯数は ResultCard と同じ求め方
   - 下の帯:左に `◆` を `RARITY_DOTS` の数だけランク色で。右に、`maxedAt` があれば `+25: YYYY/MM/DD`(en は `YYYY-MM-DD`)を `#A3ADBA` 13px で。なければ何も出さない(「スワイプで裏面」は出さない)
3. **下の余白**:カードの下、中央に小さく `#WuWaEchoTools`(Chakra Petch 12px、`#5A6372`)

- ResultCard の `FOIL_BG`・`RARITY_DOTS`・ピップの点灯数の求め方は、`cardCanvas.ts` に同じ値を書いてよい。`ResultCard.tsx` は触らない(export を足すのも避ける)
- ライト/ダークや `data-element` の設定に関係なく、上の固定色で描く

#### 2.4 フォント

- 和文:Noto Sans JP、数字・英字:Chakra Petch。canvas の `ctx.font` には CSS 変数が使えないので、`getComputedStyle(document.documentElement).getPropertyValue('--font-home-body')` / `'--font-home-num'` で実際の font-family 文字列を読んで使う(next/font が付ける名前は `__Noto_Sans_JP_xxxx` のように変わるため、文字列を直書きしない)
- 読めなかったときのフォールバック:`"Noto Sans JP", "Hiragino Sans", sans-serif` / `"Chakra Petch", monospace`
- 今の IBM Plex Mono の読み込み・指定は削除する

## 受け入れ条件

- [ ] `npx tsc --noEmit` が通る
- [ ] `npm run build` が通る
- [ ] `grep -n "showResultModal\|FOOTER_LINKS\|fixed bottom-0 inset-x-0" src/app/gacha/GachaClient.tsx` が何も出さない
- [ ] `grep -rn "IBM Plex\|IBM_Plex" src/lib/cardCanvas.ts` が何も出さない
- [ ] `grep -rn "generateResultCard(" src` のすべての呼び出しが4つ目の引数(`{ source: ... }`)を渡している
- [ ] `git diff --stat` に「変更対象」以外のファイルがない

Claude Code がブラウザで確かめること(実装担当はやらなくてよい):

- [ ] `/gacha` が幅 390 前後で 1 画面に収まり、ヘッダー・BuildBar・枠・ドックの並びが `/` と同じ見た目
- [ ] 入手 → 強化 → +25 で 3D カードが出て、スワイプで裏面(道のり)が見える
- [ ] ボーナス中:メインステ固定・一括MAX・再抽選シートが動く
- [ ] `/` と `/gacha` の保存画像が 1080×1350 で、帯のツール名が違い、ガチャにだけ SIMULATION ラベルがある
- [ ] ライトモードでも保存画像は暗いまま

## 対象外

- 確率・スコア・助言の計算の変更
- X シェア用のテキスト(`buildShareText`)の変更
- サポーター画面の見た目の変更(`generateResultCard` の呼び出し以外)
- 保存画像の裏面(分布・道のり)の画像化
- 履歴モーダル(`SavedResultsModal`)の見た目の変更
- `DESIGN.md` の更新(Claude Code がやる)

## 想定される落とし穴

- **`components/ResultCard.tsx` と `components/home/ResultCard.tsx` は別物。** 削除するのは前者だけ。ガチャのカードに使うのは後者
- **h-[100dvh] + overflow-hidden の中にスクロール領域を作る。** 中央は `flex-1 min-h-0 overflow-y-auto`。HomeClient の書き方をそのまま写す。下の解説・広告・フッターは、この 100dvh の箱の**外**(後ろ)に置き、ページ全体のスクロールで見せる(HomeClient の記録タブと同じ)
- **ボトムシートが3つになる**(BuildBar のシート、CharacterPicker、再抽選シート)。同時に開かないように、開くときに他を閉じる
- **canvas のフォント。** `document.fonts.ready` だけでは、まだ使われていない字形(太さ違い)が読み込まれていないことがある。§2.4 の `document.fonts.load` を描画前に呼ぶ
- **canvas の文字のはみ出し。** 音骸名・キャラ名・サブステ名は長いことがある(英語は特に)。`measureText` で幅を測り、収まらなければ文字を小さくするか末尾を「…」で切る
- `roundRect` は古い Safari にないことがある。今の `cardCanvas.ts` の自前の角丸関数 `rrect` を使う
- `AdvisorResult` の型を `EchoAdvisor.tsx` 経由で import しているなら、`EchoAdvisor` を消す前に `@/lib/monteCarlo` からの import に直す
- ボーナスの残り時間を出す `setInterval` は今のまま残す。ドックの表示もその state を読む
- `EchoCard` / `EchoAdvisor` を消す前に、他のページ(`src/app/**`)から import されていないか `grep -rn` で確かめる
