export const BANNER_PLACEMENTS = [
  'popup',
  'floating',
  'announcement_bar',
  'homepage_inline',
  'sidebar',
  'article_inline',
  'footer_strip',
] as const

export const BANNER_SCOPES = [
  'global',
  'homepage',
  'news_index',
  'article_detail',
  'topic_page',
  'event_page',
  'specific_article',
  'specific_topic',
] as const

export type BannerPlacement = (typeof BANNER_PLACEMENTS)[number]
export type BannerScope = (typeof BANNER_SCOPES)[number]

type BannerConfigValue = Record<string, unknown> | null | undefined

export function normalizeBannerConfig(placement: BannerPlacement, value: BannerConfigValue) {
  switch (placement) {
    case 'popup': {
      const config = value && typeof value === 'object' ? value : {}
      const delaySeconds = typeof config.delaySeconds === 'number' ? Math.max(3, Math.floor(config.delaySeconds)) : 3

      return {
        delaySeconds,
        frequency: config.frequency === 'always' ? 'always' : 'session',
        mobileEnabled: typeof config.mobileEnabled === 'boolean' ? config.mobileEnabled : true,
      }
    }
    case 'article_inline': {
      const config = value && typeof value === 'object' ? value : {}
      const insertAfterParagraph = typeof config.insertAfterParagraph === 'number'
        ? Math.max(2, Math.floor(config.insertAfterParagraph))
        : 2

      return { insertAfterParagraph }
    }
    case 'floating': {
      const config = value && typeof value === 'object' ? value : {}
      return {
        corner: config.corner === 'bottom_left' ? 'bottom_left' : 'bottom_right',
        compact: Boolean(config.compact),
      }
    }
    case 'announcement_bar': {
      const config = value && typeof value === 'object' ? value : {}
      return {
        tone: config.tone === 'warning' ? 'warning' : 'default',
        sticky: typeof config.sticky === 'boolean' ? config.sticky : true,
      }
    }
    default:
      return value
  }
}
