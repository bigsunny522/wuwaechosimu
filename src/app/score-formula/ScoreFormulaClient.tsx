'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useLocale, withLang } from '@/lib/locale';
import { SCORE_FORMULA, type Block } from '@/data/scoreFormula';
import AdBanner from '@/components/AdBanner';
import NativeBanner from '@/components/NativeBanner';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="hd-card" style={{ padding: '20px 24px', marginBottom: 20 }}>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--hd-fg)', margin: '0 0 12px' }}>{title}</h2>
      <div style={{ color: 'var(--hd-fg)', fontSize: 14, lineHeight: 1.8 }}>{children}</div>
    </section>
  );
}

function SubHeading({ children }: { children: ReactNode }) {
  return (
    <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--hd-fg)', margin: '16px 0 6px' }}>{children}</h3>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre style={{
      background: 'var(--hd-raise)',
      color: 'var(--hd-fg)',
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
      background: 'var(--hd-raise)',
      color: 'var(--hd-fg)',
      padding: '1px 5px',
      borderRadius: 4,
      fontSize: 12.5,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    }}>
      {children}
    </code>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: 'auto' as const, margin: '8px 0' }}>
      <table style={{ borderCollapse: 'collapse' as const, width: '100%', fontSize: 13 }}>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} style={{
                textAlign: 'left' as const,
                padding: '6px 10px',
                background: 'var(--hd-raise)',
                borderBottom: '2px solid var(--hd-line)',
                color: 'var(--hd-sub)',
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
            <tr key={i} style={{ borderBottom: '1px solid var(--hd-line)' }}>
              {r.map((c, j) => (
                <td key={j} style={{ padding: '6px 10px', color: 'var(--hd-fg)' }}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 本文中の `バッククォート` 区間をインラインコードとして描画する */
function renderInline(text: string): ReactNode[] {
  return text.split('`').map((part, i) =>
    i % 2 === 1
      ? <InlineCode key={i}>{part}</InlineCode>
      : <span key={i}>{part}</span>
  );
}

function renderBlock(block: Block, i: number): ReactNode {
  switch (block.type) {
    case 'p':
      return <p key={i} style={{ margin: '0 0 10px' }}>{renderInline(block.text)}</p>;
    case 'h3':
      return <SubHeading key={i}>{block.text}</SubHeading>;
    case 'code':
      return <Code key={i}>{block.text}</Code>;
    case 'table':
      return <Table key={i} head={block.head} rows={block.rows} />;
  }
}

export default function ScoreFormulaClient() {
  const { locale } = useLocale();
  const C = SCORE_FORMULA[locale];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader maxWidthClass="max-w-[860px]" />
      <main className="flex-1 w-full mx-auto" style={{ maxWidth: 860, padding: '28px 16px 48px' }}>

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
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--hd-fg)', margin: 0 }}>
              {C.title}
            </h1>
            <p style={{ color: 'var(--hd-sub)', fontSize: 13, lineHeight: 1.8, margin: '6px 0 0', maxWidth: 620 }}>
              {C.lead}
            </p>
          </div>
        </div>

        {C.sections.map((section, i) => (
          <div key={section.title}>
            <Section title={section.title}>
              {section.blocks.map(renderBlock)}
            </Section>
            {i === 1 && <NativeBanner />}
          </div>
        ))}

        <AdBanner />

        {/* ── フッター ── */}
        <p style={{ textAlign: 'center' as const, color: 'var(--hd-sub)', fontSize: 12, marginTop: 32, lineHeight: 1.8 }}>
          {C.footerNote}{' '}
          <Link href={withLang('/chardb', locale)} style={{ color: 'var(--hd-accent-text)' }}>{C.footerLink}</Link>
          {' '}{C.footerSuffix}
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
