import { normalizeWebzineTopics } from '../../../../app/shared/cms/webzine'
import { reconcileScheduledArticles } from '../../../utils/news-scheduler'

const publishedWhere = () => ({
  status: 'PUBLISHED' as const,
  OR: [{ publishedAt: { lte: new Date() } }, { publishedAt: null }],
})

// Public select — only fields the public webzine landing actually renders.
// Audit-3 (BE-2 M2): keep internal status/audit columns server-side.
const PUBLIC_LANDING_SELECT = {
  id: true,
  slug: true,
  titleEn: true,
  titleTh: true,
  excerptEn: true,
  excerptTh: true,
  category: true,
  contentType: true,
  primaryTopicKey: true,
  featuredImage: true,
  ogImage: true,
  publishedAt: true,
  readingTimeMinutes: true,
  pinned: true,
} as const

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=300')

  // Auto-promote SCHEDULED articles whose publishedAt has passed (throttled — at
  // most once per 60s). Trade-off documented in news-scheduler.ts.
  await reconcileScheduledArticles()

  const [topicConfig, pinnedArticles, latestArticles, patchNotes, guides, lore, devBlogs] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { key: 'webzine_topics' } }),
    prisma.newsArticle.findMany({
      where: { ...publishedWhere(), pinned: true },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 1,
      select: PUBLIC_LANDING_SELECT,
    }),
    prisma.newsArticle.findMany({
      where: publishedWhere(),
      orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 8,
      select: PUBLIC_LANDING_SELECT,
    }),
    prisma.newsArticle.findMany({
      where: { ...publishedWhere(), contentType: 'PATCH_NOTES' },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 4,
      select: PUBLIC_LANDING_SELECT,
    }),
    prisma.newsArticle.findMany({
      where: { ...publishedWhere(), contentType: 'GUIDE' },
      orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 4,
      select: PUBLIC_LANDING_SELECT,
    }),
    prisma.newsArticle.findMany({
      where: { ...publishedWhere(), contentType: 'LORE' },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 4,
      select: PUBLIC_LANDING_SELECT,
    }),
    prisma.newsArticle.findMany({
      where: { ...publishedWhere(), contentType: 'DEV_BLOG' },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 4,
      select: PUBLIC_LANDING_SELECT,
    }),
  ])

  return {
    topics: normalizeWebzineTopics(Array.isArray(topicConfig?.value) ? topicConfig.value : []),
    featured: pinnedArticles[0] || latestArticles[0] || null,
    latest: latestArticles,
    sections: {
      patchNotes,
      guides,
      lore,
      devBlogs,
    },
  }
})
