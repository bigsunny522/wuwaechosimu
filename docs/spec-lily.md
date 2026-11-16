# 仕様書: リリー(Lily)の追加

作業ブランチ: `bigsunny522/merganser`(現在のチェックアウト)

## 1. 背景

Ver3.8 で★5共鳴者「リリー」が実装された。厳選サポーターのキャラ選択・スコア計算に登録する。
HP参照のヒーラー兼バッファーなので、ショアキーパー・モーニエと同じ **v2・healProfile 型(role: 'healer')** で登録する。
推奨構成はすべて登録済みの音骸・ハーモニーで組めるため、`echoes.ts` は触らない(フラワー・レミニセンス=`FLOWER_OF_TINGED_YEARNING`、喧騒に隠す回光=`REJUVENATING_GLOW`、形解きの悪鬼 `formrender`、フェイタルエラー `fallacy_of_no_return` はすべて登録済み)。

### 1-1. 調査結果(出典つき、2026-11-16 時点)

| 項目 | 値 | 出典 |
|---|---|---|
| 属性 / 武器種 | 回折 / 拳銃 | Game8(JP/EN), GameWith |
| 役割 | 同奏・音骸スキル編成のヒーラー兼バッファー | Game8, GameWith |
| Lv90 基礎ステータス | HP 16712 / 攻撃力 287 / 防御力 1099 | Game8(EN)。ショアキーパーと同じ値(★5 HP型サポートの共通テンプレート) |
| 固有(小ステ)合計 | HP +12% / HP回復効果 +12% | GameWith, Game8(EN) |
| 回復の参照ステ | HP | Game8, GameWith |
| 共鳴効率の変換 | 190%超1%ごとにチーム攻撃力 +0.1%(1スタック上限7%、最大4スタック)/ 190%超0.7%ごとに音骸スキルのクリ率 +0.1%(上限10%)・クリダメ +0.2%(上限20%)/ 100%超1%ごとに自身の重撃フィニッシュ・永咲きのクリ率 +0.5%(上限80%)・クリダメ +1%(上限160%) | Game8(JP/EN), GameWith |
| モチーフ武器 | ララバイ / Lullaby、拳銃、Lv90 基礎攻撃 412、サブステ 共鳴効率 77.0% | Game8(JP/EN), GameWith(数値が一致) |
| 推奨ハーモニー | 同奏編成: フラワー・レミニセンス / それ以外: 喧騒に隠す回光 | Game8, GameWith |
| メイン音骸 | 同奏編成: 形解きの悪鬼(COST3) / それ以外: フェイタルエラー(COST4) | Game8, GameWith |
| 推奨メインステ | COST4: HP回復効果 or HP%(GameWith はクリダメも可)、COST3: 共鳴効率、COST1: HP% | Game8, GameWith |
| サブステ優先 | 共鳴効率(260%まで) > HP% > HP実数 > クリダメ > クリ率 | Game8(EN), Game8(JP), GameWith |
| 目標値 | 共鳴効率 260% | Game8, GameWith |

### 1-2. 設計判断

- **バリアントは1つ(`main`)にする。** 同奏編成と通常編成でメインステ・目標共鳴効率・回復/バフの式が同じで、重みに差が出ないため。両セットを同じバリアントの recommended に置く(規約2の「バリアント間の重複」は起きない)
- **damageProfile は付けない(モーニエと同じ純ヒーラー扱い)。** リリー自身もHP参照のダメージを出すが、重撃フィニッシュ・永咲きのクリは共鳴効率から最大 +80% / +160% 供給されるため、クリのサブステの価値は小さい。damageProfile を付けると現行の式ではクリ率・クリダメ・重撃ダメ%が HP% と同等以上の重みになり、どの攻略サイトの優先順位(クリは最下位)とも食い違う。クリは `substats` のカテゴリ(旧方式の表示用)にだけ載せる
- **erConversions はチーム全体に効く変換だけを入れる。** ショアキーパーと同じく、ゲーム内の変換式の「1%あたりの上昇量」をそのまま入れる(スタック数は掛けない)
  - チーム攻撃力: 0.1 / 起点 190 / 上限 260
  - 音骸スキルのクリ率: 0.1 ÷ 0.7 = 0.143 / 起点 190 / 上限 260
  - 音骸スキルのクリダメ: 0.2 ÷ 0.7 = 0.286 / 起点 190 / 上限 260
  - 自身の重撃フィニッシュ・永咲きのクリ変換は自分のダメージにしか効かないので入れない
