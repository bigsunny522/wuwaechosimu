# ホーム: 5個入れたあとに画像保存と X シェアを付ける

## 背景

サイトのメインは厳選サポーター(ホーム)になったが、サブステを5個入れてスコアが出たあとに、画像保存と X でのシェアができない。ガチャ(`/gacha`)には両方あるのに、ホームにだけない。オーナーから「おかしいので付けて」と指摘があった(2026-10-20)。

ガチャで使っている仕組みをそのまま使う。

- 画像: `generateResultCard(echo, score, locale)`(`src/lib/imageGen.ts`)が PNG の data URL を返す
- シェア文: `buildShareText(echo, score, { locale, charName })`(同じファイル)
- X: `https://twitter.com/intent/tweet?text=...` を新しいタブで開く(`src/app/gacha/GachaClient.tsx` 825行あたりと同じ)

## 変更対象

- `src/app/HomeClient.tsx`(保存・シェアの処理を作り、InputDock に渡す)
- `src/components/home/InputDock.tsx`(スコア表示の下にボタンを2つ置く)

触らないもの: `src/lib/imageGen.ts`、`src/lib/cardCanvas.ts`、`src/app/gacha/**`、ほかの `src/components/**`

## 仕様

### 1. InputDock(5個入れたあとの表示)

今の並び(上から): ランク+スコアの行 → 「スコア分布を見る」 → 「この結果を記録する」 → 「やり直す」

「スコア分布を見る」の行を次のように変える。

```
 C   スコア
     39 / 100
 スコア分布を見る            [ 画像を保存 ] [ 𝕏 でシェア ]
[          この結果を記録する          ]
               やり直す
```

- 1行に、左に「スコア分布を見る」(今のまま。`distributionCurve` がないときは出さない)、右寄せでボタン2つ(`ml-auto` などで右に寄せる)
- ボタン2つ
  - 高さ 32px、左右の余白 12px、角丸 16px、文字 12px・太字、`whitespace-nowrap`
  - 背景 `var(--hd-raise)`、文字 `var(--hd-fg)`。すき間 8px
  - 文言: 「画像を保存」/ "Save image"、「𝕏 でシェア」/ "Share on 𝕏"
  - 画像を作っている間は「画像を保存」を `disabled` にし、文言を「作成中…」/ "Saving…" にする
- **ドックの高さは変えない**(`h-[calc(248px...)]` / 低い画面 `216px`)。ボタンの行はスコアの行の下、今「スコア分布を見る」がある場所に入れる。低い画面で収まらなければ、勝手に寸法を変えずに止めて報告する
- 新しい props: `onSaveImage: () => void`、`onShare: () => void`、`savingImage: boolean`

### 2. HomeClient(処理)

- 保存: `draftFinalScore` があるときだけ動く
  1. `savingImage` を true にする
  2. `generateResultCard(buildDraftEcho(draftSubs), draftFinalScore, locale)` で data URL を作る
  3. `<a download>` でダウンロードさせる。ファイル名は `echo-${rank}-${score}pt.png`(ガチャと同じ)
  4. `finally` で `savingImage` を false に戻す
- シェア: `buildShareText(buildDraftEcho(draftSubs), draftFinalScore, { locale, charName })` を X の intent で開く
  - `charName` はキャラを選んでいるときだけ渡す(キャラなしのときは `undefined`。今ある `charName` 変数は「キャラなし」の文字が入るので、そのまま渡さない)。JA は `build.name`、EN は `build.nameEn ?? build.name`
  - `window.open(url, '_blank', 'noopener,noreferrer')`
- `locale` は今ある `useLocale()` のものを使う

## 受け入れ条件

- `npx tsc --noEmit` と `npm run build` が通る
- 以下はブラウザで Claude Code が確かめる
  - サブステを5個入れると「画像を保存」「𝕏 でシェア」が出る。4個以下では出ない
  - 「画像を保存」で `echo-<ランク>-<点>pt.png` がダウンロードされ、中身が今のスコアのカードになっている
  - 「𝕏 でシェア」で開く URL の本文に、ランク・点数・音骸名(キャラを選んでいればキャラ名)が入っている。EN 表示では英語の文になる
  - 幅 390 と 375、高さ 844 / 780 / 720 / 667 で、5個入れたときにドックの中身が重ならず、ドックの高さが変わらない。EN でもボタンの文字がはみ出さない

## 対象外

- カード画像のデザイン(`cardCanvas.ts`。今はガチャと同じ明るいカード)
- 記録タブの各記録からの保存・シェア
- 「この結果を記録する」を押したあとの流れ(次の仕様で扱う)
- Web Share API(スマホの共有シート)での画像付き共有

## 想定される落とし穴

- `buildShareText` の `charName` に「キャラなし」を渡すと「キャラなし用の〜」という文になる
- 低い画面(216px のドック)では、スコアの行(52px)+ボタンの行(32px)+記録ボタン(52px)+やり直す(13px)でほぼ余裕がない。重なりやはみ出しが出たら止めて報告する
- `generateResultCard` は `document.fonts.ready` を待つので、初回は少し時間がかかる。二度押しを防ぐため `disabled` にする
