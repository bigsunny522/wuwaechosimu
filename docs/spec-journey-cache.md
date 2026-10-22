# 強化の道のりの計算を使い回す

## 背景

ホームでサブステを5個入れると、結果カード(ResultCard)が出るまで画面が少し固まる。

原因は `src/app/HomeClient.tsx` の `journey`(カード裏の「強化の道のり」)の計算。5個目を入れた瞬間に、先頭 1〜4 個それぞれについて `simulateCompletion` を呼んでいる。1回あたり 50,000 回のモンテカルロ試行(`src/lib/monteCarlo.ts` の `ITERATIONS`)なので、合計 20 万回の試行がメインスレッドで同期的に走り、終わるまでカードが描かれない。

ところが同じ計算は、1〜4 個目を入れた時点で `draftAdvisor`(画面下の予想 ForecastStrip 用)がすでに済ませている。その結果を取っておき、`journey` では使い回す。これで5個目を入れたときの計算がほぼなくなり、ForecastStrip に出ていた数字と道のりの数字も一致する(`docs/spec-home-resultcard.md` の「落とし穴」にあった、数字が少しずれる問題も消える)。

## 変更対象

触るファイル:

- `src/app/HomeClient.tsx` — `simulateCompletion` の結果を覚えておく仕組みを足し、`draftAdvisor` と `journey` の両方からそれを通して呼ぶ

触らないファイル:

- `src/lib/monteCarlo.ts` — 試行回数・計算方法は変えない
- `src/components/home/ResultCard.tsx` / `ForecastStrip` — 受け取るデータの形は変わらない
- そのほかすべて

## 仕様

### 1. 結果の置き場所

`HomeClient` のコンポーネント内に `useRef` で `Map<string, AdvisorResult>` を1つ持つ(`AdvisorResult` は `simulateCompletion` の戻り値の型。`@/lib/monteCarlo` などから import できなければ `ReturnType<typeof simulateCompletion>` を使う)。

### 2. キー

計算結果に影響する値だけを並べた文字列にする:

```
[cost, draftMeta.echoId, draftMeta.harmonySet, draftMeta.mainstat.key, build?.id ?? 'generic',
 subs.map((s) => `${s.key}:${s.tier}`).join(',')].join('|')
```

- 音骸名(`echoName` / `echoNameEn`)は計算に影響しないので入れない
- `level` は `subs.length` から決まるので入れなくてよい

### 3. 覚えながら計算する関数

`useCallback` で次の関数を作る(名前は `simulateDraft` とする):

```ts
const simulateDraft = useCallback((subs: Substat[]) => {
  const key = /* §2 のキー */;
  const cache = advisorCacheRef.current;
  const hit = cache.get(key);
  if (hit) return hit;
  const r = simulateCompletion(buildDraftEcho(subs), build);
  if (cache.size >= 64) cache.clear();
  cache.set(key, r);
  return r;
}, [cost, draftMeta, build, buildDraftEcho]);
```

- 上限 64 件を超えそうになったら全部捨てる(古いものから消すような凝ったことはしない)

### 4. 呼び出し側

- `draftAdvisor`: `simulateCompletion(buildDraftEcho(draftSubs), build)` を `simulateDraft(draftSubs)` に置き換える。依存配列は `[draftSubs, simulateDraft]`
- `journey`: ループ内の `simulateCompletion(buildDraftEcho(draftSubs.slice(0, n)), build)` を `simulateDraft(draftSubs.slice(0, n))` に置き換える。依存配列は `[draftSubs, simulateDraft, draftFinalScore]`
- 置き換えたあと `simulateCompletion` を直接呼んでいる箇所が `simulateDraft` の中だけになっていること

## 受け入れ条件

- [ ] `npx tsc --noEmit` が通る
- [ ] `npm run build` が通る
- [ ] `src/app/HomeClient.tsx` 以外に差分がない
- [ ] (Claude Code がブラウザで確認)サブステを1個ずつ5個入れたとき、5個目でカードがすぐ出る。カード裏の道のりの 1〜4 点目の数字が、それぞれの段階で ForecastStrip に出ていた予想スコアと一致する

## 対象外

- 計算を Web Worker に移す、試行回数を減らす、など別の高速化
- 1〜4 個目を入れたときの ForecastStrip の計算の重さ(今回は触らない)
- 途中のサブステを消して入れ直したとき、変わった段階のぶんだけ計算し直しになること(仕様どおり。全部が再計算になるわけではない)

## 想定される落とし穴

- `useMemo` の中で ref の Map を書き換えることになるが、同じキーには同じ結果を入れるだけなので、開発時の StrictMode で2回呼ばれても問題ない
- キーに入れ忘れた値があると、条件を変えたのに古い結果が出る。メインステ・ハーモニー・キャラ・COST・音骸を変えたあとで5個入れ直し、道のりの数字が変わることを確かめる
- `simulateCompletion` 内部の `baselineCache`(`monteCarlo.ts`)はそのままにする。こちらの Map とは別物
