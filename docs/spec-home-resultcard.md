# ホーム: 5個入れたあとの結果を 3D カードにする

## 背景

サブステを5個入れてスコアが出たあとの画面に、2つの問題がある。

1. スコアが二重に出ている。真ん中の `ForecastStrip` に「最終スコア / 確定」、下のドックに「スコア 53/100」がある
2. 結果の画面に見せ場がなく、X でシェアしたくなる作りになっていない。オーナーは投稿が広まってほしいので、シェアのボタンを目立たせたい

オーナーが選んだ形(2026-10-21): 結果をトレーディングカードにする。表にサブステ5個とスコア、裏にスコア分布と「強化の道のり」のグラフを載せ、左右にスワイプすると立体的に裏返る(ポケポケのようなカードゲームの手触り)。

モック(オーナー承認済み): `docs/mock-home-resultcard.html`(Claude Design の書式。`{{...}}` や `<sc-for>` はテンプレートの記法、数値はサンプル)。見た目の値はこのモックに合わせる。この仕様書とモックが食い違ったら仕様書を優先する。

## 変更対象

- 新規 `src/components/home/ResultCard.tsx`(カード本体と、その下の 表/裏 の切り替え行)
- `src/app/HomeClient.tsx`(5個そろったら SlotList と ForecastStrip の代わりに ResultCard を出す。道のりの計算)
- `src/components/home/InputDock.tsx`(5個そろったときのドックの中身)

触らないもの: `src/lib/**`、`src/data/**`、`src/components/home/ForecastStrip.tsx`・`SlotList.tsx`・`BuildBar.tsx`、`src/components/ScoreDistributionChart.tsx`、`src/app/gacha/**`

## 仕様

### 1. 真ん中のエリアの切り替え(HomeClient)

- `draftFinalScore` があるとき(5個そろったとき)
  - メインステータスの板(「変更 ›」のボタン)は今のまま残す
  - `SlotList` と `ForecastStrip` を出さず、代わりに `<ResultCard>` を出す
  - 記録の要約ボタン(「これまで N 個」)は今のまま(高さ 820px 以下では隠れる)
- 4個以下のときは今のまま。何も変えない
- ResultCard は真ん中のエリアの残りの高さいっぱいに広がる(`flex: 1; min-height: 0`)。**真ん中のエリアがスクロールしてはいけない**(下の受け入れ条件)

### 2. 道のり(HomeClient で計算して渡す)

- `draftFinalScore` があるときだけ、`useMemo` で `draftSubs` の先頭 1〜4 個それぞれについて `simulateCompletion(buildDraftEcho(draftSubs.slice(0, n)), build)` を求める(n = 1, 2, 3, 4)
- ResultCard に渡す形

  ```ts
  type JourneyStep = { expected: number; recommendation: AdvisorResult['recommendation'] };
  journey: { steps: JourneyStep[]; baseline: number } // steps は4つ。baseline は n=1 の baselineScore
  ```

  - `expected` は `Math.round(expectedScore)`。5つ目の点は `draftFinalScore.score`(ResultCard 側で足す)
- 4回のシミュレーションは5個目を入れたときに1度だけ走ればよい。`draftSubs` と `build` 以外で再計算しない

### 3. カード(ResultCard)

#### 寸法と面

- 幅は真ん中のエリアの幅いっぱい(左右 16px の余白は今の真ん中のエリアのまま)、高さはカードの行に残った高さいっぱい
- 表と裏の2面を重ねる。各面: `position: absolute; inset: 0; backface-visibility: hidden`(`-webkit-` も付ける)、角丸 18px、背景 `#1A1F28`、影 `0 0 0 1px {ランク色}55, 0 24px 48px rgba(0,0,0,.45)`、`overflow: hidden`。上端にランク色の 3px の帯
- 裏面は `transform: rotateY(180deg)`
- 外側の要素に `perspective: 1200px`、回る要素に `transform-style: preserve-3d`
- ランク色は `RANK_COLORS[rank]`(`src/lib/scorer.ts`)

#### 表面(上から)

1. 見出し(左右 16px、上 14px)
   - 1行目: 音骸名(`draftMeta.echoName`、EN は `echoNameEn`)15px 太字・`truncate`、右にキャラ名をアクセント色 12px で(キャラなしのときは出さない)
   - 2行目: `COST {cost} ・ メイン {メインステ名} {値}`(EN: `COST {cost} · Main {name} {value}`)12px `var(--hd-sub)`、値だけ `hd-num` で `var(--hd-fg)`
