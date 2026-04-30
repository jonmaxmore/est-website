/**
 * ═══ Page SEO Composable ═══
 * ตั้งค่า SEO แบบรวมศูนย์สำหรับทุกหน้า
 *
 * ครอบคลุม: canonical URL, Open Graph, Twitter Card, meta description
 *
 * วิธีใช้:
 * usePageSeo({ title: 'หน้าแรก', description: 'คำอธิบาย...' })
 */
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
  // ⚠️ ถ้า siteUrl ว่าง (โดเมนยังไม่จด) → ไม่ตั้ง canonical/og:url เพื่อกัน fake URLs
  const baseUrl = String(config.public.siteUrl || '').replace(/\/$/, '')
  const siteName = String(config.public.siteName || 'Eternal Tower Saga')
  const path = options.path || route.path
  const canonicalUrl = baseUrl ? `${baseUrl}${path}` : ''
  const ogImage = options.image || (baseUrl ? `${baseUrl}/images/og-cover.png` : '/images/og-cover.png')
  const fullTitle = options.title.includes(siteName)
    ? options.title
    : `${options.title} | ${siteName}`

  const meta: Array<Record<string, string>> = [
    { name: 'description', content: options.description },
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: options.description },
    { property: 'og:type', content: options.type || 'website' },
    { property: 'og:image', content: ogImage },
    { property: 'og:site_name', content: siteName },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: fullTitle },
    { name: 'twitter:description', content: options.description },
    { name: 'twitter:image', content: ogImage },
  ]
  if (canonicalUrl) {
    meta.push({ property: 'og:url', content: canonicalUrl })
  }

  useHead({
    title: fullTitle,
    link: canonicalUrl ? [{ rel: 'canonical', href: canonicalUrl }] : [],
    meta,
  })
}
