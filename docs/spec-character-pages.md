# キャラ別ページ(試作3キャラ)

## 背景

今のサイトで検索に載るのは約9ページだけで、キャラ別のデータは `/chardb` の1ページにまとまっている。そのため「心 音骸 スコア」「景燃 厳選 どこまで」のような、キャラ名を含む検索に引っかからない。

「おすすめ音骸」の解説は公式や大手の攻略サイトが強いので、同じ内容では勝てない。このサイトには、キャラ・運用ごとに50万回シミュレーションしたスコア分布(`src/data/rankThresholds.ts`)と、キャラ別のサブステ重み(`deriveSubstatWeights`)がある。これを使い、**「何点で厳選をやめてよいか」に数字で答えるページ**を作る。

今回は試作として3キャラだけ作る。

- `hsin`(心): 運用1つ
- `jingran`(景燃): 運用1つ
- `phoebe`(フィービー): 運用2つ(main / sub)。複数運用の表示を確かめるため

## 変更対象

触るファイル:

- `src/app/chardb/[id]/page.tsx`(新規) — サーバーコンポーネント。メタデータ・JSON-LD・本文を出す
- `src/app/chardb/[id]/CharacterDetailClient.tsx`(新規。必要なときだけ) — 言語切り替えなどクライアント側の処理が要る部分
- `src/components/CharDistributionChart.tsx`(新規) — `RankThresholds` を受け取ってヒストグラムを描く SVG。マウス操作は不要。サーバーで描けるなら `'use client'` は付けない
- `src/lib/characterPages.ts`(新規) — 試作キャラの一覧 `CHARACTER_PAGE_IDS = ['hsin', 'jingran', 'phoebe'] as const` と、ページ用データを組み立てる関数
- `src/app/sitemap.ts` — `CHARACTER_PAGE_IDS` の各ページを追加する
- `src/app/chardb/ChardbClient.tsx` — `CHARACTER_PAGE_IDS` に含まれるキャラのカードに「スコアの目安を見る →」のリンクを足す。それ以外は変えない
- `src/app/page.tsx` と `src/app/HomeClient.tsx` — `?char=<id>` でキャラを選んだ状態で開けるようにする(下の「仕様 5」)

触らないファイル:

- `src/data/characters.ts` / `src/data/rankThresholds.ts` / `src/lib/scorer.ts` / `src/lib/weaponScoring.ts` — データと採点ロジックは読むだけにする
- `scripts/**`、ビルド構成(`package.json` / `next.config.ts` / `wrangler.jsonc`)
- `src/components/ScoreDistributionChart.tsx` — 引数が `ScoreResult` 前提なので流用しない。新しい部品を作る

## 仕様

### 1. ルーティング

- `/chardb/[id]`。Next.js 16 では `params` が Promise になる。書く前に `node_modules/next/dist/docs/01-app/` の動的ルートと `generateStaticParams` のガイドを読むこと
- 言語切り替えで `searchParams` を読むため、このページは動的レンダリング(ビルドログの `ƒ`)になる。既存のページと同じなので、それでよい
- `CHARACTER_PAGE_IDS` に含まれない id は、ページ本体と `generateMetadata` の両方で `notFound()` を呼んで 404 にする。`generateStaticParams` / `dynamicParams` は使わなくてよい
- 言語は他のページと同じく `?lang=en` で切り替える(`resolveLocale` / `resolveExplicitLocale` / `LocaleProvider` を `src/app/chardb/page.tsx` と同じ形で使う)

### 2. メタデータ(`buildMetadata` を使う。`path` は `/chardb/<id>`)

- ja title: `{name}の音骸スコア目安・妥協ライン | 鳴潮 (Wuthering Waves)`
- ja description: `鳴潮の{name}の音骸は{S閾値}点で上位5%、{S+閾値}点で上位1%。50万回のシミュレーションから出したスコア分布・妥協ライン・サブステの価値を、キャラ専用の判定ツールと一緒に確認できます。`
- en title: `{nameEn} Echo Score Benchmarks & When to Stop Farming | Wuthering Waves`
- en description: `{nameEn} echoes: {S}+ pts is top 5%, {S+}+ pts is top 1%. Score distribution from 500,000 simulated drops, stop-farming thresholds, and substat values — with a character-specific echo checker.`
- 運用が複数あるキャラは、`variants[0]` の数値を使う
- JSON-LD はパンくず。`buildBreadcrumbJsonLd` は2階層しか出せないので、`src/lib/characterPages.ts` に3階層版(ホーム > キャラ別ビルドデータ > {name})を作る。`seo.ts` は触らない

### 3. 本文(上から順に)

運用が複数あるキャラは、2〜4 の各ブロックを運用ごとに並べる。見出しに運用名(`variant.label`。英語は既存の `localizeLabel` などで訳す)を付ける。

