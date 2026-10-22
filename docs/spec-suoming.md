# 仕様書: 鎖暝（サメイ / Suoming）の追加

作業ブランチ: `bigsunny522/feat-add-suoming-character`（現在のチェックアウト。main にはマージしない）

## 1. 背景

2026-10-22、Ver3.7後半で★5共鳴者「鎖暝（サメイ）」が実装された。
厳選サポーターのキャラ選択・スコア計算に登録する。心・景燃・清宵と同じく最初から **v2（運用バリアント方式）** で登録する。
Ver3.7後半での新音骸・新ハーモニーは確認できなかった（推奨構成はすべて登録済みの音骸・セットで組める）ため、`echoes.ts` は触らない。

### 1-1. 調査結果（出典つき、2026-10-22 時点）

| 項目 | 値 | 出典 |
|---|---|---|
| 属性 / 武器種 | 電導 / 迅刀 | Game8, GameWith, prydwen |
| 役割 | 心編成のサブアタッカー（同奏で電導ダメバフ）が基本。単体のメインアタッカー運用も可能 | Game8, GameWith, prydwen（Unison / DPS の2計算） |
| Lv90 基礎ステータス | **出典なし**（prydwen「Stats data not available」、Game8・GameWith にも記載なし）→ 暫定値 HP 10300 / 攻撃力 462 / 防御力 1112 | 同じ★5攻撃力型の心・緋雪・清宵と同じテンプレート。prydwen の推奨 HP14500+ / DEF1100+ が心と同じで矛盾しない |
| 固有（小ステ）合計 | クリ率 +8% / 攻撃力 +12% | prydwen, GameWith |
| モチーフ武器 | 沈冥 / Unspoken Rue、迅刀、Lv90 基礎攻撃 587、サブステ クリ率 24.3% | Game8, GameWith（数値が一致）、prydwen（英名） |
| 推奨ハーモニー | 銜夢照世の心（5セット）が両運用の基本。サブ運用の低投資時は月を窺う軽雲も可 | prydwen, GameWith, Game8 |
| メイン音骸 | サブ運用: 息絶えの亡霊 / メイン運用: 響き渡る共鳴・天演溯心 / 軽雲時: 無情のサギ | prydwen, Game8, GameWith |
| 推奨メインステ | COST4: クリ率/クリダメ、COST3: 電導ダメ（2枠目は電導ダメ ≥ 攻撃%）、COST1: 攻撃% | prydwen, Game8, GameWith |
| サブステ優先 | 共鳴効率(必要分) > クリ率 = クリダメ > 攻撃% > 通常攻撃ダメ% > 攻撃力(実数) | prydwen（Game8 も通常攻撃ダメを★4に挙げる） |
| 目標値 | クリ率 65〜80% / クリダメ 260〜280% / 共鳴効率 100〜115%（上端は心＋ショアキーパー編成のサブ運用。メイン運用は共鳴効率不要）。GameWith は 120%前後 | prydwen, GameWith |
| ダメージ内訳 (S0, Unison=サブ運用) | Basic 400,508 / Heavy 0 / Skill 0 / Liberation 120,582 / Intro 0 / Outro 0 / Echo 13,768 | prydwen Calculations タブ（心・ショアキーパーのバフ込み、8.47秒ローテ） |
| ダメージ内訳 (S0, DPS=メイン運用) | Basic 1,604,398 / Heavy 0 / Skill 0 / Liberation 142,871 / Intro 0 / Outro 0 / Echo 69,031 | prydwen Calculations タブ（リンネイ・モーニエのバフ込み、13.68秒ローテ） |

### 1-2. バリアントを2つにする理由と、セットによる振り分け

心のときと違い、2運用で攻撃タイプ配分（サブ basic 0.769 / lib 0.231、メイン basic 0.918 / lib 0.082）と共鳴効率の目標が違うので、`sub` と `main` の2バリアントを登録する。

`pickVariant` は装着セットで運用を選ぶため、同じセットを両方の recommended に置けない（`characters.ts` 冒頭の規約2）。銜夢照世の心は両運用で使うが、prydwen が「DPS では断然これ、Unison では S0R1 で軽雲と同等」としているので、次のように振り分ける:

- `sub`（variants[0]）: recommended `[SET.MOONLIT]`
- `main`（variants[1]）: recommended `[SET.SWORN_VIGIL]`

