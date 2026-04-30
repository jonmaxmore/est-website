/**
 * ═══ Game Event Zod Schemas ═══
 *
 * Single source of truth for the GameEvent write schema.
 * POST = required title/type + start/end + create defaults.
 * PUT  = same fields all optional + "must touch at least one field".
 *
 * Sharing the field shapes here keeps the two routes from drifting
 * (same DRY pattern used for news in schemas-news.ts).
 */
import { z } from 'zod'

const fields = {
  titleEn: z.string().trim().min(1),
  titleTh: z.string().trim().min(1),
  descriptionEn: z.string().nullable(),
  descriptionTh: z.string().nullable(),
  type: z.enum(['EVENT', 'HOT_TIME', 'MAINTENANCE', 'CAMPAIGN']),
  status: z.enum(['DRAFT', 'SCHEDULED', 'ACTIVE', 'ENDED', 'CANCELLED']),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  timezone: z.string(),
  multiplier: z.number().nullable(),
  bonusType: z.string().nullable(),
  bannerImage: z.string().nullable(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  visible: z.boolean(),
  campaignCode: z.string().nullable(),
  linkedArticleId: z.union([z.number().int().positive(), z.null()]),
} as const

/** POST /api/admin/events — required fields + creation defaults */
export const eventCreateSchema = z.object({
  ...fields,
  // optionals on create (server fills defaults / treats as null)
  descriptionEn: fields.descriptionEn.optional(),
  descriptionTh: fields.descriptionTh.optional(),
  multiplier: fields.multiplier.optional(),
  bonusType: fields.bonusType.optional(),
  bannerImage: fields.bannerImage.optional(),
  icon: fields.icon.optional(),
  color: fields.color.optional(),
  campaignCode: fields.campaignCode.optional(),
  linkedArticleId: fields.linkedArticleId.optional(),
  // create defaults
  status: fields.status.default('SCHEDULED'),
  timezone: fields.timezone.default('Asia/Bangkok'),
  visible: fields.visible.default(true),
})

/** PUT /api/admin/events/[id] — all fields optional + must update at least one */
export const eventUpdateSchema = z
  .object(fields)
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: 'No fields to update' })

export type EventCreateInput = z.infer<typeof eventCreateSchema>
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>
