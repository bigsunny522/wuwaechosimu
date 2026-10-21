# デザインの決まり

サイト全体(ホーム・ガチャ・読み物ページ)で共通。経緯は `docs/spec-site-redesign.md`。

## 仕組み

- `<html data-mode="dark|light" data-element="fusion|glacio|electro|aero|spectro|havoc|none">`
- 値は localStorage に保存し、`layout.tsx` のスクリプトがハイドレーション前に反映する
  - `wuwa-site-mode` — ライト / ダーク。**既定はダーク**。OS の設定には追従しない
  - `wuwa-accent-element` — 属性色。ホームかガチャで選んだキャラの属性
  - `wuwa-last-char` — 最後に選んだキャラ(ホームとガチャで共有)
- コンポーネントからは `useSiteAppearance()`(`src/contexts/SiteAppearanceContext.tsx`)
- 色の値は `src/app/globals.css` の `--hd-*` と `src/components/home/elementTheme.ts`

## 色の変数

| 変数 | 用途 |
|---|---|
| `--hd-bg` / `--hd-plate` / `--hd-raise` | 地 / カード / カード内の一段上の面 |
| `--hd-line` | 罫線・枠 |
| `--hd-fg` / `--hd-sub` | 本文 / 補足 |
| `--hd-accent` | 属性色。**塗り・線・アイコン**に使う |
| `--hd-accent-text` | 属性色の**文字**(ライトでは濃い色になる) |
| `--hd-accent-ink` | 属性色の塗りの上の文字(`#11141A`) |
| `--hd-accent-soft` | 属性色の薄い面 |
| `--hd-go` / `--hd-borderline` / `--hd-scrap` | 判定の色(続行 / 微妙 / 撤退) |

- 文字に `--hd-accent` を使わない(ライトで読めない)。文字は `--hd-accent-text`
- 意味のある色(順位・ボーナス・注意など)は枠・アイコン・塗りに使い、地の上の文字には使わない。順位の文字だけは `rankTextColor(rank, mode)`
- `CustomSelect` など hex に透明度を連結する部品には `var(...)` を渡さず、`accentHex` を渡す

## 部品

- 共通ヘッダー: `src/components/site/SiteHeader.tsx`(メニューにライト/ダーク切り替え、現在のページは `aria-current`)
- カード: `.hd-card`(角丸 10px、ライトのときだけ枠)
- 数字: `.hd-num`(Chakra Petch、等幅数字)
- `.hd-force-dark`: ライトでも中だけダークのままにする(結果カード、保存画像の見た目)
- モーダル: 背景 `--hd-plate`、暗幕 `rgba(0,0,0,.6)`、角丸 16px

## 決まっている例外

- ファビコン(`src/app/icon.svg`)は青(`#0275fd`)のまま。属性色に追従できないため
- X シェア用の画像(`src/lib/cardCanvas.ts`)と保存画像の中身(`ResultCardVisual`)は白地の固定デザイン
