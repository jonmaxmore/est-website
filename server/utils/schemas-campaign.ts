/**
 * Zod schemas for the Campaign admin endpoints.
 * Audit-2 (C-5) — first-class campaign entity.
 */
import { z } from 'zod'

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, {
    message: 'slug must be lowercase alphanumeric with optional dashes',
  })

const fields = {
  name: z.string().trim().min(1).max(120),
  slug: slugSchema,
  description: z.string().trim().max(2000).optional().nullable(),
  ownerEmail: z.string().trim().email().max(255).optional().nullable(),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
  kpis: z.record(z.string(), z.unknown()).optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED']),
} as const

export const campaignCreateSchema = z
  .object({
    ...fields,
    status: fields.status.default('DRAFT'),
  })
  .superRefine(requireEndAfterStart)

export const campaignUpdateSchema = z.object(fields).partial().superRefine(requireEndAfterStart)

function requireEndAfterStart(
  data: { startsAt?: string | null; endsAt?: string | null },
  ctx: z.RefinementCtx,
) {
  if (data.startsAt && data.endsAt && new Date(data.endsAt) <= new Date(data.startsAt)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'endsAt must be after startsAt',
      path: ['endsAt'],
    })
  }
}
