# 仕様書: 景燃（ジンラン / Jingran）のキャラデータ追加

作業ブランチ: `feat/add-jingran-character`（作成済み。main にはマージしない）

## 1. 背景

2026-09-10、Ver3.6後半で★5共鳴者「景燃（ジンラン）」が実装された。厳選サポーターのキャラ選択・スコア計算に登録する。
基礎ステータス・モチーフ武器・ダメージ内訳が揃っているため、清宵と同じく最初から **v2（運用バリアント方式）** で登録する。

### 調査結果（出典つき）

| 項目 | 値 | 出典 |
|---|---|---|
| 属性 / 武器種 | 焦熱 / 長刃 | GameWith, prydwen |
| 役割 | 重撃ダメージ主体のメインアタッカー（シールド付与） | GameWith, prydwen |
| Lv90 基礎ステータス | HP 15375 / 攻撃力 312 / 防御力 0 | wikiwiki（防御0は prydwen の推奨ステータス「DEF: 0」とも一致） |
| モチーフ武器 | 幾千の導き / Thousandfold Deliverance、長刃、Lv90 基礎攻撃 412、サブステ HP 72.2% | wikiwiki（72.2%）、GameWith（72.0%）、prydwen（名称・72% HP） |
| 推奨ハーモニー | 冥夜を導く灯（代替: 山を轟かせる崩火＝厳選完了までのつなぎ） | GameWith, prydwen |
| 推奨メインステ | COST4: クリ率/クリダメ（モチーフ未所持時は HP%）、COST1: HP%（44111 構成のため COST3 なし） | GameWith, prydwen |
| サブステ優先 | 共鳴効率(必要分) > HP%(HP5万まで) > クリ率 = クリダメ > 重撃ダメ% > 攻撃% | prydwen（GameWith は「クリ率 ≒ クリダメ > HP%」） |
| 目標値 | HP 50000 / クリ率 50%+（セット・武器抜き）/ クリダメ 260〜340% / 共鳴効率 110〜120% | prydwen |
| ダメージ内訳 (S0 ソロ) | Basic 15,667 / Heavy 1,824,337 / Skill 78,044 / Liberation 0（Intro 27,754 / Outro 181,825 / Echo 43,624 は除外） | prydwen Calculations タブ |

### HP 参照でモデル化する理由

ダメージ倍率自体は攻撃力参照だが、キット内で HP 上限が攻撃力と焦熱ダメージに変換される。

- 固有スキル「陽変陰合」: HP上限1000ごとに攻撃力+36（上限1800）。2凸で HP1000ごとに +50（上限2500）
- 共鳴回路「幽冥帰り」: HP上限1000ごとに焦熱ダメージ+1.5%（上限75%）

素の攻撃力（312+412=724）に比べて HP からの変換分（最大1800〜2500）が支配的なので、`scalingStat: 'atk'` のままだと HP% の価値がほぼゼロになってしまう。どのガイドも HP% をクリ系のすぐ下に置いている。そこで、HP参照DPSの既存例であるカルテジア（`cartethia`）と同じく `scalingStat: 'hp'` ＋ `damageProfile` で登録する。
HP5万で頭打ちになる点は現行のスコア計算モデルでは表現できないため、コメントに明記するだけにとどめる（対象外を参照）。

## 2. 変更対象

触るファイルは次の4つだけ。

### 2-1. `src/data/characters.ts`

(a) `SET` 定数の末尾（`EVILS_PURGE` の次行）に追加:

```ts
  LAMP:        HS.LAMP_OF_NETHER_ROAD,
```

(b) `CHARACTERS` 配列の `// ── 5★ キャラクター（実装降順）` の直後、`qingxiao` エントリの **前** に以下を追加（5★は実装降順のため先頭）:

