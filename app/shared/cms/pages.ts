export const SYSTEM_CMS_PAGES = [
  { key: 'faq', slug: 'faq', titleEn: 'FAQ', titleTh: 'คําถามที่พบบ่อย', icon: 'i-lucide-help-circle', description: 'Frequently asked questions' },
  { key: 'terms', slug: 'terms', titleEn: 'Terms of Service', titleTh: 'เงื่อนไขการใช้งาน', icon: 'i-lucide-file-text', description: 'Terms and conditions' },
  { key: 'privacy', slug: 'privacy', titleEn: 'Privacy Policy', titleTh: 'นโยบายความเป็นส่วนตัว', icon: 'i-lucide-shield', description: 'Privacy and data policy' },
  { key: 'support', slug: 'support', titleEn: 'Support', titleTh: 'ศูนย์ช่วยเหลือ', icon: 'i-lucide-headphones', description: 'Customer support page' },
  { key: 'story', slug: 'story', titleEn: 'Story', titleTh: 'เนื้อเรื่อง', icon: 'i-lucide-book-open', description: 'Game story and lore' },
  { key: 'game-guide', slug: 'game-guide', titleEn: 'Game Guide', titleTh: 'คู่มือเกม', icon: 'i-lucide-map', description: 'Game guide and tutorials' },
  { key: 'gallery', slug: 'gallery', titleEn: 'Gallery', titleTh: 'แกลเลอรี', icon: 'i-lucide-image', description: 'Screenshots and artwork' },
  { key: 'download', slug: 'download', titleEn: 'Download', titleTh: 'ดาวน์โหลด', icon: 'i-lucide-download', description: 'Download links' },
] as const

const RESERVED_CMS_SLUGS = new Set([
  'admin',
  'api',
  'event',
  'events',
  'news',
  'weapons',
  ...SYSTEM_CMS_PAGES.map((page) => page.slug),
])

export function normalizeCmsSlug(slug: string) {
  return slug
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function isReservedCmsSlug(slug: string) {
  return RESERVED_CMS_SLUGS.has(normalizeCmsSlug(slug))
}

export function buildPagePath(page: { key?: string; slug?: string | null; isSystemPage: boolean }) {
  const rawSlug = page.slug ?? page.key ?? ''
  const normalizedSlug = normalizeCmsSlug(rawSlug)
  return normalizedSlug === '' ? '/' : `/${normalizedSlug}`
}

export function normalizePageCreateInput(input: { titleEn: string; titleTh: string; slug: string }) {
  const slug = normalizeCmsSlug(input.slug)

  return {
    key: slug,
    slug,
    titleEn: input.titleEn.trim(),
    titleTh: input.titleTh.trim(),
    description: null,
    template: 'default',
    icon: null,
    seoTitle: null,
    seoTitleTh: null,
    seoDesc: null,
    seoDescTh: null,
    contentEn: '',
    contentTh: '',
    status: 'DRAFT' as const,
    showInHeader: false,
    showInFooter: false,
    headerOrder: 0,
    footerOrder: 0,
    isSystemPage: false,
  }
}