2. スコアの段(左右 16px)
   - 左にランクの文字 76px(`hd-num`、太字、ランク色、`text-shadow: 0 0 28px {ランク色}66`)
   - 右に2段: 点数 34px 太字 `hd-num` +「/ 100」15px `var(--hd-sub)`、その下に丸いラベル
   - ラベル: `topPercentile` があるときだけ。12px 太字、背景 `{ランク色}22`、文字ランク色、角丸 12px、余白 3px 9px
     - キャラあり: 「{キャラ名} の中で上位 {formatPct(topPercentile)}%」/ EN "Top {x}% for {name}"
     - キャラなしで `topPercentile` がある場合: 「上位 {x}%」/ "Top {x}%"
3. サブステ5行(左右 16px)。行の高さは残りの高さを5等分し、最大 38px・最小 28px。行と行の間に `1px solid #262C37` の線
   - 列: `30px minmax(0,1fr) auto 64px`、すき間 8px
   - `+5` `+10` … `+25`(11px `hd-num` `var(--hd-sub)`)
   - サブステ名 13px `truncate`(EN は `SUBSTAT_LABEL_EN`)
   - 値 15px 太字 `hd-num`(書式は SlotList と同じ)
   - 段階の目盛り8個(8列のグリッド、すき間 2px、高さ 8px、角丸 2px)。`i <= tier` の目盛りを塗る
   - 有効なサブステ(`getSubstatCategory(key, build)` が `recommended` か `preferred`。SlotList の `tierHot` と同じ判定)は、名前・値 `var(--hd-fg)`、塗った目盛り `var(--hd-accent)`
   - 有効でないものは、名前・値 `#7D8794`、塗った目盛り `#5A6372`。塗らない目盛りはどちらも `#2C333F`
   - 目盛りの要素に `role="img"` と `aria-label`「8段階中 {tier+1} 段目」/ "Tier {tier+1} of 8"
4. 下の帯(上に `1px solid #262C37`、余白 10px 16px 12px)
   - 左: レア度の ◆ をランク色 12px・字間 2px で。GOD 6個、S+ 5個、S 4個、A 3個、B 2個、C 1個、D は出さない
   - 右: 「‹ スワイプで裏面 ›」/ "‹ Swipe to flip ›" 11px `var(--hd-sub)`

#### 裏面(上から)

1. スコア分布(左右 16px、上 14px)
   - 見出し行: 「スコア分布」/ "Score distribution" 13px 太字、右に「{キャラ名}・この運用で強化したとき」/ "If built for {name}" 11px `var(--hd-sub)`
   - `distributionHistogram` があるとき: 棒グラフの SVG(幅いっぱい、`viewBox` 固定で横に伸ばす、高さ 104px。低い画面は 72px)
     - 棒は `distributionHistogram` の各要素(1本 = 2点ぶん。`ScoreDistributionChart` と同じ `BIN_WIDTH = 2`)。最大値で高さをそろえる
     - 棒の中心の点数が自分の点数以下の棒はランク色(不透明度 .85)、上の棒は `#3A4250`
     - 自分の点数の位置に縦の点線(`#ECEFF3`、1.5px、`3 3`)、下に軸の線 `#333B47`
     - 下の行: 左「0」、真ん中「この音骸は **上位 {x}%**(色の部分に勝ち)」/ "This echo is **top {x}%** (beats the colored part)"、右「100」。11px
   - ないとき(キャラなし): グラフの代わりに 「キャラを選ぶと、ほかの音骸と比べた位置が出ます」/ "Pick a character to see how this echo compares" を 12px `var(--hd-sub)` で中央に出す。見出しの右側の文字は出さない
2. 強化の道のり(左右 16px、上 16px、残りの高さ)
   - 見出し行: 「強化の道のり」/ "Enhancement journey" 13px 太字、右に「各段階の予想スコア」/ "Expected score at each step" 11px `var(--hd-sub)`
   - 物語のラベル(モックの丸いラベルと同じ見た目)。次のどちらかに当てはまるときだけ出す
     - 1〜4段目に `scrap` があり、ランクが B 以上:「破棄推奨から逆転」/ "Came back from Scrap"
     - 上に当てはまらず、最終点が 70 以上:「最初から好調のまま完走」/ "Strong from start to finish"
   - 折れ線の SVG(幅いっぱい、高さ 112px。低い画面は 80px)
     - 5点: 1〜4段目は `steps[i].expected`、5段目は最終点。縦の範囲は 25〜100 点(モックの `py`)
     - 平均の点線(`#333B47`、`2 4`)を `baseline` の高さに
     - 線はランク色 2.5px。1〜4段目の点は半径 3.5 で中を `#1A1F28`・枠ランク色、5段目は半径 5 で塗りつぶし
   - 下に5列の文字(中央ぞろえ): 段(`+5`…`+25`、11px)、点数(15px 太字 `hd-num`)、判定(10px 太字)
     - 判定の文字と色: great「強く継続」`#7FD6A4` / good「継続」`var(--hd-accent)` / borderline「様子見」`#F0B35A` / scrap「破棄推奨」`#FF8A8A`。EN: "Strong" / "Continue" / "Wait" / "Scrap"
     - 5列目は「{ランク} 確定」/ "{rank} final" をランク色で
   - 注記: 「点線 = この音骸の平均 {baseline}」/ "Dotted line = average for this echo ({baseline})" 10px `var(--hd-sub)`
