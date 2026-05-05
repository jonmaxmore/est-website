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
export const newsCreateSchema = z
  .object({
    ...fields,
    contentType: fields.contentType.default('ANNOUNCEMENT'),
    pinned: fields.pinned.default(false),
    isEvergreen: fields.isEvergreen.default(false),
    status: fields.status.default('DRAFT'),
    featureOnHome: fields.featureOnHome.default(false),
    homePriority: fields.homePriority.default(0),
    openInNewTab: fields.openInNewTab.default(false),
  })
  .superRefine(requireBilingualContentWhenPublishing)

/** PUT /api/admin/news/[id] — all fields optional (partial update) */
export const newsUpdateSchema = z
  .object(fields)
  .partial()
  .superRefine(requireBilingualContentWhenPublishing)

export type NewsCreateInput = z.infer<typeof newsCreateSchema>
export type NewsUpdateInput = z.infer<typeof newsUpdateSchema>

/**
 * Translation-completeness gate: an article cannot be set to status=PUBLISHED
 * unless BOTH locales have title + content. Editors can save half-translated
 * drafts (status=DRAFT/ARCHIVED) freely — the guard only kicks in at publish.
 *
 * For partial updates (PUT) only the fields explicitly sent in the body are
 * checked. If the body omits e.g. contentTh, we trust the existing DB value
 * — the route handler is responsible for cross-checking persisted state if
 * stricter "publish never lacks bilingual" semantics are required.
 *
 * Audit-2 (M-4) finding: previously a PUBLISHED row could ship with contentEn
 * populated but contentTh null (or vice versa), producing a blank article for
 * users on the missing locale.
 */
function requireBilingualContentWhenPublishing(
  data: Record<string, unknown>,
  ctx: z.RefinementCtx,
) {
  if (data.status !== 'PUBLISHED') return

  const missing: string[] = []
  for (const field of ['titleEn', 'titleTh', 'contentEn', 'contentTh'] as const) {
    if (!(field in data)) continue
    const val = data[field]
    if (typeof val !== 'string' || !val.trim()) missing.push(field)
  }

  if (missing.length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Cannot publish: missing required bilingual fields — ${missing.join(', ')}`,
      path: missing,
    })
  }
}
