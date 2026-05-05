import { normalizeDownloadPageConfig } from '../../utils/admin-config'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=600')
  const config = await prisma.siteConfig.findUnique({ where: { key: 'download_page' } })
  return normalizeDownloadPageConfig(config?.value ?? null)
})