結果として、銜夢照世の心を付けたサブ運用の鎖暝はメイン運用の重みで採点される。どちらの運用も通常攻撃主体・クリ主体なので、差は通常攻撃ダメ%と共鳴解放ダメ%の比重、共鳴効率の重みに限られる。これは受け入れる。
未知のセットのときは variants[0] の `sub` になる（Game8・GameWith が基本役割をサブアタッカーとしているため、規約3に従う）。

## 2. 変更対象

触るファイルは次の4つだけ。

### 2-1. `src/data/characters.ts`

`CHARACTERS` 配列の `// ── 5★ キャラクター（実装降順）` の直後、`hsin` エントリの **前** に追加する（5★は実装降順のため先頭）。`SET` 定数は既存の `SET.MOONLIT` と `SET.SWORN_VIGIL` を使うので追加しない。

```ts
  {
    id: 'suoming', name: '鎖暝', nameEn: 'Suoming', element: '電導', weapon: '迅刀',
    role: 'サブアタッカー/メインアタッカー',
    roleTemplate: 'SubDPS',
    scalingStat: 'atk',
    // 要検証: Lv90基礎ステータスは2026/10/22時点で prydwen・Game8・GameWith のいずれにも
    // 掲載がなく、同じ★5攻撃力型の心・緋雪・清宵と同じ値を暫定で入れている。
    baseStats90: { atk: 462, hp: 10300, def: 1112 },
    motifWeaponId: 'suoming',
    // v2: 2026/10/22実装。攻撃タイプ別ダメージ配分は prydwen.gg の Calculations タブにある
    // S0火力シミュレーションの内訳から算出（Unison=心・ショアキーパー編成、DPS=単体アタッカー）。
    // typeShares は Basic/Heavy/Skill/Liberation の実ダメージ内訳を再正規化した値
    // （Intro/Outro/Echo は対応する攻撃タイプ別ダメ%サブステが存在しないため除外）。
    // 銜夢照世の心は両運用で使うが、同じセットを両バリアントの recommended に置けないため
    // main 側に置き、sub 側は月を窺う軽雲で判定する（docs/spec-suoming.md 1-2）。
    // selfAtkBuffPercent は固有スキル(小ステ)の攻撃力+12%。
    variants: [
      {
        id: 'sub',
        role: 'sub',
        label: 'サブアタッカー運用',
        harmonySets: { recommended: [SET.MOONLIT], acceptable: [] },
        mainstat: {
          cost4: { recommended: ['critRate', 'critDmg'], acceptable: ['atkPercent'] },
          cost3: { recommended: ['ElectroDmg'],           acceptable: ['atkPercent'] },
          cost1: { recommended: ['atkPercent'],           acceptable: [] },
        },
        erRequirement: 1.20,
        damageProfile: {
          typeShares: { basic: 0.769, heavy: 0, skill: 0, lib: 0.231 },
          selfAtkBuffPercent: 0.12,
          baselineCritRate: 0.70,
          baselineCritDmg: 2.70,
        },
      },
      {
        id: 'main',
        role: 'main',
        label: 'メインアタッカー運用',
        harmonySets: { recommended: [SET.SWORN_VIGIL], acceptable: [] },
        mainstat: {
          cost4: { recommended: ['critRate', 'critDmg'], acceptable: ['atkPercent'] },
          cost3: { recommended: ['ElectroDmg'],           acceptable: ['atkPercent'] },
          cost1: { recommended: ['atkPercent'],           acceptable: [] },
        },
        erRequirement: 1.15,
        damageProfile: {
          typeShares: { basic: 0.918, heavy: 0, skill: 0, lib: 0.082 },
          selfAtkBuffPercent: 0.12,
          baselineCritRate: 0.70,
          baselineCritDmg: 2.70,
        },
      },
    ],
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'atkPercent' },
        { key: 'basicAttackDmg' },
      ],
      preferred:   [{ key: 'energyRegen' }],
      acceptable:  [{ key: 'atkFlat' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'], acceptable: ['atkPercent'] },
      cost3: { recommended: ['ElectroDmg'],           acceptable: ['atkPercent'] },
      cost1: { recommended: ['atkPercent'],           acceptable: [] },
    },
    harmonySets: { recommended: [SET.SWORN_VIGIL], acceptable: [SET.MOONLIT] },
  },

```

数値の根拠（検算用）:

