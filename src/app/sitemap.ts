import { MetadataRoute } from 'next';
import { getPayloadClient } from '@/lib/payload';

export const revalidate = 3600; // Cache sitemap for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.eternaltowersaga.com';

  // 1. Core Global Routes
  const staticRoutes = [
    '',
    '/news',
    '/game-guide',
    '/gallery',
    '/faq',
    '/download',
    '/story',
    '/support',
    '/event',
    '/weapons',
    '/privacy',
    '/terms'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Fetch Dynamic Published News
  let newsRoutes: MetadataRoute.Sitemap = [];
  try {
    const newsRes = await payload.find({
      collection: 'news',
      limit: 1000,
      select: {
        slug: true,
        updatedAt: true,
      },
      where: {
        status: { equals: 'published' }
      }
    });

    newsRoutes = newsRes.docs.map((doc: any) => ({
      url: `${baseUrl}/news/${doc.slug}`,
      lastModified: new Date(doc.updatedAt || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Error fetching News for sitemap:', error);
  }

  // 3. Fetch Dynamic Published Campaigns
  let campaignRoutes: MetadataRoute.Sitemap = [];
  try {
    const campaignRes = await payload.find({
      collection: 'campaigns',
      limit: 100,
      select: {
        slug: true,
        updatedAt: true,
      },
      where: {
        status: { equals: 'published' }
      }
    });

    campaignRoutes = campaignRes.docs.map((doc: any) => ({
      url: `${baseUrl}/campaign/${doc.slug}`,
      lastModified: new Date(doc.updatedAt || Date.now()),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error fetching Campaigns for sitemap:', error);
  }

  return [...staticRoutes, ...newsRoutes, ...campaignRoutes];
}
