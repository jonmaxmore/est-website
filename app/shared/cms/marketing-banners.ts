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

/**
 * Allowed scopes per placement — admin UI ควรใช้ filter dropdown ตามนี้
 * เพื่อกัน combo ที่ไม่ make sense (เช่น sidebar + homepage = ไม่มี sidebar บนหน้า home)
 *
 * mount sites:
 *   homepage:        announcement_bar, popup, floating, homepage_inline, footer_strip
 *   news_index:      announcement_bar, popup, sidebar, footer_strip
 *   article_detail:  announcement_bar, popup, sidebar, article_inline, footer_strip
 *   topic_page:      announcement_bar, popup, sidebar, footer_strip
 *   event_page:      announcement_bar, popup, floating, footer_strip
 */
export const PLACEMENT_ALLOWED_SCOPES: Record<BannerPlacement, readonly BannerScope[]> = {
  popup: ['global', 'homepage', 'news_index', 'article_detail', 'topic_page', 'event_page'],
  floating: ['global', 'homepage', 'event_page'],
  announcement_bar: ['global', 'homepage', 'news_index', 'article_detail', 'topic_page', 'event_page'],
  homepage_inline: ['homepage'],
  sidebar: ['news_index', 'article_detail', 'topic_page', 'specific_topic'],
  article_inline: ['article_detail', 'specific_article'],
  footer_strip: ['global', 'homepage', 'news_index', 'article_detail', 'topic_page', 'event_page'],
} as const

export function isAllowedPlacementScope(placement: BannerPlacement, scope: BannerScope): boolean {
  return PLACEMENT_ALLOWED_SCOPES[placement]?.includes(scope) ?? false
}

/**
 * Banner preset templates — ใช้ใน admin UI แทน freeform 224 combinations
 * editor เลือก preset → form auto-fill placement+scope → ลด human error
 */
export const BANNER_PRESETS = [
  {
    key: 'sitewide-announcement',
    labelEn: 'Sitewide Announcement Bar',
    labelTh: 'แถบประกาศทั้งเว็บ',
    placement: 'announcement_bar' as const,
    scope: 'global' as const,
    description: 'Top sticky bar visible on every page. Best for launches/maintenance.',
  },
  {
    key: 'homepage-popup',
    labelEn: 'Homepage Welcome Popup',
    labelTh: 'Popup หน้าแรก',
    placement: 'popup' as const,
    scope: 'homepage' as const,
    description: '1 popup per 7 days. Best for first-time visitor offers.',
  },
  {
    key: 'homepage-inline',
    labelEn: 'Homepage Inline Promo',
    labelTh: 'แบนเนอร์กลางหน้าแรก',
    placement: 'homepage_inline' as const,
    scope: 'homepage' as const,
    description: 'Embedded card on homepage between sections.',
  },
  {
    key: 'event-floating',
    labelEn: 'Event Floating Card',
    labelTh: 'การ์ดลอยหน้า Event',
    placement: 'floating' as const,
    scope: 'event_page' as const,
    description: 'Bottom-right corner card on event pages. Auto-hides if popup is showing.',
  },
  {
    key: 'news-sidebar',
    labelEn: 'News Sidebar Promo',
    labelTh: 'Sidebar หน้าข่าว',
    placement: 'sidebar' as const,
    scope: 'news_index' as const,
    description: 'Right sidebar on news listing.',
  },
  {
    key: 'article-inline',
    labelEn: 'Article Inline CTA',
    labelTh: 'CTA แทรกในบทความ',
    placement: 'article_inline' as const,
    scope: 'article_detail' as const,
    description: 'Embedded after Nth paragraph in article body.',
  },
  {
    key: 'topic-sidebar',
    labelEn: 'Topic Page Sidebar',
    labelTh: 'Sidebar หน้า Topic',
    placement: 'sidebar' as const,
    scope: 'specific_topic' as const,
    description: 'Sidebar on a specific topic landing page.',
  },
  {
    key: 'global-footer-strip',
    labelEn: 'Global Footer Strip',
    labelTh: 'แถบล่างทั้งเว็บ',
    placement: 'footer_strip' as const,
    scope: 'global' as const,
    description: 'Strip near footer on all pages. Auto-hides if announcement bar is showing.',
  },
] as const

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