1. **見出しとリード**
   - h1: `{name}の音骸スコア目安` / `{nameEn} Echo Score Benchmarks`
   - リード: 「サブステだけをランダムに引いたとき(メインステ・ハーモニーは推奨で固定)のスコア分布を、50万回シミュレーションして出した数字です。」
   - 属性・武器・役割は、`ChardbClient.tsx` と同じラベル変換を使って表示する
2. **妥協ライン表**: ランクごとに「ランク / 必要スコア / 上位%」の行を出す
   - GOD(上位0.01%) / S+(1%) / S(5%) / A(15%) / B(35%) / C(65%)
   - 数値は `getRankThresholds(id, variant.id)` の値をそのまま使う
   - 表の下に、1行で目安を書く: 「{S閾値}点(S)を超えたら、厳選をやめて次の部位に移ってよい目安です。」
3. **スコア分布グラフ**: `CharDistributionChart`
   - 入力は `histogram`(幅2のビンが51個)
   - S・S+ の閾値の位置に縦線とラベルを引く
   - 色は既存の `ScoreDistributionChart` と同じ(`#93c5fd` / `#0275fd`)
4. **サブステの価値**: `deriveSubstatWeights(build, variant, weapon)` で重みを出す
   - weapon は `scorer.ts` と同じく `getMotifWeapon(build.motifWeaponId)` で引く
   - 最大値を100とした相対値で、重みが0より大きいサブステを降順に、横棒で並べる
   - 区分のラベル(推奨 / 優先 / 可)は、`scorer.ts` の `weightToCategory` と同じ境界(0.85 / 0.5 / 0.15)で付ける。`weightToCategory` は export されていないので、境界値を `characterPages.ts` に写し、コメントで出どころを書く
   - `totalMainStat` が null のキャラはこのブロックを出さない(試作の3キャラは null にならない想定)
5. **判定ツールへの導線**
   - 「{name}で音骸を判定する」ボタンを置き、`/?char=<id>`(英語なら `&lang=en`)へリンクする
   - ホームの側は、`?char=<id>` が有効な id ならそのキャラを選んだ状態で開く
     - `page.tsx` で searchParams から読み、`HomeClient` に `initialCharId` として渡す
     - 選択には、既存のキャラ変更の処理(`HomeClient.tsx` の 118 行目付近で `setSelectedCharId` を呼んでいる関数)を使う。推奨音骸・推奨セットの自動設定も同じように効かせるため
     - 無効な id は無視して、今まで通り `generic` で開く
6. **推奨ハーモニー・メインステ**: 既存のデータを表示する。見た目は `ChardbClient.tsx` のカードに合わせる
7. **関連リンク**: `/chardb` の一覧、`/score-formula`(スコアの計算方法)

広告(`AdBanner` / `NativeBanner`)は `/chardb` と同じ位置関係で、本文の途中に1つ、末尾に1つ置く。

### 4. sitemap

`CHARACTER_PAGE_IDS` の各ページを `changeFrequency: 'monthly'`、`priority: 0.6` で追加する。en の alternates も既存と同じ形で付ける。

## 受け入れ条件

- [ ] `npx tsc --noEmit` が通る
- [ ] `npm run build` が通る。ビルドのログのルート一覧に `/chardb/[id]` が出ている(`ƒ` の動的ルートでよい)
- [ ] `npm run dev` で次を確かめる
  - `/chardb/hsin` / `/chardb/jingran` / `/chardb/phoebe` が表示される。妥協ライン表の S と S+ の値が `rankThresholds.ts` の `s` / `sPlus` と一致している(例: `hsin:main` なら S=69、S+=80)
  - `/chardb/phoebe` では main と sub の2運用分のブロックが出る
  - `/chardb/lucy` は 404 になる
  - `?lang=en` を付けると本文と `<title>` が英語になる
  - `/?char=hsin` を開くと、ホームで心が選ばれた状態になる。`/?char=xxx` は今まで通り開く
  - `/chardb` の心・景燃・フィービーのカードにだけリンクが出る
  - `/sitemap.xml` に3ページが入っている
  - スマホ幅(375px)で横スクロールが出ない

## 対象外

- 残りのキャラのページ(試作を見てから決める)
- 期待周回数・素材の消費量の表示
- 動的OG画像(キャラ別のOGP画像)。今回は既存の og-image を使う
- 厳選難易度ランキングのページ
- `/en/...` のパスに変えること

## 想定される落とし穴

- `src/app/chardb/page.tsx` があるので、`src/app/chardb/[id]/page.tsx` を足しても衝突はしない。ただし `/chardb` のレイアウトを共有するファイルがあれば影響を確かめる
- `searchParams` を読むページは動的レンダリングになる(2026-10-20 に実装担当が確認)。静的生成は今回は狙わない
- `deriveSubstatWeights` の重みは「1ロール最大値あたり」の値で、スコアの点数そのものではない。画面では「相対的な価値」と書き、「◯点」とは書かない
- `HomeClient.tsx` は約870行ある。`initialCharId` の追加以外の部分を書き換えない
- 穂穂(suisui)の分布は形が特殊だが、今回の対象には入れない