```ts
  {
    id: 'jingran', name: '景燃', nameEn: 'Jingran', element: '焦熱', weapon: '長刃',
    role: 'メインアタッカー（重撃重視）',
    roleTemplate: 'DPS',
    scalingStat: 'hp',
    baseStats90: { atk: 312, hp: 15375, def: 0 },
    motifWeaponId: 'jingran',
    // v2: 2026/9/10実装。基礎ステータスはwikiwiki、攻撃タイプ別ダメージ配分は prydwen.gg の
    // CalculationsタブにあるLv90ソロ火力シミュレーション(S0)の内訳から算出。
    // typeShares は Basic/Heavy/Skill/Liberation の実ダメージ内訳を再正規化した値
    // （Intro/Outro/Echoダメージは対応する攻撃タイプ別ダメ%サブステが存在しないため除外）。
    // ダメージ倍率は攻撃力参照だが、固有スキルでHP上限1000ごとに攻撃力+36(上限1800、
    // 2凸で+50/上限2500)、共鳴回路でHP上限1000ごとに焦熱ダメ+1.5%(上限75%)に変換されるため、
    // カルテジアと同じくHP参照(scalingStat: 'hp')としてモデル化する。
    // 注意: HP50000で変換バフが頭打ちになる（それ以上のHP%は無価値）点は
    // 現行モデルでは表現できず、HP%を常に一定の価値で評価している。
    // selfAtkBuffPercent は既存スケールステ%（ここではHP%）の概算:
    // 共鳴回路のHP+12% ＋ 冥夜を導く灯2セットのHP+10% = 0.22。
    variants: [
      {
        id: 'main',
        role: 'main',
        label: 'メインアタッカー運用',
        harmonySets: { recommended: [SET.LAMP], acceptable: [SET.MOLTEN] },
        mainstat: {
          cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['hpPercent'] },
          cost3: { recommended: ['FusionDmg', 'hpPercent'], acceptable: [] },
          cost1: { recommended: ['hpPercent'],              acceptable: ['atkPercent'] },
        },
        erRequirement: 1.15,
        damageProfile: {
          typeShares: { basic: 0.008, heavy: 0.951, skill: 0.041, lib: 0 },
          selfAtkBuffPercent: 0.22,
          baselineCritRate: 0.70,
          baselineCritDmg: 3.00,
        },
      },
    ],
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'hpPercent' },
      ],
      preferred:   [{ key: 'energyRegen' }, { key: 'heavyAttackDmg' }],
      acceptable:  [{ key: 'atkPercent' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'],   acceptable: ['hpPercent'] },
      cost3: { recommended: ['FusionDmg', 'hpPercent'], acceptable: [] },
      cost1: { recommended: ['hpPercent'],              acceptable: ['atkPercent'] },
    },
    harmonySets: { recommended: [SET.LAMP], acceptable: [SET.MOLTEN] },
  },

```

typeShares の算出根拠（検算用）: 合計 = 15,667 + 1,824,337 + 78,044 + 0 = 1,918,048
→ basic 0.0082 / heavy 0.9511 / skill 0.0407 / lib 0 → 小数3桁に丸めて 0.008 / 0.951 / 0.041 / 0（合計 1.000）。

### 2-2. `src/data/weapons.ts`

`MOTIF_WEAPONS` の先頭（`qingxiao` の前）に追加:

```ts
  jingran: {
    id: 'jingran',
    name: '幾千の導き',
    nameEn: 'Thousandfold Deliverance',
    class: '長刃',
    baseAtk90: 412,
    substatKey: 'hpPercent',
    substatValue90: 72.2,
    sourceConfidence: 'low',
  },
```

`sourceConfidence: 'low'` にする理由: 実装当日で、prydwen に「Stats data not available」と表示されており、数値の一次ソース確認ができていないため。

### 2-3. `src/data/updates.ts`

`UPDATES` 配列の先頭（`id: '2026-08-21'` の前）に追加:

