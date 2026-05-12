import type { MetadataRoute } from 'next';

const SITE_URL = 'https://wuwa-echo-sim.pages.dev'; // ★ 実際のURLに変更

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
  ];
}
