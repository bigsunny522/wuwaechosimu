'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useLocale, withLang } from '@/lib/locale';
import { HOME_EXPLAINER } from '@/data/homeExplainer';

/**
 * トップページ下部の読み物セクション。シミュレーター本体を触らずに
 * 「音骸厳選とは何か・このツールは何をするのか」を読めるようにする。
 */
export default function HomeExplainer() {
  const { locale } = useLocale();
  const C = HOME_EXPLAINER[locale];

  return (
    <section
      className="mt-4 pt-8 border-t"
      style={{ borderColor: 'var(--home-border)' }}
      aria-label={C.sectionLabel}
    >
      <p
        className="text-[10px] uppercase tracking-wider mb-6"
        style={{ color: 'var(--home-text-sub)', fontFamily: '"IBM Plex Mono", monospace' }}
      >
        {C.sectionLabel}
      </p>

      <div className="flex flex-col gap-10">
        {C.blocks.map((block) => (
          <article key={block.heading}>
            <h2
              className="text-lg mb-3"
              style={{ color: 'var(--home-text)', fontFamily: 'var(--font-display-serif)' }}
            >
              {block.heading}
            </h2>

            {block.paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-sm leading-7 mb-3"
                style={{ color: 'var(--home-text-sub)' }}
              >
                {p}
              </p>
            ))}

            {block.bullets && (
              <dl className="flex flex-col gap-3 mt-4">
                {block.bullets.map((b) => (
                  <div
                    key={b.term}
                    className="rounded-xl p-4"
                    style={{ background: 'var(--home-card)', border: '1px solid var(--home-border)' }}
                  >
                    <dt
                      className="text-sm font-semibold mb-1.5"
                      style={{ color: 'var(--home-card-text)' }}
                    >
                      {b.term}
                    </dt>
                    <dd className="text-sm leading-7" style={{ color: 'var(--home-text-sub)' }}>
                      {b.desc}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </article>
        ))}

        {/* ── FAQ ── */}
        <article>
          <h2
            className="text-lg mb-4"
            style={{ color: 'var(--home-text)', fontFamily: 'var(--font-display-serif)' }}
          >
            {C.faqHeading}
          </h2>
          <div className="flex flex-col gap-3">
            {C.faq.map((item) => (
              <details
                key={item.q}
                className="rounded-xl px-4 py-3 group"
                style={{ background: 'var(--home-card)', border: '1px solid var(--home-border)' }}
              >
                <summary
                  className="text-sm font-medium cursor-pointer list-none flex items-start gap-2"
                  style={{ color: 'var(--home-card-text)' }}
                >
                  <ChevronRight
                    size={15}
                    className="shrink-0 mt-0.5 transition-transform group-open:rotate-90"
                  />
                  {item.q}
                </summary>
                <p
                  className="text-sm leading-7 mt-2.5 pl-[23px]"
                  style={{ color: 'var(--home-text-sub)' }}
                >
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </article>

        {/* ── 関連ページ ── */}
        <article>
          <h2
            className="text-lg mb-4"
            style={{ color: 'var(--home-text)', fontFamily: 'var(--font-display-serif)' }}
          >
            {C.moreHeading}
          </h2>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {C.moreLinks.map((link) => (
              <Link
                key={link.href}
                href={withLang(link.href, locale)}
                className="rounded-xl p-4 transition-opacity hover:opacity-70"
                style={{ background: 'var(--home-card)', border: '1px solid var(--home-border)' }}
              >
                <span
                  className="flex items-center gap-1 text-sm font-semibold mb-1"
                  style={{ color: 'var(--home-card-text)' }}
                >
                  {link.label}
                  <ChevronRight size={14} />
                </span>
                <span className="block text-xs leading-6" style={{ color: 'var(--home-text-sub)' }}>
                  {link.desc}
                </span>
              </Link>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
