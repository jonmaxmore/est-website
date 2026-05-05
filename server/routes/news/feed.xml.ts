/**
 * GET /news/feed.xml — RSS 2.0 feed of the most recent PUBLISHED articles.
 *
 * Audit-2 (C-4): no RSS feed existed; power readers / aggregators / Google
 * Discover couldn't subscribe. This is the minimum-viable feed.
 *
 * Topic-scoped feeds: /news/topic/[topicKey]/feed.xml piggybacks on the
 * same logic with a topic filter (sibling file).
 *
 * Cached in Redis for 10 minutes — same TTL as the sitemap. The DB query
 * cost is small but Redis lets the CDN treat the response as a static
 * asset.
 */
import { stripHtml } from '../../utils/sanitize'

const FEED_CACHE_KEY = 'cache:news-feed-xml'
const FEED_TTL_SECONDS = 600
const ITEM_LIMIT = 30

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'content-type', 'application/rss+xml; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=600, s-maxage=600')

  try {
    const redis = getRedis()
    const cached = await redis.get(FEED_CACHE_KEY)
    if (cached) return cached
  } catch {
    /* Redis unavailable — rebuild fresh */
  }

  const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || ''
  if (!baseUrl) {
    return '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel></channel></rss>'
  }

  const articles = await prisma.newsArticle.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [{ publishedAt: { lte: new Date() } }, { publishedAt: null }],
    },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: ITEM_LIMIT,
    select: {
      slug: true,
      titleEn: true,
      titleTh: true,
      excerptEn: true,
      excerptTh: true,
      publishedAt: true,
      updatedAt: true,
    },
  })

  const xml = renderRss({
    title: 'Eternal Tower Saga Chronicle',
    description: 'Announcements, patch notes, guides, lore, and developer updates.',
    link: `${baseUrl}/news`,
    feedUrl: `${baseUrl}/news/feed.xml`,
    items: articles.map((a) => ({
      title: a.titleEn || a.titleTh,
      link: `${baseUrl}/news/${a.slug}`,
      description: stripHtml(a.excerptEn || a.excerptTh || '').slice(0, 500),
      pubDate: (a.publishedAt || a.updatedAt).toUTCString(),
      guid: a.slug,
    })),
  })

  try {
    const redis = getRedis()
    await redis.set(FEED_CACHE_KEY, xml, 'EX', FEED_TTL_SECONDS)
  } catch {
    /* Redis unavailable — skip cache */
  }

  return xml
})

type RssItem = { title: string; link: string; description: string; pubDate: string; guid: string }
type RssChannel = { title: string; description: string; link: string; feedUrl: string; items: RssItem[] }

function escapeXml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function renderRss(c: RssChannel): string {
  const items = c.items
    .map(
      (item) =>
        `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="false">${escapeXml(item.guid)}</guid>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${item.pubDate}</pubDate>
    </item>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(c.title)}</title>
    <link>${escapeXml(c.link)}</link>
    <description>${escapeXml(c.description)}</description>
    <atom:link href="${escapeXml(c.feedUrl)}" rel="self" type="application/rss+xml" />
    <language>en-th</language>
${items}
  </channel>
</rss>`
}
