import { normalizeDownloadPageConfig } from '../../utils/admin-config'

export default defineEventHandler(async () => {
  const config = await prisma.siteConfig.findUnique({ where: { key: 'download_page' } })
  return normalizeDownloadPageConfig(config?.value ?? null)
})