- **role ラベルは既存の `'耐久・回復サポート'` を使う**(`charLabels.ts` を触らずに済む)

## 2. 変更対象

触るファイルは次の4つだけ。

### 2-1. `src/data/characters.ts`

(a) 冒頭の `SET` 定数の末尾(`SWORN_VIGIL: HS.HEART_OF_SWORN_VIGIL,` の次の行)に1行足す:

```ts
  FLOWER:      HS.FLOWER_OF_TINGED_YEARNING,
```

(b) `CHARACTERS` 配列の `// ── 5★ キャラクター（実装降順）` の直後、`suoming` エントリの **前** に追加する(5★は実装降順のため先頭):

```ts
  {
    id: 'lily', name: 'リリー', nameEn: 'Lily', element: '回折', weapon: '拳銃',
    role: '耐久・回復サポート',
    scalingStat: 'hp',
    // Lv90基礎ステータスは Game8(EN) の値。ショアキーパーと同じ★5 HP型サポートの値。
    baseStats90: { atk: 287, hp: 16712, def: 1099 },
    motifWeaponId: 'lily',
    // v2: 2026/11 Ver3.8実装。HP参照の回復＋同奏/音骸スキル編成のバッファー。
    // 自身のダメージもHP参照で出すが、重撃フィニッシュ・永咲きのクリは共鳴効率から
    // 最大+80%/+160%供給されるため、damageProfileは付けず純ヒーラーとして扱う
    // （付けるとクリ・重撃ダメ%がHP%以上の重みになり攻略サイトの優先順位と食い違う）。
    // erConversions はチーム全体に効く変換のみ（190%超: 攻撃力 1%につき+0.1%、
    // 音骸スキルのクリ率 0.7%につき+0.1%・クリダメ 0.7%につき+0.2%、260%で頭打ち）。
    // 同奏編成（フラワー・レミニセンス）と通常編成（喧騒に隠す回光）は重みが同じため
    // 1バリアントにまとめる（docs/spec-lily.md 1-2）。
    variants: [
      {
        id: 'main',
        role: 'healer',
        label: '回復・バフ運用',
        harmonySets: { recommended: [SET.FLOWER, SET.HEALER], acceptable: [] },
        mainstat: {
          cost4: { recommended: ['healingBonus', 'hpPercent'], acceptable: ['critDmg'] },
          cost3: { recommended: ['Resonanceeff'],              acceptable: ['hpPercent'] },
          cost1: { recommended: ['hpPercent'],                 acceptable: [] },
        },
        erRequirement: 2.60,
        healProfile: {
          assumedExistingScalingPercent: 0.9,
          erConversions: [
            { ratePerErPercent: 0.1,   baselineErPercent: 190, capErPercent: 260 }, // チーム攻撃力
            { ratePerErPercent: 0.143, baselineErPercent: 190, capErPercent: 260 }, // 音骸スキルのクリ率
            { ratePerErPercent: 0.286, baselineErPercent: 190, capErPercent: 260 }, // 音骸スキルのクリダメ
          ],
        },
      },
    ],
    substats: {
      recommended: [
        { key: 'energyRegen' },
        { key: 'hpPercent' },
        { key: 'hpFlat' },
      ],
      preferred:   [{ key: 'critDmg' }],
      acceptable:  [{ key: 'critRate' }],
    },
    mainstat: {
      cost4: { recommended: ['healingBonus', 'hpPercent'], acceptable: ['critDmg'] },
      cost3: { recommended: ['Resonanceeff'],              acceptable: ['hpPercent'] },
      cost1: { recommended: ['hpPercent'],                 acceptable: [] },
    },
    harmonySets: { recommended: [SET.FLOWER, SET.HEALER], acceptable: [] },
  },

```

