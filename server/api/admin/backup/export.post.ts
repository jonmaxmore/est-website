/** Export site data as JSON backup with proper blob headers */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result: Record<string, unknown> = {
    _meta: {
      exportedAt: new Date().toISOString(),
      version: '1.0',
    },
  }

  if (body.news) {
    result.news = await prisma.newsArticle.findMany()
  }
  if (body.weapons) {
    result.weapons = await prisma.weapon.findMany()
  }
  if (body.registrations) {
    result.registrations = await prisma.preRegistration.findMany()
  }
  if (body.config) {
    result.config = await prisma.siteConfig.findMany()
  }
  if (body.users) {
    result.users = await prisma.adminUser.findMany({
      select: { id: true, email: true, displayName: true, role: true, createdAt: true },
    })
  }
  if (body.features) {
    result.features = await prisma.feature.findMany()
  }
  if (body.highlights) {
    result.highlights = await prisma.highlight.findMany()
  }
  if (body.pages) {
    // Pages are stored in SiteConfig with page_ prefix
    const pageConfigs = await prisma.siteConfig.findMany({
      where: { key: { startsWith: 'page_' } },
    })
    result.pages = pageConfigs
  }
  if (body.media) {
    result.media = await prisma.mediaAsset.findMany()
  }

  await logActivity(event, 'EXPORT', 'backup', `Exported: ${Object.keys(result).filter(k => k !== '_meta').join(', ')}`)

  // Set proper headers for file download
  setResponseHeaders(event, {
    'Content-Type': 'application/json',
    'Content-Disposition': `attachment; filename="ets-backup-${new Date().toISOString().slice(0, 10)}.json"`,
  })

  return result
})
