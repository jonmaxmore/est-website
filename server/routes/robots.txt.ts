export default defineEventHandler((event) => {
  const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || 'http://178.128.127.161'
  const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/admin/

Sitemap: ${baseUrl}/sitemap.xml
`
  setResponseHeader(event, 'content-type', 'text/plain')
  return robots
})
