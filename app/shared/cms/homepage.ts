export const SUPPORTED_HOMEPAGE_SECTION_TYPES = ['hero', 'weapons', 'features', 'highlights', 'news', 'cta'] as const

export type HomepageSectionType = (typeof SUPPORTED_HOMEPAGE_SECTION_TYPES)[number]

export function isSupportedHomepageSectionType(value: string): value is HomepageSectionType {
  return (SUPPORTED_HOMEPAGE_SECTION_TYPES as readonly string[]).includes(value)
}
