import type { MetadataRoute } from 'next';

const SITE_URL = 'https://wuwaechosimu.xyzack271.com'; // ★ 実際のURLに変更

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: {
        languages: {
          ja: SITE_URL,
          en: `${SITE_URL}?lang=en`,
        },
      },
    },
    {
      url: `${SITE_URL}/guide`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          ja: `${SITE_URL}/guide`,
          en: `${SITE_URL}/guide?lang=en`,
        },
      },
    },
  ];
}
