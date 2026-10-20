# ホーム(厳選サポーター)を1画面に収める作り直し

## 背景

ホーム(`/`、`src/app/HomeClient.tsx`)は、①対象ビルド・②記録フォーム・③進捗と予測を縦に積んでいる。困っている点は次の2つ。

- サブステを1個追加するたびに一覧が1行伸び、入力欄と追加ボタンが下へずれていく
- 入力・予測・記録が縦に長く、スマホではスクロールしないと全体が見えない

オーナーと決めたデザイン(案4)は、比較ページ https://claude.ai/artifact/RHyoE2VLTXeSNhHoXJL5Kk の「案4」で見られる。見本の HTML はリポジトリの `.impeccable/mocks/decision/n4.html` にある(git 管理外。寸法と色はこのファイルから取ってよい)。

考え方は次の3つ。

- 5枠を最初から5行分取っておく
- 入力欄を画面下に固定する
- 「強化中」タブはスマホ1画面(390×844)にスクロールなしで収める

## 変更対象

触るファイル:

- `src/app/HomeClient.tsx` — 画面の組み立てを作り直す。状態とロジック(useState / useMemo / useCallback、記録の保存、予測の計算)は今のものをそのまま使う
- `src/components/home/BuildBar.tsx`(新規) — キャラ・COST・音骸の1行チップと、それを押すと開く設定シート
- `src/components/home/SlotList.tsx`(新規) — メインステ行と5枠のサブステ行
- `src/components/home/ForecastStrip.tsx`(新規) — 予想スコア・判定・確率の1段
- `src/components/home/InputDock.tsx`(新規) — 画面下に固定する入力欄(5個そろったら記録ボタンに切り替わる)
- `src/components/home/RecordsPanel.tsx`(新規) — 「記録」タブの中身(今の③をそのまま移す)
- `src/app/globals.css` — ホーム専用のダーク配色の変数を足す(下の「配色」)。既存の変数は変えない

触らないファイル:

- `src/lib/**`、`src/data/**`、`src/types/**` — 採点・予測・保存の仕組みは変えない
- `src/components/EchoAdvisor.tsx`、`ScoreDistributionChart.tsx`、`CustomSelect.tsx`、広告コンポーネント — ほかの画面でも使っている。中身は変えずに呼び出すだけ
- `src/app/page.tsx`、`src/app/layout.tsx`、ほかのページ(`gacha` / `guide` など) — 今回は対象外

## 仕様

### 全体の組み立て(上から順に)

```
header        46px  タイトル | [強化中][記録 N] | EN | ≡
ad            AdBannerThin(環境変数が無ければ何も出ない)
build bar     [◯心 心][COST 4][音骸名]         ← 押すと設定シート
main stat     メイン クリティカルダメージ   44.0%  ← 押すと設定シート
slots         +5 / +10 / +15 / +20 / +25 の5行(常に5行)
forecast      [71 予想スコア] | 継続推奨 平均58 / A以上 S以上 S+以上
records peek  これまで 16個 / S以上 2個 / 記録を見る   (背の低い画面では隠す)
dock          画面下に固定。入力 or 結果+記録ボタン
```

- 「強化中」タブ: 外側を `height: 100dvh` の縦 flex にする。header・ad・build bar・dock は高さ固定(`flex: none`)。真ん中(main stat〜records peek)だけが縮む。ページ全体はスクロールしない
- 横幅は `max-width: 480px` で中央寄せにする。PC でも同じ1列のまま
- 「記録」タブ: 普通に縦スクロールするページにする。中身は今の③(ランク分布・しきい値の切り替え・実測/理論・運の判定・今後の予測・5/10/20/50個以内・履歴一覧・全削除)、注記の文(※ 予測はベイズ推定…)、`NativeBanner`、`AdBanner`、フッターの順
- タブの状態は `useState<'tune' | 'records'>`。URL には持たせない
- SEO のため、今の h1(「音骸スコア厳選サポーター」/ "Echo Score Farming Supporter")は残す。見た目は `sr-only` で隠す
- 今の導入文(h1 の下の説明)、「①②③」の見出し、結果が出たときの `scrollIntoView` は削除する

### header

- 左: `EchoIcon` と「厳選サポーター」/ "Selection Supporter"(今と同じ)
- タブ: 「強化中」/ "Tuning" と、「記録」/ "Records" に件数(`filteredEntries.length`)を添える
- EN/JA の切り替えボタンとメニューは今のまま
- 今のヘッダーにある「ガチャ / 厳選管理」の切り替えは削除する。代わりに、メニューの一番上に「ガチャ」/ "Gacha"(`/gacha` へのリンク)を足す
- 新着の青い点は今のまま。色は下のアクセント色に替える

