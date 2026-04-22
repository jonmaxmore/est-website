import { readAdminConfigValue } from '../../utils/admin-config'

/** Get site config and normalize guarded keys when requested directly. */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const key = query.key as string | undefined

  if (key) {
    const config = await prisma.siteConfig.findUnique({ where: { key } })
    return readAdminConfigValue(key, config?.value ?? null)
  }

  return prisma.siteConfig.findMany()
})
