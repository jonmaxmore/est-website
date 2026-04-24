import { buildPagePath } from '../../app/shared/cms/pages'

const SITEMAP_CACHE_KEY = 'cache:sitemap-xml'
const SITEMAP_TTL_SECONDS = 600 // 10 minutes

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'content-type', 'application/xml')

  // Try cache first
  try {
    const redis = getRedis()
    const cached = await redis.get(SITEMAP_CACHE_KEY)
    if (cached) return cached
  } catch {
    // Redis unavailable, generate fresh
  }

  const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://eternaltowersaga.com'
  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily', lastmod: new Date().toISOString() },
    { loc: '/weapons', priority: '0.8', changefreq: 'weekly', lastmod: new Date().toISOString() },
    { loc: '/news', priority: '0.9', changefreq: 'daily', lastmod: new Date().toISOString() },
    { loc: '/event', priority: '0.8', changefreq: 'weekly', lastmod: new Date().toISOString() },
  ]

  const [articles, pages] = await Promise.all([
    prisma.newsArticle.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.pageContent.findMany({
      where: { status: 'PUBLISHED' },
      select: { key: true, slug: true, isSystemPage: true, updatedAt: true },
      orderBy: [{ isSystemPage: 'desc' }, { updatedAt: 'desc' }],
    }),
  ])

  const pageEntries = pages
    .map((page) => ({
      loc: buildPagePath(page),
      priority: page.isSystemPage ? '0.6' : '0.5',
      changefreq: page.isSystemPage ? 'monthly' : 'weekly',
      lastmod: page.updatedAt.toISOString(),
    }))
    .filter((page) => page.loc !== '/')

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

  for (const page of [...staticPages, ...pageEntries]) {
    xml += '  <url>\n'
    xml += `    <loc>${baseUrl}${page.loc}</loc>\n`
    xml += `    <lastmod>${page.lastmod}</lastmod>\n`
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`
    xml += `    <priority>${page.priority}</priority>\n`
    xml += '  </url>\n'
  }

  for (const article of articles) {
    xml += '  <url>\n'
    xml += `    <loc>${baseUrl}/news/${article.slug}</loc>\n`
    xml += `    <lastmod>${article.updatedAt.toISOString()}</lastmod>\n`
    xml += '    <changefreq>weekly</changefreq>\n'
    xml += '    <priority>0.7</priority>\n'
    xml += '  </url>\n'
  }

  xml += '</urlset>'

  // Cache for next time
  try {
    const redis = getRedis()
    await redis.set(SITEMAP_CACHE_KEY, xml, 'EX', SITEMAP_TTL_SECONDS)
  } catch {
    // Redis unavailable, skip caching
  }

  return xml
})
