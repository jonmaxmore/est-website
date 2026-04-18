export default defineEventHandler(async () => {
  const [navigation, footer, seo] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { key: 'navigation' } }),
    prisma.siteConfig.findUnique({ where: { key: 'footer' } }),
    prisma.siteConfig.findUnique({ where: { key: 'seo' } }),
  ])

  return {
    navigation: navigation?.value ?? [],
    footer: footer?.value ?? {},
    seo: seo?.value ?? {},
  }
})
