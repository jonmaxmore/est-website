export const SUPPORTED_HOMEPAGE_SECTION_TYPES = ['hero', 'weapons', 'features', 'highlights', 'news', 'cta'] as const
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