```ts
  {
    id: '2026-09-10',
    date: '2026-09-10',
    title: { ja: '景燃のビルドデータを追加', en: 'Added Build Data for Jingran' },
    items: [
      {
        ja: '景燃を追加しました',
        en: 'Added Jingran',
      },
    ],
    link: {
      href: '/chardb',
      label: { ja: 'キャラ別ビルドデータを見る', en: 'View the Build Data' },
    },
  },
```

### 2-4. `src/data/rankThresholds.ts`

手で編集しない。`npm.cmd run gen:thresholds` で再生成した結果をそのままコミット対象にする。

### 触らないファイル

- `src/data/charLabels.ts` — role の `'メインアタッカー（重撃重視）'` は既存キー（27行目）のため追加不要
- `src/data/echoes.ts` — `LAMP_OF_NETHER_ROAD` / `MOLTEN_RIFT` は登録済み
- `src/lib/**`, `src/types/**`, `scripts/**`, コンポーネント類すべて
- リポジトリ直下の未追跡ファイル（`.planning/`, `DESIGN.md`, `*.csv`, `echo_sets_mapping*.json`, `public/echo.af` など）— add もコミットもしない

## 3. 受け入れ条件

Windows PowerShell で以下がすべて成立すること。

1. `npx.cmd tsc --noEmit` がエラー 0 で終了する
2. `npm.cmd run gen:thresholds` が終了コード 0 で終了し、`src/data/rankThresholds.ts` に `jingran` のキーが含まれる（`git grep -c "jingran" src/data/rankThresholds.ts` が 1 以上）
3. `npm.cmd run build` が成功する
4. `git diff --stat main...HEAD`（コミット後）または `git status --short` で変更されているのが次の5ファイルだけ: `src/data/characters.ts`, `src/data/weapons.ts`, `src/data/updates.ts`, `src/data/rankThresholds.ts`, `docs/spec-jingran.md`（本仕様書）
5. `git grep -n "id: 'jingran'" src/data/characters.ts src/data/weapons.ts` がそれぞれ1件ずつヒットする
6. `characters.ts` 内で `jingran` エントリが `qingxiao` エントリより前にある
7. `rankThresholds.ts` の差分のうち `jingran` 以外のキャラの値が変わっている場合、その理由（生成スクリプトが全キャラ共通の分布を使う等）を報告に書く

## 4. 対象外

- HP 50000 で変換バフが頭打ちになる閾値型の挙動のモデル化（`weaponScoring.ts` の拡張が必要なため別件）
- 攻撃力参照とHP参照を併用する複合スケーリングの型拡張
- 景燃と同時実装の新音骸の追加（実装有無を未確認。判明したら別コミットで `echoes.ts` に追加）
- 凸（S1〜S6）ごとのバリアント分け。S0 基準の1バリアントのみ
- モチーフ武器のパッシブ効果（クリ率・クリダメ・防御無視）のスコア反映
- main へのマージ、push

## 5. 想定される落とし穴

- **`def: 0`**: `weaponScoring.ts:143` は `baseStats90[scalingStat]`（ここでは hp）しか参照しないため、0 除算は起きない。ほかで `baseStats90.def` を分母に使う箇所を追加しないこと
- **`SET.LAMP` の追加漏れ**: `SET` 定数に追加せずに `SET.LAMP` を参照すると、`as const` オブジェクトのため tsc でエラーになる
- **並び順**: 5★は実装降順。`qingxiao` の後ろに追加すると、清宵の件（commit 4fd448b）と同じ並び直しが必要になる
- **pickVariant の照合**: バリアントが1つなので、recommended と acceptable の重複問題は起きない。ただし `harmonySets` はトップレベルと variants[0] の両方に同じ値を書く（既存キャラと同じ二重定義の慣習）
- **mainstat の COST3 キー**: 属性ダメのキーは `'FusionDmg'`（ダーニャ・ルパなど既存の焦熱キャラと同じ）。`'fusionDmg'` と書かないこと
- **Windows のエンコーディング**: 日本語を含むファイルなので、PowerShell の `Set-Content` / `Out-File` で書き戻すと文字化けする。apply_patch で編集すること