- sub: 合計 = 400,508 + 120,582 = 521,090 → basic 0.7686 / lib 0.2314 → 0.769 / 0.231（合計 1.000）
- main: 合計 = 1,604,398 + 142,871 = 1,747,269 → basic 0.9182 / lib 0.0818 → 0.918 / 0.082（合計 1.000）
- baselineCritRate 0.70 は目標 65〜80% の下寄り（心・清宵と同じ扱い）、baselineCritDmg 2.70 は目標 260〜280% の中央値
- erRequirement: sub 1.20 は GameWith の「120%前後」と prydwen の上端 115% の間で GameWith 寄り、main 1.15 は prydwen が「不要だが1ロール分の保険は可」としているため、このリポジトリで使っている最小値 1.15 にそろえる

### 2-2. `src/data/weapons.ts`

`MOTIF_WEAPONS` の先頭（`hsin` の前）に追加:

```ts
  suoming: {
    id: 'suoming',
    name: '沈冥',
    nameEn: 'Unspoken Rue',
    class: '迅刀',
    baseAtk90: 587,
    substatKey: 'critRate',
    substatValue90: 24.3,
    sourceConfidence: 'medium',
  },
```

`sourceConfidence: 'medium'` にする理由: Game8 と GameWith の2件で数値が一致しているが、prydwen にはステータスが未掲載のため。

### 2-3. `src/data/updates.ts`

`UPDATES` 配列の先頭（`id: '2026-10-03'` の前）に追加:

```ts
  {
    id: '2026-10-22',
    date: '2026-10-22',
    title: { ja: '鎖暝のビルドデータを追加', en: 'Added Build Data for Suoming' },
    items: [
      {
        ja: '鎖暝を追加しました',
        en: 'Added Suoming',
      },
    ],
    link: {
      href: '/chardb',
      label: { ja: 'キャラ別ビルドデータを見る', en: 'View the Build Data' },
    },
  },
```

### 2-4. `src/data/rankThresholds.ts`

手で編集しない。`npm run gen:thresholds`（Windows では `npm.cmd run gen:thresholds`）で再生成した結果をそのまま変更に含める。

### 触らないファイル

- `src/data/echoes.ts` — 新しい音骸・セットはない
- `src/data/charLabels.ts` — role の `'サブアタッカー/メインアタッカー'` は既存キーのため追加不要
- `src/lib/**`, `src/types/**`, `scripts/**`, コンポーネント類・ページ類すべて
- リポジトリ直下の未追跡ファイル — 触らない

## 3. 受け入れ条件

1. `npx tsc --noEmit` がエラー 0 で終了する
2. `npm run gen:thresholds` が終了コード 0 で終了し、`git grep -c "suoming" src/data/rankThresholds.ts` が 1 以上
3. `npm run build` が成功する
4. `git status --short` で変更（M）になっているのが次の4ファイルだけ: `src/data/characters.ts`, `src/data/weapons.ts`, `src/data/updates.ts`, `src/data/rankThresholds.ts`
5. `git grep -n "id: 'suoming'" src/data/characters.ts src/data/weapons.ts` がそれぞれ1件ずつヒットする
6. `characters.ts` 内で `suoming` エントリが `hsin` エントリより前にある
7. `rankThresholds.ts` の差分のうち `suoming` 以外のキャラの値が変わっている場合、その理由を報告に書く

（Windows の PowerShell では `npm.cmd` / `npx.cmd` に読み替える）

## 4. 対象外

- Lv90 基礎ステータスの確定値への差し替え（出典が出てから別件）
- モチーフ武器のパッシブ効果（チーム電導ダメバフ・自己電導ダメバフ）のスコア反映
- 協調攻撃（終奏の雷紋）ダメージの typeShares への反映
- 心の推奨ハーモニー・推奨パーティの更新
- 凸（S1〜S6）ごとのバリアント分け
- 銜夢照世の心を付けたサブ運用を sub と判定する仕組み（`pickVariant` の変更）
- main へのマージ、push、コミット

## 5. 想定される落とし穴

- **並び順**: 5★は実装降順。`hsin` の後ろに追加しない
- **規約2（セット重複禁止）**: `SET.SWORN_VIGIL` を `sub` の recommended / acceptable に入れない。入れると main が選ばれなくなる
- **COST3 メインステのキー**: 電導ダメは `'ElectroDmg'`。`'electroDmg'` と書かない
- **サブステのキー**: 通常攻撃ダメは `'basicAttackDmg'`（`src/types/echo.ts` の `SubstatKey`）
- **id の一意性**: `suoming` は保存データに使われるため、後から変えない前提で付ける
- **Windows のエンコーディング**: 日本語を含むファイルなので、PowerShell の `Set-Content` / `Out-File` で書き戻すと文字化けする。apply_patch で編集すること
