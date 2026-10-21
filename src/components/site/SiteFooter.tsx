'use client';

import Link from 'next/link';
import { useLocale, withLang } from '@/lib/locale';

export default function SiteFooter() {
  const { locale } = useLocale();
  const ja = locale === 'ja';

  return (
    <footer className="border-t py-4 flex flex-col gap-2" style={{ borderColor: 'var(--hd-line)' }}>
      <p className="flex items-center justify-center gap-2 text-[12px]" style={{ color: 'var(--hd-sub)' }}>
        <Link href={withLang('/about', locale)}>
          {ja ? 'このサイトについて' : 'About'}
        </Link>
        <span>·</span>
        <Link href={withLang('/privacy', locale)}>
          {ja ? 'プライバシーポリシー' : 'Privacy Policy'}
        </Link>
        <span>·</span>
        <Link href={withLang('/contact', locale)}>
          {ja ? 'お問い合わせ' : 'Contact'}
        </Link>
      </p>
      <p className="text-center text-[12px]" style={{ color: 'var(--hd-sub)' }}>
        {ja ? '© 音骸シミュレーター（非公式ファンツール）' : '© Echo Simulator (unofficial fan tool)'}
      </p>
    </footer>
  );
}
