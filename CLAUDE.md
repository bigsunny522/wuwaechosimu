@AGENTS.md

## このリポジトリでの役割

グローバル設定(`~/.claude/CLAUDE.md`)の役割分担のとおり、**設計とレビューを担当し、実装は実装担当に渡す。** 質問への回答や読み取りだけの調査は Claude Code が直接行う。

Claude Code が直接編集してよいもの:

- `docs/**`(仕様書)、`DESIGN.md`
- `AGENTS.md` / `CLAUDE.md` / `.claude/**` などの設定
- 1〜2行で済む自明な修正

実装担当に渡すもの:

- `src/**` / `scripts/**` のコード変更
- `package.json` / `next.config.ts` / `wrangler.jsonc` / `tsconfig.json` などビルド構成の変更

## 実装担当への依頼

手順・モデル段階・既知のトラブルは、グローバルの `impl-handoff` スキルに従う(現在の実装担当は `~/.claude/CLAUDE.md` に書いてある)。このファイルにはこのリポジトリ固有の値だけを書く。

- 作業ディレクトリ: `G:\blog\wuwa-echo-sim`
- 完了条件: `AGENTS.md` の「確認コマンド」
- 依頼文に足すこと: Next.js のコードを変える前に `node_modules/next/dist/docs/` の該当ガイドを読む
- 実装担当が動いている間は、同じチェックアウトを Claude Code が編集しない

`scripts/invoke-codex.ps1`(`codex exec` の無人実行)は、オーナーから動きが見えないので使わない。
