export default defineEventHandler(async (event) => {
  const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || 'http://178.128.127.161'

  // Static pages
  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/weapons', priority: '0.8', changefreq: 'weekly' },
    { loc: '/news', priority: '0.9', changefreq: 'daily' },
    { loc: '/event', priority: '0.8', changefreq: 'weekly' },
    { loc: '/game-guide', priority: '0.7', changefreq: 'monthly' },
    { loc: '/faq', priority: '0.5', changefreq: 'monthly' },
    { loc: '/support', priority: '0.5', changefreq: 'monthly' },
    { loc: '/gallery', priority: '0.6', changefreq: 'weekly' },
    { loc: '/story', priority: '0.6', changefreq: 'monthly' },
    { loc: '/download', priority: '0.7', changefreq: 'monthly' },
    { loc: '/terms', priority: '0.3', changefreq: 'yearly' },
    { loc: '/privacy', priority: '0.3', changefreq: 'yearly' },
  ]

  // Dynamic news pages
  const articles = await prisma.newsArticle.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, updatedAt: true },
    orderBy: { publishedAt: 'desc' },
  })

  const now = new Date().toISOString()

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

  for (const page of staticPages) {
    xml += `  <url>\n`
    xml += `    <loc>${baseUrl}${page.loc}</loc>\n`
    xml += `    <lastmod>${now}</lastmod>\n`
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`
    xml += `    <priority>${page.priority}</priority>\n`
    xml += `  </url>\n`
  }

  for (const article of articles) {
    xml += `  <url>\n`
    xml += `    <loc>${baseUrl}/news/${article.slug}</loc>\n`
    xml += `    <lastmod>${article.updatedAt.toISOString()}</lastmod>\n`
    xml += `    <changefreq>weekly</changefreq>\n`
    xml += `    <priority>0.7</priority>\n`
    xml += `  </url>\n`
  }

  xml += '</urlset>'

  setResponseHeader(event, 'content-type', 'application/xml')
  return xml
})
