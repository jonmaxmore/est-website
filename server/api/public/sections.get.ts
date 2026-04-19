/** Public endpoint — returns homepage section config for dynamic rendering */
export default defineEventHandler(async () => {
  const config = await prisma.siteConfig.findUnique({ where: { key: 'homepage_sections' } })

  // Default sections if none configured
  if (!config) {
    return {
      sections: [
        { id: 'hero', type: 'hero', visible: true, order: 0, background: '/images/hero-bg.webp', config: {} },
        { id: 'weapons', type: 'weapons', visible: true, order: 1, background: '', config: {} },
        { id: 'features', type: 'features', visible: true, order: 2, background: '', config: {} },
        { id: 'highlights', type: 'highlights', visible: true, order: 3, background: '', config: {} },
        { id: 'news', type: 'news', visible: true, order: 4, background: '', config: {} },
        { id: 'cta', type: 'cta', visible: true, order: 5, background: '', config: {} },
      ],
    }
  }

  return config.value
})
