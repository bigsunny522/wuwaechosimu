'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';

const ACCENT = '#0275fd';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: '20px 24px',
      marginBottom: 20,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>{title}</h2>
      <div style={{ color: '#374151', fontSize: 14, lineHeight: 1.8 }}>{children}</div>
    </section>
  );
}

function SubHeading({ children }: { children: ReactNode }) {
  return (
    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', margin: '16px 0 6px' }}>{children}</h3>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <pre style={{
      background: '#0f172a',
      color: '#e2e8f0',
      fontSize: 12.5,
      lineHeight: 1.7,
      padding: '14px 16px',
      borderRadius: 8,
      overflowX: 'auto' as const,
      margin: '8px 0',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    }}>
      {children}
    </pre>
  );
}

function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code style={{
      background: '#f1f5f9',
      color: '#0f172a',
      padding: '1px 6px',
      borderRadius: 4,
      fontSize: 12.5,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    }}>
      {children}
    </code>
  );
}

function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div style={{ overflowX: 'auto' as const, margin: '8px 0' }}>
      <table style={{ borderCollapse: 'collapse' as const, width: '100%', fontSize: 13 }}>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} style={{
                textAlign: 'left' as const,
                padding: '6px 10px',
                background: '#f9fafb',
                borderBottom: '2px solid #e5e7eb',
                color: '#6b7280',
                fontSize: 11,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.03em',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
              {r.map((c, j) => (
                <td key={j} style={{ padding: '6px 10px', color: '#374151' }}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FilePath({ children }: { children: string }) {
  return (
    <span style={{
      fontSize: 11,
      color: '#9ca3af',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    }}>
      {children}
    </span>
  );
}

export default function ScoreFormulaClient() {
  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '28px 16px 48px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* ── ページヘッダー ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
          flexWrap: 'wrap' as const,
          gap: 12,
        }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>
              音骸スコア計算式 v2（運用バリアント方式）
            </h1>
            <p style={{ color: '#6b7280', fontSize: 13, marginTop: 6, margin: '6px 0 0' }}>
              <InlineCode>feature/echo-score-v2-role-variants</InlineCode> ブランチで実装されているスコア計算ロジックのまとめ
            </p>
          </div>
          <Link
            href="/"
            style={{
              background: ACCENT,
              color: '#fff',
              padding: '9px 18px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            ← シミュレーターへ
          </Link>
        </div>

        <Section title="1. 概要">
          <p>
            v1（カテゴリ方式）では、サブステを「推奨 / 優先 / 妥協 / 不要」の4区分に手動分類し、
            区分ごとの固定倍率（<InlineCode>MULT</InlineCode>）を掛けて採点していた。
            v2（運用バリアント方式）では、キャラの基礎ステータス・モチーフ武器・ダメージタイプ内訳（<InlineCode>damageProfile</InlineCode>）から
            ダメージ式の偏微分に基づく<strong>連続値の重み</strong>をサブステごとに導出し、区分をこの重みから逆算する。
          </p>
          <p>
            対応データ（<InlineCode>build.variants</InlineCode> ＝ 運用バリアント定義）が揃っているキャラのみ v2 が使われ、
            未対応キャラは自動的に v1 相当のカテゴリ採点にフォールバックする。
          </p>
        </Section>

        <Section title="2. 重みの導出（偏微分ベース）">
          <p>
            <FilePath>src/lib/weaponScoring.ts</FilePath> の <InlineCode>deriveSubstatWeights()</InlineCode> が本体。
            前提とするダメージ式は次の通り。
          </p>
          <Code>{`DMG ∝ MainStat_total × (1 + %DMG_typeX) × CritMult
CritMult = 1 + critRate × critDmg`}</Code>
          <p>
            各サブステの最大ロール1本を追加したときの相対ダメージ増加率 ΔDMG/DMG を、そのサブステの重みとして採用する。
            倍率の絶対値そのものには意味がなく、後段で理論最大値との比を取るため<strong>サブステ間の相対比のみ</strong>が効く。
          </p>

          <SubHeading>クリティカル率・クリティカルダメージ</SubHeading>
          <p>
            期待ダメージ倍率 = <InlineCode>1 + critRate × (critDmg − 1)</InlineCode> を crit と critDmg でそれぞれ偏微分する。
          </p>
          <Code>{`cdBonus  = baselineCritDmg - 1        // 非クリ超過分
critMult = 1 + baselineCritRate × cdBonus

weight[critRate] = (cdBonus × maxRollFraction(critRate)) / critMult
weight[critDmg]  = (baselineCritRate × maxRollFraction(critDmg)) / critMult`}</Code>

          <SubHeading>攻撃力%・攻撃力実数（スケーリングステ）</SubHeading>
          <p>
            既にビルドに積まれているであろう他の%系バフの合計を仮定し（<InlineCode>ASSUMED_EXISTING_SCALING_PCT = 0.45</InlineCode>）、
            そこにキャラ自身のバフ（<InlineCode>selfAtkBuffPercent</InlineCode>）とモチーフ武器の副ステ（%攻撃力の場合）を加えたものを分母に取る。
          </p>
          <Code>{`existingPctSum = ASSUMED_EXISTING_SCALING_PCT + selfAtkBuffPercent + weaponGivesScalingPct

weight[atkPercent] = maxRollFraction(atkPercent) / (1 + existingPctSum)
weight[atkFlat]    = maxRollFraction(atkFlat) / (totalMainStat × (1 + existingPctSum))
// totalMainStat = キャラ基礎攻撃力(Lv90) + モチーフ武器基礎攻撃力(Lv90)`}</Code>

          <SubHeading>攻撃種別ダメージ%（通常/重撃/共鳴スキル/共鳴解放）</SubHeading>
          <p>
            バリアントの <InlineCode>damageProfile.typeShares</InlineCode>（各攻撃種別がダメージ全体に占める割合）を重みに直接乗算する。
          </p>
          <Code>{`weight[basicAttackDmg]    = maxRollFraction(basicAttackDmg)    × typeShares.basic
weight[heavyAttackDmg]    = maxRollFraction(heavyAttackDmg)    × typeShares.heavy
weight[resonanceSkillDmg] = maxRollFraction(resonanceSkillDmg) × typeShares.skill
weight[resonanceLibDmg]   = maxRollFraction(resonanceLibDmg)   × typeShares.lib`}</Code>

          <SubHeading>共鳴効率</SubHeading>
          <p>
            共鳴効率は「要求値に届くまでは高価値、届いた後はほぼ無価値」という閾値型のステータスであり、
            ダメージ式からの線形近似ができない。そのためバリアントごとの <InlineCode>erRequirement</InlineCode> に応じた静的な重みで代替する
            （他の重み帯：おおよそ0.02〜0.10に合わせてスケーリング）。
          </p>
          <Table
            head={['erRequirement', 'weight']}
            rows={[
              ['≤ 1.05', '0.02'],
              ['≤ 1.30', '0.05'],
              ['≤ 1.60', '0.08'],
              ['それ以上', '0.11'],
            ]}
          />
          <p>
            武器またはキャラの基礎データが欠けている場合（<InlineCode>totalMainStat == null</InlineCode>）は、
            呼び出し側で v1 のカテゴリ採点へフォールバックする。
          </p>
        </Section>

        <Section title="3. スコア計算本体（scoreWithVariant）">
          <p><FilePath>src/lib/scorer.ts</FilePath> の <InlineCode>scoreWithVariant()</InlineCode>。</p>

          <SubHeading>サブステ貢献</SubHeading>
          <Code>{`points = (sub.value / sub.maxValue) × weight[sub.key]  // ロール実値の比率 × 重み`}</Code>

          <SubHeading>理論最大値</SubHeading>
          <p>
            音骸のコストで決まるサブステ枠数（<InlineCode>substatCount</InlineCode>）分、重み上位のステを
            「基準ロール」で埋めた場合の合計値を理論最大値とする。基準ロールは全ステ共通で
            <InlineCode>values配列の 5/7 地点</InlineCode>（v1の Tier5/7段階と同じ基準点）。
          </p>
          <Code>{`REFERENCE_ROLL_FRACTION = 5 / 7
referenceRatio(key) = values[round(5/7 × (values.length-1))] / values[values.length-1]

topKeys       = weights を降順ソートして上位 substatCount 個
theoreticalMax = Σ referenceRatio(k) × weight[k]   (k ∈ topKeys)
idealMult      = Σ weight[k] / substatCount          (k ∈ topKeys)

substatScore = (Σ points / theoreticalMax) × 100`}</Code>

          <SubHeading>メインステ補正</SubHeading>
          <p>バリアントごとのコスト別推奨メインステ（<InlineCode>variant.mainstat.costN</InlineCode>）と比較。</p>
          <Table
            head={['状態', '補正']}
            rows={[
              ['推奨メインステ', '0'],
              ['許容（acceptable）メインステ', '−10'],
              ['どちらでもない', '−25'],
            ]}
          />

          <SubHeading>ハーモニーセット補正</SubHeading>
          <Table
            head={['状態', '補正']}
            rows={[
              ['推奨セット', '0'],
              ['許容セット', '−5'],
              ['どちらでもない', '−10'],
            ]}
          />

          <SubHeading>推奨重複ボーナス（コンボボーナス）</SubHeading>
          <p>
            各サブステの重みを最大重みと比較し、カテゴリ相当に分類したうえで「推奨」相当が何本あるかで加算する。
          </p>
          <Code>{`weightToCategory(weight, maxWeight):
  rel = weight / maxWeight
  rel >= 0.85 → recommended
  rel >= 0.50 → preferred
  rel >= 0.15 → acceptable
  else        → unnecessary

COMBO_BONUS = { 3: +3, 4: +7, 5: +12 }  // 推奨本数がキー`}</Code>

          <SubHeading>最終スコア</SubHeading>
          <Code>{`rawScore = round(substatScore + mainstatBonus + setBonus) + comboBonus
score    = clamp(rawScore, 0, 100)
rank     = rawScore >= 100 ? 'GOD' : toRankFromThresholds(score, thresholds)`}</Code>
        </Section>

        <Section title="4. ランク判定：ドロップ分布パーセンタイル基準">
          <p>
            v1はスコアの絶対値をそのままランクへ変換していたが（S+ ≥ 90 など固定閾値）、
            13種から等確率5枠のサブステ抽選では「推奨5種を高Tierで引く」確率が極めて低い
            （推奨5種すべてを引くだけで約0.08%）。そのため実際には十分良いドロップでも中位ランクに沈んでしまい、
            体感の「当たり外れ」とズレる問題があった。
          </p>
          <p>
            v2ではキャラ・運用バリアントごとに、事前計算したドロップスコア分布のパーセンタイルを閾値として使う
            （<FilePath>src/data/rankThresholds.ts</FilePath>、生成元は <FilePath>scripts/computeRankThresholds.ts</FilePath>、
            <InlineCode>npm run gen:thresholds</InlineCode> で再生成）。
          </p>
          <Code>{`// 推奨メインステ・推奨ハーモニーセットを固定し、サブステ5枠を完全ランダム抽選
// を N=500,000 回試行してスコア分布を作り、上位X%に対応するスコアを閾値化`}</Code>
          <Table
            head={['ランク', '累積確率（上位）']}
            rows={[
              ['GOD', '0.01%'],
              ['S+', '1%'],
              ['S', '5%'],
              ['A', '15%'],
              ['B', '35%'],
              ['C', '65%'],
              ['D', 'それ未満'],
            ]}
          />
          <p>
            閾値データが無いキャラ・バリアント（未対応、または生成前）は、従来の固定スコア閾値
            （S+ ≥ 90 / S ≥ 75 / A ≥ 58 / B ≥ 42 / C ≥ 25、それ未満D）にフォールバックする。
          </p>
        </Section>

        <Section title="5. フォールバック構造（scoreEcho）">
          <p>公開関数 <InlineCode>scoreEcho(echo, build)</InlineCode> は次の優先順位で採点方式を選ぶ。</p>
          <Code>{`1. build が無い          → scoreGeneric()   （汎用カテゴリ採点）
2. build.variants がある → pickVariant() でハーモニーセットから運用バリアントを推定
                            → scoreWithVariant() が成功すれば v2 を採用
                            → totalMainStat が null 等でデータ不足なら 3. へ
3. それ以外               → scoreWithBuild()  （v1 カテゴリ採点。roleTemplate があれば
                                                 動的 IDEAL_MULT を使用）`}</Code>
          <p>
            <InlineCode>pickVariant()</InlineCode> は装着中のハーモニーセットから最も一致度の高い運用バリアントを選ぶ。
            バリアントが1つしか無ければそれを、複数ある場合は装着セットが「推奨」または「許容」に含まれるものを探し、
            見つからなければ先頭のバリアントを既定とする。
          </p>
        </Section>

        <Section title="6. v1 カテゴリ方式（フォールバック先）との比較">
          <Table
            head={['項目', 'v1（カテゴリ方式）', 'v2（運用バリアント方式）']}
            rows={[
              ['重みの単位', '4段階の固定倍率（2.0 / 1.6 / 0.8 / 0.1）', 'ダメージ式偏微分による連続値'],
              ['分類の根拠', 'キャラごとに手動でリストアップ', '基礎ステ・モチーフ武器・ダメージ内訳から自動算出'],
              ['理論最大値', '固定 IDEAL_MULT（≈1.84）× 基準Tier5', '重み上位N個 × 基準ロール比率の合計'],
              ['ランク判定', 'スコア絶対値の固定閾値', 'キャラ・バリアント別ドロップ分布パーセンタイル'],
              ['対応範囲', '全キャラ', 'variants定義済み・武器基礎データありのキャラのみ（無ければv1にフォールバック）'],
            ]}
          />
        </Section>

        <Section title="7. UI：上位%表示と分布図（ヒストグラム）">
          <p>
            スコアの絶対値とランクの体感がズレる問題（例：50点台でもAランクになりうる）に対応するため、
            スコア表示の隣に <InlineCode>topPercentile</InlineCode>（ドロップ分布上「上位X%」）をバッジ表示し、
            <FilePath>ScoreDistributionChart.tsx</FilePath> でスコアごとの出現率をヒストグラム（横軸：スコア、縦軸：出現率）
            として可視化する。ランク帯を背景色で示し、自分のスコアが属するビンをハイライト、
            グラフ上をホバーすると任意のビンの出現率・上位%をその場で確認できる。
          </p>
          <p>
            ヒストグラムのビンは <FilePath>scripts/computeRankThresholds.ts</FilePath> がシミュレーション時に
            スコア0〜100を幅2で区切って集計し、<InlineCode>histogram</InlineCode>（51要素の出現確率配列）として
            <FilePath>src/data/rankThresholds.ts</FilePath> に保存している。<InlineCode>topPercentile</InlineCode> は
            別途保存している <InlineCode>curve</InlineCode>（上位% ↔ スコアのサンプル列）から
            <InlineCode>getPercentileForScore()</InlineCode> で対数線形補間して求める。
          </p>
        </Section>

        {/* ── フッター ── */}
        <p style={{ textAlign: 'center' as const, color: '#9ca3af', fontSize: 12, marginTop: 32 }}>
          このページは検索エンジンに登録されていません。URLを知っている人のみアクセス可能です。
        </p>
      </div>
    </div>
  );
}
