'use client';

const BANNER_KEY = process.env.NEXT_PUBLIC_ADSTERRA_BANNER_KEY ?? '';
const BANNER_SCRIPT_SRC = process.env.NEXT_PUBLIC_ADSTERRA_BANNER_SCRIPT_SRC ?? '';
const BANNER_WIDTH = Number(process.env.NEXT_PUBLIC_ADSTERRA_BANNER_WIDTH ?? '300');
const BANNER_HEIGHT = Number(process.env.NEXT_PUBLIC_ADSTERRA_BANNER_HEIGHT ?? '250');

/**
 * Adsterra の Banner ユニットは document.write でiframeを注入する実装のため、
 * React側でハイドレーション後に直接scriptタグを差し込むと no-op になる。
 * そのため独立した srcDoc の iframe 内で読み込ませ、本体のDOMから隔離する。
 *
 * sandbox 属性が無い srcDoc の iframe は親ページと同一オリジン扱いになり、
 * 広告スクリプトが window.top を書き換えて画面全体を強制遷移させられてしまう。
 * allow-same-origin と allow-top-navigation を与えず、
 * 広告の実行(allow-scripts)とクリック時の新規タブ遷移(allow-popups)のみ許可する。
 */
export default function AdBanner() {
  if (!BANNER_KEY || !BANNER_SCRIPT_SRC) return null;

  const srcDoc = `<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;display:flex;align-items:center;justify-content:center;overflow:hidden;}</style></head><body>
<script>
  atOptions = {
    key: ${JSON.stringify(BANNER_KEY)},
    format: 'iframe',
    height: ${BANNER_HEIGHT},
    width: ${BANNER_WIDTH},
    params: {},
  };
</script>
<script src=${JSON.stringify(BANNER_SCRIPT_SRC)}></script>
</body></html>`;

  return (
    <div className="flex justify-center my-6">
      <iframe
        title="advertisement"
        srcDoc={srcDoc}
        width={BANNER_WIDTH}
        height={BANNER_HEIGHT}
        style={{ border: 'none', overflow: 'hidden', maxWidth: '100%' }}
        scrolling="no"
        loading="lazy"
        sandbox="allow-scripts allow-popups"
      />
    </div>
  );
}