### 2-2. `src/data/weapons.ts`

`MOTIF_WEAPONS` の先頭(`suoming` の前)に追加:

```ts
  lily: {
    id: 'lily',
    name: 'ララバイ',
    nameEn: 'Lullaby',
    class: '拳銃',
    baseAtk90: 412,
    substatKey: 'energyRegen',
    substatValue90: 77.0,
    sourceConfidence: 'high',
  },
```

`sourceConfidence: 'high'`: Game8(JP/EN)・GameWith の3件で数値が一致しているため。

### 2-3. `src/data/updates.ts`

`UPDATES` 配列の先頭(`id: '2026-10-22'` の前)に追加:

```ts
  {
    id: '2026-11-16',
    date: '2026-11-16',
    title: { ja: 'リリーのビルドデータを追加', en: 'Added Build Data for Lily' },
    items: [
      {
        ja: 'リリーを追加しました',
        en: 'Added Lily',
      },
    ],
    link: {
      href: '/chardb',
      label: { ja: 'キャラ別ビルドデータを見る', en: 'View the Build Data' },
    },
  },
```

### 2-4. `src/data/rankThresholds.ts`

手で編集しない。`npm run gen:thresholds` で再生成した結果をそのまま変更に含める。
サンドボックス内で `uv_os_get_passwd returned ENOMEM` で落ちた場合は、再生成せずにその旨を報告する(Claude Code 側で実行する)。

### 触らないファイル

- `src/data/echoes.ts` — 新しい音骸・セットはない
- `src/data/charLabels.ts` — role の `'耐久・回復サポート'` は既存キー
- `src/lib/**`, `src/types/**`, `scripts/**`, コンポーネント類・ページ類すべて

## 3. 受け入れ条件

1. `npx tsc --noEmit` がエラー 0 で終了する
2. `npm run gen:thresholds` が終了コード 0 で終了し、`git grep -c "lily" src/data/rankThresholds.ts` が 1 以上
3. `npm run build` が成功する
4. `git status --short` で変更(M)になっているのが次の4ファイルだけ(`docs/spec-lily.md` を除く): `src/data/characters.ts`, `src/data/weapons.ts`, `src/data/updates.ts`, `src/data/rankThresholds.ts`
5. `git grep -n "id: 'lily'" src/data/characters.ts src/data/weapons.ts` がそれぞれ1件ずつヒットする
6. `characters.ts` 内で `lily` エントリが `suoming` エントリより前にある
7. `rankThresholds.ts` の差分のうち `lily` 以外のキャラの値が変わっている場合、その理由を報告に書く

## 4. 対象外

- モチーフ武器のパッシブ(HP上限+12%、同奏キャラへの攻撃力バフ、音骸スキルダメバフ)のスコア反映
- リリー自身のダメージ(重撃フィニッシュ・永咲き・共鳴解放の継続ダメージ)のスコア反映
- 同奏編成と通常編成のバリアント分け
- 心・鎖暝・シグリカなど他キャラの推奨パーティ・ハーモニーの更新
- 凸(S1〜S6)ごとの調整
- push、コミット

## 5. 想定される落とし穴

- **並び順**: 5★は実装降順。`suoming` の後ろに追加しない
- **SET 定数名**: `FLOWER` は新規。既存の `HEALER`(= 喧騒に隠す回光)と取り違えない
- **メインステのキー**: COST3 の共鳴効率は `'Resonanceeff'`(サブステの `'energyRegen'` とは別)。回復効果は `'healingBonus'`
- **id の一意性**: `lily` は保存データに使われるため、後から変えない前提で付ける。`characters.ts` と `weapons.ts` で同じ id にする
- **erConversions の起点**: `baselineErPercent` は 190(100 ではない)。erRequirement 2.60 が起点を超えているので3件とも重みに加算される
