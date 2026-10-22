# シェア結果の動的OGP(/share ページと OG 画像)

## 背景

X シェアの本文に入る URL は固定の `https://wuwaechotools.com` なので、どの結果をシェアしても X のカードは同じ `og-image.png` になる。シェアした音骸のスコア・ランクがカードに出ないので、タイムラインで目に留まりにくい。

これを、**シェアする結果を URL に入れ、その URL の OG 画像に結果を描く**形に変える(オーナー決定 2026-10-22)。

- シェア URL: `/share?...`。開いた人にはその結果のカードと「自分も厳選する」ボタンを見せる。検索には出さない(noindex)
- OG 画像: `/api/og?...`(同じクエリ)を `next/og` の `ImageResponse` で描く
- 対象: ホーム(厳選サポーター)・ガチャ・ガチャの記録モーダルの3か所の X シェア

## 変更対象

作業は2段階に分ける。**段階1が通ってから段階2に進む。**

### 段階1(新規ファイルのみ)

- `src/lib/shareLink.ts` — 新規。結果 ⇔ クエリ文字列の変換(§1)
- `src/app/api/og/route.tsx` — 新規。OG 画像(§2)
- `src/app/share/page.tsx` — 新規。シェアページのサーバー側とメタデータ(§3)
- `src/app/share/ShareClient.tsx` — 新規。シェアページの表示(§3)

### 段階2(シェア処理の差し替え)

- `src/lib/imageGen.ts` — `buildShareText` に URL を渡せるようにする(§4)
- `src/app/HomeClient.tsx` — `handleShare` でシェア URL を使う(§4)
- `src/app/gacha/GachaClient.tsx` — `handleShare` でシェア URL を使う(§4)
- `src/components/SavedResultsModal.tsx` — `handleShare` でシェア URL を使う(§4)

### 触らないファイル

- `src/lib/scorer.ts` / `src/data/**` — 採点・データは変えない。読むだけ
- `src/app/layout.tsx` / `src/lib/seo.ts` — サイト共通のメタデータは変えない
- `src/app/robots.ts` / `src/app/sitemap.ts` — `/share` と `/api/og` は X のクローラーが読めないと困るので、robots で塞がない。sitemap にも載せない
- `src/lib/cardCanvas.ts` / `ResultCardVisual.tsx` — 保存画像・カード表示は変えない
- `package.json` / `next.config.ts` / `wrangler.jsonc` — 依存を足さない(`next/og` は Next.js に入っている。OpenNext Cloudflare は `@vercel/og` をビルド時にパッチして Workers で動かす)

## 仕様

### §1 `src/lib/shareLink.ts`(クライアント・サーバー両方から使う。`'use client'` を付けない、ブラウザ API を使わない)

クエリの形:

| キー | 中身 | 例 |
|---|---|---|
| `c` | コスト `4` / `3` / `1` | `c=4` |
| `e` | 音骸 ID(`ECHOES` の `id`)。不明なら省く | `e=...` |
| `m` | メインステのキー(`MAINSTAT_POOLS[cost]` の `key`) | `m=critRate` |
| `h` | ハーモニーセットの**キー**(`HARMONY_SETS` のキー名。日本語名ではない) | `h=LINGERING_TUNES` |
| `s` | サブステ。`<key>.<tier>` をカンマでつなぐ。並び順は入力順のまま。1〜5個 | `s=critRate.7,critDmg.5` |
| `ch` | キャラ ID(`CHARACTER_MAP` のキー)。キャラなしなら省く | `ch=...` |
| `lang` | `en` のときだけ付ける | `lang=en` |

関数:

```ts
export const SHARE_PATH = '/share';

/** シェア URL のクエリ(先頭の ? なし)を作る */
export function encodeShareQuery(
  echo: EchoState,
  opts: { charId?: string; locale: Locale },
): string | null;

/** 完全なシェア URL(https://wuwaechotools.com/share?...)を作る。作れないときは null */
export function buildShareUrl(
  echo: EchoState,
  opts: { charId?: string; locale: Locale },
): string | null;

export interface DecodedShare {
  echo: EchoState;
  build?: CharacterBuild;
  score: ScoreResult;
  locale: Locale;
}

/** クエリから結果を復元し、scoreEcho で採点し直す。不正なら null */
export function decodeShareQuery(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): DecodedShare | null;
```

- `encodeShareQuery`: `echo.activeHarmonySet`(日本語名)を `HARMONY_SETS` の値から逆引きしてキーにする。見つからない・サブステが0個のときは `null`
- `decodeShareQuery` の検証(ひとつでも外れたら `null`):
  - `c` が 4/3/1
  - `m` が `MAINSTAT_POOLS[c]` にある
  - `h` が `HARMONY_SETS` のキー
  - `s` が1〜5個、各 key が `SUBSTAT_MAP` にあり、tier が `0`〜`(values.length - 1)` の整数、key の重複なし
  - `ch` があるときは `CHARACTER_MAP` にある(なければ `null` ではなくキャラなし扱いにする)
  - `e` があるときは `ECHOES` にある(なければ省いた扱いにする)
