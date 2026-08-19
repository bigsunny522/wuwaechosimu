# Adsterra広告視聴によるボーナスタイム解放 設計ドキュメント

作成日: 2026-08-19
ブランチ: `claude/google-adsense-review-response-wvvh1x`

## 背景

以前は「広告を視聴すると5分間のボーナスタイムが解放される」機能があったが、`f9e91a2`でAdSenseの不承認理由「コンテンツを含まない画面での広告」を除去するため全面撤去された(詳細: [2026-07-27-adsense-policy-compliance-design.md](2026-07-27-adsense-policy-compliance-design.md))。当時のリワード広告はGoogle Ad Managerのリワード広告ユニット向けに実装されていたが、ネットワークコードがプレースホルダのままコメントアウトされ、実際には一度も稼働していなかった。

現在AdSenseは審査を通過し稼働中。今回、収益化強化のため同機能を復活させたいという要望が出た。AdSense自体への影響を避けるため、新規に追加した**Adsterra**の広告のみを使う方針とする。

## 方針決定

ユーザーとの議論で以下を決定した。

- **広告ネットワーク**: Adsterraのみ使用。AdSense/Google Ad Managerは一切使わない(AdSenseの再審査リスクを避けるため)
- **視聴の実装方式**: Adsterraにはリワード動画の完了コールバックAPIが存在しないため、モーダル内にBanner広告を表示しつつ15秒の強制待機タイマーで代替する
- **適用範囲**: 既存の「無条件で即時付与」を廃止し、広告視聴(=15秒待機)を必須にする
- **待機時間**: 15秒
- **対象**: `BonusModal`は`bonus`(5分間のボーナスタイム)と`saves`(保存枠+10)の2種類で共用されており、両方に同じ広告ゲートを適用する

## 設計

### コンポーネント変更

#### `src/components/BonusModal.tsx`
- `secondsLeft`ステート(初期値15)を追加。`useEffect`で1秒ごとにデクリメントするタイマーを実装し、アンマウント時にクリア
- モーダル内、特典一覧カードの下・受け取るボタンの上に`<AdBanner />`(既存コンポーネントをそのまま再利用、新規Adsterra広告ユニット作成は不要)を表示
- 受け取るボタン:
  - `secondsLeft > 0`の間は`disabled`にし、ラベルを「あと{secondsLeft}秒」に変更
  - `secondsLeft === 0`になったら通常の「受け取る」ラベルに戻り、クリック可能になる
- `AdBanner`が環境変数未設定/配信不調で何も表示されなくても、タイマー自体は独立して進行させる(広告配信の失敗でユーザーをブロックしない)
- 視聴完了を検証する手段がないため、「視聴済み」を断定する文言は使わず「広告表示中…」という素直な待機表現にとどめる

#### `src/components/AdBanner.tsx`
変更なし。既存のprops無し・env変数駆動のコンポーネントをそのまま埋め込む。

### コピー変更(`src/data/translations.ts`)

| キー | JA(現行→変更後) | EN(現行→変更後) |
|---|---|---|
| `bonusNote` | 登録不要・完全無料。何度でも開放できます → 登録不要。短い広告(15秒)を見るだけで何度でも開放できます | No sign-up, completely free... → No sign-up. Just watch a short 15-second ad to unlock, as many times as you like. |

新規キー追加(JA/EN):
- `bonusAdWaiting`: 待機中のボタンラベル。プレースホルダ`{0}`に残り秒数を入れる。例: `あと{0}秒` / `{0}s left`
- `bonusAdShowing`: モーダル内の広告エリア上部に出す一言。例: `広告表示中` / `Ad displayed`

### `src/app/guide/GuideClient.tsx`
`bonusSection.sub`を更新:
- JA: `ヘッダーの「ボーナス」から誰でも無料で 5 分間の特典を解放できます` → `ヘッダーの「ボーナス」から短い広告(15秒)を見るだけで 5 分間の特典を解放できます`
- EN: `Unlock 5 minutes of extra features for free from "Bonus" in the header` → `Watch a short 15-second ad from "Bonus" in the header to unlock 5 minutes of extra features`

## フロー

1. ユーザーが「ボーナスタイムを開放する」等の既存ボタンを押す → `BonusModal`が開く(`bonusKind`は`bonus`または`saves`のまま変更なし)
2. モーダル表示と同時に15秒カウントダウン開始。同時にAdsterra Bannerが表示される(ベストエフォート)
3. 15秒経過で「受け取る」ボタンが有効化
4. クリック → 既存の`onGrantBonus()` → `onClose()`(ロジック変更なし)
5. 15秒経過前に✕で閉じた場合は付与されない。再度開いた場合はコンポーネント再マウントによりタイマーは15秒からやり直し(追加ロジック不要)

## 検証

- `next build`が通ること
- ローカルでモーダルを開き、ボタンが15秒間disabledであること、カウントダウン表示が更新されること、15秒後に有効化されクリックで特典が付与されることを確認
- 15秒未満で閉じた場合に特典が付与されないことを確認
- Adsterraの環境変数を外した状態でもタイマーが正常に動作し受け取れることを確認(広告配信非依存の担保)
- 日英切り替えで新規文言が正しく出ることを確認

## 対象外

- Adsterra側の新規広告ユニット作成(既存のBanner用キーを流用)
- 視聴完了の検証・不正防止(離脱してもタブを閉じなければ待てば解放されてしまうが、元々無条件付与だったため許容)
- AdSense/Google Ad Managerによるリワード広告の再実装
