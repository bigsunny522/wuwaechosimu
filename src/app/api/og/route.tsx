import { ImageResponse } from 'next/og';
import { CATEGORY_COLORS, RANK_COLORS } from '@/lib/scorer';
import { MAINSTAT_LABEL_EN, SUBSTAT_LABEL_EN } from '@/data/translations';
import { HARMONY_SETS_EN } from '@/data/echoes';
import { decodeShareQuery, type DecodedShare } from '@/lib/shareLink';

// Google Fonts が format('truetype') を返す古い UA(Satori は ttf/otf/woff のみ対応)
const FONT_UA =
  'Mozilla/5.0 (Linux; U; Android 2.2; en-us; Nexus One Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1';

const BG = '#101318';
const LINE = '#2A2F3A';
const FG = '#ECEFF3';
const SUB = '#9AA3B2';
const SITE_NAME_JA = '音骸シミュレーター';
const SITE_NAME_EN = 'Echo Simulator';
const SITE_HOST = 'wuwaechotools.com';

interface OgRow {
  label: string;
  value: string;
  valueColor: string;
}

interface OgContent {
  rank: string;
  rankColor: string;
  scoreText: string;
  echoName: string;
  metaLine: string;
  charLabel: string;
  siteName: string;
  rows: OgRow[];
}

function buildOgContent(decoded: DecodedShare): OgContent {
  const { echo, score, build, locale } = decoded;
  const ja = locale !== 'en';

  const rows = echo.substats.map((sub) => {
    const label = ja ? sub.label : (SUBSTAT_LABEL_EN[sub.key] ?? sub.label);
    const value = `${sub.value}${sub.unit}`;
    const category = score.breakdown.find((b) => b.key === sub.key)?.category;
    return { label, value, valueColor: category ? CATEGORY_COLORS[category] : FG };
  });

  const mainLabel = ja
    ? echo.mainstat.label
    : (MAINSTAT_LABEL_EN[echo.mainstat.key] ?? echo.mainstat.label);
  const setName = ja
    ? echo.activeHarmonySet
    : (HARMONY_SETS_EN[echo.activeHarmonySet] ?? echo.activeHarmonySet);
  // 音骸が不明(echoId が空)で1行目がセット名のときは、セット名を2回出さない
  const metaLine = echo.echoId ? `${mainLabel} / ${setName}` : mainLabel;

  return {
    rank: score.rank,
    rankColor: RANK_COLORS[score.rank],
    scoreText: `${score.score} pt`,
    echoName: ja ? echo.echoName : (echo.echoNameEn ?? echo.echoName),
    metaLine,
    charLabel: build ? (ja ? `${build.name}用` : `for ${build.nameEn}`) : '',
    siteName: ja ? SITE_NAME_JA : SITE_NAME_EN,
    rows,
  };
}

function collectChars(content: OgContent): string {
  const strings = [
    content.rank,
    content.scoreText,
    content.echoName,
    content.metaLine,
    content.charLabel,
    content.siteName,
    SITE_HOST,
    ...content.rows.flatMap((row) => [row.label, row.value]),
  ];
  return Array.from(new Set(strings.join('').split(''))).join('');
}

async function fetchGoogleFont(family: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${family}:wght@700&text=${encodeURIComponent(text)}`;
    const cssRes = await fetch(cssUrl, { headers: { 'User-Agent': FONT_UA } });
    if (!cssRes.ok) return null;
    const css = await cssRes.text();
    const matched = /src:\s*url\(([^)]+)\)\s*format\(['"](?:truetype|opentype)['"]\)/.exec(css);
    const fontUrl = matched?.[1];
    if (!fontUrl) return null;
    const fontRes = await fetch(fontUrl);
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

function fallbackResponse(request: Request, langEn: boolean): Response {
  const location = new URL(langEn ? '/og-image-en.png' : '/og-image.png', request.url).toString();
  return new Response(null, { status: 302, headers: { Location: location } });
}

function OgImage({ content }: { content: OgContent }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: BG,
        paddingTop: 36,
        paddingBottom: 32,
        paddingLeft: 56,
        paddingRight: 56,
        fontFamily: 'Noto Sans JP',
        color: FG,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', minHeight: 40 }}>
        {content.charLabel ? (
          <div style={{ display: 'flex', fontSize: 30, color: SUB }}>{content.charLabel}</div>
        ) : null}
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, alignItems: 'center' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: 420,
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontFamily: 'Chakra Petch',
              fontSize: 160,
              fontWeight: 700,
              lineHeight: 1,
              color: content.rankColor,
            }}
          >
            {content.rank}
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Chakra Petch',
              fontSize: 56,
              fontWeight: 700,
              color: FG,
              marginTop: 16,
            }}
          >
            {content.scoreText}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            paddingLeft: 24,
            paddingRight: 24,
          }}
        >
          <div style={{ display: 'flex', fontSize: 46, fontWeight: 700, color: FG }}>
            {content.echoName}
          </div>
          <div style={{ display: 'flex', fontSize: 26, color: SUB, marginTop: 10 }}>
            {content.metaLine}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 18 }}>
            {content.rows.map((row, i) => (
              <div
                key={`${row.label}-${i}`}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  paddingTop: 6,
                  paddingBottom: 6,
                }}
              >
                <div style={{ display: 'flex', fontSize: 28, color: FG }}>{row.label}</div>
                <div
                  style={{
                    display: 'flex',
                    fontFamily: 'Chakra Petch',
                    fontSize: 28,
                    fontWeight: 700,
                    color: row.valueColor,
                  }}
                >
                  {row.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: `1px solid ${LINE}`,
          paddingTop: 18,
        }}
      >
        <div style={{ display: 'flex', fontSize: 24, color: SUB }}>{content.siteName}</div>
        <div style={{ display: 'flex', fontFamily: 'Chakra Petch', fontSize: 24, color: SUB }}>
          {SITE_HOST}
        </div>
      </div>
    </div>
  );
}

export async function GET(request: Request): Promise<Response> {
  const langEn = new URL(request.url).searchParams.get('lang') === 'en';
  try {
    const decoded = decodeShareQuery(new URL(request.url).searchParams);
    if (!decoded) return fallbackResponse(request, langEn);

    const content = buildOgContent(decoded);
    const text = collectChars(content);
    const [noto, chakra] = await Promise.all([
      fetchGoogleFont('Noto+Sans+JP', text),
      fetchGoogleFont('Chakra+Petch', text),
    ]);
    if (!noto || !chakra) return fallbackResponse(request, langEn);

    return new ImageResponse(<OgImage content={content} />, {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Noto Sans JP', data: noto, weight: 700, style: 'normal' },
        { name: 'Chakra Petch', data: chakra, weight: 700, style: 'normal' },
      ],
      headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400' },
    });
  } catch {
    return fallbackResponse(request, langEn);
  }
}
