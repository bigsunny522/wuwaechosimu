'use client';

const BANNER_KEY = process.env.NEXT_PUBLIC_ADSTERRA_BANNER_THIN_KEY ?? '';
const BANNER_SCRIPT_SRC = process.env.NEXT_PUBLIC_ADSTERRA_BANNER_THIN_SCRIPT_SRC ?? '';
const BANNER_WIDTH = Number(process.env.NEXT_PUBLIC_ADSTERRA_BANNER_THIN_WIDTH ?? '468');
const BANNER_HEIGHT = Number(process.env.NEXT_PUBLIC_ADSTERRA_BANNER_THIN_HEIGHT ?? '60');

/**
 * AdBanner(300x250)とは別サイズで発行した細長いAdsterra Bannerユニット用。
 * Adsterraのバナーはユニットごとにサイズが固定されているため、既存のAdBannerの
 * width/heightだけを変えても正しい広告が出ない。専用のkey/scriptで発行してもらう前提。
 * 実装はAdBannerと同じ(document.writeでiframeを注入するためsrcDocで隔離)。
 */
export default function AdBannerThin() {
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
      />
    </div>
  );
}
