import { z } from 'zod'

import { BANNER_PLACEMENTS, BANNER_SCOPES, normalizeBannerConfig } from '../../app/shared/cms/marketing-banners'

const emptyToNull = (value: unknown) => (value === '' ? null : value)
const nullableStringSchema = z.preprocess(emptyToNull, z.string().trim().optional().nullable())
const nullableDateStringSchema = z.preprocess(emptyToNull, z.string().trim().optional().nullable())
const nullableIntSchema = z.preprocess(
  emptyToNull,
  z.coerce.number().int().positive().optional().nullable(),
)

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

  if (parsed.scope === 'specific_topic' && !String(parsed.config.topicKey || '').trim()) {
    throw new Error('specific_topic scope requires config.topicKey')
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