### build bar と設定シート

- チップは横1行で、はみ出す分は隠す(折り返さない)
  - キャラ: 頭文字の丸 + 名前。キャラなしなら「汎用」/ "Generic"
  - COST: `COST {cost}`
  - 音骸: COST 4 なら音骸名、COST 3/1 ならハーモニーセット名
- 頭文字の丸は、名前の先頭1文字を入れた 28px の円にする(英語表示は nameEn の1文字目)。画像は使わない
- どのチップを押しても、またはメインステ行を押しても、同じ「設定シート」が下から開く
  - 中身は今の①(キャラ選択・COST ボタン・音骸かハーモニーの選択)、メインステの選択、COST 4 で複数セットを持つ音骸のときのセット選択
  - 選択には既存の `CustomSelect` を使う。ダーク配色に合わせる props(`textColor` / `background` / `borderColor` / `accentColor`)を渡す
- シートは画面下からの固定パネルにする。背景の暗幕を押すか「閉じる」/ "Done" を押すと閉じる
- 選択を変えたときに下書きをリセットする今の動き(`handleCharacterChange` と、cost の useEffect)は変えない

### slots(5枠)

- `MAX_SUBSTATS` 行を常に描く。行の高さは `minmax(28px, 44px)`。行の数が変わらないので、追加しても高さが変わらない
- 行 i(0〜4)のラベルは `+{(i+1)*5}`
- 埋まった行: サブステ名、数値+単位、`T{tier}`
  - `T{tier}` は今の画面と同じ0始まりで書く
  - `getSubstatCategory(key, build)` が recommended / preferred のときは、T の表記をアクセント色の太字にする
  - 行の右端に削除ボタン(✕、`aria-label`「削除」/ "Remove")を置き、`removeSubstat(i)` を呼ぶ
- 次に入る行(i === draftSubs.length): アクセント色の 2px の内枠。文字は「次はここ」/ "Next up"
- それより後の行: 1px の枠だけ。文字は「未解放」/ "Locked"
- 名前が長いときは1行で省略(`text-overflow: ellipsis`)。折り返さない

### forecast(予想の1段)

高さを固定した1段にする。中身は状態で切り替える。

- 0個のとき: 左に「—」、右に「サブステを1個入れると予測が出ます」/ "Add a substat to see the forecast"
- 1〜4個のとき(`draftAdvisor` がある)
  - 左: `Math.round(expectedScore)` を大きく、下に「予想スコア」/ "Est. score"
  - 右上: 判定ラベル(`EchoAdvisor` の RECOMMENDATION_STYLE と同じ文言: 強く継続推奨 / 継続推奨 / 様子見 / 破棄推奨)と「この音骸の平均 {Math.round(baselineScore)}」
  - 右下: A以上 / S以上 / S+以上 の3列。各列に `Math.round(prob*100)%` と、幅がその割合の細い棒(3px)
  - 英語のラベルは "A or higher" / "S or higher" / "S+"
- 5個そろったとき(`draftFinalScore` がある)
  - 左: `score` を大きく、下に「最終スコア」/ "Final score"
  - 右: ランク(`RANK_COLORS` の色)と「確定」/ "Final"
- 判定の色はダーク地で読める色にする: great `#7FD6A4`、good `#A98BFF`、borderline `#F0B35A`、scrap `#FF8A8A`

### records peek

- 「これまで {filteredEntries.length}個」「S以上 {S・S+・GOD の件数}個」「記録を見る」の1行。押すと「記録」タブに切り替わる
- `@media (max-height: 700px)` では隠す

### dock(画面下に固定する入力欄)

