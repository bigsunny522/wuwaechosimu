'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useLocale, withLang } from '@/lib/locale';
import { SCORE_FORMULA, type Block } from '@/data/scoreFormula';
import AdBanner from '@/components/AdBanner';

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

function Code({ children }: { children: string }) {
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
              {C.title}
            </h1>
            <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.8, margin: '6px 0 0', maxWidth: 620 }}>
              {C.lead}
            </p>
          </div>
          <Link
            href={withLang('/', locale)}
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
            {C.back}
          </Link>
        </div>

        {C.sections.map((section, i) => (
          <div key={section.title}>
            <Section title={section.title}>
              {section.blocks.map(renderBlock)}
            </Section>
            {i === 3 && <AdBanner />}
          </div>
        ))}

        <AdBanner />

        {/* ── フッター ── */}
        <p style={{ textAlign: 'center' as const, color: '#9ca3af', fontSize: 12, marginTop: 32, lineHeight: 1.8 }}>
          {C.footerNote}{' '}
          <Link href={withLang('/chardb', locale)} style={{ color: ACCENT }}>{C.footerLink}</Link>
          {' '}{C.footerSuffix}
        </p>
      </div>
    </div>
  );
}
