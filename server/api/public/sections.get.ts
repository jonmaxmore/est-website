import { normalizeHomepageSections } from '../../utils/admin-config'

/** Public endpoint that returns supported homepage sections only. */
export default defineEventHandler(async () => {
  const config = await prisma.siteConfig.findUnique({ where: { key: 'homepage_sections' } })

  return {
    sections: normalizeHomepageSections(config?.value ?? null),
  }
})
