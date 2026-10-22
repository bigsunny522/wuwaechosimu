import type { Metadata } from 'next';
import ShareClient, { type ShareView } from './ShareClient';
import { LocaleProvider } from '@/lib/locale';
import { resolveLocale, resolveExplicitLocale } from '@/lib/locale-utils';
import { buildMetadata, SITE_URL } from '@/lib/seo';
import { decodeShareQuery, encodeShareQuery, SHARE_PATH } from '@/lib/shareLink';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const DESCRIPTION_JA = '鳴潮の音骸シミュレーターで出た結果です。自分の音骸のスコアも計算できます。';
const DESCRIPTION_EN = 'A result from the Wuthering Waves Echo Simulator. Score your own echoes too.';

const FALLBACK_TITLE_JA = 'シェアされた結果 | 音骸シミュレーター';
const FALLBACK_TITLE_EN = 'Shared Result | Echo Simulator';

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const locale = resolveLocale(sp);
  const decoded = decodeShareQuery(sp);

  const jaTitle = decoded
    ? `【${decoded.score.rank}】スコア${decoded.score.score}点の${
        decoded.build ? `${decoded.build.name}用` : ''
      }${decoded.echo.echoName} | 音骸シミュレーター`
    : FALLBACK_TITLE_JA;
  const enTitle = decoded
    ? `[${decoded.score.rank}] ${decoded.score.score}pts ${
        decoded.echo.echoNameEn ?? decoded.echo.echoName
      }${decoded.build ? ` for ${decoded.build.nameEn}` : ''} | Echo Simulator`
    : FALLBACK_TITLE_EN;

  const metadata = buildMetadata({
    path: '/share',
    locale,
    ja: { title: jaTitle, description: DESCRIPTION_JA },
    en: { title: enTitle, description: DESCRIPTION_EN },
    robotsIndex: false,
  });

  if (!decoded) return metadata;

  const query = encodeShareQuery(decoded.echo, {
    charId: decoded.build?.id,
    locale: decoded.locale,
  });
  if (!query) return metadata;

  const ogImage = `${SITE_URL}/api/og?${query}`;
  const shareUrl = `${SITE_URL}${SHARE_PATH}?${query}`;

  return {
    ...metadata,
    alternates: { ...metadata.alternates, canonical: shareUrl },
    openGraph: {
      ...metadata.openGraph,
      url: shareUrl,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      ...metadata.twitter,
      images: [ogImage],
    },
  };
}

export default async function SharePage({ searchParams }: Props) {
  const sp = await searchParams;
  const decoded = decodeShareQuery(sp);
  const result: ShareView | null = decoded
    ? {
        echo: decoded.echo,
        score: decoded.score,
        charName: decoded.build?.name,
        charNameEn: decoded.build?.nameEn,
      }
    : null;

  return (
    <LocaleProvider initialLocale={resolveExplicitLocale(sp)}>
      <ShareClient result={result} />
    </LocaleProvider>
  );
}