- 高さは `248px` に固定する(背の低い画面では `216px`)。さらに `env(safe-area-inset-bottom)` の分だけ下を空ける。どの状態でも高さを変えない
- 入力の状態(0〜4個)
  1. 見出し: 「+{(n+1)*5} に出たサブステ」/ "Substat at +{…}"。右端に「やり直す」/ "Start over"(1個以上あるときだけ。`resetDraft`)
  2. サブステの格子(5列 × 3行。13種類が収まる)
     - ボタンは高さ 34px(背の低い画面では 30px)、文字 11px、行の高さ 1.2。2行までの折り返しは許す
     - `SUBSTAT_DATA` の並び順のまま全部出す。押すたびに並びが変わらないよう、推奨順の並べ替えはしない
     - 推奨のサブステには小さな点を付ける(`availableSubstatOptions` の badge と同じ判定)
     - 使用済みは薄くして押せないようにする
     - 選択中はアクセント色で塗る。押すと `setPendingKey(key)` を呼ぶ
  3. 段階の行: 選んだサブステの `values` を左から並べる。atkFlat / defFlat は4つなので、列の数は `values.length` に合わせる
     - 各ボタンの上段は小さく `T{idx}`、下段は数値
     - **押すと、その段階でそのまま追加する**(`pendingTier` を決めて `addSubstat` と同じ処理をする)
     - サブステを選ぶ前は、同じ高さの空の行に「出た数値をタップすると追加」/ "Tap the value you rolled to add it" を出す
  - 「＋追加」ボタンは無くす
- 5個そろった状態
  - ランクの文字(大)、「スコア {score} / 100」を出す
  - `draftFinalScore.distributionCurve` があるときは「スコア分布を見る」/ "See score distribution" を出す。押すと、シートに `ScoreDistributionChart` を表示する
  - 下端に「この結果を記録する」/ "Record this result"(高さ 52px、全幅)。`canFinalize` が false のときは押せない。押すと `handleFinalize`
  - その下に「やり直す」/ "Start over"
  - 記録ボタンの下端は、入力の状態の段階ボタンの下端とそろえる(親指の位置を変えない)

### 配色とフォント(ホームだけ)

- `globals.css` に `.home-dark` の変数を足し、HomeClient の一番外側の要素に `className="home-dark"` を付ける。ほかのページには影響させない
  ```
  --hd-bg:#101318; --hd-plate:#181C23; --hd-raise:#222833; --hd-line:#333B47;
  --hd-fg:#ECEFF3; --hd-sub:#A3ADBA; --hd-accent:#A98BFF; --hd-accent-ink:#17102E;
  --hd-accent-soft:rgba(169,139,255,.16); --hd-go:#7FD6A4
  ```
- アクセント色の上の文字は必ず `--hd-accent-ink` にする(白文字は使わない)
- 本文は Noto Sans JP(400 / 700 / 900)、数値は Chakra Petch(500 / 600 / 700)に `font-variant-numeric: tabular-nums`。`next/font/google` で HomeClient から読み込み、CSS 変数としてホームの外側の要素にだけ付ける
- 角丸: 行・ボタン 8px、予想の段 10px、dock の上の角 16px、記録ボタンは全丸
- ホームを開いている間、iOS の引っぱりで白地が見えないよう `html` の背景も `--hd-bg` にする。`html:has(.home-dark)` を使う
- 各寸法は見本 `n4.html` に合わせる

## 受け入れ条件

- [ ] `npx tsc --noEmit` が通る
- [ ] `npm run build` が通る
- [ ] 変更が「変更対象」のファイルだけに収まっている(`git status` で確認)
- [ ] 以下は Claude Code がブラウザで確かめる(実装担当は確認不要)
  - 390×844 と 375×667 の「強化中」タブで、縦スクロールが出ない(`document.scrollingElement.scrollHeight <= innerHeight`)
  - サブステを0→5個入れていく間、dock の上端と記録ボタン・段階ボタンの位置が1px も動かない
  - `?lang=en` で文言がすべて英語になる
  - 記録 → 「記録」タブに件数と履歴が出る。リロードしても残る(localStorage)

## 対象外

- ライト配色への切り替えボタン(後で別の仕様にする)
- キャラの属性ごとに差し色を変えること
- 共有用の画像カード
- ほかのページ(gacha / guide / chardb など)のデザイン
- 採点・予測ロジックの変更

## 想定される落とし穴

- Next.js はこのリポジトリ専用の版。`next/font` などを使う前に `node_modules/next/dist/docs/` の該当ガイドを読む
- `CustomSelect` のドロップダウンはシートの中で開く。シートの `overflow` で切れないか、z-index が暗幕より上かを確認する
- `100dvh` が効かない古いブラウザ用に、先に `height: 100vh` を書いておく
- 広告(`AdBannerThin`)は環境変数が無いと何も描かない。あっても無くても1画面に収まるよう、真ん中の領域だけが縮む作りにする
- `AdBannerThin` は外側に `my-6` を持っている。ホームでは外側の div で余白を打ち消す(コンポーネントは変えない)
- `UpdateModal` はそのまま出す。ダーク地の上に白いモーダルでも構わない
- 文言はすべて `ja ? '…' : '…'` で日英を両方書く。片方だけにしない
