'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu, BarChart3, Dices, BookOpen, Calculator, Users, Bell, Info, FileText, Mail,
} from 'lucide-react';
import EchoIcon from '@/components/EchoIcon';
import { useLocale, withLang } from '@/lib/locale';
import { useSiteAppearance } from '@/contexts/SiteAppearanceContext';
import { LATEST_UPDATE_ID } from '@/data/updates';

interface Props {
  /** 左の名前。既定は「音骸シミュレーター」/ "Echo Simulator" */
  title?: string;
  /** true ならロゴと名前を '/' へのリンクにしない(ホーム用) */
  isHome?: boolean;
  /** 名前と EN ボタンの間に置くもの(ホームのタブ、ガチャのボーナス残り時間) */
  center?: ReactNode;
  /** メニューの先頭に足す項目(ガチャの履歴・ボーナス) */
  extraMenuItems?: ReactNode;
  /** 新着の点。渡さないときは SiteHeader が localStorage の lastSeenUpdate と LATEST_UPDATE_ID を比べて決める */
  hasNewUpdate?: boolean;
  /** 中身の最大幅。既定 'max-w-2xl'。ホームは 'max-w-[480px]' */
  maxWidthClass?: string;
}

const MENU_ITEM =
  'flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors hover:bg-[var(--hd-raise)]';

