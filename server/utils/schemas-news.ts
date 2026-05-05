/**
 * ═══ News Article Zod Schemas ═══
 *
 * Single source of truth for the NewsArticle write schema.
 * POST = required fields + create defaults.
 * PUT  = same fields, all optional (partial update).
 *
 * Why the split: CREATE needs titleEn/titleTh/slug/category to exist;
 * UPDATE only sees what the admin form sent. Sharing the field shapes
 * here keeps the two routes from drifting (one of the audit findings).
 */
import { z } from 'zod'

import { WEBZINE_CONTENT_TYPES } from '../../app/shared/cms/webzine'
import { nullableStringSchemaNoTrim as nullableStringSchema } from './zod-schemas'

// ── Reusable field shapes (shared between create + update) ──────────────
const fields = {
  titleEn: z.string().min(1),
  titleTh: z.string().min(1),
  slug: z.string().min(1),
  excerptEn: nullableStringSchema,
  excerptTh: nullableStringSchema,
  contentEn: nullableStringSchema,
  contentTh: nullableStringSchema,
  category: z.enum(['ANNOUNCEMENT', 'UPDATE', 'MEDIA', 'MAINTENANCE']),
  contentType: z.enum(WEBZINE_CONTENT_TYPES),
  primaryTopicKey: nullableStringSchema,
  campaignCode: nullableStringSchema,
  pinned: z.boolean(),
  isEvergreen: z.boolean(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  featuredImage: nullableStringSchema,
  publishedAt: nullableStringSchema,
  featureOnHome: z.boolean(),
  homePriority: z.number(),
  externalUrl: nullableStringSchema,
  openInNewTab: z.boolean(),
  seoTitle: nullableStringSchema,
  seoDesc: nullableStringSchema,
  ogImage: nullableStringSchema,
} as const

/** POST /api/admin/news — required fields + creation defaults */
export const newsCreateSchema = z.object({
  ...fields,
  contentType: fields.contentType.default('ANNOUNCEMENT'),
  pinned: fields.pinned.default(false),
  isEvergreen: fields.isEvergreen.default(false),
  status: fields.status.default('DRAFT'),
  featureOnHome: fields.featureOnHome.default(false),
  homePriority: fields.homePriority.default(0),
  openInNewTab: fields.openInNewTab.default(false),
})

/** PUT /api/admin/news/[id] — all fields optional (partial update) */
export const newsUpdateSchema = z.object(fields).partial()

export type NewsCreateInput = z.infer<typeof newsCreateSchema>
export type NewsUpdateInput = z.infer<typeof newsUpdateSchema>
