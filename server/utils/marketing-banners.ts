/**
 * ═══ Marketing Banner Payload Validator ═══
 * ตรวจสอบข้อมูล banner ที่ส่งมาจาก admin CMS
 *
 * กฎ:
 * - target type แต่ละประเภทต้องมี field คู่กัน (เช่น article ต้องมี articleId)
 * - วันสิ้นสุดต้องหลังวันเริ่มต้น
 * - config จะถูก normalize ตามประเภท placement
 */
import { z } from 'zod'

import {
  BANNER_PLACEMENTS,
  BANNER_SCOPES,
  PLACEMENT_ALLOWED_SCOPES,
  isAllowedPlacementScope,
  normalizeBannerConfig,
} from '../../app/shared/cms/marketing-banners'
import {
  nullableDateStringSchema,
  nullableIntSchema,
  nullableStringSchema,
} from './zod-schemas'

const bannerPayloadSchema = z.object({
  placement: z.enum(BANNER_PLACEMENTS),
  status: z.enum(['DRAFT', 'SCHEDULED', 'LIVE', 'EXPIRED']).default('DRAFT'),
  scope: z.enum(BANNER_SCOPES),
  priority: z.coerce.number().int().default(0),
  campaignCode: nullableStringSchema,
  startsAt: nullableDateStringSchema,
  endsAt: nullableDateStringSchema,
  badgeEn: nullableStringSchema,
  badgeTh: nullableStringSchema,
  titleEn: z.string().trim().min(1),
  titleTh: z.string().trim().min(1),
  bodyEn: nullableStringSchema,
  bodyTh: nullableStringSchema,
  desktopImage: nullableStringSchema,
  mobileImage: nullableStringSchema,
  targetType: z.enum(['article', 'page', 'event', 'url']),
  targetArticleId: nullableIntSchema,
  targetPageKey: nullableStringSchema,
  targetEventId: nullableStringSchema,
  targetTopicKey: nullableStringSchema,
  targetUrl: nullableStringSchema,
  targetNewTab: z.boolean().optional().default(false),
  dismissible: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
  config: z.record(z.string(), z.unknown()).optional().default({}),
})

export type MarketingBannerPayload = ReturnType<typeof parseMarketingBannerPayload>

function parseDate(value: string | null | undefined, field: string) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${field} must be a valid date`)
  }

  return date
}

/** validate + normalize ข้อมูล banner ที่ส่งมาจาก admin form */
export function parseMarketingBannerPayload(input: unknown) {
  const parsed = bannerPayloadSchema.parse(input)
  const startsAt = parseDate(parsed.startsAt, 'startsAt')
  const endsAt = parseDate(parsed.endsAt, 'endsAt')

  if (parsed.targetType === 'article' && !parsed.targetArticleId) {
    throw new Error('Article banners require targetArticleId')
  }

  if (parsed.targetType === 'page' && !parsed.targetPageKey) {
    throw new Error('Page banners require targetPageKey')
  }

  if (parsed.targetType === 'event' && !parsed.targetEventId) {
    throw new Error('Event banners require targetEventId')
  }

  if (parsed.targetType === 'url' && !parsed.targetUrl) {
    throw new Error('URL banners require targetUrl')
  }

  if (parsed.scope === 'specific_article' && !parsed.targetArticleId) {
    throw new Error('specific_article scope requires targetArticleId')
  }

  if (parsed.scope === 'specific_topic' && !parsed.targetTopicKey) {
    throw new Error('specific_topic scope requires targetTopicKey')
  }

  // ── Reject nonsensical placement+scope combos ──
  // (เช่น sidebar+homepage ไม่มีจุด render, article_inline+homepage ไม่มี article body)
  if (!isAllowedPlacementScope(parsed.placement, parsed.scope)) {
    const allowed = PLACEMENT_ALLOWED_SCOPES[parsed.placement]
    throw new Error(
      `placement="${parsed.placement}" cannot use scope="${parsed.scope}". Allowed scopes: ${allowed.join(', ')}`,
    )
  }

  if (startsAt && endsAt && endsAt <= startsAt) {
    throw new Error('Banner end time must be after start time')
  }

  return {
    ...parsed,
    startsAt,
    endsAt,
    config: normalizeBannerConfig(parsed.placement, parsed.config),
  }
}