- 復元する `EchoState`:
  - `substats`: `SUBSTAT_MAP` から HomeClient の `addSubstat` と同じ形で作る(`value = values[tier]`、`maxValue = values[values.length - 1]`)
  - `mainstat`: `MAINSTAT_POOLS[c]` の該当要素
  - `echoId` / `echoName` / `echoNameEn`: `e` があれば `ECHOES` の `id` / `name` / `nameEn`。なければ `echoId: ''`、`echoName` はセットの日本語名、`echoNameEn` は `HARMONY_SETS_EN[日本語名]`(HomeClient の `draftMeta` と同じ考え方)
  - `activeHarmonySet`: セットの日本語名
  - `level`: `substats.length * 5`、`totalCost`: すべて 0
- 点数は URL に載せず、**必ず `scoreEcho(echo, build)` で計算し直す**(URL を書き換えて点数を偽れないようにするため)

### §2 `src/app/api/og/route.tsx`

- `GET(request)` で `new URL(request.url).searchParams` を `decodeShareQuery` に渡す
- `null` のとき: `/og-image.png`(`lang=en` なら `/og-image-en.png`)へ 302 リダイレクト
- 画像: 1200×630、`ImageResponse`(`import { ImageResponse } from 'next/og'`)
- レイアウト(Satori は flex のみ。grid 不可。すべての div に `display: 'flex'` を付ける):
  - 背景: `#101318`(サイトのダーク地。`layout.tsx` の themeColor)。枠や罫線は `#2A2F3A` 程度
  - 左側(幅 約 420px): ランク(`RANK_COLORS[rank]` の色、大きく 160px 前後)、その下に点数(`<score> pt`、数字は Chakra Petch)
  - 右側: 1行目に音骸名(EN は `echoNameEn`)、2行目にメインステ名とセット名(小さく、補足色 `#9AA3B2` 程度)、その下にサブステを1行ずつ(ラベル左・値右。ラベルは EN なら `SUBSTAT_LABEL_EN`)。`score.breakdown` の `category` で値の色を `CATEGORY_COLORS` にする
  - キャラがあるとき: 右上に「<キャラ名>用」/ "for <nameEn>"
  - 下端: サイト名「音骸シミュレーター」/ "Echo Simulator" と `wuwaechotools.com`
- フォント: 実行時に Google Fonts から取る(バンドルに入れない。500KB 制限のため)
  - `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=<画像に出す文字をすべてつないだもの>` と `family=Chakra+Petch:wght@700&text=...` を fetch し、CSS の `src: url(...) format('truetype' か 'opentype')` から URL を取り出してフォント本体を fetch → `ArrayBuffer` を `fonts` に渡す
  - フォント取得に失敗したら、302 で静的な OG 画像に逃がす(豆腐文字の画像を返さない)
- レスポンスヘッダ: `Cache-Control: public, max-age=86400, s-maxage=86400`
- 予期しない例外は `try/catch` で受けて静的 OG 画像へ 302

### §3 `/share` ページ

`src/app/share/page.tsx`(サーバーコンポーネント。他ページと同じく `searchParams: Promise<...>` を受ける):

- `generateMetadata`:
  - `decodeShareQuery` が成功したら、`buildMetadata({ path: '/share', locale, ja, en, robotsIndex: false })` の結果に対して `openGraph.images` と `twitter.images` を `${SITE_URL}/api/og?<encodeShareQuery と同じクエリ>` (width 1200 / height 630)に差し替える。`openGraph.url` と `alternates.canonical` は `${SITE_URL}/share?<クエリ>` にする
  - タイトル: ja「【<rank>】スコア<score>点の<キャラ名>用<音骸名> | 音骸シミュレーター」(キャラなしは「用」以下のキャラ部分を省く)/ en「[<rank>] <score>pts <echoNameEn> for <nameEn> | Echo Simulator」
  - description: ja「鳴潮の音骸シミュレーターで出た結果です。自分の音骸のスコアも計算できます。」/ en "A result from the Wuthering Waves Echo Simulator. Score your own echoes too."
  - 失敗したら、普通の `buildMetadata`(静的 OG 画像、`robotsIndex: false`)
- ページ本体: `<LocaleProvider initialLocale={resolveExplicitLocale(sp)}>` で `ShareClient` を包む。復元結果を props で渡す。`EchoState` と `ScoreResult` はプレーンなオブジェクトなのでそのまま渡せる。`CharacterBuild` は渡さず、キャラ名(`name` / `nameEn`)だけ渡す

`src/app/share/ShareClient.tsx`(`'use client'`):

