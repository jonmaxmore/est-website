// ═══════════════════════════════════════
// useSeoMeta — Composable for consistent SEO tags
// ═══════════════════════════════════════
// Provides canonical URL, OG tags, Twitter cards, and
// meta description to all pages automatically.

const BASE_URL = 'http://178.128.127.161'
const SITE_NAME = 'Eternal Tower Saga'
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`

interface SeoOptions {
  title: string
  description: string
  path?: string
  image?: string | null
  type?: 'website' | 'article'
}

export function usePageSeo(options: SeoOptions) {
  const route = useRoute()
  const path = options.path || route.path
  const canonicalUrl = `${BASE_URL}${path}`
  const ogImage = options.image || DEFAULT_OG_IMAGE
  const fullTitle = options.title.includes(SITE_NAME)
    ? options.title
    : `${options.title} | ${SITE_NAME}`

  useHead({
    title: fullTitle,
    link: [
      { rel: 'canonical', href: canonicalUrl },
    ],
    meta: [
      { name: 'description', content: options.description },
      // Open Graph
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: options.description },
      { property: 'og:type', content: options.type || 'website' },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:image', content: ogImage },
      { property: 'og:site_name', content: SITE_NAME },
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: options.description },
      { name: 'twitter:image', content: ogImage },
    ],
  })
}
