export default defineEventHandler((event) => {
  const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || ''
  const sitemapLine = baseUrl ? `\nSitemap: ${baseUrl}/sitemap.xml\n` : '\n'
  const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/admin/
${sitemapLine}`
  setResponseHeader(event, 'content-type', 'text/plain')
  return robots
})
