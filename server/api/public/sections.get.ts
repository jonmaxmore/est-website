import { normalizeHomepageSections } from '../../utils/admin-config'

/** Public endpoint that returns supported homepage sections only. */
export default defineEventHandler(async (event) => {
  const config = await prisma.siteConfig.findUnique({ where: { key: 'homepage_sections' } })

  setResponseHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=600')

  return {
    sections: normalizeHomepageSections(config?.value ?? null),
  }
})
