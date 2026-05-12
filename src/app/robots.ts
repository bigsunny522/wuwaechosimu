import type { MetadataRoute } from 'next';

const SITE_URL = 'https://wuwaechosimu.xyzack271.com'; // ★ 実際のURLに変更

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