- `SiteHeader` / `SiteFooter` を他ページと同じ置き方で使う(`src/app/about/AboutClient.tsx` を見本にする)
- 中央に `ResultCardVisual`(`echo`, `score`)。キャラがあればカードの上に「<キャラ名>用」/ "for <name>"
- その下に主ボタン「自分も厳選する」/ "Try it yourself" → `withLang('/', locale)` へのリンク。見た目はサイトの主ボタンと同じ(`var(--hd-accent)` 塗り、文字 `var(--hd-accent-ink)`)
- 副リンク「ガチャで遊ぶ」/ "Try the gacha" → `withLang('/gacha', locale)`
- 復元に失敗したとき(props が null): 「結果を読み込めませんでした」/ "Couldn't load this result." と、主ボタンだけ出す
- 色は `DESIGN.md` の `--hd-*` トークンだけを使う(ライト/ダーク両対応)

### §4 シェア処理の差し替え(段階2)

- `buildShareText` の options に `url?: string` を足す。指定があれば本文の `SITE_URL` の行をその URL に置き換える。指定がなければ今と同じ
- 3か所の `handleShare` で `buildShareUrl(echo, { charId, locale })` を作り、`buildShareText(..., { locale, charName, url: shareUrl ?? undefined })` に渡す
  - ホーム: `echo = buildDraftEcho(draftSubs)`、`charId = build?.id`
  - ガチャ: `charId = selectedCharId !== 'generic' ? selectedCharId : undefined`
  - 記録モーダル: `SavedResult` にはキャラ名しかない。`CHARACTERS` から `name === charName || nameEn === charName` で探して `id` を使う。見つからなければキャラなしで URL を作る(本文のキャラ名は今どおり `charName` を使う)
- `buildShareUrl` が `null` なら今と同じ固定 URL の本文になる

## 受け入れ条件

各段階の終わりに、次をすべて満たす。

- [ ] `npx tsc --noEmit` が通る(Windows は `npx.cmd tsc --noEmit`)
- [ ] `npm run build` が通る(Windows は `npm.cmd run build`)
- [ ] 段階1: `npm run dev` で `/api/og?c=4&m=critRate&h=LINGERING_TUNES&s=critDmg.7,atkPercent.5,energyRegen.3,critRate.6,resonanceLibDmg.4` を開くと 1200×630 の PNG が返り、ランク・点数・サブステ5行が日本語で描かれている(豆腐文字なし)。`&lang=en` を付けると英語になる
- [ ] 段階1: `/api/og?c=9` のような不正なクエリは `/og-image.png` への 302 になる
- [ ] 段階1: 上と同じクエリで `/share?...` を開くと、カードと「自分も厳選する」ボタンが出る。HTML の `<meta property="og:image">` が `https://wuwaechotools.com/api/og?...` になっていて、`<meta name="robots">` に `noindex` が入っている
- [ ] 段階1: `/share`(クエリなし)を開くと「結果を読み込めませんでした」が出て、og:image は静的画像のまま
- [ ] 段階2: ホームでサブステを5個入れて「X でシェア」を押すと、開いた intent の本文に `https://wuwaechotools.com/share?...` が入っている。その URL を dev サーバーのホストに置き換えて開くと、ホームと同じ点数・ランクが出る
- [ ] 段階2: ガチャ・記録モーダルからのシェアでも同じく `/share?...` が入る

## 対象外

- ガイド・キャラDB・ニュースなど各ページ用の OG 画像
- シェア URL の短縮(短縮 URL サービスや KV への保存)
- 保存画像(`generateResultCard`)のデザイン変更
- Web Share API での画像付き共有
- 武器を考慮した採点(今の `scoreEcho(echo, build)` のまま)

## 想定される落とし穴

- **点数のずれ**: URL には点数を入れず再計算するので、将来採点式を変えると、昔のシェア URL の点数が本文の点数と変わる。これは許容する(採点式は常に最新を出す)
- **ホームの音骸未選択**: ホームのドラフトは音骸を選ばずにセットだけ選ぶことがある(`echoId` が空や不明)。このとき `e` を省き、名前はセット名で描く
- **Satori の制約**: `display: grid`、`box-shadow` の一部、CSS 変数(`var(--...)`)は使えない。OG 画像の色は固定値で書く。子要素が複数ある div には必ず `display: 'flex'` が要る(ないと実行時エラー)
- **フォントの text サブセット**: `text=` には画像に出す文字をすべて入れる(数字・記号・`%`・`pt`・`.` も)。漏れた文字は描かれない。`encodeURIComponent` で渡す
- **Cloudflare Workers**: `ImageResponse` は Edge 用の実装が OpenNext のパッチで動く想定。`export const runtime = 'edge'` は付けない(OpenNext Cloudflare は Node.js ランタイムで動かす)。`npm run build` が通っても Workers 上の動作は未確認なので、レビュー時に `npm run preview` で確かめる
- **searchParams の配列**: 同じキーが2回来ると配列になる。`decodeShareQuery` は配列なら先頭を使う
- **ハーモニーセットの逆引き**: `HARMONY_SETS` の日本語名が重複していないことを前提にする。重複があれば最初のキーを使う
- **記録モーダルの古いデータ**: 以前の記録の `charName` は保存時のロケールの名前なので、`name` と `nameEn` の両方で探す
