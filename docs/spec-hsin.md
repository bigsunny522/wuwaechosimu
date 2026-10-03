# 仕様書: 心（シン / Hsin）と Ver3.7 新音骸・新ハーモニーの追加

作業ブランチ: `feat/add-hsin-character`（作成済み。main にはマージしない）

## 1. 背景

2026-09-30、Ver3.7前半で★5共鳴者「心（シン）」が実装された。あわせて新音骸6体と新ハーモニー3種が追加された。
厳選サポーターのキャラ選択・スコア計算・音骸選択にこれらを登録する。
心は景燃・清宵と同じく最初から **v2（運用バリアント方式）** で登録する。

### 1-1. 心の調査結果（出典つき）

| 項目 | 値 | 出典 |
|---|---|---|
| 属性 / 武器種 | 電導 / 増幅器 | GameWith, Game8, prydwen |
| 役割 | 共鳴スキル主体のメインアタッカー。「同奏」運用と「電磁効果」運用の2モード | Game8, prydwen |
| Lv90 基礎ステータス | HP 10300 / 攻撃力 462 / 防御力 1112 | Game8（prydwen は「Stats data not available」。推奨ステ HP14500+/DEF1100+ と矛盾しない） |
| 固有（小ステ）合計 | クリ率 +8% / 攻撃力 +12% | prydwen |
| モチーフ武器 | 玉殿に咲き満ちる玄華 / Blooming Jadehaven、増幅器、Lv90 基礎攻撃 587、サブステ クリ率 24.3% | Game8（数値）、prydwen（英名） |
| 推奨ハーモニー | 銜夢照世の心（5セット）。prydwen の候補はこの1種のみ | prydwen, Game8 |
| メイン音骸 | 響き渡る共鳴・天演溯心 | prydwen, Game8 |
| 推奨メインステ | COST4: クリ率/クリダメ、COST3: 電導ダメ（2枠目は電導ダメ ≥ 攻撃%）、COST1: 攻撃% | prydwen, Game8 |
| サブステ優先 | 共鳴効率(必要分) > クリ率 = クリダメ > 攻撃% = 共鳴スキルダメ% > 攻撃力(実数) | prydwen |
| 目標値 | クリ率 65%+（セット抜き）/ クリダメ 230〜270% / 共鳴効率 110〜115% | prydwen |
| ダメージ内訳 (S0 ソロ, 電磁効果ローテ) | Basic 171,295 / Heavy 0 / Skill 1,404,106 / Liberation 48,278（Intro 31,004 / Outro 19,680 / Echo 59,229 / Electro Flare 252,231 は除外） | prydwen Calculations タブ |
| ダメージ内訳 (S0 ソロ, 同奏ローテ・参考) | Basic 97,277 / Heavy 0 / Skill 892,301 / Liberation 27,966（Outro 22,562 / Echo 33,951 は除外） | prydwen Calculations タブ |

#### バリアントを1つにする理由

2モードとも推奨ハーモニー・メインステ・サブステ優先が同じで、攻撃タイプ配分も
（電磁）basic 0.105 / skill 0.865 / lib 0.030、（同奏）basic 0.096 / skill 0.877 / lib 0.027 とほぼ一致する。
バリアントを分けてもスコアがほとんど変わらないため、DPS の高い電磁効果ローテの内訳で `main` 1つだけを登録する。
電磁効果ダメージ（Electro Flare）はクリティカルせず、攻撃タイプ別ダメ%サブステも乗らないので、Intro/Outro/Echo と同じく typeShares から除外する。

### 1-2. 新ハーモニー（出典: GameWith 各セットページ、公式パッチノート）

| 日本語名 | 英語名 | 効果の要約 |
|---|---|---|
| 銜夢照世の心 | Heart of Sworn Vigil | 2: 電導ダメ+10% / 5: 電磁効果付与・同奏獲得・同奏レスポンス時、クリ率+15%・電導ダメ+22.5% |
| 鏡影流電の閃 | Flash of Electric Reflection | 2: 電導ダメ+10% / 5: 電磁効果付与で電導ダメ+10%、その間の終奏で次キャラ電導ダメ+25% |
| フラワー・レミニセンス | Flower of Tinged Yearning | 回復時にチーム攻撃力+10%、同奏で追加+15%（回復役向け） |

表記注意: 「銜夢照世の心」の1文字目は **銜**（金へん）。Game8 の一部記事にある「衒」は誤記。

