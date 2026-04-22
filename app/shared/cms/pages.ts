const RESERVED_CMS_SLUGS = new Set(['admin', 'api', 'news', 'event', 'weapons'])

export function isReservedCmsSlug(slug: string) {
  return RESERVED_CMS_SLUGS.has(slug)
}

export function buildPagePath(page: { slug: string; isSystemPage: boolean }) {
  return page.slug === '' ? '/' : `/${page.slug}`
}
