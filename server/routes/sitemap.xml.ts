/**
 * ═══ Sitemap XML Generator ═══
 * GET /sitemap.xml
 *
 * สร้าง sitemap อัตโนมัติจากข้อมูลใน DB สำหรับ Google Search Console
 *
 * โครงสร้าง:
 * 1. หน้าคงที่ (homepage, weapons, news, event)
 * 2. หน้า CMS (สร้างจาก admin)
 * 3. บทความข่าว (PUBLISHED)
 *
 * Cache: เก็บใน Redis 10 นาที → ลดโหลด DB
 * ถ้า Redis ล่ม → สร้างใหม่ทุกครั้ง (ไม่พัง)
 */
import { buildPagePath } from '../../app/shared/cms/pages'

const SITEMAP_CACHE_KEY = 'cache:sitemap-xml'
const SITEMAP_TTL_SECONDS = 600 // 10 นาที

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'content-type', 'application/xml')

  // ── ลอง cache ก่อน ──
  try {
    const redis = getRedis()
    const cached = await redis.get(SITEMAP_CACHE_KEY)
    if (cached) return cached
  } catch {
    // Redis ใช้ไม่ได้ → สร้างใหม่
  }

  const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || ''
  if (!baseUrl) {
    setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>'
  }

  // ── หน้าคงที่ (static pages) ──
  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily', lastmod: new Date().toISOString() },
    { loc: '/weapons', priority: '0.8', changefreq: 'weekly', lastmod: new Date().toISOString() },
    { loc: '/news', priority: '0.9', changefreq: 'daily', lastmod: new Date().toISOString() },
    { loc: '/event', priority: '0.8', changefreq: 'weekly', lastmod: new Date().toISOString() },
  ]

  // ── ดึงข้อมูลจาก DB พร้อมกัน (บทความ + หน้า CMS) ──
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

  // ── แปลงหน้า CMS เป็น sitemap entries ──
  const pageEntries = pages
    .map((page) => ({
      loc: buildPagePath(page),
      priority: page.isSystemPage ? '0.6' : '0.5',
      changefreq: page.isSystemPage ? 'monthly' : 'weekly',
      lastmod: page.updatedAt.toISOString(),
    }))
    .filter((page) => page.loc !== '/') // ไม่ใส่ซ้ำกับ homepage

  // ── สร้าง XML ──
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

  // ── เก็บ cache สำหรับครั้งต่อไป ──
  try {
    const redis = getRedis()
    await redis.set(SITEMAP_CACHE_KEY, xml, 'EX', SITEMAP_TTL_SECONDS)
  } catch {
    // Redis ใช้ไม่ได้ → ข้าม cache
  }

  return xml
})