### 1-3. 新音骸（出典: GameWith 音骸一覧で各行のコスト・セットアイコンを確認、英名は公式パッチノート / Game8 / prydwen）

| 日本語名 | 英語名 | コスト | セット |
|---|---|---|---|
| 響き渡る共鳴・天演溯心 | Reminiscence: Suhsin the Inevitable | 4 | 銜夢照世の心, 鏡影流電の閃 |
| 霄巡りの槍衛 | Skywatch Lancer | 3 | 鏡影流電の閃, フラワー・レミニセンス |
| 形解きの悪鬼 | Formrender | 3 | 銜夢照世の心, フラワー・レミニセンス |
| 息絶えの亡霊 | Soulfrayer | 3 | 銜夢照世の心, 鏡影流電の閃 |
| 機玉の冥蛇 | Jade Nether Serpent | 1 | 銜夢照世の心 |
| 花咲かの奇傀 | Bloomburst Puppet | 1 | 銜夢照世の心 |

## 2. 変更対象

触るファイルは次の5つだけ。

### 2-1. `src/data/echoes.ts`

(a) `HARMONY_SETS` の末尾（`LAMP_OF_NETHER_ROAD` の次行）に、新しいコメント見出しと3行を追加:

```ts
  // ── 追加セット (Ver 3.7) ────────────────────────────────────────────────
  HEART_OF_SWORN_VIGIL:         '銜夢照世の心',
  FLASH_OF_ELECTRIC_REFLECTION: '鏡影流電の閃',
  FLOWER_OF_TINGED_YEARNING:    'フラワー・レミニセンス',
```

(b) `HARMONY_SETS_EN` の末尾（`'冥夜を導く灯'` の次行）に追加:

```ts
  '銜夢照世の心':           'Heart of Sworn Vigil',
  '鏡影流電の閃':           'Flash of Electric Reflection',
  'フラワー・レミニセンス': 'Flower of Tinged Yearning',
```

(c) `HARMONY_SET_COLORS` の `// 電導 (Electro)` グループ（`'空を切り裂く冥雷'` の次行）に追加。フラワー・レミニセンスは属性セットではないので色を付けない（既存の回復セット「喧騒に隠す回光」と同じく既定色）:

```ts
  '銜夢照世の心':              { bg: '#f3e8ff', text: '#9333ea' },
  '鏡影流電の閃':              { bg: '#f3e8ff', text: '#9333ea' },
```

(d) `ECHOES` に追加。各コストのブロック末尾に置く（既存の書式・桁揃えに合わせる。`nameCn` は付けない）:

- COST 4 ブロック末尾（`calamity_effigy` の次行）:
  - `{ id: 'reminiscence_suhsin', name: '響き渡る共鳴・天演溯心', nameEn: 'Reminiscence: Suhsin the Inevitable', cost: 4, sets: [S.HEART_OF_SWORN_VIGIL, S.FLASH_OF_ELECTRIC_REFLECTION] },`
- COST 3 ブロック末尾（`forbidden_bastion` の次行）:
  - `{ id: 'skywatch_lancer', name: '霄巡りの槍衛', nameEn: 'Skywatch Lancer', cost: 3, sets: [S.FLASH_OF_ELECTRIC_REFLECTION, S.FLOWER_OF_TINGED_YEARNING] },`
  - `{ id: 'formrender', name: '形解きの悪鬼', nameEn: 'Formrender', cost: 3, sets: [S.HEART_OF_SWORN_VIGIL, S.FLOWER_OF_TINGED_YEARNING] },`
  - `{ id: 'soulfrayer', name: '息絶えの亡霊', nameEn: 'Soulfrayer', cost: 3, sets: [S.HEART_OF_SWORN_VIGIL, S.FLASH_OF_ELECTRIC_REFLECTION] },`
- COST 1 ブロック末尾（`kernel_puppet_fright` の次行）:
  - `{ id: 'jade_nether_serpent', name: '機玉の冥蛇', nameEn: 'Jade Nether Serpent', cost: 1, sets: [S.HEART_OF_SWORN_VIGIL] },`
  - `{ id: 'bloomburst_puppet', name: '花咲かの奇傀', nameEn: 'Bloomburst Puppet', cost: 1, sets: [S.HEART_OF_SWORN_VIGIL] },`

### 2-2. `src/data/characters.ts`

(a) `SET` 定数の末尾（`LAMP` の次行）に追加:

