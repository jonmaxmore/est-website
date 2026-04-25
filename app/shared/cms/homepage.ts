/**
 * ═══ Homepage Section Types ═══
 * กำหนดประเภท section ที่สามารถแสดงในหน้าแรก
 *
 * ลำดับการแสดงผล (admin ลาก/วางได้):
 * hero → แบนเนอร์หลัก (รองรับ background รูป/วิดีโอ)
 * weapons → แสดงอาวุธ
 * features → จุดเด่นของเกม
 * highlights → ไฮไลท์พิเศษ
 * news → ข่าวสารล่าสุด
 * cta → ปุ่ม call-to-action
 */
export const SUPPORTED_HOMEPAGE_SECTION_TYPES = ['hero', 'weapons', 'features', 'highlights', 'news', 'cta'] as const
// โหมดพื้นหลัง hero: รูปภาพนิ่ง (image) หรือ วิดีโอวนลูป (video)
export const HERO_BACKGROUND_MODES = ['image', 'video'] as const

export type HomepageSectionType = (typeof SUPPORTED_HOMEPAGE_SECTION_TYPES)[number]
export type HeroBackgroundMode = (typeof HERO_BACKGROUND_MODES)[number]

export function isSupportedHomepageSectionType(value: string): value is HomepageSectionType {
  return (SUPPORTED_HOMEPAGE_SECTION_TYPES as readonly string[]).includes(value)
}

export function isHeroBackgroundMode(value: string): value is HeroBackgroundMode {
  return (HERO_BACKGROUND_MODES as readonly string[]).includes(value)
}

export function normalizeHeroBackgroundMode(value: unknown): HeroBackgroundMode {
  return typeof value === 'string' && isHeroBackgroundMode(value) ? value : 'image'
}
