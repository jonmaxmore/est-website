import type { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload'

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: '/', changeFrequency: 'daily', priority: 1 },
  { url: '/event', changeFrequency: 'always', priority: 0.9 },
  { url: '/weapons', changeFrequency: 'monthly', priority: 0.8 },
  { url: '/news', changeFrequency: 'weekly', priority: 0.8 },
  { url: '/story', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/game-guide', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/download', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/gallery', changeFrequency: 'monthly', priority: 0.6 },
  { url: '/faq', changeFrequency: 'monthly', priority: 0.6 },
  { url: '/support', changeFrequency: 'monthly', priority: 0.5 },
  { url: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  { url: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
]

async function fetchNewsPages(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'news',
      where: { status: { equals: 'published' }, slug: { exists: true } },
      sort: '-publishedAt',
      limit: 200,
      depth: 0,
    })

    return result.docs
      .filter((doc) => typeof doc.slug === 'string' && doc.slug.trim().length > 0)
      .map((doc) => ({
        url: `${baseUrl}/news/${doc.slug}`,
        lastModified: doc.updatedAt ? new Date(doc.updatedAt as string) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const staticEntries = STATIC_PAGES.map((page) => ({
    ...page,
    url: `${baseUrl}${page.url}`,
    lastModified: new Date(),
  }))

  const newsEntries = await fetchNewsPages(baseUrl)

  return [...staticEntries, ...newsEntries]
}