```ts
  SWORN_VIGIL: HS.HEART_OF_SWORN_VIGIL,
```

(b) `CHARACTERS` 配列の `// ── 5★ キャラクター（実装降順）` の直後、`jingran` エントリの **前** に追加（5★は実装降順のため先頭）:

```ts
  {
    id: 'hsin', name: '心', nameEn: 'Hsin', element: '電導', weapon: '増幅器',
    role: 'メインアタッカー（共鳴スキル重視）',
    roleTemplate: 'DPS',
    scalingStat: 'atk',
    baseStats90: { atk: 462, hp: 10300, def: 1112 },
    motifWeaponId: 'hsin',
    // v2: 2026/9/30実装。基礎ステータスはGame8、攻撃タイプ別ダメージ配分は prydwen.gg の
    // CalculationsタブにあるLv90ソロ火力シミュレーション(S0・電磁効果ローテ)の内訳から算出。
    // typeShares は Basic/Heavy/Skill/Liberation の実ダメージ内訳を再正規化した値
    // （Intro/Outro/Echo/電磁効果ダメージは対応する攻撃タイプ別ダメ%サブステが存在しないため除外。
    // 電磁効果ダメージはクリティカルもしない）。
    // 「同奏」運用と「電磁効果」運用の2モードがあるが、推奨ハーモニー・メインステ・
    // サブステ優先が共通で、同奏ローテの内訳(basic 0.096/skill 0.877/lib 0.027)とも
    // ほぼ一致するため、バリアントは1つにまとめている。
    // selfAtkBuffPercent は固有スキル(小ステ)の攻撃力+12%。
    variants: [
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
          typeShares: { basic: 0.105, heavy: 0, skill: 0.865, lib: 0.030 },
          selfAtkBuffPercent: 0.12,
          baselineCritRate: 0.70,
          baselineCritDmg: 2.50,
        },
      },
    ],
    substats: {
      recommended: [
        { key: 'critRate' },
        { key: 'critDmg' },
        { key: 'atkPercent' },
        { key: 'resonanceSkillDmg' },
      ],
      preferred:   [{ key: 'energyRegen' }],
      acceptable:  [{ key: 'atkFlat' }],
    },
    mainstat: {
      cost4: { recommended: ['critRate', 'critDmg'], acceptable: ['atkPercent'] },
      cost3: { recommended: ['ElectroDmg'],           acceptable: ['atkPercent'] },
      cost1: { recommended: ['atkPercent'],           acceptable: [] },
    },
    harmonySets: { recommended: [SET.SWORN_VIGIL], acceptable: [] },
  },

```

typeShares の算出根拠（検算用）: 合計 = 171,295 + 0 + 1,404,106 + 48,278 = 1,623,679
→ basic 0.1055 / heavy 0 / skill 0.8648 / lib 0.0297 → 小数3桁に丸めて 0.105 / 0 / 0.865 / 0.030（合計 1.000）。

baselineCritDmg 2.50 は prydwen の目標 230〜270% の中央値。baselineCritRate 0.70 はセット抜き65%＋α（清宵と同じ扱い）。erRequirement 1.15 は目標 110〜115% の上端（景燃と同じく保守側）。

### 2-3. `src/data/weapons.ts`

`MOTIF_WEAPONS` の先頭（`jingran` の前）に追加:

```ts
  hsin: {
    id: 'hsin',
    name: '玉殿に咲き満ちる玄華',
    nameEn: 'Blooming Jadehaven',
    class: '増幅器',
    baseAtk90: 587,
    substatKey: 'critRate',
    substatValue90: 24.3,
    sourceConfidence: 'low',
  },
```

`sourceConfidence: 'low'` にする理由: 数値の出典が Game8 の1件だけで、prydwen にステータスが未掲載のため。

### 2-4. `src/data/updates.ts`

`UPDATES` 配列の先頭（`id: '2026-09-10'` の前）に追加:

```ts
  {
    id: '2026-10-03',
    date: '2026-10-03',
    title: { ja: '心のビルドデータと Ver3.7 の新音骸を追加', en: 'Added Build Data for Hsin and Version 3.7 Echoes' },
    items: [
      {
        ja: '心を追加しました',
        en: 'Added Hsin',
      },
      {
        ja: 'Ver3.7の新音骸6体と新ハーモニー3種（銜夢照世の心・鏡影流電の閃・フラワー・レミニセンス）を追加しました',
        en: 'Added 6 new Echoes and 3 new Sonata Effects from Version 3.7 (Heart of Sworn Vigil, Flash of Electric Reflection, Flower of Tinged Yearning)',
      },
    ],
    link: {
      href: '/chardb',
      label: { ja: 'キャラ別ビルドデータを見る', en: 'View the Build Data' },
    },
  },
```

