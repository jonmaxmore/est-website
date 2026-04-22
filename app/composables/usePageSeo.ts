// ═══════════════════════════════════════
// useSeoMeta — Composable for consistent SEO tags
// ═══════════════════════════════════════
// Provides canonical URL, OG tags, Twitter cards, and
// meta description to all pages automatically.

interface SeoOptions {
  title: string
  description: string
  path?: string
  image?: string | null
  type?: 'website' | 'article'
}

export function usePageSeo(options: SeoOptions) {
  const route = useRoute()
  const config = useRuntimeConfig()
  const baseUrl = String(config.public.siteUrl || 'https://eternaltowersaga.com').replace(/\/$/, '')
  const siteName = String(config.public.siteName || 'Eternal Tower Saga')
  const path = options.path || route.path
  const canonicalUrl = `${baseUrl}${path}`
  const ogImage = options.image || `${baseUrl}/images/og-cover.png`
  const fullTitle = options.title.includes(siteName)
    ? options.title
    : `${options.title} | ${siteName}`

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
      { property: 'og:site_name', content: siteName },
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: options.description },
      { name: 'twitter:image', content: ogImage },
    ],
  })
}
