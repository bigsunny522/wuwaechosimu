# 仕様書: ホーム（厳選サポーター）にアップデート通知ポップアップを表示する

作業ブランチ: `feat/home-update-modal`（作成済み。main にはマージしない）

## 1. 背景

`src/data/updates.ts` の `UPDATES[0]` を表示するアップデート通知ポップアップ（`src/components/UpdateModal.tsx`）は、`src/app/gacha/GachaClient.tsx` にしか組み込まれていない。
commit afc71ee（2026-08-22）で厳選サポーターがホーム `/` に、ガチャシミュレーターが `/gacha` に移動した。そのときポップアップはガチャ側に残ったままになり、以降ホームを開いてもお知らせのポップアップが出ない。2026-09-10 の「景燃のビルドデータを追加」も、ホームでは表示されていない。

ガチャ側と同じ仕組み（既読管理は localStorage の `lastSeenUpdate`）をホームにも組み込む。

## 2. 変更対象

触るファイルは `src/app/HomeClient.tsx` だけ。ガチャ側 `src/app/gacha/GachaClient.tsx` の既存実装（169〜175行、205〜206行、515〜527行、588〜598行、1121〜1129行）をそのまま移植する。

### 2-1. import の追加

```ts
import UpdateModal from '@/components/UpdateModal';
import { LATEST_UPDATE_ID } from '@/data/updates';
```

### 2-2. state の追加

`HomeClient` 関数の先頭付近（`const [menuOpen, setMenuOpen] = useState(false);` の直後）に追加する。

```ts
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [hasNewUpdate, setHasNewUpdate]       = useState(false);
```

### 2-3. マウント時の既読判定

state 宣言より後の位置に、ガチャ側と同じ `useEffect` を追加する。

```ts
  /* ── Update notification ────────────────────────────────────── */
  useEffect(() => {
    const seen = localStorage.getItem('lastSeenUpdate');
    if (seen !== LATEST_UPDATE_ID) {
      setUpdateModalOpen(true);
      setHasNewUpdate(true);
    }
  }, []);
```

### 2-4. ハンバーガーボタンに未読バッジ

`{/* Overflow menu */}` のボタン（現在 438〜444行）を変更する。

- `className` の先頭に `relative ` を追加する（バッジの absolute 配置の基準にするため）
- `<Menu size={16} />` の直後に、ガチャ側と同じバッジを追加する

```tsx
                {hasNewUpdate && (
                  <span
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white"
                    style={{ background: ACCENT }}
                  />
                )}
```

### 2-5. メニュー内「お知らせ」に未読ドット

`/news` へのリンク（現在 476〜483行）の `<span>{ja ? 'お知らせ' : "What's New"}</span>` の直後に追加する。

```tsx
                      {hasNewUpdate && (
                        <span className="ml-auto w-2 h-2 rounded-full" style={{ background: ACCENT }} />
                      )}
```

### 2-6. ポップアップの描画

コンポーネント末尾の `</footer>`（現在 835行）の直後、最上位の `</div>` の直前に追加する。

```tsx
      {updateModalOpen && (
        <UpdateModal
          onClose={() => {
            localStorage.setItem('lastSeenUpdate', LATEST_UPDATE_ID);
            setUpdateModalOpen(false);
            setHasNewUpdate(false);
          }}
        />
      )}
```

### 触らないファイル

- `src/app/gacha/GachaClient.tsx` — ガチャ側のポップアップはそのまま残す
- `src/components/UpdateModal.tsx`, `src/data/updates.ts`
- 上記以外のすべてのファイル。リポジトリ直下の未追跡ファイルと `CLAUDE.md` の既存変更も触らない

## 3. 受け入れ条件

1. `npx.cmd tsc --noEmit` がエラー 0 で終了する
2. `npm.cmd run build` が成功する
3. `git status --short` で変更（M）されている src 配下のファイルが `src/app/HomeClient.tsx` だけ
4. `git grep -n "lastSeenUpdate" src/app/HomeClient.tsx` が2件（getItem と setItem）ヒットする
5. 動作確認（レビュー側がブラウザで行う）:
   - localStorage の `lastSeenUpdate` を消して `/` を開くと、「景燃のビルドデータを追加」のポップアップが出る
   - ポップアップが出ている間、ハンバーガーボタンに青い未読バッジが付き、メニューの「お知らせ」に青いドットが付く
   - 閉じてから再読み込みすると、ポップアップもバッジも出ない
   - `/` で閉じた後に `/gacha` を開いてもポップアップが出ない（既読キーをガチャ側と共有しているため）

## 4. 対象外

- ポップアップの見た目・文言の変更
- 既読判定の共通フック化（`GachaClient.tsx` とのロジック共通化）。今回は重複を許容して移植のみ
- ほかのサブページ（`/chardb`, `/news` など）へのポップアップ追加
- localStorage が使えない環境向けの try/catch 追加（ガチャ側と挙動を揃えるため、今回は入れない）

## 5. 想定される落とし穴

- **ハイドレーション**: state の初期値は必ず `false` にし、localStorage の読み取りは `useEffect` の中だけで行う。`useState(() => localStorage...)` のように初期化時に読むと、SSR とクライアントで結果が変わってハイドレーションエラーになる
- **`relative` の付け忘れ**: ハンバーガーボタンに `relative` がないと、バッジが画面の別の位置に飛ぶ
- **変数名の衝突**: `HomeClient` にはすでに `ja`（boolean）と `locale` がある。`UpdateModal` は内部で `useLocale()` を呼ぶので props で locale を渡す必要はない
- **z-index**: `UpdateModal` は `z-50`。ヘッダーのメニュー（`z-40` / `z-50`）より後に描画されるよう、`</footer>` の後に置くこと
- **Next.js**: AGENTS.md の通り、このリポジトリの Next.js は学習データと異なる可能性がある。今回はクライアントコンポーネント内の React state 追加だけで、Next.js の API は増やさない
