<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 役割分担

設計とレビューは Claude Code、実装と修正は実装担当が担当する(`~/.claude/CLAUDE.md` のとおり)。設計の内容は `docs/spec-<機能名>.md` で受け渡す。仕様書にない判断が要るときは、実装で決めずに止めて聞く。

## 確認コマンド

実装を終えたら、次をすべて実行して通すこと(2026-09-25 に両方通ることを確認済み)。Windows の PowerShell では `npm.cmd` / `npx.cmd` を使う。

```
npx.cmd tsc --noEmit
npm.cmd run build
```

## 守ること

- コミットはしない(レビュー後に Claude Code がコミットする)
- ファイルは UTF-8 のまま保つ。ソース編集は `apply_patch` を優先し、PowerShell のテキスト入出力で書き戻さない