3. 下の帯: 左に `wuwaechotools.com`(`hd-num` 11px)、右に「‹ スワイプで表面 ›」/ "‹ Swipe to flip back ›"

#### 光沢

- 両面のいちばん上に、押せない重ね(`pointer-events: none; mix-blend-mode: screen; background-size: 260% 260%`)を置く
- S・S+・GOD: 虹色の帯(モックの `foil` のグラデーションをそのまま)。それ以外: 白とランク色の細い帯(モックの非 foil のグラデーション)
- `background-position` は回転角で動かす: `tilt` を −90〜90 に丸めた角度として `{50 + tilt*0.9}% {50 + rx*3}%`

### 4. スワイプで裏返す

モックの `Component` の動きをそのまま React に移す。

- 状態: `base`(0 か 180 の倍数)、`dx` / `dy`(指の移動量)、`dragging`、`peek`、`touched`
- 回る要素の `transform`: `rotateX({rx}deg) rotateY({base + dx*0.55 + peek}deg)`。`rx = clamp(-dy*0.08, -12, 12)`
- `transition`: ドラッグ中は `none`、それ以外は `transform .65s cubic-bezier(.25,1.35,.45,1)`
- Pointer Events を使う。`pointerdown` で `setPointerCapture`、`pointermove` で `dx` / `dy` と横の速さ `vx`(px/ms)を更新、`pointerup` / `pointercancel` で離す
  - 離したとき: `|dx*0.55| > 70`、または `|vx| > 0.45` かつ `|dx*0.55| > 12` なら、動かした向きに `base ± 180`。それ以外は元に戻す。`dx` / `dy` は 0 に戻す
  - カードの要素に `touch-action: pan-y`(縦のスクロールは止めない。真ん中のエリアはスクロールしない前提なので、`none` でもよいが、ページ全体の縦スクロールを奪わないこと)
  - 最初に触った時点で `touched = true`
- 押したまま動かさずに離した(移動 6px 未満)ときは何もしない(タップで裏返さない)
- 表が見えているか裏かは `((base % 360) + 360) % 360 === 180` で判定する

### 5. 回ることに気づかせる

- 出てくるとき: カードの外側に「配られる」動き(モックの `.deal`。0.9s で `translateY(60px) rotateX(55deg) scale(.9)` から元の位置へ)
- ちらっとめくる: 表示から 1100ms 後と 7000ms 後に、まだ触っていなければ `peek = -38` にし、450ms 後に 0 に戻す。アンマウント時にタイマーを消す
- カードの下に高さ 34px の行(`flex: none`)
  - 左: 表/裏の切り替え(背景 `var(--hd-plate)`、角丸 17px、余白 3px)。ボタン2つ: 高さ 28px、最小幅 44px、角丸 14px、12px 太字、`aria-pressed`。選択中は背景 `var(--hd-fg)`・文字 `var(--hd-bg)`、それ以外は透明・`var(--hd-sub)`。文言「表」「裏」/ "Front" "Back"。押すとその面へ回す(`base ± 180`)、`touched = true`
  - 右: まだ触っていないときだけ「カードをスワイプすると裏返せます」/ "Swipe the card to flip it" 12px `var(--hd-sub)` と左右の矢印(モックの SVG、`nudge` の動き)
- 新しく5個そろうたびに(`draftFinalScore` が null から値に変わるたびに)表に戻し、`touched` を false に戻す。ResultCard を `key` で作り直してよい
- `prefers-reduced-motion: reduce` のとき: 配られる動き・ちらっとめくる・矢印の動き・回る `transition` をすべて止める(切り替えは一瞬で変わる)

### 6. ドック(InputDock、5個そろったとき)

上から次の3段にする。**ランク+スコアの行と「スコア分布を見る」とそのシートは消す**(スコアはカードにだけ出す)。

