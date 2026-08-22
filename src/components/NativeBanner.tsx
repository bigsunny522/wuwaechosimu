'use client';

import { useEffect, useRef } from 'react';

const NATIVE_KEY = process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_KEY ?? '';
const NATIVE_SCRIPT_SRC = process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_SCRIPT_SRC ?? '';

/**
 * Adsterra の Native Banner はページのCSSを継承してコンテンツに馴染ませる広告のため、
 * AdBanner(iframeで隔離するBanner広告)と違い、実DOMに直接scriptタグを差し込む。
 * container の id は Adsterra 側が `container-<key>` を前提にしているため固定形式で生成する。
 * 同一ページに複数置くと container id が衝突するため、1ページ1枠を前提にしている。
 *
 * variant="card" は chardb のキャラクターカードグリッドに馴染ませる用の枠線付きスタイル。
 * キー未設定時は何も描画しない（呼び出し側で空の枠が残らないよう、ラッパーごと null を返す）。
 */
export default function NativeBanner({ variant = 'default' }: { variant?: 'default' | 'card' }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!NATIVE_KEY || !NATIVE_SCRIPT_SRC || !containerRef.current) return;
    containerRef.current.innerHTML = '';
    const script = document.createElement('script');
    script.async = true;
    script.dataset.cfasync = 'false';
    script.src = NATIVE_SCRIPT_SRC;
    containerRef.current.appendChild(script);
  }, []);

  if (!NATIVE_KEY || !NATIVE_SCRIPT_SRC) return null;

  if (variant === 'card') {
    return (
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        background: '#ffffff',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
      }}>
        <div ref={containerRef} id={`container-${NATIVE_KEY}`} />
      </div>
    );
  }

  return <div className="my-6" ref={containerRef} id={`container-${NATIVE_KEY}`} />;
}