### 2-5. `src/data/rankThresholds.ts`

手で編集しない。`npm.cmd run gen:thresholds` で再生成した結果をそのまま変更に含める。

### 触らないファイル

- `src/data/charLabels.ts` — role の `'メインアタッカー（共鳴スキル重視）'` は既存キーのため追加不要
- `src/lib/**`, `src/types/**`, `scripts/**`, コンポーネント類・ページ類すべて
- リポジトリ直下の未追跡ファイル（`.planning/`, `.superpowers/`, `DESIGN.md`, `*.csv`, `echo_sets_mapping*.json`, `public/echo.af`, `docs/claude-codex.md`, `scripts/invoke-codex.ps1` など）— 触らない

## 3. 受け入れ条件

Windows PowerShell で以下がすべて成立すること。

1. `npx.cmd tsc --noEmit` がエラー 0 で終了する
2. `npm.cmd run gen:thresholds` が終了コード 0 で終了し、`git grep -c "hsin" src/data/rankThresholds.ts` が 1 以上
3. `npm.cmd run build` が成功する
4. `git status --short` で変更（M）になっているのが次の5ファイルだけ: `src/data/echoes.ts`, `src/data/characters.ts`, `src/data/weapons.ts`, `src/data/updates.ts`, `src/data/rankThresholds.ts`（新規 `docs/spec-hsin.md` と、作業前からある未追跡ファイルは除く）
5. `git grep -n "id: 'hsin'" src/data/characters.ts src/data/weapons.ts` がそれぞれ1件ずつヒットする
6. `characters.ts` 内で `hsin` エントリが `jingran` エントリより前にある
7. `git grep -c "HEART_OF_SWORN_VIGIL\|FLASH_OF_ELECTRIC_REFLECTION\|FLOWER_OF_TINGED_YEARNING" src/data/echoes.ts` が `9` を返す（`HARMONY_SETS` の定義3行＋新音骸6行）
8. `rankThresholds.ts` の差分のうち `hsin` 以外のキャラの値が変わっている場合、その理由を報告に書く

## 4. 対象外

- 鎖暝（Suoming, Ver3.7後半）の追加。実装後に別件で扱う
- 「同奏」運用と「電磁効果」運用のバリアント分け（1-1 の理由により1つにまとめる）
- 電磁効果ダメージ（非クリ・攻撃タイプ外）をスコアに反映させる型拡張
- モチーフ武器のパッシブ効果（スキルダメ深化・電導耐性無視など）のスコア反映
- 既存キャラのハーモニー推奨を新セットに更新すること（例: 他の電導キャラに鏡影流電の閃を足す）
- 音骸の中国語名（`nameCn`）
- 凸（S1〜S6）ごとのバリアント分け
- main へのマージ、push、コミット

## 5. 想定される落とし穴

- **`銜` と `衒`**: セット名の1文字目は「銜」。`HARMONY_SETS`・`HARMONY_SETS_EN`・`HARMONY_SET_COLORS` の3か所で同じ文字列になっていないと、英語表示や色が当たらない。コピーで揃えること
- **`SET.SWORN_VIGIL` の追加漏れ**: `SET` は `as const` なので、追加せずに参照すると tsc でエラーになる
- **並び順**: 5★は実装降順。`jingran` の後ろに追加すると、清宵の件（commit 4fd448b）と同じ並び直しが必要になる
- **COST3 メインステのキー**: 電導ダメは `'ElectroDmg'`（レベッカ・オーガスタと同じ）。`'electroDmg'` と書かない
- **`DEFAULT_ECHO_ID` は変えない**: 新しい音骸を既定値にしない
- **音骸 id の一意性**: 追加する id（`reminiscence_suhsin` ほか5つ）が既存と重複していないことを確認する。id は保存データの選択状態に使われるため、後から変えない前提で付ける
- **Windows のエンコーディング**: 日本語を含むファイルなので、PowerShell の `Set-Content` / `Out-File` で書き戻すと文字化けする。apply_patch で編集すること
