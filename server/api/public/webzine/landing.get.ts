import { normalizeWebzineTopics } from '../../../../app/shared/cms/webzine'

const publishedWhere = () => ({
  status: 'PUBLISHED' as const,
  OR: [{ publishedAt: { lte: new Date() } }, { publishedAt: null }],
})

export default defineEventHandler(async () => {
  const [topicConfig, pinnedArticles, latestArticles, patchNotes, guides, lore, devBlogs] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { key: 'webzine_topics' } }),
    prisma.newsArticle.findMany({
      where: { ...publishedWhere(), pinned: true },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 1,
    }),
    prisma.newsArticle.findMany({
      where: publishedWhere(),
      orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 8,
    }),
    prisma.newsArticle.findMany({
      where: { ...publishedWhere(), contentType: 'PATCH_NOTES' },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 4,
    }),
    prisma.newsArticle.findMany({
      where: { ...publishedWhere(), contentType: 'GUIDE' },
      orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 4,
    }),
    prisma.newsArticle.findMany({
      where: { ...publishedWhere(), contentType: 'LORE' },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 4,
    }),
    prisma.newsArticle.findMany({
      where: { ...publishedWhere(), contentType: 'DEV_BLOG' },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 4,
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