1. シェアと保存(すき間 8px)
   - 「X でシェア」/ "Share on X": 残りの幅いっぱい、高さ 54px、角丸 27px、背景 `#FFFFFF`、文字 `#0B0D11` 16px・太さ 900、左に X のロゴ(モックの SVG、18px)。押すと今の `onShare`
   - 保存: 54px の丸、背景 `var(--hd-raise)`、ダウンロードのアイコン(モックの SVG)、`aria-label`「画像を保存」/ "Save image"。押すと今の `onSaveImage`。`savingImage` の間は `disabled`、不透明度 .5
2. 「この結果を記録する」/ "Record this result": 高さ 46px、角丸 23px、背景 `var(--hd-raise)`、文字 `var(--hd-accent)` 14px 太字。押すと今の `onFinalize`(`canFinalize` が false のときの扱いは今のまま)
3. 高さ 24px の行に、「1つ戻す」/ "Undo last" と「やり直す」/ "Start over" を中央に並べる(13px `var(--hd-sub)`、すき間 24px)
   - 「1つ戻す」は5個目を消す(`removeSubstat(4)` と同じ)。新しい props `onUndoLast: () => void`
   - 「やり直す」は今の `onReset`
- 低い画面(`[@media(max-height:780px)]:`)では 54px → 48px、46px → 40px、24px → 20px
- **ドックの高さは変えない**(`h-[calc(248px...)]` / 低い画面 `216px`)。中身は上に寄せ、すき間は 8px
- 4個以下のときのドックは今のまま

## 受け入れ条件

- `npx tsc --noEmit` と `npm run build` が通る
- `grep -n "スコア分布を見る" src/components/home/InputDock.tsx` が0件
- 以下はブラウザで Claude Code が確かめる
  - 5個入れるとカードが配られ、1.1秒後に少しめくれる。触らないと7秒後にもう一度めくれる
  - 横にスワイプ(70px 相当以上、または速く払う)すると裏返り、少しだけ動かして離すと元に戻る。縦の動きでは裏返らない
  - 表/裏のボタンで面が切り替わり、`aria-pressed` が合っている。一度触るとヒントの文字が消える
  - 裏面の分布の上位%と、表面のラベルの上位%が同じ。キャラなしでは分布の代わりに案内の文が出る
  - 道のりの5点目がカードの点数と同じ
  - スコアの数字が画面に1か所(カード)にしか出ていない
  - 「X でシェア」「画像を保存」「この結果を記録する」「1つ戻す」「やり直す」が今と同じ処理をする(1つ戻すで4個に戻り、今の SlotList と ForecastStrip の画面になる)
  - 幅 390 と 375、高さ 844 / 780 / 720 / 667 で、JA と EN、キャラあり・なしのとき、カードの中身がはみ出さず、真ん中のエリアがスクロールせず、ドックの高さが変わらない
  - `prefers-reduced-motion: reduce` で動きが止まる

## 対象外

- 保存する画像(`src/lib/cardCanvas.ts`)をカードの見た目に合わせること(次の段階)
- 広告枠
- ガチャ(`/gacha`)や記録タブのカード
- `ForecastStrip` の「最終スコア / 確定」の分岐の削除(5個そろうと出なくなるので、今回は残す)
- 端末の傾き(ジャイロ)で光沢を動かすこと

## 想定される落とし穴

- **667px の高さで収まらない恐れ。** 表面は 見出し 約 40px + スコアの段 約 90px + 5行(最小 28px)+ 下の帯 約 36px。真ん中のエリアの残りが足りないときは、低い画面だけランクの文字を 56px・点数を 28px にしてよい。それでも収まらなければ、勝手にほかの寸法を変えずに止めて報告する
- `backface-visibility` は Safari で `-webkit-` が要る。裏面の文字が鏡写しで透けて見えないか確かめる
- `transform-style: preserve-3d` の子に `overflow: hidden` を付けると立体が平らになる。`overflow: hidden` は各面に付け、回る要素には付けない
- `simulateCompletion` は乱数を使うので、4個目まで画面に出ていた予想(ForecastStrip)と道のりの数字が少しずれることがある。仕様どおりなので合わせなくてよい
- `setPointerCapture` の後にボタン(表/裏)が押せなくなる、ということがないよう、切り替えの行はカードの要素の外に置く
- `draftMeta` の音骸名は COST 3 / 1 ではハーモニー名になる(メインステの板と同じ扱いでよい)
- `topPercentile` と `distributionHistogram` はキャラなしだと無い。どちらも無い前提で崩れないこと
