/**
 * ═══ Navigation Types & Normalizer ═══
 * โครงสร้างเมนูที่จัดการได้ผ่าน admin CMS
 *
 * ประเภท link:
 * - 'page' → ลิงก์ไปหน้าภายในเว็บ (resolve จาก pageKey)
 * - 'custom' → ลิงก์ไป URL ภายนอก (หรือ URL แบบกำหนดเอง)
 */
export type NavigationItem = {
  id: string
  type: 'page' | 'custom'      // page = หน้าภายใน, custom = URL กำหนดเอง
  labelEn: string
  labelTh: string
  pageKey?: string             // ใช้เมื่อ type='page' — อ้างอิงจาก CMS pages
  href?: string                // ใช้เมื่อ type='custom'
  target?: '_self' | '_blank'
  visible: boolean
}

function toNavigationItem(item: unknown, index: number): NavigationItem {
  const candidate = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}

  return {
    id: String(candidate.id || `legacy-main-${index}`),
    type: candidate.type === 'page' ? 'page' : 'custom',
    labelEn: String(candidate.labelEn || candidate.label || ''),
    labelTh: String(candidate.labelTh || candidate.label || ''),
    pageKey: typeof candidate.pageKey === 'string' ? candidate.pageKey : undefined,
    href: typeof candidate.href === 'string' ? candidate.href : '/',
    target: candidate.target === '_blank' ? '_blank' : '_self',
    visible: candidate.visible !== false,
  }
}

/**
 * แปลงข้อมูล navigation จาก DB ให้อยู่ในรูปแบบที่ต้องการ
 * รองรับทั้งรูปแบบ array เก่า (เมนูเดียว) และ { main, footer } ใหม่
 */
export function normalizeNavigationConfig(value: unknown): { main: NavigationItem[]; footer: NavigationItem[] } {
  if (Array.isArray(value)) {
    return {
      main: value.map((item, index) => toNavigationItem(item, index)),
      footer: [],
    }
  }

  const navigation = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const main = Array.isArray(navigation.main) ? navigation.main.map((item, index) => toNavigationItem(item, index)) : []
  const footer = Array.isArray(navigation.footer)
    ? navigation.footer.map((item, index) => toNavigationItem(item, index))
    : []

  return { main, footer }
}

/**
 * แปลง navigation item เป็น URL ที่ใช้ได้
 * - type='page' + มี page data → ใช้ slug ของ page
 * - type='page' + ไม่มี page → null (ซ่อน link)
 * - type='custom' → ใช้ href ตรงๆ
 */
export function resolveNavigationHref(
  item: NavigationItem,
  page?: { key: string; slug: string | null; isSystemPage: boolean },
) {
  if (item.type === 'page' && page) {
    const slug = page.slug ?? ''
    return slug === '' ? '/' : `/${slug}`
  }

  if (item.type === 'page') {
    return null
  }

  return item.href || '/'
}
