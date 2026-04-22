import { normalizeEventPageConfig } from '../../utils/admin-config'

export default defineEventHandler(async () => {
  const config = await prisma.siteConfig.findUnique({ where: { key: 'event_page' } })
  return normalizeEventPageConfig(config?.value ?? null)
})