export default function SiteHeader({
  title,
  isHome = false,
  center,
  extraMenuItems,
  hasNewUpdate: hasNewUpdateProp,
  maxWidthClass = 'max-w-2xl',
}: Props) {
  const { locale, toggleLocale } = useLocale();
  const ja = locale === 'ja';
  const { mode, setMode, accentHex } = useSiteAppearance();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasNewUpdateState, setHasNewUpdateState] = useState(false);
  const hasNewUpdate = hasNewUpdateProp ?? hasNewUpdateState;

  useEffect(() => {
    if (hasNewUpdateProp !== undefined) return;
    try {
      if (localStorage.getItem('lastSeenUpdate') !== LATEST_UPDATE_ID) setHasNewUpdateState(true);
    } catch {
      // private browsing etc. — 新着の点は出さない
    }
  }, [hasNewUpdateProp]);

  const name = title ?? (ja ? '音骸シミュレーター' : 'Echo Simulator');
  const isCurrent = (path: string) => pathname === path;

  const iconColor = 'var(--hd-sub)';
  const itemStyle = (path: string) =>
    isCurrent(path)
      ? { color: 'var(--hd-accent-text)', fontWeight: 700 as const }
      : { color: 'var(--hd-fg)' };

  const navItem = (
    href: string,
    icon: ReactNode,
    label: string,
    dot?: boolean,
  ) => (
    <Link
      key={href}
      href={withLang(href, locale)}
      onClick={() => setMenuOpen(false)}
      className={MENU_ITEM}
      style={itemStyle(href)}
      aria-current={isCurrent(href) ? 'page' : undefined}
    >
      <span className="shrink-0" style={{ color: iconColor }}>{icon}</span>
      <span>{label}</span>
      {dot && (
        <span className="ml-auto w-2 h-2 rounded-full" style={{ background: 'var(--hd-accent)' }} />
      )}
    </Link>
  );

  return (
    <header
      className={isHome ? '' : 'sticky top-0 z-30'}
      style={{
        flex: 'none',
        background: 'var(--hd-bg)',
        borderBottom: isHome ? undefined : '1px solid var(--hd-line)',
      }}
    >
      <div className={`mx-auto w-full ${maxWidthClass} flex items-center gap-[6px] h-[46px] pl-[16px] pr-[12px]`}>
        <div className="flex items-center gap-[6px] mr-auto min-w-0">
          {isHome ? (
            <>
              <EchoIcon
                size={28}
                color={accentHex}
                bgColor={mode === 'dark' ? '#101318' : '#F3F5F8'}
              />
              <span className="text-[15px] font-bold whitespace-nowrap truncate min-w-0">{name}</span>
            </>
          ) : (
            <Link href={withLang('/', locale)} className="flex items-center gap-[6px] min-w-0">
              <EchoIcon
                size={28}
                color={accentHex}
                bgColor={mode === 'dark' ? '#101318' : '#F3F5F8'}
              />
              <span className="text-[15px] font-bold whitespace-nowrap truncate min-w-0">{name}</span>
            </Link>
          )}
        </div>
        {center}
        <button
          type="button"
          onClick={toggleLocale}
          className="grid place-items-center h-[34px] px-[8px] rounded-[8px] text-[12px] shrink-0"
          style={{ border: '1px solid var(--hd-line)', color: 'var(--hd-sub)' }}
        >
          {ja ? 'EN' : 'JA'}
        </button>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="relative grid place-items-center h-[34px] w-[34px] rounded-[8px]"
            style={{ border: '1px solid var(--hd-line)', color: 'var(--hd-sub)' }}
            aria-label={ja ? 'メニュー' : 'Menu'}
          >
            <Menu size={16} />
            {hasNewUpdate && (
              <span
                className="absolute -top-[4px] -right-[4px] w-[10px] h-[10px] rounded-full"
                style={{ background: 'var(--hd-accent)', border: '2px solid var(--hd-bg)' }}
              />
            )}
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div
                className="absolute right-0 top-full mt-2 z-50 w-52 rounded-xl overflow-hidden"
                style={{ background: 'var(--hd-plate)', border: '1px solid var(--hd-line)' }}
              >
                {extraMenuItems && (
                  <>
                    <div onClick={() => setMenuOpen(false)}>{extraMenuItems}</div>
                    <div style={{ borderTop: '1px solid var(--hd-line)' }} />
                  </>
                )}
                {navItem('/', <BarChart3 size={14} />, ja ? '厳選サポーター' : 'Selection Supporter')}
                {navItem('/gacha', <Dices size={14} />, ja ? 'ガチャ' : 'Gacha')}
                {navItem('/guide', <BookOpen size={14} />, ja ? '使い方ガイド' : 'How to Use')}
                {navItem('/score-formula', <Calculator size={14} />, ja ? 'スコア計算方法' : 'Scoring Method')}
                {navItem('/chardb', <Users size={14} />, ja ? 'キャラ別ビルド' : 'Build Data')}
                {navItem('/news', <Bell size={14} />, ja ? 'お知らせ' : "What's New", hasNewUpdate)}
                <div style={{ borderTop: '1px solid var(--hd-line)' }} />
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <span className="text-[12px] shrink-0" style={{ color: 'var(--hd-sub)' }}>
                    {ja ? '表示' : 'Theme'}
                  </span>
                  <div
                    role="radiogroup"
                    aria-label={ja ? '表示の切り替え' : 'Theme'}
                    className="flex gap-1 flex-1"
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={mode === 'dark'}
                      onClick={() => setMode('dark')}
                      className="flex-1 h-[28px] rounded-[6px] text-[12px]"
                      style={
                        mode === 'dark'
                          ? { background: 'var(--hd-fg)', color: 'var(--hd-bg)', fontWeight: 700 }
                          : { background: 'var(--hd-raise)', color: 'var(--hd-sub)' }
                      }
                    >
                      {ja ? 'ダーク' : 'Dark'}
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={mode === 'light'}
                      onClick={() => setMode('light')}
                      className="flex-1 h-[28px] rounded-[6px] text-[12px]"
                      style={
                        mode === 'light'
                          ? { background: 'var(--hd-fg)', color: 'var(--hd-bg)', fontWeight: 700 }
                          : { background: 'var(--hd-raise)', color: 'var(--hd-sub)' }
                      }
                    >
                      {ja ? 'ライト' : 'Light'}
                    </button>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--hd-line)' }} />
                {navItem('/about', <Info size={14} />, ja ? 'このサイトについて' : 'About')}
                {navItem('/privacy', <FileText size={14} />, ja ? 'プライバシーポリシー' : 'Privacy Policy')}
                {navItem('/contact', <Mail size={14} />, ja ? 'お問い合わせ' : 'Contact')}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
